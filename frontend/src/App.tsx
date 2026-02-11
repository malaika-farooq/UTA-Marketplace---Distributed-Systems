import { Navigate, Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import Listings from "./pages/Listings";
import Chat from "./pages/Chat";
import { AuthProvider } from "./state/auth";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/listings" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/chat/:conversationId" element={<Chat />} />
      </Routes>
    </AuthProvider>
  );
}