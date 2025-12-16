const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");
//register callback
const registerController = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    if (exisitingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Register Sucessfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invlid EMail or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// APpply DOctor CTRL
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    // If an admin user exists, push notification; otherwise skip notification but keep doctor saved
    if (adminUser) {
      const notifcation = adminUser.notifcation || [];
      notifcation.push({
        type: "apply-doctor-request",
        message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
        data: {
          doctorId: newDoctor._id,
          name: newDoctor.firstName + " " + newDoctor.lastName,
          onClickPath: "/admin/docotrs",
        },
      });
      await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
    } else {
      console.warn("No admin user found — doctor application saved but admin was not notified.");
    }
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error WHile Applying For Doctotr",
    });
  }
};

//notification ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    user.notifcation = user.notifcation || [];
    user.seennotification = user.seennotification || [];
    // move all notifications to seen
    user.seennotification.push(...user.notifcation);
    user.notifcation = [];
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

// delete notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

//GET ALL DOC
const getAllDocotrsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Docots Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Errro WHile Fetching DOcotr",
    });
  }
};

//BOOK APPOINTMENT
 // BOOK APPOINTMENT
const bookeAppointmnetController = async (req, res) => {
  try {
    // ✅ 1️⃣ Destructure required fields from the request body
    const { doctorId, userId, doctorInfo, userInfo, date, time } = req.body;

    // ✅ 2️⃣ Add a safety validation layer
    if (!doctorId || !userId || !doctorInfo || !userInfo) {
      return res.status(400).send({
        success: false,
        message: "Missing required fields (doctorId, userId, doctorInfo, userInfo)",
      });
    }

    // ✅ 3️⃣ Normalize date/time
    const dateISO = moment(date, "DD-MM-YYYY").toISOString();
    const timeISO = moment(time, "HH:mm").toISOString();

    // ✅ 4️⃣ Save doctorInfo & userInfo to the appointment model
    const newAppointment = new appointmentModel({
      doctorId,
      userId,
      doctorInfo,   // ✅ newly added
      userInfo,     // ✅ newly added
      date: dateISO,
      time: timeISO,
      status: "pending",
    });

    await newAppointment.save();

    // ✅ 5️⃣ Notify the doctor
    const doctor = await doctorModel.findById(doctorId);
    if (doctor) {
      doctor.notifications = doctor.notifications || [];
      doctor.notifications.push({
        type: "New Appointment Request",
        message: `You have a new appointment request from ${userInfo.name || userInfo.firstName}`,
        onClickPath: "/doctor/appointments",
      });
      await doctor.save();
    }

    // ✅ 6️⃣ Return success response
    res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
      data: newAppointment,
    });
  } catch (error) {
    console.error("❌ Error in bookeAppointmnetController:", error);
    res.status(500).send({
      success: false,
      message: "Error While Booking Appointment",
      error: error.message,
    });
  }
};

// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Availibale at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};

// Update regular user profile
const updateUserProfileController = async (req, res) => {
  try {
    const { userId, name, email, phone } = req.body;
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).send({ success: false, message: "User not found" });

    // update allowed fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    const updatedUser = await user.save();
    // Ensure createdAt exists for older records
    if (!updatedUser.createdAt) {
      updatedUser.createdAt = Date.now();
      await updatedUser.save();
    }

    // Fetch fresh user object and remove sensitive data
    const fresh = await userModel.findById(userId).lean();
    if (fresh) delete fresh.password;
    res.status(200).send({ success: true, message: "Profile updated successfully", data: fresh });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error updating profile", error });
  }
};

module.exports = {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
  updateUserProfileController,
};
