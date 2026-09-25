import axios from "axios";

export const API_URL =
  process.env.REACT_APP_PROD_API_URL || process.env.REACT_APP_API_URL || "";

// Reads the payload of our own session JWT. The server verifies the signature on
// every request; the client only needs the expiry to decide when to log out.
function decode(token) {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(part));
  } catch (e) {
    return null;
  }
}

export function getToken() {
  const token = localStorage.getItem("token");
  const claims = token && decode(token);
  if (!claims || !claims.exp || claims.exp * 1000 <= Date.now()) return null;
  return token;
}

export function saveSession(token, user) {
  localStorage.setItem("token", token);
  const { admin, username, _id } = user;
  localStorage.setItem("user", JSON.stringify({ admin, username, _id }));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function isLoggedIn() {
  if (getToken()) return true;
  clearSession();
  return false;
}

// Attach the session to every API call, and send the user back to login when
// the server says the session is missing or expired.
export function installAuthInterceptors() {
  axios.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const onAuthPage = /^\/(login|register|oauth)/.test(window.location.pathname);
      if (error.response && error.response.status === 401 && !onAuthPage) {
        clearSession();
        localStorage.setItem("lastClickedURL", window.location.pathname);
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );
}
