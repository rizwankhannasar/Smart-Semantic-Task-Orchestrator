
import { useEffect, useState, useCallback } from "react";

import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import AIInput from "../components/AIInput";

import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask
} from "../services/taskService";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [aiResult, setAiResult] = useState(null);
  const [editableTasks, setEditableTasks] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);

  // Search, filter and sorting states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      const data = await getTasks();
      setTasks(data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Task statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const progress = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Search, filter and sorting logic
  const filteredTasks = tasks
    .filter((task) =>
      task.title.toLowerCase().includes(search.toLowerCase())
    )
    .filter((task) =>
      statusFilter === "all" || task.status === statusFilter
    )
    .filter((task) =>
      priorityFilter === "all" || task.priority === priorityFilter
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      }

      if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      if (sortBy === "priority") {
        const priorityOrder = {
          high: 3,
          medium: 2,
          low: 1
        };

        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }

      if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;

        return new Date(a.deadline) - new Date(b.deadline);
      }

      return 0;
    });

  // Add task
  const handleAddTask = async (taskData) => {
    try {
      await createTask(taskData);
      await fetchTasks();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to create task."
      );
    }
  };

  // Save AI tasks
  const handleSaveAITasks = async () => {
    if (selectedTasks.length === 0) {
      alert("Please select at least one task.");
      return;
    }

    try {
      for (const index of selectedTasks) {
        const task = editableTasks[index];

        if (!task.title.trim()) {
          alert("Task title cannot be empty.");
          return;
        }

        await createTask({
          title: task.title.trim(),
          priority: task.priority,
          deadline: task.deadline || null
        });
      }

      alert("Selected tasks saved successfully!");

      setSelectedTasks([]);
      setEditableTasks([]);
      setAiResult(null);

      await fetchTasks();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to save tasks."
      );
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await deleteTask(id);
      await fetchTasks();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to delete task."
      );
    }
  };

  // Edit task
  const handleEditTask = async (task) => {
    const title = window.prompt("Update task title:", task.title);

    if (title === null || !title.trim()) return;

    try {
      await updateTask(task.id, {
        title: title.trim(),
        priority: task.priority,
        deadline: task.deadline
      });

      await fetchTasks();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to update task."
      );
    }
  };

  // Update task status
  const handleStatusChange = async (id, status) => {
    try {
      await updateTaskStatus(id, status);
      await fetchTasks();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Failed to update task status."
      );
    }
  };

  return (
    <main className="dashboard">

      <header className="dashboard-header">
        <h1>Smart Task Orchestrator</h1>
        <p>Organize your tasks intelligently.</p>
      </header>

      {/* Task Statistics */}
      <section className="dashboard-section">
        <h2>Task Overview</h2>

        <div className="task-stats">
          <div className="stat-card">
            <h3>Total Tasks</h3>
            <p>{totalTasks}</p>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>
            <p>{completedTasks}</p>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <p>{pendingTasks}</p>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-info">
            <h3>Overall Progress</h3>
            <strong>{progress}%</strong>
          </div>

          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p>
            {completedTasks} of {totalTasks} tasks completed.
          </p>
        </div>
      </section>

      {/* Create Task */}
      <section className="dashboard-section">
        <h2>Create New Task</h2>
        <TaskForm onAddTask={handleAddTask} />
      </section>

      {/* AI Assistant */}
      <AIInput
        onTasksExtracted={(result) => {
          setAiResult(result);
          setEditableTasks(result.tasks);
          setSelectedTasks(
            result.tasks.map((_, index) => index)
          );
        }}
      />

      {/* AI Task Preview */}
      {aiResult && (
        <div className="ai-preview">
          <h2>AI Extracted Tasks</h2>

          {aiResult.needsClarification && (
            <p className="error-message">
              {aiResult.clarificationQuestion}
            </p>
          )}

          {editableTasks.map((task, index) => (
            <div className="task-card" key={index}>
              <input
                type="checkbox"
                checked={selectedTasks.includes(index)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedTasks([
                      ...selectedTasks,
                      index
                    ]);
                  } else {
                    setSelectedTasks(
                      selectedTasks.filter((i) => i !== index)
                    );
                  }
                }}
              />

              <h3>Task {index + 1}</h3>

              <input
                type="text"
                value={task.title}
                onChange={(e) => {
                  const updated = [...editableTasks];
                  updated[index] = {
                    ...updated[index],
                    title: e.target.value
                  };
                  setEditableTasks(updated);
                }}
              />

              <label>Priority</label>

              <select
                value={task.priority}
                onChange={(e) => {
                  const updated = [...editableTasks];
                  updated[index] = {
                    ...updated[index],
                    priority: e.target.value
                  };
                  setEditableTasks(updated);
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <label>Deadline</label>

              <input
                type="datetime-local"
                value={
                  task.deadline
                    ? new Date(task.deadline).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => {
                  const updated = [...editableTasks];
                  updated[index] = {
                    ...updated[index],
                    deadline: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : ""
                  };
                  setEditableTasks(updated);
                }}
              />
            </div>
          ))}

          {!aiResult.needsClarification &&
            editableTasks.length > 0 && (
              <button
                onClick={handleSaveAITasks}
                disabled={selectedTasks.length === 0}
              >
                Confirm & Save ({selectedTasks.length})
              </button>
            )}
        </div>
      )}

      {/* Task List */}
      <section className="dashboard-section">
        <h2>Your Tasks ({filteredTasks.length})</h2>

        {/* Search */}
        <div className="task-controls">
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Highest Priority</option>
            <option value="deadline">Nearest Deadline</option>
          </select>
        </div>

        {loading ? (
          <p>Loading tasks...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty-message">
            No matching tasks found.
          </p>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onDelete={handleDeleteTask}
            onEdit={handleEditTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </section>

    </main>
  );
}

export default Dashboard;
