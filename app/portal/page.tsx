"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { EventEditionRecord } from "@/lib/editions";
import CustomSelect from "@/components/CustomSelect";

interface RoundSubmissions {
  round1?: { pptLink?: string; videoLink?: string; submittedAt?: string };
  round2?: { prototypeLink?: string; videoLink?: string; submittedAt?: string };
  round3?: { deckLink?: string; notes?: string; submittedAt?: string };
}

interface RegisteredEvent {
  id: string;
  event_name: string;
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
  round_status?: string;
  internship_selected?: boolean;
  internship_reason?: string;
  jury_feedback?: string;
  is_past_event?: boolean;
  certificate_issued?: boolean;
  certificate_title?: string;
  certificate_issued_at?: string;
  round_submissions?: RoundSubmissions;
}

interface PortalUser {
  email: string;
  name: string;
  college: string;
  department: string;
  yearOfStudy: string;
  registrations: RegisteredEvent[];
}

type PortalTab = "dashboard" | "my-events" | "certificates";

const LOGO_GRADIENT = "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)";

function getActiveStepIndex(roundStatus?: string): number {
  const s = (roundStatus || "").toLowerCase();
  if (s.includes("winner") || s.includes("round 4") || s.includes("round 3 / 4")) return 3;
  if (s.includes("round 3")) return 2;
  if (s.includes("round 2")) return 1;
  return 0;
}

function getEventDisplayTitle(raw: string, editions: EventEditionRecord[]): string {
  const matched = editions.find((e) => e.slug === raw);
  if (matched) return matched.title;
  if (raw === "shepitch_coimbatore") return "ShePitch Coimbatore Edition";
  if (raw === "shepitch_chennai" || raw === "shepitch") return "ShePitch Chennai Edition 2";
  if (raw === "hackpick") return "HackPick 2026";
  if (raw.startsWith("shepitch_chennai_edition_")) {
    return `ShePitch Chennai Edition ${raw.replace("shepitch_chennai_edition_", "")}`;
  }
  if (raw.startsWith("hackpick_edition_")) {
    return `HackPick Edition ${raw.replace("hackpick_edition_", "")}`;
  }
  return raw.replace(/_/g, " ");
}

export default function ParticipantPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<PortalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PortalTab>("dashboard");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showRoundsPanel, setShowRoundsPanel] = useState(true);
  const [editions, setEditions] = useState<EventEditionRecord[]>([]);

  // Deliverable submission modal
  const [submissionModal, setSubmissionModal] = useState<{
    regId: string;
    eventTitle: string;
    roundNumber: number;
    roundLabel: string;
  } | null>(null);
  const [primaryLink, setPrimaryLink] = useState("");
  const [secondaryLink, setSecondaryLink] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submittingLinks, setSubmittingLinks] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Certificate preview modal
  const [previewCertificate, setPreviewCertificate] = useState<RegisteredEvent | null>(null);

  useEffect(() => {
    const syncTab = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab") || "dashboard";
        if (tab === "my-events" || tab === "past-events") {
          setActiveTab("my-events");
        } else if (tab === "certificates") {
          setActiveTab("certificates");
        } else {
          setActiveTab("dashboard");
        }
      }
    };
    syncTab();

    const handleTabEvent = (e: any) => {
      if (e?.detail === "my-events" || e?.detail === "past-events") {
        setActiveTab("my-events");
      } else if (e?.detail === "certificates") {
        setActiveTab("certificates");
      } else if (e?.detail === "dashboard" || e?.detail === "current-events") {
        setActiveTab("dashboard");
      } else {
        syncTab();
      }
    };

    window.addEventListener("ugham_portal_tab_change", handleTabEvent);
    window.addEventListener("popstate", syncTab);
    return () => {
      window.removeEventListener("ugham_portal_tab_change", handleTabEvent);
      window.removeEventListener("popstate", syncTab);
    };
  }, []);

  useEffect(() => {
    fetch("/api/events/editions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.editions)) {
          setEditions(data.editions);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem("ugham_portal_user");
    if (!raw) {
      router.push("/login");
      return;
    }

    try {
      const parsed: PortalUser = JSON.parse(raw);
      setUser(parsed);

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
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
    const onAuthChange = () => {
      try {
        const refreshed = sessionStorage.getItem("ugham_portal_user");
        if (refreshed) setUser(JSON.parse(refreshed));
      } catch {}
    };
    window.addEventListener("ugham_auth_change", onAuthChange);
    return () => window.removeEventListener("ugham_auth_change", onAuthChange);
  }, [router]);

  const switchPortalTab = (tab: PortalTab) => {
    setActiveTab(tab);
    const targetUrl = tab === "dashboard" ? "/portal" : `/portal?tab=${tab}`;
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", targetUrl);
      window.dispatchEvent(new CustomEvent("ugham_portal_tab_change", { detail: tab }));
    }
  };

  const handleOpenSubmissionModal = (reg: RegisteredEvent, roundNumber: number, roundLabel: string) => {
    const subs = reg.round_submissions || {};
    if (roundNumber === 1) {
      setPrimaryLink(subs.round1?.pptLink || "");
      setSecondaryLink(subs.round1?.videoLink || "");
      setSubmissionNotes("");
    } else if (roundNumber === 2) {
      setPrimaryLink(subs.round2?.prototypeLink || "");
      setSecondaryLink(subs.round2?.videoLink || "");
      setSubmissionNotes("");
    } else {
      setPrimaryLink(subs.round3?.deckLink || "");
      setSecondaryLink("");
      setSubmissionNotes(subs.round3?.notes || "");
    }
    setSubmissionSuccess(false);
    setSubmissionModal({
      regId: reg.id,
      eventTitle: getEventDisplayTitle(reg.event_name, editions),
      roundNumber,
      roundLabel,
    });
  };

  const handleRoundLinksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionModal || !primaryLink.trim() || !user) return;
    setSubmittingLinks(true);

    try {
      const res = await fetch("/api/portal/submit-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: submissionModal.regId,
          roundNumber: submissionModal.roundNumber,
          primaryLink: primaryLink.trim(),
          secondaryLink: secondaryLink.trim(),
          notes: submissionNotes.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.registration) {
        const updatedRegs = user.registrations.map((r) =>
          r.id === submissionModal.regId ? data.registration : r
        );
        const updatedUser = { ...user, registrations: updatedRegs };
        setUser(updatedUser);
        sessionStorage.setItem("ugham_portal_user", JSON.stringify(updatedUser));
        setSubmissionSuccess(true);
        setTimeout(() => {
          setSubmissionModal(null);
          setSubmissionSuccess(false);
          setPrimaryLink("");
          setSecondaryLink("");
          setSubmissionNotes("");
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to save round submission:", err);
    } finally {
      setSubmittingLinks(false);
    }
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
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748b" }}>Loading Student Portal...</span>
        </div>
      </main>
    );
  }

  if (!user) return null;

  const allRegistrations = user.registrations || [];
  const activeRegistrations = allRegistrations.filter((r) => !r.is_past_event);
  const pastRegistrations = allRegistrations.filter((r) => r.is_past_event);
  const certificateRecords = allRegistrations.filter((r) => r.certificate_issued);

  const currentSelectedEvent =
    activeRegistrations.find((r) => r.id === selectedEventId) || activeRegistrations[0] || null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "130px 18px 90px",
        position: "relative",
        overflowX: "hidden",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* VIEW 1: HOME (SPLIT HERO WELCOME BOX + SUMMARY)                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "dashboard" && (
          <div className="step-animate-in" style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
            {/* Expanded Hero Welcome Box with Right-Side Visual Panel */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 60%, #170e36 100%)",
                borderRadius: "26px",
                padding: "clamp(28px, 4.5vw, 46px)",
                minHeight: "360px",
                color: "#ffffff",
                boxShadow: "0 20px 50px rgba(15, 23, 42, 0.16)",
                position: "relative",
                overflow: "hidden",
                border: "1px solid rgba(167, 139, 250, 0.2)",
              }}
            >
              <div className="portal-welcome-hero-grid">
                {/* Left: Student Identity, CTA & Metrics */}
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "22px" }}>
                  <div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 13px",
                        borderRadius: "999px",
                        background: "rgba(16, 185, 129, 0.18)",
                        border: "1px solid rgba(52, 211, 153, 0.28)",
                        color: "#34d399",
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.7px",
                        marginBottom: "14px",
                      }}
                    >
                      VERIFIED STUDENT PORTAL
                    </span>
                    <h1 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 900, margin: "0 0 10px 0", lineHeight: 1.15 }}>
                      Welcome, {user.name}
                    </h1>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 14px", color: "#cbd5e1", fontSize: "14px", marginBottom: "14px" }}>
                      <span>{user.college}</span>
                      <span>•</span>
                      <span>{user.department} ({user.yearOfStudy})</span>
                    </div>
                    <p style={{ color: "rgba(226, 232, 240, 0.85)", fontSize: "14.5px", lineHeight: 1.65, maxWidth: "520px", margin: 0 }}>
                      Track your live competition rounds, submit prototype and pitch deliverables, join event communities, and download verified certificates from one executive workspace.
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => switchPortalTab("my-events")}
                      className="glacier-btn"
                      style={{
                        padding: "12px 24px",
                        borderRadius: "12px",
                        background: LOGO_GRADIENT,
                        color: "#ffffff",
                        border: "1.5px solid transparent",
                        fontSize: "13.5px",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 8px 24px rgba(124, 58, 237, 0.35)",
                      }}
                    >
                      View My Events Flow →
                    </button>
                    <button
                      type="button"
                      onClick={() => switchPortalTab("certificates")}
                      className="glacier-btn"
                      style={{
                        padding: "12px 20px",
                        borderRadius: "12px",
                        background: "rgba(255, 255, 255, 0.1)",
                        border: "1.5px solid rgba(255, 255, 255, 0.24)",
                        color: "#ffffff",
                        fontSize: "13.5px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Certificates ({certificateRecords.length})
                    </button>
                  </div>
                </div>

                {/* Right: Premium Stat & Arena Highlights Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "16px 18px",
                      borderRadius: "16px",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                    }}
                  >
                    <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#a5b4fc", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>
                      Competition Track
                    </span>
                    <strong style={{ fontSize: "16px", color: "#ffffff", display: "block", lineHeight: 1.3 }}>
                      {(user as any).preferredDomain || activeRegistrations[0]?.domain || "Innovation Arena"}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#cbd5e1" }}>Live Portal Synced</span>
                  </div>

                  <div
                    style={{
                      padding: "16px 18px",
                      borderRadius: "16px",
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1px solid rgba(52, 211, 153, 0.25)",
                    }}
                  >
                    <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#6ee7b7", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>
                      Current Stage
                    </span>
                    <strong style={{ fontSize: "15.5px", color: "#ffffff", display: "block", lineHeight: 1.3 }}>
                      {activeRegistrations[0]?.round_status || "Round 1 Active"}
                    </strong>
                    <span style={{ fontSize: "12px", color: "#a7f3d0" }}>Squad Verified</span>
                  </div>

                  <div
                    style={{
                      padding: "16px 18px",
                      borderRadius: "16px",
                      background: "rgba(124, 58, 237, 0.16)",
                      border: "1px solid rgba(192, 132, 252, 0.28)",
                    }}
                  >
                    <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#e9d5ff", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>
                      Portal Passkey
                    </span>
                    <strong style={{ fontSize: "16px", color: "#ffffff", display: "block" }}>
                      UGHAM2026
                    </strong>
                    <span style={{ fontSize: "12px", color: "#ddd6fe" }}>Single Sign-On</span>
                  </div>

                  <div
                    style={{
                      padding: "16px 18px",
                      borderRadius: "16px",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid rgba(255, 255, 255, 0.14)",
                    }}
                  >
                    <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>
                      Deliverables &amp; Juries
                    </span>
                    <strong style={{ fontSize: "15.5px", color: "#ffffff", display: "block", lineHeight: 1.3 }}>
                      Direct Submissions
                    </strong>
                    <span style={{ fontSize: "12px", color: "#cbd5e1" }}>Manage in My Events</span>
                  </div>
                </div>
              </div>

              {/* Essential Summary Strip */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "16px",
                  marginTop: "28px",
                  paddingTop: "22px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.14)",
                }}
              >
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>
                    Active Events
                  </span>
                  <strong style={{ fontSize: "24px", color: "#ffffff" }}>{activeRegistrations.length}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>
                    Past Events
                  </span>
                  <strong style={{ fontSize: "24px", color: "#cbd5e1" }}>{pastRegistrations.length}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>
                    Certificates Received
                  </span>
                  <strong style={{ fontSize: "24px", color: "#34d399" }}>{certificateRecords.length}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase", display: "block" }}>
                    Support Desk
                  </span>
                  <strong style={{ fontSize: "13.5px", color: "#ffffff" }}>ughambusiness@gmail.com</strong>
                </div>
              </div>
            </div>

            {/* Quick Summary Cards of Active Squads */}
            {activeRegistrations.length > 0 && (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1.5px solid #e2e8f0",
                  padding: "24px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                    Active Enrolled Squads
                  </h3>
                  <button
                    type="button"
                    onClick={() => switchPortalTab("my-events")}
                    className="glacier-btn"
                    style={{
                      background: LOGO_GRADIENT,
                      border: "none",
                      color: "#ffffff",
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    Open Step-by-Step Process →
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                  {activeRegistrations.map((reg) => (
                    <div
                      key={reg.id}
                      onClick={() => {
                        setSelectedEventId(reg.id);
                        switchPortalTab("my-events");
                      }}
                      className="glacier-card"
                      style={{
                        padding: "16px 18px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "#7C3AED" }}>
                          {getEventDisplayTitle(reg.event_name, editions)}
                        </span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669" }}>₹{reg.amount_paid} Paid</span>
                      </div>
                      <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginBottom: "4px" }}>
                        Team {reg.team_name}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#64748b" }}>
                        Current Status: <strong style={{ color: "#334155" }}>{reg.round_status || "Round 1 Active"}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* VIEW 2: MY EVENTS (EVENT BUTTONS + VERTICAL PROCESS STEPPER)   */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "my-events" && (
          <div className="step-animate-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0" }}>
                  My Registered Events
                </h2>
                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                  Select an event below to inspect its step-by-step live evaluation timeline and submit round links.
                </p>
              </div>
            </div>

            {activeRegistrations.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1.5px dashed #cbd5e1",
                  padding: "60px 24px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
                  No Active Events Found
                </h3>
                <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "420px", margin: "0 auto 20px" }}>
                  Explore open flagship challenges to register a new squad.
                </p>
                <Link
                  href="/events-hub#event-registration"
                  className="btn-primary glacier-btn"
                  style={{ padding: "12px 26px", borderRadius: "10px", textDecoration: "none", display: "inline-block" }}
                >
                  Browse Events Hub →
                </Link>
              </div>
            ) : (
              <>
                {/* Current Event Selector Dropdown + Show/Close Control */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "18px",
                    border: "1.5px solid #e2e8f0",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "14px",
                  }}
                >
                  <div style={{ flex: "1 1 280px", minWidth: 0 }}>
                    <label style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>
                      Select Active Registered Event ({activeRegistrations.length})
                    </label>
                    <CustomSelect
                      options={activeRegistrations.map((reg) => ({
                        value: reg.id,
                        label: `${getEventDisplayTitle(reg.event_name, editions)} — Team ${reg.team_name} (${reg.round_status || "Round 1 Active"})`,
                      }))}
                      value={currentSelectedEvent?.id || ""}
                      onChange={(val) => {
                        setSelectedEventId(val);
                        setShowRoundsPanel(true);
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowRoundsPanel((prev) => !prev)}
                    className="glacier-btn"
                    style={{
                      padding: "11px 18px",
                      borderRadius: "10px",
                      border: "1.5px solid #cbd5e1",
                      background: showRoundsPanel ? "#f8fafc" : LOGO_GRADIENT,
                      color: showRoundsPanel ? "#0f172a" : "#ffffff",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                      alignSelf: "flex-end",
                    }}
                  >
                    {showRoundsPanel ? "Hide Rounds Flow ▲" : "Open Rounds Flow ▾"}
                  </button>
                </div>

                {/* Single Selected Event Vertical Process Line (Closeable) */}
                {showRoundsPanel && currentSelectedEvent && (() => {
                  const reg = currentSelectedEvent;
                  const isShePitch = reg.event_name.includes("shepitch");
                  const eventTitle = getEventDisplayTitle(reg.event_name, editions);
                  const activeStepIdx = getActiveStepIndex(reg.round_status);
                  const subs = reg.round_submissions || {};

                  const steps = isShePitch
                    ? [
                        {
                          roundNum: 1,
                          stepNum: "01",
                          title: "( SAMPLE PPT ) PPT SUBMISSION & VIDEO SUBMISSION ( DRIVE LINK OR OTHER LINKS )",
                          desc: "Download the official sample pitch PPT format and submit your Google Drive or pitch video link.",
                          certNote: "AUTOMATIC PARTICIPATION CERTIFICATE FOR NOT SELECTED TO ROUND 2",
                          hasSamplePpt: true,
                          canSubmit: true,
                          submitLabel: subs.round1?.pptLink ? "Update Round 1 Links →" : "Upload PPT & Video Links →",
                          existingLinks: subs.round1
                            ? [
                                { label: "PPT / Drive Link", url: subs.round1.pptLink },
                                { label: "Video Pitch Link", url: subs.round1.videoLink },
                              ].filter((item) => item.url)
                            : [],
                        },
                        {
                          roundNum: 2,
                          stepNum: "02",
                          title: "PROTOTYPE SUBMISSION & VIDEO EXPLANATION ( LINKS )",
                          desc: "Submit working codebase / prototype demonstration links with architectural walkthrough.",
                          certNote: "APPRECIATION CERTIFICATE FOR NOT MOVED NEXT",
                          hasSamplePpt: false,
                          canSubmit: true,
                          submitLabel: subs.round2?.prototypeLink ? "Update Prototype Links →" : "Submit Prototype Links →",
                          existingLinks: subs.round2
                            ? [
                                { label: "Prototype Repo / Demo", url: subs.round2.prototypeLink },
                                { label: "Explanation Video", url: subs.round2.videoLink },
                              ].filter((item) => item.url)
                            : [],
                        },
                        {
                          roundNum: 3,
                          stepNum: "03",
                          title: "OFFLINE GRAND FINALE",
                          desc: "Physical on-stage pitch in Chennai before angel investors, venture partners & technical jury.",
                          certNote: "FINAL STAGE: GRANTS, INCUBATION & INTERNSHIPS",
                          hasSamplePpt: false,
                          canSubmit: false,
                          submitLabel: "",
                          existingLinks: [],
                        },
                      ]
                    : [
                        {
                          roundNum: 1,
                          stepNum: "01",
                          title: "( SAMPLE PPT ) PPT SUBMISSION & VIDEO SUBMISSION ( DRIVE LINK OR OTHER LINKS )",
                          desc: "Download the official Sample PPT and upload solution architecture + Drive/Video link.",
                          certNote: "AUTOMATIC PARTICIPATION CERTIFICATE FOR NOT SELECTED TO ROUND 2",
                          hasSamplePpt: true,
                          canSubmit: true,
                          submitLabel: subs.round1?.pptLink ? "Update Round 1 Links →" : "Submit Round 1 Links →",
                          existingLinks: subs.round1
                            ? [
                                { label: "PPT / Drive Link", url: subs.round1.pptLink },
                                { label: "Video Walkthrough", url: subs.round1.videoLink },
                              ].filter((item) => item.url)
                            : [],
                        },
                        {
                          roundNum: 2,
                          stepNum: "02",
                          title: "PROTOTYPE SUBMISSION & VIDEO EXPLANATION ( LINKS )",
                          desc: "Submit working code repository / hardware prototype & technical video demonstration.",
                          certNote: "APPRECIATION CERTIFICATE FOR NOT MOVED NEXT",
                          hasSamplePpt: false,
                          canSubmit: true,
                          submitLabel: subs.round2?.prototypeLink ? "Update Prototype Links →" : "Submit Prototype Links →",
                          existingLinks: subs.round2
                            ? [
                                { label: "Prototype Repo / Demo", url: subs.round2.prototypeLink },
                                { label: "Explanation Video", url: subs.round2.videoLink },
                              ].filter((item) => item.url)
                            : [],
                        },
                        {
                          roundNum: 3,
                          stepNum: "03",
                          title: "( SAMPLE PPT ) PRESENT TO JURIES",
                          desc: "Present live system architecture and technical Q&A defense to industry jury panel.",
                          certNote: "EXCELLENCE CERTIFICATE FOR NOT MOVED NEXT",
                          hasSamplePpt: true,
                          canSubmit: true,
                          submitLabel: subs.round3?.deckLink ? "Update Jury Deck Link →" : "Upload Jury Deck Link →",
                          existingLinks: subs.round3
                            ? [{ label: "Jury Pitch Deck", url: subs.round3.deckLink }].filter((item) => item.url)
                            : [],
                        },
                        {
                          roundNum: 4,
                          stepNum: "04",
                          title: "OFFLINE GRAND FINALE ( BEST TEAM, WINNER TEAM )",
                          desc: "36-hour on-ground championship crowning Best Team & Winner Team with awards & internships.",
                          certNote: "GRAND FINALE: BEST TEAM & WINNER TEAM",
                          hasSamplePpt: false,
                          canSubmit: false,
                          submitLabel: "",
                          existingLinks: [],
                        },
                      ];

                  return (
                    <div
                      key={reg.id}
                      style={{
                        background: "#ffffff",
                        borderRadius: "24px",
                        border: "1.5px solid #e2e8f0",
                        boxShadow: "0 8px 30px rgba(15, 23, 42, 0.04)",
                        padding: "clamp(20px, 4vw, 34px)",
                      }}
                    >
                      {/* Event Summary Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          flexWrap: "wrap",
                          gap: "16px",
                          paddingBottom: "22px",
                          marginBottom: "28px",
                          borderBottom: "1.5px solid #f1f5f9",
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                            <h3 style={{ fontSize: "21px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                              {eventTitle}
                            </h3>
                            <span
                              style={{
                                fontSize: "11.5px",
                                fontWeight: 800,
                                padding: "3px 10px",
                                borderRadius: "6px",
                                background: "#f1f5f9",
                                color: "#334155",
                              }}
                            >
                              {reg.track || "Sprint"} • {reg.domain}
                            </span>
                          </div>
                          <div style={{ fontSize: "13.5px", color: "#64748b" }}>
                            Squad: <strong style={{ color: "#0f172a" }}>{reg.team_name}</strong> • ID: <code style={{ color: "#7C3AED", fontWeight: 700 }}>{reg.id}</code>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          {(() => {
                            const matchedEd = editions.find((e) => e.slug === reg.event_name);
                            const isChennai = reg.event_name.includes("shepitch");
                            const groupLink =
                              matchedEd?.whatsappLink ||
                              (isChennai
                                ? "https://chat.whatsapp.com/invite/ugham-shepitch-chennai"
                                : "https://chat.whatsapp.com/invite/ugham-hackpick-2026");
                            return (
                              <a
                                href={groupLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glacier-btn"
                                style={{
                                  padding: "7px 14px",
                                  borderRadius: "8px",
                                  background: "#065f46",
                                  border: "1px solid #10b981",
                                  color: "#ffffff",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  textDecoration: "none",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.4">
                                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                </svg>
                                <span>Join WhatsApp Group →</span>
                              </a>
                            );
                          })()}

                          {reg.internship_selected && (
                            <span
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                background: "rgba(16, 185, 129, 0.12)",
                                color: "#059669",
                                fontSize: "12px",
                                fontWeight: 800,
                              }}
                            >
                              Internship Shortlisted
                            </span>
                          )}
                          <span
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              background: "#f8fafc",
                              border: "1px solid #cbd5e1",
                              color: "#0f172a",
                              fontSize: "12px",
                              fontWeight: 800,
                            }}
                          >
                            {reg.round_status || "Round 1 Active"}
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowRoundsPanel(false)}
                            aria-label="Close Event Rounds Box"
                            className="glacier-btn"
                            style={{
                              padding: "6px 12px",
                              borderRadius: "8px",
                              background: "#f1f5f9",
                              border: "1px solid #cbd5e1",
                              color: "#475569",
                              fontSize: "12px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            × Close
                          </button>
                        </div>
                      </div>

                      {/* Vertical Step-by-Step Progressive Timeline (Only unlocks Next Round when Qualified) */}
                      {(() => {
                        const isEliminated = (reg.round_status || "").toLowerCase().includes("not selected");
                        const visibleSteps = steps.slice(0, Math.min(steps.length, activeStepIdx + 1));
                        return (
                          <>
                            <div style={{ position: "relative", paddingLeft: "12px" }}>
                              {visibleSteps.map((step, sIdx) => {
                                const isCompleted = sIdx < activeStepIdx;
                                const isCurrent = sIdx === activeStepIdx;
                                const isLast = sIdx === visibleSteps.length - 1;

                          return (
                            <div
                              key={step.stepNum}
                              className="step-animate-in"
                              style={{
                                animationDelay: `${sIdx * 110}ms`,
                                position: "relative",
                                paddingLeft: "44px",
                                paddingBottom: isLast ? "4px" : "30px",
                              }}
                            >
                              {/* Vertical Connecting Line */}
                              {!isLast && (
                                <div
                                  style={{
                                    position: "absolute",
                                    left: "15px",
                                    top: "36px",
                                    bottom: "0",
                                    width: "2px",
                                    background: isCompleted
                                      ? "#10b981"
                                      : isCurrent
                                      ? "linear-gradient(180deg, #7C3AED 0%, #cbd5e1 100%)"
                                      : "#e2e8f0",
                                  }}
                                />
                              )}

                              {/* Step Node Circle */}
                              <div
                                className={isCurrent ? "step-active-node" : ""}
                                style={{
                                  position: "absolute",
                                  left: "0",
                                  top: "2px",
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "50%",
                                  background: isCompleted
                                    ? "#10b981"
                                    : isCurrent
                                    ? LOGO_GRADIENT
                                    : "#ffffff",
                                  border: isCompleted
                                    ? "2px solid #10b981"
                                    : isCurrent
                                    ? "2px solid #7C3AED"
                                    : "2px solid #cbd5e1",
                                  color: isCompleted || isCurrent ? "#ffffff" : "#64748b",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "12px",
                                  fontWeight: 900,
                                  zIndex: 2,
                                }}
                              >
                                {isCompleted ? (
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                ) : (
                                  step.stepNum
                                )}
                              </div>

                              {/* Step Card Body */}
                              <div
                                style={{
                                  padding: "20px 22px",
                                  borderRadius: "16px",
                                  border: isCurrent
                                    ? "1.5px solid #7C3AED"
                                    : isCompleted
                                    ? "1.5px solid rgba(16, 185, 129, 0.35)"
                                    : "1px solid #e2e8f0",
                                  background: isCurrent
                                    ? "rgba(124, 58, 237, 0.03)"
                                    : isCompleted
                                    ? "rgba(16, 185, 129, 0.03)"
                                    : "#f8fafc",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 800,
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      background: isCompleted
                                        ? "rgba(16, 185, 129, 0.14)"
                                        : isCurrent
                                        ? LOGO_GRADIENT
                                        : "#e2e8f0",
                                      color: isCompleted
                                        ? "#059669"
                                        : isCurrent
                                        ? "#ffffff"
                                        : "#475569",
                                    }}
                                  >
                                    {isCompleted
                                      ? `ROUND ${step.stepNum} • CLEARED`
                                      : isCurrent
                                      ? `ROUND ${step.stepNum} • CURRENTLY PROCESSING`
                                      : `ROUND ${step.stepNum} • UPCOMING`}
                                  </span>
                                </div>

                                <h4 style={{ fontSize: "15.5px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0", lineHeight: 1.4 }}>
                                  {step.title}
                                </h4>
                                <p style={{ fontSize: "13.5px", color: "#475569", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                                  {step.desc}
                                </p>

                                <div
                                  style={{
                                    display: "inline-block",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    fontSize: "11.5px",
                                    fontWeight: 800,
                                    color: "#334155",
                                    marginBottom: step.existingLinks.length > 0 || step.canSubmit || step.hasSamplePpt ? "14px" : "0",
                                  }}
                                >
                                  {step.certNote}
                                </div>

                                {/* Already Submitted Round Links */}
                                {step.existingLinks.length > 0 && (
                                  <div
                                    style={{
                                      padding: "10px 14px",
                                      borderRadius: "10px",
                                      background: "#ffffff",
                                      border: "1px solid #cbd5e1",
                                      marginBottom: "12px",
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: "12px",
                                    }}
                                  >
                                    {step.existingLinks.map((lnk, lIdx) => (
                                      <a
                                        key={lIdx}
                                        href={lnk.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: "12px", fontWeight: 700, color: "#7C3AED", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "5px" }}
                                      >
                                        <span>✓ {lnk.label}</span>
                                        <span style={{ color: "#64748b", fontWeight: 500 }}>↗</span>
                                      </a>
                                    ))}
                                  </div>
                                )}

                                {(step.hasSamplePpt || step.canSubmit) && (
                                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" }}>
                                    {step.hasSamplePpt && (
                                      <a
                                        href="https://drive.google.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="glacier-btn"
                                        style={{
                                          padding: "9px 14px",
                                          borderRadius: "8px",
                                          background: "#ffffff",
                                          border: "1.5px solid #cbd5e1",
                                          color: "#0f172a",
                                          fontSize: "12.5px",
                                          fontWeight: 700,
                                          textDecoration: "none",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "6px",
                                        }}
                                      >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                          <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                        <span>Download Sample PPT</span>
                                      </a>
                                    )}
                                    {step.canSubmit && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenSubmissionModal(reg, step.roundNum, `${eventTitle} - ROUND ${step.stepNum}`)}
                                        className="glacier-btn"
                                        style={{
                                          padding: "9px 16px",
                                          borderRadius: "8px",
                                          background: LOGO_GRADIENT,
                                          border: "1.5px solid transparent",
                                          color: "#ffffff",
                                          fontSize: "12.5px",
                                          fontWeight: 800,
                                          cursor: "pointer",
                                          boxShadow: "0 4px 12px rgba(124, 58, 237, 0.22)",
                                        }}
                                      >
                                        {step.submitLabel}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {isEliminated ? (
                        <div
                          style={{
                            marginTop: "14px",
                            padding: "14px 18px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            color: "#334155",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          Evaluation concluded at Round {visibleSteps.length}. Your certificate is issued in the Certificates section.
                        </div>
                      ) : activeStepIdx + 1 < steps.length ? (
                        <div
                          style={{
                            marginTop: "14px",
                            padding: "14px 18px",
                            borderRadius: "12px",
                            background: "rgba(124, 58, 237, 0.04)",
                            border: "1px dashed rgba(124, 58, 237, 0.35)",
                            color: "#4c1d95",
                            fontSize: "13px",
                            fontWeight: 700,
                          }}
                        >
                          Round 0{activeStepIdx + 2} is locked — It unlocks automatically once your squad is selected from Round 0{activeStepIdx + 1}.
                        </div>
                      ) : null}
                          </>
                        );
                      })()}

                      {/* Jury Feedback & Internship Purpose */}
                      {(reg.jury_feedback || reg.internship_reason) && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px", marginTop: "24px" }}>
                          {reg.jury_feedback && (
                            <div
                              style={{
                                padding: "16px 20px",
                                borderRadius: "14px",
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                              }}
                            >
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                                Jury Feedback
                              </span>
                              <p style={{ margin: 0, fontSize: "13.5px", color: "#0f172a", lineHeight: 1.5 }}>
                                {reg.jury_feedback}
                              </p>
                            </div>
                          )}

                          {reg.internship_reason && (
                            <div
                              style={{
                                padding: "16px 20px",
                                borderRadius: "14px",
                                background: "#f8fafc",
                                border: "1px solid #cbd5e1",
                              }}
                            >
                              <span style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                                Internship Evaluation Purpose
                              </span>
                              <p style={{ margin: 0, fontSize: "13.5px", color: "#0f172a", lineHeight: 1.5 }}>
                                {reg.internship_reason}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                          Squad Members:
                        </span>
                        {(reg.members || []).map((m, mIdx) => (
                          <span
                            key={mIdx}
                            style={{
                              background: "#f1f5f9",
                              color: "#334155",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 700,
                            }}
                          >
                            {m.name} ({m.role || "Member"})
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* Past Events Scrollable Archive inside My Events */}
            <div
              style={{
                background: "#ffffff",
                borderRadius: "24px",
                border: "1.5px solid #e2e8f0",
                padding: "clamp(20px, 3.5vw, 30px)",
                marginTop: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0" }}>
                    Past Events Archive ({pastRegistrations.length})
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                    Swipe or scroll horizontally to review completed events, final standings, and certificates.
                  </p>
                </div>
              </div>

              {pastRegistrations.length === 0 ? (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "14px",
                    border: "1px dashed #cbd5e1",
                    padding: "36px 20px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "13.5px",
                  }}
                >
                  No completed past events recorded yet.
                </div>
              ) : (
                <div
                  className="hide-scrollbar"
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "18px",
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    paddingBottom: "4px",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {pastRegistrations.map((ev, idx) => (
                    <div
                      key={ev.id}
                      className="glacier-card"
                      style={{
                        flex: "0 0 min(380px, 85vw)",
                        scrollSnapAlign: "start",
                        background: "#f8fafc",
                        borderRadius: "18px",
                        border: "1.5px solid #e2e8f0",
                        padding: "20px 22px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            #{idx + 1} • {new Date(ev.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} • {ev.domain}
                          </span>
                          <h4 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: "4px 0 0 0" }}>
                            {getEventDisplayTitle(ev.event_name, editions)}
                          </h4>
                        </div>

                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "8px",
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            color: "#0f172a",
                            fontSize: "11.5px",
                            fontWeight: 800,
                          }}
                        >
                          Completed
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "12px",
                          padding: "12px 14px",
                          borderRadius: "10px",
                          background: "#ffffff",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>Squad Name</span>
                          <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{ev.team_name}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>Final Outcome</span>
                          <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{ev.round_status || "Participated"}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>Internship Status</span>
                          <strong style={{ fontSize: "13.5px", color: ev.internship_selected ? "#059669" : "#475569" }}>
                            {ev.internship_selected ? "Selected" : "Completed"}
                          </strong>
                        </div>
                      </div>

                      {ev.jury_feedback && (
                        <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
                          <strong style={{ color: "#0f172a" }}>Jury Note:</strong> {ev.jury_feedback}
                        </div>
                      )}

                      {ev.internship_reason && (
                        <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.5 }}>
                          <strong style={{ color: "#0f172a" }}>Internship Note:</strong> {ev.internship_reason}
                        </div>
                      )}

                      {ev.certificate_issued && (
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => switchPortalTab("certificates")}
                            className="glacier-btn"
                            style={{
                              padding: "8px 16px",
                              borderRadius: "8px",
                              border: "1.5px solid transparent",
                              background: LOGO_GRADIENT,
                              color: "#ffffff",
                              fontSize: "12px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            View Issued Certificate →
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* VIEW 3: CERTIFICATES (ADMIN-ISSUED CREDENTIALS)                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "certificates" && (
          <div className="step-animate-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>
                Certificates
              </h2>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                Official event certificates verified and dispatched by Ugham Administration.
              </p>
            </div>

            {certificateRecords.length === 0 ? (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "20px",
                  border: "1.5px dashed #cbd5e1",
                  padding: "60px 24px",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                No certificates have been issued to your account yet. Certificates are issued automatically upon round completion.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {certificateRecords.map((cert, idx) => (
                  <div
                    key={cert.id}
                    className="glacier-card step-animate-in"
                    style={{
                      animationDelay: `${idx * 90}ms`,
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1.5px solid #e2e8f0",
                      padding: "26px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: "18px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background: "#f1f5f9",
                            color: "#7C3AED",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="12" cy="8" r="6"></circle>
                            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                          </svg>
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", background: "rgba(16, 185, 129, 0.1)", color: "#059669" }}>
                          Verified &amp; Issued
                        </span>
                      </div>

                      <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>
                        {cert.certificate_title || "Certificate of Participation"}
                      </h3>
                      <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#475569", marginBottom: "10px" }}>
                        {getEventDisplayTitle(cert.event_name, editions)}
                      </div>

                      <div style={{ fontSize: "12.5px", color: "#64748b", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span>Recipient: <strong style={{ color: "#0f172a" }}>{user.name}</strong></span>
                        <span>Squad: <strong style={{ color: "#0f172a" }}>{cert.team_name}</strong></span>
                        <span>
                          Issued:{" "}
                          <strong>
                            {new Date(cert.certificate_issued_at || cert.created_at).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewCertificate(cert)}
                      className="glacier-btn"
                      style={{
                        width: "100%",
                        padding: "11px 16px",
                        borderRadius: "10px",
                        border: "1.5px solid transparent",
                        background: LOGO_GRADIENT,
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      View &amp; Download Certificate →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ROUND LINK SUBMISSION MODAL (PERSISTED TO BACKEND & ADMIN TEAMS TAB) ── */}
      {submissionModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSubmissionModal(null)}
        >
          <div
            className="modal-animate-in"
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              padding: "32px",
              maxWidth: "520px",
              width: "100%",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25)",
              border: "1.5px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, background: LOGO_GRADIENT, color: "#ffffff", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase" }}>
                Round {submissionModal.roundNumber} Submission
              </span>
              <button
                type="button"
                onClick={() => setSubmissionModal(null)}
                style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>
            <h3 style={{ fontSize: "19px", fontWeight: 900, color: "#0f172a", margin: "0 0 8px 0" }}>
              {submissionModal.roundLabel}
            </h3>
            <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 18px 0", lineHeight: 1.5 }}>
              Paste your shared Google Drive, GitHub repository, or video demonstration URLs. Submitted links immediately sync with Jury &amp; Admin review panels.
            </p>
            {submissionSuccess ? (
              <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.1)", border: "1.5px solid rgba(16, 185, 129, 0.3)", color: "#059669", fontWeight: 700, fontSize: "14px", textAlign: "center" }}>
                ✓ Links saved and forwarded to Admin Teams Console!
              </div>
            ) : (
              <form onSubmit={handleRoundLinksSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                    {submissionModal.roundNumber === 1
                      ? "PPT / Drive Presentation Link *"
                      : submissionModal.roundNumber === 2
                      ? "Prototype / Code Repo / Demo URL *"
                      : "Jury Presentation Deck Link *"}
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... or https://github.com/..."
                    value={primaryLink}
                    onChange={(e) => setPrimaryLink(e.target.value)}
                    style={{ width: "100%", height: "44px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                {submissionModal.roundNumber !== 3 && (
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                      {submissionModal.roundNumber === 1
                        ? "Pitch Video Submission Link (Drive / YouTube)"
                        : "Prototype Walkthrough Video Link (Drive / YouTube)"}
                    </label>
                    <input
                      type="url"
                      placeholder="https://youtu.be/... or https://drive.google.com/..."
                      value={secondaryLink}
                      onChange={(e) => setSecondaryLink(e.target.value)}
                      style={{ width: "100%", height: "44px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                )}

                {submissionModal.roundNumber === 3 && (
                  <div>
                    <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                      Presentation Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Key architecture metrics or demo credentials..."
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      style={{ width: "100%", height: "44px", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    type="submit"
                    disabled={submittingLinks}
                    className="glacier-btn"
                    style={{
                      flex: 1,
                      height: "44px",
                      borderRadius: "10px",
                      background: LOGO_GRADIENT,
                      color: "#ffffff",
                      border: "1.5px solid transparent",
                      fontSize: "13.5px",
                      fontWeight: 800,
                      cursor: submittingLinks ? "wait" : "pointer",
                    }}
                  >
                    {submittingLinks ? "Saving Links..." : "Confirm Submission"}
                  </button>
                  <button
                    type="button"
                    className="glacier-btn"
                    onClick={() => setSubmissionModal(null)}
                    style={{ padding: "0 16px", height: "44px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── PRINTABLE CERTIFICATE PREVIEW MODAL ── */}
      {previewCertificate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.72)",
            backdropFilter: "blur(10px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setPreviewCertificate(null)}
        >
          <div
            className="modal-animate-in"
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              padding: "36px",
              maxWidth: "700px",
              width: "100%",
              boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
              border: "2px solid #0f172a",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ border: "1.5px solid #cbd5e1", padding: "32px 24px", borderRadius: "12px", background: "#fcfcfd" }}>
              <div style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "2px", color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
                UGHAM INNOVATION STUDIO
              </div>
              <h2 style={{ fontSize: "26px", fontWeight: 900, color: "#0f172a", margin: "0 0 10px 0" }}>
                {previewCertificate.certificate_title || "Certificate of Participation"}
              </h2>
              <p style={{ fontSize: "14px", color: "#475569", margin: "0 0 22px 0" }}>
                This certificate is proudly presented to
              </p>
              <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", borderBottom: "2px solid #0f172a", display: "inline-block", padding: "4px 24px", marginBottom: "16px" }}>
                {user.name}
              </div>
              <p style={{ fontSize: "14px", color: "#475569", lineHeight: 1.6, maxWidth: "520px", margin: "0 auto 24px" }}>
                representing <strong>{previewCertificate.college_name}</strong> as part of squad{" "}
                <strong>{previewCertificate.team_name}</strong> in{" "}
                <strong>{getEventDisplayTitle(previewCertificate.event_name, editions)}</strong>.
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: "14px", flexWrap: "wrap", gap: "8px" }}>
                <span>Certificate ID: <strong style={{ color: "#0f172a" }}>{previewCertificate.id}</strong></span>
                <span>Issued: <strong style={{ color: "#0f172a" }}>{new Date(previewCertificate.certificate_issued_at || previewCertificate.created_at).toLocaleDateString("en-IN")}</strong></span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="glacier-btn"
                style={{ padding: "11px 22px", borderRadius: "10px", border: "1.5px solid transparent", background: LOGO_GRADIENT, color: "#ffffff", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setPreviewCertificate(null)}
                className="glacier-btn"
                style={{ padding: "11px 18px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
