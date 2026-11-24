import { useEffect, useState } from "react";
import "../App.css";

import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Volume2,
  RefreshCw,
  FolderOpen,
  Cpu,
  Database,
  Activity,
  Save,
  CheckCircle2,
} from "lucide-react";

import Topbar from "../components/Topbar";

const DEFAULT_SETTINGS = {
  threshold: 60,
  pollingInterval: 5,
  monitoredFolder:
    "C:\\Users\\Dell\\Downloads\\Ransomeware_detection_system\\detection-engine\\demo_folder",
  browserNotifications: true,
  threatSound: true,
  autoRefresh: true,
};

function Settings() {
  const [settings, setSettings] =
    useState(DEFAULT_SETTINGS);

  const [saved, setSaved] =
    useState(false);

  useEffect(() => {
    const stored =
      localStorage.getItem(
        "sentinel-settings"
      );

    if (stored) {
      try {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...JSON.parse(stored),
        });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    }
  }, []);

  const updateSetting = (
    key,
    value
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));

    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem(
      "sentinel-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);

    localStorage.setItem(
      "sentinel-settings",
      JSON.stringify(
        DEFAULT_SETTINGS
      )
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="app-shell">

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            <Shield size={24} />
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

        <nav className="sidebar-nav">

          <a
            href="/"
            className="sidebar-link"
          >
            <Activity size={19} />
            <span>Overview</span>
          </a>

          <a
            href="/detection"
            className="sidebar-link"
          >
            <Cpu size={19} />
            <span>Detection</span>
          </a>

          <a
            href="/history"
            className="sidebar-link"
          >
            <Database size={19} />
            <span>History</span>
          </a>

          <a
            href="/analytics"
            className="sidebar-link"
          >
            <Activity size={19} />
            <span>Analytics</span>
          </a>

          <a
            href="/settings"
            className="sidebar-link active"
          >
            <SettingsIcon size={19} />
            <span>Settings</span>
          </a>

        </nav>

        <div className="sidebar-engine-status">

          <span className="status-dot"></span>

          <div>
            <div className="engine-label">
              DETECTION ENGINE
            </div>

            <div className="engine-online">
              ONLINE
            </div>
          </div>

        </div>

        <div className="sidebar-footer">
          <div>SENTINEL CORE v1.3.0</div>
          <span>Protected Environment</span>
        </div>

      </aside>

      <main className="main-content">

        <Topbar
          title="Settings"
          onRefresh={() => {
            window.location.reload();
          }}
        />

        <div className="page-content settings-page">

          <div className="page-heading">

            <div>

              <div className="eyebrow">
                SYSTEM CONFIGURATION
              </div>

              <h1>
                Security Settings
              </h1>

              <p>
                Configure ransomware detection,
                monitoring and security alert
                preferences.
              </p>

            </div>

            <div className="settings-status">

              <CheckCircle2 size={18} />

              <span>
                Configuration available
              </span>

            </div>

          </div>

          <section className="settings-grid">

            {/* Detection Configuration */}

            <div className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon blue">
                  <Shield size={21} />
                </div>

                <div>
                  <h2>
                    Detection Configuration
                  </h2>

                  <p>
                    Configure the AI security
                    decision threshold.
                  </p>
                </div>

              </div>

              <div className="settings-field">

                <div className="settings-field-top">

                  <div>
                    <strong>
                      Security Threshold
                    </strong>

                    <span>
                      Ransomware confidence
                      required to trigger an
                      alert.
                    </span>
                  </div>

                  <strong className="setting-value">
                    {settings.threshold}%
                  </strong>

                </div>

                <input
                  type="range"
                  min="10"
                  max="95"
                  step="5"
                  value={
                    settings.threshold
                  }
                  onChange={(event) =>
                    updateSetting(
                      "threshold",
                      Number(
                        event.target.value
                      )
                    )
                  }
                />

                <div className="range-labels">
                  <span>10%</span>
                  <span>60%</span>
                  <span>95%</span>
                </div>

              </div>

            </div>

            {/* Monitoring */}

            <div className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon cyan">
                  <RefreshCw size={21} />
                </div>

                <div>
                  <h2>
                    Monitoring
                  </h2>

                  <p>
                    Configure live detection
                    monitoring behavior.
                  </p>
                </div>

              </div>

              <div className="settings-field">

                <label>
                  Polling Interval
                </label>

                <select
                  value={
                    settings.pollingInterval
                  }
                  onChange={(event) =>
                    updateSetting(
                      "pollingInterval",
                      Number(
                        event.target.value
                      )
                    )
                  }
                >
                  <option value={3}>
                    3 seconds
                  </option>

                  <option value={5}>
                    5 seconds
                  </option>

                  <option value={10}>
                    10 seconds
                  </option>

                  <option value={15}>
                    15 seconds
                  </option>

                  <option value={30}>
                    30 seconds
                  </option>
                </select>

              </div>

              <div className="setting-toggle-row">

                <div className="setting-toggle-info">

                  <strong>
                    Automatic Refresh
                  </strong>

                  <span>
                    Keep dashboard data
                    synchronized with the
                    backend.
                  </span>

                </div>

                <button
                  type="button"
                  className={`toggle ${
                    settings.autoRefresh
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    updateSetting(
                      "autoRefresh",
                      !settings.autoRefresh
                    )
                  }
                >
                  <span />
                </button>

              </div>

            </div>

            {/* Protected Folder */}

            <div className="settings-card wide">

              <div className="settings-card-header">

                <div className="settings-card-icon green">
                  <FolderOpen size={21} />
                </div>

                <div>
                  <h2>
                    Protected Environment
                  </h2>

                  <p>
                    Directory monitored by
                    the ransomware detection
                    engine.
                  </p>
                </div>

              </div>

              <div className="folder-display">

                <div className="folder-icon">
                  <FolderOpen size={20} />
                </div>

                <div>

                  <span>
                    MONITORED DIRECTORY
                  </span>

                  <strong>
                    {settings.monitoredFolder}
                  </strong>

                </div>

                <div className="folder-status">
                  <span className="status-dot"></span>
                  ACTIVE
                </div>

              </div>

              <div className="configuration-note">

                <Activity size={16} />

                <span>
                  The detection engine is
                  currently configured to
                  monitor the protected
                  demonstration folder.
                </span>

              </div>

            </div>

            {/* Notifications */}

            <div className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon purple">
                  <Bell size={21} />
                </div>

                <div>
                  <h2>
                    Notifications
                  </h2>

                  <p>
                    Configure security alert
                    behavior.
                  </p>
                </div>

              </div>

              <div className="setting-toggle-row">

                <div className="setting-toggle-info">

                  <strong>
                    Browser Notifications
                  </strong>

                  <span>
                    Display Windows/browser
                    security alerts.
                  </span>

                </div>

                <button
                  type="button"
                  className={`toggle ${
                    settings.browserNotifications
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    updateSetting(
                      "browserNotifications",
                      !settings.browserNotifications
                    )
                  }
                >
                  <span />
                </button>

              </div>

              <div className="setting-toggle-row">

                <div className="setting-toggle-info">

                  <strong>
                    Threat Sound
                  </strong>

                  <span>
                    Play the ransomware
                    warning sound.
                  </span>

                </div>

                <button
                  type="button"
                  className={`toggle ${
                    settings.threatSound
                      ? "on"
                      : ""
                  }`}
                  onClick={() =>
                    updateSetting(
                      "threatSound",
                      !settings.threatSound
                    )
                  }
                >
                  <span />
                </button>

              </div>

              <div className="notification-feature">

                <Volume2 size={17} />

                <span>
                  Threat alarm configured
                  for approximately 5 seconds.
                </span>

              </div>

            </div>

            {/* AI Model */}

            <div className="settings-card">

              <div className="settings-card-header">

                <div className="settings-card-icon orange">
                  <Cpu size={21} />
                </div>

                <div>
                  <h2>
                    AI Detection Model
                  </h2>

                  <p>
                    Current machine-learning
                    configuration.
                  </p>
                </div>

              </div>

              <div className="model-information">

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
                    STATUS
                  </span>

                  <strong className="model-loaded">
                    <span className="status-dot"></span>
                    LOADED
                  </strong>
                </div>

              </div>

            </div>

          </section>

          <div className="settings-actions">

            <button
              type="button"
              className="secondary-settings-button"
              onClick={resetSettings}
            >
              Reset Defaults
            </button>

            <button
              type="button"
              className="primary-settings-button"
              onClick={saveSettings}
            >
              <Save size={17} />

              {saved
                ? "Configuration Saved"
                : "Save Configuration"}
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Settings;