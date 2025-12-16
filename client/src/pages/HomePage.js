import React, { useEffect, useState } from "react";
import Layout from "./../components/Layout";
import { Row } from "antd";
import DoctorList from "../components/DoctorList";
import api from "../utils/axiosInstance"; // centralized Axios instance

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);

  // Fetch all doctors
  const getUserData = async () => {
    try {
      const res = await api.get("/api/v1/user/getAllDoctors", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <Layout>
      <div className="page-hero card fade-in">
        <h1 className="text-center">Find the best doctors </h1>
        <p className="text-center muted">
          Search, book and manage appointments easily
        </p>
      </div>
      <div className="section">
        <Row gutter={[16, 16]}>
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <DoctorList key={doctor._id} doctor={doctor} />
            ))
          ) : (
            <p className="text-center muted">No doctors found</p>
          )}
        </Row>
      </div>
    </Layout>
  );
};

export default HomePage;
