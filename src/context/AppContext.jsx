import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance with proper configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_URL,
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
  },
});

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const navigate = useNavigate();

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // FIX 1: Add token to requests with "Bearer " prefix
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        // Get the latest token from state
        const currentToken = token || localStorage.getItem("token");

        if (currentToken) {
          // IMPORTANT: Add "Bearer " prefix if your backend expects it
          // Most backends expect "Bearer <token>"
          config.headers.Authorization = `Bearer ${currentToken}`;
        } else {
          console.log(`No token for ${config.url}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
    };
  }, [token]); // Keep token in dependencies to update when it changes

  const fetchUser = async () => {
    try {
      setLoadingUser(true);

      const { data } = await axiosInstance.get("/srg-ai/user/user-profile");

      if (data.success) {
        setUser(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoadingUser(false);
    }
  };

  const createNewChat = async () => {
    try {
      if (!user) {
        toast("Login to create new chat");
        return;
      }
      navigate("/");
      // FIX 2: Check if this endpoint is correct - might need to be "/srg-ai/chat/create-chat"
      await axiosInstance.get("/srg-ai/chat/create-chat"); // Changed from "/create" to "/create-chat"
      await fetchUsersChats();
    } catch (error) {
      console.error("Create chat error:", error);
      handleApiError(error);
    }
  };

  const fetchUsersChats = async () => {
    try {
      // FIX 3: Use correct endpoint - check your backend for the actual route
      // Try different endpoints based on your controller files
      let response;
      try {
        // Try the endpoint from your ChatController.js first
        response = await axiosInstance.get("/srg-ai/chat/get-chats");
      } catch (err) {
        if (err.response?.status === 404) {
          // If that fails, try the message controller endpoint
          response = await axiosInstance.get("/srg-ai/message/get-chats");
        } else {
          throw err;
        }
      }

      const { data } = response;

      if (data.success) {
        setChats(data.chats);

        // if there are no chats, create one
        if (data.chats.length === 0) {
          await createNewChat();
        } else {
          setSelectedChat(data.chats[0]);
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      // Don't show error for 404 if we're just testing endpoints
      if (error.response?.status !== 404) {
        handleApiError(error);
      } else {
        toast.error("Chat endpoint not configured properly");
      }
    }
  };

  const handleApiError = (error) => {
    if (error.code === "ECONNABORTED") {
      toast.error("Request timeout. Please try again.");
    } else if (!error.response) {
      toast.error("Cannot connect to server. Please check your connection.");
    } else if (error.response.status === 401) {
      // Unauthorized - clear token
      console.log("401 Unauthorized - clearing session");
      setToken(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      toast.error("Session expired. Please login again.");
    } else {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // FIX 4: Add function to handle login success
  const handleLoginSuccess = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(userData));

    axiosInstance.defaults.headers.common["Authorization"] =
      `Bearer ${newToken}`;
  };

  useEffect(() => {
    if (user) {
      fetchUsersChats();
    } else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  const value = {
    user,
    setUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    navigate,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUser,
    fetchUsersChats,
    token,
    setToken,
    handleLoginSuccess, // Export this for use in Auth component
    axios: axiosInstance,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
