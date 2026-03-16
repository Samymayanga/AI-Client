import { useEffect, useRef, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import Message from "../message/Message";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import me from "./../../images/me.png";
import {
  faRobot,
  faPaperPlane,
  faStop,
  faImage,
  faTextHeight,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import "./Chatbox.css";
import toast from "react-hot-toast";

export default function Chatbox() {
  const { theme, selectedChat, axios, user, token, setUser } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isPublished, setIsPublished] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const modeMenuRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages);
    }
  }, [selectedChat]);

  const containerRef = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      return toast.error("Login to send message");
    }

    if (!selectedChat?._id) {
      return toast.error("Please select or create a chat first");
    }

    if (!prompt.trim()) return;

    setLoading(true);
    const promptCopy = prompt;
    setPrompt("");

    const userMessage = {
      role: "user",
      content: promptCopy,
      timestamp: Date.now(),
      isImage: false,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      console.log("Sending request with:", {
        url: `/srg-ai/message/${mode}`,
        data: { chatId: selectedChat._id, prompt: promptCopy, isPublished },
        token: token ? "exists" : "missing",
      });

      const response = await axios.post(
        `/srg-ai/message/${mode}`,
        {
          chatId: selectedChat._id,
          prompt: promptCopy,
          isPublished,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      console.log("Full response:", response);
      console.log("Response data:", response.data);

      if (response.data?.success) {
        if (response.data?.reply) {
          setMessages((prev) => [...prev, response.data.reply]);
        } else {
          console.error("Reply missing from response:", response.data);
          toast.error("Invalid response format from server");
        }
      } else {
        toast.error(response.data?.message || "Request failed");
        setMessages((prev) => prev.filter((msg) => msg.content !== promptCopy));
        setPrompt(promptCopy);
      }
    } catch (error) {
      console.error("Full error object:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config,
      });

      // Better error message extraction
      let errorMessage = "Something went wrong";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setMessages((prev) => prev.filter((msg) => msg.content !== promptCopy));
      setPrompt(promptCopy);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // Close mode menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(event.target)) {
        setShowModeMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="chatbox">
      {/* Chat messages area */}
      <div className="messages-area" ref={containerRef}>
        {messages.length === 0 && (
          <div className="welcome-screen">
            <div className="welcome-content">
              <div className="welcome-icon-wrapper">
                <FontAwesomeIcon icon={faRobot} className="welcome-icon" />
              </div>
              <h1 className="welcome-title">SRG AI</h1>
              <div className="welcome-image-container">
                <img
                  className="welcome-image"
                  src={me}
                  alt="SRG AI Assistant"
                />
              </div>
              <p className="welcome-subtitle">Ask me anything...</p>
              <div className="welcome-features">
                <span className="feature-badge">Chat</span>
                <span className="feature-badge">Generate Images</span>
                <span className="feature-badge">AI Powered</span>
              </div>
            </div>
          </div>
        )}

        <div className="messages-list">
          {messages.map((message, index) => (
            <Message key={index} message={message} />
          ))}
        </div>

        {/* Three dots loading animation */}
        {loading && (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
      {/* Image publish toggle - only shows in image mode
      {mode === "image" && (
        <div className="publish-row">
          <label className="publish-label">
            <span className="publish-text">Publish to community</span>
            <input
              type="checkbox"
              className="publish-checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
            />
          </label>
        </div>
      )} */}
      {/* Prompt input form */}
      <form onSubmit={onSubmit} className="prompt-form">
        <div className="input-container">
          {/* Mode selector chip */}
          <div className="mode-chip-container" ref={modeMenuRef}>
            <button
              type="button"
              className={`mode-chip ${mode === "image" ? "image-mode" : "text-mode"}`}
              onClick={() => setShowModeMenu(!showModeMenu)}
            >
              <FontAwesomeIcon
                icon={mode === "text" ? faTextHeight : faImage}
                className="chip-icon"
              />
              <span className="chip-text">
                {mode === "text" ? "Text" : "Image"}
              </span>
              <FontAwesomeIcon icon={faChevronDown} className="chip-arrow" />
            </button>

            {/* Mode dropdown menu */}
            {showModeMenu && (
              <div className="mode-dropdown">
                <button
                  type="button"
                  className={`mode-option-btn ${mode === "text" ? "active" : ""}`}
                  onClick={() => {
                    setMode("text");
                    setShowModeMenu(false);
                  }}
                >
                  <FontAwesomeIcon
                    icon={faTextHeight}
                    className="option-icon"
                  />
                  <span className="option-text">Text Mode</span>
                  <span className="option-desc">Chat and generate text</span>
                </button>
                <button
                  type="button"
                  className={`mode-option-btn ${mode === "image" ? "active" : ""}`}
                  onClick={() => {
                    setMode("image");
                    setShowModeMenu(false);
                  }}
                >
                  <FontAwesomeIcon icon={faImage} className="option-icon" />
                  <span className="option-text">Image Mode</span>
                  <span className="option-desc">
                    Generate images from prompts
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Input wrapper */}
          <div className="input-wrapper">
            <input
              className="prompt-input"
              type="text"
              placeholder={
                mode === "text"
                  ? "Type your message..."
                  : "Describe the image you want..."
              }
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className={`send-btn ${loading ? "stopping" : ""}`}
            >
              {loading ? (
                <FontAwesomeIcon icon={faStop} className="stop-icon" />
              ) : (
                <FontAwesomeIcon icon={faPaperPlane} className="send-icon" />
              )}
            </button>
          </div>
        </div>

        {/* Mode hint - subtle indicator */}
        <div className="mode-hint">
          <span className="hint-text">
            {mode === "text" ? "Text generation" : "Image generation"}
          </span>
        </div>
      </form>
    </div>
  );
}
