require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.json({
    message: "Task API",
    version: "3.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/me": "Get current user (protected)",
      },
      tasks: {
        "GET /api/tasks": "Get all tasks (protected)",
        "GET /api/tasks/:id": "Get one task (protected)",
        "POST /api/tasks": "Create task (protected)",
        "PUT /api/tasks/:id": "Update task (protected)",
        "DELETE /api/tasks/:id": "Delete task (protected)",
      },
    },
  });
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/`);
  console.log(`Authentication enabled with JWT`);
  console.log(`Database: MongoDB Atlas`);
  console.log("=".repeat(60));
});
