import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Row } from "antd";
import Spinner from "../components/Spinner";
import Footer from "./Footer";
import axios from "axios";
import { Link } from "react-router-dom";
 
function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [userData, setUserData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPassword, setEditedPassword] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
 
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/users/profile/${user.username}`
        );
        setUserData(response.data);
 
        setEditedEmail(response.data.email);
        setEditedPassword(response.data.password);
        setEditedPhone(response.data.phone);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
 
    fetchUserData();
  }, []);
 
  const handleEdit = () => {
    setEditMode(true);
  };
 
  const handleSave = async () => {
    try {
      await axios.put(
        `http://localhost:4000/api/users/profile/${user.username}`,
        {
          email: editedEmail,
          password: editedPassword,
          phone: editedPhone,
        }
      );
      setUserData({
        ...userData,
        email: editedEmail,
        password: editedPassword,
        phone: editedPhone,
      });
 
      setEditMode(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };
 
  const inputStyle = {
    width: "100%",
    padding: "8px",
    margin: "8px 0",
    boxSizing: "border-box",
  };
 
  const buttonStyle = {
    backgroundColor: "#4B0082df",
    color: "white",
    padding: "10px 15px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  };
 
  const labelStyle = {
    display: "block",
    marginTop: "10px",
    marginBottom: "5px",
    fontWeight: "bold",
  };
 
  const readOnlyInputStyle = {
    ...inputStyle,
    cursor: "not-allowed",
    backgroundColor: "#f2f2f2",
  };
 
  const profileContainerStyle = {
    maxWidth: "600px",
    margin: "auto",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    backgroundColor: "#fff",
  };
 
  const nonEditModeStyle = {
    textAlign: "left",
  };
 
  return (
    <DefaultLayout>
      <Row className="main-row" justify="center">
        <h1 className="Main-heading-home">
          Here is your<span className="ml-2 mr-2"> Profile</span> 🚗
        </h1>
      </Row>
      <Row className="main-row" justify="center">
        {userData ? (
          <>
            <div style={profileContainerStyle}>
              {editMode ? (
                <>
                  <label style={labelStyle}>Username:</label>
                  <input
                    className="form-control"
                    value={user.username}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                  <label style={labelStyle}>Email:</label>
                  <input
                    className="form-control"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    style={inputStyle}
                  />
                  <label style={labelStyle}>Password:</label>
                  <input
                    value={editedPassword}
                    onChange={(e) => setEditedPassword(e.target.value)}
                    style={inputStyle}
                  />
                  <label style={labelStyle}>Phone:</label>
                  <input
                    value={editedPhone}
                    onChange={(e) => setEditedPhone(e.target.value)}
                    style={inputStyle}
                  />
                </>
              ) : (
                <>
                  <label style={labelStyle}>Username:</label>
                  <input
                    className="form-control"
                    value={userData.username}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                  <label style={labelStyle}>Email:</label>
                  <input
                    className="form-control"
                    value={userData.email}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                  <label style={labelStyle}>Password:</label>
                  <input
                    className="form-control"
                    value={userData.password}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                  <label style={labelStyle}>Phone:</label>
                  <input
                    className="form-control"
                    value={userData.phone}
                    readOnly
                    style={readOnlyInputStyle}
                  />
                </>
              )}
              {editMode ? (
                <button style={buttonStyle} onClick={handleSave}>
                  Save
                </button>
              ) : (
                <button style={buttonStyle} onClick={handleEdit}>
                  Edit
                </button>
              )}
              <Link to="/userbookings" style={{ textDecoration: "none" }}>
        {" "}
        <button className="form-control" style={{ padding: "10px 0", margin: "10px" }}>
          My Bookings
        </button>
      </Link>
            </div>
          </>
        ) : (
          <Spinner />
        )}
      </Row>
      
      <Footer />
    </DefaultLayout>
  );
}
 
export default Profile;
 