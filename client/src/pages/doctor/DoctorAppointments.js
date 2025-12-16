import React, { useState, useEffect } from "react";
import Layout from "./../../components/Layout";
import { Table, message } from "antd";
import moment from "moment";
import api from "../../utils/axiosInstance"; // ✅ use centralized api

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  // Fetch appointments
  const getAppointments = async () => {
    try {
      const res = await api.get("/api/v1/doctor/doctor-appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch appointments");
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  // Update appointment status
  const handleStatus = async (record, status) => {
    try {
      const res = await api.post(
        "/api/v1/doctor/update-status",
        { appointmentsId: record._id, status },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      if (res.data.success) {
        message.success(res.data.message || "Status updated");
        getAppointments();
      }
    } catch (error) {
      console.error(error);
      message.error("Something went wrong");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "_id" },
    {
      title: "Date & Time",
      dataIndex: "date",
      render: (_, record) => (
        <span>
          {moment(record.date).format("DD-MM-YYYY")} &nbsp;
          {moment(record.time).format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (_, record) => {
        const s = (record.status || "").toLowerCase();
        const cls =
          s === "pending"
            ? "status-pending"
            : s === "approved"
            ? "status-approved"
            : s === "reject"
            ? "status-reject"
            : "status-cancel";
        return <span className={`status-badge ${cls}`}>{record.status}</span>;
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_, record) => (
        <div className="d-flex">
          {record.status === "pending" && (
            <div className="d-flex">
              <button
                className="btn btn-success"
                onClick={() => handleStatus(record, "approved")}
              >
                Approve
              </button>
              <button
                className="btn btn-danger ms-2"
                onClick={() => handleStatus(record, "reject")}
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <h1>Appointments List</h1>
      <Table rowKey="_id" columns={columns} dataSource={appointments} />
    </Layout>
  );
};

export default DoctorAppointments;
