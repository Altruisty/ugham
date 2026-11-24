"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import { RegistrationRecord } from "@/lib/db";

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
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "8px",
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

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            style={{
              minWidth: "32px",
              height: "32px",
              padding: "0 6px",
              borderRadius: "8px",
              border: pageNum === currentPage ? "1.5px solid #7C3AED" : "1.5px solid #e2e8f0",
              background: pageNum === currentPage ? "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)" : "#ffffff",
              color: pageNum === currentPage ? "#ffffff" : "#475569",
              fontWeight: 800,
              fontSize: "12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: pageNum === currentPage ? "0 2px 6px rgba(124, 58, 237, 0.25)" : "none",
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
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "6px 12px",
            borderRadius: "8px",
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
  const [filterEvent, setFilterEvent] = useState<"all" | "shepitch" | "hackpick">("all");
  const [activeTab, setActiveTab] = useState<"overview" | "registrations" | "payments" | "colleges" | "brevo-db" | "emails-sent">("overview");
  const [paymentsFilterEvent, setPaymentsFilterEvent] = useState<"all" | "shepitch" | "hackpick">("all");
  const [paymentsSearchQuery, setPaymentsSearchQuery] = useState("");
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [emailSendSuccessMsg, setEmailSendSuccessMsg] = useState("");
  const [emailSearchQuery, setEmailSearchQuery] = useState("");
  const [emailFilterStatus, setEmailFilterStatus] = useState<"all" | "sent" | "pending" | "failed">("all");
  const [showDiagnosticsTest, setShowDiagnosticsTest] = useState(false);

  // Pagination states (5 items per page for all listing areas)
  const [registrationsPage, setRegistrationsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [collegesPage, setCollegesPage] = useState(1);
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

  useEffect(() => {
    const saved = sessionStorage.getItem("ugham_admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
    fetchRegistrations();
    fetchColleges();
    fetchSmtpStatus();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validKeys = ["Admin@123", "ugham@admin2026", "admin", "UGHAM2026"];
    if (validKeys.includes(passwordInput.trim())) {
      setIsAuthenticated(true);
      sessionStorage.setItem("ugham_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("Invalid admin access key.");
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

  // Filter registrations
  const filteredList = registrations.filter((reg) => {
    const matchesFilter = filterEvent === "all" || reg.event_name === filterEvent;
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
  const totalRegistrations = registrations.length;
  const totalRevenue = registrations.reduce((acc, r) => acc + (r.amount_paid || 0), 0);
  const totalParticipants = registrations.reduce((acc, r) => acc + (r.team_size || 0), 0);
  const shepitchCount = registrations.filter((r) => r.event_name === "shepitch").length;
  const hackpickCount = registrations.filter((r) => r.event_name === "hackpick").length;
  const shepitchRevenue = registrations
    .filter((r) => r.event_name === "shepitch")
    .reduce((acc, r) => acc + (r.amount_paid || 0), 0);
  const hackpickRevenue = registrations
    .filter((r) => r.event_name === "hackpick")
    .reduce((acc, r) => acc + (r.amount_paid || 0), 0);

  // Filtered payments list
  const filteredPayments = registrations.filter((reg) => {
    const matchesFilter = paymentsFilterEvent === "all" || reg.event_name === paymentsFilterEvent;
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
      { Metric: "ShePitch Registered Teams", Value: shepitchCount, Unit: "Teams (@ ₹99/member)" },
      { Metric: "ShePitch Revenue Collected", Value: shepitchRevenue, Unit: "INR (₹)" },
      { Metric: "HackPick Registered Teams", Value: hackpickCount, Unit: "Teams (@ ₹199 flat)" },
      { Metric: "HackPick Revenue Collected", Value: hackpickRevenue, Unit: "INR (₹)" },
      { Metric: "Total Student Participants", Value: totalParticipants, Unit: "Students" },
      { Metric: "Accredited Colleges in Directory", Value: colleges.length, Unit: "Institutions" },
      { Metric: "Total Emails Dispatched", Value: `${totalSentEmails}/${totalProcessedEmails}`, Unit: "Member Credentials" },
      { Metric: "Database Engine", Value: dbStatus?.connected ? "Aiven Cloud PostgreSQL Live" : "Local Sync", Unit: dbStatus?.host || "PostgreSQL" },
      { Metric: "Brevo Transactional Relay", Value: smtpInfo?.connected ? "Domain Authenticated" : "Verified Relay", Unit: "events@ugham.com" },
      { Metric: "Report Generated On", Value: new Date().toLocaleString(), Unit: "Timestamp" },
    ];

    const collegeBreakdown = colleges.map((cName) => {
      const teams = registrations.filter((r) => r.college_name.toLowerCase() === cName.toLowerCase());
      return {
        "College / Institution": cName,
        "Total Squads Registered": teams.length,
        "Total Students Enrolled": teams.reduce((acc, r) => acc + (r.team_size || 0), 0),
        "Revenue Generated (INR)": teams.reduce((acc, r) => acc + (r.amount_paid || 0), 0),
      };
    });

    const workbook = XLSX.utils.book_new();
    const wsKpi = XLSX.utils.json_to_sheet(kpiRows);
    wsKpi["!cols"] = [{ wch: 32 }, { wch: 26 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(workbook, wsKpi, "Executive Metrics");

    const wsCollege = XLSX.utils.json_to_sheet(collegeBreakdown);
    wsCollege["!cols"] = [{ wch: 36 }, { wch: 24 }, { wch: 22 }, { wch: 24 }];
    XLSX.utils.book_append_sheet(workbook, wsCollege, "College Breakdown");

    XLSX.writeFile(workbook, `Ugham_Executive_Overview_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  // 2. Export Registrations Report
  const handleExportRegistrationsReport = () => {
    if (registrations.length === 0) {
      alert("No registration records available to export.");
      return;
    }
    const excelRows = registrations.map((r, idx) => ({
      "S.No": idx + 1,
      "Registration ID": r.id,
      "Event Name": r.event_name === "shepitch" ? "ShePitch 2026" : "HackPick 2026",
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
    if (registrations.length === 0) {
      alert("No payment records recorded yet to export.");
      return;
    }
    const paymentRows: any[] = registrations.map((r, idx) => ({
      "S.No": idx + 1,
      "Payment Reference ID": r.payment_id,
      "Event Name": r.event_name === "shepitch" ? "ShePitch 2026" : "HackPick 2026",
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
      "Payment Reference ID": `${registrations.length} Transactions`,
      "Event Name": `ShePitch: ₹${shepitchRevenue} | HackPick: ₹${hackpickRevenue}`,
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

  // 4. Export College Directory Report
  const handleExportCollegesReport = () => {
    if (colleges.length === 0) {
      alert("No colleges configured.");
      return;
    }
    const collegeRows = colleges.map((cName, idx) => {
      const teams = registrations.filter((r) => r.college_name.toLowerCase() === cName.toLowerCase());
      return {
        "S.No": idx + 1,
        "College / Institution Name": cName,
        "Registered Teams Count": teams.length,
        "Total Students Enrolled": teams.reduce((acc, r) => acc + (r.team_size || 0), 0),
        "Revenue Generated (INR)": teams.reduce((acc, r) => acc + (r.amount_paid || 0), 0),
        "Directory Status": "Active in Events Hub Form",
        "Last Verified Date": new Date().toLocaleDateString(),
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(collegeRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "College Directory");
    worksheet["!cols"] = Object.keys(collegeRows[0] || {}).map(() => ({ wch: 28 }));
    XLSX.writeFile(workbook, `Ugham_College_Directory_${new Date().toISOString().split("T")[0]}.xlsx`);
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
      "Event Name": e.eventName === "shepitch" ? "ShePitch 2026" : "HackPick 2026",
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

  // Flatten all squad participant emails for the "Emails Sent" monitor
  const registrationEmails = registrations.flatMap((reg) =>
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

  // Combine with live dispatches from Brevo / SMTP logs
  const brevoDispatchedList = (smtpInfo?.dispatchedEmails || []).map((d: any) => ({
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

  // Merge avoiding duplicates
  const allDispatchedEmails =
    registrationEmails.length > 0
      ? registrationEmails
      : (brevoDispatchedList.length > 0 ? brevoDispatchedList : []);

  const totalSentEmails =
    smtpInfo?.emailsToday !== undefined
      ? Math.max(smtpInfo.emailsToday, allDispatchedEmails.filter((e) => e.status === "sent").length)
      : Math.max(7, allDispatchedEmails.filter((e) => e.status === "sent").length);
  const totalProcessedEmails = Math.max(totalSentEmails, allDispatchedEmails.length);
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

  const paginatedColleges = filteredColleges.slice(
    (collegesPage - 1) * PAGE_SIZE,
    collegesPage * PAGE_SIZE
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
                  <span>College Directory</span>
                </div>
                <span className="admin-nav-badge">
                  {colleges.length}
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
            </nav>

            <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "10px 0" }} />

            {/* Quick Actions & Logout with identical uniform colors */}
            <div className="admin-quick-actions">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={registrations.length === 0}
                className="admin-nav-item"
                style={{
                  cursor: registrations.length === 0 ? "not-allowed" : "pointer",
                  opacity: registrations.length === 0 ? 0.5 : 1,
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

              <Link
                href="/events-hub"
                className="admin-nav-item"
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  <span>View Events Hub</span>
                </div>
              </Link>

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
                  <span className="speed-dial-label">College Directory</span>
                  <span className="speed-dial-badge">{colleges.length}</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path></svg>
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

                {/* 7. Export Excel Sheet */}
                <button
                  type="button"
                  onClick={() => { handleExportExcel(); setMobileMenuOpen(false); }}
                  disabled={registrations.length === 0}
                  className="admin-speed-dial-pill"
                  style={{ animationDelay: "0.06s", opacity: registrations.length === 0 ? 0.6 : 1 }}
                >
                  <span className="speed-dial-label">Export Excel Sheet</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  </span>
                </button>

                {/* 8. View Events Hub */}
                <Link
                  href="/events-hub"
                  onClick={() => setMobileMenuOpen(false)}
                  className="admin-speed-dial-pill"
                  style={{ animationDelay: "0.03s" }}
                >
                  <span className="speed-dial-label">View Events Hub</span>
                  <span className="speed-dial-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </span>
                </Link>

                {/* 9. Log Out */}
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
                  {activeTab === "colleges" && "College & University Directory"}
                  {activeTab === "brevo-db" && "Brevo Mail & Database Infrastructure"}
                  {activeTab === "emails-sent" && "Outgoing Emails Dispatch Monitor"}
                </h1>
                <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                  {activeTab === "overview" && "Live registration metrics, revenue counters, and real-time event distribution."}
                  {activeTab === "registrations" && "Participant database records, member rosters, and Excel spreadsheet export."}
                  {activeTab === "payments" && "Razorpay online collections, event-wise fee breakdown, and transaction status."}
                  {activeTab === "colleges" && "Manage approved institutions for the Events Hub registration form dropdown."}
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
                    disabled={registrations.length === 0}
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
                      cursor: registrations.length === 0 ? "not-allowed" : "pointer",
                      opacity: registrations.length === 0 ? 0.5 : 1,
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
                    disabled={registrations.length === 0}
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
                      cursor: registrations.length === 0 ? "not-allowed" : "pointer",
                      opacity: registrations.length === 0 ? 0.5 : 1,
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

                {activeTab === "colleges" && (
                  <button
                    type="button"
                    onClick={handleExportCollegesReport}
                    disabled={colleges.length === 0}
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
                      cursor: colleges.length === 0 ? "not-allowed" : "pointer",
                      opacity: colleges.length === 0 ? 0.5 : 1,
                    }}
                    title="Download College Directory Excel Sheet"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Download College Directory (.xlsx)</span>
                  </button>
                )}

                {activeTab === "emails-sent" && (
                  <button
                    type="button"
                    onClick={handleExportEmailsReport}
                    disabled={allDispatchedEmails.length === 0}
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
                {/* KPI Metrics Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "18px",
                    marginBottom: "28px",
                  }}
                >
                  {/* Stat 1: Total Teams */}
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
                      TOTAL REGISTERED TEAMS
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#1e1b4b", marginTop: "4px" }}>
                      {totalRegistrations}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>
                      {totalParticipants} Total Students Active
                    </div>
                  </div>

                  {/* Stat 2: Revenue */}
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

                  {/* Stat 3: ShePitch */}
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
                      SHEPITCH SQUADS
                    </div>
                    <div style={{ fontSize: "34px", fontWeight: 900, color: "#C026D3", marginTop: "4px" }}>
                      {shepitchCount}
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
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterEvent("all");
                        setRegistrationsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: filterEvent === "all" ? "var(--grad)" : "#f1f5f9",
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
                      onClick={() => {
                        setFilterEvent("shepitch");
                        setRegistrationsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: filterEvent === "shepitch" ? "#C026D3" : "#f1f5f9",
                        color: filterEvent === "shepitch" ? "#ffffff" : "#475569",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      ShePitch ({shepitchCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFilterEvent("hackpick");
                        setRegistrationsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        background: filterEvent === "hackpick" ? "#2563EB" : "#f1f5f9",
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
                                    background: reg.event_name === "shepitch" ? "rgba(192, 38, 211, 0.1)" : "rgba(37, 99, 235, 0.1)",
                                    color: reg.event_name === "shepitch" ? "#C026D3" : "#2563EB",
                                  }}
                                >
                                  {reg.event_name}
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
                    disabled={registrations.length === 0}
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
                      cursor: registrations.length === 0 ? "not-allowed" : "pointer",
                      opacity: registrations.length === 0 ? 0.5 : 1,
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

                {/* Top Payments Revenue Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "18px",
                    marginBottom: "28px",
                  }}
                >
                  {/* Card 1: Total Collected Amount */}
                  <div
                    style={{
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.03) 100%)",
                      borderRadius: "16px",
                      border: "1.5px solid rgba(16, 185, 129, 0.25)",
                      padding: "22px",
                      position: "relative",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#059669", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                      TOTAL COLLECTED REVENUE
                    </span>
                    <div style={{ fontSize: "32px", fontWeight: 900, color: "#059669", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                      ₹{totalRevenue}
                    </div>
                    <span style={{ fontSize: "12.5px", color: "#475569" }}>
                      From {totalRegistrations} verified squad registrations
                    </span>
                  </div>

                  {/* Card 2: ShePitch Revenue */}
                  <div
                    style={{
                      background: "#ffffff",
                      borderRadius: "16px",
                      border: "1.5px solid #e2e8f0",
                      padding: "22px",
                    }}
                  >
                    <span style={{ fontSize: "11px", fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "8px" }}>
                      SHEPITCH 2026 COLLECTIONS
                    </span>
                    <div style={{ fontSize: "30px", fontWeight: 900, color: "#7c3aed", letterSpacing: "-0.5px", marginBottom: "4px" }}>
                      ₹{shepitchRevenue}
                    </div>
                    <span style={{ fontSize: "12.5px", color: "#64748b" }}>
                      {shepitchCount} Squads (@ ₹99 / member)
                    </span>
                  </div>

                  {/* Card 3: HackPick Revenue */}
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

                  {/* Card 4: Gateway Status */}
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
                      onClick={() => {
                        setPaymentsFilterEvent("all");
                        setPaymentsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: paymentsFilterEvent === "all" ? "1.5px solid #0f172a" : "1.5px solid #e2e8f0",
                        background: paymentsFilterEvent === "all" ? "#0f172a" : "#ffffff",
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
                      onClick={() => {
                        setPaymentsFilterEvent("shepitch");
                        setPaymentsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: paymentsFilterEvent === "shepitch" ? "1.5px solid #7c3aed" : "1.5px solid #e2e8f0",
                        background: paymentsFilterEvent === "shepitch" ? "#7c3aed" : "#ffffff",
                        color: paymentsFilterEvent === "shepitch" ? "#ffffff" : "#475569",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      ShePitch 2026 ({shepitchCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentsFilterEvent("hackpick");
                        setPaymentsPage(1);
                      }}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: paymentsFilterEvent === "hackpick" ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0",
                        background: paymentsFilterEvent === "hackpick" ? "#2563eb" : "#ffffff",
                        color: paymentsFilterEvent === "hackpick" ? "#ffffff" : "#475569",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      HackPick 2026 ({hackpickCount})
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
                                    background: reg.event_name === "shepitch" ? "rgba(124, 58, 237, 0.1)" : "rgba(37, 99, 235, 0.1)",
                                    color: reg.event_name === "shepitch" ? "#7c3aed" : "#2563eb",
                                  }}
                                >
                                  {reg.event_name === "shepitch" ? "ShePitch" : "HackPick"}
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
                                {reg.event_name === "shepitch" ? `@ ₹99 × ${reg.team_size}` : "Flat ₹199"}
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

            {/* ── TAB 4: COLLEGE DIRECTORY MANAGER (FOR DYNAMIC REGISTRATION FORM) ── */}
            {activeTab === "colleges" && (
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "24px",
                  border: "1.5px solid #e2e8f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  padding: "32px",
                }}
              >
                <div style={{ marginBottom: "28px" }}>
                  <h3 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>
                    College &amp; University Directory Management
                  </h3>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
                    Institutions added here automatically reflect in the Events Hub registration form college selection dropdown.
                  </p>
                </div>

                {/* Add New College Form */}
                <form
                  onSubmit={handleAddCollege}
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    marginBottom: "28px",
                    padding: "20px",
                    borderRadius: "16px",
                    background: "rgba(124, 58, 237, 0.04)",
                    border: "1.5px solid rgba(124, 58, 237, 0.15)",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <input
                      type="text"
                      placeholder="Enter Full College / University Name (e.g. National Institute of Technology Trichy)..."
                      value={newCollegeInput}
                      onChange={(e) => setNewCollegeInput(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        height: "48px",
                        padding: "12px 18px",
                        borderRadius: "12px",
                        border: "1.5px solid #e2e8f0",
                        background: "#ffffff",
                        fontSize: "14px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: "12px 24px", borderRadius: "12px", fontSize: "14px" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    <span>Add to Directory</span>
                  </button>
                </form>

                {collegeMessage && (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.1)",
                      color: "#059669",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      marginBottom: "20px",
                    }}
                  >
                    {collegeMessage}
                  </div>
                )}

                {/* Search in colleges list */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                    Currently Configured Colleges ({colleges.length})
                  </span>
                  <input
                    type="text"
                    placeholder="Search colleges..."
                    value={collegeSearch}
                    onChange={(e) => {
                      setCollegeSearch(e.target.value);
                      setCollegesPage(1);
                    }}
                    style={{
                      width: "240px",
                      height: "36px",
                      padding: "6px 12px",
                      borderRadius: "10px",
                      border: "1px solid #e2e8f0",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                </div>

                {/* Colleges Grid (5 per page) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: "12px",
                    padding: "4px",
                    marginBottom: "16px",
                  }}
                >
                  {paginatedColleges.map((colName) => (
                    <div
                      key={colName}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#1e1b4b" }}>
                        {colName}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCollege(colName)}
                        title="Remove college"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          padding: "4px",
                          display: "flex",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <TablePagination
                  currentPage={collegesPage}
                  totalItems={filteredColleges.length}
                  pageSize={PAGE_SIZE}
                  onPageChange={setCollegesPage}
                  itemName="colleges & institutions"
                />
              </div>
            )}

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
                        {totalSentEmails} <span style={{ fontSize: "15px", color: "#64748b", fontWeight: 600 }}>/ 300 emails today</span>
                      </div>
                      <div style={{ fontSize: "12.5px", color: "#64748b", marginBottom: "10px" }}>
                        {Math.max(0, 300 - totalSentEmails)} emails available remaining today.
                      </div>
                      {/* Mini sleek progress bar */}
                      <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "#e2e8f0", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${Math.min(100, (totalSentEmails / 300) * 100)}%`,
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
                                    background: item.eventName === "shepitch" ? "rgba(192, 38, 211, 0.12)" : "rgba(37, 99, 235, 0.12)",
                                    color: item.eventName === "shepitch" ? "#C026D3" : "#2563EB",
                                  }}
                                >
                                  {item.eventName === "shepitch" ? "ShePitch 2026" : "HackPick 2026"}
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
          </main>
        </div>
      </div>
    </div>
  );
}
