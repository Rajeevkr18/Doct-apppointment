import React, { useState } from "react";
import "../styles/RegiserStyles.css";
import { Form, Input, message, Button } from "antd";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance"; // ✅ use centralized axios instance

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // ✅ Form handler
  const onFinishHandler = async (values) => {
    try {
      setLoading(true);
      dispatch(showLoading());

      // ✅ Use centralized axios instance
      const res = await api.post("/api/v1/user/login", values);

      dispatch(hideLoading());
      setLoading(false);

      if (res.data.success) {
        // Save token to localStorage
        localStorage.setItem("token", res.data.token);
        message.success("Login Successfully");
        navigate("/");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      setLoading(false);
      console.error(error);
      message.error("Something went wrong");
    }
  };

  return (
    <div className="form-container">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Welcome Back</h2>
          <p>Access your dashboard, book appointments and manage your profile.</p>
        </div>

        <div className="auth-right">
          <Form
            layout="vertical"
            onFinish={onFinishHandler}
            className="register-form"
          >
            <h3 className="form-title">Login</h3>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email!" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input type="email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input type="password" />
            </Form.Item>

            <div className="auth-footer">
              <Link to="/register" className="m-2">
                Not a user? Register here
              </Link>
            </div>

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
              >
                Login
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
