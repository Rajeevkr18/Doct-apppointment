const express = require("express");
const colors = require("colors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const cors = require("cors"); // ✅ import cors
const connectDB = require("./config/db");

//dotenv config
dotenv.config();

//mongodb connection
connectDB();

//rest object
const app = express();

//middlewares
app.use(express.json());
app.use(morgan("dev"));

// ✅ Enable CORS for local development
app.use(cors({
  origin: "http://localhost:3000", // your React frontend
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));

// ✅ Handle preflight requests
app.options("*", cors());

//routes
app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));
app.use("/api/v1/doctor", require("./routes/doctorRoutes"));
app.use("/api/v1/message", require("./routes/messageRoutes"));
app.use("/api/v1/prescription", require("./routes/prescriptionRoutes"));
app.use("/api/v1/documents", require("./routes/documentRoutes"));
app.use("/api/v1/health", require("./routes/healthRoutes"));
app.use("/api/v1/analytics", require("./routes/analyticsRoutes"));

//port
const port = process.env.PORT || 8080;
const nodeEnv = process.env.NODE_ENV || process.env.NODE_MODE || "development";

//listen port
app.listen(port, () => {
  console.log(
    `Server Running in ${nodeEnv} Mode on port ${port}`.bgCyan.white
  );
});
