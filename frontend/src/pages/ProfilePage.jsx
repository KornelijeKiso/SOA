import { useEffect, useState } from "react";
import { getMyProfile, updateMyProfile } from "../api/authApi";
import { saveProfile } from "../auth/authStorage";

function ProfilePage() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
    firstName: "",
    lastName: "",
    profileImageUrl: "",
    biography: "",
    motto: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await getMyProfile();
      setProfile(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await updateMyProfile({
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImageUrl: profile.profileImageUrl,
        biography: profile.biography,
        motto: profile.motto,
      });

      saveProfile(profile);
      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
    }
  }

  return (
    <div className="card form">
      <h1>My Profile</h1>

      <form onSubmit={handleSubmit}>

        <div className="input-group">
          <label>Username</label>
          <input value={profile.username} disabled />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input value={profile.email} disabled />
        </div>

        <div className="input-group">
          <label>Role</label>
          <input value={profile.role} disabled />
        </div>

        <div className="input-group">
          <label>First Name</label>
          <input
            name="firstName"
            value={profile.firstName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Last Name</label>
          <input
            name="lastName"
            value={profile.lastName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Profile Image URL</label>
          <input
            name="profileImageUrl"
            value={profile.profileImageUrl || ""}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Biography</label>
          <textarea
            name="biography"
            value={profile.biography || ""}
            onChange={handleChange}
          />
        </div>

        <div className="input-group">
          <label>Motto</label>
          <input
            name="motto"
            value={profile.motto || ""}
            onChange={handleChange}
          />
        </div>

        <button>Save Profile</button>

        {message && <p className="success">{message}</p>}
      </form>
    </div>
  );
}

export default ProfilePage;