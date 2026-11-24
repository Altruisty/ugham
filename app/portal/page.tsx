"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RegisteredEvent {
  id: string;
  event_name: "shepitch" | "hackpick";
  track?: string;
  domain: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  mobile: string;
  college_name: string;
  year_of_study: string;
  department: string;
  team_size: number;
  amount_paid: number;
  payment_id: string;
  members: Array<{ name: string; email: string; phone?: string; role?: string }>;
  created_at: string;
}

interface PortalUser {
  email: string;
  name: string;
  college: string;
  department: string;
  yearOfStudy: string;
  registrations: RegisteredEvent[];
}

export default function ParticipantPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedSubmissionRound, setSelectedSubmissionRound] = useState<string | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("ugham_portal_user");
    if (!raw) {
      router.push("/login");
      return;
    }

    try {
      const parsed: PortalUser = JSON.parse(raw);
      setUser(parsed);

      // Re-sync with latest registrations from API
      if (parsed.email) {
        fetch(`/api/portal/registrations?email=${encodeURIComponent(parsed.email)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.registrations)) {
              const updatedUser = {
                ...parsed,
                registrations: data.registrations,
              };
              setUser(updatedUser);
              sessionStorage.setItem("ugham_portal_user", JSON.stringify(updatedUser));
            }
          })
          .catch((err) => console.error("Error refreshing registrations:", err));
      }
    } catch (e) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("ugham_portal_user");
    window.dispatchEvent(new Event("ugham_auth_change"));
    router.push("/login");
  };

  const handleMockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionLink.trim()) return;
    setSubmissionSuccess(true);
    setTimeout(() => {
      setSelectedSubmissionRound(null);
      setSubmissionSuccess(false);
      setSubmissionLink("");
    }, 2000);
  };

  if (loading) {
    return (
      <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e2e8f0",
              borderTopColor: "#7C3AED",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          ></div>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748b" }}>Loading Participant Portal...</span>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const registrations = user.registrations || [];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "130px 20px 90px",
        position: "relative",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* ── 1. PARTICIPANT WELCOME HEADER ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
            borderRadius: "24px",
            padding: "36px 32px",
            color: "#ffffff",
            marginBottom: "32px",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle Ambient Badge Glow */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "250px",
              height: "250px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          ></div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 12px",
                  borderRadius: "100px",
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  fontSize: "12px",
                  fontWeight: 800,
                  color: "#34d399",
                  letterSpacing: "0.5px",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#10b981",
                    boxShadow: "0 0 8px #10b981",
                  }}
                ></span>
                <span>VERIFIED ACTIVE COMPETITOR</span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 34px)",
                  fontWeight: 900,
                  margin: "0 0 8px 0",
                  letterSpacing: "-0.5px",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Welcome back, {user.name}!
              </h1>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "#cbd5e1", fontSize: "13.5px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  {user.email}
                </span>

                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2.2">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                  </svg>
                  {user.college}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <Link
                href="/events-hub#event-registration"
                style={{
                  padding: "11px 22px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 6px 20px rgba(124, 58, 237, 0.4)",
                  transition: "transform 0.2s ease",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Register for More Events</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  padding: "11px 18px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
              marginTop: "28px",
              paddingTop: "24px",
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
            }}
          >
            <div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                Registered Events
              </div>
              <div style={{ fontSize: "26px", fontWeight: 900, color: "#ffffff", marginTop: "4px" }}>
                {registrations.length}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                Active Round Status
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#a78bfa", marginTop: "6px" }}>
                Round 02: Review
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                Default Event Pass
              </div>
              <div style={{ fontSize: "15px", fontWeight: 800, color: "#34d399", marginTop: "6px" }}>
                UGHAM2026 (Active)
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                Official Support
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#ffffff", marginTop: "6px" }}>
                ughambusiness@gmail.com
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. MY REGISTERED EVENTS & UNSTOP-STYLE ROUNDS ROADMAP ── */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 900,
                  color: "#0f172a",
                  margin: "0 0 4px 0",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                My Registered Events &amp; Competition Flow
              </h2>
              <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0 }}>
                Track submission deadlines, evaluation stages, and milestone progression for each competition.
              </p>
            </div>
          </div>

          {registrations.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                border: "1.5px dashed #cbd5e1",
                padding: "60px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "rgba(124, 58, 237, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  color: "#7C3AED",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>
                No Active Registrations Found
              </h3>
              <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "420px", margin: "0 auto 20px" }}>
                You have not registered for any events under this email yet. Explore ShePitch 2026 or HackPick 2026 to start!
              </p>
              <Link href="/events-hub#event-registration" className="btn-primary" style={{ padding: "12px 28px" }}>
                Register Your Squad
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {registrations.map((reg, regIndex) => {
                const isShePitch = reg.event_name === "shepitch";
                const eventDisplayName = isShePitch ? "UGHAM SHEPITCH 2026" : "UGHAM HACKPICK 2026";
                const eventBadgeColor = isShePitch ? "#C026D3" : "#3B82F6";

                return (
                  <div
                    key={reg.id || regIndex}
                    style={{
                      background: "#ffffff",
                      borderRadius: "24px",
                      border: "1.5px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Event Banner Header */}
                    <div
                      style={{
                        padding: "24px 28px",
                        background: isShePitch
                          ? "linear-gradient(135deg, rgba(192, 38, 211, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)"
                          : "linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)",
                        borderBottom: "1.5px solid #e2e8f0",
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "14px",
                            background: eventBadgeColor,
                            color: "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            boxShadow: `0 8px 18px ${eventBadgeColor}40`,
                          }}
                        >
                          {isShePitch ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-5 6.6V18h3v2h-3v2h-2v-2h-3v-2h3v-2.4C7 14.5 5 12 5 9a7 7 0 0 1 7-7z"></path>
                            </svg>
                          ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="16 18 22 12 16 6"></polyline>
                              <polyline points="8 6 2 12 8 18"></polyline>
                            </svg>
                          )}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <h3 style={{ fontSize: "19px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                              {eventDisplayName}
                            </h3>
                            <span
                              style={{
                                background: isShePitch ? "#fdf2f8" : "#eff6ff",
                                color: eventBadgeColor,
                                border: `1px solid ${eventBadgeColor}40`,
                                padding: "3px 10px",
                                borderRadius: "6px",
                                fontSize: "11.5px",
                                fontWeight: 800,
                              }}
                            >
                              {reg.track || "Sprint Arena"} • {reg.domain}
                            </span>
                          </div>

                          <div style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
                            Squad: <strong style={{ color: "#0f172a" }}>{reg.team_name}</strong> | Leader: {reg.leader_name}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, textTransform: "uppercase", display: "block" }}>
                            Registration ID
                          </span>
                          <code style={{ fontSize: "12.5px", fontWeight: 800, color: "#7C3AED" }}>
                            {reg.id}
                          </code>
                        </div>

                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            borderRadius: "100px",
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#059669",
                            fontSize: "12px",
                            fontWeight: 800,
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          ₹{reg.amount_paid} Paid
                        </span>
                      </div>
                    </div>

                    {/* Unstop / HackerEarth Style Competition Timeline & Rounds */}
                    <div style={{ padding: "32px 28px" }}>
                      <div style={{ marginBottom: "20px" }}>
                        <h4
                          style={{
                            fontSize: "15px",
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: "0 0 6px 0",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Competition Roadmap &amp; Round Progression
                        </h4>
                        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                          Follow the official stage flow from roster lock to live demo and studio incubation.
                        </p>
                      </div>

                      {/* ROUNDS TIMELINE GRID */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                          gap: "18px",
                        }}
                      >
                        {/* ROUND 01: SQUAD ROSTER LOCK */}
                        <div
                          style={{
                            padding: "20px",
                            borderRadius: "16px",
                            background: "rgba(16, 185, 129, 0.05)",
                            border: "1.5px solid rgba(16, 185, 129, 0.3)",
                            position: "relative",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                background: "#10b981",
                                color: "#ffffff",
                                padding: "3px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              ROUND 01
                            </span>
                            <span
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 800,
                                color: "#059669",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Completed
                            </span>
                          </div>

                          <h5 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                            Squad Roster &amp; Domain Lock
                          </h5>
                          <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: "1.5", margin: "0 0 12px 0" }}>
                            Team composition finalized, specialized sector track locked, and dispatch credentials generated.
                          </p>
                          <div style={{ fontSize: "11.5px", color: "#059669", fontWeight: 700 }}>
                            Status: Verified &amp; Confirmed
                          </div>
                        </div>

                        {/* ROUND 02: PROTOTYPE & ARCHITECTURE REVIEW (ACTIVE ROUND) */}
                        <div
                          style={{
                            padding: "20px",
                            borderRadius: "16px",
                            background: "rgba(124, 58, 237, 0.06)",
                            border: "2px solid #7C3AED",
                            boxShadow: "0 8px 24px rgba(124, 58, 237, 0.12)",
                            position: "relative",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                background: "#7C3AED",
                                color: "#ffffff",
                                padding: "3px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              ROUND 02 (CURRENT)
                            </span>
                            <span
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 800,
                                color: "#7C3AED",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                              }}
                            >
                              <span
                                style={{
                                  width: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  background: "#7C3AED",
                                  boxShadow: "0 0 8px #7C3AED",
                                }}
                              ></span>
                              In Progress
                            </span>
                          </div>

                          <h5 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                            Prototype &amp; Architecture Review
                          </h5>
                          <p style={{ fontSize: "12.5px", color: "#475569", lineHeight: "1.5", margin: "0 0 14px 0" }}>
                            Technical architecture review, mentor feedback clinics, and functional code/deck submission.
                          </p>

                          <button
                            type="button"
                            onClick={() => setSelectedSubmissionRound(`${eventDisplayName} - Round 02`)}
                            style={{
                              width: "100%",
                              padding: "9px 14px",
                              borderRadius: "10px",
                              background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
                              color: "#ffffff",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="17 8 12 3 7 8"></polyline>
                              <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            <span>Upload Submission</span>
                          </button>
                        </div>

                        {/* ROUND 03: GRAND JURY DEMO */}
                        <div
                          style={{
                            padding: "20px",
                            borderRadius: "16px",
                            background: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            position: "relative",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                background: "#94a3b8",
                                color: "#ffffff",
                                padding: "3px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              ROUND 03
                            </span>
                            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>
                              Upcoming
                            </span>
                          </div>

                          <h5 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                            Grand Jury Live Pitch
                          </h5>
                          <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.5", margin: "0 0 12px 0" }}>
                            Live on-stage demonstration of working software/hardware prototypes before venture capital judges.
                          </p>
                          <div style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>
                            Scheduled: Post Round 02 Clearance
                          </div>
                        </div>

                        {/* FINALS & RESULTS */}
                        <div
                          style={{
                            padding: "20px",
                            borderRadius: "16px",
                            background: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            position: "relative",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                background: "#6366f1",
                                color: "#ffffff",
                                padding: "3px 8px",
                                borderRadius: "6px",
                              }}
                            >
                              FINALS
                            </span>
                            <span style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b" }}>
                              Results Stage
                            </span>
                          </div>

                          <h5 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                            Seed Grants &amp; Studio Incubation
                          </h5>
                          <p style={{ fontSize: "12.5px", color: "#64748b", lineHeight: "1.5", margin: "0 0 12px 0" }}>
                            Distribution of equity-free cash awards, cloud resource packages, and Ugham Studio incubation slots.
                          </p>
                          <div style={{ fontSize: "11.5px", color: "#6366f1", fontWeight: 700 }}>
                            Status: Awaiting Jury Verdict
                          </div>
                        </div>
                      </div>

                      {/* Squad Members Quick Strip */}
                      <div
                        style={{
                          marginTop: "24px",
                          paddingTop: "20px",
                          borderTop: "1px solid #f1f5f9",
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                            Squad Composition:
                          </span>
                          {(reg.members || []).map((m, mIndex) => (
                            <span
                              key={mIndex}
                              style={{
                                background: "#f1f5f9",
                                color: "#334155",
                                padding: "3px 10px",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 700,
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              {m.name} ({m.email})
                            </span>
                          ))}
                        </div>

                        <Link
                          href="/events-hub"
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 700,
                            color: "#7C3AED",
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <span>Review Event Brief</span>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── 3. EXPLORE MORE EVENTS BANNER ── */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.05) 0%, rgba(192, 38, 211, 0.08) 100%)",
            borderRadius: "20px",
            border: "1.5px solid rgba(124, 58, 237, 0.2)",
            padding: "32px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>
              Interested in Competing in More Arenas?
            </h3>
            <p style={{ color: "#64748b", fontSize: "14px", margin: 0, maxWidth: "600px" }}>
              Students can register for both <strong>ShePitch 2026</strong> and <strong>HackPick 2026</strong>. Add new squads or pitch blueprints to maximize your innovation exposure.
            </p>
          </div>

          <Link
            href="/events-hub#event-registration"
            className="btn-primary"
            style={{
              padding: "13px 28px",
              borderRadius: "12px",
              fontSize: "13.5px",
              fontWeight: 800,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Explore Flagship Challenges →
          </Link>
        </div>
      </div>

      {/* ── SUBMISSION MODAL ── */}
      {selectedSubmissionRound && (
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
          }}
          onClick={() => setSelectedSubmissionRound(null)}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "500px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.2)",
              border: "1.5px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  background: "#7C3AED",
                  color: "#ffffff",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                }}
              >
                Deliverable Portal
              </span>
              <button
                type="button"
                onClick={() => setSelectedSubmissionRound(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 8px 0" }}>
              Submit for {selectedSubmissionRound}
            </h3>
            <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 20px 0", lineHeight: "1.5" }}>
              Provide your squad&apos;s project repository link (GitHub/GitLab) or cloud presentation link (Google Drive/Figma) for jury review.
            </p>

            {submissionSuccess ? (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1.5px solid rgba(16, 185, 129, 0.3)",
                  color: "#059669",
                  fontWeight: 700,
                  fontSize: "14px",
                  textAlign: "center",
                }}
              >
                ✓ Submission recorded successfully! Jury evaluation in queue.
              </div>
            ) : (
              <form onSubmit={handleMockSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                    Project Link / Repository URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/your-team/project"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    style={{
                      width: "100%",
                      height: "46px",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "13.5px",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      height: "46px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "13.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Confirm Submission
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSubmissionRound(null)}
                    style={{
                      padding: "0 18px",
                      height: "46px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      background: "#ffffff",
                      color: "#64748b",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
