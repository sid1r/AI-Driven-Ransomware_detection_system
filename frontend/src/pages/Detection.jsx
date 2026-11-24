import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  FileWarning,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import AppShell from "../components/AppShell";
import {
  getDetectionHistory,
  getHealth,
  getLatestDetection,
} from "../services/api";

const RANSOMWARE_THRESHOLD = 0.6;
const REFRESH_INTERVAL = 5000;

function percent(value) {
  return `${Math.round(Number(value ?? 0) * 100)}%`;
}

function time(value) {
  if (!value) return "--:--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function date(value) {
  if (!value) return "No date";

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ProbabilityBar({ label, value, danger = false }) {
  const percentage = Math.max(
    0,
    Math.min(100, Number(value ?? 0) * 100)
  );

  return (
    <div className="detect-probability">
      <div className="detect-probability-header">
        <span>{label}</span>
        <strong>{percentage.toFixed(0)}%</strong>
      </div>

      <div className="detect-progress">
        <div
          className={`detect-progress-fill ${
            danger ? "danger" : ""
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function PipelineCard({
  number,
  icon: Icon,
  title,
  description,
  danger = false,
}) {
  return (
    <div className={`detect-pipeline-card ${danger ? "danger" : ""}`}>
      <div className="detect-pipeline-number">{number}</div>

      <div className="detect-pipeline-icon">
        <Icon size={20} />
      </div>

      <div className="detect-pipeline-text">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

function Detection() {
  const [health, setHealth] = useState(null);
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);

    try {
      const [healthData, latestData, historyData] =
        await Promise.all([
          getHealth(),
          getLatestDetection(),
          getDetectionHistory(),
        ]);

      setHealth(healthData);
      setLatest(latestData);
      setHistory(historyData?.detections ?? []);
      setError("");
    } catch (err) {
      console.error("Detection data error:", err);
      setError(
        "Unable to connect to the ransomware detection backend."
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
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadData]);

  const ransomwareProbability = Number(
    latest?.ransomware_probability ?? 0
  );

  const normalProbability = Number(
    latest?.normal_probability ?? 1
  );

  const isRansomware =
    latest?.prediction?.toLowerCase() === "ransomware" ||
    ransomwareProbability >= RANSOMWARE_THRESHOLD;

  const backendOnline =
    health?.status === "healthy";

  const recentEvents = useMemo(() => {
    return [...history]
      .sort(
        (a, b) =>
          new Date(b.timestamp || 0) -
          new Date(a.timestamp || 0)
      )
      .slice(0, 5);
  }, [history]);

  const threatScore = Math.round(
    ransomwareProbability * 100
  );

  return (
    <AppShell
      onRefresh={() => loadData(true)}
      refreshing={refreshing}
    >
      <div className="detect-page">

        {/* PAGE HEADER */}

        <section className="detect-header">
          <div>
            <div className="detect-eyebrow">
              <span />
              REAL-TIME AI ANALYSIS
            </div>

            <h1>Threat Detection</h1>

            <p>
              Monitor AI classifications and ransomware
              detection confidence in real time.
            </p>
          </div>

          <div
            className={`detect-live ${
              isRansomware ? "danger" : ""
            }`}
          >
            <span />
            {isRansomware
              ? "THREAT ACTIVE"
              : "LIVE ENGINE"}
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="detect-error">
            <AlertTriangle size={19} />

            <div>
              <strong>Connection Error</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* THREAT STATUS */}

        <section
          className={`detect-threat ${
            isRansomware ? "danger" : "safe"
          }`}
        >
          <div className="detect-threat-icon">
            {isRansomware ? (
              <ShieldAlert size={27} />
            ) : (
              <ShieldCheck size={27} />
            )}
          </div>

          <div className="detect-threat-main">
            <span>DETECTION ENGINE STATUS</span>

            <h2>
              {isRansomware
                ? "ACTIVE THREAT DETECTED"
                : "NO ACTIVE THREAT DETECTED"}
            </h2>

            <p>
              {isRansomware
                ? `Ransomware probability is ${percent(
                    ransomwareProbability
                  )}, above the configured security threshold.`
                : `Ransomware probability is ${percent(
                    ransomwareProbability
                  )}, below the configured security threshold.`}
            </p>
          </div>

          <div className="detect-threshold">
            <span>SECURITY THRESHOLD</span>
            <strong>60%</strong>
          </div>
        </section>

        {/* MAIN GRID */}

        <div className="detect-main-grid">

          {/* CURRENT ASSESSMENT */}

          <section className="detect-card">
            <div className="detect-card-heading">
              <div>
                <span>AI CLASSIFICATION</span>
                <h2>Current Assessment</h2>
              </div>

              <Activity size={22} />
            </div>

            <div
              className={`detect-result ${
                isRansomware ? "danger" : ""
              }`}
            >
              <div className="detect-result-icon">
                {isRansomware ? (
                  <ShieldAlert size={26} />
                ) : (
                  <ShieldCheck size={26} />
                )}
              </div>

              <div className="detect-result-name">
                <span>MODEL PREDICTION</span>

                <strong>
                  {loading
                    ? "ANALYZING"
                    : isRansomware
                    ? "RANSOMWARE"
                    : "NORMAL"}
                </strong>
              </div>

              <div className="detect-confidence">
                <span>CONFIDENCE</span>

                <strong>
                  {percent(
                    isRansomware
                      ? ransomwareProbability
                      : normalProbability
                  )}
                </strong>
              </div>
            </div>

            <div className="detect-probabilities">
              <ProbabilityBar
                label="Normal Probability"
                value={normalProbability}
              />

              <ProbabilityBar
                label="Ransomware Probability"
                value={ransomwareProbability}
                danger
              />
            </div>

            <div className="detect-model-info">
              <div>
                <span>MODEL</span>
                <strong>Random Forest</strong>
              </div>

              <div>
                <span>CLASSES</span>
                <strong>Normal / Ransomware</strong>
              </div>

              <div>
                <span>THRESHOLD</span>
                <strong>60%</strong>
              </div>
            </div>
          </section>

          {/* LATEST EVENT */}

          <section className="detect-card">
            <div className="detect-card-heading">
              <div>
                <span>OBJECT ANALYSIS</span>
                <h2>Latest File Event</h2>
              </div>

              <div
                className={`detect-status ${
                  isRansomware ? "danger" : ""
                }`}
              >
                {isRansomware ? (
                  <ShieldAlert size={14} />
                ) : (
                  <ShieldCheck size={14} />
                )}

                {isRansomware ? "THREAT" : "SAFE"}
              </div>
            </div>

            <div className="detect-file">
              <div className="detect-file-icon">
                {isRansomware ? (
                  <FileWarning size={24} />
                ) : (
                  <Database size={24} />
                )}
              </div>

              <div>
                <span>ANALYZED FILE</span>

                <strong>
                  {loading
                    ? "Loading..."
                    : latest?.file || "No file recorded"}
                </strong>
              </div>
            </div>

            <div className="detect-event-info">
              <div>
                <span>PREDICTION</span>
                <strong>
                  {latest?.prediction || "Normal"}
                </strong>
              </div>

              <div>
                <span>DETECTION TIME</span>
                <strong>
                  {time(latest?.timestamp)}
                </strong>
              </div>

              <div>
                <span>DETECTION DATE</span>
                <strong>
                  {date(latest?.timestamp)}
                </strong>
              </div>
            </div>

            <div className="detect-probability-cards">
              <div>
                <span>NORMAL</span>
                <strong>
                  {percent(normalProbability)}
                </strong>
              </div>

              <div className={isRansomware ? "danger" : ""}>
                <span>RANSOMWARE</span>
                <strong>
                  {percent(ransomwareProbability)}
                </strong>
              </div>
            </div>
          </section>
        </div>

        {/* THREAT METER */}

        <section className="detect-card detect-meter-card">
          <div className="detect-card-heading">
            <div>
              <span>THREAT CONFIDENCE</span>
              <h2>AI Threat Score</h2>
            </div>

            <Gauge size={22} />
          </div>

          <div className="detect-meter-header">
            <div>
              <span>RANSOMWARE PROBABILITY</span>
              <strong>{threatScore}%</strong>
            </div>

            <div>
              <span>SECURITY THRESHOLD</span>
              <strong>60%</strong>
            </div>
          </div>

          <div className="detect-meter-track">
            <div
              className={`detect-meter-fill ${
                isRansomware ? "danger" : ""
              }`}
              style={{
                width: `${threatScore}%`,
              }}
            />

            <div
              className="detect-meter-marker"
              style={{ left: "60%" }}
            />
          </div>

          <div className="detect-meter-scale">
            <span>0%</span>
            <span>30%</span>
            <span>60%</span>
            <span>100%</span>
          </div>
        </section>

        {/* PIPELINE */}

        <section className="detect-card">
          <div className="detect-card-heading">
            <div>
              <span>DETECTION PIPELINE</span>
              <h2>AI Analysis Process</h2>
            </div>

            <Zap size={22} />
          </div>

          <div className="detect-pipeline">
            <PipelineCard
              number="01"
              icon={FileWarning}
              title="File Event"
              description="Filesystem activity captured"
            />

            <PipelineCard
              number="02"
              icon={Cpu}
              title="Feature Extraction"
              description="Behavioral features collected"
            />

            <PipelineCard
              number="03"
              icon={Sparkles}
              title="AI Classification"
              description="Random Forest evaluates activity"
            />

            <PipelineCard
              number="04"
              icon={
                isRansomware
                  ? ShieldAlert
                  : CheckCircle2
              }
              title="Security Decision"
              description={
                isRansomware
                  ? "Activity exceeds threshold"
                  : "Activity below threshold"
              }
              danger={isRansomware}
            />
          </div>
        </section>

        {/* EVENTS */}

        <section className="detect-card">
          <div className="detect-card-heading">
            <div>
              <span>EVENT STREAM</span>
              <h2>Recent Detection Events</h2>
            </div>

            <div className="detect-event-count">
              <Activity size={15} />
              {recentEvents.length} EVENTS
            </div>
          </div>

          {recentEvents.length === 0 ? (
            <div className="detect-empty">
              <Database size={26} />

              <strong>No detection events</strong>

              <span>
                The detection engine has not recorded
                any events yet.
              </span>
            </div>
          ) : (
            <div className="detect-events">
              {recentEvents.map((event) => {
                const eventThreat =
                  event.prediction?.toLowerCase() ===
                    "ransomware" ||
                  Number(event.ransomware_probability) >=
                    RANSOMWARE_THRESHOLD;

                const eventScore = Math.round(
                  Number(
                    event.ransomware_probability ?? 0
                  ) * 100
                );

                return (
                  <div
                    className={`detect-event ${
                      eventThreat ? "danger" : ""
                    }`}
                    key={event.id}
                  >
                    <div
                      className={`detect-event-icon ${
                        eventThreat ? "danger" : ""
                      }`}
                    >
                      {eventThreat ? (
                        <ShieldAlert size={17} />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}
                    </div>

                    <div className="detect-event-file">
                      <strong>
                        {event.file || "Unknown file"}
                      </strong>

                      <span>
                        Detection #{event.id}
                      </span>
                    </div>

                    <div className="detect-event-time">
                      <Clock3 size={14} />
                      {time(event.timestamp)}
                    </div>

                    <div
                      className={`detect-event-prediction ${
                        eventThreat ? "danger" : ""
                      }`}
                    >
                      {eventThreat
                        ? "RANSOMWARE"
                        : "NORMAL"}
                    </div>

                    <div className="detect-event-score">
                      <span>{eventScore}%</span>

                      <div>
                        <i
                          className={
                            eventThreat ? "danger" : ""
                          }
                          style={{
                            width: `${eventScore}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <footer className="detect-footer">
          <span>SENTINEL AI • RANSOMWARE DEFENSE</span>

          <span>
            {backendOnline
              ? "Live monitoring • 5 second refresh"
              : "Backend connection unavailable"}
          </span>
        </footer>

      </div>
    </AppShell>
  );
}

export default Detection;