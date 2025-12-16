import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../utils/axiosInstance"; // ✅ use centralized api
import { useSelector, useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    const getUser = async () => {
      try {
        dispatch(showLoading());
        const res = await api.post(
          "/api/v1/user/getUserData",
          { token: localStorage.getItem("token") },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        dispatch(hideLoading());
        if (res.data.success) {
          dispatch(setUser(res.data.data));
        } else {
          localStorage.clear();
        }
      } catch (error) {
        console.log(error);
        localStorage.clear();
        dispatch(hideLoading());
      }
    };

    if (!user && localStorage.getItem("token")) {
      getUser();
    }
  }, [dispatch, user]);

  // If token exists and user is loaded, render children, otherwise redirect
  if (localStorage.getItem("token")) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
