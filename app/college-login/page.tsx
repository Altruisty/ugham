"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CollegeLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCollegeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both your college username and access password.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/college/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials for this institution.");
      }

      // Persist college auth session
      sessionStorage.setItem("ugham_college_user", JSON.stringify(data.college));
      router.push("/college-portal");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your institution credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.08) 0%, transparent 70%), #f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "130px 20px 80px",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "480px", width: "100%", margin: "0 auto" }}>
        {/* Header Tag */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 16px",
              borderRadius: "100px",
              background: "rgba(124, 58, 237, 0.08)",
              border: "1px solid rgba(124, 58, 237, 0.2)",
              color: "#7C3AED",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#7C3AED",
                boxShadow: "0 0 8px #7C3AED",
              }}
            ></span>
            <span>INSTITUTION &amp; UNIVERSITY GATEWAY</span>
          </div>

          <h1
            style={{
              fontSize: "clamp(26px, 4vw, 34px)",
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 0 10px 0",
              letterSpacing: "-0.5px",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            College Partner Portal
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "14px",
              lineHeight: "1.6",
              margin: 0,
            }}
          >
            Sign in with your institution credentials to view enrolled squads, round evaluations, internship selections, and jury feedback.
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "24px",
            border: "1.5px solid #e2e8f0",
            padding: "36px 32px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.04)",
          }}
        >
          {errorMessage && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: "12px",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1.5px solid rgba(239, 68, 68, 0.25)",
                color: "#dc2626",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCollegeLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#334155",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                }}
              >
                College Username / Code *
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                    <path d="M10 6h4"></path>
                  </svg>
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. iit-madras or dean@college.edu"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "10px 14px 10px 42px",
                    borderRadius: "12px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#334155",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Portal Password *
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#94a3b8",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter institution password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    height: "48px",
                    padding: "10px 42px 10px 42px",
                    borderRadius: "12px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: "8px",
                    top: 0,
                    bottom: 0,
                    margin: "auto 0",
                    height: "36px",
                    width: "36px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "50px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
                color: "#ffffff",
                border: "none",
                fontSize: "14px",
                fontWeight: 800,
                cursor: loading ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 8px 24px rgba(124, 58, 237, 0.35)",
                marginTop: "8px",
              }}
            >
              {loading ? (
                <span>Authenticating Institution...</span>
              ) : (
                <>
                  <span>Sign In to College Console</span>
                  <span style={{ fontSize: "16px" }}>→</span>
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "20px",
              borderTop: "1px solid #f1f5f9",
              textAlign: "center",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Need institution credentials or password reset?{" "}
            <a
              href="mailto:ughambusiness@gmail.com"
              style={{ color: "#7C3AED", fontWeight: 700, textDecoration: "none" }}
            >
              ughambusiness@gmail.com
            </a>
          </div>
        </div>

        {/* Other Links */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link
            href="/login"
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#64748b",
              textDecoration: "none",
            }}
          >
            ← Participant / Executive Login Gate
          </Link>
        </div>
      </div>
    </main>
  );
}
