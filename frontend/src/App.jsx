import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import BlogListPage from "./pages/BlogListPage";
import CreateBlogPage from "./pages/CreateBlogPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import FollowPage from "./pages/FollowPage";
import MyToursPage from "./pages/MyToursPage";
import CreateTourPage from "./pages/CreateTourPage";
import TourDetailsPage from "./pages/TourDetailsPage";
import AddKeyPointPage from "./pages/AddKeyPointPage";
import PublishedToursPage from "./pages/PublishedToursPage";
import PositionSimulatorPage from "./pages/PositionSimulatorPage";
import CartPage from "./pages/CartPage";
import ActiveExecutionPage from "./pages/ActiveExecutionPage";
import { homePath, isLoggedIn } from "./auth/authStorage";

function HomeRedirect() {
  return <Navigate to={homePath()} replace />;
}
function GuestPage({ children }) {
  return isLoggedIn() ? <HomeRedirect /> : children;
}
export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/login" element={<GuestPage><LoginPage /></GuestPage>} />
          <Route path="/register" element={<GuestPage><RegisterPage /></GuestPage>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/blogs" element={<BlogListPage />} />
            <Route path="/blogs/create" element={<CreateBlogPage />} />
            <Route path="/blogs/:blogId" element={<BlogDetailsPage />} />
            <Route path="/follow" element={<FollowPage />} />
            <Route path="/tours/:tourId" element={<TourDetailsPage />} />
          </Route>
          <Route element={<ProtectedRoute role="GUIDE" />}>
            <Route path="/tours" element={<MyToursPage />} />
            <Route path="/tours/create" element={<CreateTourPage />} />
            <Route path="/tours/:tourId/key-points/add" element={<AddKeyPointPage />} />
          </Route>
          <Route element={<ProtectedRoute role="TOURIST" />}>
            <Route path="/tours/published" element={<PublishedToursPage />} />
            <Route path="/position" element={<PositionSimulatorPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/execution" element={<ActiveExecutionPage />} />
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}