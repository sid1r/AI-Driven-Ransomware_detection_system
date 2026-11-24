import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Database,
  RefreshCw,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import {
  getDetectionHistory,
  getHealth,
  getStatistics,
} from "../services/api";

const RANSOMWARE_THRESHOLD = 0.60;

function percentage(value) {
  return `${(Number(value || 0) * 100).toFixed(1)}%`;
}

function Analytics() {
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

  const loadAnalytics = useCallback(async (manual = false) => {
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
        "Unable to load analytics data. Make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(() => {
      loadAnalytics();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadAnalytics]);

  const total = Number(statistics.total_detections || 0);
  const normal = Number(statistics.normal_detections || 0);
  const ransomware = Number(
    statistics.ransomware_detections || 0
  );
  const alerts = Number(statistics.alerts || 0);

  const normalRate = total ? normal / total : 0;
  const threatRate = total ? ransomware / total : 0;
  const alertRate = total ? alerts / total : 0;

  const averageProbability = useMemo(() => {
    if (!history.length) {
      return {
        normal: 0,
        ransomware: 0,
      };
    }

    const normalAverage =
      history.reduce(
        (sum, item) =>
          sum + Number(item.normal_probability || 0),
        0
      ) / history.length;

    const ransomwareAverage =
      history.reduce(
        (sum, item) =>
          sum + Number(item.ransomware_probability || 0),
        0
      ) / history.length;

    return {
      normal: normalAverage,
      ransomware: ransomwareAverage,
    };
  }, [history]);

  const aboveThreshold = useMemo(() => {
    return history.filter(
      (item) =>
        Number(item.ransomware_probability || 0) >=
        RANSOMWARE_THRESHOLD
    ).length;
  }, [history]);

  const normalAngle = total
    ? (normal / total) * 360
    : 0;

  const threatAngle = total
    ? (ransomware / total) * 360
    : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <ShieldAlert size={25} />
          </div>

          <div>
            <div className="brand-name">SENTINEL AI</div>
            <div className="brand-subtitle">
              RANSOMWARE DEFENSE
            </div>
          </div>
        </div>

        <div className="sidebar-section-title">
          MONITORING
        </div>

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
            <Activity size={19} />
            <span>History</span>
          </NavLink>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <BarChart3 size={19} />
            <span>Analytics</span>
          </NavLink>
        </nav>

        <div className="engine-status">
          <div className="status-dot" />

          <div>
            <div className="engine-label">
              DETECTION ENGINE
            </div>

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
            <strong>Analytics</strong>
          </div>

          <div className="topbar-actions">
            <div
              className={`connection-status ${
                backendOnline ? "online" : "offline"
              }`}
            >
              <span />
              {backendOnline
                ? "LIVE ANALYTICS"
                : "ANALYTICS OFFLINE"}
            </div>

            <button
              className="refresh-button"
              onClick={() => loadAnalytics(true)}
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

        <section className="page-content analytics-page">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span />
                SECURITY INTELLIGENCE
              </div>

              <h1>Security Analytics</h1>

              <p>
                Analyze ransomware detection activity and AI
                classification performance from recorded events.
              </p>
            </div>

            <div className="record-count">
              <BarChart3 size={16} />
              <span>{total}</span>
              ANALYZED EVENTS
            </div>
          </div>

          {error && (
            <div className="history-error">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="analytics-stats">
            <div className="analytics-stat-card">
              <div className="analytics-stat-icon blue">
                <Database size={20} />
              </div>

              <div>
                <span>TOTAL ANALYZED</span>
                <strong>{total}</strong>
                <small>Detection events</small>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon green">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <span>NORMAL RATE</span>
                <strong>{percentage(normalRate)}</strong>
                <small>{normal} normal events</small>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon red">
                <ShieldAlert size={20} />
              </div>

              <div>
                <span>THREAT RATE</span>
                <strong>{percentage(threatRate)}</strong>
                <small>{ransomware} ransomware events</small>
              </div>
            </div>

            <div className="analytics-stat-card">
              <div className="analytics-stat-icon amber">
                <AlertTriangle size={20} />
              </div>

              <div>
                <span>ALERT RATE</span>
                <strong>{percentage(alertRate)}</strong>
                <small>{alerts} alerts triggered</small>
              </div>
            </div>
          </div>

          <div className="analytics-grid">
            <section className="analytics-panel distribution-panel">
              <div className="analytics-panel-header">
                <div>
                  <div className="eyebrow">
                    CLASSIFICATION DISTRIBUTION
                  </div>

                  <h2>Detection Overview</h2>
                </div>

                <Target size={22} />
              </div>

              <div className="distribution-content">
                <div
                  className="analytics-donut"
                  style={{
                    background: `conic-gradient(
                      #42df8c 0deg ${normalAngle}deg,
                      #ff6b71 ${normalAngle}deg ${
                        normalAngle + threatAngle
                      }deg,
                      #142432 ${
                        normalAngle + threatAngle
                      }deg 360deg
                    )`,
                  }}
                >
                  <div className="donut-center">
                    <strong>{total}</strong>
                    <span>EVENTS</span>
                  </div>
                </div>

                <div className="distribution-details">
                  <div className="legend-item">
                    <span className="legend-label">
                      <i className="legend-dot normal" />
                      Normal
                    </span>

                    <strong>{normal}</strong>
                  </div>

                  <div className="legend-item">
                    <span className="legend-label">
                      <i className="legend-dot threat" />
                      Ransomware
                    </span>

                    <strong>{ransomware}</strong>
                  </div>

                  <div className="analytics-divider" />

                  <div className="rate-row">
                    <span>Normal classification rate</span>
                    <strong className="green-text">
                      {percentage(normalRate)}
                    </strong>
                  </div>

                  <div className="rate-row">
                    <span>Ransomware classification rate</span>
                    <strong className="red-text">
                      {percentage(threatRate)}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="analytics-panel">
              <div className="analytics-panel-header">
                <div>
                  <div className="eyebrow">
                    MODEL CONFIDENCE
                  </div>

                  <h2>Probability Analysis</h2>
                </div>

                <TrendingUp size={22} />
              </div>

              <div className="confidence-block">
                <div className="confidence-heading">
                  <span>Average Normal Probability</span>
                  <strong>
                    {percentage(averageProbability.normal)}
                  </strong>
                </div>

                <div className="confidence-track">
                  <div
                    className="confidence-fill normal-fill"
                    style={{
                      width: `${Math.min(
                        averageProbability.normal * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="confidence-block">
                <div className="confidence-heading">
                  <span>Average Ransomware Probability</span>
                  <strong>
                    {percentage(
                      averageProbability.ransomware
                    )}
                  </strong>
                </div>

                <div className="confidence-track">
                  <div
                    className="confidence-fill threat-fill"
                    style={{
                      width: `${Math.min(
                        averageProbability.ransomware * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="threshold-card">
                <div className="threshold-icon">
                  <Target size={20} />
                </div>

                <div>
                  <span>SECURITY THRESHOLD</span>
                  <strong>
                    {RANSOMWARE_THRESHOLD * 100}%
                  </strong>

                  <p>
                    Events at or above this confidence are
                    treated as potential ransomware activity.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <section className="analytics-panel analytics-summary">
            <div className="analytics-panel-header">
              <div>
                <div className="eyebrow">
                  SECURITY SUMMARY
                </div>

                <h2>Detection Intelligence</h2>
              </div>

              <Activity size={22} />
            </div>

            <div className="summary-grid">
              <div className="summary-item">
                <span>Events at threshold</span>
                <strong>{aboveThreshold}</strong>
                <small>
                  {total
                    ? percentage(aboveThreshold / total)
                    : "0.0%"}{" "}
                  of analyzed events
                </small>
              </div>

              <div className="summary-item">
                <span>Average normal confidence</span>
                <strong>
                  {percentage(averageProbability.normal)}
                </strong>
                <small>Across recorded events</small>
              </div>

              <div className="summary-item">
                <span>Average ransomware confidence</span>
                <strong>
                  {percentage(
                    averageProbability.ransomware
                  )}
                </strong>
                <small>Across recorded events</small>
              </div>

              <div className="summary-item">
                <span>Database records</span>
                <strong>{history.length}</strong>
                <small>
                  {loading
                    ? "Synchronizing..."
                    : "Currently synchronized"}
                </small>
              </div>
            </div>
          </section>

          <footer className="history-footer">
            <span>SENTINEL AI • RANSOMWARE DEFENSE</span>
            <span>Live analytics • 5 second refresh</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default Analytics;