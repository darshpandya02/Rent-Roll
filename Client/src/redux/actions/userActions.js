import axios from "axios";
import { message } from "antd";
import { API_URL as BASE_URL, saveSession } from "../../auth";

export const userLogin = (reqObj) => async (dispatch) => {
  dispatch({ type: "LOADING", payload: true });

  try {
    const response = await axios.post(`${BASE_URL}/api/users/login`, reqObj);
    saveSession(response.data.token, response.data.user);
    const lastClickedURL = localStorage.getItem("lastClickedURL");
    const bookingURL = lastClickedURL
        ? lastClickedURL
        : "/";
    message.success("Login success");
    dispatch({ type: "LOADING", payload: false });
    setTimeout(() => {
      window.location.href = bookingURL;
    }, 500);
  } catch (error) {
    const invalid = error.response && error.response.status === 401;
    message.error(invalid ? "Invalid email or password" : "Something went wrong");
    dispatch({ type: "LOADING", payload: false });
  }
};


export const userRegister = (reqObj) => async (dispatch) => {
  dispatch({ type: "LOADING", payload: true });

  try {
    const response = await axios.post(`${BASE_URL}/api/users/register`, reqObj);
    message.success("Registration successfull");
    setTimeout(() => {
      window.location.href = "/login";
    }, 500);

    dispatch({ type: "LOADING", payload: false });
  } catch (error) {
    const reason = error.response && error.response.data && error.response.data.error;
    message.error(reason || "Something went wrong");
    dispatch({ type: "LOADING", payload: false });
  }
};
