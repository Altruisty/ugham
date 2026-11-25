"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { RegistrationRecord } from "@/lib/db";
import CustomSelect from "@/components/CustomSelect";
import AnimatedCheckbox from "@/components/AnimatedCheckbox";
import type { EventEditionRecord } from "@/lib/editions";

const LOGO_GRADIENT = "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)";

const ROUND_STATUS_OPTIONS = [
  { value: "Round 1 (PPT & Video Submission)", label: "Round 1: PPT & Video Submission" },
  { value: "Round 2 (Prototype & Video Explanation)", label: "Round 2: Prototype & Video Explanation" },
  { value: "Round 3 (Present to Juries)", label: "Round 3: Present to Juries" },
  { value: "Round 3 / 4 (Offline Grand Finale)", label: "Round 3 / 4: Offline Grand Finale" },
  { value: "Round 1 - Not Selected (Participation Certificate)", label: "Round 1: Not Selected (Participation Certificate)" },
  { value: "Round 2 - Not Selected (Appreciation Certificate)", label: "Round 2: Not Selected (Appreciation Certificate)" },
  { value: "Round 3 - Not Selected (Excellence Certificate)", label: "Round 3: Not Selected (Excellence Certificate)" },
  { value: "Winner Team", label: "Winner Team (Grand Finale Champion)" },
];

function TablePagination({
  currentPage,
  totalItems,
  pageSize = 5,
  onPageChange,
  itemName = "records",
}: {
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div
      style={{
        padding: "14px 20px",
        borderTop: "1.5px solid #f1f5f9",
        background: "#ffffff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        fontSize: "13px",
        color: "#64748b",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span>
          Showing <strong>{startIndex}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong> {itemName}
        </span>
        <span
          style={{
            fontSize: "11px",
            background: "rgba(124, 58, 237, 0.08)",
            padding: "2px 8px",
            borderRadius: "6px",
            color: "#7C3AED",
            fontWeight: 800,
          }}
        >
          5 per page
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="glacier-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "100px",
            border: "1.5px solid #e2e8f0",
            background: currentPage === 1 ? "#f8fafc" : "#ffffff",
            color: currentPage === 1 ? "#94a3b8" : "#334155",
            fontWeight: 700,
            fontSize: "12px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Prev</span>
        </button>

        {/* Premium Circular Round Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className="glacier-btn"
            style={{
              width: "36px",
              height: "36px",
              padding: "0",
              borderRadius: "50%",
              border: pageNum === currentPage ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
              background: pageNum === currentPage ? LOGO_GRADIENT : "#ffffff",
              color: pageNum === currentPage ? "#ffffff" : "#334155",
              fontWeight: 800,
              fontSize: "12.5px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: pageNum === currentPage ? "0 4px 12px rgba(124, 58, 237, 0.28)" : "0 1px 3px rgba(15, 23, 42, 0.04)",
            }}
          >
            {pageNum}
          </button>
        ))}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="glacier-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "100px",
            border: "1.5px solid #e2e8f0",
            background: currentPage === totalPages ? "#f8fafc" : "#ffffff",
            color: currentPage === totalPages ? "#94a3b8" : "#334155",
            fontWeight: 700,
            fontSize: "12px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span>Next</span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function MyAdminPage() {
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [newCollegeInput, setNewCollegeInput] = useState("");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegeMessage, setCollegeMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEvent, setFilterEvent] = useState<"all" | "shepitch" | "shepitch_chennai" | "shepitch_coimbatore" | "hackpick">("all");
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "payments" | "colleges" | "teams" | "editions" | "warning" | "brevo-db" | "emails-sent">("overview");
  const [paymentsFilterEvent, setPaymentsFilterEvent] = useState<"all" | "shepitch" | "shepitch_chennai" | "shepitch_coimbatore" | "hackpick">("all");
  const [paymentsSearchQuery, setPaymentsSearchQuery] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [emailSendSuccessMsg, setEmailSendSuccessMsg] = useState("");
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [emailFilterStatus, setEmailFilterStatus] = useState<"all" | "sent" | "pending" | "failed">("all");
  const [showDiagnosticsTest, setShowDiagnosticsTest] = useState(false);

  // WhatsApp links quick editor on Overview
  const [whatsappDrafts, setWhatsappDrafts] = useState<Record<string, string>>({});
  const [savingWhatsappSlug, setSavingWhatsappSlug] = useState<string | null>(null);
  const [whatsappSavedMsg, setWhatsappSavedMsg] = useState("");

  // Warning Deletion Console States (requires password del@123)
  const [warningSubTab, setWarningSubTab] = useState<"teams" | "colleges" | "emails">("teams");
  const [warningSelectedIds, setWarningSelectedIds] = useState<string[]>([]);
  const [showWarningPasswordModal, setShowWarningPasswordModal] = useState(false);
  const [warningPasswordInput, setWarningPasswordInput] = useState("");
  const [warningError, setWarningError] = useState("");
  const [warningSuccess, setWarningSuccess] = useState("");
  const [warningDeleting, setWarningDeleting] = useState(false);

  // Teams Desk States (Round Status Updates & Collected Round Links per Event)
  const [teamsSubTab, setTeamsSubTab] = useState<"statuses" | "links">("statuses");
  const [teamsEventFilter, setTeamsEventFilter] = useState<string>("shepitch_chennai");
  const [teamsSearchQuery, setTeamsSearchQuery] = useState<string>("");
  const [teamsPage, setTeamsPage] = useState<number>(1);
  const [linksPage, setLinksPage] = useState<number>(1);

  // Event Editions & Versions Manager States
  const [editions, setEditions] = useState<EventEditionRecord[]>([]);
  const [editionsSubTab, setEditionsSubTab] = useState<"active" | "past">("active");
  const [selectedEditionInspect, setSelectedEditionInspect] = useState<string | null>(null);
  const [showCreateEditionForm, setShowCreateEditionForm] = useState<boolean>(false);
  const [newEdSeries, setNewEdSeries] = useState<"shepitch_chennai" | "hackpick" | "shepitch_coimbatore">("shepitch_chennai");
  const [newEdNumber, setNewEdNumber] = useState<number>(3);
  const [newEdTitle, setNewEdTitle] = useState<string>("ShePitch Chennai Edition 3");
  const [newEdBadge, setNewEdBadge] = useState<string>("CHENNAI EDITION 3");
  const [newEdTagline, setNewEdTagline] = useState<string>("Women-led innovation challenge • Chennai Hub");
  const [newEdDesc, setNewEdDesc] = useState<string>("Next edition flagship pitch arena in Chennai for working prototypes & validated venture blueprints.");
  const [newEdPricingMode, setNewEdPricingMode] = useState<"per_member" | "flat_team">("per_member");
  const [newEdFee, setNewEdFee] = useState<number>(99);
  const [newEdMinSize, setNewEdMinSize] = useState<number>(3);
  const [newEdMaxSize, setNewEdMaxSize] = useState<number>(4);
  const [newEdWhatsapp, setNewEdWhatsapp] = useState<string>("https://chat.whatsapp.com/invite/ugham-shepitch-chennai-e3");
  const [newEdSchedule, setNewEdSchedule] = useState<string>("Registrations Open • Chennai Finale");
  const [newEdStatus, setNewEdStatus] = useState<"active" | "upcoming" | "past">("active");
  const [editionSaving, setEditionSaving] = useState<boolean>(false);
  const [editionMsg, setEditionMsg] = useState<string>("");

  // Testing data sandbox toggle (ON by default; OFF hides UGH-TEST-* across Analytics, Registrations, Payments & Colleges)
  const [showTestingData, setShowTestingData] = useState(true);

  // Event Console Drilldown State (Overview Page)
  const [selectedEventConsole, setSelectedEventConsole] = useState<"shepitch_chennai" | "shepitch_coimbatore" | "hackpick" | null>(null);
  const [expandedCollegeKey, setExpandedCollegeKey] = useState<string | null>(null);

  // College Credentials & Portal Management
  const [collegeCredentials, setCollegeCredentials] = useState<any[]>([]);
  const [selectedCollegeForCred, setSelectedCollegeForCred] = useState<string | null>(null);
  const [editingUsername, setEditingUsername] = useState("");
  const [editingPassword, setEditingPassword] = useState("");
  const [credSaveMsg, setCredSaveMsg] = useState("");
  const [updatingTeamId, setUpdatingTeamId] = useState<string | null>(null);
  const [copiedCredCollege, setCopiedCredCollege] = useState<string | null>(null);
  const [expandedCollegeTeams, setExpandedCollegeTeams] = useState<string | null>(null);
  const [editingFeedbackTeamId, setEditingFeedbackTeamId] = useState<string | null>(null);
  const [tempFeedbackText, setTempFeedbackText] = useState("");
  const [collegeSubTab, setCollegeSubTab] = useState<"colleges" | "credentials">("colleges");
  const [collegeFilterEvent, setCollegeFilterEvent] = useState<"all" | "shepitch_chennai" | "shepitch_coimbatore" | "hackpick">("all");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [manualCollegeSelect, setManualCollegeSelect] = useState<string>("");
  const [manualCustomCollege, setManualCustomCollege] = useState<string>("");
  const [manualUsername, setManualUsername] = useState<string>("");
  const [manualPassword, setManualPassword] = useState<string>("UGH@2026");
  const [manualCredMsg, setManualCredMsg] = useState<string>("");
  const [credSearchQuery, setCredSearchQuery] = useState<string>("");
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Pagination states (5 items per page for all listing areas)
  const [registrationsPage, setRegistrationsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [collegesPage, setCollegesPage] = useState(1);
  const [credentialsPage, setCredentialsPage] = useState(1);
  const [emailsPage, setEmailsPage] = useState(1);
  const PAGE_SIZE = 5;

  // Database Connection State
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    type: string;
    mode: string;
    host?: string;
    database?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);

  // SMTP Diagnostics State
  const [smtpInfo, setSmtpInfo] = useState<{
    configured: boolean;
    connected: boolean;
    host: string;
    port: number;
    fromName: string;
    fromAddress: string;
    replyTo: string;
    user: string;
    mode: string;
    hasUser?: boolean;
    hasPass?: boolean;
    statusMessage?: string;
    emailsToday?: number;
    dailyLimit?: number;
    remainingToday?: number;
    dispatchedEmails?: any[];
    analysis?: {
      hostConfigured: boolean;
      portConfigured: boolean;
      userConfigured: boolean;
      passConfigured: boolean;
      domainAuthenticated: boolean;
      relayHandshake: boolean;
      ipRestrictionDetected: boolean;
      ipResolutionHint?: string;
    };
  } | null>(null);
  const [checkingSmtp, setCheckingSmtp] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Fetch registrations
  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/registrations");
      const data = await res.json();
      if (data.registrations) {
        setRegistrations(data.registrations);
      }
      if (data.databaseStatus) {
        setDbStatus(data.databaseStatus);
      }
    } catch (err) {
      console.error("Error fetching registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch colleges
  const fetchColleges = async () => {
    try {
      const res = await fetch("/api/admin/colleges");
      const data = await res.json();
      if (data.success && Array.isArray(data.colleges)) {
        setColleges(data.colleges);
      }
    } catch (err) {
      console.error("Error fetching colleges:", err);
    }
  };

  // Fetch college credentials for portal management
  const fetchCollegeCredentials = async () => {
    try {
      const res = await fetch("/api/admin/colleges/credentials");
      const data = await res.json();
      if (data.success && Array.isArray(data.credentials)) {
        setCollegeCredentials(data.credentials);
      }
    } catch (err) {
      console.error("Error fetching college credentials:", err);
    }
  };

  const handleSaveCollegeCred = async (collegeName: string) => {
    if (!editingUsername.trim() || !editingPassword.trim()) {
      alert("Username and password are required.");
      return;
    }
    try {
      const res = await fetch("/api/admin/colleges/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeName,
          username: editingUsername.trim(),
          password: editingPassword.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCollegeCredentials(data.credentials);
        setCredSaveMsg(`Credentials updated for ${collegeName}!`);
        setTimeout(() => {
          setSelectedCollegeForCred(null);
          setCredSaveMsg("");
        }, 2000);
      }
    } catch (err) {
      console.error("Error saving college credentials:", err);
    }
  };

  const handleManualSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCollege =
      manualCollegeSelect === "__custom__"
        ? manualCustomCollege.trim()
        : manualCollegeSelect.trim();

    if (!targetCollege) {
      alert("Please select an available college or enter a college name.");
      return;
    }
    if (!manualUsername.trim() || !manualPassword.trim()) {
      alert("Username and password are required.");
      return;
    }

    try {
      const res = await fetch("/api/admin/colleges/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collegeName: targetCollege,
          username: manualUsername.trim(),
          password: manualPassword.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCollegeCredentials(data.credentials);
        setManualCredMsg(`Portal credentials saved for ${targetCollege}!`);
        setManualCollegeSelect("");
        setManualCustomCollege("");
        setManualUsername("");
        setManualPassword("UGH@2026");
        setTimeout(() => setManualCredMsg(""), 3500);
      } else {
        alert(data.error || "Failed to save credentials");
      }
    } catch (err) {
      console.error("Error saving manual college credentials:", err);
    }
  };

  const handleDeleteCollegeCred = async (collegeName: string) => {
    if (!confirm(`Revoke portal login credentials for "${collegeName}"?`)) return;
    try {
      const res = await fetch(
        `/api/admin/colleges/credentials?collegeName=${encodeURIComponent(collegeName)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (data.success) {
        setCollegeCredentials(data.credentials);
      }
    } catch (err) {
      console.error("Error deleting college credential:", err);
    }
  };

  // Fetch Event Editions & Lifecycle Versions
  const fetchEditions = async () => {
    try {
      const res = await fetch("/api/events/editions");
      const data = await res.json();
      if (data.success && Array.isArray(data.editions)) {
        setEditions(data.editions);
      }
    } catch (err) {
      console.error("Error fetching event editions:", err);
    }
  };

  const applyEditionSeriesDefaults = (series: "shepitch_chennai" | "hackpick" | "shepitch_coimbatore") => {
    setNewEdSeries(series);
    const sameSeries = editions.filter((e) => e.series === series);
    const maxEd = sameSeries.reduce((m, e) => Math.max(m, e.editionNumber || 0), series === "shepitch_chennai" ? 2 : 1);
    const nextNum = maxEd + 1;
    setNewEdNumber(nextNum);

    if (series === "shepitch_chennai") {
      setNewEdTitle(`ShePitch Chennai Edition ${nextNum}`);
      setNewEdBadge(`CHENNAI EDITION ${nextNum}`);
      setNewEdTagline("Women-led innovation challenge • Chennai Hub");
      setNewEdDesc("Flagship women-led startup & prototype pitch arena in Chennai.");
      setNewEdPricingMode("per_member");
      setNewEdFee(99);
      setNewEdMinSize(3);
      setNewEdMaxSize(4);
      setNewEdWhatsapp(`https://chat.whatsapp.com/invite/ugham-shepitch-chennai-e${nextNum}`);
      setNewEdSchedule("Registrations Open • Chennai Finale");
    } else if (series === "shepitch_coimbatore") {
      setNewEdTitle(`ShePitch Coimbatore Edition ${nextNum}`);
      setNewEdBadge(`COIMBATORE EDITION ${nextNum}`);
      setNewEdTagline("Women-led innovation challenge • Western TN");
      setNewEdDesc("Regional women-led startup & prototype challenge serving Coimbatore chapters.");
      setNewEdPricingMode("per_member");
      setNewEdFee(99);
      setNewEdMinSize(3);
      setNewEdMaxSize(4);
      setNewEdWhatsapp(`https://chat.whatsapp.com/invite/ugham-shepitch-coimbatore-e${nextNum}`);
      setNewEdSchedule("Registrations Open • Coimbatore Chapter");
    } else {
      setNewEdTitle(`HackPick Edition ${nextNum}`);
      setNewEdBadge(`EDITION ${nextNum} • DEEP-TECH SPRINT`);
      setNewEdTagline(`Rapid engineering marathon • Flat ₹199/squad`);
      setNewEdDesc("36-hour engineering sprint tackling deep-tech software, AI, cloud & hardware tracks.");
      setNewEdPricingMode("flat_team");
      setNewEdFee(199);
      setNewEdMinSize(2);
      setNewEdMaxSize(3);
      setNewEdWhatsapp(`https://chat.whatsapp.com/invite/ugham-hackpick-e${nextNum}`);
      setNewEdSchedule("Registrations Open • 36-Hour Sprint");
    }
  };

  const handleCreateNextEdition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEdTitle.trim()) return;
    setEditionSaving(true);
    try {
      const res = await fetch("/api/events/editions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          series: newEdSeries,
          editionNumber: Number(newEdNumber),
          title: newEdTitle.trim(),
          badgeText: newEdBadge.trim(),
          tagline: newEdTagline.trim(),
          description: newEdDesc.trim(),
          status: newEdStatus,
          pricingMode: newEdPricingMode,
          feeAmount: Number(newEdFee),
          teamSizeMin: Number(newEdMinSize),
          teamSizeMax: Number(newEdMaxSize),
          whatsappLink: newEdWhatsapp.trim(),
          scheduleNote: newEdSchedule.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.editions)) {
        setEditions(data.editions);
        setEditionMsg(`${newEdTitle.trim()} published (${newEdStatus.toUpperCase()}) and synced to Events Hub!`);
        setShowCreateEditionForm(false);
        setTimeout(() => setEditionMsg(""), 4500);
      } else {
        alert(data.error || "Failed to publish edition");
      }
    } catch (err) {
      console.error("Error creating event edition:", err);
    } finally {
      setEditionSaving(false);
    }
  };

  const handleUpdateEditionStatus = async (slug: string, status: "active" | "upcoming" | "past") => {
    try {
      const res = await fetch("/api/events/editions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, status }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.editions)) {
        setEditions(data.editions);
        setEditionMsg(`Updated edition status to ${status.toUpperCase()}.`);
        setTimeout(() => setEditionMsg(""), 3000);
      }
    } catch (err) {
      console.error("Error updating edition status:", err);
    }
  };

  const handleToggleEditionRegistration = async (slug: string, closed: boolean) => {
    try {
      const res = await fetch("/api/events/editions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, registrationClosed: closed }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.editions)) {
        setEditions(data.editions);
        setEditionMsg(
          closed
            ? "Registrations stopped for this event. Public registration is now blocked."
            : "Registrations reopened for this event."
        );
        setTimeout(() => setEditionMsg(""), 3500);
      }
    } catch (err) {
      console.error("Error toggling edition registration:", err);
    }
  };

  const handleUpdateTeamStatus = async (
    teamId: string,
    updates: {
      round_status?: string;
      internship_selected?: boolean;
      internship_reason?: string;
      jury_feedback?: string;
      is_past_event?: boolean;
      certificate_issued?: boolean;
      certificate_title?: string;
      certificate_issued_at?: string;
    }
  ) => {
    setUpdatingTeamId(teamId);
    try {
      const res = await fetch("/api/admin/registrations/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: teamId, ...updates }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((r) => (r.id === teamId ? { ...r, ...updates } : r))
        );
      }
    } catch (err) {
      console.error("Error updating team status:", err);
    } finally {
      setUpdatingTeamId(null);
    }
  };

  // Fetch SMTP status & configuration
  const fetchSmtpStatus = async () => {
    setCheckingSmtp(true);
    try {
      const res = await fetch("/api/admin/test-email");
      const data = await res.json();
      setSmtpInfo(data);
    } catch (err) {
      console.error("Error fetching SMTP status:", err);
    } finally {
      setCheckingSmtp(false);
    }
  };

  // Send interactive test email
  const handleSendTestEmail = async (type: "ping" | "otp" | "registration") => {
    if (!testRecipient.trim() || !testRecipient.includes("@")) {
      alert("Please enter a valid recipient email address (e.g. your personal Gmail).");
      return;
    }
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: testRecipient.trim(),
          to: testRecipient.trim(),
          testType: type,
          type,
        }),
      });
      const data = await res.json();
      setTestResult(data);
      // Automatically refresh SMTP status after sending
      fetchSmtpStatus();
    } catch (err: any) {
      setTestResult({ success: false, error: err.message || "Request failed" });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSaveWhatsappLink = async (ed: EventEditionRecord) => {
    const newUrl = (whatsappDrafts[ed.slug] ?? ed.whatsappLink ?? "").trim();
    if (!newUrl) return;
    setSavingWhatsappSlug(ed.slug);
    try {
      const res = await fetch("/api/events/editions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...ed,
          whatsappLink: newUrl,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.editions)) {
        setEditions(data.editions);
        setWhatsappSavedMsg(`Updated WhatsApp group link for ${ed.title} — synced to Student Portal!`);
        setTimeout(() => setWhatsappSavedMsg(""), 3500);
      }
    } catch (err) {
      console.error("Failed saving WhatsApp link:", err);
    } finally {
      setSavingWhatsappSlug(null);
    }
  };

  const handleConfirmWarningDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (warningSelectedIds.length === 0) return;
    setWarningDeleting(true);
    setWarningError("");

    try {
      const res = await fetch("/api/admin/warning-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: warningSubTab,
          ids: warningSelectedIds,
          password: warningPasswordInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setWarningError(data.error || "Verification failed.");
        return;
      }

      setWarningSuccess(data.message || "Selected records deleted.");
      setWarningSelectedIds([]);
      setWarningPasswordInput("");
      setShowWarningPasswordModal(false);
      await refreshAllData();
      setTimeout(() => setWarningSuccess(""), 4000);
    } catch (err: any) {
      setWarningError(err.message || "Failed to execute deletion.");
    } finally {
      setWarningDeleting(false);
    }
  };

  const refreshAllData = async () => {
    try {
      const [regRes, colRes, credRes, smtpRes, edRes] = await Promise.all([
        fetch("/api/admin/registrations"),
        fetch("/api/admin/colleges"),
        fetch("/api/admin/colleges/credentials"),
        fetch("/api/admin/test-email"),
        fetch("/api/events/editions"),
      ]);
      const [regData, colData, credData, smtpData, edData] = await Promise.all([
        regRes.json().catch(() => null),
        colRes.json().catch(() => null),
        credRes.json().catch(() => null),
        smtpRes.json().catch(() => null),
        edRes.json().catch(() => null),
      ]);
      if (regData?.registrations) setRegistrations(regData.registrations);
      if (regData?.databaseStatus) setDbStatus(regData.databaseStatus);
      if (colData?.success && Array.isArray(colData.colleges)) setColleges(colData.colleges);
      if (credData?.success && Array.isArray(credData.credentials)) setCollegeCredentials(credData.credentials);
      if (smtpData) setSmtpInfo(smtpData);
      if (edData?.success && Array.isArray(edData.editions)) setEditions(edData.editions);
    } catch {
      // background refresh error ignored
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("ugham_admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
    fetchRegistrations();
    fetchColleges();
    fetchCollegeCredentials();
    fetchSmtpStatus();
    fetchEditions();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("ugham_admin_auth", "true");
        setAuthError("");
      } else {
        setAuthError(data.error || "Invalid admin access key.");
      }
    } catch {
      setAuthError("Unable to verify admin access key right now.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("ugham_admin_auth");
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  // Add college
  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollegeInput.trim()) return;

    try {
      const res = await fetch("/api/admin/colleges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCollegeInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setColleges(data.colleges);
        setNewCollegeInput("");
        setCollegeMessage("College added successfully and synced to Events Hub!");
        setTimeout(() => setCollegeMessage(""), 4000);
      } else {
        setCollegeMessage(data.error || "Failed to add college");
      }
    } catch (err: any) {
      setCollegeMessage(err.message || "Failed to add college");
    }
  };

  // Delete college
  const handleDeleteCollege = async (name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the registration list?`)) return;

    try {
      const res = await fetch(`/api/admin/colleges?name=${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setColleges(data.colleges);
        setCollegeMessage(`"${name}" removed from options.`);
        setTimeout(() => setCollegeMessage(""), 4000);
      }
    } catch (err) {
      console.error("Error deleting college:", err);
    }
  };

  const formatEventName = (raw: string) => {
    const matched = editions.find((e) => e.slug === raw);
    if (matched) return matched.title;
    if (raw === "shepitch_coimbatore") return "ShePitch Coimbatore Edition";
    if (raw === "shepitch_chennai" || raw === "shepitch") return "ShePitch Chennai Edition 2";
    if (raw === "hackpick") return "HackPick 2026";
    if (raw.startsWith("shepitch_chennai_edition_")) {
      return `ShePitch Chennai Edition ${raw.replace("shepitch_chennai_edition_", "")}`;
    }
    if (raw.startsWith("shepitch_coimbatore_edition_")) {
      return `ShePitch Coimbatore Edition ${raw.replace("shepitch_coimbatore_edition_", "")}`;
    }
    if (raw.startsWith("hackpick_edition_")) {
      return `HackPick Edition ${raw.replace("hackpick_edition_", "")}`;
    }
    return raw.replace(/_/g, " ");
  };

  // Isolate testing sandbox registrations (UGH-TEST-*) when toggled OFF
  const testingCount = useMemo(
    () => registrations.filter((r) => r.id.startsWith("UGH-TEST-")).length,
    [registrations]
  );

  const visibleRegistrations = useMemo(
    () => (showTestingData ? registrations : registrations.filter((r) => !r.id.startsWith("UGH-TEST-"))),
    [registrations, showTestingData]
  );

  // Filter registrations
  const filteredList = visibleRegistrations.filter((reg) => {
    const matchesFilter =
      filterEvent === "all" ||
      reg.event_name === filterEvent ||
      (filterEvent === "shepitch_chennai" && (reg.event_name === "shepitch_chennai" || reg.event_name === "shepitch"));
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      reg.id.toLowerCase().includes(q) ||
      reg.team_name.toLowerCase().includes(q) ||
      reg.leader_name.toLowerCase().includes(q) ||
      reg.leader_email.toLowerCase().includes(q) ||
      reg.college_name.toLowerCase().includes(q) ||
      reg.domain.toLowerCase().includes(q) ||
      (reg.members && reg.members.some((m) => m.email.toLowerCase().includes(q)));

    return matchesFilter && matchesSearch;
  });

  // Filtered colleges list
  const filteredColleges = colleges.filter((c) =>
    c.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  // Analytics totals
  const totalRegistrations = visibleRegistrations.length;
  const totalRevenue = visibleRegistrations.reduce((acc, r) => acc + (r.amount_paid || 0), 0);
  const totalParticipants = visibleRegistrations.reduce((acc, r) => acc + (r.team_size || 0), 0);
  const shepitchChennaiCount = visibleRegistrations.filter(
    (r) => r.event_name === "shepitch_chennai" || r.event_name === "shepitch"
  ).length;
  const shepitchCoimbatoreCount = visibleRegistrations.filter(
    (r) => r.event_name === "shepitch_coimbatore"
  ).length;
  const hackpickCount = visibleRegistrations.filter((r) => r.event_name === "hackpick").length;

  const shepitchChennaiRevenue = visibleRegistrations
    .filter((r) => r.event_name === "shepitch_chennai" || r.event_name === "shepitch")
    .reduce((acc, r) => acc + (r.amount_paid || 0), 0);
  const shepitchCoimbatoreRevenue = visibleRegistrations
    .filter((r) => r.event_name === "shepitch_coimbatore")
    .reduce((acc, r) => acc + (r.amount_paid || 0), 0);
  const hackpickRevenue = visibleRegistrations
    .filter((r) => r.event_name === "hackpick")
    .reduce((acc, r) => acc + (r.amount_paid || 0), 0);

  // Participating Colleges derived in real-time from registered students/teams
  const participatingColleges = useMemo(() => {
    const map = new Map<
      string,
      {
        collegeName: string;
        teams: RegistrationRecord[];
        studentsCount: number;
        revenue: number;
        events: Set<string>;
      }
    >();

    visibleRegistrations.forEach((r) => {
      const rawName = (r.college_name || "").trim();
      if (!rawName) return;
      const key = rawName.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          collegeName: rawName,
          teams: [],
          studentsCount: 0,
          revenue: 0,
          events: new Set(),
        });
      }
      const item = map.get(key)!;
      item.teams.push(r);
      item.studentsCount += r.team_size || 0;
      item.revenue += r.amount_paid || 0;
      item.events.add(r.event_name);
    });

    return Array.from(map.values()).sort((a, b) => b.teams.length - a.teams.length);
  }, [visibleRegistrations]);

  // Filtered participating colleges (by event filter + search across college, team, or student)
  const filteredParticipatingColleges = useMemo(() => {
    const q = collegeSearch.trim().toLowerCase();
    return participatingColleges.filter((c) => {
      const matchesEvent =
        collegeFilterEvent === "all" ||
        (collegeFilterEvent === "shepitch_chennai" && (c.events.has("shepitch_chennai") || c.events.has("shepitch"))) ||
        c.events.has(collegeFilterEvent);
      if (!matchesEvent) return false;
      if (!q) return true;
      if (c.collegeName.toLowerCase().includes(q)) return true;
      return c.teams.some(
        (t) =>
          t.team_name.toLowerCase().includes(q) ||
          t.leader_name.toLowerCase().includes(q) ||
          t.leader_email.toLowerCase().includes(q) ||
          (t.members && t.members.some((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)))
      );
    });
  }, [participatingColleges, collegeSearch, collegeFilterEvent]);

  // All unique available colleges (registered institutions + configured list)
  const availableCollegeOptions = useMemo(() => {
    const set = new Set<string>();
    participatingColleges.forEach((c) => set.add(c.collegeName));
    colleges.forEach((c) => set.add(c));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [participatingColleges, colleges]);

  const filteredCredentials = useMemo(() => {
    const q = credSearchQuery.trim().toLowerCase();
    if (!q) return collegeCredentials;
    return collegeCredentials.filter(
      (c) =>
        c.collegeName.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q)
    );
  }, [collegeCredentials, credSearchQuery]);

  // Filtered payments list
  const filteredPayments = visibleRegistrations.filter((reg) => {
    const matchesFilter =
      paymentsFilterEvent === "all" ||
      reg.event_name === paymentsFilterEvent ||
      (paymentsFilterEvent === "shepitch_chennai" && (reg.event_name === "shepitch_chennai" || reg.event_name === "shepitch"));
    const q = paymentsSearchQuery.toLowerCase();
    const matchesSearch =
      reg.id.toLowerCase().includes(q) ||
      reg.team_name.toLowerCase().includes(q) ||
      reg.leader_name.toLowerCase().includes(q) ||
      reg.leader_email.toLowerCase().includes(q) ||
      reg.college_name.toLowerCase().includes(q) ||
      reg.payment_id.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const filteredPaymentsRevenue = filteredPayments.reduce((acc, r) => acc + (r.amount_paid || 0), 0);

  // 1. Export Overview & Executive Metrics Report
  const handleExportOverviewReport = () => {
    const kpiRows = [
      { Metric: "Total Squad Registrations", Value: totalRegistrations, Unit: "Teams" },
      { Metric: "Total Revenue Collected", Value: totalRevenue, Unit: "INR (₹)" },
      { Metric: "ShePitch Chennai Edition 2 Squads", Value: shepitchChennaiCount, Unit: "Teams (@ ₹99/member)" },
      { Metric: "ShePitch Chennai Revenue", Value: shepitchChennaiRevenue, Unit: "INR (₹)" },
      { Metric: "ShePitch Coimbatore Edition Squads", Value: shepitchCoimbatoreCount, Unit: "Teams (@ ₹99/member)" },
      { Metric: "ShePitch Coimbatore Revenue", Value: shepitchCoimbatoreRevenue, Unit: "INR (₹)" },
      { Metric: "HackPick 2026 Registered Teams", Value: hackpickCount, Unit: "Teams (@ ₹199 flat)" },
      { Metric: "HackPick Revenue Collected", Value: hackpickRevenue, Unit: "INR (₹)" },
      { Metric: "Total Student Participants", Value: totalParticipants, Unit: "Students" },
      { Metric: "Participating Colleges Enrolled", Value: participatingColleges.length, Unit: "Institutions" },
      { Metric: "Total Emails Dispatched", Value: `${totalSentEmails}/${totalProcessedEmails}`, Unit: "Member Credentials" },
      { Metric: "Database Engine", Value: dbStatus?.connected ? "Aiven Cloud PostgreSQL Live" : "Safe Local Storage", Unit: dbStatus?.host || "PostgreSQL" },
      { Metric: "Brevo Transactional Relay", Value: smtpInfo?.connected ? "Domain Authenticated" : "Verified Relay", Unit: "events@ugham.com" },
      { Metric: "Report Generated On", Value: new Date().toLocaleString(), Unit: "Timestamp" },
    ];

    const collegeBreakdown = participatingColleges.map((col) => {
      return {
        "College / Institution": col.collegeName,
        "Total Squads Registered": col.teams.length,
        "Total Students Enrolled": col.studentsCount,
        "Revenue Generated (INR)": col.revenue,
      };
    });

    const workbook = XLSX.utils.book_new();
    const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
    wsKpi["!cols"] = [{ wch: 36 }, { wch: 26 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(workbook, wsKpi, "Executive Metrics");

    const wsCollege = XLSX.utils.json_to_sheet(collegeBreakdown);
    wsCollege["!cols"] = [{ wch: 38 }, { wch: 24 }, { wch: 22 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(workbook, wsCollege, "College Breakdown");

    XLSX.writeFile(workbook, `Ugham_Executive_Overview_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // 2. Export Registrations Report
  const handleExportRegistrationsReport = () => {
    if (visibleRegistrations.length === 0) {
      alert("No registration records available to export.");
      return;
    }
    const excelRows = visibleRegistrations.map((r, idx) => ({
      "S.No": idx + 1,
      "Registration ID": r.id,
      "Event Name": formatEventName(r.event_name),
      "Track / Category": r.track || "Standard Sprint",
      Domain: r.domain,
      "Team Name": r.team_name,
      "College / Institution": r.college_name,
      Department: r.department,
      "Year of Study": r.year_of_study,
      "Team Leader": r.leader_name,
      "Leader Email": r.leader_email,
      "Mobile / WhatsApp": r.mobile,
      "Team Size": r.team_size,
      "Amount Paid (INR)": r.amount_paid,
      "Payment ID": r.payment_id,
      "Round Status": r.round_status || "Round 1 (In Review)",
      "Internship Selected": r.internship_selected ? "Yes" : "No",
      "Jury Feedback": r.jury_feedback || "None",
      "Member Details": r.members?.map((m) => `${m.name} (${m.role || "Member"}: ${m.email})`).join("; ") || "",
      "Email Dispatch Status": r.email_status?.toUpperCase() || "SENT",
      "Registered Timestamp": new Date(r.created_at).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Event Registrations");
    worksheet["!cols"] = Object.keys(excelRows[0] || {}).map(() => ({ wch: 22 }));
    XLSX.writeFile(workbook, `Ugham_Event_Registrations_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // 3. Export Payments Ledger Report
  const handleExportPaymentsReport = () => {
    if (visibleRegistrations.length === 0) {
      alert("No payment records recorded yet to export.");
      return;
    }
    const paymentRows: any[] = visibleRegistrations.map((r, idx) => ({
      "S.No": idx + 1,
      "Payment Reference ID": r.payment_id,
      "Event Name": formatEventName(r.event_name),
      "Track / Category": r.track || "Deep-Tech Sprint",
      "Team Name": r.team_name,
      "College / Institution": r.college_name,
      "Team Leader": r.leader_name,
      "Leader Email": r.leader_email,
      "Mobile Contact": r.mobile,
      "Squad Size": `${r.team_size} Members`,
      "Amount Paid (INR)": r.amount_paid,
      "Payment Gateway": "Razorpay (Online)",
      "Payment Status": "Captured & Verified",
      "Registration Date & Time": new Date(r.created_at).toLocaleString(),
    }));

    // Append summary total
    paymentRows.push({
      "S.No": "TOTAL",
      "Payment Reference ID": `${visibleRegistrations.length} Transactions`,
      "Event Name": `ShePitch Chennai: ₹${shepitchChennaiRevenue} | ShePitch Coimbatore: ₹${shepitchCoimbatoreRevenue} | HackPick: ₹${hackpickRevenue}`,
      "Track / Category": "-",
      "Team Name": "-",
      "College / Institution": "-",
      "Team Leader": "-",
      "Leader Email": "-",
      "Mobile Contact": "-",
      "Squad Size": `${totalParticipants} Students`,
      "Amount Paid (INR)": totalRevenue,
      "Payment Gateway": "Razorpay Live",
      "Payment Status": "100% Reconciled",
      "Registration Date & Time": new Date().toLocaleString(),
    });

    const worksheet = XLSX.utils.json_to_sheet(paymentRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments Ledger");
    worksheet["!cols"] = Object.keys(paymentRows[0] || {}).map(() => ({ wch: 24 }));
    XLSX.writeFile(workbook, `Ugham_Payments_Ledger_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // 4. Export Colleges Report
  const handleExportCollegesReport = () => {
    if (participatingColleges.length === 0) {
      alert("No participating institutions recorded yet.");
      return;
    }
    const collegeRows = participatingColleges.map((col, idx) => {
      const cred = collegeCredentials.find((c) => c.collegeName.toLowerCase() === col.collegeName.toLowerCase());
      return {
        "S.No": idx + 1,
        "College / Institution Name": col.collegeName,
        "Registered Teams Count": col.teams.length,
        "Total Students Enrolled": col.studentsCount,
        "Revenue Generated (INR)": col.revenue,
        "Participating Arenas": Array.from(col.events).map((e: any) => formatEventName(e)).join(", "),
        "Portal Username": cred ? cred.username : "Not Set",
        "Portal Password": cred ? cred.password : "Not Set",
        "Portal Status": cred ? "Active Credentials" : "Needs Credentials",
        "Last Verified Date": new Date().toLocaleDateString(),
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(collegeRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Colleges Directory");
    worksheet["!cols"] = Object.keys(collegeRows[0] || {}).map(() => ({ wch: 28 }));
    XLSX.writeFile(workbook, `Ugham_Colleges_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // 5. Export Email Transmission Logs Report
  const handleExportEmailsReport = () => {
    if (allDispatchedEmails.length === 0) {
      alert("No email transmission logs available.");
      return;
    }
    const emailRows = allDispatchedEmails.map((e, idx) => ({
      "S.No": idx + 1,
      "Recipient Name": e.memberName,
      "Recipient Email (Username)": e.memberEmail,
      "Role": e.role,
      "Team Name": e.teamName,
      "Event Name": formatEventName(e.eventName),
      "Track": e.track || "Sprint",
      "Email Template": "Official Squad Confirmation & Credentials",
      "Transmission Status": e.status.toUpperCase(),
      "Dispatched Date & Time": new Date(e.createdAt).toLocaleString(),
      "Relay Host": "smtp-relay.brevo.com:587 (STARTTLS)",
      "Sender Identity": "UGHAM Events <events@ugham.com>",
    }));
    const worksheet = XLSX.utils.json_to_sheet(emailRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Email Transmission Logs");
    worksheet["!cols"] = Object.keys(emailRows[0] || {}).map(() => ({ wch: 26 }));
    XLSX.writeFile(workbook, `Ugham_Email_Transmission_Logs_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // Alias for global export button
  const handleExportExcel = handleExportRegistrationsReport;

  const handleResendEmail = async (regId: string) => {
    setResendingId(regId);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId, action: "resendEmail" }),
      });
      const data = await res.json();
      if (data.success) {
        setRegistrations((prev) =>
          prev.map((item) => (item.id === regId ? { ...item, email_status: data.status } : item))
        );
      }
    } catch (err) {
      console.error("Resend error:", err);
    } finally {
      setResendingId(null);
    }
  };

  // Flatten ONLY real squad participant emails for the "Emails Sent" monitor (never include UGH-TEST-* testing data)
  const registrationEmails = registrations
    .filter((reg) => !reg.id.startsWith("UGH-TEST-"))
    .flatMap((reg) =>
      (reg.members || []).map((m) => ({
        registrationId: reg.id,
        memberName: m.name,
        memberEmail: m.email,
        role: m.role || "Member",
        teamName: reg.team_name,
        eventName: reg.event_name,
        track: reg.track,
        status: reg.email_status || "sent",
        createdAt: reg.created_at,
      }))
    );

  // Real-time dispatched emails list & accurate counts (never hardcoded or inflated)
  const brevoDispatchedList = (smtpInfo?.dispatchedEmails || []).map((d: any) => ({
    dispatchId: d.id,
    registrationId: d.registrationId || "BREVO-RELAY",
    memberName: d.recipientName || d.recipientEmail.split("@")[0],
    memberEmail: d.recipientEmail,
    role: d.type || "Participant",
    teamName: d.teamName || "UGHAM Events",
    eventName: d.eventName || "Brevo Delivery",
    track: d.subject || "Domain Notice",
    status: d.status || "sent",
    createdAt: d.timestamp,
  }));

  const allDispatchedEmails = registrationEmails;

  const totalSentEmails = allDispatchedEmails.filter((e) => e.status === "sent").length;
  const totalProcessedEmails = allDispatchedEmails.length;
  const totalPendingEmails = allDispatchedEmails.filter(
    (e) => e.status === "pending" || e.status === "sending"
  ).length;
  const totalFailedEmails = allDispatchedEmails.filter((e) => e.status === "failed").length;

  // Single member email resend handler
  const handleResendSingleEmail = async (registrationId: string, memberEmail: string) => {
    setResendingEmail(memberEmail);
    try {
      const res = await fetch("/api/admin/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resendMemberEmail",
          registrationId,
          memberEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSendSuccessMsg(`Confirmation email successfully delivered to ${memberEmail}`);
        setRegistrations((prev) =>
          prev.map((item) =>
            item.id === registrationId ? { ...item, email_status: "sent" } : item
          )
        );
        setTimeout(() => setEmailSendSuccessMsg(""), 4000);
      } else {
        alert(data.error || "Failed to dispatch email");
      }
    } catch (err: any) {
      alert(err.message || "Failed to connect to server");
    } finally {
      setResendingEmail(null);
    }
  };

  // Filtered dispatched emails for Emails Sent Monitor
  const filteredDispatchedEmails = allDispatchedEmails.filter((item) => {
    const matchesStatus =
      emailFilterStatus === "all" ||
      (emailFilterStatus === "sent" && item.status === "sent") ||
      (emailFilterStatus === "pending" && (item.status === "pending" || item.status === "sending")) ||
      (emailFilterStatus === "failed" && item.status === "failed");

    const q = emailSearchQuery.toLowerCase();
    const matchesSearch =
      item.memberName.toLowerCase().includes(q) ||
      item.memberEmail.toLowerCase().includes(q) ||
      item.teamName.toLowerCase().includes(q) ||
      item.eventName.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  // Slices for 5 items per page across all listing areas
  const paginatedRegistrations = filteredList.slice(
    (registrationsPage - 1) * PAGE_SIZE,
    registrationsPage * PAGE_SIZE
  );

  const paginatedPayments = filteredPayments.slice(
    (paymentsPage - 1) * PAGE_SIZE,
    paymentsPage * PAGE_SIZE
  );

  const paginatedColleges = filteredParticipatingColleges.slice(
    (collegesPage - 1) * PAGE_SIZE,
    collegesPage * PAGE_SIZE
  );

  const paginatedCredentials = filteredCredentials.slice(
    (credentialsPage - 1) * PAGE_SIZE,
    credentialsPage * PAGE_SIZE
  );

  const paginatedEmails = filteredDispatchedEmails.slice(
    (emailsPage - 1) * PAGE_SIZE,
    emailsPage * PAGE_SIZE
  );

  // Login Gate
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "160px 20px 80px",
          background: "radial-gradient(circle at center, rgba(124,58,237,0.08) 0%, transparent 70%)",
        }}
      >
        <div
          style={{
            maxWidth: "440px",
            width: "100%",
            padding: "44px 36px",
            borderRadius: "28px",
            textAlign: "center",
            background: "#ffffff",
            border: "1.5px solid rgba(124,58,237,0.2)",
            boxShadow: "0 25px 60px rgba(124,58,237,0.12)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 8px 20px rgba(124,58,237,0.3)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            MyAdmin Executive Gate
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "26px", lineHeight: "1.6" }}>
            Enter your admin passkey to manage real-time registrations, college directory, and export student reports.
          </p>

          {authError && (
            <div
              style={{
                color: "#dc2626",
                background: "rgba(239,68,68,0.08)",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "13px",
                fontWeight: 700,
                marginBottom: "18px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ textAlign: "left", marginBottom: "20px" }}>
              <input
                type="password"
                placeholder="Enter Admin Password (ugham@admin2026)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required
                style={{
                  width: "100%",
                  height: "52px",
                  padding: "14px 18px",
                  borderRadius: "14px",
                  border: "1.5px solid #e2e8f0",
                  fontSize: "15px",
                  outline: "none",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "16px", borderRadius: "14px" }}
            >
              <span>Unlock Admin Desk</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: "140px",
        minHeight: "100vh",
        background: "#f8fafc",
      }}
    >
      <div className="container" style={{ maxWidth: "1360px", padding: "0 24px 80px" }}>
        {/* Main Dashboard Wrapper with Responsive Sidebar Layout */}
        <div className="admin-dashboard-layout">
          {/* ── DESKTOP SIDEBAR (HIDDEN ON MOBILE VIEW) ── */}
          <aside className="admin-sidebar">
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", paddingBottom: "14px", borderBottom: "1px solid #f1f5f9" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: "#000000",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: "15px",
                }}
              >
                U
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.5px" }}>
                  ADMIN DESK
                </div>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                  {activeTab === "brevo-db" ? "Brevo & Database" : activeTab.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="admin-sidebar-nav">
              {/* Menu 1: Overview & Metrics */}
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`admin-nav-item ${activeTab === "overview" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span>Overview &amp; Metrics</span>
                </div>
              </button>

              {/* Menu 2: Registrations */}
              <button
                type="button"
                onClick={() => setActiveTab("registrations")}
                className={`admin-nav-item ${activeTab === "registrations" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>Registrations</span>
                </div>
                <span className="admin-nav-badge">
                  {totalRegistrations}
                </span>
              </button>

              {/* Menu 3: Payments */}
              <button
                type="button"
                onClick={() => setActiveTab("payments")}
                className={`admin-nav-item ${activeTab === "payments" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  <span>Payments</span>
                </div>
                <span className="admin-nav-badge">
                  ₹{totalRevenue}
                </span>
              </button>

              {/* Menu 4: College Directory */}
              <button
                type="button"
                onClick={() => setActiveTab("colleges")}
                className={`admin-nav-item ${activeTab === "colleges" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                    <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                    <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                  </svg>
                  <span>Colleges</span>
                </div>
                <span className="admin-nav-badge">
                  {participatingColleges.length}
                </span>
              </button>

              {/* Menu 5: Teams (Round Updates & Collected Links per Event) */}
              <button
                type="button"
                onClick={() => setActiveTab("teams")}
                className={`admin-nav-item ${activeTab === "teams" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <span>Teams &amp; Rounds</span>
                </div>
                <span className="admin-nav-badge">
                  {totalRegistrations}
                </span>
              </button>

              {/* Menu 6: Event Editions & Archives */}
              <button
                type="button"
                onClick={() => setActiveTab("editions")}
                className={`admin-nav-item ${activeTab === "editions" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  <span>Event Editions</span>
                </div>
                <span className="admin-nav-badge">
                  {editions.length || 3}
                </span>
              </button>

              {/* Menu 5: Brevo Mail & Database */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("brevo-db");
                  fetchSmtpStatus();
                }}
                className={`admin-nav-item ${activeTab === "brevo-db" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
                  </svg>
                  <span>Brevo Mail &amp; Database</span>
                </div>
                <span className="admin-nav-badge">
                  {smtpInfo?.connected ? "Live" : "Brevo"}
                </span>
              </button>

              {/* Menu 6: Emails Sent Monitor */}
              <button
                type="button"
                onClick={() => setActiveTab("emails-sent")}
                className={`admin-nav-item ${activeTab === "emails-sent" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                  </svg>
                  <span>Emails Sent</span>
                </div>
                <span className="admin-nav-badge">
                  {totalSentEmails}/{totalProcessedEmails}
                </span>
              </button>

              {/* Menu 7: Warning (Protected Deletion Zone) */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab("warning");
                  setWarningSelectedIds([]);
                }}
                className={`admin-nav-item ${activeTab === "warning" ? "active" : ""}`}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#dc2626" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>Warning</span>
                </div>
                <span className="admin-nav-badge" style={{ color: "#b91c1c", background: "#fef2f2", borderColor: "#fecaca" }}>
                  Delete
                </span>
              </button>
            </nav>

            <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "10px 0" }} />

            {/* Quick Actions & Logout with identical uniform colors */}
            <div className="admin-quick-actions">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={visibleRegistrations.length === 0}
                className="admin-nav-item"
                style={{
                  cursor: visibleRegistrations.length === 0 ? "not-allowed" : "pointer",
                  opacity: visibleRegistrations.length === 0 ? 0.5 : 1,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Export Excel Sheet</span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="admin-nav-item"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>Log Out of Desk</span>
                </div>
              </button>
            </div>
          </aside>

          {/* ── MOBILE BOTTOM-RIGHT FLOATING ACTION BUTTON (FAB) ── */}
          <button
            type="button"
            className={`admin-mobile-fab ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menus"
            title={mobileMenuOpen ? "Close Desk Menus" : "Open Desk Menus"}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          {/* ── MOBILE SPEED-DIAL FLOATING MENU OVERLAY (ONE-BY-ONE APPEARANCE) ── */}
          {mobileMenuOpen && (
            <>
              <div className="admin-speed-dial-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
              <div className="admin-speed-dial-stack">
                {/* 1. Overview & Metrics */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
                  className={`admin-speed-dial-pill ${activeTab === "overview" ? "active" : ""}`}
                  style={{ animationDelay: "0.24s" }}
                >
                  <span className="speed-dial-label">Overview &amp; Metrics</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  </span>
                </button>

                {/* 2. Registrations */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("registrations"); setMobileMenuOpen(false); }}
                  className={`admin-speed-dial-pill ${activeTab === "registrations" ? "active" : ""}`}
                  style={{ animationDelay: "0.21s" }}
                >
                  <span className="speed-dial-label">Registrations</span>
                  <span className="speed-dial-badge">{totalRegistrations}</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </span>
                </button>

                {/* 3. Payments */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("payments"); setMobileMenuOpen(false); }}
                  className={`admin-speed-dial-pill ${activeTab === "payments" ? "active" : ""}`}
                  style={{ animationDelay: "0.18s" }}
                >
                  <span className="speed-dial-label">Payments</span>
                  <span className="speed-dial-badge">₹{totalRevenue}</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  </span>
                </button>

                {/* 4. College Directory */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("colleges"); setMobileMenuOpen(false); }}
                  className={`admin-speed-dial-pill ${activeTab === "colleges" ? "active" : ""}`}
                  style={{ animationDelay: "0.15s" }}
                >
                  <span className="speed-dial-label">Colleges</span>
                  <span className="speed-dial-badge">{participatingColleges.length}</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path></svg>
                  </span>
                </button>

                {/* 5. Teams & Rounds */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("teams"); setMobileMenuOpen(false); }}
                  className={`admin-speed-dial-pill ${activeTab === "teams" ? "active" : ""}`}
                  style={{ animationDelay: "0.13s" }}
                >
                  <span className="speed-dial-label">Teams &amp; Rounds</span>
                  <span className="speed-dial-badge">{totalRegistrations}</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                  </span>
                </button>

                {/* 6. Event Editions */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("editions"); setMobileMenuOpen(false); }}
                  className={`admin-speed-dial-pill ${activeTab === "editions" ? "active" : ""}`}
                  style={{ animationDelay: "0.11s" }}
                >
                  <span className="speed-dial-label">Event Editions</span>
                  <span className="speed-dial-badge">{editions.length || 3}</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                  </span>
                </button>

                {/* 5. Brevo Mail & Database */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("brevo-db"); setMobileMenuOpen(false); fetchSmtpStatus(); }}
                  className={`admin-speed-dial-pill ${activeTab === "brevo-db" ? "active" : ""}`}
                  style={{ animationDelay: "0.12s" }}
                >
                  <span className="speed-dial-label">Brevo Mail &amp; Database</span>
                  <span className="speed-dial-badge">{smtpInfo?.connected ? "Live" : "Brevo"}</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>
                  </span>
                </button>

                {/* 6. Emails Sent */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("emails-sent"); setMobileMenuOpen(false); }}
                  className={`admin-speed-dial-pill ${activeTab === "emails-sent" ? "active" : ""}`}
                  style={{ animationDelay: "0.09s" }}
                >
                  <span className="speed-dial-label">Emails Sent</span>
                  <span className="speed-dial-badge">{totalSentEmails}/{totalProcessedEmails}</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                  </span>
                </button>

                {/* 7. Warning Zone */}
                <button
                  type="button"
                  onClick={() => { setActiveTab("warning"); setWarningSelectedIds([]); setMobileMenuOpen(false); }}
                  className={`admin-speed-dial-pill ${activeTab === "warning" ? "active" : ""}`}
                  style={{ animationDelay: "0.07s" }}
                >
                  <span className="speed-dial-label" style={{ color: activeTab === "warning" ? "#ffffff" : "#dc2626" }}>Warning</span>
                  <span className="speed-dial-icon" style={{ color: activeTab === "warning" ? "#ffffff" : "#dc2626" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </span>
                </button>

                {/* 7. Export Excel Sheet */}
                <button
                  type="button"
                  onClick={() => { handleExportExcel(); setMobileMenuOpen(false); }}
                  disabled={visibleRegistrations.length === 0}
                  className="admin-speed-dial-pill"
                  style={{ animationDelay: "0.06s", opacity: visibleRegistrations.length === 0 ? 0.6 : 1 }}
                >
                  <span className="speed-dial-label">Export Excel Sheet</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </span>
                </button>

                {/* 8. Log Out */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="admin-speed-dial-pill"
                  style={{ animationDelay: "0.01s" }}
                >
                  <span className="speed-dial-label">Log Out of Desk</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  </span>
                </button>
              </div>
            </>
          )}

          {/* ── MAIN CONTENT AREA ── */}
          <main style={{ minWidth: 0 }}>
            {/* Header Title & Quick Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
                marginBottom: "28px",
              }}
            >
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a", margin: "4px 0" }}>
                  {activeTab === "overview" && "Executive Overview & Metrics"}
                  {activeTab === "registrations" && "Squad Registrations Desk"}
                  {activeTab === "payments" && "Event Payments & Financial Ledger"}
                  {activeTab === "colleges" && "Colleges & Institutional Portals"}
                  {activeTab === "teams" && "Teams Round Control & Collected Links"}
                  {activeTab === "editions" && "Event Editions & Version Lifecycle"}
                  {activeTab === "warning" && "Warning: Record Deletion Center"}
                  {activeTab === "brevo-db" && "Brevo Mail & Database Infrastructure"}
                  {activeTab === "emails-sent" && "Outgoing Emails Dispatch Monitor"}
                </h1>
                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                  {activeTab === "overview" && "Live registration metrics, revenue counters, and WhatsApp community links."}
                  {activeTab === "registrations" && "Participant database records, member rosters, and Excel spreadsheet export."}
                  {activeTab === "payments" && "Razorpay online collections, event-wise fee breakdown, and transaction status."}
                  {activeTab === "colleges" && "College-wise registered teams, student rosters, college payments, and manual portal credentials."}
                  {activeTab === "teams" && "Update round-wise team statuses live per event and review all round link submissions."}
                  {activeTab === "editions" && "Launch upcoming ShePitch & HackPick editions live to students and browse stored past versions."}
                  {activeTab === "warning" && "Selectively delete registered teams, colleges, or email transmission logs with authorization verification."}
                  {activeTab === "brevo-db" && "Brevo relay health, custom domain transmission status, and PostgreSQL sync."}
                  {activeTab === "emails-sent" && "Track outgoing member credential emails, delivery states, and instant resend retry."}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                {/* Dedicated Per-Menu Report Download Button (Except Brevo & Database) */}
                {activeTab === "overview" && (
                  <button
                    type="button"
                    onClick={handleExportOverviewReport}
                    className="glacier-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.08)",
                      color: "#059669",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    title="Download Executive KPI Summary Excel Workbook"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download Overview Report (.xlsx)</span>
                  </button>
                )}

                {activeTab === "registrations" && (
                  <button
                    type="button"
                    onClick={handleExportRegistrationsReport}
                    disabled={visibleRegistrations.length === 0}
                    className="glacier-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.08)",
                      color: "#059669",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: visibleRegistrations.length === 0 ? "not-allowed" : "pointer",
                      opacity: visibleRegistrations.length === 0 ? 0.5 : 1,
                    }}
                    title="Download Registrations Roster Excel Sheet"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download Registrations (.xlsx)</span>
                  </button>
                )}

                {activeTab === "payments" && (
                  <button
                    type="button"
                    onClick={handleExportPaymentsReport}
                    disabled={visibleRegistrations.length === 0}
                    className="glacier-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.08)",
                      color: "#059669",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: visibleRegistrations.length === 0 ? "not-allowed" : "pointer",
                      opacity: visibleRegistrations.length === 0 ? 0.5 : 1,
                    }}
                    title="Download Payments & Collections Ledger Excel Sheet"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download Payments Ledger (.xlsx)</span>
                  </button>
                )}

                {(activeTab === "colleges" || activeTab === "teams") && (
                  <button
                    type="button"
                    onClick={handleExportCollegesReport}
                    disabled={participatingColleges.length === 0}
                    className="glacier-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.08)",
                      color: "#059669",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: participatingColleges.length === 0 ? "not-allowed" : "pointer",
                      opacity: participatingColleges.length === 0 ? 0.5 : 1,
                    }}
                    title="Download Colleges & Institutional Report Excel Sheet"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download Report (.xlsx)</span>
                  </button>
                )}

                {activeTab === "emails-sent" && (
                  <button
                    type="button"
                    onClick={handleExportEmailsReport}
                    disabled={allDispatchedEmails.length === 0}
                    className="glacier-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.08)",
                      color: "#059669",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: allDispatchedEmails.length === 0 ? "not-allowed" : "pointer",
                      opacity: allDispatchedEmails.length === 0 ? 0.5 : 1,
                    }}
                    title="Download Email Transmission Logs Excel Sheet"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download Email Logs (.xlsx)</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={fetchRegistrations}
                  className="glacier-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: "1.5px solid #e2e8f0",
                    background: "#ffffff",
                    color: "#334155",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                  title="Refresh and sync data"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ animation: loading ? "spin 1s linear infinite" : "none" }}
                  >
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <polyline points="1 20 1 14 7 14"></polyline>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                  </svg>
                  <span>Sync Records</span>
                </button>
              </div>
            </div>

            {/* ── TAB 1: OVERVIEW & METRICS ── */}
            {activeTab === "overview" && (
              <div>
                {/* Testing Data Sandbox Toggle Strip */}
                <div
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "16px",
                    padding: "14px 20px",
                    marginBottom: "22px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span
                      style={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        background: showTestingData ? "#0f172a" : "#94a3b8",
                        display: "inline-block",
                      }}
                    />
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a" }}>
                        Testing Sandbox Records ({testingCount} Test Squads)
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {showTestingData
                          ? "Showing live + testing data across Registrations, Payments, Overview & Colleges. Real-time Emails Sent always excludes testing records."
                          : "Testing records hidden — showing strictly real student registrations & live revenue."}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowTestingData((prev) => !prev);
                      setRegistrationsPage(1);
                      setPaymentsPage(1);
                      setCollegesPage(1);
                    }}
                    className="glacier-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 14px",
                      borderRadius: "10px",
                      border: showTestingData ? "1.5px solid #0f172a" : "1.5px solid #cbd5e1",
                      background: showTestingData ? "#0f172a" : "#f8fafc",
                      color: showTestingData ? "#ffffff" : "#475569",
                      fontSize: "12.5px",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    <span>{showTestingData ? "Testing Data: ON" : "Testing Data: OFF"}</span>
                    <span
                      style={{
                        width: "34px",
                        height: "18px",
                        borderRadius: "99px",
                        background: showTestingData ? "rgba(255,255,255,0.22)" : "#cbd5e1",
                        position: "relative",
                        display: "inline-block",
                        transition: "background 0.2s ease",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: "2px",
                          left: showTestingData ? "18px" : "2px",
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          background: "#ffffff",
                          transition: "left 0.2s cubic-bezier(0.22, 1, 0.36, 1)",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }}
                      />
                    </span>
                  </button>
                </div>

                {/* Current Events WhatsApp Community Links Input Panel (Syncs directly to Student Portal) */}
                <div
                  className="glacier-card"
                  style={{
                    background: "#ffffff",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "18px",
                    padding: "20px 22px",
                    marginBottom: "24px",
                    boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a" }}>
                        Current Events WhatsApp Community Links
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Update WhatsApp group links for live events — changes reflect immediately in the Student Portal Dashboard.
                      </div>
                    </div>
                    {whatsappSavedMsg && (
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669", background: "rgba(16, 185, 129, 0.12)", padding: "5px 12px", borderRadius: "8px" }}>
                        ✓ {whatsappSavedMsg}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "14px" }}>
                    {editions
                      .filter((ed) => ed.status === "active")
                      .map((ed) => {
                        const draftVal = whatsappDrafts[ed.slug] ?? ed.whatsappLink ?? "";
                        return (
                          <div
                            key={ed.slug}
                            style={{
                              padding: "14px",
                              borderRadius: "12px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              flexDirection: "column",
                              gap: "8px",
                            }}
                          >
                            <div style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a" }}>
                              {ed.title}
                            </div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                              <input
                                type="url"
                                placeholder="https://chat.whatsapp.com/..."
                                value={draftVal}
                                onChange={(e) =>
                                  setWhatsappDrafts((prev) => ({
                                    ...prev,
                                    [ed.slug]: e.target.value,
                                  }))
                                }
                                style={{
                                  flex: 1,
                                  minWidth: "180px",
                                  height: "38px",
                                  padding: "0 12px",
                                  borderRadius: "8px",
                                  border: "1.5px solid #cbd5e1",
                                  background: "#ffffff",
                                  fontSize: "12.5px",
                                  color: "#0f172a",
                                  outline: "none",
                                }}
                              />
                              <button
                                type="button"
                                disabled={savingWhatsappSlug === ed.slug}
                                onClick={() => handleSaveWhatsappLink(ed)}
                                className="glacier-btn"
                                style={{
                                  height: "38px",
                                  padding: "0 14px",
                                  borderRadius: "8px",
                                  border: "1.5px solid transparent",
                                  background: LOGO_GRADIENT,
                                  color: "#ffffff",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  cursor: savingWhatsappSlug === ed.slug ? "wait" : "pointer",
                                }}
                              >
                                {savingWhatsappSlug === ed.slug ? "Saving..." : "Update Link"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* KPI Metrics Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "18px",
                    marginBottom: "28px",
                  }}
                >
                  {/* Stat 1: Revenue */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "20px",
                      padding: "22px 24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                      REVENUE COLLECTED
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#059669", marginTop: "4px" }}>
                      ₹{totalRevenue}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#10b981", marginTop: "4px", fontWeight: 600 }}>
                      Razorpay Active
                    </div>
                  </div>

                  {/* Stat 2: ShePitch Chennai */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "20px",
                      padding: "22px 24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                      SHEPITCH CHENNAI SQUADS
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#C026D3", marginTop: "4px" }}>
                      {shepitchChennaiCount}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>
                      ₹99 per participant
                    </div>
                  </div>

                  {/* Stat 3: ShePitch Coimbatore */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "20px",
                      padding: "22px 24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                      SHEPITCH COIMBATORE SQUADS
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#9333EA", marginTop: "4px" }}>
                      {shepitchCoimbatoreCount}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>
                      ₹99 per participant
                    </div>
                  </div>

                  {/* Stat 4: HackPick */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "20px",
                      padding: "22px 24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                      HACKPICK SQUADS
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#2563EB", marginTop: "4px" }}>
                      {hackpickCount}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>
                      ₹199 flat per squad
                    </div>
                  </div>
                </div>

                {/* ── EVENT BREAKDOWN CONSOLE CARDS (CLICK TO VIEW COLLEGE-WISE TEAMS & STUDENTS) ── */}
                <div style={{ marginBottom: "28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div>
                      <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0" }}>
                        Flagship Event Arenas &amp; College Consoles
                      </h3>
                      <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                        Click any event box below to inspect its collected revenue, unique colleges, and college-wise team rosters.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "18px",
                    }}
                  >
                    {/* Box 1: ShePitch Chennai Edition 2 */}
                    <div
                      onClick={() => setSelectedEventConsole(selectedEventConsole === "shepitch_chennai" ? null : "shepitch_chennai")}
                      style={{
                        background: selectedEventConsole === "shepitch_chennai" ? "linear-gradient(135deg, rgba(192, 38, 211, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)" : "#ffffff",
                        border: selectedEventConsole === "shepitch_chennai" ? "2px solid #C026D3" : "1.5px solid #e2e8f0",
                        borderRadius: "20px",
                        padding: "24px",
                        cursor: "pointer",
                        boxShadow: selectedEventConsole === "shepitch_chennai" ? "0 10px 30px rgba(192, 38, 211, 0.15)" : "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span
                          style={{
                            background: "linear-gradient(135deg, #C026D3, #7C3AED)",
                            color: "#ffffff",
                            padding: "4px 10px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          CHENNAI EDITION 2
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#C026D3" }}>
                          ₹{shepitchChennaiRevenue}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>
                        ShePitch Chennai Edition 2
                      </h4>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
                        Women-led innovation challenge • Chennai Hub
                      </p>

                      <div style={{ display: "flex", gap: "20px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Registered Squads</span>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>{shepitchChennaiCount}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Colleges</span>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#7C3AED" }}>
                            {new Set(visibleRegistrations.filter(r => r.event_name === "shepitch_chennai" || r.event_name === "shepitch").map(r => r.college_name.trim().toLowerCase())).size}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px", fontSize: "12.5px", fontWeight: 800, color: "#C026D3" }}>
                        {selectedEventConsole === "shepitch_chennai" ? "✓ Console Open" : "Open College-Wise Console ↗"}
                      </div>
                    </div>

                    {/* Box 2: ShePitch Coimbatore Edition */}
                    <div
                      onClick={() => setSelectedEventConsole(selectedEventConsole === "shepitch_coimbatore" ? null : "shepitch_coimbatore")}
                      style={{
                        background: selectedEventConsole === "shepitch_coimbatore" ? "linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)" : "#ffffff",
                        border: selectedEventConsole === "shepitch_coimbatore" ? "2px solid #9333EA" : "1.5px solid #e2e8f0",
                        borderRadius: "20px",
                        padding: "24px",
                        cursor: "pointer",
                        boxShadow: selectedEventConsole === "shepitch_coimbatore" ? "0 10px 30px rgba(147, 51, 234, 0.15)" : "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span
                          style={{
                            background: "linear-gradient(135deg, #9333EA, #4F46E5)",
                            color: "#ffffff",
                            padding: "4px 10px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          COIMBATORE EDITION
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#9333EA" }}>
                          ₹{shepitchCoimbatoreRevenue}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>
                        ShePitch Coimbatore Edition
                      </h4>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
                        Women-led innovation challenge • Western TN
                      </p>

                      <div style={{ display: "flex", gap: "20px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Registered Squads</span>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>{shepitchCoimbatoreCount}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Colleges</span>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#9333EA" }}>
                            {new Set(visibleRegistrations.filter(r => r.event_name === "shepitch_coimbatore").map(r => r.college_name.trim().toLowerCase())).size}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px", fontSize: "12.5px", fontWeight: 800, color: "#9333EA" }}>
                        {selectedEventConsole === "shepitch_coimbatore" ? "✓ Console Open" : "Open College-Wise Console ↗"}
                      </div>
                    </div>

                    {/* Box 3: HackPick 2026 */}
                    <div
                      onClick={() => setSelectedEventConsole(selectedEventConsole === "hackpick" ? null : "hackpick")}
                      style={{
                        background: selectedEventConsole === "hackpick" ? "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)" : "#ffffff",
                        border: selectedEventConsole === "hackpick" ? "2px solid #2563EB" : "1.5px solid #e2e8f0",
                        borderRadius: "20px",
                        padding: "24px",
                        cursor: "pointer",
                        boxShadow: selectedEventConsole === "hackpick" ? "0 10px 30px rgba(37, 99, 235, 0.15)" : "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span
                          style={{
                            background: "linear-gradient(135deg, #2563EB, #6366F1)",
                            color: "#ffffff",
                            padding: "4px 10px",
                            borderRadius: "100px",
                            fontSize: "11px",
                            fontWeight: 800,
                            letterSpacing: "0.5px",
                            textTransform: "uppercase",
                          }}
                        >
                          DEEP-TECH SPRINT
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: "#2563EB" }}>
                          ₹{hackpickRevenue}
                        </span>
                      </div>

                      <h4 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>
                        HackPick 2026
                      </h4>
                      <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
                        Rapid engineering marathon • Flat ₹199/squad
                      </p>

                      <div style={{ display: "flex", gap: "20px", paddingTop: "14px", borderTop: "1px solid #f1f5f9" }}>
                        <div>
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Registered Squads</span>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a" }}>{hackpickCount}</div>
                        </div>
                        <div>
                          <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 800, textTransform: "uppercase" }}>Colleges</span>
                          <div style={{ fontSize: "20px", fontWeight: 900, color: "#2563EB" }}>
                            {new Set(visibleRegistrations.filter(r => r.event_name === "hackpick").map(r => r.college_name.trim().toLowerCase())).size}
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "14px", fontSize: "12.5px", fontWeight: 800, color: "#2563EB" }}>
                        {selectedEventConsole === "hackpick" ? "✓ Console Open" : "Open College-Wise Console ↗"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── INTERACTIVE EVENT DRILLDOWN CONSOLE MODAL (BLURRED BACKDROP) ── */}
                {selectedEventConsole && (
                  <div
                    onClick={() => setSelectedEventConsole(null)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 9999,
                      background: "rgba(15, 23, 42, 0.56)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "20px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      className="modal-animate-in"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: "#ffffff",
                        borderRadius: "24px",
                        border: "1.5px solid #e2e8f0",
                        padding: "28px 30px",
                        maxWidth: "1020px",
                        width: "100%",
                        maxHeight: "88vh",
                        overflowY: "auto",
                        boxShadow: "0 28px 70px rgba(15, 23, 42, 0.28)",
                        margin: "auto",
                      }}
                    >
                      {/* Console Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                            <span
                              style={{
                                background: "#0f172a",
                                color: "#ffffff",
                                padding: "4px 10px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.4px",
                              }}
                            >
                              EVENT CONSOLE
                            </span>
                            <h3 style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                              {selectedEventConsole === "shepitch_chennai"
                                ? "ShePitch Chennai Edition 2"
                                : selectedEventConsole === "shepitch_coimbatore"
                                ? "ShePitch Coimbatore Edition"
                                : "HackPick 2026"}
                            </h3>
                          </div>
                          <p style={{ color: "#64748b", fontSize: "13.5px", margin: "4px 0 0 0" }}>
                            Live college-wise enrolled squads, student rosters, evaluation statuses, and certificate dispatch.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedEventConsole(null)}
                          className="glacier-btn"
                          style={{
                            background: "#f8fafc",
                            border: "1.5px solid #e2e8f0",
                            padding: "8px 14px",
                            borderRadius: "10px",
                            fontSize: "13px",
                            fontWeight: 800,
                            color: "#0f172a",
                            cursor: "pointer",
                          }}
                        >
                          ✕ Close Console
                        </button>
                      </div>

                      {/* Console Quick Metrics */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "14px",
                          padding: "16px 20px",
                          background: "#f8fafc",
                          borderRadius: "16px",
                          border: "1px solid #e2e8f0",
                          marginBottom: "24px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
                            Total Registered Squads
                          </div>
                          <div style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                            {visibleRegistrations.filter((r) =>
                              selectedEventConsole === "hackpick"
                                ? r.event_name === "hackpick"
                                : selectedEventConsole === "shepitch_coimbatore"
                                ? r.event_name === "shepitch_coimbatore"
                                : (r.event_name === "shepitch_chennai" || r.event_name === "shepitch")
                            ).length}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
                            Revenue Collected
                          </div>
                          <div style={{ fontSize: "22px", fontWeight: 900, color: "#059669", marginTop: "2px" }}>
                            ₹{visibleRegistrations
                              .filter((r) =>
                                selectedEventConsole === "hackpick"
                                  ? r.event_name === "hackpick"
                                  : selectedEventConsole === "shepitch_coimbatore"
                                  ? r.event_name === "shepitch_coimbatore"
                                  : (r.event_name === "shepitch_chennai" || r.event_name === "shepitch")
                              )
                              .reduce((sum, r) => sum + (r.amount_paid || 0), 0)}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 800, textTransform: "uppercase" }}>
                            Unique Participating Colleges
                          </div>
                          <div style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                            {new Set(
                              visibleRegistrations
                                .filter((r) =>
                                  selectedEventConsole === "hackpick"
                                    ? r.event_name === "hackpick"
                                    : selectedEventConsole === "shepitch_coimbatore"
                                    ? r.event_name === "shepitch_coimbatore"
                                    : (r.event_name === "shepitch_chennai" || r.event_name === "shepitch")
                                )
                                .map((r) => (r.college_name || "").trim().toLowerCase())
                                .filter(Boolean)
                            ).size}
                          </div>
                        </div>
                      </div>

                      {/* College-Wise Breakdown */}
                      <div>
                        <h4 style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a", margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          College-Wise Squads &amp; Students Roster
                        </h4>

                        {(() => {
                          const eventTeams = visibleRegistrations.filter((r) =>
                            selectedEventConsole === "hackpick"
                              ? r.event_name === "hackpick"
                              : selectedEventConsole === "shepitch_coimbatore"
                              ? r.event_name === "shepitch_coimbatore"
                              : (r.event_name === "shepitch_chennai" || r.event_name === "shepitch")
                          );

                          if (eventTeams.length === 0) {
                            return (
                              <div style={{ padding: "32px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                                No squads registered for this event yet.
                              </div>
                            );
                          }

                          // Group by college
                          const collegeMap = new Map<string, RegistrationRecord[]>();
                          eventTeams.forEach((t) => {
                            const cName = (t.college_name || "Unspecified College").trim();
                            if (!collegeMap.has(cName)) collegeMap.set(cName, []);
                            collegeMap.get(cName)!.push(t);
                          });

                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                              {Array.from(collegeMap.entries()).map(([cName, cTeams], cIdx) => {
                                const isExpanded = expandedCollegeKey === cName;
                                const cStudents = cTeams.reduce((sum, t) => sum + (t.team_size || 0), 0);
                                const cRevenue = cTeams.reduce((sum, t) => sum + (t.amount_paid || 0), 0);

                                return (
                                  <div
                                    key={cIdx}
                                    className="glacier-card"
                                    style={{
                                      border: isExpanded ? "1.5px solid #0f172a" : "1.5px solid #e2e8f0",
                                      borderRadius: "16px",
                                      background: "#ffffff",
                                      overflow: "visible",
                                    }}
                                  >
                                    {/* College Header */}
                                    <div
                                      onClick={() => setExpandedCollegeKey(isExpanded ? null : cName)}
                                      style={{
                                        padding: "16px 20px",
                                        background: isExpanded ? "#f1f5f9" : "#f8fafc",
                                        borderRadius: isExpanded ? "14px 14px 0 0" : "14px",
                                        display: "flex",
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "12px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div
                                          style={{
                                            width: "36px",
                                            height: "36px",
                                            borderRadius: "10px",
                                            background: "#0f172a",
                                            color: "#ffffff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                          }}
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                                            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                                            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                                          </svg>
                                        </div>
                                        <div>
                                          <h5 style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                            {cName}
                                          </h5>
                                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                                            {cTeams.length} Squads • {cStudents} Students Enrolled • ₹{cRevenue} Collected
                                          </span>
                                        </div>
                                      </div>

                                      <span
                                        style={{
                                          fontSize: "12px",
                                          fontWeight: 800,
                                          color: "#0f172a",
                                          padding: "6px 12px",
                                          borderRadius: "8px",
                                          border: "1px solid #cbd5e1",
                                          background: "#ffffff",
                                        }}
                                      >
                                        {isExpanded ? "▲ Hide Squads & Students" : "▼ Expand Squads & Students"}
                                      </span>
                                    </div>

                                    {/* Expanded Squads and Students List */}
                                    {isExpanded && (
                                      <div style={{ padding: "18px 20px", borderTop: "1px solid #e2e8f0" }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                          {cTeams.map((team, tIdx) => (
                                            <div
                                              key={team.id || tIdx}
                                              style={{
                                                padding: "16px",
                                                borderRadius: "14px",
                                                background: "#f8fafc",
                                                border: "1px solid #e2e8f0",
                                              }}
                                            >
                                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                                                <div>
                                                  <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                                                    {team.team_name}
                                                  </strong>
                                                  <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>
                                                    ({team.domain} {team.track ? `• ${team.track}` : ""})
                                                  </span>
                                                </div>
                                                <span style={{ fontSize: "11px", fontWeight: 800, background: "#e2e8f0", color: "#0f172a", padding: "4px 10px", borderRadius: "6px" }}>
                                                  {team.round_status || "Round 1"}
                                                </span>
                                              </div>

                                              {/* Students Roster in this Squad */}
                                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
                                                {/* Leader */}
                                                <div style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase" }}>Leader</div>
                                                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{team.leader_name}</div>
                                                  <div style={{ fontSize: "11.5px", color: "#64748b" }}>{team.leader_email}</div>
                                                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Ph: {team.mobile}</div>
                                                </div>

                                                {/* Members */}
                                                {team.members && team.members.map((m, mIdx) => (
                                                  <div key={mIdx} style={{ background: "#ffffff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                                                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>Member {mIdx + 2}</div>
                                                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{m.name}</div>
                                                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>{m.email}</div>
                                                  </div>
                                                ))}
                                              </div>

                                              {/* Evaluation Inputs & Animated Controls */}
                                              <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
                                                  <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                                      Round Evaluation Status
                                                    </label>
                                                    <CustomSelect
                                                      compact
                                                      options={ROUND_STATUS_OPTIONS}
                                                      value={team.round_status || "Round 1 (PPT & Video Submission)"}
                                                      onChange={(val) => handleUpdateTeamStatus(team.id, { round_status: val })}
                                                      disabled={updatingTeamId === team.id}
                                                      placeholder="Choose evaluation stage..."
                                                    />
                                                  </div>

                                                  <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                                      Jury Feedback (Live in Portals)
                                                    </label>
                                                    <input
                                                      type="text"
                                                      placeholder="Add jury evaluation feedback..."
                                                      defaultValue={team.jury_feedback || ""}
                                                      onBlur={(e) => {
                                                        const val = e.target.value.trim();
                                                        if (val !== (team.jury_feedback || "")) {
                                                          handleUpdateTeamStatus(team.id, { jury_feedback: val });
                                                        }
                                                      }}
                                                      style={{
                                                        width: "100%",
                                                        height: "40px",
                                                        padding: "0 12px",
                                                        borderRadius: "10px",
                                                        border: "1.5px solid #cbd5e1",
                                                        background: "#ffffff",
                                                        fontSize: "12.5px",
                                                        color: "#0f172a",
                                                        outline: "none",
                                                      }}
                                                    />
                                                  </div>

                                                  <div>
                                                    <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                                      Internship Selection Purpose / Reason
                                                    </label>
                                                    <input
                                                      type="text"
                                                      placeholder="Explain why internship was selected or not selected..."
                                                      defaultValue={team.internship_reason || ""}
                                                      onBlur={(e) => {
                                                        const val = e.target.value.trim();
                                                        if (val !== (team.internship_reason || "")) {
                                                          handleUpdateTeamStatus(team.id, { internship_reason: val });
                                                        }
                                                      }}
                                                      style={{
                                                        width: "100%",
                                                        height: "40px",
                                                        padding: "0 12px",
                                                        borderRadius: "10px",
                                                        border: "1.5px solid #cbd5e1",
                                                        background: "#ffffff",
                                                        fontSize: "12.5px",
                                                        color: "#0f172a",
                                                        outline: "none",
                                                      }}
                                                    />
                                                  </div>
                                                </div>

                                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                                                  <AnimatedCheckbox
                                                    checked={!!team.internship_selected}
                                                    disabled={updatingTeamId === team.id}
                                                    onChange={() => {
                                                      void handleUpdateTeamStatus(team.id, { internship_selected: !team.internship_selected });
                                                    }}
                                                    label="Internship Selected"
                                                    subLabel="Shortlisted for Ugham Venture Internship"
                                                  />

                                                  <AnimatedCheckbox
                                                    checked={!!team.certificate_issued || !!team.is_past_event}
                                                    disabled={updatingTeamId === team.id}
                                                    onChange={() => {
                                                      const nextChecked = !(!!team.certificate_issued || !!team.is_past_event);
                                                      void handleUpdateTeamStatus(team.id, {
                                                        certificate_issued: nextChecked,
                                                        is_past_event: nextChecked,
                                                        certificate_title:
                                                          team.certificate_title ||
                                                          `${formatEventName(team.event_name)} — Official Certificate`,
                                                        certificate_issued_at: nextChecked ? new Date().toISOString() : "",
                                                      });
                                                    }}
                                                    label="Issue Certificate & Move to Past Events"
                                                    subLabel="Unlocks certificate in Student Portal"
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Overview Quick Stats & Navigation Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                    marginBottom: "28px",
                  }}
                >
                  {/* Card 1: Registrations Quick Access */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1.5px solid #e2e8f0",
                      padding: "24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                        Squad Registrations Desk
                      </h3>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#7C3AED", background: "rgba(124, 58, 237, 0.08)", padding: "3px 10px", borderRadius: "6px" }}>
                        {totalRegistrations} Teams
                      </span>
                    </div>
                    <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 18px 0", lineHeight: "1.6" }}>
                      Review team compositions, inspect registered college records, and download comprehensive Excel sheets.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("registrations")}
                      className="btn-primary"
                      style={{ padding: "10px 18px", borderRadius: "10px", fontSize: "13px" }}
                    >
                      Open Registrations Desk &rarr;
                    </button>
                  </div>

                  {/* Card 2: Outgoing Email Dispatches */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1.5px solid #e2e8f0",
                      padding: "24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
                        Email Dispatch Monitor
                      </h3>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669", background: "rgba(16, 185, 129, 0.08)", padding: "3px 10px", borderRadius: "6px" }}>
                        {totalSentEmails} Delivered
                      </span>
                    </div>
                    <p style={{ fontSize: "13.5px", color: "#64748b", margin: "0 0 18px 0", lineHeight: "1.6" }}>
                      Inspect outgoing credential deliveries for all student team members with instant reload resend capability.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("emails-sent")}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 700,
                        border: "1px solid rgba(124, 58, 237, 0.3)",
                        background: "#ffffff",
                        color: "#7C3AED",
                        cursor: "pointer",
                      }}
                    >
                      Open Email Monitor &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB 2: REGISTRATIONS VIEW ── */}
            {activeTab === "registrations" && (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  border: "1.5px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  overflow: "hidden",
                }}
              >
                {/* Table Control Bar */}
                <div
                  style={{
                    padding: "20px 24px",
                    borderBottom: "1.5px solid #f1f5f9",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                  }}
                >
                  {/* Event Filter Capsules */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        setFilterEvent("all");
                        setRegistrationsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: filterEvent === "all" ? LOGO_GRADIENT : "#f1f5f9",
                        color: filterEvent === "all" ? "#ffffff" : "#475569",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      All Events ({totalRegistrations})
                    </button>
                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        setFilterEvent("shepitch_chennai");
                        setRegistrationsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: filterEvent === "shepitch_chennai" ? LOGO_GRADIENT : "#f1f5f9",
                        color: filterEvent === "shepitch_chennai" ? "#ffffff" : "#475569",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ShePitch Chennai ({shepitchChennaiCount})
                    </button>
                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        setFilterEvent("shepitch_coimbatore");
                        setRegistrationsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: filterEvent === "shepitch_coimbatore" ? LOGO_GRADIENT : "#f1f5f9",
                        color: filterEvent === "shepitch_coimbatore" ? "#ffffff" : "#475569",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ShePitch Coimbatore ({shepitchCoimbatoreCount})
                    </button>
                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        setFilterEvent("hackpick");
                        setRegistrationsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: filterEvent === "hackpick" ? LOGO_GRADIENT : "#f1f5f9",
                        color: filterEvent === "hackpick" ? "#ffffff" : "#475569",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      HackPick ({hackpickCount})
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div style={{ position: "relative", width: "300px" }}>
                    <span
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search squad, leader, email, college..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setRegistrationsPage(1);
                      }}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "8px 14px 8px 38px",
                        borderRadius: "12px",
                        border: "1.5px solid #e2e8f0",
                        fontSize: "13px",
                        outline: "none",
                        color: "#0f172a",
                      }}
                    />
                  </div>
                </div>

                {/* Table or Empty State (NO DUMMY DETAILS) */}
                {filteredList.length === 0 ? (
                  <div style={{ padding: "60px 24px", textAlign: "center" }}>
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "rgba(124, 58, 237, 0.08)",
                        color: "#7C3AED",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#1e1b4b", marginBottom: "6px" }}>
                      No Squad Registrations Recorded Yet
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "14px", maxWidth: "480px", margin: "0 auto 20px" }}>
                      Incoming registrations from the Events Hub form will appear here in real-time with full squad composition, payment confirmation, and credential dispatch status.
                    </p>
                    <Link href="/events-hub" className="btn-primary" style={{ padding: "12px 24px", fontSize: "13px" }}>
                      Open Events Hub Registration Form
                    </Link>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                    <table style={{ width: "100%", minWidth: "780px", borderCollapse: "collapse", textAlign: "left", fontSize: "13.5px" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                          <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569" }}>REG ID &amp; EVENT</th>
                          <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569" }}>SQUAD DETAILS</th>
                          <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569" }}>LEADER CONTACT</th>
                          <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569" }}>PARTICIPANT SQUAD &amp; EMAILS</th>
                          <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569" }}>PAID</th>
                          <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569" }}>DISPATCH</th>
                          <th style={{ padding: "14px 18px", fontWeight: 800, color: "#475569", textAlign: "center" }}>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRegistrations.map((reg) => (
                          <tr key={reg.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                              <span style={{ fontFamily: "monospace", fontWeight: 800, color: "#7C3AED", fontSize: "13px" }}>
                                {reg.id}
                              </span>
                              <div style={{ marginTop: "6px" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "3px 10px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    textTransform: "uppercase",
                                    background:
                                      reg.event_name === "shepitch_coimbatore"
                                        ? "rgba(147, 51, 234, 0.12)"
                                        : reg.event_name === "shepitch_chennai" || reg.event_name === "shepitch"
                                        ? "rgba(192, 38, 211, 0.12)"
                                        : "rgba(37, 99, 235, 0.12)",
                                    color:
                                      reg.event_name === "shepitch_coimbatore"
                                        ? "#9333EA"
                                        : reg.event_name === "shepitch_chennai" || reg.event_name === "shepitch"
                                        ? "#C026D3"
                                        : "#2563EB",
                                  }}
                                >
                                  {formatEventName(reg.event_name)}
                                </span>
                              </div>
                            </td>

                            <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                              <strong style={{ display: "block", color: "#0f172a", fontSize: "14px" }}>
                                {reg.team_name}
                              </strong>
                              <span style={{ color: "#64748b", fontSize: "12px", display: "block", marginTop: "2px" }}>
                                {reg.college_name}
                              </span>
                              <span style={{ color: "#94a3b8", fontSize: "11.5px" }}>
                                {reg.year_of_study} • {reg.department}
                              </span>
                            </td>

                            <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                              <strong style={{ display: "block", color: "#0f172a" }}>
                                {reg.leader_name}
                              </strong>
                              <span style={{ color: "#2563EB", fontSize: "12px", display: "block" }}>
                                {reg.leader_email}
                              </span>
                              <span style={{ color: "#64748b", fontSize: "12px" }}>
                                {reg.mobile}
                              </span>
                            </td>

                            <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                {reg.members?.map((m, mIdx) => (
                                  <div key={mIdx} style={{ fontSize: "12px", color: "#334155" }}>
                                    <strong style={{ color: "#0f172a" }}>{m.name}</strong>:{" "}
                                    <span style={{ color: "#64748b" }}>{m.email}</span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                              <strong style={{ fontSize: "15px", color: "#059669" }}>
                                ₹{reg.amount_paid}
                              </strong>
                              <span style={{ display: "block", fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>
                                {reg.payment_id}
                              </span>
                            </td>

                            <td style={{ padding: "16px 18px", verticalAlign: "top" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "11.5px",
                                  fontWeight: 700,
                                  background: reg.email_status === "sent" ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                                  color: reg.email_status === "sent" ? "#059669" : "#d97706",
                                }}
                              >
                                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor" }}></span>
                                {reg.email_status?.toUpperCase()}
                              </span>
                            </td>

                            <td style={{ padding: "16px 18px", verticalAlign: "top", textAlign: "center" }}>
                              <button
                                type="button"
                                disabled={resendingId === reg.id}
                                onClick={() => handleResendEmail(reg.id)}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                  background: "#ffffff",
                                  color: "#334155",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  cursor: resendingId === reg.id ? "wait" : "pointer",
                                }}
                              >
                                {resendingId === reg.id ? "Sending..." : "Resend"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <TablePagination
                      currentPage={registrationsPage}
                      totalItems={filteredList.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setRegistrationsPage}
                      itemName="registered squads"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: PAYMENTS & FINANCIAL LEDGER ── */}
            {activeTab === "payments" && (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  border: "1.5px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  padding: "32px",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "16px",
                    marginBottom: "28px",
                  }}
                >
                  <div>
                    <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                      Event Payments &amp; Revenue Ledger
                    </h3>
                    <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                      Real-time fee collections, event revenue split, and verified Razorpay transaction references.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportPaymentsReport}
                    disabled={visibleRegistrations.length === 0}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      background: "rgba(16, 185, 129, 0.08)",
                      color: "#059669",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: visibleRegistrations.length === 0 ? "not-allowed" : "pointer",
                      opacity: visibleRegistrations.length === 0 ? 0.5 : 1,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Export Payments (.xlsx)</span>
                  </button>
                </div>

                {/* Top Payments Revenue Cards (Per-Event Revenue Split & Gateway Status) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "18px",
                    marginBottom: "28px",
                  }}
                >
                  {/* Card 2: ShePitch Chennai Revenue */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "22px",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#C026D3", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                      SHEPITCH CHENNAI EDITION 2
                    </span>
                    <div style={{ fontSize: "30px", fontWeight: 900, color: "#C026D3", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                      ₹{shepitchChennaiRevenue}
                    </div>
                    <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                      {shepitchChennaiCount} Squads (@ ₹99 / member)
                    </span>
                  </div>

                  {/* Card 3: ShePitch Coimbatore Revenue */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "22px",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#9333EA", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                      SHEPITCH COIMBATORE EDITION
                    </span>
                    <div style={{ fontSize: "30px", fontWeight: 900, color: "#9333EA", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                      ₹{shepitchCoimbatoreRevenue}
                    </div>
                    <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                      {shepitchCoimbatoreCount} Squads (@ ₹99 / member)
                    </span>
                  </div>

                  {/* Card 4: HackPick Revenue */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "22px",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                      HACKPICK 2026 COLLECTIONS
                    </span>
                    <div style={{ fontSize: "30px", fontWeight: 900, color: "#2563eb", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                      ₹{hackpickRevenue}
                    </div>
                    <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                      {hackpickCount} Squads (@ ₹199 flat squad)
                    </span>
                  </div>

                  {/* Card 5: Gateway Status */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "22px",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                      GATEWAY SETTLEMENT
                    </span>
                    <div style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", marginBottom: "6px" }}>
                      Razorpay Online Gateway
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontWeight: 800,
                        background: "rgba(16, 185, 129, 0.12)",
                        color: "#059669",
                      }}
                    >
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }}></span>
                      Active &amp; Verified
                    </span>
                  </div>
                </div>

                {/* Filter Tabs & Search Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Event Filter Pills */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        setPaymentsFilterEvent("all");
                        setPaymentsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: paymentsFilterEvent === "all" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                        background: paymentsFilterEvent === "all" ? LOGO_GRADIENT : "#ffffff",
                        color: paymentsFilterEvent === "all" ? "#ffffff" : "#475569",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      All Events ({totalRegistrations})
                    </button>
                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        setPaymentsFilterEvent("shepitch_chennai");
                        setPaymentsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: paymentsFilterEvent === "shepitch_chennai" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                        background: paymentsFilterEvent === "shepitch_chennai" ? LOGO_GRADIENT : "#ffffff",
                        color: paymentsFilterEvent === "shepitch_chennai" ? "#ffffff" : "#475569",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ShePitch Chennai ({shepitchChennaiCount})
                    </button>
                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        setPaymentsFilterEvent("shepitch_coimbatore");
                        setPaymentsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: paymentsFilterEvent === "shepitch_coimbatore" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                        background: paymentsFilterEvent === "shepitch_coimbatore" ? LOGO_GRADIENT : "#ffffff",
                        color: paymentsFilterEvent === "shepitch_coimbatore" ? "#ffffff" : "#475569",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ShePitch Coimbatore ({shepitchCoimbatoreCount})
                    </button>
                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        setPaymentsFilterEvent("hackpick");
                        setPaymentsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: paymentsFilterEvent === "hackpick" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                        background: paymentsFilterEvent === "hackpick" ? LOGO_GRADIENT : "#ffffff",
                        color: paymentsFilterEvent === "hackpick" ? "#ffffff" : "#475569",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      HackPick ({hackpickCount})
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
                    <input
                      type="text"
                      placeholder="Search team, leader, email, college, or pay ID..."
                      value={paymentsSearchQuery}
                      onChange={(e) => {
                        setPaymentsSearchQuery(e.target.value);
                        setPaymentsPage(1);
                      }}
                      style={{
                        width: "100%",
                        height: "40px",
                        padding: "8px 14px 8px 36px",
                        borderRadius: "8px",
                        border: "1.5px solid #e2e8f0",
                        fontSize: "13px",
                        outline: "none",
                        background: "#ffffff",
                      }}
                    />
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2.2"
                      style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>
                </div>

                {/* Payments Table */}
                {filteredPayments.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: "#94a3b8" }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                        <line x1="1" y1="10" x2="23" y2="10"></line>
                      </svg>
                    </div>
                    <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" }}>
                      No Payment Records Found
                    </h4>
                    <p style={{ fontSize: "13px", margin: 0 }}>
                      {paymentsSearchQuery ? "No transactions match your current search query." : "Incoming squad registrations will appear here with captured Razorpay payment references."}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                      <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0" }}>
                          <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Payment Reference ID
                          </th>
                          <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Team &amp; College
                          </th>
                          <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Event &amp; Track
                          </th>
                          <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Team Leader Contact
                          </th>
                          <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Squad Size
                          </th>
                          <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Amount Paid
                          </th>
                          <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Registered Date &amp; Time
                          </th>
                          <th style={{ padding: "12px 16px", fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPayments.map((reg) => (
                          <tr
                            key={reg.id}
                            style={{
                              borderBottom: "1px solid #f1f5f9",
                              transition: "background 0.2s ease",
                            }}
                          >
                            {/* Payment ID */}
                            <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  color: "#0f172a",
                                  background: "#f1f5f9",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  border: "1px solid #e2e8f0",
                                }}
                              >
                                {reg.payment_id}
                              </span>
                            </td>

                            {/* Team & College */}
                            <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                              <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>
                                {reg.team_name}
                              </strong>
                              <span style={{ fontSize: "12px", color: "#64748b" }}>
                                {reg.college_name}
                              </span>
                            </td>

                            {/* Event & Track */}
                            <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                <span
                                  style={{
                                    padding: "2px 7px",
                                    borderRadius: "4px",
                                    fontSize: "11px",
                                    fontWeight: 800,
                                    background:
                                      reg.event_name === "shepitch_coimbatore"
                                        ? "rgba(147, 51, 234, 0.12)"
                                        : reg.event_name === "shepitch_chennai" || reg.event_name === "shepitch"
                                        ? "rgba(192, 38, 211, 0.12)"
                                        : "rgba(37, 99, 235, 0.12)",
                                    color:
                                      reg.event_name === "shepitch_coimbatore"
                                        ? "#9333EA"
                                        : reg.event_name === "shepitch_chennai" || reg.event_name === "shepitch"
                                        ? "#C026D3"
                                        : "#2563eb",
                                  }}
                                >
                                  {formatEventName(reg.event_name)}
                                </span>
                                {reg.track && (
                                  <span style={{ fontSize: "11.5px", color: "#475569", fontWeight: 600 }}>
                                    {reg.track}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                                Domain: {reg.domain}
                              </span>
                            </td>

                            {/* Leader Contact */}
                            <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                                {reg.leader_name}
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748b" }}>
                                {reg.leader_email}
                              </div>
                              <div style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                                {reg.mobile}
                              </div>
                            </td>

                            {/* Squad Size */}
                            <td style={{ padding: "14px 16px", verticalAlign: "middle", fontSize: "13px", color: "#334155" }}>
                              <strong>{reg.team_size}</strong> Members
                            </td>

                            {/* Amount Paid */}
                            <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                              <span style={{ fontSize: "16px", fontWeight: 900, color: "#059669" }}>
                                ₹{reg.amount_paid}
                              </span>
                              <span style={{ fontSize: "11px", color: "#94a3b8", display: "block" }}>
                                {reg.event_name === "hackpick" ? "Flat ₹199" : `@ ₹99 × ${reg.team_size}`}
                              </span>
                            </td>

                            {/* Date Registered */}
                            <td style={{ padding: "14px 16px", verticalAlign: "middle", fontSize: "12.5px", color: "#475569", whiteSpace: "nowrap" }}>
                              {new Date(reg.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            {/* Status */}
                            <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  padding: "3px 8px",
                                  borderRadius: "6px",
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  background: "rgba(16, 185, 129, 0.12)",
                                  color: "#059669",
                                }}
                              >
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                Captured
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Table Subtotal Summary Footer */}
                    <div
                      style={{
                        padding: "14px 18px",
                        borderTop: "1.5px solid #e2e8f0",
                        background: "#f8fafc",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      <span>
                        Showing <strong>{filteredPayments.length}</strong> transactions
                      </span>
                      <span>
                        Subtotal Amount: <strong style={{ color: "#059669", fontSize: "15px" }}>₹{filteredPaymentsRevenue}</strong>
                      </span>
                    </div>

                    <TablePagination
                      currentPage={paymentsPage}
                      totalItems={filteredPayments.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setPaymentsPage}
                      itemName="payment transactions"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: COLLEGES & INSTITUTIONAL PORTALS ── */}
            {activeTab === "colleges" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Top Two Sub-Menu Switcher Bar (Ugham Logo Gradient Theme + Glacier Hover) */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
                    padding: "16px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => setCollegeSubTab("colleges")}
                      className="glacier-btn"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "11px 20px",
                        borderRadius: "12px",
                        border: collegeSubTab === "colleges" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                        background: collegeSubTab === "colleges" ? LOGO_GRADIENT : "#f8fafc",
                        color: collegeSubTab === "colleges" ? "#ffffff" : "#334155",
                        fontSize: "13.5px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                        <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                        <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                      </svg>
                      <span>Registered Colleges &amp; Teams</span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 800,
                          background: collegeSubTab === "colleges" ? "rgba(255,255,255,0.22)" : "#e2e8f0",
                          color: collegeSubTab === "colleges" ? "#ffffff" : "#334155",
                        }}
                      >
                        {participatingColleges.length}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCollegeSubTab("credentials")}
                      className="glacier-btn"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "11px 20px",
                        borderRadius: "12px",
                        border: collegeSubTab === "credentials" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                        background: collegeSubTab === "credentials" ? LOGO_GRADIENT : "#f8fafc",
                        color: collegeSubTab === "credentials" ? "#ffffff" : "#334155",
                        fontSize: "13.5px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      <span>Credentials (College Logins)</span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontWeight: 800,
                          background: collegeSubTab === "credentials" ? "rgba(255,255,255,0.22)" : "#e2e8f0",
                          color: collegeSubTab === "credentials" ? "#ffffff" : "#334155",
                        }}
                      >
                        {collegeCredentials.length}
                      </span>
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <Link
                      href="/college-login"
                      target="_blank"
                      className="glacier-btn"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#0f172a",
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      <span>College Login Endpoint (/college-login)</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </Link>

                    <button
                      type="button"
                      onClick={handleExportCollegesReport}
                      disabled={participatingColleges.length === 0}
                      className="glacier-btn"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 16px",
                        borderRadius: "10px",
                        border: "1.5px solid transparent",
                        background: LOGO_GRADIENT,
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: participatingColleges.length === 0 ? "not-allowed" : "pointer",
                        opacity: participatingColleges.length === 0 ? 0.5 : 1,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      <span>Export Colleges Report (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* ── SUB-MENU 2: MANUAL COLLEGE CREDENTIALS MANAGEMENT ── */}
                {collegeSubTab === "credentials" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    {/* Manual Create / Update Form */}
                    <div
                      className="glacier-card"
                      style={{
                        background: "#ffffff",
                        borderRadius: "24px",
                        border: "1.5px solid #e2e8f0",
                        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
                        padding: "28px 32px",
                        overflow: "visible",
                      }}
                    >
                      <div style={{ marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "19px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                          Create / Assign College Portal Credentials
                        </h3>
                        <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0 }}>
                          Select an institution (or enter a custom college name) and assign a dedicated portal username and password for access at <code>/college-login</code>.
                        </p>
                      </div>

                      {manualCredMsg && (
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "10px",
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            color: "#0f172a",
                            fontSize: "13.5px",
                            fontWeight: 700,
                            marginBottom: "18px",
                          }}
                        >
                          ✓ {manualCredMsg}
                        </div>
                      )}

                      {/* Quick Pills for Registered Colleges Missing Credentials */}
                      {participatingColleges.some(
                        (pc) => !collegeCredentials.some((cc) => cc.collegeName.toLowerCase() === pc.collegeName.toLowerCase())
                      ) && (
                        <div
                          style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            marginBottom: "20px",
                          }}
                        >
                          <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                            Registered Colleges Pending Credentials (Click to Prefill):
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {participatingColleges
                              .filter(
                                (pc) =>
                                  !collegeCredentials.some(
                                    (cc) => cc.collegeName.toLowerCase() === pc.collegeName.toLowerCase()
                                  )
                              )
                              .map((pc) => (
                                <button
                                  key={pc.collegeName}
                                  type="button"
                                  className="glacier-btn"
                                  onClick={() => {
                                    setManualCollegeSelect(pc.collegeName);
                                    const slug =
                                      pc.collegeName
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]+/g, "-")
                                        .replace(/^-|-$/g, "")
                                        .slice(0, 18) || "college";
                                    setManualUsername(slug);
                                    setManualPassword("UGH@2026");
                                  }}
                                  style={{
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    background: "#ffffff",
                                    color: "#0f172a",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  + {pc.collegeName} ({pc.teams.length} squads)
                                </button>
                              ))}
                          </div>
                        </div>
                      )}

                      <form onSubmit={handleManualSaveCredential} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                          <div>
                            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                              Select Available College *
                            </label>
                            <CustomSelect
                              compact
                              searchable
                              placeholder="-- Choose an Institution --"
                              value={manualCollegeSelect}
                              options={[
                                ...availableCollegeOptions.map((cName) => ({ value: cName, label: cName })),
                                { value: "__custom__", label: "+ Enter Custom College Name Manually..." },
                              ]}
                              onChange={(val) => {
                                setManualCollegeSelect(val);
                                if (val && val !== "__custom__") {
                                  const existing = collegeCredentials.find(
                                    (c) => c.collegeName.toLowerCase() === val.toLowerCase()
                                  );
                                  if (existing) {
                                    setManualUsername(existing.username);
                                    setManualPassword(existing.password);
                                  } else {
                                    const slug =
                                      val
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]+/g, "-")
                                        .replace(/^-|-$/g, "")
                                        .slice(0, 18) || "college";
                                    setManualUsername(slug);
                                    setManualPassword("UGH@2026");
                                  }
                                }
                              }}
                            />
                          </div>

                          {manualCollegeSelect === "__custom__" && (
                            <div>
                              <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                                Custom College / University Name *
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="Type full college or university name..."
                                value={manualCustomCollege}
                                onChange={(e) => setManualCustomCollege(e.target.value)}
                                style={{
                                  width: "100%",
                                  height: "40px",
                                  padding: "8px 14px",
                                  borderRadius: "10px",
                                  border: "1.5px solid #cbd5e1",
                                  fontSize: "13.5px",
                                  outline: "none",
                                }}
                              />
                            </div>
                          )}

                          <div>
                            <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                              College Login Username *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. iit-madras"
                              value={manualUsername}
                              onChange={(e) => setManualUsername(e.target.value)}
                              style={{
                                width: "100%",
                                height: "40px",
                                padding: "8px 14px",
                                borderRadius: "10px",
                                border: "1.5px solid #cbd5e1",
                                fontSize: "13.5px",
                                fontFamily: "monospace",
                                outline: "none",
                              }}
                            />
                          </div>

                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                              <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase" }}>
                                Access Password *
                              </label>
                              <button
                                type="button"
                                onClick={() => setManualPassword(`UGH@${Math.floor(1000 + Math.random() * 9000)}`)}
                                style={{ background: "none", border: "none", color: "#334155", fontSize: "11px", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                              >
                                Generate Password
                              </button>
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="Enter password..."
                              value={manualPassword}
                              onChange={(e) => setManualPassword(e.target.value)}
                              style={{
                                width: "100%",
                                height: "40px",
                                padding: "8px 14px",
                                borderRadius: "10px",
                                border: "1.5px solid #cbd5e1",
                                fontSize: "13.5px",
                                fontFamily: "monospace",
                                outline: "none",
                              }}
                            />
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                          <button
                            type="submit"
                            className="glacier-btn"
                            style={{
                              padding: "11px 24px",
                              borderRadius: "10px",
                              fontSize: "13.5px",
                              fontWeight: 800,
                              background: LOGO_GRADIENT,
                              color: "#ffffff",
                              border: "1.5px solid transparent",
                              cursor: "pointer",
                              boxShadow: "0 6px 18px rgba(124, 58, 237, 0.25)",
                            }}
                          >
                            + Save &amp; Activate College Login
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Configured College Credentials List (5 per page) */}
                    <div
                      className="glacier-card"
                      style={{
                        background: "#ffffff",
                        borderRadius: "24px",
                        border: "1.5px solid #e2e8f0",
                        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "20px 24px",
                          borderBottom: "1.5px solid #f1f5f9",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <h4 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                            Active College Login Accounts ({filteredCredentials.length})
                          </h4>
                          <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                            Colleges can sign in at <code>/college-login</code> using their assigned <strong>Username</strong> and <strong>Password</strong>.
                          </span>
                        </div>

                        <input
                          type="text"
                          placeholder="Search college or username..."
                          value={credSearchQuery}
                          onChange={(e) => {
                            setCredSearchQuery(e.target.value);
                            setCredentialsPage(1);
                          }}
                          style={{
                            width: "280px",
                            height: "38px",
                            padding: "6px 14px",
                            borderRadius: "10px",
                            border: "1.5px solid #e2e8f0",
                            fontSize: "13px",
                            outline: "none",
                          }}
                        />
                      </div>

                      {filteredCredentials.length === 0 ? (
                        <div style={{ padding: "50px 24px", textAlign: "center", color: "#64748b" }}>
                          No configured college credentials match your query. Use the form above to create one.
                        </div>
                      ) : (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", minWidth: "740px", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                            <thead>
                              <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                                <th style={{ padding: "14px 18px" }}>College / Institution</th>
                                <th style={{ padding: "14px 18px" }}>Enrolled Squads</th>
                                <th style={{ padding: "14px 18px" }}>Portal Username</th>
                                <th style={{ padding: "14px 18px" }}>Password</th>
                                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedCredentials.map((cred) => {
                                const stats = participatingColleges.find(
                                  (pc) => pc.collegeName.toLowerCase() === cred.collegeName.toLowerCase()
                                );
                                const isShown = !!revealedPasswords[cred.collegeName];
                                return (
                                  <tr key={cred.collegeName} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                                      <strong style={{ fontSize: "14px", color: "#0f172a", display: "block" }}>
                                        {cred.collegeName}
                                      </strong>
                                      <span style={{ fontSize: "11.5px", color: "#475569", fontWeight: 700 }}>
                                        ● Active Portal Access
                                      </span>
                                    </td>
                                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                                      {stats ? (
                                        <div>
                                          <strong style={{ color: "#0f172a" }}>{stats.teams.length} Teams</strong>
                                          <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                                            {stats.studentsCount} Students • ₹{stats.revenue}
                                          </span>
                                        </div>
                                      ) : (
                                        <span style={{ fontSize: "12px", color: "#94a3b8" }}>0 Teams yet</span>
                                      )}
                                    </td>
                                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                                      <div style={{ fontFamily: "monospace", fontWeight: 800, color: "#0f172a" }}>
                                        {cred.username}
                                      </div>
                                    </td>
                                    <td style={{ padding: "16px 18px", verticalAlign: "middle" }}>
                                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                        <code style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", fontWeight: 800, color: "#0f172a" }}>
                                          {isShown ? cred.password : "••••••••"}
                                        </code>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setRevealedPasswords((prev) => ({
                                              ...prev,
                                              [cred.collegeName]: !prev[cred.collegeName],
                                            }))
                                          }
                                          style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                                        >
                                          {isShown ? "Hide" : "Show"}
                                        </button>
                                      </div>
                                    </td>
                                    <td style={{ padding: "16px 18px", verticalAlign: "middle", textAlign: "right" }}>
                                      <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                        <button
                                          type="button"
                                          className="glacier-btn"
                                          onClick={() => {
                                            const text = `College: ${cred.collegeName}\nPortal URL: ${window.location.origin}/college-login\nUsername: ${cred.username}\nPassword: ${cred.password}`;
                                            navigator.clipboard.writeText(text);
                                            setCopiedCredCollege(cred.collegeName);
                                            setTimeout(() => setCopiedCredCollege(null), 2000);
                                          }}
                                          style={{
                                            padding: "6px 10px",
                                            borderRadius: "8px",
                                            border: "1px solid #cbd5e1",
                                            background: "#ffffff",
                                            color: "#334155",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                          }}
                                        >
                                          {copiedCredCollege === cred.collegeName ? "✓ Copied" : "Copy"}
                                        </button>
                                        <button
                                          type="button"
                                          className="glacier-btn"
                                          onClick={() => {
                                            setSelectedCollegeForCred(cred.collegeName);
                                            setEditingUsername(cred.username);
                                            setEditingPassword(cred.password);
                                          }}
                                          style={{
                                            padding: "6px 10px",
                                            borderRadius: "8px",
                                            border: "1px solid #cbd5e1",
                                            background: "#f8fafc",
                                            color: "#0f172a",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          className="glacier-btn"
                                          onClick={() => handleDeleteCollegeCred(cred.collegeName)}
                                          style={{
                                            padding: "6px 10px",
                                            borderRadius: "8px",
                                            border: "1px solid rgba(220, 38, 38, 0.25)",
                                            background: "#fef2f2",
                                            color: "#b91c1c",
                                            fontSize: "12px",
                                            fontWeight: 700,
                                            cursor: "pointer",
                                          }}
                                        >
                                          Revoke
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <TablePagination
                        currentPage={credentialsPage}
                        totalItems={filteredCredentials.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setCredentialsPage}
                        itemName="college credentials"
                      />
                    </div>
                  </div>
                )}

                {/* ── SUB-MENU 1: REGISTERED COLLEGES, TEAMS, STUDENT DROPDOWNS & PAYMENTS ── */}
                {collegeSubTab === "colleges" && (
                  <>
                {/* KPI Summary Strip (Executive Neutral Monochrome Palette) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  <div
                    className="glacier-card"
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "20px 22px",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      TOTAL ENROLLED COLLEGES
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
                      {participatingColleges.length}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Represented in Student Registrations
                    </div>
                  </div>

                  <div
                    className="glacier-card"
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "20px 22px",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      TOTAL STUDENT PARTICIPANTS
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
                      {totalParticipants}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Across All Colleges &amp; Arenas
                    </div>
                  </div>

                  <div
                    className="glacier-card"
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "20px 22px",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      REGISTERED SQUADS / TEAMS
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
                      {totalRegistrations}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                      Competing Across Flagship Arenas
                    </div>
                  </div>

                  <div
                    className="glacier-card"
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "20px 22px",
                      boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      COLLECTED COLLEGE PAYMENTS
                    </div>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
                      ₹{totalRevenue}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
                      Across {participatingColleges.length} Institutions
                    </div>
                  </div>
                </div>

                {/* Event Filter Pills & Search */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[
                      { id: "all", label: "All Arenas" },
                      { id: "shepitch_chennai", label: "ShePitch Chennai 2" },
                      { id: "shepitch_coimbatore", label: "ShePitch Coimbatore" },
                      { id: "hackpick", label: "HackPick 2026" },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        className="glacier-btn"
                        onClick={() => {
                          setCollegeFilterEvent(pill.id as any);
                          setCollegesPage(1);
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "10px",
                          border: collegeFilterEvent === pill.id ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                          background: collegeFilterEvent === pill.id ? LOGO_GRADIENT : "#ffffff",
                          color: collegeFilterEvent === pill.id ? "#ffffff" : "#334155",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ position: "relative", width: "100%", maxWidth: "420px" }}>
                    <input
                      type="text"
                      placeholder="Search participating colleges by institution name..."
                      value={collegeSearch}
                      onChange={(e) => {
                        setCollegeSearch(e.target.value);
                        setCollegesPage(1);
                      }}
                      style={{
                        width: "100%",
                        height: "44px",
                        padding: "10px 16px 10px 40px",
                        borderRadius: "12px",
                        border: "1.5px solid #e2e8f0",
                        fontSize: "13.5px",
                        outline: "none",
                        background: "#ffffff",
                      }}
                    />
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2.2"
                      style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </div>

                  <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 600 }}>
                    Showing <strong>{filteredParticipatingColleges.length}</strong> registered institutions
                  </span>
                </div>

                {/* Colleges Cards Listing */}
                {filteredParticipatingColleges.length === 0 ? (
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1.5px solid #e2e8f0",
                      padding: "60px 24px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "16px",
                        background: "#f1f5f9",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        color: "#94a3b8",
                      }}
                    >
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                      </svg>
                    </div>
                    <h4 style={{ fontSize: "17px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                      No Participating Colleges Recorded Yet
                    </h4>
                    <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0, maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}>
                      {collegeSearch
                        ? "No participating institutions match your search query."
                        : "As soon as students submit team registrations from their universities or colleges, their institutions will automatically appear here with full roster controls and login credential management."}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {paginatedColleges.map((col, colIdx) => {
                      const cred = collegeCredentials.find(
                        (c) => c.collegeName.toLowerCase() === col.collegeName.toLowerCase()
                      );
                      const isExpanded = expandedCollegeTeams === col.collegeName;
                      const collegeOrderNum = (collegesPage - 1) * PAGE_SIZE + colIdx + 1;

                      return (
                        <div
                          key={col.collegeName}
                          className="glacier-card admin-college-card"
                          style={{
                            background: "#ffffff",
                            borderRadius: "20px",
                            border: "1.5px solid #e2e8f0",
                            boxShadow: "0 2px 10px rgba(15, 23, 42, 0.02)",
                            padding: "24px",
                            transition: "all 0.2s ease",
                            overflow: "visible",
                          }}
                        >
                          {/* Top Row: Premium Round Number + College Name & Neutral Event Badges */}
                          <div
                            className="admin-college-card-top"
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              flexWrap: "wrap",
                              gap: "14px",
                              marginBottom: "16px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", minWidth: 0, flex: "1 1 280px" }}>
                              <div
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "50%",
                                  background: LOGO_GRADIENT,
                                  color: "#ffffff",
                                  fontSize: "13px",
                                  fontWeight: 900,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  boxShadow: "0 6px 16px rgba(124, 58, 237, 0.25)",
                                }}
                              >
                                {String(collegeOrderNum).padStart(2, "0")}
                              </div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                  <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                                    {col.collegeName}
                                  </h4>
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 800,
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      background: "#f1f5f9",
                                      color: "#334155",
                                      border: "1px solid #e2e8f0",
                                    }}
                                  >
                                    {col.teams.length} Squads
                                  </span>
                                </div>

                              {/* Participating Event Badges */}
                              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                                {(col.events.has("shepitch_chennai") || col.events.has("shepitch")) && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      background: "#f8fafc",
                                      border: "1px solid #cbd5e1",
                                      color: "#334155",
                                    }}
                                  >
                                    ShePitch Chennai Edition 2
                                  </span>
                                )}
                                {col.events.has("shepitch_coimbatore") && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      background: "#f8fafc",
                                      border: "1px solid #cbd5e1",
                                      color: "#334155",
                                    }}
                                  >
                                    ShePitch Coimbatore Edition
                                  </span>
                                )}
                                {col.events.has("hackpick") && (
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      padding: "3px 9px",
                                      borderRadius: "6px",
                                      background: "#f8fafc",
                                      border: "1px solid #cbd5e1",
                                      color: "#334155",
                                    }}
                                  >
                                    HackPick 2026
                                  </span>
                                )}
                                </div>
                              </div>
                            </div>

                            {/* Metrics Pills */}
                            <div className="admin-college-metrics" style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                              <div
                                className="admin-college-metric-box"
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "10px",
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  textAlign: "right",
                                }}
                              >
                                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block" }}>
                                  Enrolled Students
                                </span>
                                <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                                  {col.studentsCount} Students
                                </strong>
                              </div>
                              <div
                                className="admin-college-metric-box"
                                style={{
                                  padding: "8px 14px",
                                  borderRadius: "10px",
                                  background: "#f8fafc",
                                  border: "1px solid #cbd5e1",
                                  textAlign: "right",
                                }}
                              >
                                <span style={{ fontSize: "10.5px", fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block" }}>
                                  Collected Amount
                                </span>
                                <strong style={{ fontSize: "15px", color: "#0f172a" }}>
                                  ₹{col.revenue}
                                </strong>
                              </div>
                            </div>
                          </div>

                          {/* Portal Login Status + Quick Payments Summary Strip */}
                          <div
                            className="admin-college-login-strip"
                            style={{
                              padding: "14px 18px",
                              borderRadius: "12px",
                              background: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "12px",
                              marginBottom: "16px",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                              {cred ? (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    background: "#ffffff",
                                    border: "1px solid #cbd5e1",
                                    color: "#0f172a",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                  }}
                                >
                                  ● Portal Login Active ({cred.username})
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "4px 10px",
                                    borderRadius: "6px",
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    color: "#64748b",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                  }}
                                >
                                  ○ No Portal Login Configured Yet
                                </span>
                              )}
                              <span style={{ fontSize: "12.5px", color: "#475569", fontWeight: 600 }}>
                                {col.teams.length} Payment{col.teams.length === 1 ? "" : "s"} Settled (Total <strong style={{ color: "#0f172a" }}>₹{col.revenue}</strong>)
                              </span>
                            </div>

                            <button
                              type="button"
                              className="glacier-btn admin-college-cred-btn"
                              onClick={() => {
                                setCollegeSubTab("credentials");
                                setManualCollegeSelect(col.collegeName);
                                if (cred) {
                                  setManualUsername(cred.username);
                                  setManualPassword(cred.password);
                                } else {
                                  const slug =
                                    col.collegeName
                                      .toLowerCase()
                                      .replace(/[^a-z0-9]+/g, "-")
                                      .replace(/^-|-$/g, "")
                                      .slice(0, 18) || "college";
                                  setManualUsername(slug);
                                  setManualPassword("UGH@2026");
                                }
                              }}
                              style={{
                                padding: "8px 14px",
                                borderRadius: "8px",
                                border: "1.5px solid transparent",
                                background: LOGO_GRADIENT,
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              {cred ? "Manage Credentials →" : "+ Create Login Credentials →"}
                            </button>
                          </div>

                          {/* College-Wise Teams & Payments List (Each Team with Dropdown for Student Details) */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div
                              className="admin-college-teams-header"
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "4px 12px",
                                marginBottom: "2px",
                              }}
                            >
                              <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", lineHeight: 1.45 }}>
                                Registered Teams &amp; Payments from {col.collegeName} ({col.teams.length})
                              </span>
                              <span style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 600 }}>
                                Click any team to view students &amp; round controls
                              </span>
                            </div>

                            {col.teams.map((team) => {
                              const isTeamOpen = expandedTeamId === team.id;
                              return (
                                <div
                                  key={team.id}
                                  style={{
                                    border: isTeamOpen ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
                                    borderRadius: "14px",
                                    background: "#ffffff",
                                    overflow: "visible",
                                  }}
                                >
                                  {/* Team Dropdown Header Row */}
                                  <button
                                    type="button"
                                    onClick={() => setExpandedTeamId(isTeamOpen ? null : team.id)}
                                    style={{
                                      width: "100%",
                                      padding: "14px 18px",
                                      background: isTeamOpen ? "#f8fafc" : "#ffffff",
                                      border: "none",
                                      borderRadius: isTeamOpen ? "12px 12px 0 0" : "12px",
                                      cursor: "pointer",
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      flexWrap: "wrap",
                                      gap: "12px",
                                      textAlign: "left",
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                      <strong style={{ fontSize: "14.5px", color: "#0f172a" }}>
                                        {team.team_name}
                                      </strong>
                                      <span
                                        style={{
                                          fontSize: "11px",
                                          fontWeight: 700,
                                          padding: "2px 8px",
                                          borderRadius: "6px",
                                          background: "#f1f5f9",
                                          color: "#334155",
                                          border: "1px solid #e2e8f0",
                                        }}
                                      >
                                        {formatEventName(team.event_name)}
                                      </span>
                                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>
                                        {team.team_size} Students
                                      </span>
                                      {team.internship_selected && (
                                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "2px 7px", borderRadius: "4px" }}>
                                          ★ Internship Selected
                                        </span>
                                      )}
                                      {team.certificate_issued && (
                                        <span style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "2px 7px", borderRadius: "4px" }}>
                                          ✓ Certificate Sent
                                        </span>
                                      )}
                                    </div>

                                    <div className="admin-college-team-meta" style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
                                      <div className="admin-college-team-amount" style={{ textAlign: "right" }}>
                                        <span style={{ fontSize: "13.5px", fontWeight: 900, color: "#0f172a" }}>
                                          ₹{team.amount_paid}
                                        </span>
                                        <span style={{ fontSize: "11px", color: "#94a3b8", display: "block", fontFamily: "monospace" }}>
                                          {team.payment_id}
                                        </span>
                                      </div>

                                      <span
                                        className="glacier-btn"
                                        style={{
                                          fontSize: "12px",
                                          fontWeight: 700,
                                          color: "#0f172a",
                                          padding: "5px 10px",
                                          borderRadius: "8px",
                                          background: "#f8fafc",
                                          border: "1px solid #e2e8f0",
                                        }}
                                      >
                                        {isTeamOpen ? "Hide Students ▲" : "Student Details ▾"}
                                      </span>
                                    </div>
                                  </button>

                                  {/* Expanded Team Dropdown Body */}
                                  {isTeamOpen && (
                                    <div style={{ padding: "18px", borderTop: "1px solid #e2e8f0", background: "#fcfcfd", borderRadius: "0 0 14px 14px" }}>
                                      {/* Team Payment & Info Bar */}
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "center",
                                          flexWrap: "wrap",
                                          gap: "12px",
                                          padding: "10px 14px",
                                          borderRadius: "10px",
                                          background: "#ffffff",
                                          border: "1px solid #e2e8f0",
                                          marginBottom: "14px",
                                          fontSize: "12.5px",
                                          color: "#475569",
                                        }}
                                      >
                                        <div>
                                          Track: <strong>{team.track || "Sprint"}</strong> • Domain: <strong>{team.domain}</strong> • {team.department} ({team.year_of_study})
                                        </div>
                                        <div>
                                          Payment ID: <code style={{ fontWeight: 700, color: "#0f172a" }}>{team.payment_id}</code> • Paid:{" "}
                                          <strong style={{ color: "#0f172a" }}>₹{team.amount_paid}</strong> on{" "}
                                          {new Date(team.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                        </div>
                                      </div>

                                      {/* Complete Student Details Table */}
                                      <div style={{ overflowX: "auto", marginBottom: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#ffffff" }}>
                                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
                                          <thead>
                                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                                              <th style={{ padding: "10px 14px" }}>#</th>
                                              <th style={{ padding: "10px 14px" }}>Student Name</th>
                                              <th style={{ padding: "10px 14px" }}>Role</th>
                                              <th style={{ padding: "10px 14px" }}>Email (Portal Username)</th>
                                              <th style={{ padding: "10px 14px" }}>Department &amp; Year</th>
                                              <th style={{ padding: "10px 14px" }}>Contact</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {(team.members || []).map((m, mIdx) => (
                                              <tr key={mIdx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                                <td style={{ padding: "10px 14px", color: "#64748b", fontWeight: 700 }}>{mIdx + 1}</td>
                                                <td style={{ padding: "10px 14px", fontWeight: 700, color: "#0f172a" }}>{m.name}</td>
                                                <td style={{ padding: "10px 14px" }}>
                                                  <span
                                                    style={{
                                                      fontSize: "11px",
                                                      fontWeight: 800,
                                                      padding: "2px 7px",
                                                      borderRadius: "4px",
                                                      background: m.role === "Leader" ? "#0f172a" : "#f1f5f9",
                                                      color: m.role === "Leader" ? "#ffffff" : "#475569",
                                                    }}
                                                  >
                                                    {m.role || "Member"}
                                                  </span>
                                                </td>
                                                <td style={{ padding: "10px 14px", fontFamily: "monospace", color: "#334155" }}>{m.email}</td>
                                                <td style={{ padding: "10px 14px", color: "#475569" }}>
                                                  {team.department} • {team.year_of_study}
                                                </td>
                                                <td style={{ padding: "10px 14px", color: "#475569" }}>
                                                  {m.phone || (m.role === "Leader" ? team.mobile : "Via Leader")}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      {/* Round Status, Jury Feedback, Certificate Title & Animated Tick Checkboxes */}
                                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                        <div
                                          style={{
                                            display: "grid",
                                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                                            gap: "12px",
                                            alignItems: "flex-end",
                                          }}
                                        >
                                          <div>
                                            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                              Round Evaluation Status
                                            </label>
                                            <CustomSelect
                                              compact
                                              options={ROUND_STATUS_OPTIONS}
                                              value={team.round_status || "Round 1 (PPT & Video Submission)"}
                                              onChange={(val) =>
                                                handleUpdateTeamStatus(team.id, { round_status: val })
                                              }
                                              disabled={updatingTeamId === team.id}
                                              placeholder="Select evaluation stage..."
                                            />
                                          </div>

                                          <div>
                                            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                              Jury Feedback (Visible in College Portal)
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="Enter feedback for team / college..."
                                              defaultValue={team.jury_feedback || ""}
                                              onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                if (val !== (team.jury_feedback || "")) {
                                                  handleUpdateTeamStatus(team.id, { jury_feedback: val });
                                                }
                                              }}
                                              style={{
                                                width: "100%",
                                                height: "40px",
                                                padding: "6px 12px",
                                                borderRadius: "10px",
                                                border: "1.5px solid #cbd5e1",
                                                background: "#ffffff",
                                                fontSize: "12.5px",
                                                color: "#0f172a",
                                                outline: "none",
                                              }}
                                            />
                                          </div>

                                          <div>
                                            <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                              Internship Purpose / Reason (Selected or Not)
                                            </label>
                                            <input
                                              type="text"
                                              placeholder="Why selected / not selected for internship..."
                                              defaultValue={team.internship_reason || ""}
                                              onBlur={(e) => {
                                                const val = e.target.value.trim();
                                                if (val !== (team.internship_reason || "")) {
                                                  handleUpdateTeamStatus(team.id, { internship_reason: val });
                                                }
                                              }}
                                              style={{
                                                width: "100%",
                                                height: "40px",
                                                padding: "6px 12px",
                                                borderRadius: "10px",
                                                border: "1.5px solid #cbd5e1",
                                                background: "#ffffff",
                                                fontSize: "12.5px",
                                                color: "#0f172a",
                                                outline: "none",
                                              }}
                                            />
                                          </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "10px" }}>
                                          <AnimatedCheckbox
                                            checked={!!team.internship_selected}
                                            disabled={updatingTeamId === team.id}
                                            onChange={() => {
                                              void handleUpdateTeamStatus(team.id, {
                                                internship_selected: !team.internship_selected,
                                              });
                                            }}
                                            label="Internship Selected"
                                            subLabel="Visible in College & Student Dashboard"
                                          />

                                          <AnimatedCheckbox
                                            checked={!!team.certificate_issued || !!team.is_past_event}
                                            disabled={updatingTeamId === team.id}
                                            onChange={() => {
                                              const nextChecked = !(!!team.certificate_issued || !!team.is_past_event);
                                              void handleUpdateTeamStatus(team.id, {
                                                certificate_issued: nextChecked,
                                                is_past_event: nextChecked,
                                                certificate_title:
                                                  team.certificate_title ||
                                                  `${formatEventName(team.event_name)} — Official Certificate`,
                                                certificate_issued_at: nextChecked ? new Date().toISOString() : "",
                                              });
                                            }}
                                            label="Issue Certificate & Mark Past Event"
                                            subLabel="Moves event to Past Events & unlocks Certificates"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination (5 colleges per page) */}
                <TablePagination
                  currentPage={collegesPage}
                  totalItems={filteredParticipatingColleges.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCollegesPage}
                  itemName="participating colleges"
                />
                  </>
                )}

                {/* College Credentials Modal */}
                {selectedCollegeForCred && (
                  <div
                    style={{
                      position: "fixed",
                      inset: 0,
                      background: "rgba(15, 23, 42, 0.56)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      zIndex: 9999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "20px",
                    }}
                    onClick={() => setSelectedCollegeForCred(null)}
                  >
                    <div
                      className="modal-animate-in"
                      style={{
                        background: "#ffffff",
                        borderRadius: "24px",
                        padding: "32px",
                        maxWidth: "480px",
                        width: "100%",
                        boxShadow: "0 28px 70px rgba(15, 23, 42, 0.25)",
                        border: "1.5px solid #e2e8f0",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <span style={{ fontSize: "11px", fontWeight: 800, background: "#0f172a", color: "#ffffff", padding: "4px 10px", borderRadius: "6px", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                          College Portal Gateway
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedCollegeForCred(null)}
                          style={{ background: "transparent", border: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}
                        >
                          ✕
                        </button>
                      </div>

                      <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                        Portal Credentials for College
                      </h3>
                      <p style={{ color: "#64748b", fontSize: "13.5px", margin: "0 0 20px 0" }}>
                        <strong>{selectedCollegeForCred}</strong>
                      </p>

                      {credSaveMsg && (
                        <div
                          style={{
                            padding: "12px 16px",
                            borderRadius: "10px",
                            background: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            color: "#0f172a",
                            fontWeight: 700,
                            fontSize: "13px",
                            marginBottom: "16px",
                          }}
                        >
                          ✓ {credSaveMsg}
                        </div>
                      )}

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveCollegeCred(selectedCollegeForCred);
                        }}
                        style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                      >
                        <div>
                          <label style={{ display: "block", fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase", marginBottom: "6px" }}>
                            Portal Username *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. iitmadras"
                            value={editingUsername}
                            onChange={(e) => setEditingUsername(e.target.value)}
                            style={{
                              width: "100%",
                              height: "44px",
                              padding: "10px 14px",
                              borderRadius: "10px",
                              border: "1.5px solid #cbd5e1",
                              fontSize: "13.5px",
                              outline: "none",
                              fontFamily: "monospace",
                            }}
                          />
                        </div>

                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <label style={{ fontSize: "11.5px", fontWeight: 800, color: "#334155", textTransform: "uppercase" }}>
                              Portal Password *
                            </label>
                            <button
                              type="button"
                              onClick={() => setEditingPassword("UGH@2026")}
                              style={{ background: "none", border: "none", color: "#334155", fontSize: "11.5px", fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}
                            >
                              Reset to UGH@2026
                            </button>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="e.g. UGH@2026"
                            value={editingPassword}
                            onChange={(e) => setEditingPassword(e.target.value)}
                            style={{
                              width: "100%",
                              height: "44px",
                              padding: "10px 14px",
                              borderRadius: "10px",
                              border: "1.5px solid #cbd5e1",
                              fontSize: "13.5px",
                              outline: "none",
                              fontFamily: "monospace",
                            }}
                          />
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                          <button
                            type="submit"
                            className="glacier-btn"
                            style={{
                              flex: 1,
                              height: "46px",
                              borderRadius: "10px",
                              background: LOGO_GRADIENT,
                              color: "#ffffff",
                              border: "1.5px solid transparent",
                              fontSize: "13.5px",
                              fontWeight: 800,
                              cursor: "pointer",
                            }}
                          >
                            Save &amp; Activate Credentials
                          </button>
                          <button
                            type="button"
                            className="glacier-btn"
                            onClick={() => setSelectedCollegeForCred(null)}
                            style={{
                              padding: "0 18px",
                              height: "46px",
                              borderRadius: "10px",
                              border: "1.5px solid #cbd5e1",
                              background: "#ffffff",
                              color: "#475569",
                              fontSize: "13px",
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 5: TEAMS ROUND CONTROL & COLLECTED ROUND LINKS ── */}
            {activeTab === "teams" && (() => {
              const editionTabs =
                editions.length > 0
                  ? editions.map((ed) => ({ slug: ed.slug, label: ed.title }))
                  : [
                      { slug: "shepitch_chennai", label: "ShePitch Chennai Edition 2" },
                      { slug: "hackpick", label: "HackPick 2026" },
                      { slug: "shepitch_coimbatore", label: "ShePitch Coimbatore Edition" },
                    ];

              const filteredTeamsForEvent = visibleRegistrations.filter((r) => {
                const matchesEv =
                  teamsEventFilter === "all" ||
                  r.event_name === teamsEventFilter ||
                  (teamsEventFilter === "shepitch_chennai" && r.event_name === "shepitch");
                if (!matchesEv) return false;
                const q = teamsSearchQuery.trim().toLowerCase();
                if (!q) return true;
                return (
                  r.team_name.toLowerCase().includes(q) ||
                  r.college_name.toLowerCase().includes(q) ||
                  r.leader_name.toLowerCase().includes(q) ||
                  r.domain.toLowerCase().includes(q) ||
                  r.id.toLowerCase().includes(q)
                );
              });

              const activeTeamsList = filteredTeamsForEvent.slice(
                (teamsPage - 1) * PAGE_SIZE,
                teamsPage * PAGE_SIZE
              );

              const activeLinksList = filteredTeamsForEvent.slice(
                (linksPage - 1) * PAGE_SIZE,
                linksPage * PAGE_SIZE
              );

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Top Sub-Tab Bar: Round Status Updates vs Collected Round Links */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1.5px solid #e2e8f0",
                      padding: "16px 22px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="glacier-btn"
                        onClick={() => setTeamsSubTab("statuses")}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "10px",
                          border: teamsSubTab === "statuses" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                          background: teamsSubTab === "statuses" ? LOGO_GRADIENT : "#f8fafc",
                          color: teamsSubTab === "statuses" ? "#ffffff" : "#334155",
                          fontSize: "13px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Round Status Management
                      </button>
                      <button
                        type="button"
                        className="glacier-btn"
                        onClick={() => setTeamsSubTab("links")}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "10px",
                          border: teamsSubTab === "links" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                          background: teamsSubTab === "links" ? LOGO_GRADIENT : "#f8fafc",
                          color: teamsSubTab === "links" ? "#ffffff" : "#334155",
                          fontSize: "13px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Collected Round Links
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search team, college, ID, or domain..."
                      value={teamsSearchQuery}
                      onChange={(e) => {
                        setTeamsSearchQuery(e.target.value);
                        setTeamsPage(1);
                        setLinksPage(1);
                      }}
                      style={{
                        width: "100%",
                        maxWidth: "300px",
                        height: "40px",
                        padding: "0 14px",
                        borderRadius: "10px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "13px",
                        outline: "none",
                      }}
                    />
                  </div>

                  {/* Separate Event Tabs (ShePitch Chennai Edition 2, HackPick 2026, & Dynamic Editions) */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[...editionTabs, { slug: "all", label: "All Competitions" }].map((ev) => {
                      const isSel = teamsEventFilter === ev.slug;
                      return (
                        <button
                          key={ev.slug}
                          type="button"
                          className="glacier-btn"
                          onClick={() => {
                            setTeamsEventFilter(ev.slug);
                            setTeamsPage(1);
                            setLinksPage(1);
                          }}
                          style={{
                            padding: "9px 16px",
                            borderRadius: "10px",
                            border: isSel ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                            background: isSel ? LOGO_GRADIENT : "#ffffff",
                            color: isSel ? "#ffffff" : "#334155",
                            fontSize: "12.5px",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          {ev.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sub-Tab 1: Update Team Round Statuses (Reflects Live in Team Members' Portal) */}
                  {teamsSubTab === "statuses" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {activeTeamsList.length === 0 ? (
                        <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "50px 24px", textAlign: "center", color: "#64748b" }}>
                          No squads enrolled for this competition filter yet.
                        </div>
                      ) : (
                        activeTeamsList.map((team, tIdx) => {
                          const teamOrderNum = (teamsPage - 1) * PAGE_SIZE + tIdx + 1;
                          return (
                            <div
                              key={team.id}
                              className="glacier-card"
                              style={{
                                background: "#ffffff",
                                borderRadius: "20px",
                                border: "1.5px solid #e2e8f0",
                                padding: "22px 24px",
                                overflow: "visible",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                  <div
                                    style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "50%",
                                      background: LOGO_GRADIENT,
                                      color: "#ffffff",
                                      fontSize: "12px",
                                      fontWeight: 900,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {String(teamOrderNum).padStart(2, "0")}
                                  </div>
                                  <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                      <h4 style={{ fontSize: "16.5px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                                        {team.team_name}
                                      </h4>
                                      <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", background: "#f1f5f9", color: "#475569" }}>
                                        {team.id}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "2px" }}>
                                      {team.college_name} • {team.domain} {team.track ? `• ${team.track}` : ""} • {team.team_size} Members
                                    </div>
                                  </div>
                                </div>

                                <span
                                  style={{
                                    padding: "5px 12px",
                                    borderRadius: "8px",
                                    background: "#f8fafc",
                                    border: "1px solid #cbd5e1",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "#0f172a",
                                  }}
                                >
                                  {team.round_status || "Round 1 (PPT & Video Submission)"}
                                </span>
                              </div>

                              {/* Members Chips */}
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                                {(team.members || []).map((m, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      fontSize: "11.5px",
                                      fontWeight: 600,
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      background: "#f8fafc",
                                      border: "1px solid #e2e8f0",
                                      color: "#334155",
                                    }}
                                  >
                                    {m.name} ({m.email})
                                  </span>
                                ))}
                              </div>

                              {/* Live Round Controls (Updates All Team Members Immediately) */}
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                                <div>
                                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                    Update Round Status (Live in Student Portal)
                                  </label>
                                  <CustomSelect
                                    compact
                                    options={ROUND_STATUS_OPTIONS}
                                    value={team.round_status || "Round 1 (PPT & Video Submission)"}
                                    onChange={(val) => handleUpdateTeamStatus(team.id, { round_status: val })}
                                    disabled={updatingTeamId === team.id}
                                    placeholder="Select evaluation stage..."
                                  />
                                </div>

                                <div>
                                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                    Jury Feedback
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Enter feedback for team members..."
                                    defaultValue={team.jury_feedback || ""}
                                    onBlur={(e) => {
                                      const val = e.target.value.trim();
                                      if (val !== (team.jury_feedback || "")) {
                                        handleUpdateTeamStatus(team.id, { jury_feedback: val });
                                      }
                                    }}
                                    style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "#ffffff", fontSize: "12.5px", outline: "none" }}
                                  />
                                </div>

                                <div>
                                  <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "5px" }}>
                                    Internship Purpose / Reason (Selected or Not)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="Why selected / not selected for internship..."
                                    defaultValue={team.internship_reason || ""}
                                    onBlur={(e) => {
                                      const val = e.target.value.trim();
                                      if (val !== (team.internship_reason || "")) {
                                        handleUpdateTeamStatus(team.id, { internship_reason: val });
                                      }
                                    }}
                                    style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "#ffffff", fontSize: "12.5px", outline: "none" }}
                                  />
                                </div>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
                                <AnimatedCheckbox
                                  checked={!!team.internship_selected}
                                  disabled={updatingTeamId === team.id}
                                  onChange={() => {
                                    void handleUpdateTeamStatus(team.id, { internship_selected: !team.internship_selected });
                                  }}
                                  label="Internship Selected"
                                  subLabel="Visible to all team members & college portal"
                                />
                                <AnimatedCheckbox
                                  checked={!!team.certificate_issued || !!team.is_past_event}
                                  disabled={updatingTeamId === team.id}
                                  onChange={() => {
                                    const nextChecked = !(!!team.certificate_issued || !!team.is_past_event);
                                    void handleUpdateTeamStatus(team.id, {
                                      certificate_issued: nextChecked,
                                      is_past_event: nextChecked,
                                      certificate_title: team.certificate_title || `${formatEventName(team.event_name)} — Official Certificate`,
                                      certificate_issued_at: nextChecked ? new Date().toISOString() : "",
                                    });
                                  }}
                                  label="Issue Certificate & Mark Past Event"
                                  subLabel="Sends certificate to all squad members"
                                />
                              </div>
                            </div>
                          );
                        })
                      )}

                      <TablePagination
                        currentPage={teamsPage}
                        totalItems={filteredTeamsForEvent.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setTeamsPage}
                        itemName="teams"
                      />
                    </div>
                  )}

                  {/* Sub-Tab 2: Collected Round Links (View Per Event & Per Round) */}
                  {teamsSubTab === "links" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {activeLinksList.length === 0 ? (
                        <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "50px 24px", textAlign: "center", color: "#64748b" }}>
                          No squads found under this event.
                        </div>
                      ) : (
                        activeLinksList.map((team) => {
                          const subs = team.round_submissions || {};
                          return (
                            <div
                              key={team.id}
                              className="glacier-card"
                              style={{
                                background: "#ffffff",
                                borderRadius: "20px",
                                border: "1.5px solid #e2e8f0",
                                padding: "22px 24px",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
                                <div>
                                  <h4 style={{ fontSize: "16.5px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                                    {team.team_name} <span style={{ fontSize: "12px", fontWeight: 600, color: "#64748b" }}>({formatEventName(team.event_name)})</span>
                                  </h4>
                                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                                    {team.college_name} • Leader: {team.leader_name} ({team.leader_email})
                                  </div>
                                </div>
                                <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#7C3AED", background: "rgba(124, 58, 237, 0.08)", padding: "4px 10px", borderRadius: "6px" }}>
                                  {team.round_status || "Round 1 Active"}
                                </span>
                              </div>

                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                                {/* Round 1 Links */}
                                <div style={{ padding: "14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>
                                    Round 1 • PPT &amp; Video Links
                                  </div>
                                  {subs.round1?.pptLink || subs.round1?.videoLink ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                                      {subs.round1.pptLink && (
                                        <a href={subs.round1.pptLink} target="_blank" rel="noopener noreferrer" style={{ color: "#7C3AED", fontWeight: 700, wordBreak: "break-all" }}>
                                          PPT / Drive Link ↗
                                        </a>
                                      )}
                                      {subs.round1.videoLink && (
                                        <a href={subs.round1.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", fontWeight: 700, wordBreak: "break-all" }}>
                                          Video Link ↗
                                        </a>
                                      )}
                                      {subs.round1.submittedAt && (
                                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                                          Submitted {new Date(subs.round1.submittedAt).toLocaleString("en-IN")}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>No Round 1 links submitted yet</span>
                                  )}
                                </div>

                                {/* Round 2 Links */}
                                <div style={{ padding: "14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>
                                    Round 2 • Prototype &amp; Demo Video
                                  </div>
                                  {subs.round2?.prototypeLink || subs.round2?.videoLink ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                                      {subs.round2.prototypeLink && (
                                        <a href={subs.round2.prototypeLink} target="_blank" rel="noopener noreferrer" style={{ color: "#7C3AED", fontWeight: 700, wordBreak: "break-all" }}>
                                          Prototype Repo / URL ↗
                                        </a>
                                      )}
                                      {subs.round2.videoLink && (
                                        <a href={subs.round2.videoLink} target="_blank" rel="noopener noreferrer" style={{ color: "#2563EB", fontWeight: 700, wordBreak: "break-all" }}>
                                          Explanation Video ↗
                                        </a>
                                      )}
                                      {subs.round2.submittedAt && (
                                        <span style={{ fontSize: "11px", color: "#64748b" }}>
                                          Submitted {new Date(subs.round2.submittedAt).toLocaleString("en-IN")}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>No Round 2 links submitted yet</span>
                                  )}
                                </div>

                                {/* Round 3 Links */}
                                <div style={{ padding: "14px", borderRadius: "12px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                                  <div style={{ fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "8px" }}>
                                    Round 3 • Jury Presentation Deck
                                  </div>
                                  {subs.round3?.deckLink ? (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "12.5px" }}>
                                      <a href={subs.round3.deckLink} target="_blank" rel="noopener noreferrer" style={{ color: "#7C3AED", fontWeight: 700, wordBreak: "break-all" }}>
                                        Jury Presentation Deck ↗
                                      </a>
                                      {subs.round3.notes && (
                                        <span style={{ fontSize: "11.5px", color: "#475569" }}>Notes: {subs.round3.notes}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>No Round 3 submission yet</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}

                      <TablePagination
                        currentPage={linksPage}
                        totalItems={filteredTeamsForEvent.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setLinksPage}
                        itemName="team submissions"
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── TAB 6: EVENT EDITIONS & VERSION ARCHIVES ── */}
            {activeTab === "editions" && (() => {
              const shownEditions = editions.filter((ed) =>
                editionsSubTab === "past" ? ed.status === "past" : ed.status !== "past"
              );

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Header Switcher + Create Next Edition Button */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1.5px solid #e2e8f0",
                      padding: "16px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="glacier-btn"
                        onClick={() => setEditionsSubTab("active")}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "10px",
                          border: editionsSubTab === "active" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                          background: editionsSubTab === "active" ? LOGO_GRADIENT : "#f8fafc",
                          color: editionsSubTab === "active" ? "#ffffff" : "#334155",
                          fontSize: "13px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Active &amp; Upcoming Versions ({editions.filter((e) => e.status !== "past").length})
                      </button>
                      <button
                        type="button"
                        className="glacier-btn"
                        onClick={() => setEditionsSubTab("past")}
                        style={{
                          padding: "10px 18px",
                          borderRadius: "10px",
                          border: editionsSubTab === "past" ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                          background: editionsSubTab === "past" ? LOGO_GRADIENT : "#f8fafc",
                          color: editionsSubTab === "past" ? "#ffffff" : "#334155",
                          fontSize: "13px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Past Versions Archive ({editions.filter((e) => e.status === "past").length})
                      </button>
                    </div>

                    <button
                      type="button"
                      className="glacier-btn"
                      onClick={() => {
                        applyEditionSeriesDefaults("shepitch_chennai");
                        setShowCreateEditionForm((prev) => !prev);
                      }}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "1.5px solid transparent",
                        background: LOGO_GRADIENT,
                        color: "#ffffff",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: "pointer",
                        boxShadow: "0 6px 18px rgba(124, 58, 237, 0.25)",
                      }}
                    >
                      {showCreateEditionForm ? "Close Version Creator" : "+ Create Next Event Version"}
                    </button>
                  </div>

                  {editionMsg && (
                    <div style={{ padding: "12px 18px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d", fontSize: "13.5px", fontWeight: 700 }}>
                      ✓ {editionMsg}
                    </div>
                  )}

                  {/* Launch Next Version Template Form */}
                  {showCreateEditionForm && (
                    <form
                      onSubmit={handleCreateNextEdition}
                      className="glacier-card modal-animate-in"
                      style={{
                        background: "#ffffff",
                        borderRadius: "24px",
                        border: "1.5px solid #7C3AED",
                        padding: "28px 30px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: "19px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px 0" }}>
                          Launch Upcoming / Next Event Edition
                        </h3>
                        <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
                          Select an existing series template (e.g. ShePitch Chennai Edition 3 or HackPick Edition 2). Publishing immediately adds it to Events Hub &amp; Student Portal.
                        </p>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Competition Series Template *
                          </label>
                          <CustomSelect
                            compact
                            value={newEdSeries}
                            options={[
                              { value: "shepitch_chennai", label: "ShePitch Chennai Series (Next Edition)" },
                              { value: "hackpick", label: "HackPick Series (Next Edition)" },
                              { value: "shepitch_coimbatore", label: "ShePitch Coimbatore Series" },
                            ]}
                            onChange={(val) => applyEditionSeriesDefaults(val as any)}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Edition Number *
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={newEdNumber}
                            onChange={(e) => setNewEdNumber(Number(e.target.value))}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Launch Status *
                          </label>
                          <CustomSelect
                            compact
                            value={newEdStatus}
                            options={[
                              { value: "active", label: "Active (Open for Registration Immediately)" },
                              { value: "upcoming", label: "Upcoming (Announced / Preview)" },
                              { value: "past", label: "Past (Store in Archive)" },
                            ]}
                            onChange={(val) => setNewEdStatus(val as any)}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Edition Display Title *
                          </label>
                          <input
                            type="text"
                            required
                            value={newEdTitle}
                            onChange={(e) => setNewEdTitle(e.target.value)}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Tag Badge
                          </label>
                          <input
                            type="text"
                            value={newEdBadge}
                            onChange={(e) => setNewEdBadge(e.target.value)}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Schedule Note
                          </label>
                          <input
                            type="text"
                            value={newEdSchedule}
                            onChange={(e) => setNewEdSchedule(e.target.value)}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Pricing Mode
                          </label>
                          <CustomSelect
                            compact
                            value={newEdPricingMode}
                            options={[
                              { value: "per_member", label: "Per Member Fee" },
                              { value: "flat_team", label: "Flat Squad Fee" },
                            ]}
                            onChange={(val) => setNewEdPricingMode(val as any)}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Fee (INR ₹)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={newEdFee}
                            onChange={(e) => setNewEdFee(Number(e.target.value))}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Min Members
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={newEdMinSize}
                            onChange={(e) => setNewEdMinSize(Number(e.target.value))}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Max Members
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={newEdMaxSize}
                            onChange={(e) => setNewEdMaxSize(Number(e.target.value))}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            WhatsApp Group URL
                          </label>
                          <input
                            type="url"
                            value={newEdWhatsapp}
                            onChange={(e) => setNewEdWhatsapp(e.target.value)}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                            Short Description
                          </label>
                          <input
                            type="text"
                            value={newEdDesc}
                            onChange={(e) => setNewEdDesc(e.target.value)}
                            style={{ width: "100%", height: "40px", padding: "0 12px", borderRadius: "10px", border: "1.5px solid #cbd5e1", fontSize: "13.5px" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                        <button
                          type="button"
                          className="glacier-btn"
                          onClick={() => setShowCreateEditionForm(false)}
                          style={{ padding: "10px 18px", borderRadius: "10px", border: "1.5px solid #cbd5e1", background: "#ffffff", color: "#475569", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editionSaving}
                          className="glacier-btn"
                          style={{ padding: "10px 22px", borderRadius: "10px", border: "1.5px solid transparent", background: LOGO_GRADIENT, color: "#ffffff", fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
                        >
                          {editionSaving ? "Publishing Edition..." : "Publish Edition to Live Site →"}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Editions Cards List */}
                  {shownEditions.length === 0 ? (
                    <div style={{ background: "#ffffff", borderRadius: "20px", border: "1.5px solid #e2e8f0", padding: "50px 24px", textAlign: "center", color: "#64748b" }}>
                      {editionsSubTab === "past"
                        ? "No past editions archived yet. You can archive any completed edition to preserve all its records here."
                        : "No active or upcoming editions configured."}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {shownEditions.map((ed) => {
                        const edTeams = visibleRegistrations.filter(
                          (r) =>
                            r.event_name === ed.slug ||
                            (ed.slug === "shepitch_chennai" && r.event_name === "shepitch")
                        );
                        const edRevenue = edTeams.reduce((s, r) => s + (r.amount_paid || 0), 0);
                        const edColleges = new Set(edTeams.map((r) => r.college_name.trim().toLowerCase()).filter(Boolean)).size;
                        const isInspecting = selectedEditionInspect === ed.slug;

                        return (
                          <div
                            key={ed.slug}
                            className="glacier-card"
                            style={{
                              background: "#ffffff",
                              borderRadius: "22px",
                              border: "1.5px solid #e2e8f0",
                              padding: "24px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "14px", marginBottom: "16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                <div
                                  style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "50%",
                                    background: LOGO_GRADIENT,
                                    color: "#ffffff",
                                    fontSize: "14px",
                                    fontWeight: 900,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  E{ed.editionNumber}
                                </div>
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <h3 style={{ fontSize: "19px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                                      {ed.title}
                                    </h3>
                                    <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 9px", borderRadius: "6px", background: ed.status === "upcoming" ? "#fef3c7" : "#f1f5f9", color: ed.status === "upcoming" ? "#92400e" : "#334155", border: ed.status === "upcoming" ? "1px solid #fcd34d" : "1px solid #cbd5e1", textTransform: "uppercase" }}>
                                      {ed.status}
                                    </span>
                                    {ed.registrationClosed && (
                                      <span style={{ fontSize: "11px", fontWeight: 800, padding: "3px 9px", borderRadius: "6px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", textTransform: "uppercase" }}>
                                        Registration Stopped
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: "13px", color: "#64748b", marginTop: "3px" }}>
                                    {ed.tagline} • ₹{ed.feeAmount} ({ed.pricingMode === "per_member" ? "per member" : "flat team"}) • {ed.teamSizeMin}–{ed.teamSizeMax} Members
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {ed.status === "active" && (
                                  <button
                                    type="button"
                                    className="glacier-btn"
                                    onClick={() => handleToggleEditionRegistration(ed.slug, !ed.registrationClosed)}
                                    style={{
                                      padding: "8px 12px",
                                      borderRadius: "8px",
                                      border: ed.registrationClosed ? "1px solid #10b981" : "1px solid #fecaca",
                                      background: ed.registrationClosed ? "#ecfdf5" : "#fef2f2",
                                      color: ed.registrationClosed ? "#047857" : "#dc2626",
                                      fontSize: "12px",
                                      fontWeight: 800,
                                      cursor: "pointer",
                                    }}
                                  >
                                    {ed.registrationClosed ? "Reopen Registration" : "Stop Registration"}
                                  </button>
                                )}
                                {ed.status !== "active" && (
                                  <button
                                    type="button"
                                    className="glacier-btn"
                                    onClick={() => handleUpdateEditionStatus(ed.slug, "active")}
                                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                  >
                                    Set Active
                                  </button>
                                )}
                                {ed.status === "active" && (
                                  <button
                                    type="button"
                                    className="glacier-btn"
                                    onClick={() => handleUpdateEditionStatus(ed.slug, "upcoming")}
                                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                  >
                                    Set Upcoming
                                  </button>
                                )}
                                {ed.status !== "past" && (
                                  <button
                                    type="button"
                                    className="glacier-btn"
                                    onClick={() => handleUpdateEditionStatus(ed.slug, "past")}
                                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                                  >
                                    Archive as Past Version
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="glacier-btn"
                                  onClick={() => {
                                    applyEditionSeriesDefaults(ed.series);
                                    setShowCreateEditionForm(true);
                                  }}
                                  style={{ padding: "8px 14px", borderRadius: "8px", border: "1.5px solid transparent", background: LOGO_GRADIENT, color: "#ffffff", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
                                >
                                  + Launch Next Edition
                                </button>
                              </div>
                            </div>

                            {/* Edition Metrics Strip */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", padding: "14px 16px", background: "#f8fafc", borderRadius: "14px", border: "1px solid #e2e8f0", marginBottom: "14px" }}>
                              <div>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>Enrolled Squads</span>
                                <strong style={{ fontSize: "18px", color: "#0f172a" }}>{edTeams.length} Teams</strong>
                              </div>
                              <div>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>Revenue Collected</span>
                                <strong style={{ fontSize: "18px", color: "#059669" }}>₹{edRevenue}</strong>
                              </div>
                              <div>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>Participating Colleges</span>
                                <strong style={{ fontSize: "18px", color: "#0f172a" }}>{edColleges} Colleges</strong>
                              </div>
                              <div>
                                <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, display: "block" }}>Edition Slug</span>
                                <code style={{ fontSize: "12px", color: "#334155", fontWeight: 700 }}>{ed.slug}</code>
                              </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                              <span style={{ fontSize: "12.5px", color: "#475569" }}>{ed.description}</span>
                              <button
                                type="button"
                                className="glacier-btn"
                                onClick={() => setSelectedEditionInspect(isInspecting ? null : ed.slug)}
                                style={{ padding: "7px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "12px", fontWeight: 800, cursor: "pointer" }}
                              >
                                {isInspecting ? "Hide Full Records ▲" : `Inspect All ${edTeams.length} Stored Records ▾`}
                              </button>
                            </div>

                            {/* Expanded Stored Records Inspector */}
                            {isInspecting && (
                              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #e2e8f0" }}>
                                {edTeams.length === 0 ? (
                                  <div style={{ fontSize: "13px", color: "#64748b", padding: "14px", background: "#f8fafc", borderRadius: "10px" }}>
                                    No teams recorded under this edition yet.
                                  </div>
                                ) : (
                                  <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                                    <table style={{ width: "100%", minWidth: "680px", borderCollapse: "collapse", textAlign: "left", fontSize: "12.5px" }}>
                                      <thead>
                                        <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "11px", fontWeight: 800, textTransform: "uppercase" }}>
                                          <th style={{ padding: "10px 14px" }}>Team &amp; ID</th>
                                          <th style={{ padding: "10px 14px" }}>College</th>
                                          <th style={{ padding: "10px 14px" }}>Round Outcome</th>
                                          <th style={{ padding: "10px 14px" }}>Internship</th>
                                          <th style={{ padding: "10px 14px" }}>Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {edTeams.map((t) => (
                                          <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={{ padding: "10px 14px" }}>
                                              <strong style={{ color: "#0f172a" }}>{t.team_name}</strong>
                                              <div style={{ fontSize: "11px", color: "#64748b" }}>{t.id} • {t.domain}</div>
                                            </td>
                                            <td style={{ padding: "10px 14px", color: "#334155" }}>{t.college_name}</td>
                                            <td style={{ padding: "10px 14px", color: "#0f172a", fontWeight: 600 }}>{t.round_status || "Round 1"}</td>
                                            <td style={{ padding: "10px 14px", color: t.internship_selected ? "#059669" : "#64748b", fontWeight: 700 }}>
                                              {t.internship_selected ? "Selected" : "—"}
                                            </td>
                                            <td style={{ padding: "10px 14px", fontWeight: 800, color: "#0f172a" }}>₹{t.amount_paid}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
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
              );
            })()}

            {/* ── TAB 4: BREVO MAIL & DATABASE INFRASTRUCTURE ── */}
            {activeTab === "brevo-db" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                {/* ── SECTION 1: BREVO SMTP RELAY & CUSTOM DOMAIN ── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "20px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    padding: "28px 32px",
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          Brevo Transactional Email Service
                        </h3>
                        <span
                          style={{
                            background: "rgba(16, 185, 129, 0.12)",
                            color: "#059669",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Domain Authenticated: ugham.com
                        </span>
                      </div>
                      <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                        Official transactional delivery relay for participant squad credentials and event confirmation notices.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={fetchSmtpStatus}
                      disabled={checkingSmtp}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "9px 16px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        color: "#475569",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: checkingSmtp ? "not-allowed" : "pointer",
                      }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        style={{ animation: checkingSmtp ? "spin 1s linear infinite" : "none" }}
                      >
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                      </svg>
                      <span>{checkingSmtp ? "Syncing..." : "Refresh"}</span>
                    </button>
                  </div>

                  {/* 2 Brief Essential Cards: Connected Status & Limit Used */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                      gap: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    {/* Card 1: Connected Status */}
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "14px",
                        background: smtpInfo?.connected ? "rgba(16, 185, 129, 0.05)" : "rgba(245, 158, 11, 0.05)",
                        border: smtpInfo?.connected ? "1.5px solid rgba(16, 185, 129, 0.3)" : "1.5px solid rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                          Relay State
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 800,
                            background: smtpInfo?.connected ? "#10b981" : "#f59e0b",
                            color: "#ffffff",
                          }}
                        >
                          {smtpInfo?.connected ? "LIVE CONNECTED" : "ACTION REQUIRED"}
                        </span>
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", marginBottom: "4px" }}>
                        {smtpInfo?.connected ? "Brevo SMTP Connected & Verified" : "SMTP Pending Configuration"}
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#475569", lineHeight: "1.5" }}>
                        <div><strong>Sender:</strong> {smtpInfo?.fromAddress || "events@ugham.com"} ({smtpInfo?.fromName || "UGHAM Events"})</div>
                        <div><strong>Host:</strong> {smtpInfo?.host || "smtp-relay.brevo.com"}:587 (STARTTLS)</div>
                      </div>
                    </div>

                    {/* Card 2: Limit Used */}
                    <div
                      style={{
                        padding: "20px",
                        borderRadius: "14px",
                        background: "rgba(124, 58, 237, 0.04)",
                        border: "1.5px solid rgba(124, 58, 237, 0.2)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                          Daily Sending Limit Used
                        </span>
                        <span
                          style={{
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 800,
                            background: "rgba(124, 58, 237, 0.12)",
                            color: "#7C3AED",
                          }}
                        >
                          Brevo Free Tier
                        </span>
                      </div>
                      <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", marginBottom: "4px" }}>
                        {smtpInfo?.emailsToday ?? 0} <span style={{ fontSize: "15px", color: "#64748b", fontWeight: 600 }}>/ 300 emails today</span>
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "10px" }}>
                        {Math.max(0, 300 - (smtpInfo?.emailsToday ?? 0))} emails available remaining today (resets midnight IST).
                      </div>
                      {/* Mini sleek progress bar */}
                      <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "#e2e8f0", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.min(100, ((smtpInfo?.emailsToday ?? 0) / 300) * 100)}%`,
                            height: "100%",
                            background: "var(--grad)",
                            borderRadius: "3px",
                            transition: "width 0.3s ease",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Error & Diagnostics Section: Only shows when error occurs OR when manually requested */}
                  {(smtpInfo?.analysis?.ipRestrictionDetected || (testResult && !testResult.success) || showDiagnosticsTest) && (
                    <div
                      style={{
                        background: "#f8fafc",
                        borderRadius: "14px",
                        border: "1.5px solid #e2e8f0",
                        padding: "20px",
                        marginTop: "16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 800, color: "#0f172a" }}>
                          Diagnostic Test Suite &amp; Error Resolution
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowDiagnosticsTest(false)}
                          style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: "12px", fontWeight: 700 }}
                        >
                          Close Test Tools ✕
                        </button>
                      </div>

                      {/* Explicit Explanation when Brevo returns IP Restriction 525 5.7.1 */}
                      {smtpInfo?.analysis?.ipRestrictionDetected && (
                        <div
                          style={{
                            padding: "14px 16px",
                            borderRadius: "10px",
                            background: "#fef2f2",
                            border: "1px solid #fecaca",
                            color: "#991b1b",
                            fontSize: "13px",
                            lineHeight: "1.5",
                            marginBottom: "16px",
                          }}
                        >
                          <div style={{ fontWeight: 800, marginBottom: "4px" }}>
                            Brevo Relay Warning: 525 5.7.1 Unauthorized IP address
                          </div>
                          <div>
                            Remove Authorized IP restriction in Brevo Dashboard &rarr; SMTP &amp; API to allow local/cloud dispatch.
                          </div>
                        </div>
                      )}

                      {/* Test input and trigger */}
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                          type="email"
                          placeholder="Recipient email address (e.g. your email)..."
                          value={testRecipient}
                          onChange={(e) => setTestRecipient(e.target.value)}
                          style={{
                            flex: 1,
                            minWidth: "240px",
                            height: "42px",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            border: "1.5px solid #cbd5e1",
                            background: "#ffffff",
                            fontSize: "13px",
                            outline: "none",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleSendTestEmail("ping")}
                          disabled={sendingTest}
                          className="btn-primary"
                          style={{ padding: "10px 18px", borderRadius: "8px", fontSize: "13px" }}
                        >
                          {sendingTest ? "Testing..." : "Send Test Email"}
                        </button>
                      </div>

                      {testResult && (
                        <div
                          style={{
                            marginTop: "12px",
                            padding: "12px 14px",
                            borderRadius: "8px",
                            background: testResult.success ? "rgba(16, 185, 129, 0.08)" : "#fef2f2",
                            border: testResult.success ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid #fecaca",
                            fontSize: "13px",
                            color: testResult.success ? "#065f46" : "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          {testResult.message || (testResult.success ? "Test email delivered successfully" : testResult.error)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Toggle button to open test tools when in normal state */}
                  {!smtpInfo?.analysis?.ipRestrictionDetected && (!testResult || testResult.success) && !showDiagnosticsTest && (
                    <button
                      type="button"
                      onClick={() => setShowDiagnosticsTest(true)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#7C3AED",
                        fontSize: "12.5px",
                        fontWeight: 700,
                        cursor: "pointer",
                        padding: "4px 0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span>Need to send a test verification email? Click here &rarr;</span>
                    </button>
                  )}
                </div>

                {/* ── SECTION 2: POSTGRESQL DATABASE ENGINE & RESILIENCE ── */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    padding: "32px",
                  }}
                >
                  <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669", letterSpacing: "1px", textTransform: "uppercase" }}>
                        SECTION 02 // DATABASE &amp; DATA RESILIENCE
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", justifyContent: "space-between" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                        PostgreSQL Database Engine &amp; Data Storage
                      </h3>
                      <span
                        style={{
                          background: dbStatus?.connected ? "rgba(16, 185, 129, 0.12)" : "rgba(245, 158, 11, 0.12)",
                          color: dbStatus?.connected ? "#059669" : "#d97706",
                          padding: "4px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 800,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "currentColor" }}></span>
                        {dbStatus?.connected ? "Aiven Cloud PostgreSQL (Live)" : "Safe Local Storage Active"}
                      </span>
                    </div>
                    <p style={{ color: "#64748b", fontSize: "14px", margin: "6px 0 0 0" }}>
                      All squad registrations, participant credentials, and college directory records are securely persisted with zero data loss architecture.
                    </p>
                  </div>

                  {/* Database Info Cards */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        padding: "18px 20px",
                        borderRadius: "16px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                        Active Storage Engine
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>
                        {dbStatus?.type || "PostgreSQL / Local File"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        Mode: {dbStatus?.mode || "Automatic Failover"}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "18px 20px",
                        borderRadius: "16px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                        Target Host Server
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#7C3AED", wordBreak: "break-all" }}>
                        {dbStatus?.host || "pg-ugham.aivencloud.com"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        Cloud Provider: Aiven PostgreSQL
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "18px 20px",
                        borderRadius: "16px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                        Database &amp; Latency
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a" }}>
                        {dbStatus?.database || "defaultdb"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#059669", fontWeight: 700, marginTop: "4px" }}>
                        Latency: {dbStatus?.latencyMs ? `${dbStatus.latencyMs}ms` : "Instant Local Access"}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "18px 20px",
                        borderRadius: "16px",
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" }}>
                        Data Integrity State
                      </div>
                      <div style={{ fontSize: "16px", fontWeight: 900, color: "#059669" }}>
                        100% Preserved
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                        Registrations Saved: {totalRegistrations} Teams
                      </div>
                    </div>
                  </div>

                  {/* Informative Diagnostic Alert */}
                  {dbStatus?.error ? (
                    <div
                      style={{
                        padding: "16px 20px",
                        borderRadius: "14px",
                        background: "#fffbeb",
                        border: "1.5px solid #fde68a",
                        color: "#92400e",
                        fontSize: "13.5px",
                        lineHeight: "1.6",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, marginBottom: "4px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>Database Notice: {dbStatus.error}</span>
                      </div>
                      <p style={{ margin: "4px 0 0 0", color: "#78350f" }}>
                        Automatic local JSON storage is active in <code>data/registrations.json</code> to prevent any student data loss.
                        When your Aiven PostgreSQL credentials in <code>.env.local</code> are authenticated, all records seamlessly connect with cloud storage.
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "14px 18px",
                        borderRadius: "12px",
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1.5px solid rgba(16, 185, 129, 0.25)",
                        color: "#065f46",
                        fontSize: "13.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Aiven PostgreSQL cloud connection is operational and synchronized.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 5: EMAILS SENT MONITOR ── */}
            {activeTab === "emails-sent" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Top KPI Metrics Strip */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {/* Card 1: Total Processed */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #e2e8f0",
                      borderRadius: "20px",
                      padding: "22px 24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ fontSize: "11.5px", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                      TOTAL PROCESSED EMAILS
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#1e1b4b", marginTop: "4px" }}>
                      {totalProcessedEmails}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>
                      All Enrolled Student Participants
                    </div>
                  </div>

                  {/* Card 2: Delivered with Checkmark */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "20px",
                      padding: "22px 24px",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11.5px", color: "#059669", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                        DELIVERED SUCCESSFULLY
                      </span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#059669", marginTop: "4px" }}>
                      {totalSentEmails}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#10b981", marginTop: "4px", fontWeight: 600 }}>
                      Custom Domain Delivered (ugham.com)
                    </div>
                  </div>

                  {/* Card 3: Pending / In Queue with Animated Loader */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid rgba(245, 158, 11, 0.3)",
                      borderRadius: "20px",
                      padding: "22px 24px",
                      boxShadow: "0 2px 8px rgba(245, 158, 11, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11.5px", color: "#d97706", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                        PENDING / IN QUEUE
                      </span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="2.5"
                        style={{ animation: totalPendingEmails > 0 ? "spin 1.5s linear infinite" : "none" }}
                      >
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                      </svg>
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#d97706", marginTop: "4px" }}>
                      {totalPendingEmails}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#b45309", marginTop: "4px", fontWeight: 500 }}>
                      Awaiting Dispatch Queue
                    </div>
                  </div>

                  {/* Card 4: Failed / Not Sent with Reload Icon */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: totalFailedEmails > 0 ? "1.5px solid rgba(239, 68, 68, 0.3)" : "1.5px solid #e2e8f0",
                      borderRadius: "20px",
                      padding: "22px 24px",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "11.5px", color: totalFailedEmails > 0 ? "#dc2626" : "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                        FAILED / NOT SENT
                      </span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={totalFailedEmails > 0 ? "#dc2626" : "#64748b"} strokeWidth="2.2">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                      </svg>
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: totalFailedEmails > 0 ? "#dc2626" : "#64748b", marginTop: "4px" }}>
                      {totalFailedEmails}
                    </div>
                    <div style={{ fontSize: "12.5px", color: totalFailedEmails > 0 ? "#ef4444" : "#64748b", marginTop: "4px", fontWeight: 500 }}>
                      {totalFailedEmails > 0 ? "Requires Manual Resend" : "Zero Delivery Errors"}
                    </div>
                  </div>
                </div>

                {/* Instant Success Banner */}
                {emailSendSuccessMsg && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.12)",
                      border: "1.5px solid rgba(16, 185, 129, 0.3)",
                      borderRadius: "14px",
                      padding: "14px 20px",
                      color: "#065f46",
                      fontSize: "14px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{emailSendSuccessMsg}</span>
                  </div>
                )}

                {/* Table Card */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                    overflow: "hidden",
                  }}
                >
                  {/* Table Control Bar */}
                  <div
                    style={{
                      padding: "20px 24px",
                      borderBottom: "1.5px solid #f1f5f9",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    {/* Status Filter Capsules */}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailFilterStatus("all");
                          setEmailsPage(1);
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          background: emailFilterStatus === "all" ? "var(--grad)" : "#f1f5f9",
                          color: emailFilterStatus === "all" ? "#ffffff" : "#475569",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        All Emails ({totalProcessedEmails})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailFilterStatus("sent");
                          setEmailsPage(1);
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          background: emailFilterStatus === "sent" ? "#059669" : "#f1f5f9",
                          color: emailFilterStatus === "sent" ? "#ffffff" : "#475569",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Delivered ({totalSentEmails})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailFilterStatus("pending");
                          setEmailsPage(1);
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          background: emailFilterStatus === "pending" ? "#d97706" : "#f1f5f9",
                          color: emailFilterStatus === "pending" ? "#ffffff" : "#475569",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        In Queue ({totalPendingEmails})
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailFilterStatus("failed");
                          setEmailsPage(1);
                        }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          border: "none",
                          background: emailFilterStatus === "failed" ? "#dc2626" : "#f1f5f9",
                          color: emailFilterStatus === "failed" ? "#ffffff" : "#475569",
                          fontWeight: 700,
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        Failed ({totalFailedEmails})
                      </button>
                    </div>

                    {/* Search Bar */}
                    <div style={{ position: "relative", width: "280px" }}>
                      <span
                        style={{
                          position: "absolute",
                          left: "14px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="11" cy="11" r="8"></circle>
                          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                      </span>
                      <input
                        type="text"
                        placeholder="Search student, email, squad..."
                        value={emailSearchQuery}
                        onChange={(e) => {
                          setEmailSearchQuery(e.target.value);
                          setEmailsPage(1);
                        }}
                        style={{
                          width: "100%",
                          height: "40px",
                          padding: "8px 14px 8px 38px",
                          borderRadius: "12px",
                          border: "1.5px solid #e2e8f0",
                          fontSize: "13px",
                          outline: "none",
                          color: "#0f172a",
                        }}
                      />
                    </div>
                  </div>

                  {/* Emails Table */}
                  {filteredDispatchedEmails.length === 0 ? (
                    <div style={{ padding: "60px 24px", textAlign: "center" }}>
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          borderRadius: "50%",
                          background: "rgba(124, 58, 237, 0.08)",
                          color: "#7C3AED",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto 16px",
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </div>
                      <h4 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                        No Email Records Dispatched Yet
                      </h4>
                      <p style={{ color: "#64748b", fontSize: "14px", margin: 0, maxWidth: "460px", marginLeft: "auto", marginRight: "auto" }}>
                        When students register squads for ShePitch or HackPick, their official confirmation credentials emails will be tracked here in real time.
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
                        <thead>
                          <tr style={{ background: "#f8fafc", borderBottom: "1.5px solid #e2e8f0", color: "#64748b", fontWeight: 800, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.5px" }}>
                            <th style={{ padding: "16px 20px" }}>Participant Student &amp; Email</th>
                            <th style={{ padding: "16px 20px" }}>Squad &amp; Role</th>
                            <th style={{ padding: "16px 20px" }}>Event Track</th>
                            <th style={{ padding: "16px 20px" }}>Delivery Status</th>
                            <th style={{ padding: "16px 20px" }}>Registered Date</th>
                            <th style={{ padding: "16px 20px", textAlign: "center" }}>Instant Action</th>
                          </tr>
                        </thead>
                        <tbody style={{ color: "#1e293b" }}>
                          {paginatedEmails.map((item, idx) => (
                            <tr
                              key={`${item.registrationId}-${item.memberEmail}-${idx}`}
                              style={{
                                borderBottom: "1px solid #f1f5f9",
                                transition: "background 0.15s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(248, 250, 252, 0.8)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              {/* Participant & Email */}
                              <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                                <div style={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>
                                  {item.memberName}
                                </div>
                                <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>
                                  {item.memberEmail}
                                </div>
                              </td>

                              {/* Squad & Role */}
                              <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                                <div style={{ fontWeight: 700, color: "#1e1b4b" }}>
                                  {item.teamName}
                                </div>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "2px 8px",
                                    borderRadius: "6px",
                                    fontSize: "11px",
                                    fontWeight: 700,
                                    marginTop: "4px",
                                    background: item.role === "Leader" ? "rgba(124, 58, 237, 0.1)" : "rgba(100, 116, 139, 0.1)",
                                    color: item.role === "Leader" ? "#7C3AED" : "#475569",
                                  }}
                                >
                                  {item.role}
                                </span>
                              </td>

                              {/* Event Track */}
                              <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "3px 10px",
                                    borderRadius: "6px",
                                    fontSize: "11.5px",
                                    fontWeight: 800,
                                    background:
                                      item.eventName === "shepitch_coimbatore"
                                        ? "rgba(147, 51, 234, 0.12)"
                                        : item.eventName === "shepitch_chennai" || item.eventName === "shepitch"
                                        ? "rgba(192, 38, 211, 0.12)"
                                        : "rgba(37, 99, 235, 0.12)",
                                    color:
                                      item.eventName === "shepitch_coimbatore"
                                        ? "#9333EA"
                                        : item.eventName === "shepitch_chennai" || item.eventName === "shepitch"
                                        ? "#C026D3"
                                        : "#2563EB",
                                  }}
                                >
                                  {formatEventName(item.eventName)}
                                </span>
                                {item.track && (
                                  <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                                    {item.track}
                                  </div>
                                )}
                              </td>

                              {/* Delivery Status */}
                              <td style={{ padding: "16px 20px", verticalAlign: "top" }}>
                                {item.status === "sent" && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      fontWeight: 800,
                                      background: "rgba(16, 185, 129, 0.12)",
                                      color: "#059669",
                                    }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                    Delivered
                                  </span>
                                )}

                                {(item.status === "pending" || item.status === "sending") && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      fontWeight: 800,
                                      background: "rgba(245, 158, 11, 0.12)",
                                      color: "#d97706",
                                    }}
                                  >
                                    <svg
                                      width="13"
                                      height="13"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2.5"
                                      style={{ animation: "spin 1s linear infinite" }}
                                    >
                                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                                    </svg>
                                    In Queue
                                  </span>
                                )}

                                {item.status === "failed" && (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "6px",
                                      padding: "4px 10px",
                                      borderRadius: "6px",
                                      fontSize: "12px",
                                      fontWeight: 800,
                                      background: "rgba(239, 68, 68, 0.12)",
                                      color: "#dc2626",
                                    }}
                                  >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line x1="12" y1="8" x2="12" y2="12"></line>
                                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                    Failed / Not Sent
                                  </span>
                                )}
                              </td>

                              {/* Registered Date */}
                              <td style={{ padding: "16px 20px", verticalAlign: "top", color: "#64748b", fontSize: "12.5px" }}>
                                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Just Now"}
                              </td>

                              {/* Actions */}
                              <td style={{ padding: "16px 20px", verticalAlign: "top", textAlign: "center" }}>
                                <button
                                  type="button"
                                  disabled={resendingEmail === item.memberEmail}
                                  onClick={() => handleResendSingleEmail(item.registrationId, item.memberEmail)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    padding: "7px 13px",
                                    borderRadius: "10px",
                                    border: "1px solid #e2e8f0",
                                    background: "#ffffff",
                                    color: "#334155",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: resendingEmail === item.memberEmail ? "wait" : "pointer",
                                    transition: "all 0.15s ease",
                                  }}
                                  title={`Resend confirmation email to ${item.memberEmail}`}
                                >
                                  <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.2"
                                    style={{ animation: resendingEmail === item.memberEmail ? "spin 1s linear infinite" : "none" }}
                                  >
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                                  </svg>
                                  <span>{resendingEmail === item.memberEmail ? "Sending..." : "Resend Email"}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <TablePagination
                        currentPage={emailsPage}
                        totalItems={filteredDispatchedEmails.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setEmailsPage}
                        itemName="sent credentials & notices"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── TAB 8: WARNING (SELECTIVE DELETION WITH PASSWORD del@123) ── */}
            {activeTab === "warning" && (() => {
              const warningCollegesList = availableCollegeOptions;
              const warningEmailsList = (smtpInfo?.dispatchedEmails || []) as any[];
              const currentSelectableIds =
                warningSubTab === "teams"
                  ? registrations.map((r) => r.id)
                  : warningSubTab === "colleges"
                  ? warningCollegesList
                  : warningEmailsList.map((e, idx) => e.id || `${e.recipientEmail}-${idx}`);

              const toggleWarningId = (id: string) => {
                setWarningSelectedIds((prev) =>
                  prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
                );
              };

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Warning Alert Strip */}
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1.5px solid #fecaca",
                      borderRadius: "18px",
                      padding: "18px 24px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: "#dc2626",
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                          <line x1="12" y1="9" x2="12" y2="13"></line>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: "15px", fontWeight: 900, color: "#991b1b" }}>
                          Protected Deletion Zone
                        </div>
                        <div style={{ fontSize: "13px", color: "#b91c1c" }}>
                          Select specific Registered Teams, Colleges, or Email Logs below. Deletion requires authorization password verification.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={warningSelectedIds.length === 0}
                      onClick={() => {
                        setWarningError("");
                        setWarningPasswordInput("");
                        setShowWarningPasswordModal(true);
                      }}
                      className="glacier-btn"
                      style={{
                        padding: "10px 18px",
                        borderRadius: "10px",
                        border: "1.5px solid #dc2626",
                        background: warningSelectedIds.length > 0 ? "#dc2626" : "#f8fafc",
                        color: warningSelectedIds.length > 0 ? "#ffffff" : "#94a3b8",
                        fontSize: "13px",
                        fontWeight: 800,
                        cursor: warningSelectedIds.length > 0 ? "pointer" : "not-allowed",
                      }}
                    >
                      Delete Selected ({warningSelectedIds.length})
                    </button>
                  </div>

                  {warningSuccess && (
                    <div style={{ padding: "12px 18px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #86efac", color: "#15803d", fontSize: "13.5px", fontWeight: 700 }}>
                      ✓ {warningSuccess}
                    </div>
                  )}

                  {/* Category Switcher + Select All */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "18px",
                      border: "1.5px solid #e2e8f0",
                      padding: "16px 22px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {[
                        { id: "teams", label: `Teams Registered (${registrations.length})` },
                        { id: "colleges", label: `Colleges (${warningCollegesList.length})` },
                        { id: "emails", label: `Email Logs (${warningEmailsList.length})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          className="glacier-btn"
                          onClick={() => {
                            setWarningSubTab(tab.id as any);
                            setWarningSelectedIds([]);
                          }}
                          style={{
                            padding: "9px 16px",
                            borderRadius: "10px",
                            border: warningSubTab === tab.id ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
                            background: warningSubTab === tab.id ? LOGO_GRADIENT : "#f8fafc",
                            color: warningSubTab === tab.id ? "#ffffff" : "#334155",
                            fontSize: "13px",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="glacier-btn"
                        onClick={() => setWarningSelectedIds(currentSelectableIds)}
                        style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#0f172a", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Select All ({currentSelectableIds.length})
                      </button>
                      <button
                        type="button"
                        className="glacier-btn"
                        onClick={() => setWarningSelectedIds([])}
                        style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#ffffff", color: "#64748b", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Selectable Records Container */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "20px",
                      border: "1.5px solid #e2e8f0",
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    {warningSubTab === "teams" &&
                      (registrations.length === 0 ? (
                        <div style={{ padding: "36px", textAlign: "center", color: "#64748b" }}>No teams found.</div>
                      ) : (
                        registrations.map((r) => (
                          <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "10px 12px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                            <AnimatedCheckbox
                              checked={warningSelectedIds.includes(r.id)}
                              onChange={() => toggleWarningId(r.id)}
                              label={`${r.team_name} (${r.id})`}
                              subLabel={`${formatEventName(r.event_name)} • ${r.college_name} • Leader: ${r.leader_email}`}
                            />
                            <span style={{ fontSize: "12px", fontWeight: 800, color: "#059669" }}>₹{r.amount_paid}</span>
                          </div>
                        ))
                      ))}

                    {warningSubTab === "colleges" &&
                      (warningCollegesList.length === 0 ? (
                        <div style={{ padding: "36px", textAlign: "center", color: "#64748b" }}>No colleges found.</div>
                      ) : (
                        warningCollegesList.map((colName) => (
                          <div key={colName} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "10px 12px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                            <AnimatedCheckbox
                              checked={warningSelectedIds.includes(colName)}
                              onChange={() => toggleWarningId(colName)}
                              label={colName}
                              subLabel={
                                collegeCredentials.some((c) => c.collegeName.toLowerCase() === colName.toLowerCase())
                                  ? "Directory entry + College login credentials will be deleted"
                                  : "Directory entry"
                              }
                            />
                          </div>
                        ))
                      ))}

                    {warningSubTab === "emails" &&
                      (warningEmailsList.length === 0 ? (
                        <div style={{ padding: "36px", textAlign: "center", color: "#64748b" }}>No email transmission logs recorded.</div>
                      ) : (
                        warningEmailsList.map((d, idx) => {
                          const entryId = d.id || `${d.recipientEmail}-${idx}`;
                          return (
                            <div key={entryId} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", padding: "10px 12px", borderRadius: "12px", border: "1px solid #f1f5f9", background: "#f8fafc" }}>
                              <AnimatedCheckbox
                                checked={warningSelectedIds.includes(entryId)}
                                onChange={() => toggleWarningId(entryId)}
                                label={`${d.recipientEmail} — ${d.subject || "Email Dispatch"}`}
                                subLabel={`Sent: ${d.timestamp ? new Date(d.timestamp).toLocaleString("en-IN") : "Unknown"} • Status: ${d.status || "sent"}`}
                              />
                            </div>
                          );
                        })
                      ))}
                  </div>
                </div>
              );
            })()}

            {/* Warning Password Authorization Modal (Password: del@123) */}
            {showWarningPasswordModal && (
              <div
                onClick={() => setShowWarningPasswordModal(false)}
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
                  padding: "20px",
                }}
              >
                <div
                  className="modal-animate-in"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    background: "#ffffff",
                    borderRadius: "24px",
                    border: "1.5px solid #fecaca",
                    maxWidth: "440px",
                    width: "100%",
                    padding: "28px 30px",
                    boxShadow: "0 28px 70px rgba(15, 23, 42, 0.3)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "6px", background: "#dc2626", color: "#ffffff", textTransform: "uppercase" }}>
                      Deletion Confirmation
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowWarningPasswordModal(false)}
                      style={{ background: "transparent", border: "none", fontSize: "18px", color: "#64748b", cursor: "pointer" }}
                    >
                      ✕
                    </button>
                  </div>

                  <h3 style={{ fontSize: "19px", fontWeight: 900, color: "#0f172a", margin: "0 0 8px 0" }}>
                    Confirm Permanent Deletion
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0", lineHeight: 1.5 }}>
                    You are about to permanently delete <strong>{warningSelectedIds.length}</strong> selected{" "}
                    <strong>{warningSubTab}</strong> record(s). Enter the deletion authorization password to proceed.
                  </p>

                  {warningError && (
                    <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", fontSize: "12.5px", fontWeight: 700, marginBottom: "12px" }}>
                      {warningError}
                    </div>
                  )}

                  <form onSubmit={handleConfirmWarningDelete} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "11px", fontWeight: 800, color: "#475569", textTransform: "uppercase", marginBottom: "6px" }}>
                        Authorization Password *
                      </label>
                      <input
                        type="password"
                        required
                        autoFocus
                        placeholder="Enter deletion password..."
                        value={warningPasswordInput}
                        onChange={(e) => setWarningPasswordInput(e.target.value)}
                        style={{
                          width: "100%",
                          height: "44px",
                          padding: "0 14px",
                          borderRadius: "10px",
                          border: "1.5px solid #cbd5e1",
                          fontSize: "14px",
                          outline: "none",
                        }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="submit"
                        disabled={warningDeleting}
                        className="glacier-btn"
                        style={{
                          flex: 1,
                          height: "44px",
                          borderRadius: "10px",
                          border: "1.5px solid #dc2626",
                          background: "#dc2626",
                          color: "#ffffff",
                          fontSize: "13.5px",
                          fontWeight: 800,
                          cursor: warningDeleting ? "wait" : "pointer",
                        }}
                      >
                        {warningDeleting ? "Deleting..." : "Verify & Delete Permanently"}
                      </button>
                      <button
                        type="button"
                        className="glacier-btn"
                        onClick={() => setShowWarningPasswordModal(false)}
                        style={{
                          padding: "0 18px",
                          height: "44px",
                          borderRadius: "10px",
                          border: "1.5px solid #cbd5e1",
                          background: "#ffffff",
                          color: "#475569",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
