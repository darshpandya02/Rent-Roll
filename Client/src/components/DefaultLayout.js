import React from "react";
import { Menu, Dropdown, Button, Space } from "antd";
import Logoo from "../images/logo.png";
import { Link } from "react-router-dom";
function DefaultLayout(props) {
  const user = JSON.parse(localStorage.getItem("user"));
  const menu = (
    <Menu>
      <Menu.Item>
        <a href="/">Home</a>
      </Menu.Item>
      <Menu.Item>
        <a href="/userbookings">Bookings</a>
      </Menu.Item>
      <Menu.Item>
        <a href="/contact">Contact Us</a>
     
      </Menu.Item> 
      {user && (
        <Menu.Item>
          <Link to={`/profile/${user.username}`}>Profile</Link>
        </Menu.Item>
      )}
      {!user &&(
         (localStorage.removeItem("lastClickedURL"), null),
      <Menu.Item>
        <a href="/login">Login</a>
      </Menu.Item>
      )}
      
      
      {user && user.admin && (
        <Menu.Item>
          <Link to="/admin">Admin Panel</Link>
        </Menu.Item>
      )}
      {user && (
        <Menu.Item
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/";
          }}
        >
          Logout
        </Menu.Item>
      )}
    </Menu>
  );
  return (
    <div>
      <div className="header box-shadow1">
        <div className="d-flex justify-content-between logo-main">
          <Link to="/">
            <div
              style={{
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                }}
              >
                <img
                  src={Logoo}
                  alt="car"
                  style={{
                    width: "35px",
                    height: "35px",
                    marginLeft: "16px",
                    marginTop: "5px",
                    color: "black",
                    cursor: "pointer",
                  }}
                />
                <h1
                  style={{
                    fontSize: "1.4rem",
                    marginLeft: "10px",
                    marginTop: "10px",
                    cursor: "pointer",
                    color: "#f3cdfeec !important"
                  }}
                >
                  Rent & Roll
                </h1>
              </div>
            </div>
          </Link>
          <Dropdown overlay={menu} placement="bottomCenter">
            <Button>{user ? "Welcome " + user.username : "Welcome"} 
            </Button>
          </Dropdown>
          {/* <button>user</button> */}
        </div>
      </div>
      <div className="content">{props.children}</div>
    </div>
  );
}

export default DefaultLayout;
