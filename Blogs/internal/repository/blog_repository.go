package repository

import (
	"context"
	"time"

	"blogs/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type BlogRepository struct {
	collection *mongo.Collection
}

func NewBlogRepository(db *mongo.Database) *BlogRepository {
	return &BlogRepository{
		collection: db.Collection("blogs"),
	}
}

func (r *BlogRepository) Create(blog *domain.Blog) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := r.collection.InsertOne(ctx, blog)
	if err != nil {
		return err
	}

	blog.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

func (r *BlogRepository) FindAll() ([]domain.Blog, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var blogs []domain.Blog
	err = cursor.All(ctx, &blogs)
	return blogs, err
}

func (r *BlogRepository) FindByID(id primitive.ObjectID) (*domain.Blog, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var blog domain.Blog
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&blog)
	if err != nil {
		return nil, err
	}

	return &blog, nil
}

func (r *BlogRepository) FindByUserID(userID string) ([]domain.Blog, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var blogs []domain.Blog
	err = cursor.All(ctx, &blogs)
	return blogs, err
}
