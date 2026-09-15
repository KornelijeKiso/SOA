package service

import (
	"errors"
	"time"

	"blogs/internal/domain"
	"blogs/internal/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CommentService struct {
	commentRepository *repository.CommentRepository
	blogRepository    *repository.BlogRepository
	followRepository  *repository.FollowRepository
}

func NewCommentService(
	commentRepository *repository.CommentRepository,
	blogRepository *repository.BlogRepository,
	followRepository *repository.FollowRepository,
) *CommentService {
	return &CommentService{
		commentRepository: commentRepository,
		blogRepository:    blogRepository,
		followRepository:  followRepository,
	}
}

func (s *CommentService) CreateComment(blogID string, authorID string, text string) (*domain.Comment, error) {
	if blogID == "" {
		return nil, errors.New("blogId is required")
	}

	if authorID == "" {
		return nil, errors.New("authorId is required")
	}

	if text == "" {
		return nil, errors.New("text is required")
	}

	blogObjectID, err := primitive.ObjectIDFromHex(blogID)
	if err != nil {
		return nil, errors.New("invalid blog id")
	}

	blog, err := s.blogRepository.FindByID(blogObjectID)
	if err != nil {
		return nil, errors.New("blog not found")
	}

	isFollowing, err := s.followRepository.Exists(authorID, blog.UserID)
	if err != nil {
		return nil, err
	}

	if !isFollowing {
		return nil, errors.New("only followers can comment on this blog")
	}

	comment := &domain.Comment{
		ID:          primitive.NewObjectID(),
		BlogID:      blogObjectID,
		BlogOwnerID: blog.UserID,
		AuthorID:    authorID,
		Text:        text,
		CreatedDate: time.Now(),
	}

	err = s.commentRepository.Create(comment)
	if err != nil {
		return nil, err
	}

	return comment, nil
}

func (s *CommentService) GetCommentsByBlogID(blogID string) ([]domain.Comment, error) {
	if blogID == "" {
		return nil, errors.New("blogId is required")
	}

	blogObjectID, err := primitive.ObjectIDFromHex(blogID)
	if err != nil {
		return nil, errors.New("invalid blog id")
	}

	return s.commentRepository.FindByBlogID(blogObjectID)
}
