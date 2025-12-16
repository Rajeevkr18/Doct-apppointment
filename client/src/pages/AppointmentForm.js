import React, { useState } from "react";
import { message } from "antd";
import api from "../utils/axiosInstance"; // ✅ centralized axios instance
import "../styles/AppointmentForm.css";

const AppointmentForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    zip: "",
    time: "Morning",
    type: "A New Patient Appointment",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!form.name || !form.email || !form.phone) {
      message.warning("Please fill out all required fields");
      return;
    }

    try {
      const res = await api.post("/api/v1/user/create-appointment-form", form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (res.data.success) {
        message.success("Appointment request submitted successfully");
        setForm({
          name: "",
          email: "",
          phone: "",
          addressLine: "",
          city: "",
          zip: "",
          time: "Morning",
          type: "A New Patient Appointment",
        });
      } else {
        message.error(res.data.message || "Failed to submit form");
      }
    } catch (error) {
      console.error(error);
      message.error("Error submitting form");
    }
  };

  return (
    <div className="appointment-page">
      <div className="appointment-form card">
        <h1 className="form-title-center">DOCTOR APPOINTMENT FORM</h1>
        <form onSubmit={handleSubmit} className="af-form">
          <div className="af-grid">
            <div className="af-col">
              <label>
                Name <span className="required">*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
              />

              <label className="mt-2">
                Email <span className="required">*</span>
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Mail@example.com"
              />

              <label className="mt-2">
                Phone Number <span className="required">*</span>
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>

            <div className="af-col">
              <label>
                Address <span className="required">*</span>
              </label>
              <input
                name="addressLine"
                value={form.addressLine}
                onChange={handleChange}
                placeholder="Address Line"
              />

              <div className="af-row">
                <div style={{ flex: 1, marginRight: 8 }}>
                  <label className="mt-2">City</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                  />
                </div>
                <div style={{ width: 120 }}>
                  <label className="mt-2">Zip code</label>
                  <input
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                    placeholder="Zip code"
                  />
                </div>
              </div>

              <div className="af-submit-row">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </div>
          </div>

          <div className="af-bottom">
            <div className="af-bottom-col">
              <div className="af-section-title">
                Best Time To Call You <span className="required">*</span>
              </div>
              <label className="af-radio">
                <input
                  type="radio"
                  name="time"
                  value="Morning"
                  checked={form.time === "Morning"}
                  onChange={handleChange}
                />{" "}
                Morning
              </label>
              <label className="af-radio">
                <input
                  type="radio"
                  name="time"
                  value="Afternoon"
                  checked={form.time === "Afternoon"}
                  onChange={handleChange}
                />{" "}
                Afternoon
              </label>
              <label className="af-radio">
                <input
                  type="radio"
                  name="time"
                  value="Evening"
                  checked={form.time === "Evening"}
                  onChange={handleChange}
                />{" "}
                Evening
              </label>
            </div>

            <div className="af-bottom-col">
              <div className="af-section-title">
                I Would Like To (Choose One)
                <span className="required">*</span>
              </div>
              <label className="af-radio">
                <input
                  type="radio"
                  name="type"
                  value="A New Patient Appointment"
                  checked={form.type === "A New Patient Appointment"}
                  onChange={handleChange}
                />{" "}
                A New Patient Appointment
              </label>
              <label className="af-radio">
                <input
                  type="radio"
                  name="type"
                  value="A Routine Checkup"
                  checked={form.type === "A Routine Checkup"}
                  onChange={handleChange}
                />{" "}
                A Routine Checkup
              </label>
              <label className="af-radio">
                <input
                  type="radio"
                  name="type"
                  value="A Comprehensive Health Exam"
                  checked={form.type === "A Comprehensive Health Exam"}
                  onChange={handleChange}
                />{" "}
                A Comprehensive Health Exam
              </label>
            </div>
          </div>
        </form>

        <div className="af-footer">
          © {new Date().getFullYear()} Doctor Appointment Form. All Rights
          Reserved
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;
