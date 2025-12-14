const API_URL = "http://localhost:3000/api";
let token = localStorage.getItem("token");
let currentUser = null;

if (token) {
  loadDashboard();
}

function switchTab(tab) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((t) => t.classList.remove("active"));

  const sections = document.querySelectorAll(".form-section");
  sections.forEach((s) => s.classList.remove("active"));

  if (tab === "login") {
    tabs[0].classList.add("active");
    document.getElementById("login-section").classList.add("active");
  } else {
    tabs[1].classList.add("active");
    document.getElementById("register-section").classList.add("active");
  }

  hideMessage();
}

document
  .getElementById("register-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("register-name").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (data.success) {
        token = data.data.token;
        localStorage.setItem("token", token);
        showMessage("Registration successful!", "success");
        setTimeout(() => loadDashboard(), 1000);
      } else {
        showMessage(data.message || "Registration failed", "error");
      }
    } catch (error) {
      showMessage("Network error. Make sure your server is running!", "error");
    }
  });

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      token = data.data.token;
      localStorage.setItem("token", token);
      showMessage("Login successful!", "success");
      setTimeout(() => loadDashboard(), 1000);
    } else {
      showMessage(data.message || "Login failed", "error");
    }
  } catch (error) {
    showMessage("Network error. Make sure your server is running!", "error");
  }
});

async function loadDashboard() {
  try {
    const userResponse = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const userData = await userResponse.json();

    if (userData.success) {
      currentUser = userData.data;
      document.getElementById("user-name").textContent = currentUser.name;
      document.getElementById("user-email").textContent = currentUser.email;

      document.getElementById("auth-section").style.display = "none";
      document.getElementById("dashboard-section").classList.add("active");

      loadTasks();
    } else {
      logout();
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    logout();
  }
}

async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success) {
      displayTasks(data.data);
    }
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

function displayTasks(tasks) {
  const taskList = document.getElementById("task-list");

  if (tasks.length === 0) {
    taskList.innerHTML =
      '<div class="empty-state">No tasks yet. Add one above!</div>';
    return;
  }

  taskList.innerHTML = tasks
    .map(
      (task) => `
                <div class="task-item ${task.completed ? "completed" : ""}">
                    <span class="task-text">${task.title}</span>
                    <div class="task-actions">
                        ${
                          !task.completed
                            ? `<button class="btn-complete" onclick="toggleTask('${task._id}', true)">✓</button>`
                            : ""
                        }
                        <button class="btn-delete" onclick="deleteTask('${
                          task._id
                        }')">Delete</button>
                    </div>
                </div>
            `
    )
    .join("");
}

async function createTask() {
  const input = document.getElementById("task-input");
  const title = input.value.trim();

  if (!title) return;

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });

    const data = await response.json();

    if (data.success) {
      input.value = "";
      loadTasks();
    }
  } catch (error) {
    console.error("Error creating task:", error);
  }
}

async function toggleTask(id, completed) {
  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed }),
    });

    const data = await response.json();

    if (data.success) {
      loadTasks();
    }
  } catch (error) {
    console.error("Error updating task:", error);
  }
}

async function deleteTask(id) {
  if (!confirm("Delete this task?")) return;

  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success) {
      loadTasks();
    }
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

function logout() {
  localStorage.removeItem("token");
  token = null;
  currentUser = null;
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("dashboard-section").classList.remove("active");
  document.getElementById("login-form").reset();
  document.getElementById("register-form").reset();
}

function showMessage(text, type) {
  const message = document.getElementById("auth-message");
  message.textContent = text;
  message.className = `message ${type} show`;
}

function hideMessage() {
  document.getElementById("auth-message").classList.remove("show");
}

document.getElementById("task-input").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    createTask();
  }
});
