const fs = require("fs").promises;
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/tasks.json");

async function readTasks() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading tasks:", error.message);
    return [];
  }
}

async function writeTasks(tasks) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error writing tasks:", error.message);
    return false;
  }
}

module.exports = { readTasks, writeTasks };
