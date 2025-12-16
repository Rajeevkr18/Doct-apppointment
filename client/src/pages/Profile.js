import React, { useState } from "react";
import Layout from "../components/Layout";
import { useSelector, useDispatch } from "react-redux";
import "../styles/UserProfile.css";
import { Modal, Form, Input, message } from "antd";
import api from "../utils/axiosInstance"; // centralized Axios instance
import { setUser } from "../redux/features/userSlice";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);

  // Generate initials for avatar
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Handle profile update
  const handleProfileUpdate = async (values) => {
    try {
      dispatch(showLoading());
      const res = await api.post(
        "/api/v1/user/updateProfile",
        { ...values, userId: user?._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(hideLoading());

      if (res.data.success) {
        message.success(res.data.message || "Profile updated successfully");
        dispatch(setUser(res.data.data));
        setVisible(false);
      } else {
        message.error(res.data.message || "Update failed");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Profile update error:", error);
      message.error("Something went wrong while updating profile");
    }
  };

  return (
    <Layout>
      <div className="user-profile container">
        <div className="profile-card">
          {/* Left Section */}
          <div className="profile-left">
            <div className="avatar">{initials}</div>
            <h2 className="name">{user?.name || "Anonymous"}</h2>
            <p className="role">{user?.isDoctor ? "Doctor" : "User"}</p>
          </div>

          {/* Right Section */}
          <div className="profile-right">
            <h3>Profile Details</h3>
            <div className="details">
              <div className="detail-row">
                <span className="label">Email</span>
                <span className="value">{user?.email || "-"}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone</span>
                <span className="value">{user?.phone || "-"}</span>
              </div>
              <div className="detail-row">
                <span className="label">Role</span>
                <span className="value">
                  {user ? (user.isDoctor ? "Doctor" : "User") : "-"}
                </span>
              </div>
            </div>

            <div className="actions">
              <button
                className="btn btn-primary"
                onClick={() => setVisible(true)}
              >
                Edit Profile
              </button>
              <button
                className="btn btn-outline"
                onClick={() => window.location.assign("/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        title="Edit Profile"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={{
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
          }}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="Phone">
            <Input />
          </Form.Item>

          <Form.Item>
            <button className="btn btn-primary" type="submit">
              Save
            </button>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default Profile;
