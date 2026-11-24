import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  RefreshCw,
  Search,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  getDetectionHistory,
  getHealth,
  getStatistics,
} from "../services/api";

const RANSOMWARE_THRESHOLD = 0.60;

function formatPercent(value) {
  return `${Math.round(Number(value || 0) * 100)}%`;
}

function formatDateTime(timestamp) {
  if (!timestamp) return "—";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function isThreat(item) {
  return (
    String(item?.prediction || "").toLowerCase() === "ransomware" ||
    Number(item?.ransomware_probability || 0) >= RANSOMWARE_THRESHOLD ||
    item?.alert === true
  );
}

function History() {
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState({
    total_detections: 0,
    normal_detections: 0,
    ransomware_detections: 0,
    alerts: 0,
  });

  const [backendOnline, setBackendOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const loadData = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    }

    try {
      const [healthData, historyData, statisticsData] =
        await Promise.all([
          getHealth(),
          getDetectionHistory(),
          getStatistics(),
        ]);

      setBackendOnline(healthData?.status === "healthy");

      setHistory(historyData?.detections || []);
      setStatistics(
        statisticsData || {
          total_detections: 0,
          normal_detections: 0,
          ransomware_detections: 0,
          alerts: 0,
        }
      );

      setError("");
    } catch (err) {
      setBackendOnline(false);
      setError(
        "Unable to load detection history. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadData]);

  const filteredHistory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...history]
      .reverse()
      .filter((item) => {
        const threat = isThreat(item);

        if (filter === "normal" && threat) return false;
        if (filter === "ransomware" && !threat) return false;

        if (!query) return true;

        return (
          String(item?.file || "").toLowerCase().includes(query) ||
          String(item?.prediction || "").toLowerCase().includes(query) ||
          String(item?.id || "").includes(query)
        );
      });
  }, [history, search, filter]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldAlert size={25} />
          </div>

          <div>
            <div className="brand-name">SENTINEL AI</div>
            <div className="brand-subtitle">RANSOMWARE DEFENSE</div>
          </div>
        </div>

        <div className="sidebar-section-title">MONITORING</div>

        <nav className="navigation">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Activity size={19} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/detection"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <ShieldAlert size={19} />
            <span>Detection</span>
          </NavLink>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Clock3 size={19} />
            <span>History</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Activity size={19} />
            <span>Analytics</span>
          </NavLink>
        </nav>

        <div className="engine-status">
          <div className="status-dot" />
          <div>
            <div className="engine-label">DETECTION ENGINE</div>
            <div className="engine-online">
              {backendOnline ? "ONLINE" : "OFFLINE"}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <div>SENTINEL CORE v1.3.0</div>
          <span>Protected Environment</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Security Console</span>
            <b>/</b>
            <strong>History</strong>
          </div>

          <div className="topbar-actions">
            <div
              className={`connection-status ${
                backendOnline ? "online" : "offline"
              }`}
            >
              <span />
              {backendOnline
                ? "LIVE DATABASE"
                : "DATABASE OFFLINE"}
            </div>

            <button
              className="refresh-button"
              onClick={() => loadData(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "spin" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />
                DETECTION RECORDS
              </div>

              <h1>Detection History</h1>

              <p>
                Review historical ransomware detection events recorded by
                the AI detection engine.
              </p>
            </div>

            <div className="record-count">
              <Activity size={16} />
              <span>{history.length}</span>
              TOTAL RECORDS
            </div>
          </div>

          {error && (
            <div className="history-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="history-stats">
            <div className="history-stat-card">
              <div className="history-stat-icon blue">
                <Activity size={20} />
              </div>

              <div>
                <span>TOTAL EVENTS</span>
                <strong>{statistics.total_detections}</strong>
              </div>
            </div>

            <div className="history-stat-card">
              <div className="history-stat-icon green">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <span>NORMAL</span>
                <strong>{statistics.normal_detections}</strong>
              </div>
            </div>

            <div className="history-stat-card">
              <div className="history-stat-icon red">
                <ShieldAlert size={20} />
              </div>

              <div>
                <span>RANSOMWARE</span>
                <strong>{statistics.ransomware_detections}</strong>
              </div>
            </div>

            <div className="history-stat-card">
              <div className="history-stat-icon amber">
                <AlertTriangle size={20} />
              </div>

              <div>
                <span>ALERTS</span>
                <strong>{statistics.alerts}</strong>
              </div>
            </div>
          </div>

          <section className="history-panel">
            <div className="history-panel-header">
              <div>
                <div className="eyebrow">EVENT LOG</div>
                <h2>Detection Records</h2>
              </div>

              <div className="database-indicator">
                <Database size={15} />
                DATABASE SYNCED
              </div>
            </div>

            <div className="history-toolbar">
              <div className="history-search">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search file, prediction or ID..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="history-filters">
                <button
                  className={filter === "all" ? "selected" : ""}
                  onClick={() => setFilter("all")}
                >
                  All
                </button>

                <button
                  className={filter === "normal" ? "selected" : ""}
                  onClick={() => setFilter("normal")}
                >
                  Normal
                </button>

                <button
                  className={filter === "ransomware" ? "selected" : ""}
                  onClick={() => setFilter("ransomware")}
                >
                  Ransomware
                </button>
              </div>
            </div>

            <div className="history-table">
              <div className="history-table-head">
                <span>ID</span>
                <span>FILE / OBJECT</span>
                <span>PREDICTION</span>
                <span>NORMAL</span>
                <span>RANSOMWARE</span>
                <span>STATUS</span>
                <span>DATE & TIME</span>
              </div>

              {loading ? (
                <div className="history-empty">
                  <RefreshCw size={22} className="spin" />
                  <span>Loading detection records...</span>
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="history-empty">
                  <FileText size={24} />
                  <strong>No detection records found</strong>
                  <span>
                    Try changing your search or filter.
                  </span>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const threat = isThreat(item);

                  return (
                    <div
                      className={`history-row ${
                        threat ? "threat-row" : ""
                      }`}
                      key={item.id}
                    >
                      <div className="record-id">
                        #{item.id}
                      </div>

                      <div className="file-cell">
                        <div
                          className={`file-icon ${
                            threat ? "danger" : ""
                          }`}
                        >
                          <FileText size={17} />
                        </div>

                        <div>
                          <strong>
                            {item.file || "Unknown object"}
                          </strong>

                          <span>
                            Detection event
                          </span>
                        </div>
                      </div>

                      <div
                        className={`prediction ${
                          threat ? "danger-text" : ""
                        }`}
                      >
                        {threat ? (
                          <ShieldAlert size={15} />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}

                        {threat
                          ? "RANSOMWARE"
                          : "NORMAL"}
                      </div>

                      <div className="probability normal-probability">
                        {formatPercent(
                          item.normal_probability
                        )}
                      </div>

                      <div
                        className={`probability ${
                          threat
                            ? "danger-probability"
                            : "ransomware-probability"
                        }`}
                      >
                        {formatPercent(
                          item.ransomware_probability
                        )}
                      </div>

                      <div>
                        <span
                          className={`status-pill ${
                            threat ? "danger" : "safe"
                          }`}
                        >
                          {threat ? (
                            <ShieldAlert size={13} />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}

                          {threat
                            ? "THREAT"
                            : "NORMAL"}
                        </span>
                      </div>

                      <div className="date-cell">
                        {formatDateTime(item.timestamp)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <footer className="history-footer">
            <span>SENTINEL AI • RANSOMWARE DEFENSE</span>
            <span>Live database • 5 second refresh</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default History;