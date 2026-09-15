package service

import (
	"blogs/internal/domain"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Repository interfaces keep the business rules testable without a live database.
type BlogRepository interface {
	Create(*domain.Blog) error
	FindAll() ([]domain.Blog, error)
	FindByID(primitive.ObjectID) (*domain.Blog, error)
	FindByUserID(string) ([]domain.Blog, error)
}

type FollowRepository interface {
	Create(*domain.Follow) error
	Delete(string, string) error
	Exists(string, string) (bool, error)
	FindFollowing(string) ([]domain.Follow, error)
	FindFollowers(string) ([]domain.Follow, error)
}

type CommentRepository interface {
	Create(*domain.Comment) error
	FindByBlogID(primitive.ObjectID) ([]domain.Comment, error)
}
