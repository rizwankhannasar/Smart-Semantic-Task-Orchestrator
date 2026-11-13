import { useState } from "react";

function TaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    await onAddTask({
      title: title.trim(),
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : null
    });

    setTitle("");
    setPriority("medium");
    setDeadline("");
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter your task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>

      <input
        type="datetime-local"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
      />

      <button type="submit">Add Task</button>
    </form>
  );
}

export default TaskForm;