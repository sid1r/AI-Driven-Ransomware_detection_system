import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  FileWarning,
  HardDrive,
  MemoryStick,
  ShieldAlert,
  ShieldCheck,
  Settings as SettingsIcon,
  Zap,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";


import {
  getHealth,
  getLatestDetection,
  getStatistics,
  getDetectionHistory,
} from "../services/api";

import "../index.css";



const RANSOMWARE_THRESHOLD = 0.60;


/* =========================================================
   DASHBOARD
   ========================================================= */

function Dashboard() {

  const [health, setHealth] = useState(null);

  const [latest, setLatest] = useState(null);

  const [statistics, setStatistics] = useState(null);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");


  /* =========================================================
     LOAD DASHBOARD DATA
     ========================================================= */

  const loadDashboard = useCallback(
    async (manual = false) => {

      try {

        if (manual) {
          setRefreshing(true);
        }

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

        setHistory(
          historyData?.detections || []
        );

        setError("");

      } catch (err) {

        console.error(
          "Dashboard API error:",
          err
        );

        setError(
          "Unable to connect to the ransomware detection backend."
        );

      } finally {

        setLoading(false);

        setRefreshing(false);

      }

    },
    []
  );


  /* =========================================================
     INITIAL LOAD + AUTO REFRESH
     ========================================================= */

  useEffect(() => {

    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 5000);

    return () => {
      clearInterval(interval);
    };

  }, [loadDashboard]);


  /* =========================================================
     BACKEND STATUS
     ========================================================= */

  const isBackendOnline =
    health?.status === "healthy";


  /* =========================================================
     PROBABILITIES
     ========================================================= */

  const ransomwareProbability =
    Number(
      latest?.ransomware_probability ?? 0
    );

  const normalProbability =
    Number(
      latest?.normal_probability ?? 0
    );


  const ransomwarePercent =
    Math.min(
      Math.max(ransomwareProbability * 100, 0),
      100
    );

  const normalPercent =
    Math.min(
      Math.max(normalProbability * 100, 0),
      100
    );


  /* =========================================================
     THREAT STATE
     ========================================================= */

  const isRansomware =
    latest?.prediction?.toLowerCase() ===
      "ransomware" ||
    latest?.alert === true ||
    ransomwareProbability >=
      RANSOMWARE_THRESHOLD;


  /* =========================================================
     STATISTICS
     ========================================================= */

  const totalDetections =
    statistics?.total_detections ?? 0;

  const normalDetections =
    statistics?.normal_detections ?? 0;

  const ransomwareDetections =
    statistics?.ransomware_detections ?? 0;

  const alerts =
    statistics?.alerts ?? 0;


  /* =========================================================
     RECENT HISTORY
     ========================================================= */

  const recentHistory = useMemo(() => {

    return [...history]
      .sort(
        (a, b) =>
          new Date(b.timestamp || 0) -
          new Date(a.timestamp || 0)
      )
      .slice(0, 6);

  }, [history]);


  /* =========================================================
     FORMAT TIME
     ========================================================= */

  const formatTime = (timestamp) => {

    if (!timestamp) {
      return "--:--:--";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "--:--:--";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  };


  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formatDate = (timestamp) => {

    if (!timestamp) {
      return "--";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "--";
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  };


  /* =========================================================
     RENDER
     ========================================================= */

  return (

    <div
      className={`dashboard-shell ${
        isRansomware
          ? "dashboard-threat"
          : ""
      }`}
    >

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <Sidebar
        backendOnline={isBackendOnline}
      />


      {/* =====================================================
          MAIN AREA
          ===================================================== */}

      <main className="dashboard-main">

        <Topbar
          pageTitle="Overview"
          backendOnline={isBackendOnline}
          refreshing={refreshing}
          onRefresh={() =>
            loadDashboard(true)
          }
        />


        <div className="dashboard-content">


          {/* =================================================
              ERROR
              ================================================= */}

          {error && (

            <div className="dashboard-error">

              <AlertTriangle size={18} />

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


          {/* =================================================
              PAGE HEADER
              ================================================= */}

          <section className="dashboard-heading">

            <div>

              <div className="dashboard-eyebrow">

                <span />

                SECURITY OPERATIONS CENTER

              </div>


              <h1>
                Ransomware Defense
              </h1>


              <p>
                Real-time AI monitoring and
                behavioral threat detection.
              </p>

            </div>


            <div
              className={`dashboard-engine-status ${
                isBackendOnline
                  ? "online"
                  : "offline"
              }`}
            >

              <span />

              {isBackendOnline
                ? "LIVE ENGINE"
                : "ENGINE OFFLINE"}

            </div>

          </section>


          {/* =================================================
              SECURITY STATUS BANNER
              ================================================= */}

          <section
            className={`dashboard-security-banner ${
              isRansomware
                ? "danger"
                : "safe"
            }`}
          >

            <div className="dashboard-security-icon">

              {isRansomware ? (
                <ShieldAlert size={25} />
              ) : (
                <ShieldCheck size={25} />
              )}

            </div>


            <div className="dashboard-security-text">

              <span>
                DETECTION ENGINE STATUS
              </span>


              <strong>
                {isRansomware
                  ? "ACTIVE THREAT DETECTED"
                  : "NO ACTIVE THREAT DETECTED"}
              </strong>


              <p>

                {isRansomware
                  ? `Ransomware probability is ${ransomwarePercent.toFixed(
                      0
                    )}%, above the configured security threshold.`
                  : `Current ransomware probability is ${ransomwarePercent.toFixed(
                      0
                    )}%, below the configured security threshold.`}

              </p>

            </div>


            <div className="dashboard-threshold">

              <span>
                SECURITY THRESHOLD
              </span>

              <strong>
                {RANSOMWARE_THRESHOLD * 100}%
              </strong>

            </div>

          </section>


          {/* =================================================
              STATISTICS
              ================================================= */}

          <section className="dashboard-stats">

            <DashboardStat
              icon={<Activity size={20} />}
              label="TOTAL DETECTIONS"
              value={
                loading
                  ? "..."
                  : totalDetections
              }
              type="blue"
            />


            <DashboardStat
              icon={<CheckCircle2 size={20} />}
              label="NORMAL"
              value={
                loading
                  ? "..."
                  : normalDetections
              }
              type="green"
            />


            <DashboardStat
              icon={<ShieldAlert size={20} />}
              label="RANSOMWARE"
              value={
                loading
                  ? "..."
                  : ransomwareDetections
              }
              type="red"
            />


            <DashboardStat
              icon={<AlertTriangle size={20} />}
              label="ALERTS"
              value={
                loading
                  ? "..."
                  : alerts
              }
              type="orange"
            />

          </section>


          {/* =================================================
              MAIN ANALYSIS GRID
              ================================================= */}

          <section className="dashboard-grid">


            {/* =================================================
                AI THREAT ANALYSIS
                ================================================= */}

            <div className="dashboard-card threat-analysis">

              <div className="dashboard-card-header">

                <div>

                  <span>
                    AI THREAT ANALYSIS
                  </span>

                  <h2>
                    Current Assessment
                  </h2>

                </div>

                <Activity size={21} />

              </div>


              <div className="threat-analysis-body">


                {/* THREAT RING */}

                <div
                  className={`threat-ring ${
                    isRansomware
                      ? "danger"
                      : "safe"
                  }`}
                  style={{
                    "--threat-progress":
                      `${Math.min(
                        ransomwarePercent,
                        100
                      ) * 3.6}deg`,
                  }}
                >

                  <div className="threat-ring-inner">

                    {isRansomware ? (
                      <ShieldAlert size={28} />
                    ) : (
                      <ShieldCheck size={28} />
                    )}


                    <strong>
                      {ransomwarePercent.toFixed(
                        0
                      )}%
                    </strong>


                    <span>
                      THREAT SCORE
                    </span>

                  </div>

                </div>


                {/* THREAT DETAILS */}

                <div className="threat-details">

                  <div className="prediction-label">
                    MODEL PREDICTION
                  </div>


                  <div
                    className={`prediction-value ${
                      isRansomware
                        ? "danger"
                        : "safe"
                    }`}
                  >

                    {isRansomware
                      ? "RANSOMWARE"
                      : "NORMAL"}

                  </div>


                  {/* NORMAL PROBABILITY */}

                  <div className="dashboard-probability">

                    <div className="dashboard-probability-header">

                      <span>
                        Normal Probability
                      </span>

                      <strong>
                        {normalPercent.toFixed(0)}%
                      </strong>

                    </div>


                    <div className="dashboard-probability-track">

                      <div
                        className="dashboard-probability-fill normal"
                        style={{
                          width: `${normalPercent}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* RANSOMWARE PROBABILITY */}

                  <div className="dashboard-probability">

                    <div className="dashboard-probability-header">

                      <span>
                        Ransomware Probability
                      </span>

                      <strong>
                        {ransomwarePercent.toFixed(0)}%
                      </strong>

                    </div>


                    <div className="dashboard-probability-track">

                      <div
                        className={`dashboard-probability-fill ${
                          isRansomware
                            ? "danger"
                            : "threat"
                        }`}
                        style={{
                          width: `${ransomwarePercent}%`,
                        }}
                      />

                    </div>

                  </div>


                  {/* MODEL INFORMATION */}

                  <div className="analysis-meta">

                    <div>

                      <span>
                        MODEL
                      </span>

                      <strong>
                        Random Forest
                      </strong>

                    </div>


                    <div>

                      <span>
                        CLASSES
                      </span>

                      <strong>
                        Normal / Ransomware
                      </strong>

                    </div>


                    <div>

                      <span>
                        THRESHOLD
                      </span>

                      <strong>
                        60%
                      </strong>

                    </div>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                LATEST FILE EVENT
                ================================================= */}

            <div className="dashboard-card latest-event">

              <div className="dashboard-card-header">

                <div>

                  <span>
                    OBJECT ANALYSIS
                  </span>

                  <h2>
                    Latest File Event
                  </h2>

                </div>


                <div
                  className={`event-status ${
                    isRansomware
                      ? "danger"
                      : "safe"
                  }`}
                >

                  {isRansomware ? (
                    <>
                      <ShieldAlert size={14} />
                      THREAT
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      SAFE
                    </>
                  )}

                </div>

              </div>


              {/* FILE */}

              <div className="latest-file">

                <div className="latest-file-icon">

                  <FileWarning size={22} />

                </div>


                <div>

                  <span>
                    ANALYZED FILE
                  </span>

                  <strong>
                    {latest?.file ||
                      "No detection event"}
                  </strong>

                </div>

              </div>


              {/* EVENT DETAILS */}

              <div className="latest-details">

                <div>

                  <span>
                    PREDICTION
                  </span>

                  <strong>
                    {latest?.prediction ||
                      "Normal"}
                  </strong>

                </div>


                <div>

                  <span>
                    DETECTION TIME
                  </span>

                  <strong>
                    {formatTime(
                      latest?.timestamp
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    DETECTION DATE
                  </span>

                  <strong>
                    {formatDate(
                      latest?.timestamp
                    )}
                  </strong>

                </div>

              </div>


              {/* PROBABILITIES */}

              <div className="latest-probabilities">

                <div>

                  <span>
                    NORMAL
                  </span>

                  <strong>
                    {normalPercent.toFixed(0)}%
                  </strong>

                </div>


                <div>

                  <span>
                    RANSOMWARE
                  </span>

                  <strong>
                    {ransomwarePercent.toFixed(0)}%
                  </strong>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              SYSTEM TELEMETRY
              ================================================= */}

          <section className="dashboard-card telemetry-card">

            <div className="dashboard-card-header">

              <div>

                <span>
                  SYSTEM TELEMETRY
                </span>

                <h2>
                  Detection Environment
                </h2>

              </div>

              <Cpu size={21} />

            </div>


            <div className="telemetry-grid">

              <TelemetryItem
                icon={<Cpu size={18} />}
                label="AI PROCESSING"
                value="ACTIVE"
                description="Model inference available"
              />


              <TelemetryItem
                icon={<HardDrive size={18} />}
                label="DATABASE"
                value={
                  isBackendOnline
                    ? "SYNCED"
                    : "OFFLINE"
                }
                description="SQLite detection storage"
              />


              <TelemetryItem
                icon={<MemoryStick size={18} />}
                label="MONITOR"
                value="ACTIVE"
                description="Filesystem monitoring"
              />


              <TelemetryItem
                icon={<Zap size={18} />}
                label="REFRESH RATE"
                value="5 SEC"
                description="Live data synchronization"
              />

            </div>

          </section>


          {/* =================================================
              RECENT ACTIVITY
              ================================================= */}

          <section className="dashboard-card activity-card">

            <div className="dashboard-card-header">

              <div>

                <span>
                  EVENT STREAM
                </span>

                <h2>
                  Recent Detection Activity
                </h2>

              </div>


              <div className="activity-count">

                <Activity size={14} />

                {recentHistory.length} EVENTS

              </div>

            </div>


            {recentHistory.length === 0 ? (

              <div className="dashboard-empty">

                <Activity size={25} />

                <strong>
                  No detection activity
                </strong>

                <span>
                  Events will appear here when
                  the detection engine processes
                  files.
                </span>

              </div>

            ) : (

              <div className="activity-list">

                {recentHistory.map(
                  (event) => {

                    const threat =
                      event?.prediction?.toLowerCase() ===
                        "ransomware" ||
                      event?.alert === true ||
                      Number(
                        event?.ransomware_probability ??
                          0
                      ) >=
                        RANSOMWARE_THRESHOLD;


                    const probability =
                      Math.min(
                        Math.max(
                          Number(
                            event?.ransomware_probability ??
                              0
                          ) * 100,
                          0
                        ),
                        100
                      );


                    return (

                      <div
                        className="activity-row"
                        key={event.id}
                      >

                        <div
                          className={`activity-icon ${
                            threat
                              ? "danger"
                              : "safe"
                          }`}
                        >

                          {threat ? (
                            <ShieldAlert size={16} />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}

                        </div>


                        <div className="activity-file">

                          <strong>
                            {event.file ||
                              "Unknown file"}
                          </strong>

                          <span>
                            Detection #{event.id}
                          </span>

                        </div>


                        <div className="activity-time">

                          <Clock3 size={13} />

                          {formatTime(
                            event.timestamp
                          )}

                        </div>


                        <div
                          className={`activity-prediction ${
                            threat
                              ? "danger"
                              : "safe"
                          }`}
                        >

                          {threat
                            ? "RANSOMWARE"
                            : "NORMAL"}

                        </div>


                        <div className="activity-confidence">

                          {probability.toFixed(0)}%

                        </div>

                      </div>

                    );

                  }
                )}

              </div>

            )}

          </section>


          {/* =================================================
              FOOTER
              ================================================= */}

          <footer className="dashboard-footer">

            <span>
              SENTINEL AI • RANSOMWARE DEFENSE
            </span>

            <span>
              Live monitoring • 5 second refresh
            </span>

          </footer>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   STAT CARD
   ========================================================= */

function DashboardStat({
  icon,
  label,
  value,
  type,
}) {

  return (

    <div
      className={`dashboard-stat ${type}`}
    >

      <div className="dashboard-stat-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}


/* =========================================================
   TELEMETRY ITEM
   ========================================================= */

function TelemetryItem({
  icon,
  label,
  value,
  description,
}) {

  return (

    <div className="telemetry-item">

      <div className="telemetry-icon">
        {icon}
      </div>

      <div>

        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {description}
        </small>

      </div>

    </div>
  );
}


export default Dashboard;