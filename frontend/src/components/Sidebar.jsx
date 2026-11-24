import { NavLink } from "react-router-dom";

import {
  Activity,
  BarChart3,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Zap,
} from "lucide-react";

function Sidebar({ backendOnline = true }) {
  return (
    <aside className="app-sidebar">

      {/* BRAND */}

      <div className="app-brand">

        <div className="app-brand-icon">
          <ShieldCheck size={25} />
        </div>

        <div>
          <div className="app-brand-name">
            SENTINEL AI
          </div>

          <div className="app-brand-subtitle">
            RANSOMWARE DEFENSE
          </div>
        </div>

      </div>


      {/* NAVIGATION */}

      <div className="app-nav-title">
        MONITORING
      </div>

      <nav className="app-navigation">

        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `app-nav-item ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </NavLink>


        <NavLink
          to="/detection"
          className={({ isActive }) =>
            `app-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Zap size={18} />
          <span>Detection</span>
        </NavLink>


        <NavLink
          to="/history"
          className={({ isActive }) =>
            `app-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Clock3 size={18} />
          <span>History</span>
        </NavLink>


        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            `app-nav-item ${isActive ? "active" : ""}`
          }
        >
          <BarChart3 size={18} />
          <span>Analytics</span>
        </NavLink>

      </nav>
      


      {/* ENGINE STATUS */}

      <div className="app-engine-card">

        <span
          className={`app-engine-dot ${
            backendOnline ? "online" : "offline"
          }`}
        />

        <div>

          <span>
            DETECTION ENGINE
          </span>

          <strong
            className={
              backendOnline
                ? "online-text"
                : "offline-text"
            }
          >
            {backendOnline ? "ONLINE" : "OFFLINE"}
          </strong>

        </div>

      </div>


      {/* FOOTER */}

      <div className="app-sidebar-footer">

        <span>
          SENTINEL CORE v1.3.0
        </span>

        <span>
          Protected Environment
        </span>

      </div>

    </aside>
  );
}

export default Sidebar;