import React, { useEffect, useState } from "react";
import Layout from "./../../components/Layout";
import { Table, message, Modal } from "antd";
import api from "../../utils/axiosInstance"; // ✅ centralized api

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loadingDeleteId, setLoadingDeleteId] = useState(null);
  const [loadingAdminId, setLoadingAdminId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Fetch all users
  const getUsers = async () => {
    try {
      const res = await api.get("/api/v1/admin/getAllUsers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) setUsers(res.data.data);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch users");
    }
  };

  // Fetch current user
  const getCurrentUser = async () => {
    try {
      const res = await api.post(
        "/api/v1/user/getUserData",
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) setCurrentUserId(res.data.data._id);
    } catch (err) {
      console.log("Could not fetch current user", err);
    }
  };

  useEffect(() => {
    getUsers();
    getCurrentUser();
  }, []);

  // Handle user actions
  const handleDeleteUser = async (userId) => {
    Modal.confirm({
      title: `Delete user?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          setLoadingDeleteId(userId);
          const res = await api.delete(`/api/v1/admin/delete-user/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setLoadingDeleteId(null);
          if (res.data.success) {
            message.success(res.data.message || "User deleted");
            getUsers();
          } else {
            message.error(res.data.message || "Delete failed");
          }
        } catch (err) {
          console.error(err);
          setLoadingDeleteId(null);
          message.error("Error deleting user");
        }
      },
    });
  };

  const handleAdminAction = async (record, approve) => {
    Modal.confirm({
      title: approve ? "Approve Admin?" : "Revoke Admin?",
      content: approve
        ? "This will grant admin privileges to this user."
        : "This will remove admin privileges from this user. You cannot revoke your own admin privileges.",
      okText: approve ? "Approve" : "Revoke",
      okType: approve ? "primary" : "danger",
      onOk: async () => {
        try {
          setLoadingAdminId(record._id);
          const res = await api.post(
            `/api/v1/admin/approve-admin/${record._id}`,
            { approve },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          setLoadingAdminId(null);
          if (res.data.success) {
            message.success(res.data.message || "Updated");
            getUsers();
          } else {
            message.error(res.data.message || "Failed to update");
          }
        } catch (err) {
          console.error(err);
          setLoadingAdminId(null);
          message.error(err.response?.data?.message || "Error updating admin status");
        }
      },
    });
  };

  const handleBulkAction = async (action) => {
    if (!selectedRowKeys.length) return message.warning("No users selected");
    const title =
      action === "delete"
        ? "Delete selected users?"
        : action === "approveAdmin"
        ? "Approve admin for selected users?"
        : "Revoke admin for selected users?";

    Modal.confirm({
      title,
      content: "This will perform the action for all selected users.",
      okText: action === "delete" ? "Delete" : "Confirm",
      okType: action === "delete" ? "danger" : "primary",
      onOk: async () => {
        try {
          const res = await api.post(
            "/api/v1/admin/bulk-user-action",
            { action, userIds: selectedRowKeys },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
          if (res.data.success) {
            message.success(res.data.message || "Bulk action completed");
            setSelectedRowKeys([]);
            getUsers();
          } else {
            message.error(res.data.message || "Bulk action failed");
          }
        } catch (err) {
          console.error(err);
          message.error("Error performing bulk action");
        }
      },
    });
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Doctor",
      dataIndex: "isDoctor",
      render: (_, record) => <span>{record.isDoctor ? "Yes" : "No"}</span>,
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => (
        <div className="d-flex">
          <button
            className="btn btn-danger"
            disabled={loadingDeleteId === record._id}
            onClick={() => handleDeleteUser(record._id)}
          >
            {loadingDeleteId === record._id ? "Deleting..." : "Block"}
          </button>
          <button
            className="btn btn-primary ms-2"
            disabled={loadingAdminId === record._id || (record._id === currentUserId && record.isAdmin)}
            onClick={() => handleAdminAction(record, !record.isAdmin)}
          >
            {loadingAdminId === record._id
              ? record.isAdmin
                ? "Revoking..."
                : "Approving..."
              : record.isAdmin
              ? "Revoke Admin"
              : "Approve Admin"}
          </button>
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return (
    <Layout>
      <h1 className="text-center m-2">Users List</h1>
      <div style={{ marginBottom: 12 }}>
        <button className="btn btn-danger me-2" onClick={() => handleBulkAction("delete")} disabled={!selectedRowKeys.length}>
          Delete Selected
        </button>
        <button className="btn btn-primary me-2" onClick={() => handleBulkAction("approveAdmin")} disabled={!selectedRowKeys.length}>
          Approve Admin Selected
        </button>
        <button className="btn btn-warning" onClick={() => handleBulkAction("revokeAdmin")} disabled={!selectedRowKeys.length}>
          Revoke Admin Selected
        </button>
        {selectedRowKeys.length > 0 && <span style={{ marginLeft: 12 }}>{selectedRowKeys.length} selected</span>}
      </div>
      <Table rowKey="_id" rowSelection={rowSelection} columns={columns} dataSource={users} />
    </Layout>
  );
};

export default Users;
