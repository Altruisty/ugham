"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import CustomSelect from "@/components/CustomSelect";

interface SupportTicketItem {
  id: string;
  title: string;
  category: string;
  message: string;
  status: "open" | "solved";
  createdAt: string;
  solvedAt?: string;
}

const SUPPORT_CATEGORY_OPTIONS = [
  { value: "General Inquiry", label: "General Portal Inquiry" },
  { value: "Event Rounds & Submissions", label: "Event Rounds & Submissions" },
  { value: "Payment & Registration", label: "Payment & Registration" },
  { value: "Certificates & Internships", label: "Certificates & Internships" },
  { value: "Technical Issue", label: "Technical / Login Issue" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [portalUser, setPortalUser] = useState<any>(null);
  const [activePortalTab, setActivePortalTab] = useState<string>("dashboard");

  // Profile Slide-Over Drawer, Editable Profile Fields & Support Query Modal states
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [editProfileName, setEditProfileName] = useState("");
  const [editProfileDomain, setEditProfileDomain] = useState("");
  const [editProfileCollege, setEditProfileCollege] = useState("");
  const [editProfileDepartment, setEditProfileDepartment] = useState("");
  const [profileSavedMsg, setProfileSavedMsg] = useState("");
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportTitle, setSupportTitle] = useState("");
  const [supportCategory, setSupportCategory] = useState("General Inquiry");
  const [supportMessage, setSupportMessage] = useState("");
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [supportSuccessTicket, setSupportSuccessTicket] = useState<SupportTicketItem | null>(null);
  const [mySupportTickets, setMySupportTickets] = useState<SupportTicketItem[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const syncTabFromUrl = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") || "dashboard";
      setActivePortalTab(tab);
    }
  };

  const checkAuth = () => {
    try {
      const savedUser = sessionStorage.getItem("ugham_portal_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setPortalUser(parsed);
        setEditProfileName(parsed?.name || "");
        setEditProfileDomain(parsed?.preferredDomain || "");
        setEditProfileCollege(parsed?.college || "");
        setEditProfileDepartment(parsed?.department || "");
      } else {
        setPortalUser(null);
      }
    } catch {
      setPortalUser(null);
    }
  };

  const handleSaveProfileDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalUser) return;
    const updatedUser = {
      ...portalUser,
      name: editProfileName.trim() || portalUser.name,
      preferredDomain: editProfileDomain.trim(),
      college: editProfileCollege.trim() || portalUser.college,
      department: editProfileDepartment.trim() || portalUser.department,
    };
    setPortalUser(updatedUser);
    sessionStorage.setItem("ugham_portal_user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("ugham_auth_change"));
    setProfileSavedMsg("Profile preferences saved!");
    setTimeout(() => setProfileSavedMsg(""), 3000);
  };

  useEffect(() => {
    checkAuth();
    syncTabFromUrl();
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleTabEvent = (e: any) => {
      if (e?.detail) setActivePortalTab(e.detail);
      else syncTabFromUrl();
    };
    window.addEventListener("ugham_auth_change", checkAuth);
    window.addEventListener("ugham_portal_tab_change", handleTabEvent);
    window.addEventListener("popstate", syncTabFromUrl);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("ugham_auth_change", checkAuth);
      window.removeEventListener("ugham_portal_tab_change", handleTabEvent);
      window.removeEventListener("popstate", syncTabFromUrl);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const fetchMyTickets = async (email: string) => {
    try {
      const res = await fetch(`/api/support-queries?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.queries)) {
        setMySupportTickets(data.queries);
      }
    } catch {
      // silent fetch failure
    }
  };

  const handleOpenSupportModal = () => {
    setProfileDrawerOpen(false);
    setSupportSuccessTicket(null);
    setSupportError("");
    setSupportModalOpen(true);
    if (portalUser?.email) {
      void fetchMyTickets(portalUser.email);
    }
  };

  const handleSubmitSupportQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portalUser?.email) return;
    if (!supportTitle.trim() || !supportMessage.trim()) {
      setSupportError("Please enter both a query title and details.");
      return;
    }

    setSubmittingSupport(true);
    setSupportError("");
    try {
      const res = await fetch("/api/support-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: portalUser.name || portalUser.email.split("@")[0],
          userEmail: portalUser.email,
          collegeName: portalUser.college || "",
          category: supportCategory,
          title: supportTitle.trim(),
          message: supportMessage.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Unable to submit support query.");
      }
      setSupportSuccessTicket(data.query);
      setSupportTitle("");
      setSupportMessage("");
      void fetchMyTickets(portalUser.email);
    } catch (err: any) {
      setSupportError(err.message || "Failed to submit support query.");
    } finally {
      setSubmittingSupport(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ugham_portal_user");
    sessionStorage.removeItem("ugham_admin_auth");
    setPortalUser(null);
    setProfileDrawerOpen(false);
    setSupportModalOpen(false);
    setIsOpen(false);
    window.dispatchEvent(new Event("ugham_auth_change"));
    router.push("/login");
  };

  const handleStudentTabNav = (tab: string) => {
    setActivePortalTab(tab);
    setIsOpen(false);
    setProfileDrawerOpen(false);
    const targetUrl = tab === "dashboard" ? "/portal" : `/portal?tab=${tab}`;
    if (pathname === "/portal") {
      window.history.pushState({}, "", targetUrl);
      window.dispatchEvent(new CustomEvent("ugham_portal_tab_change", { detail: tab }));
    } else {
      router.push(targetUrl);
    }
  };

  const isStudentMode =
    Boolean(portalUser) &&
    !pathname.startsWith("/myadmin") &&
    !pathname.startsWith("/college-");

  const userInitials = portalUser?.name
    ? String(portalUser.name)
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((s: string) => s[0]?.toUpperCase() || "")
        .join("")
    : "U";

  const regs: any[] = Array.isArray(portalUser?.registrations) ? portalUser.registrations : [];
  const activeCount = regs.filter((r) => !r.is_past_event).length;
  const certCount = regs.filter((r) => r.certificate_issued).length;

  return (
    <>
      <nav id="navbar" className={isScrolled ? "scrolled" : ""}>
        <div className="nav-inner">
          <Link
            href={isStudentMode ? "/portal" : "/"}
            style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
          >
            <img
              src="/assets/img/logo.png"
              alt="Ugham"
              style={{ height: "90px", objectFit: "contain", transform: "scale(1.1)" }}
            />
          </Link>

          {isStudentMode ? (
            <ul className={`nav-links ${isOpen ? "open" : ""}`} id="navLinks">
              <li>
                <a
                  href="/portal"
                  onClick={(e) => {
                    e.preventDefault();
                    handleStudentTabNav("dashboard");
                  }}
                  className={pathname === "/portal" && activePortalTab === "dashboard" ? "active-link" : ""}
                >
                  HOME
                </a>
              </li>
              <li>
                <a
                  href="/portal?tab=my-events"
                  onClick={(e) => {
                    e.preventDefault();
                    handleStudentTabNav("my-events");
                  }}
                  className={pathname === "/portal" && activePortalTab === "my-events" ? "active-link" : ""}
                >
                  MY EVENTS
                </a>
              </li>
              <li>
                <a
                  href="/portal?tab=certificates"
                  onClick={(e) => {
                    e.preventDefault();
                    handleStudentTabNav("certificates");
                  }}
                  className={pathname === "/portal" && activePortalTab === "certificates" ? "active-link" : ""}
                >
                  CERTIFICATES
                </a>
              </li>
              <li>
                <Link
                  href="/events-hub"
                  className={pathname === "/events-hub" ? "active-link" : ""}
                  onClick={() => setIsOpen(false)}
                >
                  EVENTS HUB
                </Link>
              </li>
              <li className="nav-student-actions">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setProfileDrawerOpen(true);
                    if (portalUser?.email) void fetchMyTickets(portalUser.email);
                  }}
                  aria-label="Open Student Profile"
                  title="Profile & Support"
                  className="glacier-btn nav-profile-icon-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-login"
                  style={{ cursor: "pointer", border: "none", fontFamily: "inherit" }}
                >
                  LOGOUT
                </button>
              </li>
            </ul>
          ) : (
            <ul className={`nav-links ${isOpen ? "open" : ""}`} id="navLinks">
              <li>
                <Link href="/" className={pathname === "/" ? "active-link" : ""}>
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/about" className={pathname === "/about" ? "active-link" : ""}>
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link href="/events-hub" className={pathname === "/events-hub" ? "active-link" : ""}>
                  EVENTS HUB
                </Link>
              </li>
              <li>
                <Link href="/collaboration" className={pathname === "/collaboration" ? "active-link" : ""}>
                  COLLABORATION
                </Link>
              </li>
              <li>
                <Link href="/contact" className={pathname === "/contact" ? "active-link" : ""}>
                  CONTACT
                </Link>
              </li>
              <li>
                <Link href="/login" className={`nav-login ${pathname === "/login" ? "active-link" : ""}`}>
                  LOGIN
                </Link>
              </li>
            </ul>
          )}

          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label="Menu"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? "\u2715" : "\u2630"}
          </button>
        </div>
      </nav>

      {/* ── RIGHT-SIDE STUDENT PROFILE DRAWER ── */}
      {isStudentMode && profileDrawerOpen && (
        <div
          className="ugham-drawer-backdrop"
          onClick={() => setProfileDrawerOpen(false)}
        >
          <aside
            className="ugham-profile-drawer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Participant Profile Menu"
          >
            {/* Drawer Header */}
            <div className="ugham-profile-drawer-head">
              <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: 0 }}>
                <div className="ugham-profile-avatar">{userInitials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {portalUser?.name || "Ugham Participant"}
                  </div>
                  <div style={{ fontSize: "12.5px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {portalUser?.email}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileDrawerOpen(false)}
                aria-label="Close Profile Bar"
                className="glacier-btn"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            </div>

            {/* Scrollable Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Verified Account Info Card */}
              <div style={{ padding: "16px", borderRadius: "16px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Account Details
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", background: "#ecfdf5", padding: "2px 8px", borderRadius: "999px", border: "1px solid #a7f3d0" }}>
                    Verified Active
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#334155" }}>
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: 700 }}>Institution</span>
                    <strong style={{ color: "#0f172a" }}>{portalUser?.college || "Partner Institution"}</strong>
                  </div>
                  {(portalUser?.department || portalUser?.yearOfStudy) && (
                    <div>
                      <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: 700 }}>Department &amp; Year</span>
                      <strong style={{ color: "#0f172a" }}>
                        {portalUser?.department || "Engineering"} {portalUser?.yearOfStudy ? `• ${portalUser.yearOfStudy}` : ""}
                      </strong>
                    </div>
                  )}
                  {portalUser?.preferredDomain && (
                    <div>
                      <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: 700 }}>Focus Domain</span>
                      <strong style={{ color: "#0f172a" }}>{portalUser.preferredDomain}</strong>
                    </div>
                  )}
                  <div>
                    <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: 700 }}>Portal Username</span>
                    <code style={{ color: "#7C3AED", fontWeight: 700, fontSize: "12.5px" }}>{portalUser?.email}</code>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "12px 14px", borderRadius: "14px", background: "#faf5ff", border: "1px solid #e9d5ff" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#7c3aed", display: "block" }}>Active Events</span>
                  <strong style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>{activeCount}</strong>
                </div>
                <div style={{ padding: "12px 14px", borderRadius: "14px", background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#059669", display: "block" }}>Certificates</span>
                  <strong style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>{certCount}</strong>
                </div>
              </div>

              {/* Editable Profile Settings (4 Fields: Name, Domain, College, Department) */}
              <form
                onSubmit={handleSaveProfileDetails}
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "11px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Update Profile Settings
                  </span>
                  {profileSavedMsg && (
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669" }}>Saved ✓</span>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editProfileName}
                    onChange={(e) => setEditProfileName(e.target.value)}
                    placeholder="Your display name"
                    style={{ width: "100%", height: "38px", padding: "8px 11px", borderRadius: "9px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    Preferred Domain / Focus Track
                  </label>
                  <input
                    type="text"
                    value={editProfileDomain}
                    onChange={(e) => setEditProfileDomain(e.target.value)}
                    placeholder="e.g. AI, SaaS, FinTech, IoT"
                    style={{ width: "100%", height: "38px", padding: "8px 11px", borderRadius: "9px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    Institution / College
                  </label>
                  <input
                    type="text"
                    value={editProfileCollege}
                    onChange={(e) => setEditProfileCollege(e.target.value)}
                    placeholder="College name"
                    style={{ width: "100%", height: "38px", padding: "8px 11px", borderRadius: "9px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>
                    Department / Specialization
                  </label>
                  <input
                    type="text"
                    value={editProfileDepartment}
                    onChange={(e) => setEditProfileDepartment(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    style={{ width: "100%", height: "38px", padding: "8px 11px", borderRadius: "9px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
                  />
                </div>

                <button
                  type="submit"
                  className="glacier-btn"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "#0f172a",
                    border: "1px solid transparent",
                    color: "#ffffff",
                    fontSize: "12.5px",
                    fontWeight: 800,
                    cursor: "pointer",
                    marginTop: "2px",
                  }}
                >
                  Save Profile Preferences
                </button>
              </form>
            </div>

            {/* Footer with Support Button & Logout */}
            <div style={{ padding: "18px 22px", borderTop: "1px solid #e2e8f0", background: "#fcfcfd", display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                type="button"
                onClick={handleOpenSupportModal}
                className="glacier-btn"
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
                  border: "1.5px solid transparent",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 6px 20px rgba(124, 58, 237, 0.25)",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>Support Query &amp; Help Desk</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="glacier-btn"
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: "12px",
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  color: "#dc2626",
                  fontSize: "13px",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Log Out of Student Portal
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── CENTERED SUPPORT QUERY MODAL (BLURRED BACKDROP) ── */}
      {isStudentMode && supportModalOpen && (
        <div
          onClick={() => setSupportModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(15, 23, 42, 0.62)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "18px",
          }}
        >
          <div
            className="modal-animate-in"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              border: "1.5px solid #e2e8f0",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 24px 64px rgba(15, 23, 42, 0.35)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "18px" }}>
              <div>
                <span style={{ fontSize: "11px", fontWeight: 800, color: "#7C3AED", letterSpacing: "0.8px", textTransform: "uppercase" }}>
                  UGHAM PARTICIPANT SUPPORT
                </span>
                <h3 style={{ fontSize: "21px", fontWeight: 900, color: "#0f172a", margin: "4px 0 0" }}>
                  Submit a Support Query
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                aria-label="Close Support Modal"
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  color: "#475569",
                  fontSize: "16px",
                  fontWeight: 800,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {supportSuccessTicket && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: "12px",
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  color: "#065f46",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "16px",
                }}
              >
                Query submitted successfully! Ticket ID:{" "}
                <strong style={{ color: "#047857" }}>{supportSuccessTicket.id}</strong>. Our admin team will review and solve it shortly.
              </div>
            )}

            {supportError && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "14px",
                }}
              >
                {supportError}
              </div>
            )}

            <form onSubmit={handleSubmitSupportQuery} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>
                  Category
                </label>
                <CustomSelect
                  options={SUPPORT_CATEGORY_OPTIONS}
                  value={supportCategory}
                  onChange={setSupportCategory}
                />
              </div>

              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>
                  Query Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Need help updating Round 1 Drive link"
                  value={supportTitle}
                  onChange={(e) => setSupportTitle(e.target.value)}
                  style={{
                    width: "100%",
                    height: "44px",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#334155", display: "block", marginBottom: "6px", textTransform: "uppercase" }}>
                  Query Description / Message *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your question or issue clearly..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "14px",
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingSupport}
                className="glacier-btn"
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
                  border: "1.5px solid transparent",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 800,
                  cursor: submittingSupport ? "wait" : "pointer",
                  marginTop: "4px",
                }}
              >
                {submittingSupport ? "Sending Query to Admin..." : "Submit Support Query →"}
              </button>
            </form>

            {mySupportTickets.length > 0 && (
              <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "10px" }}>
                  Your Recent Support Tickets ({mySupportTickets.length})
                </div>
                <div style={{ maxHeight: "170px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {mySupportTickets.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: "10px 12px",
                        borderRadius: "10px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {t.id} • {new Date(t.createdAt).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: "11px",
                          fontWeight: 800,
                          padding: "3px 9px",
                          borderRadius: "999px",
                          background: t.status === "solved" ? "#ecfdf5" : "#fef3c7",
                          color: t.status === "solved" ? "#059669" : "#b45309",
                          border: t.status === "solved" ? "1px solid #a7f3d0" : "1px solid #fde68a",
                          textTransform: "uppercase",
                        }}
                      >
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
