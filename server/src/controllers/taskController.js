
import supabase from "../config/supabase.js";

// Create a task
export const createTask = async (req, res) => {
  try {
    const { title, priority, deadline } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Task title is required"
      });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([{
        title: title.trim(),
        priority: priority || "medium",
        deadline: deadline || null,
        status: "pending"
      }])
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: "Task created successfully!",
      task: data[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Fetch all tasks
export const getTasks = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(200).json({
      success: true,
      tasks: data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, priority, deadline } = req.body;

    const { data, error } = await supabase
      .from("tasks")
      .update({ title, priority, deadline })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully!",
      task: data[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update task completion status
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be pending or completed."
      });
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Task status updated successfully!",
      task: data[0]
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (!data.length) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully!"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
