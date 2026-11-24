"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import CustomSelect from "@/components/CustomSelect";
import { DEFAULT_COLLEGES } from "@/lib/constants";

type EventType = "shepitch" | "hackpick";

const SHEPITCH_DOMAINS = [
  "AI",
  "SAAS",
  "EDUTECH",
  "HEALTHCARE",
  "FINTECH",
  "AGRITECH",
  "IOT",
  "MECHANICAL",
  "CYBER SECURITY",
  "OPEN INNOVATION",
];

const HACKPICK_DOMAINS = [
  "AI",
  "CYBER SECURITY",
  "FINTECH",
  "IOT",
  "SAAS",
  "AGRI TECH",
  "HEALTH CARE",
  "CLOUD",
];

const YEAR_OPTIONS = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "Final Year",
  "Postgraduate / Research",
];

export default function EventsHubPage() {
  const [selectedEvent, setSelectedEvent] = useState<EventType>("shepitch");

  // ShePitch specific
  const [shepitchTrack, setShepitchTrack] = useState<"Project Pitch" | "Idea Pitch">("Project Pitch");
  const [shepitchTeamSize, setShepitchTeamSize] = useState<number>(3); // 3 or 4
  const [shepitchDomain, setShepitchDomain] = useState<string>("AI");

  // HackPick specific
  const [hackpickTeamSize, setHackpickTeamSize] = useState<number>(2); // 2 or 3
  const [hackpickDomain, setHackpickDomain] = useState<string>("AI");

  // Common Fields
  const [teamName, setTeamName] = useState("");
  const [collegeList, setCollegeList] = useState<string[]>(DEFAULT_COLLEGES);
  const [collegeName, setCollegeName] = useState("IIT Madras");
  const [customCollegeName, setCustomCollegeName] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState("3rd Year");
  const [department, setDepartment] = useState("");

  // Leader details
  const [leaderName, setLeaderName] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  // Additional Members details
  const [member2Name, setMember2Name] = useState("");
  const [member2Email, setMember2Email] = useState("");
  const [member3Name, setMember3Name] = useState("");
  const [member3Email, setMember3Email] = useState("");
  const [member4Name, setMember4Name] = useState("");
  const [member4Email, setMember4Email] = useState("");

  // UI Flow States
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Fetch dynamic colleges from Admin API
  useEffect(() => {
    fetch("/api/admin/colleges")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.colleges) && data.colleges.length > 0) {
          setCollegeList(data.colleges);
          if (!data.colleges.includes(collegeName)) {
            setCollegeName(data.colleges[0]);
          }
        }
      })
      .catch((err) => console.error("Error loading college options:", err));
  }, []);

  const currentTeamSize = selectedEvent === "shepitch" ? shepitchTeamSize : hackpickTeamSize;
  const currentDomain = selectedEvent === "shepitch" ? shepitchDomain : hackpickDomain;

  // Pricing calculation
  const totalAmount = useMemo(() => {
    if (selectedEvent === "shepitch") {
      return shepitchTeamSize * 99; // ₹99 per member
    } else {
      return 199; // Flat ₹199 per team
    }
  }, [selectedEvent, shepitchTeamSize]);

  // Real-time validations
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneClean = mobileNumber.trim().replace(/[\s\-\+]/g, "");
  
  const isTeamNameValid = teamName.trim().length >= 2;
  const effectiveCollegeName = collegeName === "other" ? customCollegeName.trim() : collegeName.trim();
  const isCollegeValid = effectiveCollegeName.length >= 2;
  const isDepartmentValid = department.trim().length >= 2;
  
  const isLeaderNameValid = leaderName.trim().length >= 2;
  const isLeaderEmailValid = emailRegex.test(leaderEmail.trim());
  const isMobileValid = phoneClean.length >= 10 && phoneClean.length <= 13;

  const isMember2NameValid = member2Name.trim().length >= 2;
  const isMember2EmailValid = emailRegex.test(member2Email.trim());

  const isMember3NameValid = currentTeamSize < 3 || member3Name.trim().length >= 2;
  const isMember3EmailValid = currentTeamSize < 3 || emailRegex.test(member3Email.trim());

  const isMember4NameValid = !(selectedEvent === "shepitch" && shepitchTeamSize === 4) || member4Name.trim().length >= 2;
  const isMember4EmailValid = !(selectedEvent === "shepitch" && shepitchTeamSize === 4) || emailRegex.test(member4Email.trim());

  // Aggregate validation
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    if (!isTeamNameValid) errors.push("Team Name");
    if (!isCollegeValid) errors.push("College / Institution");
    if (!isDepartmentValid) errors.push("Department / Branch");
    if (!currentDomain) errors.push("Domain Selection");

    if (!isLeaderNameValid) errors.push("Leader Name");
    if (!isLeaderEmailValid) errors.push("Valid Leader Email");
    if (!isMobileValid) errors.push("Valid 10-digit WhatsApp Number");

    if (!isMember2NameValid) errors.push("Member 2 Name");
    if (!isMember2EmailValid) errors.push("Valid Member 2 Email");

    if (currentTeamSize >= 3) {
      if (!isMember3NameValid) errors.push("Member 3 Name");
      if (!isMember3EmailValid) errors.push("Valid Member 3 Email");
    }

    if (selectedEvent === "shepitch" && shepitchTeamSize === 4) {
      if (!isMember4NameValid) errors.push("Member 4 Name");
      if (!isMember4EmailValid) errors.push("Valid Member 4 Email");
    }

    return errors;
  }, [
    isTeamNameValid,
    isCollegeValid,
    isDepartmentValid,
    currentDomain,
    isLeaderNameValid,
    isLeaderEmailValid,
    isMobileValid,
    isMember2NameValid,
    isMember2EmailValid,
    isMember3NameValid,
    isMember3EmailValid,
    isMember4NameValid,
    isMember4EmailValid,
    currentTeamSize,
    selectedEvent,
    shepitchTeamSize,
  ]);

  const isFormValid = validationErrors.length === 0;

  const handlePayAndRegister = async () => {
    if (!isFormValid) return;
    setErrorMessage("");

    const membersList = [
      { name: member2Name.trim(), email: member2Email.trim(), role: "Member" },
    ];
    if (currentTeamSize >= 3) {
      membersList.push({ name: member3Name.trim(), email: member3Email.trim(), role: "Member" });
    }
    if (selectedEvent === "shepitch" && shepitchTeamSize === 4) {
      membersList.push({ name: member4Name.trim(), email: member4Email.trim(), role: "Member" });
    }

    const executeBackendRegistration = async (paymentId: string) => {
      setIsProcessingPayment(true);
      setProcessingStep(1);

      const step1Timer = setTimeout(() => setProcessingStep(2), 1000);
      const step2Timer = setTimeout(() => setProcessingStep(3), 2000);

      try {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: selectedEvent,
            track: selectedEvent === "shepitch" ? shepitchTrack : undefined,
            domain: currentDomain,
            teamName: teamName.trim(),
            leaderName: leaderName.trim(),
            leaderEmail: leaderEmail.trim(),
            mobile: mobileNumber.trim(),
            collegeName: effectiveCollegeName,
            yearOfStudy,
            department: department.trim(),
            teamSize: currentTeamSize,
            members: membersList,
            paymentId,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        setTimeout(() => {
          setIsProcessingPayment(false);
          setRegistrationResult(data);
          setShowSuccessModal(true);
        }, 3000);
      } catch (err: any) {
        clearTimeout(step1Timer);
        clearTimeout(step2Timer);
        setIsProcessingPayment(false);
        setErrorMessage(err.message || "Failed to submit registration");
      }
    };

    const razorpayAvailable = typeof window !== "undefined" && (window as any).Razorpay;

    if (razorpayAvailable && process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      try {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: totalAmount * 100,
          currency: "INR",
          name: "UGHAM INNOVATION",
          description: `${selectedEvent.toUpperCase()} Registration - Team ${teamName}`,
          image: "/assets/img/logo.png",
          handler: function (response: any) {
            executeBackendRegistration(response.razorpay_payment_id || `RZP_${Date.now()}`);
          },
          prefill: {
            name: leaderName,
            email: leaderEmail,
            contact: mobileNumber,
          },
          theme: {
            color: "#7C3AED",
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setErrorMessage(response.error?.description || "Payment failed, please try again.");
        });
        rzp.open();
      } catch (err) {
        executeBackendRegistration(`RZP_MOCK_${Date.now()}`);
      }
    } else {
      executeBackendRegistration(`RZP_MOCK_${Date.now()}`);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Prepare custom select options for colleges
  const formattedCollegeOptions = [
    ...collegeList.map((c) => ({ value: c, label: c })),
    { value: "other", label: "Other / Institution Not Listed..." },
  ];

  const teamSizeOptions =
    selectedEvent === "shepitch"
      ? [
          { value: "3", label: "3 Members (₹297 total)", badge: "₹99 / member" },
          { value: "4", label: "4 Members (₹396 total)", badge: "₹99 / member" },
        ]
      : [
          { value: "2", label: "2 Members (₹199 flat)", badge: "Flat Squad" },
          { value: "3", label: "3 Members (₹199 flat)", badge: "Flat Squad" },
        ];

  const domainOptions = (selectedEvent === "shepitch" ? SHEPITCH_DOMAINS : HACKPICK_DOMAINS).map(
    (d) => ({ value: d, label: d })
  );

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* ── 1. HERO BANNER WITH NAV CLEARANCE ── */}
      <section
        className="split-hero"
        style={{
          paddingTop: "145px",
          paddingBottom: "80px",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="split-hero-container">
          <div className="split-hero-left">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "100px",
                background: "rgba(124, 58, 237, 0.1)",
                color: "var(--primary)",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "20px",
                border: "1px solid rgba(124, 58, 237, 0.2)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="7"></circle>
                <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
              </svg>
              UGHAM FLAGSHIP ARENA 2026
            </div>

            <h1 className="split-hero-title anim-el slide-right" style={{ lineHeight: "1.15" }}>
              Events <span className="highlight">Hub.</span>
              <br />
              Pitch. Build. <span className="highlight">Scale.</span>
            </h1>

            <p className="split-hero-desc anim-el slide-right del-1" style={{ fontSize: "16.5px", lineHeight: "1.75" }}>
              Step onto India&apos;s premier innovation launchpad. Build validated deep-tech prototypes, receive mentorship from venture leaders, and unlock seed grants.
            </p>

            <div className="split-hero-buttons anim-el slide-right del-2" style={{ marginTop: "28px" }}>
              <a href="#event-registration" className="btn-primary" style={{ padding: "16px 36px" }}>
                <span>Register Your Squad</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </a>
              <a href="#competition-pipeline" className="btn-outline" style={{ padding: "16px 32px" }}>
                <span>Lifecycle Pipeline</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
          </div>

          <div className="split-hero-right anim-el scale-up del-1">
            <div className="split-hero-image-wrapper">
              <img src="/assets/img/hero_trophy.png" alt="Ugham Events Hub" />
              <div className="floating-badge badge-1">SHEPITCH ARENA</div>
              <div className="floating-badge badge-2">HACKPICK SPRINT</div>
              <div className="floating-badge badge-3">SEED GRANTS</div>
              <div className="floating-badge badge-4">VENTURE INCUBATION</div>
            </div>
          </div>
        </div>

        <div className="split-hero-bottom-curve">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C50.62,19.24,115.54,34.42,175.5,45.87,224.23,55.19,274.67,61.1,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      {/* ── 2. UNIQUE COMPETITION LIFECYCLE PIPELINE (REPLACED OLD WHAT-WE-DO CARDS) ── */}
      <section id="competition-pipeline" style={{ padding: "90px 0 100px", background: "#fcfaff", position: "relative" }}>
        <div className="container">
          <div className="text-center anim-el fade-up" style={{ marginBottom: "50px" }}>
            <span className="section-label">STRUCTURED ACCELERATION JOURNEY</span>
            <h2 className="section-title">THE 4-STAGE PIPELINE</h2>
            <p style={{ color: "var(--muted)", margin: "12px auto 0", maxWidth: "680px", fontSize: "16px", lineHeight: "1.7" }}>
              Every Ugham competition follows an end-to-end framework turning student ideas into production-ready architectures and venture-backed startups.
            </p>
          </div>

          <div className="stage-pipeline-grid">
            {/* Stage 1 */}
            <div className="stage-pipeline-card anim-el fade-up del-1">
              <div>
                <div className="stage-pipeline-header">
                  <span className="stage-pipeline-pill">PHASE 01</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>DAYS 1–3</span>
                </div>
                <div className="stage-pipeline-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  </svg>
                </div>
                <h3 className="stage-pipeline-title">Squad Roster &amp; Domain Lock</h3>
                <p className="stage-pipeline-desc">
                  Finalize your team composition, select your specialized sector track, and receive automated portal login credentials for each member.
                </p>
              </div>
              <div className="stage-pipeline-meta">
                <span>Deliverable</span>
                <strong style={{ color: "#7C3AED" }}>Portal Lock &amp; Team ID</strong>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="stage-pipeline-card anim-el fade-up del-2">
              <div>
                <div className="stage-pipeline-header">
                  <span className="stage-pipeline-pill">PHASE 02</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>WEEK 02</span>
                </div>
                <div className="stage-pipeline-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                </div>
                <h3 className="stage-pipeline-title">Deep-Tech Clinics &amp; Mentorship</h3>
                <p className="stage-pipeline-desc">
                  Participate in dedicated architecture design clinics, prototype stress testing, and 1-on-1 sprint reviews with seasoned tech executives.
                </p>
              </div>
              <div className="stage-pipeline-meta">
                <span>Deliverable</span>
                <strong style={{ color: "#7C3AED" }}>Architecture Review</strong>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="stage-pipeline-card anim-el fade-up del-3">
              <div>
                <div className="stage-pipeline-header">
                  <span className="stage-pipeline-pill">PHASE 03</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>WEEK 03</span>
                </div>
                <div className="stage-pipeline-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                </div>
                <h3 className="stage-pipeline-title">Live Demo &amp; Grand Jury Pitch</h3>
                <p className="stage-pipeline-desc">
                  Demonstrate functional code, live hardware, and validation metrics on the mainstage before an elite jury of founders and venture partners.
                </p>
              </div>
              <div className="stage-pipeline-meta">
                <span>Deliverable</span>
                <strong style={{ color: "#7C3AED" }}>Live Demonstration</strong>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="stage-pipeline-card anim-el fade-up del-4">
              <div>
                <div className="stage-pipeline-header">
                  <span className="stage-pipeline-pill">PHASE 04</span>
                  <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>FINALS</span>
                </div>
                <div className="stage-pipeline-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="6"></circle>
                    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>
                  </svg>
                </div>
                <h3 className="stage-pipeline-title">Grants &amp; Venture Incubation</h3>
                <p className="stage-pipeline-desc">
                  Top squads receive direct cash grants, incubation slots at Ugham Studio, cloud credits, and direct investor syndicate backing.
                </p>
              </div>
              <div className="stage-pipeline-meta">
                <span>Deliverable</span>
                <strong style={{ color: "#7C3AED" }}>Grants &amp; Term Sheets</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FLAGSHIP EVENTS COMPARISON CONSOLES ── */}
      <section style={{ padding: "90px 0" }}>
        <div className="container">
          <div className="text-center anim-el fade-up" style={{ marginBottom: "50px" }}>
            <span className="section-label">FLAGSHIP COMPETITIONS</span>
            <h2 className="section-title">CHOOSE YOUR CHALLENGE ARENA</h2>
          </div>

          <div className="hub-grid-2" style={{ gap: "32px", alignItems: "stretch" }}>
            {/* ShePitch Box */}
            <div
              className="anim-el slide-left del-1"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #1d0f3a 0%, #29124e 100%)",
                border: selectedEvent === "shepitch" ? "2px solid #C026D3" : "1.5px solid rgba(192,38,211,0.3)",
                boxShadow: selectedEvent === "shepitch" ? "0 20px 50px rgba(192,38,211,0.25)" : "none",
                borderRadius: "28px",
                padding: "40px",
                color: "white",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span
                    style={{
                      background: "linear-gradient(135deg, #C026D3, #7C3AED)",
                      padding: "6px 16px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    WOMEN IN INNOVATION
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "32px", fontWeight: 900, color: "#f472b6" }}>₹99</span>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", display: "block" }}>per member</span>
                  </div>
                </div>

                <h3 style={{ fontSize: "30px", fontWeight: 900, marginBottom: "12px", color: "white" }}>
                  ShePitch 2026
                </h3>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", lineHeight: "1.7", marginBottom: "26px" }}>
                  A dedicated high-impact launchpad celebrating women-led engineering and entrepreneurial squads. Showcase working prototypes or conceptual blueprints to angel investors.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#e2e8f0", fontSize: "14.5px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Squad Size: <strong style={{ color: "white" }}>3 to 4 Members</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#e2e8f0", fontSize: "14.5px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                      <polyline points="2 17 12 22 22 17"></polyline>
                      <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                    Tracks: <strong style={{ color: "white" }}>Project Pitch &amp; Idea Pitch</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#e2e8f0", fontSize: "14.5px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                    Domains: <strong style={{ color: "white" }}>10 High-Growth Sectors</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedEvent("shepitch");
                  document.getElementById("event-registration")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: selectedEvent === "shepitch" ? "linear-gradient(135deg, #c026d3, #7c3aed)" : "rgba(255,255,255,0.15)",
                  border: "none",
                  padding: "16px",
                  fontSize: "14px",
                }}
              >
                {selectedEvent === "shepitch" ? "Currently Selected for Registration" : "Select & Register for ShePitch"}
              </button>
            </div>

            {/* HackPick Box */}
            <div
              className="anim-el slide-right del-2"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "linear-gradient(135deg, #0e172a 0%, #1e1b4b 100%)",
                border: selectedEvent === "hackpick" ? "2px solid #3B82F6" : "1.5px solid rgba(59,130,246,0.3)",
                boxShadow: selectedEvent === "hackpick" ? "0 20px 50px rgba(59,130,246,0.25)" : "none",
                borderRadius: "28px",
                padding: "40px",
                color: "white",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <span
                    style={{
                      background: "linear-gradient(135deg, #3B82F6, #6366F1)",
                      padding: "6px 16px",
                      borderRadius: "100px",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    DEEP-TECH SPRINT
                  </span>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "32px", fontWeight: 900, color: "#60a5fa" }}>₹199</span>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", display: "block" }}>flat per team</span>
                  </div>
                </div>

                <h3 style={{ fontSize: "30px", fontWeight: 900, marginBottom: "12px", color: "white" }}>
                  HackPick 2026
                </h3>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", lineHeight: "1.7", marginBottom: "26px" }}>
                  A 36-hour rapid engineering marathon. Build deep-tech hardware, autonomous software, and industrial automation tools tackling real-world enterprise briefs.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "32px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#e2e8f0", fontSize: "14.5px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Squad Size: <strong style={{ color: "white" }}>2 to 3 Members</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#e2e8f0", fontSize: "14.5px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    Pricing Model: <strong style={{ color: "white" }}>Flat ₹199 per entire squad</strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "#e2e8f0", fontSize: "14.5px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                      <rect x="9" y="9" width="6" height="6"></rect>
                      <line x1="9" y1="1" x2="9" y2="4"></line>
                      <line x1="15" y1="1" x2="15" y2="4"></line>
                      <line x1="9" y1="20" x2="9" y2="23"></line>
                      <line x1="15" y1="20" x2="15" y2="23"></line>
                    </svg>
                    Domains: <strong style={{ color: "white" }}>8 Deep-Tech Domains</strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedEvent("hackpick");
                  document.getElementById("event-registration")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  background: selectedEvent === "hackpick" ? "linear-gradient(135deg, #3B82F6, #7C3AED)" : "rgba(255,255,255,0.15)",
                  border: "none",
                  padding: "16px",
                  fontSize: "14px",
                }}
              >
                {selectedEvent === "hackpick" ? "Currently Selected for Registration" : "Select & Register for HackPick"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. POLISHED REGISTRATION FORM (WITH REAL-TIME VALIDATION & CUSTOM SELECT) ── */}
      <section
        id="event-registration"
        style={{
          padding: "90px 0 120px",
          background: "radial-gradient(circle at 50% 20%, rgba(124,58,237,0.06) 0%, transparent 70%)",
          position: "relative",
          overflow: "hidden",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="container" style={{ maxWidth: "980px" }}>
          <div className="text-center anim-el fade-up" style={{ marginBottom: "32px" }}>
            <span className="section-label">OFFICIAL SQUAD REGISTRATION</span>
            <h2 className="section-title">LOCK YOUR SQUAD ENTRY</h2>
            <p style={{ color: "var(--muted)", margin: "10px auto 0", fontSize: "16px", maxWidth: "600px" }}>
              Provide accurate team credentials to receive portal access and dispatch login details to all member emails.
            </p>
          </div>

          {/* Segmented Event Switcher */}
          <div className="hub-event-tabs anim-el fade-up">
            <button
              type="button"
              className={`hub-event-tab ${selectedEvent === "shepitch" ? "active-shepitch" : ""}`}
              onClick={() => setSelectedEvent("shepitch")}
            >
              <div className="hub-tab-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-5 6.6V18h3v2h-3v2h-2v-2h-3v-2h3v-2.4C7 14.5 5 12 5 9a7 7 0 0 1 7-7z"></path>
                </svg>
              </div>
              <div className="hub-tab-text">
                <span className="hub-tab-name">ShePitch 2026</span>
                <span className="hub-tab-meta">3–4 Members • ₹99 / member</span>
              </div>
            </button>
            <button
              type="button"
              className={`hub-event-tab ${selectedEvent === "hackpick" ? "active-hackpick" : ""}`}
              onClick={() => setSelectedEvent("hackpick")}
            >
              <div className="hub-tab-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
              </div>
              <div className="hub-tab-text">
                <span className="hub-tab-name">HackPick 2026</span>
                <span className="hub-tab-meta">2–3 Members • ₹199 flat squad</span>
              </div>
            </button>
          </div>

          {/* Form Card */}
          <div className="hub-form-card anim-el fade-up">
            {errorMessage && (
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "14px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1.5px solid rgba(239, 68, 68, 0.25)",
                  color: "#dc2626",
                  marginBottom: "28px",
                  fontWeight: 700,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePayAndRegister();
              }}
            >
              {/* ── SECTION 1: EVENT SPECIFICATIONS ── */}
              <div style={{ marginBottom: "40px" }}>
                <div className="hub-section-heading">
                  <div className="hub-section-num">1</div>
                  <div>
                    <h3 className="hub-section-title">
                      {selectedEvent === "shepitch" ? "ShePitch Specifications" : "HackPick Specifications"}
                    </h3>
                    <p className="hub-section-subtitle">
                      Configure your challenge track, squad capacity, and target domain.
                    </p>
                  </div>
                </div>

                {/* ShePitch Tracks */}
                {selectedEvent === "shepitch" && (
                  <div className="hub-field">
                    <label className="hub-label">
                      Competition Track <span className="req-star">*</span>
                    </label>
                    <div className="hub-grid-2" style={{ gap: "16px", marginTop: "8px" }}>
                      <div
                        className={`hub-track-card ${shepitchTrack === "Project Pitch" ? "active" : ""}`}
                        onClick={() => setShepitchTrack("Project Pitch")}
                      >
                        <div className="hub-track-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
                            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <strong style={{ fontSize: "15px", color: "#0f172a" }}>Project Pitch</strong>
                            <span className="hub-track-badge">Working Model</span>
                          </div>
                          <span style={{ fontSize: "13px", color: "#64748b", display: "block", lineHeight: "1.4" }}>
                            Functional prototype / codebase ready for live jury demo
                          </span>
                        </div>
                        <div className="hub-radio-indicator">
                          {shepitchTrack === "Project Pitch" && <div className="hub-radio-dot" />}
                        </div>
                      </div>

                      <div
                        className={`hub-track-card ${shepitchTrack === "Idea Pitch" ? "active" : ""}`}
                        onClick={() => setShepitchTrack("Idea Pitch")}
                      >
                        <div className="hub-track-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="9" y1="18" x2="15" y2="18"></line>
                            <line x1="10" y1="22" x2="14" y2="22"></line>
                            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                          </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <strong style={{ fontSize: "15px", color: "#0f172a" }}>Idea Pitch</strong>
                            <span className="hub-track-badge">Concept Stage</span>
                          </div>
                          <span style={{ fontSize: "13px", color: "#64748b", display: "block", lineHeight: "1.4" }}>
                            Conceptual solution with validation &amp; architecture blueprint
                          </span>
                        </div>
                        <div className="hub-radio-indicator">
                          {shepitchTrack === "Idea Pitch" && <div className="hub-radio-dot" />}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Size & Domain Selectors */}
                <div className="hub-grid-2" style={{ gap: "20px" }}>
                  <div className="hub-field" style={{ marginBottom: 0 }}>
                    <label className="hub-label">
                      Squad Size <span className="req-star">*</span>
                    </label>
                    <CustomSelect
                      options={teamSizeOptions}
                      value={currentTeamSize.toString()}
                      onChange={(val) => {
                        const parsed = parseInt(val, 10);
                        if (selectedEvent === "shepitch") setShepitchTeamSize(parsed);
                        else setHackpickTeamSize(parsed);
                      }}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                      }
                    />
                  </div>

                  <div className="hub-field" style={{ marginBottom: 0 }}>
                    <label className="hub-label">
                      Domain Track <span className="req-star">*</span>
                    </label>
                    <CustomSelect
                      options={domainOptions}
                      value={currentDomain}
                      onChange={(val) => {
                        if (selectedEvent === "shepitch") setShepitchDomain(val);
                        else setHackpickDomain(val);
                      }}
                      searchable={true}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="21 8 21 21 3 21 3 8"></polyline>
                          <rect x="1" y="3" width="22" height="5"></rect>
                          <line x1="10" y1="12" x2="14" y2="12"></line>
                        </svg>
                      }
                    />
                  </div>
                </div>

                {/* Interactive Domain Pills */}
                <div style={{ marginTop: "18px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Or click a domain pill:
                  </span>
                  <div className="hub-domain-chips">
                    {(selectedEvent === "shepitch" ? SHEPITCH_DOMAINS : HACKPICK_DOMAINS).map((domainName) => {
                      const isSelected = currentDomain === domainName;
                      return (
                        <div
                          key={domainName}
                          className={`hub-domain-chip ${isSelected ? "active" : ""}`}
                          onClick={() => {
                            if (selectedEvent === "shepitch") setShepitchDomain(domainName);
                            else setHackpickDomain(domainName);
                          }}
                        >
                          {isSelected && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                          <span>{domainName}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── SECTION 2: TEAM & COLLEGE INFORMATION ── */}
              <div style={{ marginBottom: "40px" }}>
                <div className="hub-section-heading">
                  <div className="hub-section-num">2</div>
                  <div>
                    <h3 className="hub-section-title">Team &amp; College Information</h3>
                    <p className="hub-section-subtitle">
                      Identity credentials for certificates, portal team identity, and official participation.
                    </p>
                  </div>
                </div>

                <div className="hub-grid-2" style={{ gap: "20px" }}>
                  {/* Team Name */}
                  <div className="hub-field">
                    <label className="hub-label">
                      Team Name <span className="req-star">*</span>
                    </label>
                    <div className="hub-input-wrapper">
                      <span className="hub-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                          <line x1="4" y1="22" x2="4" y2="15"></line>
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="hub-input with-icon"
                        placeholder="e.g. NexusNova"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        required
                      />
                      {isTeamNameValid && (
                        <span className="hub-valid-tick">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* College Name Selection (Synchronized from MyAdmin) */}
                  <div className="hub-field">
                    <label className="hub-label">
                      College / Institution <span className="req-star">*</span>
                    </label>
                    <CustomSelect
                      options={formattedCollegeOptions}
                      value={collegeName}
                      onChange={(val) => setCollegeName(val)}
                      searchable={true}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
                          <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path>
                          <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                          <path d="M10 6h4"></path>
                          <path d="M10 10h4"></path>
                          <path d="M10 14h4"></path>
                          <path d="M10 18h4"></path>
                        </svg>
                      }
                    />

                    {/* Fallback custom input if "Other" is picked */}
                    {collegeName === "other" && (
                      <div className="hub-input-wrapper" style={{ marginTop: "10px" }}>
                        <span className="hub-input-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="hub-input with-icon"
                          placeholder="Type your college / institution full name *"
                          value={customCollegeName}
                          onChange={(e) => setCustomCollegeName(e.target.value)}
                          required
                        />
                        {customCollegeName.trim().length >= 2 && (
                          <span className="hub-valid-tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="hub-grid-2" style={{ gap: "20px" }}>
                  {/* Year of Study */}
                  <div className="hub-field" style={{ marginBottom: 0 }}>
                    <label className="hub-label">
                      Year of Study <span className="req-star">*</span>
                    </label>
                    <CustomSelect
                      options={YEAR_OPTIONS}
                      value={yearOfStudy}
                      onChange={(val) => setYearOfStudy(val)}
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                      }
                    />
                  </div>

                  {/* Department */}
                  <div className="hub-field" style={{ marginBottom: 0 }}>
                    <label className="hub-label">
                      Department / Branch <span className="req-star">*</span>
                    </label>
                    <div className="hub-input-wrapper">
                      <span className="hub-input-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                          <line x1="6" y1="6" x2="6.01" y2="6"></line>
                          <line x1="6" y1="18" x2="6.01" y2="18"></line>
                        </svg>
                      </span>
                      <input
                        type="text"
                        className="hub-input with-icon"
                        placeholder="e.g. Computer Science / AI &amp; DS"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                      />
                      {isDepartmentValid && (
                        <span className="hub-valid-tick">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── SECTION 3: PARTICIPANT SQUAD DETAILS ── */}
              <div style={{ marginBottom: "40px" }}>
                <div className="hub-section-heading">
                  <div className="hub-section-num">3</div>
                  <div>
                    <h3 className="hub-section-title">Participant Squad</h3>
                    <p className="hub-section-subtitle">
                      All participant emails are required. Each member receives their portal access credentials immediately upon registration.
                    </p>
                  </div>
                </div>

                {/* Important Portal Credentials Policy Banner */}
                <div
                  style={{
                    background: "rgba(124, 58, 237, 0.06)",
                    border: "1.5px solid rgba(124, 58, 237, 0.2)",
                    borderRadius: "16px",
                    padding: "16px 20px",
                    marginBottom: "24px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(124, 58, 237, 0.15)",
                      color: "#7C3AED",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <div>
                    <strong style={{ display: "block", color: "#1e1b4b", fontSize: "14px", marginBottom: "3px" }}>
                      Participant Portal Access Credentials Notice
                    </strong>
                    <span style={{ fontSize: "13px", color: "#64748b", lineHeight: "1.5" }}>
                      Each team member will be assigned portal login access with their <strong>registered email as their username</strong> and default password <code style={{ background: "rgba(124, 58, 237, 0.12)", padding: "2px 6px", borderRadius: "4px", color: "#7C3AED", fontWeight: 700 }}>UGHAM2026</code>. Credentials are also dispatched via SMTP email confirmation.
                    </span>
                  </div>
                </div>

                {/* Team Leader Box */}
                <div className="hub-member-box leader-box">
                  <div className="hub-member-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="hub-avatar-badge leader">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                      <div>
                        <div className="hub-member-title">01. TEAM LEADER (PRIMARY CONTACT)</div>
                        <div className="hub-member-subtitle">Receives payment confirmation, coordinator calls &amp; portal login</div>
                      </div>
                    </div>
                    <span className="hub-role-tag leader">Leader</span>
                  </div>

                  <div className="hub-grid-3">
                    <div className="hub-field" style={{ marginBottom: 0 }}>
                      <label className="hub-label">
                        Leader Full Name <span className="req-star">*</span>
                      </label>
                      <div className="hub-input-wrapper">
                        <span className="hub-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="hub-input with-icon"
                          placeholder="e.g. Aisha Sharma"
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          required
                        />
                        {isLeaderNameValid && (
                          <span className="hub-valid-tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hub-field" style={{ marginBottom: 0 }}>
                      <label className="hub-label">
                        Leader Email Address <span className="req-star">*</span>
                      </label>
                      <div className="hub-input-wrapper">
                        <span className="hub-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </span>
                        <input
                          type="email"
                          className="hub-input with-icon"
                          placeholder="aisha@example.com"
                          value={leaderEmail}
                          onChange={(e) => setLeaderEmail(e.target.value)}
                          required
                        />
                        {isLeaderEmailValid && (
                          <span className="hub-valid-tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hub-field" style={{ marginBottom: 0 }}>
                      <label className="hub-label">
                        WhatsApp Contact <span className="req-star">*</span>
                      </label>
                      <div className="hub-input-wrapper">
                        <span className="hub-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                          </svg>
                        </span>
                        <input
                          type="tel"
                          className="hub-input with-icon"
                          placeholder="10-digit mobile number"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          required
                        />
                        {isMobileValid && (
                          <span className="hub-valid-tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member 2 Box */}
                <div className="hub-member-box">
                  <div className="hub-member-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div className="hub-avatar-badge">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div>
                        <div className="hub-member-title">02. SQUAD MEMBER 2</div>
                        <div className="hub-member-subtitle">Portal credentials will be dispatched to this email</div>
                      </div>
                    </div>
                    <span className="hub-role-tag">Member</span>
                  </div>

                  <div className="hub-grid-2">
                    <div className="hub-field" style={{ marginBottom: 0 }}>
                      <label className="hub-label">
                        Member 2 Full Name <span className="req-star">*</span>
                      </label>
                      <div className="hub-input-wrapper">
                        <span className="hub-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </span>
                        <input
                          type="text"
                          className="hub-input with-icon"
                          placeholder="e.g. Priya Patel"
                          value={member2Name}
                          onChange={(e) => setMember2Name(e.target.value)}
                          required
                        />
                        {isMember2NameValid && (
                          <span className="hub-valid-tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="hub-field" style={{ marginBottom: 0 }}>
                      <label className="hub-label">
                        Member 2 Email Address <span className="req-star">*</span>
                      </label>
                      <div className="hub-input-wrapper">
                        <span className="hub-input-icon">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </span>
                        <input
                          type="email"
                          className="hub-input with-icon"
                          placeholder="priya@example.com"
                          value={member2Email}
                          onChange={(e) => setMember2Email(e.target.value)}
                          required
                        />
                        {isMember2EmailValid && (
                          <span className="hub-valid-tick">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Member 3 Box (if 3 or 4 members) */}
                {currentTeamSize >= 3 && (
                  <div className="hub-member-box">
                    <div className="hub-member-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="hub-avatar-badge">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div>
                          <div className="hub-member-title">03. SQUAD MEMBER 3</div>
                          <div className="hub-member-subtitle">Portal credentials will be dispatched to this email</div>
                        </div>
                      </div>
                      <span className="hub-role-tag">Member</span>
                    </div>

                    <div className="hub-grid-2">
                      <div className="hub-field" style={{ marginBottom: 0 }}>
                        <label className="hub-label">
                          Member 3 Full Name <span className="req-star">*</span>
                        </label>
                        <div className="hub-input-wrapper">
                          <span className="hub-input-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </span>
                          <input
                            type="text"
                            className="hub-input with-icon"
                            placeholder="e.g. Sarah Khan"
                            value={member3Name}
                            onChange={(e) => setMember3Name(e.target.value)}
                            required
                          />
                          {isMember3NameValid && (
                            <span className="hub-valid-tick">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hub-field" style={{ marginBottom: 0 }}>
                        <label className="hub-label">
                          Member 3 Email Address <span className="req-star">*</span>
                        </label>
                        <div className="hub-input-wrapper">
                          <span className="hub-input-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          </span>
                          <input
                            type="email"
                            className="hub-input with-icon"
                            placeholder="sarah@example.com"
                            value={member3Email}
                            onChange={(e) => setMember3Email(e.target.value)}
                            required
                          />
                          {isMember3EmailValid && (
                            <span className="hub-valid-tick">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Member 4 Box (ShePitch 4 members) */}
                {selectedEvent === "shepitch" && shepitchTeamSize === 4 && (
                  <div className="hub-member-box">
                    <div className="hub-member-header">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="hub-avatar-badge">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        </div>
                        <div>
                          <div className="hub-member-title">04. SQUAD MEMBER 4</div>
                          <div className="hub-member-subtitle">Portal credentials will be dispatched to this email</div>
                        </div>
                      </div>
                      <span className="hub-role-tag">Member</span>
                    </div>

                    <div className="hub-grid-2">
                      <div className="hub-field" style={{ marginBottom: 0 }}>
                        <label className="hub-label">
                          Member 4 Full Name <span className="req-star">*</span>
                        </label>
                        <div className="hub-input-wrapper">
                          <span className="hub-input-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </span>
                          <input
                            type="text"
                            className="hub-input with-icon"
                            placeholder="e.g. Diya Nair"
                            value={member4Name}
                            onChange={(e) => setMember4Name(e.target.value)}
                            required
                          />
                          {isMember4NameValid && (
                            <span className="hub-valid-tick">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hub-field" style={{ marginBottom: 0 }}>
                        <label className="hub-label">
                          Member 4 Email Address <span className="req-star">*</span>
                        </label>
                        <div className="hub-input-wrapper">
                          <span className="hub-input-icon">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                          </span>
                          <input
                            type="email"
                            className="hub-input with-icon"
                            placeholder="diya@example.com"
                            value={member4Email}
                            onChange={(e) => setMember4Email(e.target.value)}
                            required
                          />
                          {isMember4EmailValid && (
                            <span className="hub-valid-tick">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── SECTION 4: LIVE SUMMARY & SECURE PAYMENT BUTTON ── */}
              <div
                style={{
                  padding: "32px",
                  borderRadius: "24px",
                  background: "linear-gradient(135deg, #131b2e 0%, #1e1338 100%)",
                  color: "white",
                  boxShadow: "0 20px 50px rgba(19, 27, 46, 0.4)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                    paddingBottom: "20px",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        fontWeight: 800,
                        color: "#c084fc",
                        display: "block",
                      }}
                    >
                      REGISTRATION CHECKOUT SUMMARY
                    </span>
                    <div style={{ fontSize: "15px", color: "#e2e8f0", marginTop: "4px", fontWeight: 600 }}>
                      {selectedEvent === "shepitch"
                        ? `ShePitch (${shepitchTrack}) • ₹99 × ${shepitchTeamSize} members`
                        : `HackPick • Flat ₹199 per squad (${hackpickTeamSize} members)`}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", display: "block" }}>
                      Total Amount
                    </span>
                    <span
                      style={{
                        fontSize: "38px",
                        fontWeight: 900,
                        background: "linear-gradient(135deg, #38bdf8 0%, #c084fc 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      ₹{totalAmount}
                    </span>
                  </div>
                </div>

                {/* Validation helper status */}
                {!isFormValid ? (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "12px 18px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      color: "#cbd5e1",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span>
                      Please complete all required fields to unlock checkout (Pending:{" "}
                      <strong style={{ color: "#f472b6" }}>{validationErrors.slice(0, 3).join(", ")}</strong>
                      {validationErrors.length > 3 ? ` +${validationErrors.length - 3} more` : ""})
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      padding: "12px 18px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      color: "#6ee7b7",
                      marginBottom: "20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontWeight: 700,
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    All team fields and squad emails validated! Ready to complete registration.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isFormValid || isProcessingPayment}
                  className="btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "18px",
                    fontSize: "16px",
                    fontWeight: 900,
                    letterSpacing: "0.5px",
                    borderRadius: "16px",
                    opacity: isFormValid ? 1 : 0.45,
                    cursor: isFormValid ? "pointer" : "not-allowed",
                    background: isFormValid
                      ? "linear-gradient(135deg, #3B29CC 0%, #7C3AED 50%, #C026D3 100%)"
                      : "#475569",
                    boxShadow: isFormValid ? "0 12px 35px rgba(124, 58, 237, 0.4)" : "none",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px" }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  PAY ₹{totalAmount} &amp; COMPLETE REGISTRATION
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ── 5. PROFESSIONAL 3-SECOND LOADING ANIMATION OVERLAY ── */}
      {isProcessingPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(11, 15, 25, 0.88)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "32px" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "4px solid rgba(124, 58, 237, 0.2)",
                borderTopColor: "#C026D3",
                animation: "spin 1s linear infinite",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                inset: "14px",
                borderRadius: "50%",
                border: "4px solid rgba(67, 56, 202, 0.2)",
                borderBottomColor: "#38bdf8",
                animation: "spin 1.4s linear infinite reverse",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#c084fc",
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
            </div>
          </div>

          <h3
            style={{
              color: "#ffffff",
              fontSize: "22px",
              fontWeight: 900,
              marginBottom: "16px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            SECURING YOUR SQUAD ENTRY
          </h3>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              textAlign: "left",
              color: "#94a3b8",
              fontSize: "14.5px",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <div style={{ color: processingStep >= 1 ? "#38bdf8" : "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={processingStep >= 1 ? "#10b981" : "#38bdf8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Verifying Payment with Razorpay Gateway...
            </div>
            <div style={{ color: processingStep >= 2 ? "#38bdf8" : "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={processingStep >= 2 ? "#10b981" : "#38bdf8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Writing Records to Aiven PostgreSQL Cluster...
            </div>
            <div style={{ color: processingStep >= 3 ? "#38bdf8" : "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={processingStep >= 3 ? "#10b981" : "#38bdf8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Dispatching Member Credentials via SMTP...
            </div>
          </div>
        </div>
      )}

      {/* ── 6. POPUP SUCCESS MODAL WITH CREDENTIALS NOTICE ── */}
      {showSuccessModal && registrationResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "rgba(11, 15, 25, 0.82)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "680px",
              background: "#ffffff",
              borderRadius: "32px",
              padding: "44px 36px",
              boxShadow: "0 30px 80px rgba(0, 0, 0, 0.4), 0 0 50px rgba(124, 58, 237, 0.3)",
              border: "2px solid rgba(124, 58, 237, 0.3)",
              position: "relative",
              textAlign: "center",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => setShowSuccessModal(false)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(0,0,0,0.06)",
                border: "none",
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "18px",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Checkmark icon */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "white",
                boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>

            <span
              style={{
                background: "rgba(124,58,237,0.1)",
                color: "var(--primary)",
                padding: "6px 18px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              REGISTRATION ID: {registrationResult.registrationId}
            </span>

            <h2
              style={{
                fontSize: "28px",
                fontWeight: 900,
                marginTop: "16px",
                marginBottom: "8px",
                background: "var(--grad-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              REGISTRATION CONFIRMED
            </h2>

            <p style={{ color: "var(--muted)", fontSize: "15px", marginBottom: "26px", lineHeight: "1.6" }}>
              Your squad <strong>{registrationResult.teamName}</strong> is officially registered for{" "}
              <strong>{registrationResult.eventName?.toUpperCase()}</strong>. Confirmation emails have been dispatched to each participant.
            </p>

            {/* Credentials Card */}
            <div
              style={{
                background: "linear-gradient(135deg, #1e1b4b 0%, #2e1065 100%)",
                borderRadius: "20px",
                padding: "24px",
                textAlign: "left",
                color: "white",
                marginBottom: "28px",
                border: "1px solid rgba(192, 38, 211, 0.4)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
                  Participant Portal Access Credentials
                </h4>
              </div>
              <p style={{ fontSize: "13px", color: "#cbd5e1", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                Each participant can log in to the Ugham Participant Portal using their individual email as their username and the default security password below:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {registrationResult.members?.map((m: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "14px",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <strong>{m.name}</strong> ({m.role}): <span style={{ color: "#38bdf8" }}>{m.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontFamily: "monospace", background: "rgba(0,0,0,0.4)", padding: "4px 10px", borderRadius: "6px", color: "#f472b6", fontWeight: 700 }}>
                        {m.password}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`Username: ${m.email}\nPassword: ${m.password}`, idx)}
                        style={{
                          background: "rgba(255,255,255,0.12)",
                          border: "none",
                          color: "white",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {copiedIndex === idx ? (
                          "Copied!"
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/login"
                className="btn-primary"
                style={{ padding: "14px 28px", textDecoration: "none" }}
              >
                Sign In to Participant Portal &rarr;
              </Link>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="btn-outline"
                style={{ padding: "14px 24px" }}
              >
                Close / Back to Events
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
