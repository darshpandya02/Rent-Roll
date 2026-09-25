import React, { useEffect } from "react";
import axios from "axios";
import { message } from "antd";
import Spinner from "../components/Spinner";
import { API_URL, saveSession, clearSession } from "../auth";

// Google redirects back here via the API with our session token in the URL
// fragment. Read it, drop it from the address bar, then load the profile.
function OAuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      window.location.href = "/login";
      return;
    }
    axios
      .get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        saveSession(token, res.data);
        message.success("Signed in with Google");
        const next = localStorage.getItem("lastClickedURL") || "/";
        window.location.href = next;
      })
      .catch(() => {
        clearSession();
        message.error("Google sign-in failed");
        window.location.href = "/login";
      });
  }, []);

  return <Spinner />;
}

export default OAuthCallback;
