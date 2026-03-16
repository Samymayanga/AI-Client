import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faArrowRight,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import "./Auth.css";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // FIXED: Get handleLoginSuccess from context
  const { axios, handleLoginSuccess } = useAppContext();

  // Password validation
  const isPasswordStrong = password.length >= 6;
  const doPasswordsMatch = password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!isLogin) {
      if (!name || !email || !password || !confirmPassword) {
        toast.error("Please fill all fields");
        setLoading(false);
        return;
      }
      if (!isPasswordStrong) {
        toast.error("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      if (!doPasswordsMatch) {
        toast.error("Passwords do not match");
        setLoading(false);
        return;
      }
    } else {
      if (!email || !password) {
        toast.error("Please fill all fields");
        setLoading(false);
        return;
      }
    }

    // Correct URLs based on your backend routing
    const url = isLogin ? "/srg-ai/login" : "/srg-ai/register";

    // Request body - only include name for registration
    const requestBody = isLogin
      ? { email, password }
      : { name, email, password };

    try {
      const { data } = await axios.post(url, requestBody);

      if (data.success) {
        // FIXED: Use handleLoginSuccess instead of manual token setting
        handleLoginSuccess(data.token, data.user);

        toast.success(data.message);

        // Navigate to home page
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    // Reset all form fields when toggling
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="auth-container">
      {/* Decorative Elements */}
      <div className="auth-decoration">
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>
        <div className="decoration-circle"></div>
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <FontAwesomeIcon icon={faRobot} className="logo-icon" />
          <span className="logo-text">SRG AI</span>
        </div>

        <h2 className="auth-title">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>
        <p className="auth-subtitle">
          {isLogin
            ? "Sign in to continue your journey"
            : "Join the SRG AI community"}
        </p>

        {/* Toggle Buttons */}
        <div className="auth-toggle">
          <button
            type="button"
            className={`toggle-btn ${isLogin ? "active" : ""}`}
            onClick={() => toggleMode()}
          >
            Login
          </button>
          <button
            type="button"
            className={`toggle-btn ${!isLogin ? "active" : ""}`}
            onClick={() => toggleMode()}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name field - only for signup */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                <FontAwesomeIcon icon={faUser} className="label-icon" />
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                placeholder="Your full names"
                required={!isLogin}
                disabled={loading}
              />
            </div>
          )}

          {/* Email field - for both */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FontAwesomeIcon icon={faEnvelope} className="label-icon" />
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          {/* Password field - for both */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FontAwesomeIcon icon={faLock} className="label-icon" />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input password-input"
                placeholder="••••••••"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {/* Password strength indicator - only for signup */}
            {!isLogin && password && (
              <div className="password-strength">
                <span
                  className={`strength-indicator ${isPasswordStrong ? "valid" : "invalid"}`}
                >
                  {isPasswordStrong ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} /> Strong password
                    </>
                  ) : (
                    "At least 6 characters"
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password field - only for signup */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <FontAwesomeIcon icon={faLock} className="label-icon" />
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input password-input"
                  placeholder="••••••••"
                  required={!isLogin}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <FontAwesomeIcon
                    icon={showConfirmPassword ? faEyeSlash : faEye}
                  />
                </button>
              </div>
              {confirmPassword && (
                <div className="password-match">
                  <span
                    className={`match-indicator ${doPasswordsMatch ? "valid" : "invalid"}`}
                  >
                    {doPasswordsMatch ? (
                      <>
                        <FontAwesomeIcon icon={faCheck} /> Passwords match
                      </>
                    ) : (
                      "Passwords do not match"
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-button"
            disabled={loading || (!isLogin && password && !doPasswordsMatch)}
          >
            {loading ? (
              <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <FontAwesomeIcon icon={faArrowRight} className="button-icon" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Link */}
        <p className="auth-footer">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={toggleMode}
            className="auth-link"
            disabled={loading}
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
