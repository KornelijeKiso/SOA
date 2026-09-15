package service

import (
	"errors"
	"time"

	"blogs/internal/domain"
	"blogs/internal/repository"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FollowService struct {
	followRepository *repository.FollowRepository
}

func NewFollowService(followRepository *repository.FollowRepository) *FollowService {
	return &FollowService{
		followRepository: followRepository,
	}
}

func (s *FollowService) FollowUser(followerID string, followingID string) (*domain.Follow, error) {
	if followerID == "" {
		return nil, errors.New("followerId is required")
	}

	if followingID == "" {
		return nil, errors.New("followingId is required")
	}

	if followerID == followingID {
		return nil, errors.New("user cannot follow himself")
	}

	exists, err := s.followRepository.Exists(followerID, followingID)
	if err != nil {
		return nil, err
	}

	if exists {
		return nil, errors.New("user already follows this profile")
	}

	follow := &domain.Follow{
		ID:          primitive.NewObjectID(),
		FollowerID:  followerID,
		FollowingID: followingID,
		CreatedDate: time.Now(),
	}

	err = s.followRepository.Create(follow)
	if err != nil {
		return nil, err
	}

	return follow, nil
}

func (s *FollowService) UnfollowUser(followerID string, followingID string) error {
	if followerID == "" {
		return errors.New("followerId is required")
	}

	if followingID == "" {
		return errors.New("followingId is required")
	}

	return s.followRepository.Delete(followerID, followingID)
}

func (s *FollowService) IsFollowing(followerID string, followingID string) (bool, error) {
	return s.followRepository.Exists(followerID, followingID)
}

func (s *FollowService) GetFollowing(userID string) ([]domain.Follow, error) {
	if userID == "" {
		return nil, errors.New("userId is required")
	}

	return s.followRepository.FindFollowing(userID)
}

func (s *FollowService) GetFollowers(userID string) ([]domain.Follow, error) {
	if userID == "" {
		return nil, errors.New("userId is required")
	}

	return s.followRepository.FindFollowers(userID)
}
