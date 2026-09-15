package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Follow struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	FollowerID  string             `bson:"followerId" json:"followerId"`
	FollowingID string             `bson:"followingId" json:"followingId"`
	CreatedDate time.Time          `bson:"createdDate" json:"createdDate"`
}
