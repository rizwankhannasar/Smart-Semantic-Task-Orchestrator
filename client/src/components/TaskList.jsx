
import TaskCard from "./TaskCard";

function TaskList({ tasks, onDelete, onEdit, onStatusChange }) {
  if (tasks.length === 0) {
    return (
      <p className="empty-message">
        No tasks available. Add your first task!
      </p>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onEdit={onEdit}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}

export default TaskList;
