
function TaskCard({ task, onDelete, onEdit, onStatusChange }) {
  const isCompleted = task.status === "completed";

  return (
    <div className={`task-card ${isCompleted ? "completed-task" : ""}`}>
      <div>
        <h3>{task.title}</h3>

        <p>
          Priority: <strong>{task.priority}</strong>
        </p>

        <p>
          Deadline:{" "}
          {task.deadline
            ? new Date(task.deadline).toLocaleString()
            : "Not set"}
        </p>

        <p>
          Status:{" "}
          <strong>{isCompleted ? "Completed" : "Pending"}</strong>
        </p>

        <button
          onClick={() =>
            onStatusChange(
              task.id,
              isCompleted ? "pending" : "completed"
            )
          }
        >
          {isCompleted ? "Mark as Pending" : "Mark as Completed"}
        </button>
      </div>

      <div className="task-actions">
        <button onClick={() => onEdit(task)}>
          Edit
        </button>

        <button
          className="delete-btn"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskCard;
