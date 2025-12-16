import React from "react";
import Layout from "./../components/Layout";
import { message, Tabs } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance"; // centralized Axios instance

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  // ✅ Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await api.post(
        "/api/v1/user/get-all-notification",
        { userId: user._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message || "All notifications marked as read");
      } else {
        message.error(res.data.message || "Failed to mark notifications");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error marking notifications as read:", error);
      message.error("Something went wrong");
    }
  };

  // ✅ Delete all read notifications
  const handleDeleteAllRead = async () => {
    try {
      dispatch(showLoading());
      const res = await api.post(
        "/api/v1/user/delete-all-notification",
        { userId: user._id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message || "All read notifications deleted");
      } else {
        message.error(res.data.message || "Failed to delete notifications");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error deleting notifications:", error);
      message.error("Something went wrong while deleting notifications");
    }
  };

  return (
    <Layout>
      <h4 className="p-3 text-center">Notification Page</h4>

      <Tabs defaultActiveKey="0">
        {/* Unread Notifications */}
        <Tabs.TabPane tab="Unread" key="0">
          <div className="d-flex justify-content-end">
            <h4
              className="p-2 text-primary"
              style={{ cursor: "pointer" }}
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </h4>
          </div>
          {(user?.notifcation || []).length > 0 ? (
            user.notifcation.map((notificationMgs, index) => (
              <div
                key={index}
                className="card"
                style={{ cursor: "pointer", marginBottom: "8px" }}
                onClick={() => navigate(notificationMgs.onClickPath)}
              >
                <div className="card-text">{notificationMgs.message}</div>
              </div>
            ))
          ) : (
            <p className="text-center muted">No unread notifications</p>
          )}
        </Tabs.TabPane>

        {/* Read Notifications */}
        <Tabs.TabPane tab="Read" key="1">
          <div className="d-flex justify-content-end">
            <h4
              className="p-2 text-danger"
              style={{ cursor: "pointer" }}
              onClick={handleDeleteAllRead}
            >
              Delete All Read
            </h4>
          </div>
          {(user?.seennotification || []).length > 0 ? (
            user.seennotification.map((notificationMgs, index) => (
              <div
                key={index}
                className="card"
                style={{ cursor: "pointer", marginBottom: "8px" }}
                onClick={() => navigate(notificationMgs.onClickPath)}
              >
                <div className="card-text">{notificationMgs.message}</div>
              </div>
            ))
          ) : (
            <p className="text-center muted">No read notifications</p>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Layout>
  );
};

export default NotificationPage;
