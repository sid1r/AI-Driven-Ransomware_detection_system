import { useCallback, useEffect, useState } from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Cpu,
  Database,
  FileWarning,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Terminal,
} from "lucide-react";

import {
  getHealth,
  getLatestDetection,
  getStatistics,
  getDetectionHistory,
} from "./services/api";

import "./index.css";

const RANSOMWARE_THRESHOLD = 0.60;

function App() {
  const [health, setHealth] = useState(null);
  const [latest, setLatest] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);

      const [
        healthData,
        latestData,
        statisticsData,
        historyData,
      ] = await Promise.all([
        getHealth(),
        getLatestDetection(),
        getStatistics(),
        getDetectionHistory(),
      ]);

      setHealth(healthData);
      setLatest(latestData);
      setStatistics(statisticsData);
      setHistory(historyData?.detections || []);
    } catch (err) {
      console.error("Dashboard API error:", err);
      setError("Unable to connect to the detection backend.");
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  const isBackendOnline = health?.status === "healthy";

  const ransomwareProbability =
    Number(latest?.ransomware_probability ?? 0);

  const normalProbability =
    Number(latest?.normal_probability ?? 0);

  const isRansomware =
    latest?.prediction?.toLowerCase() === "ransomware" ||
    ransomwareProbability >= RANSOMWARE_THRESHOLD;

  const probabilityDegrees =
    Math.min(ransomwareProbability, 1) * 360;

  return (
    <div className="app-shell">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <ShieldCheck size={25} />
          </div>

          <div>
            <div className="brand-name">
              SENTINEL AI
            </div>

            <div className="brand-subtitle">
              RANSOMWARE DEFENSE
            </div>
          </div>

        </div>


        <div className="sidebar-section-title">
          MONITORING
        </div>


        <nav className="navigation">

          <button className="nav-item active">
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </button>

          <button className="nav-item">
            <Activity size={19} />
            <span>Detection</span>
          </button>

          <button className="nav-item">
            <Clock3 size={19} />
            <span>History</span>
          </button>

          <button className="nav-item">
            <BarChart3 size={19} />
            <span>Analytics</span>
          </button>

        </nav>


        <div className="sidebar-section-title engine-title">
          SYSTEM
        </div>


        <div
          className={`engine-status ${
            isBackendOnline ? "" : "offline"
          }`}
        >

          <div
            className={`status-dot ${
              isBackendOnline ? "online" : ""
            }`}
          ></div>

          <div>

            <div className="engine-label">
              DETECTION ENGINE
            </div>

            <div className="engine-online">
              {isBackendOnline ? "ONLINE" : "OFFLINE"}
            </div>

          </div>

        </div>


        <div className="sidebar-bottom">

          <div className="version">
            <Terminal size={15} />
            <span>AI Engine v1.0</span>
          </div>

          <div className="version">
            <Database size={15} />
            <span>SQLite Storage</span>
          </div>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="mobile-menu">
            <Menu size={22} />
          </div>

          <div className="page-heading">

            <div className="eyebrow">
              SECURITY OPERATIONS CENTER
            </div>

            <h1>
              Threat Overview
            </h1>

          </div>


          <div className="topbar-actions">

            <div className="system-health">

              <span
                className={`health-dot ${
                  isBackendOnline ? "" : "offline-dot"
                }`}
              ></span>

              <span>
                {isBackendOnline
                  ? "SYSTEM ONLINE"
                  : "SYSTEM OFFLINE"}
              </span>

            </div>


            <button className="icon-button">
              <Bell size={19} />
            </button>


            <div className="avatar">
              AI
            </div>

          </div>

        </header>


        {/* ================= CONTENT ================= */}

        <section className="dashboard-content">

          {/* BACKEND ERROR */}

          {error && (

            <div className="error-banner">

              <AlertTriangle size={20} />

              <div>
                <strong>
                  BACKEND CONNECTION ERROR
                </strong>

                <span>
                  {error}
                </span>
              </div>

            </div>

          )}


          {/* SECURITY STATUS */}

          <div
            className={`security-banner ${
              isRansomware ? "danger-banner" : ""
            }`}
          >

            <div className="banner-icon">

              {isRansomware ? (
                <AlertTriangle size={22} />
              ) : (
                <ShieldCheck size={22} />
              )}

            </div>


            <div className="banner-content">

              <div className="banner-title">

                {isRansomware
                  ? "THREAT DETECTED"
                  : "AI PROTECTION ACTIVE"}

              </div>

              <div className="banner-text">

                {isRansomware
                  ? "The latest detection has exceeded the ransomware security threshold."
                  : "Real-time filesystem monitoring and ransomware classification are currently active."}

              </div>

            </div>


            <div className="banner-status">

              <span className="pulse"></span>

              {isBackendOnline
                ? "MONITORING"
                : "OFFLINE"}

            </div>

          </div>


          {/* ================= STATISTICS ================= */}

          <div className="section-header">

            <div>

              <div className="section-kicker">
                SYSTEM TELEMETRY
              </div>

              <h2>
                Detection Statistics
              </h2>

            </div>


            <div className="last-updated">

              <Activity size={15} />

              Auto-refresh: 5s

            </div>

          </div>


          <div className="stats-grid">

            <StatCard
              icon={<Database />}
              label="TOTAL DETECTIONS"
              value={
                loading
                  ? "..."
                  : statistics?.total_detections ?? 0
              }
              description="Events processed"
              className="blue"
            />


            <StatCard
              icon={<CheckCircle2 />}
              label="NORMAL FILES"
              value={
                loading
                  ? "..."
                  : statistics?.normal_detections ?? 0
              }
              description="Classified as safe"
              className="green"
            />


            <StatCard
              icon={<FileWarning />}
              label="RANSOMWARE"
              value={
                loading
                  ? "..."
                  : statistics?.ransomware_detections ?? 0
              }
              description="Threat classifications"
              className="red"
            />


            <StatCard
              icon={<AlertTriangle />}
              label="SECURITY ALERTS"
              value={
                loading
                  ? "..."
                  : statistics?.alerts ?? 0
              }
              description="Threshold exceeded"
              className="orange"
            />

          </div>


          {/* ================= MAIN MONITOR ================= */}

          <div className="monitor-grid">

            {/* THREAT MONITOR */}

            <section className="panel threat-panel">

              <div className="panel-header">

                <div>

                  <div className="panel-kicker">
                    AI THREAT ANALYSIS
                  </div>

                  <h3>
                    Current Threat Level
                  </h3>

                </div>


                <div className="live-badge">

                  <span></span>

                  LIVE

                </div>

              </div>


              <div className="threat-display">


                <div
                  className={`threat-ring ${
                    isRansomware ? "danger-ring" : ""
                  }`}
                  style={{
                    background: `conic-gradient(
                      ${
                        isRansomware
                          ? "#f87171"
                          : "#4ade80"
                      } 0deg,
                      ${
                        isRansomware
                          ? "#f87171"
                          : "#4ade80"
                      } ${probabilityDegrees}deg,
                      #1c2632 ${probabilityDegrees}deg,
                      #1c2632 360deg
                    )`,
                  }}
                >

                  <div className="ring-inner">

                    <div className="probability">

                      {loading
                        ? "..."
                        : `${(
                            ransomwareProbability * 100
                          ).toFixed(2)}%`}

                    </div>

                    <div className="probability-label">
                      RANSOMWARE
                    </div>

                  </div>

                </div>


                <div className="threat-info">

                  <div
                    className={`classification ${
                      isRansomware
                        ? "danger-classification"
                        : "normal"
                    }`}
                  >

                    {isRansomware ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}

                    <span>
                      {isRansomware
                        ? "RANSOMWARE DETECTED"
                        : "NORMAL"}
                    </span>

                  </div>


                  <p>

                    {isRansomware
                      ? "The AI classifier has identified activity above the configured ransomware threshold."
                      : "The latest analyzed activity is currently below the ransomware security threshold."}

                  </p>


                  <div className="threshold">

                    <div className="threshold-label">

                      <span>
                        Security threshold
                      </span>

                      <strong>
                        60%
                      </strong>

                    </div>


                    <div className="threshold-track">

                      <div
                        className="threshold-fill"
                        style={{
                          width: "60%",
                        }}
                      ></div>

                    </div>

                  </div>

                </div>

              </div>

            </section>


            {/* LATEST DETECTION */}

            <section className="panel latest-panel">

              <div className="panel-header">

                <div>

                  <div className="panel-kicker">
                    MOST RECENT EVENT
                  </div>

                  <h3>
                    Latest Detection
                  </h3>

                </div>


                <div className="event-icon">

                  <FileWarning size={20} />

                </div>

              </div>


              <div className="latest-status">

                <div
                  className={`status-check ${
                    isRansomware
                      ? "danger-status"
                      : ""
                  }`}
                >

                  {isRansomware ? (
                    <AlertTriangle size={21} />
                  ) : (
                    <CheckCircle2 size={21} />
                  )}

                </div>


                <div>

                  <div
                    className={`latest-classification ${
                      isRansomware
                        ? "danger-text"
                        : ""
                    }`}
                  >

                    {loading
                      ? "LOADING"
                      : latest?.prediction?.toUpperCase() ||
                        "NORMAL"}

                  </div>


                  <div className="latest-description">

                    {isRansomware
                      ? "Immediate attention recommended"
                      : "No immediate threat detected"}

                  </div>

                </div>

              </div>


              <div className="file-card">

                <div className="file-icon">
                  <LockKeyhole size={19} />
                </div>


                <div className="file-details">

                  <div className="file-label">
                    ANALYZED FILE
                  </div>

                  <div className="file-name">

                    {latest?.file ||
                      "No detection event available"}

                  </div>

                </div>


                <ChevronRight size={18} />

              </div>


              <div className="probability-row">

                <div>

                  <span>
                    Normal probability
                  </span>

                  <strong className="normal-text">

                    {(
                      normalProbability * 100
                    ).toFixed(2)}%

                  </strong>

                </div>


                <div>

                  <span>
                    Ransomware probability
                  </span>

                  <strong
                    className={
                      isRansomware
                        ? "danger-text"
                        : "threat-text"
                    }
                  >

                    {(
                      ransomwareProbability * 100
                    ).toFixed(2)}%

                  </strong>

                </div>

              </div>

            </section>

          </div>


          {/* ================= ACTIVITY ================= */}

          <section className="panel activity-panel">

            <div className="panel-header">

              <div>

                <div className="panel-kicker">
                  REAL-TIME TELEMETRY
                </div>

                <h3>
                  Recent Detection Activity
                </h3>

              </div>


              <div className="activity-meta">

                <Cpu size={16} />

                {history.length} EVENTS

              </div>

            </div>


            {history.length === 0 ? (

              <div className="chart-placeholder">

                <div className="chart-empty">

                  <Activity size={30} />

                  <div>
                    No detection events yet
                  </div>

                  <small>
                    Detection activity will appear here
                    when the monitoring engine processes files.
                  </small>

                </div>

              </div>

            ) : (

              <div className="activity-list">

                {history.slice(0, 8).map((event) => {

                  const threat =
                    event.prediction?.toLowerCase() ===
                      "ransomware" ||
                    Number(event.ransomware_probability) >=
                      RANSOMWARE_THRESHOLD;

                  return (

                    <div
                      className="activity-row"
                      key={event.id}
                    >

                      <div
                        className={`activity-indicator ${
                          threat
                            ? "danger-indicator"
                            : ""
                        }`}
                      >

                        {threat ? (
                          <AlertTriangle size={15} />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}

                      </div>


                      <div className="activity-file">

                        <strong>
                          {event.file || "Unknown file"}
                        </strong>

                        <span>
                          {formatTimestamp(
                            event.timestamp
                          )}
                        </span>

                      </div>


                      <div
                        className={`activity-prediction ${
                          threat
                            ? "danger-text"
                            : "normal-text"
                        }`}
                      >

                        {event.prediction}

                      </div>


                      <div className="activity-probability">

                        {(
                          Number(
                            event.ransomware_probability
                          ) * 100
                        ).toFixed(2)}
                        %

                      </div>

                    </div>

                  );
                })}

              </div>

            )}

          </section>


          {/* ================= FOOTER ================= */}

          <footer className="dashboard-footer">

            <div>
              SENTINEL AI • RANSOMWARE DETECTION SYSTEM
            </div>

            <div className="footer-right">

              <span
                className={`health-dot ${
                  isBackendOnline
                    ? ""
                    : "offline-dot"
                }`}
              ></span>

              {isBackendOnline
                ? "Backend connected"
                : "Backend disconnected"}

            </div>

          </footer>

        </section>

      </main>

    </div>
  );
}


/* ================= STAT CARD ================= */

function StatCard({
  icon,
  label,
  value,
  description,
  className,
}) {
  return (
    <div className={`stat-card ${className}`}>

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <div className="stat-label">
          {label}
        </div>

      </div>


      <div className="stat-value">
        {value}
      </div>


      <div className="stat-description">
        {description}
      </div>

    </div>
  );
}


/* ================= TIMESTAMP ================= */

function formatTimestamp(timestamp) {

  if (!timestamp) {
    return "Unknown time";
  }

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return date.toLocaleString();
}


export default App;