import express from "express";
import authRouter from "./routes/auth.js";
import dashboardRouter from "./routes/dashboard.js";
import vehiclesRouter from "./routes/vehicles.js";
import healthRouter from "./routes/health.js";

var app = express();

app.use("/api/auth", authRouter);
app.use(express.json());
app.use("/", healthRouter);
app.use("/dashboard", dashboardRouter);
app.use("/vehicles", vehiclesRouter);

export default app;

const port = 3000;

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
}
