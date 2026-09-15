import { Link, useNavigate } from "react-router-dom";
import { getProfile, isLoggedIn, logout } from "../auth/authStorage";

function Navbar() {
  const navigate = useNavigate();
  const profile = getProfile();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/login" className="brand">
        TourApp
      </Link>

      <div className="nav-links">

  {isLoggedIn() && (
    <>
      <Link to="/profile">Profile</Link>
      <Link to="/blogs">Blogs</Link>
      <Link to="/tours">Tours</Link>
      <Link to="/cart">Cart</Link>
      <Link to="/follow">Follow</Link>
    </>
  )}

  {!isLoggedIn() && (
    <>
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </>
  )}

  {isLoggedIn() && profile && (
    <span className="nav-user">{profile.username}</span>
  )}

  {isLoggedIn() && (
    <button onClick={handleLogout} className="link-button">
      Logout
    </button>
  )}
</div>
    </nav>
  );
}

export default Navbar;