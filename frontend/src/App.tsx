import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Listings from "./pages/Listings";
import SellerProfile from "./pages/SellerProfile";
import CreateListing from "./pages/CreateListing";
import MyListings from "./pages/MyListing";
import Contacts from "./pages/Contacts";
import Layout from "./components/Layout";
import { AuthProvider, useAuth } from "./state/auth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Layout always visible */}
        <Route element={<Layout />}>

          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Navigate to="/listings" replace />} />
          <Route path="/listings" element={<Listings />} />

          {/* AUTH ROUTES */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />

          {/* PROTECTED ROUTES */}
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateListing />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />
          <Route path="/sellers" element={<ProtectedRoute>
            <Contacts />
          </ProtectedRoute>} />


          <Route path="/seller/:id" element={<ProtectedRoute>
            <SellerProfile />
          </ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute>
            <Profile />
          </ProtectedRoute>} />
        </Route>


        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/listings" replace />} />

      </Routes>
    </AuthProvider>
  );
}