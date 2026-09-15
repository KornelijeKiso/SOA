package domain

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Comment struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	BlogID      primitive.ObjectID `bson:"blogId" json:"blogId"`
	BlogOwnerID string             `bson:"blogOwnerId" json:"blogOwnerId"`
	AuthorID    string             `bson:"authorId" json:"authorId"`
	Text        string             `bson:"text" json:"text"`
	CreatedDate time.Time          `bson:"createdDate" json:"createdDate"`
}
