import { useEffect, useState } from "react";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../api/blogApi";
import { getUserId } from "../auth/authStorage";

function FollowPage() {
  const userId = getUserId();

  const [targetUserId, setTargetUserId] = useState("");
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
  try {
    const followingResponse = await getFollowing(userId);
    const followersResponse = await getFollowers(userId);

    setFollowing(followingResponse.data || []);
    setFollowers(followersResponse.data || []);
  } catch (err) {
    console.error(err);
    setFollowing([]);
    setFollowers([]);
  }
}

  async function handleFollow(e) {
    e.preventDefault();
    setMessage("");

    try {
      await followUser({
        followerId: userId,
        followingId: targetUserId,
      });

      setTargetUserId("");
      setMessage("User followed successfully.");
      loadData();
    } catch (err) {
      console.error(err);
      setMessage("Follow failed.");
    }
  }

  async function handleUnfollow(followingId) {
    setMessage("");

    try {
      await unfollowUser({
        followerId: userId,
        followingId,
      });

      setMessage("User unfollowed successfully.");
      loadData();
    } catch (err) {
      console.error(err);
      setMessage("Unfollow failed.");
    }
  }

  return (
    <div className="card">
      <h1>Follow Users</h1>

      <form onSubmit={handleFollow} className="form-inline">
        <input
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
          placeholder="Enter user email to follow"
          required
        />

        <button>Follow</button>
      </form>

      {message && <p className="success">{message}</p>}

      <hr />

      <h2>Following</h2>

{(!following || following.length === 0) && <p>You are not following anyone.</p>}

{(following || []).map((follow) => (
  <div className="list-row" key={follow.id || follow.followingId}>
    <span>{follow.followingId}</span>
    <button onClick={() => handleUnfollow(follow.followingId)}>
      Unfollow
    </button>
  </div>
))}

      <hr />

      <h2>Followers</h2>

{(!followers || followers.length === 0) && <p>No followers yet.</p>}

{(followers || []).map((follow) => (
  <div className="list-row" key={follow.id || follow.followerId}>
    <span>{follow.followerId}</span>
  </div>
))}
    </div>
  );
}

export default FollowPage;