import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faRobot,
  faDownload,
  faTimes,
  faSpinner,
  faExpand,
  faCopy,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./Message.css";
import moment from "moment";
import Markdown from "react-markdown";
import prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import toast from "react-hot-toast";

export default function Message({ message }) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    prism.highlightAll();
  }, [message.content]);

  const handleImageClick = () => {
    setShowImageModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowImageModal(false);
    document.body.style.overflow = "unset";
  };

  const downloadImage = async (imageUrl) => {
    try {
      setDownloading(true);
      const loadingToast = toast.loading("Downloading image...");

      const response = await fetch(imageUrl);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-image-${Date.now()}.jpg`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard!");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Failed to copy text");
    }
  };

  return (
    <>
      <div
        className={`message-wrapper ${message.role === "user" ? "user-message-wrapper" : "ai-message-wrapper"}`}
      >
        {message.role === "user" ? (
          <div className="message-container user-message">
            <div className="message-content">
              <p className="message-text">{message.content}</p>
              <span className="message-time">
                {moment(message.timestamp).fromNow()}
              </span>
            </div>
            <div className="message-avatar user-avatar-message">
              <FontAwesomeIcon icon={faUser} className="avatar-icon" />
            </div>
          </div>
        ) : (
          <div className="message-container ai-message">
            <div className="message-avatar ai-avatar-message">
              <FontAwesomeIcon icon={faRobot} className="avatar-icon" />
            </div>
            <div className="message-content">
              {message.isImage ? (
                <div className="image-container">
                  <img
                    src={message.content}
                    className="message-image"
                    alt="AI generated"
                    onClick={handleImageClick}
                  />
                  <button
                    className="image-expand-btn"
                    onClick={handleImageClick}
                    title="View full image"
                  >
                    <FontAwesomeIcon icon={faExpand} />
                  </button>
                </div>
              ) : (
                <div className="markdown-container">
                  <button
                    className={`copy-button ${copied ? "copied" : ""}`}
                    onClick={() => copyToClipboard(message.content)}
                    title="Copy to clipboard"
                  >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                  </button>
                  <div className="markdown-content">
                    <Markdown>{message.content}</Markdown>
                  </div>
                </div>
              )}
              <span className="message-time">
                {moment(message.timestamp).fromNow()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && message.isImage && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="image-modal-header">
              <h3 className="image-modal-title">
                <FontAwesomeIcon icon={faRobot} /> AI Generated Image
              </h3>
              <div className="image-modal-actions">
                <button
                  className="image-modal-download-btn"
                  onClick={() => downloadImage(message.content)}
                  disabled={downloading}
                >
                  <FontAwesomeIcon
                    icon={downloading ? faSpinner : faDownload}
                    spin={downloading}
                  />
                  {downloading ? " Downloading..." : " Download"}
                </button>
                <button className="image-modal-close-btn" onClick={closeModal}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            <div className="image-modal-body">
              <img
                src={message.content}
                alt="AI generated full size"
                className="image-modal-img"
              />
            </div>
            <div className="image-modal-footer">
              <p className="image-modal-time">
                Generated{" "}
                {moment(message.timestamp).format("MMMM Do YYYY, h:mm:ss a")}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
