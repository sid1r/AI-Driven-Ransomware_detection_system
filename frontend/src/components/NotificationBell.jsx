import { useEffect, useRef, useState } from "react";

import {
  Bell,
  BellRing,
  CheckCircle2,
  ShieldAlert,
  X,
  Check,
  Trash2,
} from "lucide-react";

import { getLatestDetection } from "../services/api";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const [permission, setPermission] = useState(
    typeof Notification !== "undefined"
      ? Notification.permission
      : "denied"
  );

  const lastDetectionId = useRef(null);
  const initialized = useRef(false);

  // Browser audio system
  const audioContextRef = useRef(null);

  /*
   * ==========================================
   * UNLOCK BROWSER AUDIO
   * ==========================================
   */

  const unlockAudio = async () => {
    try {
      if (!audioContextRef.current) {
        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContext) {
          return;
        }

        audioContextRef.current =
          new AudioContext();
      }

      if (
        audioContextRef.current.state ===
        "suspended"
      ) {
        await audioContextRef.current.resume();
      }
    } catch (error) {
      console.warn(
        "Audio system could not be unlocked:",
        error
      );
    }
  };

  /*
   * ==========================================
   * 5.5 SECOND RANSOMWARE THREAT SOUND
   * ==========================================
   *
   * Pattern:
   *
   * BEEP
   * pause
   * BEEP
   *
   * BEEP
   * pause
   * BEEP
   *
   * BEEP
   * pause
   * BEEP
   *
   * BEEP
   * pause
   * BEEP
   *
   * LONG FINAL BEEP
   *
   * Total duration ≈ 5.4 seconds.
   */

  const playThreatSound = async () => {
    try {
      await unlockAudio();

      const audioContext =
        audioContextRef.current;

      if (!audioContext) {
        return;
      }

      const now =
        audioContext.currentTime;

      /*
       * Create one smooth warning tone.
       */

      const playTone = (
        startTime,
        frequency,
        duration,
        volume = 0.30
      ) => {
        const oscillator =
          audioContext.createOscillator();

        const gain =
          audioContext.createGain();

        oscillator.type = "sine";

        oscillator.frequency.setValueAtTime(
          frequency,
          startTime
        );

        /*
         * Smooth fade in.
         */

        gain.gain.setValueAtTime(
          0.0001,
          startTime
        );

        gain.gain.exponentialRampToValueAtTime(
          volume,
          startTime + 0.03
        );

        /*
         * Smooth fade out.
         */

        gain.gain.exponentialRampToValueAtTime(
          0.0001,
          startTime + duration
        );

        oscillator.connect(gain);

        gain.connect(
          audioContext.destination
        );

        oscillator.start(startTime);

        oscillator.stop(
          startTime + duration
        );
      };

      /*
       * ========================================
       * FIRST WARNING PAIR
       * ========================================
       */

      playTone(
        now,
        880,
        0.35,
        0.30
      );

      playTone(
        now + 0.50,
        880,
        0.35,
        0.30
      );

      /*
       * ========================================
       * SECOND WARNING PAIR
       * ========================================
       */

      playTone(
        now + 1.20,
        880,
        0.35,
        0.30
      );

      playTone(
        now + 1.70,
        880,
        0.35,
        0.30
      );

      /*
       * ========================================
       * THIRD WARNING PAIR
       * ========================================
       */

      playTone(
        now + 2.40,
        880,
        0.35,
        0.30
      );

      playTone(
        now + 2.90,
        880,
        0.35,
        0.30
      );

      /*
       * ========================================
       * FOURTH WARNING PAIR
       * ========================================
       */

      playTone(
        now + 3.60,
        880,
        0.35,
        0.30
      );

      playTone(
        now + 4.10,
        880,
        0.35,
        0.30
      );

      /*
       * ========================================
       * FINAL LONG WARNING
       * ========================================
       */

      playTone(
        now + 4.65,
        660,
        0.75,
        0.35
      );

    } catch (error) {
      console.warn(
        "Threat alert sound could not play:",
        error
      );
    }
  };

  /*
   * ==========================================
   * CHECK BACKEND FOR NEW DETECTION
   * ==========================================
   */

  const checkForAlert = async () => {
    try {
      const detection =
        await getLatestDetection();

      /*
       * No detection available.
       */

      if (
        !detection ||
        !detection.id
      ) {
        return;
      }

      /*
       * ========================================
       * FIRST LOAD
       * ========================================
       *
       * Remember existing detection.
       *
       * Do NOT sound an old alert when
       * the dashboard initially loads.
       */

      if (!initialized.current) {
        lastDetectionId.current =
          detection.id;

        initialized.current = true;

        return;
      }

      /*
       * ========================================
       * SAME DETECTION
       * ========================================
       *
       * Prevent repeated notifications
       * and repeated sounds.
       */

      if (
        detection.id ===
        lastDetectionId.current
      ) {
        return;
      }

      /*
       * ========================================
       * NEW DETECTION
       * ========================================
       */

      lastDetectionId.current =
        detection.id;

      const ransomwareProbability =
        Number(
          detection.ransomware_probability ||
            0
        );

      /*
       * Security threshold = 60%.
       */

      const isRansomware =
        detection.prediction
          ?.toLowerCase() ===
          "ransomware" ||
        ransomwareProbability >= 0.6;

      /*
       * ========================================
       * NORMAL DETECTION
       * ========================================
       *
       * Normal events remain silent.
       */

      if (!isRansomware) {
        return;
      }

      /*
       * ========================================
       * CREATE ALERT
       * ========================================
       */

      const alert = {
        id: detection.id,

        file:
          detection.file ||
          "Unknown file",

        probability:
          Math.round(
            ransomwareProbability * 100
          ),

        timestamp:
          detection.timestamp,

        read: false,
      };

      /*
       * ========================================
       * ADD ALERT TO LIST
       * ========================================
       *
       * Newest alert appears first.
       *
       * Maximum 10 alerts.
       */

      setNotifications(
        (previous) =>
          [alert, ...previous].slice(0, 10)
      );

      /*
       * ========================================
       * 🔊 PLAY 5.5 SECOND SOUND
       * ========================================
       */

      await playThreatSound();

      /*
       * ========================================
       * 🔔 WINDOWS / CHROME NOTIFICATION
       * ========================================
       */

      if (
        typeof Notification !==
          "undefined" &&
        Notification.permission ===
          "granted"
      ) {
        new Notification(
          "🚨 Ransomware Threat Detected",
          {
            body:
              `${alert.file}\n` +
              `Threat confidence: ${alert.probability}%`,

            tag:
              `ransomware-${alert.id}`,
          }
        );
      }

      /*
       * ========================================
       * OPEN NOTIFICATION PANEL
       * ========================================
       */

      setIsOpen(true);

    } catch (error) {
      console.error(
        "Notification check failed:",
        error
      );
    }
  };

  /*
   * ==========================================
   * START LIVE MONITORING
   * ==========================================
   *
   * Backend checked every 5 seconds.
   */

  useEffect(() => {
    checkForAlert();

    const interval =
      setInterval(
        checkForAlert,
        5000
      );

    return () =>
      clearInterval(interval);
  }, []);

  /*
   * ==========================================
   * ENABLE BROWSER NOTIFICATIONS
   * ==========================================
   */

  const enableBrowserNotifications =
    async () => {
      /*
       * Unlock audio when user explicitly
       * enables browser alerts.
       */

      await unlockAudio();

      if (
        typeof Notification ===
        "undefined"
      ) {
        return;
      }

      try {
        const result =
          await Notification.requestPermission();

        setPermission(result);

      } catch (error) {
        console.error(
          "Notification permission failed:",
          error
        );
      }
    };

  /*
   * ==========================================
   * MARK ONE ALERT AS READ
   * ==========================================
   */

  const markAsRead = (id) => {
    setNotifications(
      (previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                read: true,
              }
            : item
        )
    );
  };

  /*
   * ==========================================
   * MARK ALL ALERTS AS READ
   * ==========================================
   */

  const markAllAsRead = () => {
    setNotifications(
      (previous) =>
        previous.map((item) => ({
          ...item,
          read: true,
        }))
    );
  };

  /*
   * ==========================================
   * CLEAR ALL ALERTS
   * ==========================================
   */

  const clearNotifications = () => {
    setNotifications([]);
  };

  /*
   * ==========================================
   * REMOVE ONE ALERT
   * ==========================================
   */

  const removeNotification = (id) => {
    setNotifications(
      (previous) =>
        previous.filter(
          (item) => item.id !== id
        )
    );
  };

  /*
   * ==========================================
   * COUNT UNREAD ALERTS
   * ==========================================
   */

  const unreadCount =
    notifications.filter(
      (item) => !item.read
    ).length;

  /*
   * ==========================================
   * FORMAT TIME
   * ==========================================
   */

  const formatTime = (
    timestamp
  ) => {
    if (!timestamp) {
      return "--";
    }

    const date =
      new Date(timestamp);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "--";
    }

    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /*
   * ==========================================
   * RENDER
   * ==========================================
   */

  return (
    <div className="notification-center">

      {/* =====================================
          NOTIFICATION BUTTON
          ===================================== */}

      <button
        type="button"
        className={`notification-button ${
          unreadCount > 0
            ? "has-alert"
            : ""
        }`}
        onClick={async () => {
          await unlockAudio();

          setIsOpen(
            (value) => !value
          );
        }}
        aria-label="Notifications"
        title="Security notifications"
      >

        {unreadCount > 0 ? (
          <BellRing size={19} />
        ) : (
          <Bell size={19} />
        )}

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}

      </button>

      {/* =====================================
          NOTIFICATION PANEL
          ===================================== */}

      {isOpen && (
        <div className="notification-panel">

          {/* HEADER */}

          <div className="notification-header">

            <div>

              <span className="notification-eyebrow">
                SECURITY ALERTS
              </span>

              <h3>
                Notifications
              </h3>

            </div>

            <button
              type="button"
              className="notification-close"
              onClick={() =>
                setIsOpen(false)
              }
              aria-label="Close notifications"
            >
              <X size={17} />
            </button>

          </div>

          {/* TOOLBAR */}

          {notifications.length >
            0 && (
            <div className="notification-toolbar">

              <span>
                {notifications.length}{" "}

                {notifications.length ===
                1
                  ? "recent alert"
                  : "recent alerts"}
              </span>

              <div className="notification-toolbar-actions">

                <button
                  type="button"
                  onClick={
                    markAllAsRead
                  }
                  title="Mark all as read"
                >
                  <Check size={15} />

                  Mark read
                </button>

                <button
                  type="button"
                  onClick={
                    clearNotifications
                  }
                  title="Clear all alerts"
                >
                  <Trash2 size={15} />

                  Clear
                </button>

              </div>

            </div>
          )}

          {/* ALERT LIST */}

          {notifications.length >
          0 ? (

            <div className="notification-list">

              {notifications.map(
                (alert) => (

                  <div
                    key={alert.id}
                    className={`notification-alert ${
                      alert.read
                        ? "is-read"
                        : ""
                    }`}
                  >

                    {/* ICON */}

                    <div className="notification-alert-icon">

                      <ShieldAlert
                        size={21}
                      />

                    </div>

                    {/* CONTENT */}

                    <div className="notification-alert-content">

                      <div className="notification-alert-title">
                        Ransomware detected
                      </div>

                      <div className="notification-alert-file">
                        {alert.file}
                      </div>

                      <div className="notification-alert-meta">

                        <span>
                          Confidence
                        </span>

                        <strong>
                          {
                            alert.probability
                          }
                          %
                        </strong>

                        <span>
                          {formatTime(
                            alert.timestamp
                          )}
                        </span>

                      </div>

                      <div
                        className={
                          alert.read
                            ? "notification-alert-status viewed"
                            : "notification-alert-status"
                        }
                      >

                        <span className="alert-dot" />

                        {alert.read
                          ? "VIEWED"
                          : "ACTIVE SECURITY ALERT"}

                      </div>

                    </div>

                    {/* MARK READ */}

                    {!alert.read && (
                      <button
                        type="button"
                        className="notification-read"
                        onClick={() =>
                          markAsRead(
                            alert.id
                          )
                        }
                        title="Mark as read"
                        aria-label="Mark as read"
                      >
                        <Check
                          size={17}
                        />
                      </button>
                    )}

                    {/* REMOVE */}

                    <button
                      type="button"
                      className="notification-dismiss"
                      onClick={() =>
                        removeNotification(
                          alert.id
                        )
                      }
                      aria-label="Remove notification"
                      title="Remove alert"
                    >
                      <X size={16} />
                    </button>

                  </div>
                )
              )}

            </div>

          ) : (

            /* EMPTY STATE */

            <div className="notification-empty">

              <CheckCircle2
                size={25}
              />

              <strong>
                No new threats
              </strong>

              <span>
                The detection engine
                has not reported a
                new ransomware alert.
              </span>

            </div>
          )}

          {/* FOOTER */}

          <div className="notification-footer">

            {permission !==
            "granted" ? (

              <button
                type="button"
                className="enable-notifications"
                onClick={
                  enableBrowserNotifications
                }
              >
                <Bell size={15} />

                Enable browser alerts
              </button>

            ) : (

              <div className="notifications-enabled">

                <CheckCircle2
                  size={15}
                />

                Browser alerts enabled

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;