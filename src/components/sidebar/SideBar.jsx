import { useState } from "react";
import { useAppContext } from "../../context/AppContext";
import moment from "moment";
import Swal from "sweetalert2";
import "./SideBar.css";
import { Link, useNavigate } from "react-router-dom";

// Font Awesome React imports
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faPlusCircle,
  faSearch,
  faTimes,
  faHistory,
  faCommentDots,
  faClock,
  faTrashAlt,
  faImages,
  faChevronRight,
  faSun,
  faMoon,
  faUserCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faClock as farClock } from "@fortawesome/free-regular-svg-icons";
import toast from "react-hot-toast";

export default function SideBar() {
  const {
    user,
    chats,
    selectedChat,
    theme,
    setTheme,
    axios,
    createNewChat,
    setSelectedChat,
    setChats,
    fetchUsersChats,
    setToken,
    token,
  } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const filteredChats = chats.filter((chat) => {
    if (!chat) return false;
    const searchLower = searchTerm.toLowerCase();
    const messageContent = chat.messages?.[0]?.content || "";
    const chatName = chat.name || "";
    return (
      messageContent.toLowerCase().includes(searchLower) ||
      chatName.toLowerCase().includes(searchLower)
    );
  });

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    toast.success("Logged out successfully");
  };

  const deleteChat = async (e, chatId) => {
    e.stopPropagation();

    // Simple confirm with toast
    if (!window.confirm("Delete this chat?")) return;

    try {
      const { data } = await axios.post(
        "/srg-ai/chat/delete-chat",
        { chatId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success) {
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));
        toast.success("Chat deleted");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  // NEW: Handle chat selection
  const handleChatSelect = (chat) => {
    setSelectedChat(chat); // Select the chat
    navigate("/"); // Navigate to home page
    setIsMobileOpen(false); // Close mobile sidebar
  };

  // In your sidebar component
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <div className={`hamburger ${isMobileOpen ? "open" : ""}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <div className={`sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        {/* Header with Logo */}
        <Link className="header-link" to="/">
          <div className="sidebar-header">
            <div className="logo-container">
              <FontAwesomeIcon icon={faRobot} className="logo-icon" />
              <h2 className="sidebar-title">SRG AI</h2>
            </div>
            <button className="mobile-close-btn" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </Link>

        {/* New Chat Button */}
        <Link to="/" className="new-chat-link">
          <div className="new-chat-container">
            <button className="new-chat-button" onClick={createNewChat}>
              <FontAwesomeIcon icon={faPlusCircle} />
              <span className="new-chat-text">New Chat</span>
            </button>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <FontAwesomeIcon
              icon={faTimes}
              className="clear-search"
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>

        {/* Recent Chats Section */}
        {chats.length > 0 && (
          <div className="recent-chats-section">
            <div className="section-header">
              <FontAwesomeIcon icon={faHistory} className="section-icon" />
              <p className="section-title">Recent Chats</p>
              <span className="chat-count">{chats.length}</span>
            </div>

            <div className="chats-list">
              {filteredChats.map((chat) => (
                <div
                  className={`chat-item ${selectedChat?._id === chat._id ? "active" : ""}`}
                  key={chat._id}
                  onClick={() => handleChatSelect(chat)} // FIXED: Added chat selection
                >
                  <div className="chat-item-avatar">
                    <FontAwesomeIcon icon={faCommentDots} />
                  </div>
                  <div className="chat-item-content">
                    <p className="chat-preview">
                      {chat.messages?.length > 0
                        ? chat.messages[0].content.slice(0, 28) + "..."
                        : chat.name || "New conversation"}
                    </p>
                    <p className="chat-time">
                      <FontAwesomeIcon icon={farClock} />
                      {moment(chat.updatedAt).fromNow()}
                    </p>
                  </div>
                  <button
                    className="chat-delete-btn"
                    onClick={(e) => deleteChat(e, chat._id)} // FIXED: Proper delete handler
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                </div>
              ))}

              {filteredChats.length === 0 && searchTerm && (
                <div className="no-results">
                  <FontAwesomeIcon icon={faSearch} />
                  <p>No chats found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          {/* Dark Mode Toggle */}
          <div className="bottom-item">
            <div className="bottom-item-left">
              <FontAwesomeIcon
                icon={theme === "dark" ? faSun : faMoon}
                className="bottom-icon"
              />
              <p className="bottom-item-text">Dark Mode</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={theme === "dark"}
                onChange={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  localStorage.setItem(
                    "theme",
                    theme === "dark" ? "light" : "dark",
                  );
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* User Account */}
          <div className="bottom-item user-account">
            <div className="user-info">
              <div className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <FontAwesomeIcon icon={faUserCircle} />
                )}
              </div>
              <div className="user-details">
                <p className="user-name">{user ? user.name : "Guest User"}</p>
                <p className="user-status">
                  {user ? (
                    <>
                      <span className="status-dot"></span>
                      Online
                    </>
                  ) : (
                    "Not logged in"
                  )}
                </p>
              </div>
            </div>
            {user && (
              <button className="logout-btn" onClick={logout} title="Logout">
                {" "}
                {/* FIXED: Moved onClick here */}
                <FontAwesomeIcon icon={faSignOutAlt} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
