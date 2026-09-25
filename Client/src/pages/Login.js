import React from "react";
import { Row, Col, Form, Input } from "antd";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { userLogin } from "../redux/actions/userActions";

function Login() {
  const dispatch = useDispatch();
  function onFinish(values) {
    dispatch(userLogin(values));
    console.log(values);
  }
  return (
    <div className="login">
      <Row gutter={8}>
        <Col lg={8} className="text-left p-5">
          <Form
            layout="vertical"
            className="login-form p-5"
            onFinish={onFinish}
          >
            <h1 className="login-heading">Login</h1>
            <hr />
            <div className="demo-credentials" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
              <b>Demo accounts</b>
              <br />
              User: demo@rentroll.app / demo1234
              <br />
              Subscriber (40% off): subscriber@rentroll.app / demo1234
              <br />
              Admin: admin@rentroll.app / admin1234
            </div>
            <Form.Item
              name="email"
              label="Email Address"
              rules={[{ required: true }]}
            >
              <input
                placeholder="Enter your email address..."
                className="p-2"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true }]}
            >
              <input
                type="password"
                placeholder="Enter your password..."
                className="p-2"
              />
            </Form.Item>
            <button className="btn2 mt-2 mb-3">Login</button>
            <br />
            <Link to="/register">Click here to Register</Link>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default Login;
