import React, { useState } from "react";
import "../styles/RegiserStyles.css";
import { Form, Input, message, Button } from "antd";
import api from "../utils/axiosInstance"; // ✅ Import your configured axios instance
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  // ✅ Form handler
  const onFinishHandler = async (values) => {
    try {
      setLoading(true);
      dispatch(showLoading());

      // ✅ Use centralized axios instance
      const res = await api.post("/api/v1/user/register", values);

      dispatch(hideLoading());
      setLoading(false);

      if (res.data.success) {
        message.success("Registered successfully!");
        navigate("/login");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      setLoading(false);
      console.error(error);
      message.error("Something went wrong!");
    }
  };

  return (
    <div className="form-container">
      <div className="auth-card">
        <div className="auth-left">
          <h2>Create your account</h2>
          <p>Join our community to book and manage appointments easily.</p>
        </div>

        <div className="auth-right">
          <Form
            layout="vertical"
            onFinish={onFinishHandler}
            className="register-form"
          >
            <h3 className="form-title">Create account</h3>

            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: "Please input your name" }]}
            >
              <Input type="text" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input your email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input type="email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input a password" },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
            >
              <Input type="password" />
            </Form.Item>

            <div className="auth-footer">
              <Link to="/login" className="m-2">
                Already have an account? Login here
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
                Register
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
