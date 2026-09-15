import { Link, useNavigate } from "react-router-dom";
import { getProfile, getRole, homePath, isLoggedIn, logout } from "../auth/authStorage";

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const role = getRole();
  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }
  return (
    <nav className="navbar">
      <Link to={homePath()} className="brand">TourApp</Link>
      <div className="nav-links">
        {loggedIn ? <>
          <Link to="/profile">Profile</Link>
          <Link to="/blogs">Blogs</Link>
          <Link to="/follow">Follow</Link>
          {role === "GUIDE" && <>
            <Link to="/tours">My Tours</Link>
            <Link to="/tours/create">Create Tour</Link>
          </>}
          {role === "TOURIST" && <>
            <Link to="/tours/published">Published Tours</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/position">Position Simulator</Link>
            <Link to="/execution">Active Execution</Link>
          </>}
          <span className="nav-user">{getProfile()?.username}</span>
          <button onClick={handleLogout} className="link-button">Logout</button>
        </> : <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </>}
      </div>
    </nav>
  );
}