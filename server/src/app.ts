import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";

import authRoutes from "./routes/auth";
import billboardRoutes from "./routes/billboards";
import campaignRoutes from "./routes/campaigns";
import bidRoutes from "./routes/bids";
import bookingRoutes from "./routes/bookings";
import messageRoutes from "./routes/messages";
import invoiceRoutes from "./routes/invoices";

const app = express();

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "..", process.env.UPLOAD_DIR || "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/billboards", billboardRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/invoices", invoiceRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../skyhigh-ads/dist");

  // Serve static files
  app.use(express.static(frontendPath));

  // Send all non-API requests to index.html (React Router)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

}


export default app;
