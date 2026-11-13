
import { extractTasks } from "../services/aiService.js";

export const processTasks = async (req, res) => {
  try {
    const { input, clarification } = req.body;

    if (!input || !input.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your tasks."
      });
    }

    const result = await extractTasks(
      input.trim(),
      clarification?.trim() || ""
    );

    return res.status(200).json({
      success: true,
      message: "AI task extraction successful!",
      result
    });

  } catch (error) {
    console.error("AI Error:", error);

    return res.status(500).json({
      success: false,
      message: "AI task extraction failed.",
      error: error.message
    });
  }
};
