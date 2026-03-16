import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import "./App.css";
import SideBar from "./components/sidebar/SideBar";
import Chatbox from "./components/chatbot/Chatbox";
import Loading from "./pages/loading/Loading";
import Community from "./pages/community/Community";
import Auth from "./pages/auth/Auth";
import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";

function App() {
  const { user, loadingUser } = useAppContext();
  const { pathname } = useLocation();

  // Show loading screen while checking auth status
  if (loadingUser) {
    return <Loading />;
  }

  return (
    <>
      <Toaster />

      {/* Show different UI based on user authentication */}
      {user ? (
        <>
          <SideBar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Chatbox />} />
              <Route path="/loading" element={<Loading />} />

              <Route path="/auth" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </>
      ) : (
        <div className="auth-container">
          <Routes>
            <Route path="/auth" element={<Auth />} />

            <Route path="*" element={<Navigate to="/auth" />} />
          </Routes>
        </div>
      )}
    </>
  );
}

export default App;
