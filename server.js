const express = require("express");

const app = express();

app.use(express.json());

let tasks = [
  { id: 1, title: "Task 1", completed: false },
  { id: 2, title: "Task 2", completed: false },
  { id: 3, title: "Task 3", completed: false },
];

let nextId = 4;

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Task API!",
    endpoints: {
      "GET /tasks": "Get all tasks",
      "GET /tasks/:id": "Get one task",
      "POST /tasks": "Create new task",
      "PUT /tasks/:id": "Update task",
      "DELETE /tasks/:id": "Delete task",
    },
  });
});

app.get("/tasks", (req, res) => {
  res.json({
    success: true,
    count: tasks.length,
    data: tasks,
  });
});

app.get("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === id);

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
});

app.post("/tasks", (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Task title is required",
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    completed: false,
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: newTask,
  });
});

app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { title, completed } = req.body;

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  if (title !== undefined) {
    task.title = title.trim();
  }
  if (completed !== undefined) {
    task.completed = completed;
  }

  res.json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
});

app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Task not found",
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];

  res.json({
    success: true,
    message: "Task deleted successfully",
    data: deletedTask,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Try: http://localhost:${PORT}/tasks`);
});
