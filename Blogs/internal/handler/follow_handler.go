package handler

import (
	"net/http"

	"blogs/internal/service"

	"github.com/gin-gonic/gin"
)

type FollowHandler struct {
	followService *service.FollowService
}

func NewFollowHandler(followService *service.FollowService) *FollowHandler {
	return &FollowHandler{
		followService: followService,
	}
}

type FollowRequest struct {
	FollowerID  string `json:"followerId"`
	FollowingID string `json:"followingId"`
}

func (h *FollowHandler) FollowUser(c *gin.Context) {
	var request FollowRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	follow, err := h.followService.FollowUser(request.FollowerID, request.FollowingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, follow)
}

func (h *FollowHandler) UnfollowUser(c *gin.Context) {
	var request FollowRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	err := h.followService.UnfollowUser(request.FollowerID, request.FollowingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "unfollowed successfully"})
}

func (h *FollowHandler) GetFollowing(c *gin.Context) {
	userID := c.Param("userId")

	following, err := h.followService.GetFollowing(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, following)
}

func (h *FollowHandler) GetFollowers(c *gin.Context) {
	userID := c.Param("userId")

	followers, err := h.followService.GetFollowers(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, followers)
}
