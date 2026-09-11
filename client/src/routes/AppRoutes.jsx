import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import ItemsList from "../pages/items/ItemsList";
import ItemDetails from "../pages/items/ItemDetails";
import PostItem from "../pages/items/PostItem";
import MyClaims from "../pages/claims/MyClaims";
import ClaimRequests from "../pages/claims/ClaimRequests";
import ChatPage from "../pages/chat/ChatPage";
import Profile from "../pages/profile/Profile";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminLayout from "../pages/admin/AdminLayout";
import PostManagement from "../pages/admin/PostManagement";
import UserManagement from "../pages/admin/UserManagement";
import ReportManagement from "../pages/admin/ReportManagement";
import ClaimManagement from "../pages/admin/ClaimManagement";

// Master Application Routing component
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/items" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route path="/items" element={<ItemsList />} />
      <Route path="/items/:id" element={<ItemDetails />} />

      <Route
        path="/post"
        element={
          <ProtectedRoute>
            <PostItem />
          </ProtectedRoute>
        }
      />

      <Route
        path="/claims/mine"
        element={
          <ProtectedRoute>
            <MyClaims />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activity"
        element={<Navigate to="/claims/mine" replace />}
      />

      <Route
        path="/claims/incoming"
        element={
          <ProtectedRoute>
            <ClaimRequests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat/:conversationId"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="posts" element={<PostManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<ReportManagement />} />
        <Route path="claims" element={<ClaimManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
}

