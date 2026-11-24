import { useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function AppShell({
  children,
  onRefresh,
  refreshing = false,
}) {
  const location = useLocation();

  const pageTitles = {
    "/": "Overview",
    "/detection": "Detection",
    "/history": "History",
    "/analytics": "Analytics",
  };

  const title =
    pageTitles[location.pathname] || "Overview";

  return (
    <div className="app-shell">

      <Sidebar />

      <div className="main-area">

        <Topbar
          title={title}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />

        <main className="page-content">
          <div className="page-content-inner">
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}

export default AppShell;