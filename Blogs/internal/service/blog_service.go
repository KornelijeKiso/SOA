package service

import (
	"errors"
	"time"

	"blogs/internal/domain"
	"blogs/internal/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type BlogService struct {
	blogRepository *repository.BlogRepository
}

func NewBlogService(blogRepository *repository.BlogRepository) *BlogService {
	return &BlogService{
		blogRepository: blogRepository,
	}
}

func (s *BlogService) CreateBlog(userID string, title string, description string, images []string) (*domain.Blog, error) {
	if userID == "" {
		return nil, errors.New("userId is required")
	}

	if title == "" {
		return nil, errors.New("title is required")
	}

	if description == "" {
		return nil, errors.New("description is required")
	}

	blog := &domain.Blog{
		ID:          primitive.NewObjectID(),
		UserID:      userID,
		Title:       title,
		Description: description,
		CreatedDate: time.Now(),
		Images:      images,
	}

	err := s.blogRepository.Create(blog)
	if err != nil {
		return nil, err
	}

	return blog, nil
}

func (s *BlogService) GetAllBlogs() ([]domain.Blog, error) {
	return s.blogRepository.FindAll()
}

func (s *BlogService) GetBlogByID(blogID string) (*domain.Blog, error) {
	id, err := primitive.ObjectIDFromHex(blogID)
	if err != nil {
		return nil, errors.New("invalid blog id")
	}

	return s.blogRepository.FindByID(id)
}

func (s *BlogService) GetBlogsByUserID(userID string) ([]domain.Blog, error) {
	if userID == "" {
		return nil, errors.New("userId is required")
	}

	return s.blogRepository.FindByUserID(userID)
}
