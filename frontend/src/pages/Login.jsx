import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  LockKeyhole,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Activity,
  Cpu,
  Radar,
} from "lucide-react";

import {
  login,
  isAuthenticated,
} from "../services/auth";

import "./Login.css";


function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }


  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError(
        "Please enter your username and password."
      );
      return;
    }

    try {

      setLoading(true);

      await login(
        username.trim(),
        password
      );

      navigate("/", {
        replace: true,
      });

    } catch (err) {

      const message =
        err.response?.data?.detail ||
        "Unable to sign in. Please check your credentials.";

      setError(message);

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="login-page">

      <div className="login-background-grid"></div>

      <div className="login-glow login-glow-one"></div>
      <div className="login-glow login-glow-two"></div>


      <div className="login-shell">


        {/* =========================================
            BRAND PANEL
        ========================================= */}

        <section className="login-brand-panel">

          <div className="login-brand">

            <div className="login-brand-icon">
              <ShieldCheck size={30} />
            </div>

            <div>
              <div className="login-brand-name">
                SENTINEL
              </div>

              <div className="login-brand-subtitle">
                AI SECURITY CONSOLE
              </div>
            </div>

          </div>


          <div className="login-hero">

            <div className="login-eyebrow">
              <span className="login-live-dot"></span>
              SECURITY OPERATIONS CENTER
            </div>

            <h1>
              Intelligent
              <span> ransomware </span>
              defense.
            </h1>

            <p>
              Monitor file activity, detect suspicious
              behavior, and respond to ransomware
              threats through an AI-powered security
              console.
            </p>

          </div>


          <div className="login-feature-grid">

            <div className="login-feature-card">

              <Radar size={20} />

              <div>
                <strong>Live Detection</strong>
                <span>
                  Continuous file monitoring
                </span>
              </div>

            </div>


            <div className="login-feature-card">

              <Cpu size={20} />

              <div>
                <strong>AI Classification</strong>
                <span>
                  Machine-learning threat analysis
                </span>
              </div>

            </div>


            <div className="login-feature-card">

              <Activity size={20} />

              <div>
                <strong>Threat Intelligence</strong>
                <span>
                  Real-time security visibility
                </span>
              </div>

            </div>

          </div>


          <div className="login-brand-footer">
            <span>LOCAL SECURITY ENVIRONMENT</span>
            <span>•</span>
            <span>PROTECTED SESSION</span>
          </div>

        </section>


        {/* =========================================
            LOGIN PANEL
        ========================================= */}

        <section className="login-form-panel">

          <div className="login-form-container">

            <div className="login-mobile-logo">

              <div className="login-brand-icon">
                <ShieldCheck size={26} />
              </div>

              <div>
                <strong>SENTINEL</strong>
                <span>AI SECURITY CONSOLE</span>
              </div>

            </div>


            <div className="login-form-heading">

              <div className="login-form-status">
                <span></span>
                AUTHENTICATION REQUIRED
              </div>

              <h2>
                Welcome back
              </h2>

              <p>
                Sign in to access the security
                monitoring console.
              </p>

            </div>


            <form
              className="login-form"
              onSubmit={handleSubmit}
            >

              {/* USERNAME */}

              <div className="login-field">

                <label htmlFor="username">
                  Username
                </label>

                <div className="login-input-wrapper">

                  <User size={18} />

                  <input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    autoComplete="username"
                    disabled={loading}
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="login-field">

                <label htmlFor="password">
                  Password
                </label>

                <div className="login-input-wrapper">

                  <LockKeyhole size={18} />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

              </div>


              {/* ERROR */}

              {error && (
                <div className="login-error">
                  <span className="login-error-icon">
                    !
                  </span>

                  <span>{error}</span>
                </div>
              )}


              {/* SUBMIT */}

              <button
                className="login-submit"
                type="submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="login-spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} />
                  </>
                )}

              </button>

            </form>


            <div className="login-security-note">

              <LockKeyhole size={15} />

              <span>
                Your session is secured using
                token-based authentication.
              </span>

            </div>


            <div className="login-version">
              SENTINEL SECURITY CONSOLE
              <span>v1.0</span>
            </div>

          </div>

        </section>

      </div>

    </div>
  );
}


export default Login;