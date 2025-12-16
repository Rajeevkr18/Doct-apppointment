import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useParams } from "react-router-dom";
import api from "../utils/axiosInstance";
import { DatePicker, message, TimePicker, Modal, Input } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";

const BookingPage = () => {
  const { user } = useSelector((state) => state.user);
  const params = useParams();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const dispatch = useDispatch();

  // ✅ Fetch doctor data
  const getUserData = async () => {
    try {
      const res = await api.post(
        "/api/v1/doctor/getDoctorById",
        { doctorId: params.doctorId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.success) {
        setDoctor(res.data.data);
      }
    } catch (error) {
      console.error(error);
      message.error("Error fetching doctor data");
    }
  };

  // ✅ Check availability
  const handleAvailability = async () => {
    if (!date || !time) return message.warning("Please select date and time");
    try {
      dispatch(showLoading());
      const res = await api.post(
        "/api/v1/user/booking-availbility",
        { doctorId: params.doctorId, date, time },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        setIsAvailable(true);
        message.success(res.data.message || "Slot is available");
      } else {
        message.error(res.data.message || "Slot not available");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
      message.error("Error checking availability");
    }
  };

  // ✅ Book appointment
  const handleBooking = async () => {
    if (!date || !time) return message.warning("Date & Time required");
    try {
      dispatch(showLoading());
      const res = await api.post(
        "/api/v1/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date,
          time,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      dispatch(hideLoading());
      if (res.data.success) {
        message.success(res.data.message || "Appointment booked successfully");
        setIsAvailable(false);
        setDate("");
        setTime(null);
      } else {
        message.error(res.data.message || "Booking failed");
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error(error);
      message.error("Error booking appointment");
    }
  };

  // ✅ Send message to doctor
  const handleSendMessage = async () => {
    if (!messageText) return message.warning("Message cannot be empty");
    try {
      const res = await api.post(
        "/api/v1/message/send",
        {
          to: doctor.userId,
          doctorId: doctor._id,
          text: messageText,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (res.data.success) {
        message.success("Message sent successfully");
        setMessageText("");
        setMessageModalOpen(false);
      } else {
        message.error(res.data.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      message.error("Error sending message");
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Layout>
      <h3>Booking Page</h3>
      <div className="container m-2">
        {doctor && (
          <div>
            <h4>
              Dr. {doctor.firstName} {doctor.lastName}
            </h4>
            <h4>Fees: {doctor.feesPerCunsaltation}</h4>
            <h4>
              Timings: {doctor.timings?.[0]} - {doctor.timings?.[1]}
            </h4>

            <div className="d-flex flex-column w-50">
              <DatePicker
                className="m-2"
                format="DD-MM-YYYY"
                onChange={(value) =>
                  setDate(moment(value).format("DD-MM-YYYY"))
                }
              />
              <TimePicker
                format="HH:mm"
                className="mt-3"
                onChange={(value) => setTime(moment(value).format("HH:mm"))}
              />

              <button
                className="btn btn-primary mt-2"
                onClick={handleAvailability}
              >
                Check Availability
              </button>
              <button className="btn btn-dark mt-2" onClick={handleBooking}>
                Book Now
              </button>
              <button
                className="btn btn-outline-primary mt-2"
                onClick={() => setMessageModalOpen(true)}
              >
                Message Doctor
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        title={`Message Dr. ${doctor?.firstName} ${doctor?.lastName}`}
        open={messageModalOpen}
        onCancel={() => setMessageModalOpen(false)}
        onOk={handleSendMessage}
      >
        <Input.TextArea
          rows={4}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type your message here..."
        />
      </Modal>
    </Layout>
  );
};

export default BookingPage;
