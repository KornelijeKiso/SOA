package handler

import (
	"net/http"

	"blogs/internal/service"

	"github.com/gin-gonic/gin"
)

type CommentHandler struct {
	commentService *service.CommentService
}

func NewCommentHandler(commentService *service.CommentService) *CommentHandler {
	return &CommentHandler{
		commentService: commentService,
	}
}

type CreateCommentRequest struct {
	AuthorID string `json:"authorId"`
	Text     string `json:"text"`
}

func (h *CommentHandler) CreateComment(c *gin.Context) {
	blogID := c.Param("blogId")

	var request CreateCommentRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	request.AuthorID = c.GetString(identityEmailKey)
	comment, err := h.commentService.CreateComment(blogID, request.AuthorID, request.Text)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

func (h *CommentHandler) GetCommentsByBlogID(c *gin.Context) {
	blogID := c.Param("blogId")

	comments, err := h.commentService.GetCommentsByBlogID(blogID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, comments)
}
