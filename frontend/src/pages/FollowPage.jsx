import { useEffect, useState } from "react";
import { followUser, unfollowUser, getFollowers, getFollowing } from "../api/blogApi";
import { getUserId } from "../auth/authStorage";
import { apiError, asList } from "../api/responseUtils";

export default function FollowPage() {
  const userId = getUserId();
  const [target, setTarget] = useState("");
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function load(signal) {
    setLoading(true);
    const results = await Promise.allSettled([getFollowing(userId, { signal }), getFollowers(userId, { signal })]);
    if (signal?.aborted) return;
    const errors = [];
    if (results[0].status === "fulfilled") setFollowing(asList(results[0].value.data));
    else errors.push(apiError(results[0].reason, "Could not load following."));
    if (results[1].status === "fulfilled") setFollowers(asList(results[1].value.data));
    else errors.push(apiError(results[1].reason, "Could not load followers."));
    if (errors.length) setError(errors.join(" "));
    setLoading(false);
  }
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [userId]);
  async function changeFollow(followingId, remove = false) {
    if (busy) return;
    if (!followingId.trim() || followingId.trim() === userId) { setError("Enter another user's email."); return; }
    setBusy(true); setError(""); setMessage("");
    try {
      await (remove ? unfollowUser : followUser)({ followerId: userId, followingId: followingId.trim() });
      if (!remove) setTarget("");
      setMessage(remove ? "User unfollowed." : "User followed.");
      await load();
    } catch (err) {
      setError(apiError(err, remove ? "Unfollow failed." : "Follow failed."));
    } finally { setBusy(false); }
  }
  return <div className="card">
    <h1>Follow Users</h1>
    <form onSubmit={(event) => { event.preventDefault(); changeFollow(target); }} className="form-inline">
      <label htmlFor="follow-email">User email</label>
      <input id="follow-email" type="email" value={target} onChange={(event) => setTarget(event.target.value)} required disabled={busy} />
      <button disabled={busy}>Follow</button>
    </form>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    {loading && <p>Loading relationships...</p>}
    <h2>Following</h2>
    {!loading && following.length === 0 && <p>You are not following anyone.</p>}
    {following.map((relation) => <div className="list-row" key={relation.id || relation.followingId}>
      <span>{relation.followingId}</span>
      <button disabled={busy || loading} onClick={() => changeFollow(relation.followingId, true)}>Unfollow</button>
    </div>)}
    <h2>Followers</h2>
    {!loading && followers.length === 0 && <p>No followers yet.</p>}
    {followers.map((relation) => <div className="list-row" key={relation.id || relation.followerId}>{relation.followerId}</div>)}
  </div>;
}