import { useEffect, useState } from "react";

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AuthPage from "./components/AuthPage";
import DashboardPage from "./components/Dashboard";
import OwnedCommunitiesPage from "./components/OwnedCommunitiesPage";
import JoinedCommunity from "./components/JoinedCommunity";
import CommunityMemberPage from "./components/CommunityMember";
import { useDispatch } from "react-redux";
import { clearUser, setUser } from "./redux/actions/userActions";
import axios from "axios";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/v1/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        dispatch(setUser(response.data.content.data));
      } catch (error) {
        console.error("Token invalid or fetch failed");
        dispatch(clearUser());
      }
    };

    fetchUser();
  }, [dispatch]);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/myCommunity" element={<OwnedCommunitiesPage />} />
          <Route path="/joinedCommunities" element={<JoinedCommunity />} />
          <Route path="/community/:id" element={<CommunityMemberPage />} />
          <Route path="/home" element={<DashboardPage />} />
          <Route path="/" element={<DashboardPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
