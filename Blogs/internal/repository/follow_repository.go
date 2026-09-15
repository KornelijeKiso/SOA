package repository

import (
	"context"
	"time"

	"blogs/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type FollowRepository struct {
	collection *mongo.Collection
}

func NewFollowRepository(db *mongo.Database) *FollowRepository {
	return &FollowRepository{
		collection: db.Collection("follows"),
	}
}

func (r *FollowRepository) Create(follow *domain.Follow) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, follow)
	return err
}

func (r *FollowRepository) Delete(followerID string, followingID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := r.collection.DeleteOne(ctx, bson.M{
		"followerId":  followerID,
		"followingId": followingID,
	})

	return err
}

func (r *FollowRepository) Exists(followerID string, followingID string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	count, err := r.collection.CountDocuments(ctx, bson.M{
		"followerId":  followerID,
		"followingId": followingID,
	})

	return count > 0, err
}

func (r *FollowRepository) FindFollowing(userID string) ([]domain.Follow, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{"followerId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var follows []domain.Follow
	err = cursor.All(ctx, &follows)
	return follows, err
}

func (r *FollowRepository) FindFollowers(userID string) ([]domain.Follow, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{"followingId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var follows []domain.Follow
	err = cursor.All(ctx, &follows)
	return follows, err
}
