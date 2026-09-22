package handler

import (
	"net/http"

	"blogs/internal/service"

	"github.com/gin-gonic/gin"
)

type BlogHandler struct {
	blogService *service.BlogService
}

func NewBlogHandler(blogService *service.BlogService) *BlogHandler {
	return &BlogHandler{
		blogService: blogService,
	}
}

type CreateBlogRequest struct {
	UserID      string   `json:"userId"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Images      []string `json:"images"`
}

func (h *BlogHandler) CreateBlog(c *gin.Context) {
	var request CreateBlogRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	request.UserID = c.GetString(identityEmailKey)
	blog, err := h.blogService.CreateBlog(
		request.UserID,
		request.Title,
		request.Description,
		request.Images,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	eventLogger.Info("blog_created", "blog_id", blog.ID.Hex())
	c.JSON(http.StatusCreated, blog)
}

func (h *BlogHandler) GetAllBlogs(c *gin.Context) {
	blogs, err := h.blogService.GetAllBlogs()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, blogs)
}

func (h *BlogHandler) GetBlogByID(c *gin.Context) {
	blogID := c.Param("blogId")

	blog, err := h.blogService.GetBlogByID(blogID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, blog)
}

func (h *BlogHandler) GetBlogsByUserID(c *gin.Context) {
	userID := c.Param("userId")

	blogs, err := h.blogService.GetBlogsByUserID(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, blogs)
}
