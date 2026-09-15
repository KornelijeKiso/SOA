package main

import (
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"blogs/internal/domain"
	"blogs/internal/handler"
	"blogs/internal/service"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

const verifiedEmail = "tourist@example.com"
const ownerEmail = "guide@example.com"

var testBlogID = primitive.NewObjectID()

type blogStore struct {
	saved       *domain.Blog
	queriedUser string
}

func (s *blogStore) Create(b *domain.Blog) error     { s.saved = b; return nil }
func (s *blogStore) FindAll() ([]domain.Blog, error) { return []domain.Blog{}, nil }
func (s *blogStore) FindByID(id primitive.ObjectID) (*domain.Blog, error) {
	return &domain.Blog{ID: id, UserID: ownerEmail}, nil
}
func (s *blogStore) FindByUserID(id string) ([]domain.Blog, error) {
	s.queriedUser = id
	return []domain.Blog{}, nil
}

type followStore struct {
	saved                          *domain.Follow
	deletedFollower, deletedTarget string
	checkedFollower, checkedTarget string
	queriedUser                    string
	exists                         bool
}

func (s *followStore) Create(f *domain.Follow) error { s.saved = f; return nil }
func (s *followStore) Delete(follower, target string) error {
	s.deletedFollower, s.deletedTarget = follower, target
	return nil
}
func (s *followStore) Exists(follower, target string) (bool, error) {
	s.checkedFollower, s.checkedTarget = follower, target
	return s.exists, nil
}
func (s *followStore) FindFollowing(id string) ([]domain.Follow, error) {
	s.queriedUser = id
	return []domain.Follow{}, nil
}
func (s *followStore) FindFollowers(id string) ([]domain.Follow, error) {
	s.queriedUser = id
	return []domain.Follow{}, nil
}

type commentStore struct{ saved *domain.Comment }

func (s *commentStore) Create(c *domain.Comment) error { s.saved = c; return nil }
func (s *commentStore) FindByBlogID(primitive.ObjectID) ([]domain.Comment, error) {
	return []domain.Comment{}, nil
}

func testRouter() (*gin.Engine, *blogStore, *followStore, *commentStore) {
	gin.SetMode(gin.TestMode)
	blogs, follows, comments := &blogStore{}, &followStore{}, &commentStore{}
	router := newRouter(
		handler.NewBlogHandler(service.NewBlogService(blogs)),
		handler.NewFollowHandler(service.NewFollowService(follows)),
		handler.NewCommentHandler(service.NewCommentService(comments, blogs, follows)),
	)
	return router, blogs, follows, comments
}

func request(router *gin.Engine, method, path, body, email, role string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	if email != "" {
		req.Header.Set("X-User-Email", email)
	}
	if role != "" {
		req.Header.Set("X-User-Role", role)
	}
	result := httptest.NewRecorder()
	router.ServeHTTP(result, req)
	return result
}

func TestIdentityRequiredOnEveryAPIRoute(t *testing.T) {
	router, _, _, _ := testRouter()
	identities := []struct {
		name, email, role string
		status            int
	}{
		{"missing both", "", "", 401},
		{"missing email", "", "GUIDE", 401},
		{"blank email", "  ", "GUIDE", 401},
		{"missing role", verifiedEmail, "", 401},
		{"blank role", verifiedEmail, "  ", 401},
		{"unsupported role", verifiedEmail, "ADMIN", 403},
		{"lowercase role", verifiedEmail, "guide", 403},
	}
	for _, route := range router.Routes() {
		if !strings.HasPrefix(route.Path, "/api/") {
			continue
		}
		path := strings.ReplaceAll(route.Path, ":userId", verifiedEmail)
		path = strings.ReplaceAll(path, ":blogId", testBlogID.Hex())
		for _, identity := range identities {
			t.Run(route.Method+" "+route.Path+"/"+identity.name, func(t *testing.T) {
				result := request(router, route.Method, path, "{}", identity.email, identity.role)
				if result.Code != identity.status {
					t.Fatalf("status %d: %s", result.Code, result.Body.String())
				}
				var payload map[string]string
				if err := json.Unmarshal(result.Body.Bytes(), &payload); err != nil || payload["error"] == "" {
					t.Fatalf("expected JSON error: %s", result.Body.String())
				}
			})
		}
	}
}

func TestHealthPublic(t *testing.T) {
	router, _, _, _ := testRouter()
	result := request(router, "GET", "/health", "", "", "")
	if result.Code != 200 {
		t.Fatalf("status %d", result.Code)
	}
}

func TestAuthenticatedBlogReads(t *testing.T) {
	for _, role := range []string{"GUIDE", "TOURIST"} {
		router, blogs, _, _ := testRouter()
		for _, path := range []string{"/api/blogs", "/api/blogs/" + testBlogID.Hex(), "/api/users/" + ownerEmail + "/blogs", "/api/blogs/" + testBlogID.Hex() + "/comments"} {
			result := request(router, "GET", path, "", verifiedEmail, role)
			if result.Code != 200 {
				t.Fatalf("%s %s: %d", role, path, result.Code)
			}
		}
		if blogs.queriedUser != ownerEmail {
			t.Fatal("other user's blogs should remain readable")
		}
	}
}

func TestFollowListPathIdentity(t *testing.T) {
	for _, list := range []string{"following", "followers"} {
		for _, email := range []string{verifiedEmail, ownerEmail} {
			t.Run(list+"/"+email, func(t *testing.T) {
				router, _, follows, _ := testRouter()
				result := request(router, "GET", "/api/users/"+email+"/"+list, "", verifiedEmail, "TOURIST")
				if email != verifiedEmail {
					if result.Code != 403 || follows.queriedUser != "" {
						t.Fatal("mismatched user reached repository")
					}
				} else if result.Code != 200 || follows.queriedUser != verifiedEmail {
					t.Fatal("own list was not retrieved")
				}
			})
		}
	}
}

func TestWriteIdentityOverridesBody(t *testing.T) {
	for _, bodyID := range []string{"attacker@example.com", ""} {
		t.Run(bodyID, func(t *testing.T) {
			router, blogs, follows, _ := testRouter()
			result := request(router, "POST", "/api/blogs", `{"userId":"`+bodyID+`","title":"Title","description":"Description","images":["image.png"]}`, " "+verifiedEmail+" ", "GUIDE")
			if result.Code != 201 || blogs.saved == nil || blogs.saved.UserID != verifiedEmail {
				t.Fatalf("blog identity: %d %s", result.Code, result.Body.String())
			}
			var blog domain.Blog
			if err := json.Unmarshal(result.Body.Bytes(), &blog); err != nil || blog.UserID != verifiedEmail {
				t.Fatal("response identity mismatch")
			}
			body := `{"followerId":"` + bodyID + `","followingId":"` + ownerEmail + `"}`
			result = request(router, "POST", "/api/follow", body, verifiedEmail, "TOURIST")
			if result.Code != 201 || follows.saved == nil || follows.saved.FollowerID != verifiedEmail || follows.saved.FollowingID != ownerEmail {
				t.Fatalf("follow identity: %d %s", result.Code, result.Body.String())
			}
			result = request(router, "DELETE", "/api/follow", body, verifiedEmail, "TOURIST")
			if result.Code != 200 || follows.deletedFollower != verifiedEmail || follows.deletedTarget != ownerEmail {
				t.Fatal("unfollow identity mismatch")
			}
		})
	}
}

func TestFollowRulesPreserved(t *testing.T) {
	for _, target := range []string{verifiedEmail, ownerEmail} {
		router, _, follows, _ := testRouter()
		follows.exists = true
		result := request(router, "POST", "/api/follow", `{"followerId":"spoof","followingId":"`+target+`"}`, verifiedEmail, "GUIDE")
		if result.Code != 400 || follows.saved != nil {
			t.Fatal("self or duplicate follow accepted")
		}
	}
}

func TestVerifiedCommenterReachesFollowerCheck(t *testing.T) {
	for _, allowed := range []bool{false, true} {
		router, _, follows, comments := testRouter()
		follows.exists = allowed
		result := request(router, "POST", "/api/blogs/"+testBlogID.Hex()+"/comments", `{"authorId":"spoof@example.com","text":"Hello"}`, verifiedEmail, "TOURIST")
		if follows.checkedFollower != verifiedEmail || follows.checkedTarget != ownerEmail {
			t.Fatalf("follower check used %q -> %q", follows.checkedFollower, follows.checkedTarget)
		}
		if !allowed {
			if result.Code != 400 || comments.saved != nil || !strings.Contains(result.Body.String(), "only followers can comment") {
				t.Fatalf("non-follower accepted: %d %s", result.Code, result.Body.String())
			}
		} else if result.Code != 201 || comments.saved == nil || comments.saved.AuthorID != verifiedEmail || comments.saved.BlogOwnerID != ownerEmail {
			t.Fatalf("verified follower not saved: %d %s", result.Code, result.Body.String())
		}
	}
}
