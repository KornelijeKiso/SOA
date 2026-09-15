import { Navigate, Outlet } from "react-router-dom";
import { getRole, homePath, isLoggedIn } from "../auth/authStorage";

export default function ProtectedRoute({ role }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  if (role && getRole() !== role) return <Navigate to={homePath()} replace />;
  return <Outlet />;
}