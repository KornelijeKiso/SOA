package main

import (
	"log"

	"blogs/internal/config"
	"blogs/internal/database"
	"blogs/internal/handler"
	"blogs/internal/repository"
	"blogs/internal/service"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.LoadConfig()

	mongoClient, err := database.ConnectMongo(cfg.MongoURI)
	if err != nil {
		log.Fatal("MongoDB connection failed: ", err)
	}

	db := mongoClient.Database(cfg.MongoDatabase)

	blogRepository := repository.NewBlogRepository(db)
	commentRepository := repository.NewCommentRepository(db)
	followRepository := repository.NewFollowRepository(db)

	blogService := service.NewBlogService(blogRepository)
	followService := service.NewFollowService(followRepository)
	commentService := service.NewCommentService(
		commentRepository,
		blogRepository,
		followRepository,
	)

	blogHandler := handler.NewBlogHandler(blogService)
	followHandler := handler.NewFollowHandler(followService)
	commentHandler := handler.NewCommentHandler(commentService)

	router := gin.Default()

	/*router.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:5173",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Origin",
			"Content-Type",
			"Authorization",
		},
	}))*/

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Blog Followers service is running",
		})
	})

	api := router.Group("/api")

	api.POST("/blogs", blogHandler.CreateBlog)
	api.GET("/blogs", blogHandler.GetAllBlogs)
	api.GET("/blogs/:blogId", blogHandler.GetBlogByID)
	api.GET("/users/:userId/blogs", blogHandler.GetBlogsByUserID)

	api.POST("/follow", followHandler.FollowUser)
	api.DELETE("/follow", followHandler.UnfollowUser)
	api.GET("/users/:userId/following", followHandler.GetFollowing)
	api.GET("/users/:userId/followers", followHandler.GetFollowers)

	api.POST("/blogs/:blogId/comments", commentHandler.CreateComment)
	api.GET("/blogs/:blogId/comments", commentHandler.GetCommentsByBlogID)

	err = router.Run(":" + cfg.Port)
	if err != nil {
		log.Fatal("Server failed: ", err)
	}
}
