
import { useState } from "react";
import { extractTasks } from "../services/taskService";
import { Sparkles, BrainCircuit, Send, MessageCircleQuestion } from "lucide-react";

function AIInput({ onTasksExtracted }) {
  const [input, setInput] = useState("");
  const [originalInput, setOriginalInput] = useState("");
  const [clarification, setClarification] = useState("");
  const [needsClarification, setNeedsClarification] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExtract = async () => {
    if (!input.trim()) {
      setError("Please enter your tasks.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await extractTasks(input.trim());
      onTasksExtracted(result);

      if (result.needsClarification) {
        setOriginalInput(input.trim());
        setQuestion(result.clarificationQuestion);
        setNeedsClarification(true);
      } else {
        setInput("");
        setNeedsClarification(false);
        setQuestion("");
        setOriginalInput("");
      }
    } catch (error) {
      console.error("AI extraction error:", error);
      setError(
        error.response?.data?.message ||
        "Unable to extract tasks. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClarification = async () => {
    if (!clarification.trim()) {
      setError("Please answer the clarification question.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result = await extractTasks(
        originalInput,
        clarification.trim()
      );

      onTasksExtracted(result);

      if (result.needsClarification) {
        setQuestion(result.clarificationQuestion);
        setClarification("");
      } else {
        setNeedsClarification(false);
        setQuestion("");
        setClarification("");
        setInput("");
        setOriginalInput("");
      }
    } catch (error) {
      console.error("Clarification error:", error);
      setError(
        error.response?.data?.message ||
        "Unable to process your answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-input">
      <div className="ai-header">
        <div className="ai-icon">
          <BrainCircuit size={25} />
        </div>

        <div>
          <h2>AI Task Assistant</h2>
          <p>Turn your thoughts into organized tasks with AI.</p>
        </div>

        <span className="ai-badge">
          <Sparkles size={13} /> AI Powered
        </span>
      </div>

      {!needsClarification && (
        <div className="ai-form">
          <label>Describe your tasks</label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Example: Tomorrow at 9 AM prepare client presentation, email Saleem, and pay electricity bill..."
            rows="5"
          />

          <div className="ai-form-footer">
            <span>Write naturally. AI will identify separate tasks.</span>

            <button onClick={handleExtract} disabled={loading}>
              {loading ? (
                "AI is processing..."
              ) : (
                <>
                  <Sparkles size={17} />
                  Extract Tasks
                  <Send size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {needsClarification && (
        <div className="clarification-box">
          <div className="clarification-heading">
            <MessageCircleQuestion size={23} />
            <div>
              <h3>AI Needs More Information</h3>
              <p>Please clarify the following detail.</p>
            </div>
          </div>

          <div className="ai-question">
            {question}
          </div>

          <textarea
            value={clarification}
            onChange={(e) => setClarification(e.target.value)}
            placeholder="Enter your answer..."
            rows="3"
          />

          <button onClick={handleClarification} disabled={loading}>
            {loading ? "AI is processing..." : "Submit Answer"}
          </button>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  );
}

export default AIInput;
