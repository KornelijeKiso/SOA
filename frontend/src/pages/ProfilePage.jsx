import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../api/authApi";
import { saveProfile } from "../auth/authStorage";
import { apiError } from "../api/responseUtils";

const editable = [
  ["firstName", "First Name"], ["lastName", "Last Name"],
  ["profileImageUrl", "Profile Image URL"], ["biography", "Biography"], ["motto", "Motto"],
];
export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    getMyProfile().then(({ data }) => {
      if (!data?.email) throw new Error("Missing profile");
      if (live) { setProfile(data); saveProfile(data); }
    }).catch((err) => { if (live) setError(apiError(err, "Could not load your profile.")); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  function change(event) { setProfile({ ...profile, [event.target.name]: event.target.value }); }
  async function save(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await updateMyProfile(Object.fromEntries(editable.map(([field]) => [field, profile[field] || ""])));
      const { data } = await getMyProfile();
      if (!data?.email) throw new Error("Missing profile");
      setProfile(data); saveProfile(data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(apiError(err, "Could not save or reload your profile."));
    } finally { setBusy(false); }
  }
  return <div className="card form">
    <h1>My Profile</h1>
    {loading && <p>Loading profile...</p>}
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    {profile && <form onSubmit={save}>
      {["username", "email", "role"].map((field) => <div className="input-group" key={field}>
        <label htmlFor={"profile-" + field}>{field[0].toUpperCase() + field.slice(1)}</label>
        <input id={"profile-" + field} value={profile[field] || ""} disabled />
      </div>)}
      {editable.map(([field, label]) => <div className="input-group" key={field}>
        <label htmlFor={"profile-" + field}>{label}</label>
        {field === "biography" ?
          <textarea id={"profile-" + field} name={field} value={profile[field] || ""} onChange={change} disabled={busy} /> :
          <input id={"profile-" + field} name={field} value={profile[field] || ""} onChange={change} disabled={busy} />}
      </div>)}
      <button disabled={busy}>{busy ? "Saving..." : "Save Profile"}</button>
    </form>}
  </div>;
}