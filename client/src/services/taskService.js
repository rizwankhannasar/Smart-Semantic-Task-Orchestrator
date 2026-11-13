import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Get all tasks
export const getTasks = async () => {
  const response = await API.get("/tasks");
  return response.data.tasks;
};

// Create a task
export const createTask = async (taskData) => {
  const response = await API.post("/tasks", taskData);
  return response.data;
};

// Update a task
export const updateTask = async (id, taskData) => {
  const response = await API.put(`/tasks/${id}`, taskData);
  return response.data;
};

// Delete a task
export const deleteTask = async (id) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};

export const extractTasks = async (input, clarification = "") => {
  const response = await API.post("/ai/extract", {
    input,
    clarification
  });

  return response.data.result;
};

export const updateTaskStatus = async (id, status) => {
  const response = await API.patch(`/tasks/${id}/status`, {
    status
  });

  return response.data;
};