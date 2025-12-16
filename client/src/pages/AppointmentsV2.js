import React, { useState, useEffect } from "react";
import api from "../utils/axiosInstance"; // centralized axios instance
import Layout from "./../components/Layout";
import moment from "moment";
import { Modal, Button, message } from "antd";

const AppointmentsV2 = () => {
  const [appointments, setAppointments] = useState([]);
  const [selected, setSelected] = useState(null);

  // ✅ Fetch all user appointments
  const getAppointments = async () => {
    try {
      const res = await api.get("/api/v1/user/user-appointments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        setAppointments(res.data.data);
      } else {
        message.error(res.data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Error while fetching appointments");
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  return (
    <Layout>
      <h1>Appointments</h1>

      <div className="appointments-grid">
        {appointments.length === 0 ? (
          <div className="muted text-center mt-3">
            You have no appointments yet.
          </div>
        ) : (
          appointments.map((a) => {
            const s = (a.status || "").toLowerCase();
            const cls =
              s === "pending"
                ? "status-pending"
                : s === "approved"
                ? "status-approved"
                : s === "reject"
                ? "status-reject"
                : "status-cancel";

            return (
              <div key={a._id} className="card appointment-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>
                      Dr. {a.doctorInfo?.firstName} {a.doctorInfo?.lastName}
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {a.doctorInfo?.specialization}
                    </div>
                  </div>
                  <div>
                    <span className={`status-badge ${cls}`}>{a.status}</span>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {moment(a.date).format("DD-MM-YYYY")}
                    </div>
                    <div className="muted">
                      {moment(a.time).format("HH:mm")}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button type="default" onClick={() => setSelected(a)}>
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ✅ Appointment Details Modal */}
      <Modal
        open={!!selected}
        title="Appointment Details"
        onCancel={() => setSelected(null)}
        footer={null}
      >
        {selected && (
          <div>
            <h3>
              Dr. {selected.doctorInfo?.firstName}{" "}
              {selected.doctorInfo?.lastName}
            </h3>
            <p>
              <b>Date:</b> {moment(selected.date).format("DD-MM-YYYY")}
            </p>
            <p>
              <b>Time:</b> {moment(selected.time).format("HH:mm")}
            </p>
            <p>
              <b>Fees:</b> ₹{selected.doctorInfo?.feesPerCunsaltation}
            </p>
            <p>
              <b>Status:</b>{" "}
              <span
                className={`status-badge ${
                  ((selected.status || "").toLowerCase()) === "pending"
                    ? "status-pending"
                    : ((selected.status || "").toLowerCase()) === "approved"
                    ? "status-approved"
                    : ((selected.status || "").toLowerCase()) === "reject"
                    ? "status-reject"
                    : "status-cancel"
                }`}
              >
                {selected.status}
              </span>
            </p>
            <p>
              <b>Notes:</b> {selected.notes || "—"}
            </p>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default AppointmentsV2;
