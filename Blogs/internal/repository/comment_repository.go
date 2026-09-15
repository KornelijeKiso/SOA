package repository

import (
	"context"
	"time"

	"blogs/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CommentRepository struct {
	collection *mongo.Collection
}

func NewCommentRepository(db *mongo.Database) *CommentRepository {
	return &CommentRepository{
		collection: db.Collection("comments"),
	}
}

func (r *CommentRepository) Create(comment *domain.Comment) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := r.collection.InsertOne(ctx, comment)
	if err != nil {
		return err
	}

	comment.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}

func (r *CommentRepository) FindByBlogID(blogID primitive.ObjectID) ([]domain.Comment, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{"blogId": blogID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var comments []domain.Comment
	err = cursor.All(ctx, &comments)
	return comments, err
}
