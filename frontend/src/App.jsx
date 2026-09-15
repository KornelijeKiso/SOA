import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
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
import PositionSimulatorPage from "./pages/PositionSimulatorPage";
import CartPage from "./pages/CartPage";
import ActiveExecutionPage from "./pages/ActiveExecutionPage";
import { isLoggedIn } from "./auth/authStorage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main className="page">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/blogs" element={<BlogListPage />} />
          <Route path="/blogs/create" element={<CreateBlogPage />} />
          <Route path="/blogs/:blogId" element={<BlogDetailsPage />} />
          <Route path="/follow" element={<FollowPage />} />
          <Route path="/tours" element={<MyToursPage />} />
          <Route path="/tours/create" element={<CreateTourPage />} />
          <Route path="/tours/:tourId" element={<TourDetailsPage />} />
          <Route path="/tours/:tourId/key-points/add" element={<AddKeyPointPage />} />
          <Route path="/position" element={<PositionSimulatorPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/execution" element={<ActiveExecutionPage />} />

          <Route
            path="*"
            element={
              <div className="card">
                <h2>Page not created yet</h2>
                <p>We will add this page in the next steps.</p>
              </div>
            }
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;