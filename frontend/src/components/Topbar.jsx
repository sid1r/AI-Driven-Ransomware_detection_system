import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LogOut,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import NotificationBell from "./NotificationBell";
import { getStoredUser, logout } from "../services/auth";

function Topbar({
  title = "Overview",
  onRefresh,
  refreshing = false,
}) {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => getStoredUser());
  const [open, setOpen] = useState(false);

  const accountRef = useRef(null);

  useEffect(() => {
    const closeMenu = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeMenu);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setOpen(false);

    navigate("/login", {
      replace: true,
    });
  };

  const username = user?.username || "admin";
  const role =
    user?.role === "admin"
      ? "Administrator"
      : user?.role || "User";

  return (
    <header className="topbar">

      <div className="topbar-breadcrumb">
        <span>Security Console</span>

        <span className="breadcrumb-separator">
          /
        </span>

        <strong>{title}</strong>
      </div>


      <div className="topbar-actions">

        <div className="backend-status">
          <span className="backend-status-dot"></span>
          <span>Backend Connected</span>
        </div>


        <NotificationBell />


        <button
          type="button"
          className="refresh-button"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh detection data"
        >
          <RefreshCw
            size={16}
            className={
              refreshing ? "refresh-spinning" : ""
            }
          />

          <span>Refresh</span>
        </button>


        {/* =========================================
            SENTINEL ACCOUNT
        ========================================= */}

        <div
          className="sentinel-account"
          ref={accountRef}
        >

          <button
            type="button"
            className="sentinel-account-trigger"
            onClick={() => setOpen((value) => !value)}
            aria-label="Account menu"
            aria-expanded={open}
          >

            <span className="sentinel-account-icon">
              <UserRound size={16} />
            </span>

            <span className="sentinel-account-name">
              {username}
            </span>

            <ChevronDown
              size={14}
              className={
                open
                  ? "sentinel-account-arrow sentinel-open"
                  : "sentinel-account-arrow"
              }
            />

          </button>


          {open && (
            <div className="sentinel-account-menu">

              <div className="sentinel-account-header">

                <div className="sentinel-account-large-icon">
                  <ShieldCheck size={21} />
                </div>

                <div className="sentinel-account-details">
                  <div className="sentinel-account-username">
                    {username}
                  </div>

                  <div className="sentinel-account-role">
                    {role}
                  </div>
                </div>

              </div>


              <div className="sentinel-account-divider"></div>


              <button
                type="button"
                className="sentinel-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />

                <span>Logout</span>
              </button>

            </div>
          )}

        </div>

      </div>

    </header>
  );
}

export default Topbar;