"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  // Form State: Single unified Username & Password
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Modal State for Unregistered Users
  const [showUnregisteredModal, setShowUnregisteredModal] = useState(false);
  const [unregisteredEmail, setUnregisteredEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple clicks

    setErrorMessage("");
    setLoading(true);

    try {
      const u = username.trim();
      const p = password.trim();

      if (!u || !p) {
        setErrorMessage("Please enter both username and password.");
        setLoading(false);
        return;
      }

      // Call central verification API
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: p }),
      });

      const data = await res.json();

      if (data.success) {
        if (data.role === "admin") {
          // Admin Authorized
          sessionStorage.setItem("ugham_admin_auth", "true");
          window.dispatchEvent(new Event("ugham_auth_change"));
          window.location.href = data.redirectUrl || "/myadmin";
        } else {
          // Participant Authorized
          sessionStorage.setItem("ugham_portal_user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("ugham_auth_change"));
          window.location.href = "/portal";
        }
      } else {
        if (data.notRegistered) {
          // User is not registered in any event
          setUnregisteredEmail(u);
          setShowUnregisteredModal(true);
        } else {
          setErrorMessage(data.error || "Login failed. Please verify your credentials.");
        }
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage("Could not reach authentication server. Please check your network connection.");
      setLoading(false);
    }
  };

  return (
    <main className="login-page-bg">
      {/* Background Soft Ambient Light */}
      <div
        style={{
          position: "absolute",
          width: "min(560px, 92vw)",
          height: "360px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.09) 0%, rgba(192, 38, 211, 0.04) 50%, transparent 75%)",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      ></div>

      <div className="login-card-container">
        {/* Brand Crest & Heading */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "18px",
              background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(192, 38, 211, 0.1) 100%)",
              border: "1.5px solid rgba(124, 58, 237, 0.22)",
              color: "#7C3AED",
              marginBottom: "18px",
              boxShadow: "0 10px 24px -6px rgba(124, 58, 237, 0.22)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>

          <h1
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 0 10px 0",
              letterSpacing: "-0.8px",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Sign In to Your Account
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "14.5px",
              margin: 0,
              lineHeight: "1.6",
              fontFamily: "'Inter', sans-serif",
              maxWidth: "400px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Enter your registered credentials to access your event roadmaps, team briefing, and competition rounds.
          </p>
        </div>

        {/* Premium Form Card */}
        <div className="login-premium-card">
          {/* Quick Credential Pill Helper */}
          <div className="login-default-pass-pill">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <span>Default Pass:</span>
              <code
                style={{
                  color: "#0f172a",
                  fontWeight: 800,
                  background: "#ffffff",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  fontFamily: "monospace",
                  fontSize: "12px",
                }}
              >
                UGHAM2026
              </code>
            </div>
            <button
              type="button"
              onClick={() => setPassword("UGHAM2026")}
              style={{
                background: "#ffffff",
                border: "1px solid rgba(124, 58, 237, 0.3)",
                color: "#7C3AED",
                borderRadius: "8px",
                padding: "5px 10px",
                fontSize: "11.5px",
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontFamily: "'Inter', sans-serif",
                transition: "all 0.15s ease",
              }}
            >
              Auto-Fill
            </button>
          </div>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Username / Email Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 800,
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: "8px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Username (Email Address) *
              </label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "15px", color: "#94a3b8", display: "flex", pointerEvents: "none" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="e.g. member@example.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                  className="login-field-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#334155",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Password *
                </label>
                <span style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 600 }}>
                  Case sensitive
                </span>
              </div>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <span style={{ position: "absolute", left: "15px", color: "#94a3b8", display: "flex", pointerEvents: "none" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="login-field-input"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    background: "transparent",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div
                style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  border: "1.5px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Premium Login Button with Smooth Left-to-Right Hover Arrow Glide */}
            <button
              type="submit"
              disabled={loading}
              className="btn-login-glide"
            >
              {loading ? (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" stroke="currentColor"></circle>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
                  </svg>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span className="btn-arrow-track">
                    <span className="btn-arrow-svg">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </span>
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security & Support Footer */}
        <div style={{ textAlign: "center", marginTop: "28px", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>256-Bit SSL Encrypted Portal • Official Domain Relay • UGHAM Innovation</span>
          </div>
          <div>
            <Link
              href="/events-hub#event-registration"
              style={{
                color: "#64748b",
                fontSize: "13.5px",
                textDecoration: "none",
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                transition: "color 0.2s ease",
              }}
            >
              New participant? <span style={{ color: "var(--primary)", fontWeight: 700 }}>Register for an Event &rarr;</span>
            </Link>
          </div>
          <div>
            <Link
              href="/college-login"
              style={{
                color: "#7C3AED",
                fontSize: "13px",
                textDecoration: "none",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(124, 58, 237, 0.08)",
                border: "1px solid rgba(124, 58, 237, 0.15)",
                padding: "6px 14px",
                borderRadius: "8px",
              }}
            >
              <span>🏛 College / Institution Login Portal &rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── POPUP MODAL: UNREGISTERED USER ── */}
      {showUnregisteredModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setShowUnregisteredModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "36px 30px",
              maxWidth: "480px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.2)",
              border: "1.5px solid #e2e8f0",
              animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: "rgba(245, 158, 11, 0.12)",
                border: "2px solid rgba(245, 158, 11, 0.3)",
                color: "#d97706",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>

            <h3
              style={{
                fontSize: "22px",
                fontWeight: 900,
                color: "#0f172a",
                margin: "0 0 12px 0",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Kindly Register for Any One of the Events
            </h3>

            <p style={{ color: "#475569", fontSize: "14.5px", lineHeight: "1.6", margin: "0 0 24px 0", fontFamily: "'Inter', sans-serif" }}>
              No active squad registration was found for{" "}
              <strong style={{ color: "#0f172a", wordBreak: "break-all" }}>{unregisteredEmail}</strong>.
              <br />
              Please register your team for <strong>ShePitch Chennai Edition 2</strong>, <strong>ShePitch Coimbatore Edition</strong>, or <strong>HackPick 2026</strong> to generate your participant portal credentials and access competition rounds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link
                href="/events-hub#event-registration"
                style={{
                  width: "100%",
                  height: "48px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
                  color: "#ffffff",
                  textDecoration: "none",
                  boxShadow: "0 4px 18px rgba(124, 58, 237, 0.35)",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                <span>Register for Events Hub</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>

              <button
                type="button"
                onClick={() => setShowUnregisteredModal(false)}
                style={{
                  width: "100%",
                  height: "44px",
                  borderRadius: "12px",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  border: "1.5px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Try Another Email
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
