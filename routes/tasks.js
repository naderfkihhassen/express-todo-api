const express = require("express");
const Task = require("../models/Task");
const { protect } = require("../middleware/auth");
const { body, param, validationResult } = require("express-validator");

const router = express.Router();

router.use(protect);

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching tasks",
      error: error.message,
    });
  }
});

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid task ID"),
  checkValidation,
  async (req, res) => {
    try {
      const task = await Task.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.json({
        success: true,
        data: task,
      });
    } catch (error) {
      console.error("Get task error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching task",
        error: error.message,
      });
    }
  }
);

router.post(
  "/",
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters")
    .isLength({ max: 100 })
    .withMessage("Title must be less than 100 characters"),
  checkValidation,
  async (req, res) => {
    try {
      const { title, completed = false } = req.body;

      const task = await Task.create({
        title,
        completed,
        user: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      console.error("Create task error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating task",
        error: error.message,
      });
    }
  }
);

router.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters"),
  checkValidation,
  async (req, res) => {
    try {
      const { title, completed } = req.body;

      const task = await Task.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      if (title !== undefined) task.title = title;
      if (completed !== undefined) task.completed = completed;

      await task.save();

      res.json({
        success: true,
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      console.error("Update task error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating task",
        error: error.message,
      });
    }
  }
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid task ID"),
  checkValidation,
  async (req, res) => {
    try {
      const task = await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }

      res.json({
        success: true,
        message: "Task deleted successfully",
        data: task,
      });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting task",
        error: error.message,
      });
    }
  }
);

module.exports = router;
