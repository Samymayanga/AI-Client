import { useNavigate } from "react-router-dom";
import "./Loading.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faCircleNotch,
  faMagic,
} from "@fortawesome/free-solid-svg-icons";

export default function Loading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing SRG AI...");

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 80); // 80ms * 100 = 8000ms (8 seconds)

    // Loading text changes
    const textSequence = [
      "Initializing SRG AI...",
      "Loading neural networks...",
      "Warming up processors...",
      "Almost ready...",
      "Welcome to SRG AI!",
    ];

    let textIndex = 0;
    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % textSequence.length;
      setLoadingText(textSequence[textIndex]);
    }, 1600); // Change text every 1.6 seconds

    // Navigation timeout
    const timeOut = setTimeout(() => {
      navigate("/");
    }, 8000);

    return () => {
      clearTimeout(timeOut);
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [navigate]);

  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* Logo with animation */}
        <div className="logo-wrapper">
          <div className="logo-ring">
            <div className="ring"></div>
          </div>
          <div className="logo-icon-wrapper">
            <FontAwesomeIcon icon={faRobot} className="logo-icon" />
          </div>
        </div>

        {/* Brand name */}
        <h1 className="brand-name">
          <span className="brand-srg">SRG</span>{" "}
          <span className="brand-ai">AI</span>
        </h1>

        {/* Loading text with magic icon */}
        <div className="loading-message">
          <FontAwesomeIcon icon={faMagic} className="magic-icon" />
          <p className="loading-text">{loadingText}</p>
        </div>

        {/* Progress bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}>
              <div className="progress-glow"></div>
            </div>
          </div>
          <span className="progress-percentage">{progress}%</span>
        </div>

        {/* Loading spinner and tips */}
        <div className="loading-footer">
          <div className="spinner-container">
            <FontAwesomeIcon icon={faCircleNotch} className="spinner" />
          </div>
          <p className="tip-text">
            "Your intelligent assistant, ready in a moment"
          </p>
        </div>
      </div>
    </div>
  );
}
