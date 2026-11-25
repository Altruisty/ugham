"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as XLSX from "xlsx";

interface CollegeUser {
  collegeName: string;
  username: string;
  contactEmail?: string;
}

interface TeamMember {
  name: string;
  email: string;
  role?: string;
  phone?: string;
}

interface CollegeRegistration {
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
  members: TeamMember[];
  created_at: string;
  round_status?: string;
  internship_selected?: boolean;
  internship_reason?: string;
  jury_feedback?: string;
}

export default function CollegePortalPage() {
  const router = useRouter();
  const [college, setCollege] = useState<CollegeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<CollegeRegistration[]>([]);
  const [activeTab, setActiveTab] = useState<"teams" | "rounds" | "internships" | "feedback">("teams");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("ugham_college_user");
    if (!raw) {
      router.push("/college-login");
      return;
    }

    try {
      const parsed: CollegeUser = JSON.parse(raw);
      setCollege(parsed);

      fetch(`/api/college/portal?collegeName=${encodeURIComponent(parsed.collegeName)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.teams)) {
            setTeams(data.teams);
          }
        })
        .catch((err) => console.error("Error loading college teams:", err))
        .finally(() => setLoading(false));
    } catch {
      router.push("/college-login");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("ugham_college_user");
    router.push("/college-login");
  };

  const getEventName = (raw: string) => {
    if (raw === "shepitch_chennai" || raw === "shepitch") return "ShePitch Chennai Edition 2";
    if (raw === "shepitch_coimbatore") return "ShePitch Coimbatore Edition";
    return "HackPick 2026";
  };

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.team_name.toLowerCase().includes(q) ||
      t.leader_name.toLowerCase().includes(q) ||
      t.leader_email.toLowerCase().includes(q) ||
      t.domain.toLowerCase().includes(q) ||
      getEventName(t.event_name).toLowerCase().includes(q) ||
      (t.members && t.members.some((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)))
    );
  });

  const totalStudents = teams.reduce((sum, t) => sum + (t.team_size || 0), 0);
  const totalInternships = teams.filter((t) => t.internship_selected).length;

  const handleExportExcel = () => {
    if (teams.length === 0) return;

    const rows = teams.map((t, idx) => ({
      "S.No": idx + 1,
      "Registration ID": t.id,
      "Competition": getEventName(t.event_name),
      "Track": t.track || "Sprint Arena",
      "Domain": t.domain,
      "Squad Name": t.team_name,
      "Team Size": t.team_size,
      "Leader Name": t.leader_name,
      "Leader Email": t.leader_email,
      "Department": t.department,
      "Year of Study": t.year_of_study,
      "Round Status": t.round_status || "Round 1: Screening",
      "Internship Selected": t.internship_selected ? "YES" : "NO",
      "Jury Feedback": t.jury_feedback || "Evaluation in progress",
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "College Squads");
    XLSX.writeFile(wb, `${college?.collegeName || "College"}_Ugham_Squads.xlsx`);
  };

  if (loading) {
    return (
      <main style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              border: "3px solid #e2e8f0",
              borderTopColor: "#7C3AED",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          ></div>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#64748b" }}>Loading College Dashboard...</span>
        </div>
      </main>
    );
  }

  if (!college) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "130px 20px 80px",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        {/* Header Console */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
            borderRadius: "24px",
            padding: "36px 32px",
            color: "#ffffff",
            marginBottom: "32px",
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
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
                <span>ACCREDITED INSTITUTION CONSOLE</span>
              </div>

              <h1
                style={{
                  fontSize: "clamp(24px, 4vw, 32px)",
                  fontWeight: 900,
                  margin: "0 0 8px 0",
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                {college.collegeName}
              </h1>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", color: "#cbd5e1", fontSize: "13.5px" }}>
                <span>Username: <strong style={{ color: "#ffffff" }}>{college.username}</strong></span>
                <span>• Support: <strong style={{ color: "#a78bfa" }}>ughambusiness@gmail.com</strong></span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={teams.length === 0}
                style={{
                  padding: "11px 20px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: 800,
                  border: "none",
                  cursor: teams.length === 0 ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 6px 18px rgba(16, 185, 129, 0.3)",
                }}
              >
                <span>Download Report (.xlsx)</span>
              </button>

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
                }}
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Quick KPI Strip */}
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
                Enrolled Squads
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff", marginTop: "4px" }}>
                {teams.length}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                Active Students
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#60a5fa", marginTop: "4px" }}>
                {totalStudents}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                Internship Selected
              </div>
              <div style={{ fontSize: "28px", fontWeight: 900, color: "#34d399", marginTop: "4px" }}>
                {totalInternships}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>
                College Status
              </div>
              <div style={{ fontSize: "16px", fontWeight: 800, color: "#a78bfa", marginTop: "8px" }}>
                Active Partner Hub
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setActiveTab("teams")}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                background: activeTab === "teams" ? "#7C3AED" : "#ffffff",
                color: activeTab === "teams" ? "#ffffff" : "#475569",
                border: "1.5px solid",
                borderColor: activeTab === "teams" ? "#7C3AED" : "#e2e8f0",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              All Squads &amp; Students ({teams.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("rounds")}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                background: activeTab === "rounds" ? "#7C3AED" : "#ffffff",
                color: activeTab === "rounds" ? "#ffffff" : "#475569",
                border: "1.5px solid",
                borderColor: activeTab === "rounds" ? "#7C3AED" : "#e2e8f0",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Rounds Progression
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("internships")}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                background: activeTab === "internships" ? "#059669" : "#ffffff",
                color: activeTab === "internships" ? "#ffffff" : "#475569",
                border: "1.5px solid",
                borderColor: activeTab === "internships" ? "#059669" : "#e2e8f0",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              ★ Internship Selected ({totalInternships})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("feedback")}
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                background: activeTab === "feedback" ? "#d97706" : "#ffffff",
                color: activeTab === "feedback" ? "#ffffff" : "#475569",
                border: "1.5px solid",
                borderColor: activeTab === "feedback" ? "#d97706" : "#e2e8f0",
                fontSize: "13px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Jury Feedback
            </button>
          </div>

          <input
            type="text"
            placeholder="Search squad, leader, domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              border: "1.5px solid #cbd5e1",
              fontSize: "13px",
              outline: "none",
              minWidth: "240px",
              background: "#ffffff",
            }}
          />
        </div>

        {/* Content Section */}
        {filteredTeams.length === 0 ? (
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1.5px solid #e2e8f0",
              padding: "48px 24px",
              textAlign: "center",
              color: "#64748b",
            }}
          >
            <h3 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", marginBottom: "8px" }}>
              No Squad Registrations Found
            </h3>
            <p style={{ fontSize: "13.5px", maxWidth: "450px", margin: "0 auto" }}>
              Students from {college.collegeName} will appear here as soon as they submit their squad entry through Events Hub.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {filteredTeams.map((team, idx) => {
              const eventLabel = getEventName(team.event_name);
              const isShepitch = team.event_name.includes("shepitch");

              return (
                <div
                  key={team.id || idx}
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    border: "1.5px solid #e2e8f0",
                    padding: "26px 28px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "14px",
                      borderBottom: "1px solid #f1f5f9",
                      paddingBottom: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                          {team.team_name}
                        </h3>
                        <span
                          style={{
                            background: isShepitch ? "#fdf2f8" : "#eff6ff",
                            color: isShepitch ? "#C026D3" : "#2563EB",
                            padding: "3px 10px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 800,
                          }}
                        >
                          {eventLabel}
                        </span>
                        <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                          • {team.domain} {team.track ? `(${team.track})` : ""}
                        </span>
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px" }}>
                        Dept: <strong style={{ color: "#334155" }}>{team.department}</strong> | Year: {team.year_of_study}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {team.internship_selected && (
                        <span
                          style={{
                            background: "rgba(16, 185, 129, 0.15)",
                            color: "#059669",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                            padding: "4px 12px",
                            borderRadius: "100px",
                            fontSize: "11.5px",
                            fontWeight: 900,
                          }}
                        >
                          ★ Internship Selected
                        </span>
                      )}

                      <span
                        style={{
                          background: "rgba(124, 58, 237, 0.1)",
                          color: "#7C3AED",
                          padding: "4px 12px",
                          borderRadius: "100px",
                          fontSize: "12px",
                          fontWeight: 800,
                        }}
                      >
                        {team.round_status || "Round 1: Screening"}
                      </span>
                    </div>
                  </div>

                  {/* Student Members Breakdown */}
                  <div>
                    <h5
                      style={{
                        fontSize: "12px",
                        fontWeight: 800,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        margin: "0 0 10px 0",
                      }}
                    >
                      Enrolled Squad Students ({team.team_size} Members)
                    </h5>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "12px",
                      }}
                    >
                      {/* Leader */}
                      <div
                        style={{
                          background: "#f8fafc",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{team.leader_name}</strong>
                          <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#7C3AED", background: "rgba(124, 58, 237, 0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                            Leader
                          </span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b" }}>{team.leader_email}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Ph: {team.mobile}</div>
                      </div>

                      {/* Additional Members */}
                      {team.members &&
                        team.members.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            style={{
                              background: "#f8fafc",
                              borderRadius: "12px",
                              padding: "12px 14px",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{m.name}</strong>
                              <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#64748b", background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
                                Member
                              </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>{m.email}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Jury Feedback & Internship Purpose Box if Available */}
                  {(team.jury_feedback || team.internship_reason) && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginTop: "16px" }}>
                      {team.jury_feedback && (
                        <div
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            background: "rgba(245, 158, 11, 0.08)",
                            border: "1px solid rgba(245, 158, 11, 0.25)",
                          }}
                        >
                          <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", marginBottom: "4px" }}>
                            Official Jury Evaluation Feedback:
                          </div>
                          <div style={{ fontSize: "13px", color: "#78350f", lineHeight: "1.5" }}>
                            {team.jury_feedback}
                          </div>
                        </div>
                      )}
                      {team.internship_reason && (
                        <div
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            border: "1px solid #cbd5e1",
                          }}
                        >
                          <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "4px" }}>
                            Internship Selection Purpose / Notes:
                          </div>
                          <div style={{ fontSize: "13px", color: "#0f172a", lineHeight: "1.5" }}>
                            {team.internship_reason}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
