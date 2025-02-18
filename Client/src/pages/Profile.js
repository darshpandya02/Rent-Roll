import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DefaultLayout from "../components/DefaultLayout";
import { Row, Col } from "antd";
import { CgProfile } from "react-icons/cg";
import { useNavigate, Link, useParams } from "react-router-dom";
import Footer from "./Footer";
function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  console.log(user);
  const [profile, setProfile] = useState(user);

  return (
    <DefaultLayout>
      <Row className="main-row" justify="left" style={{ marginBottom: 0 }}>
        <h1 className="Main-heading-home">Profile</h1>
      </Row>
      <Row>
        <Col>
          <Row style={{ marginLeft: 40 }}>
            <CgProfile size={140} />
          </Row>
        </Col>
        <Col>
          {user && (
            <div className="contact-container">
              <form>
                <div className="row mx-auto">
                  <div className="col-8 form-group mx-auto">
                    <input
                      className="form-control"
                      value={user.username}
                      onChange={(e) =>
                        setProfile({ ...user, username: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-8 form-group mx-auto">
                    <input
                      className="form-control"
                      value={user.email}
                      onChange={(e) =>
                        setProfile({ ...user, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-8 form-group mx-auto">
                    <input
                      className="form-control"
                      value={user.password}
                      type="password"
                      onChange={(e) =>
                        setProfile({ ...user, password: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-8 form-group mx-auto">
                    <input
                      className="form-control"
                      value={user.phone}
                      onChange={(e) =>
                        setProfile({ ...user, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-8 form-group mx-auto">
                    <button className="btn btn-primary w-100" >
                      Save
                    </button>
                    {/* <button className="btn btn-danger w-100" onClick={signout}>
                      Sign Out
                    </button> */}
                  </div>
                </div>
              </form>
            </div>
          )}
        </Col>
      </Row>
      <Footer />
    </DefaultLayout>
  );
}
export default Profile;
