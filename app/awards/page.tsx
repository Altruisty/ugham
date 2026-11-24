"use client";

import { useState, useId } from "react";
import Script from "next/script";
import Link from "next/link";
import StarCanvas from "@/components/StarCanvas";

export default function AwardsPage() {
  const [teamSize, setTeamSize] = useState(2);
  const [category, setCategory] = useState("Ideathon");
  const [domain, setDomain] = useState("");
  const [showDomainOverlay, setShowDomainOverlay] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const pricePerMember = category === "Ideathon" ? 249 : 299;
  const effectivePrice = referralCode.trim() ? (category === "Ideathon" ? 199 : 249) : pricePerMember;
  const totalAmount = teamSize * effectivePrice;

  const domains = [
    "AI & ML", "Deep Tech", "Cybersecurity", "Blockchain", "Internet of Things (IoT)",
    "Cloud", "Industry 4.0", "FinTech", "HealthTech", "EdTech",
    "AgriTech", "ClimateTech", "SpaceTech", "Robotics", "AR & VR",
    "Agentic AI", "Smart Cities", "Renewable Energy", "BioTech", "Creative Tech",
    "Quantum Computing", "SaaS", "Gaming Technology", "LegalTech", "Defence Tech",
  ];

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <>
      <Script src="https://cdn.tailwindcss.com" strategy="afterInteractive" />
      <StarCanvas />

      {/* HERO */}
      <section className="split-hero">
        <div className="split-hero-container">
          <div className="split-hero-left">
            <h1 className="split-hero-title anim-el slide-right">
              UGHAM <span className="highlight">Innovation</span>
              <br />
              <span className="highlight">Awards</span> 2026.
            </h1>
            <p className="split-hero-desc anim-el slide-right del-1">
              Recognizing the brightest minds and most disruptive ideas. Compete, pitch, and win funding to accelerate your startup journey.
            </p>
            <div className="split-hero-buttons anim-el slide-right del-2">
              <a href="#register" className="btn-primary-solid">
                Register Now &rarr;
              </a>
              <a href="#rules" className="btn-secondary-outline">
                View Guidelines
              </a>
            </div>
          </div>
          <div className="split-hero-right anim-el scale-up del-1">
            <div className="split-hero-image-wrapper">
              <img src="/assets/img/hero_trophy.png" alt="Hero Graphic" />
              <div className="floating-badge badge-1">
                <i className="fa-solid fa-award"></i> RECOGNITION
              </div>
              <div className="floating-badge badge-2">
                <i className="fa-solid fa-sack-dollar"></i> FUNDING
              </div>
              <div className="floating-badge badge-3">
                <i className="fa-solid fa-globe"></i> EXPOSURE
              </div>
              <div className="floating-badge badge-4">
                <i className="fa-solid fa-network-wired"></i> NETWORKING
              </div>
            </div>
          </div>
        </div>

        <div className="split-hero-bottom-curve">
          <svg
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C50.62,19.24,115.54,34.42,175.5,45.87,224.23,55.19,274.67,61.1,321.39,56.44Z"
              className="shape-fill"
            ></path>
          </svg>
        </div>
      </section>

      {/* CATEGORIES (Pricing Cards) */}
      <section style={{ padding: "120px 0", position: "relative", overflow: "hidden" }}>
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "-10%",
            width: "400px",
            height: "400px",
            background: "rgba(124,58,237,0.08)",
            filter: "blur(80px)",
            borderRadius: "50%",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "-10%",
            width: "300px",
            height: "300px",
            background: "rgba(192,38,211,0.08)",
            filter: "blur(60px)",
            borderRadius: "50%",
          }}
        ></div>
        <div className="container">
          <h2 className="section-title anim-el fade-up" style={{ marginBottom: "48px", textAlign: "center" }}>
            CATEGORIES
          </h2>
          <div className="pricing-grid anim-el blur-in del-1">
            <div className="price-card">
              <div className="pc-header">
                <h3>Idea Pitch</h3>
                <p>Idea Stage</p>
              </div>
              <div className="pc-price">
                &#8377;249<span>/member</span>
              </div>
              <div className="pc-features">
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Present your innovative concept
                </div>
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> No prototype needed
                </div>
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Expert judge feedback
                </div>
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Certificate of participation
                </div>
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Team size: 2-5 members
                </div>
              </div>
              <div className="pc-action">
                <a href="#register">Register Now &#8250;</a>
              </div>
            </div>
            <div className="price-card">
              <div className="pc-header">
                <h3>Prototype Pitch</h3>
                <p>Prototype / Working Model</p>
              </div>
              <div className="pc-price">
                &#8377;299<span>/member</span>
              </div>
              <div className="pc-features">
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Demo your built solution live
                </div>
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Working prototype required
                </div>
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Investor exposure
                </div>
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Incubation opportunity
                </div>
                <div className="pc-feat">
                  <i className="fa-solid fa-check-circle"></i> Team size: 2-5 members
                </div>
              </div>
              <div className="pc-action">
                <a href="#register">Register Now &#8250;</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RULES (Interactive Flip Cards) */}
      <section id="rules" style={{ padding: "80px 0", background: "var(--surface)" }}>
        <div className="container">
          <h2 className="section-title anim-el fade-up" style={{ marginBottom: "16px", textAlign: "center" }}>
            RULES
          </h2>
          <p className="anim-el fade-up" style={{ textAlign: "center", color: "var(--muted)", marginBottom: "40px", fontSize: "16px" }}>
            Hover each card to reveal the rule
          </p>
          <div className="rules-grid anim-el blur-in del-1">
            <div className="rule-flip">
              <div className="rule-flip-inner">
                <div className="rule-flip-front">01</div>
                <div className="rule-flip-back">Team participation (2 to 5 members)</div>
              </div>
            </div>
            <div className="rule-flip">
              <div className="rule-flip-inner">
                <div className="rule-flip-front">02</div>
                <div className="rule-flip-back">One idea / project per team</div>
              </div>
            </div>
            <div className="rule-flip">
              <div className="rule-flip-inner">
                <div className="rule-flip-front">03</div>
                <div className="rule-flip-back">Original ideas only — no copies</div>
              </div>
            </div>
            <div className="rule-flip">
              <div className="rule-flip-inner">
                <div className="rule-flip-front">04</div>
                <div className="rule-flip-back">PPT submission is mandatory</div>
              </div>
            </div>
            <div className="rule-flip">
              <div className="rule-flip-inner">
                <div className="rule-flip-front">05</div>
                <div className="rule-flip-back">Demo mandatory for prototype pitch</div>
              </div>
            </div>
            <div className="rule-flip">
              <div className="rule-flip-inner">
                <div className="rule-flip-front">06</div>
                <div className="rule-flip-back">Pitch time: 3 to 5 minutes + Q&amp;A</div>
              </div>
            </div>
            <div className="rule-flip">
              <div className="rule-flip-inner">
                <div className="rule-flip-front">07</div>
                <div className="rule-flip-back">Judges&apos; decision is final</div>
              </div>
            </div>
          </div>

          <div className="anim-el scale-up del-2" style={{ textAlign: "center", marginTop: "48px" }}>
            <p style={{ fontSize: "56px", lineHeight: 1 }}>&#127942;</p>
            <p
              style={{
                fontSize: "48px",
                fontWeight: 900,
                background: "var(--grad-text)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginTop: "12px",
              }}
            >
              &#8377;1,00,000
            </p>
            <p style={{ fontSize: "18px", fontWeight: 700, color: "var(--muted)", marginTop: "8px" }}>Total Prize Pool</p>
          </div>
        </div>
      </section>

      {/* PARTICIPANT BENEFITS (Marquee) */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <h2 className="section-title anim-el fade-up" style={{ marginBottom: "32px", textAlign: "center" }}>
            PARTICIPANT BENEFITS
          </h2>
        </div>
        <div className="marquee-wrap anim-el blur-in del-1">
          <div className="marquee-track">
            <div className="marquee-item">
              <div className="mi-icon">&#127942;</div>
              <span>&#8377;1,00,000 Prize Pool</span>
            </div>
            <div className="marquee-item">
              <div className="mi-icon">&#128220;</div>
              <span>Participation Certificate</span>
            </div>
            <div className="marquee-item">
              <div className="mi-icon">&#128188;</div>
              <span>Internship Opportunities</span>
            </div>
            <div className="marquee-item">
              <div className="mi-icon">&#129504;</div>
              <span>Expert Mentorship</span>
            </div>
            <div className="marquee-item">
              <div className="mi-icon">&#128196;</div>
              <span>Patent Filing Support</span>
            </div>
            <div className="marquee-item">
              <div className="mi-icon">&#127941;</div>
              <span>Trophy of Excellence</span>
            </div>
            <div className="marquee-item">
              <div className="mi-icon">&#128176;</div>
              <span>Investor Pitching</span>
            </div>
            <div className="marquee-item">
              <div className="mi-icon">&#127969;</div>
              <span>Incubation Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* WHY ATTEND */}
      <section style={{ padding: "80px 0" }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <h2 className="section-title anim-el fade-up" style={{ marginBottom: "48px", textAlign: "center" }}>
            WHY ATTEND
          </h2>
          <div className="expand-strips anim-el blur-in del-1">
            <div className="ex-strip">
              <div className="ex-num">01</div>
              <div className="ex-icon">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <div className="ex-body">
                <div className="ex-title">Pitch to Investors</div>
                <div className="ex-desc">
                  Present your startup ideas directly to active investors and secure funding opportunities for your venture.
                </div>
              </div>
              <div className="ex-arrow">&#8250;</div>
            </div>
            <div className="ex-strip">
              <div className="ex-num">02</div>
              <div className="ex-icon">
                <i className="fa-solid fa-eye"></i>
              </div>
              <div className="ex-body">
                <div className="ex-title">Showcase Your Work</div>
                <div className="ex-desc">
                  Display your innovations, ideas and products to a national audience of industry leaders and peers.
                </div>
              </div>
              <div className="ex-arrow">&#8250;</div>
            </div>
            <div className="ex-strip">
              <div className="ex-num">03</div>
              <div className="ex-icon">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <div className="ex-body">
                <div className="ex-title">Build Connections</div>
                <div className="ex-desc">
                  Network with founders, mentors, investors and industry leaders who can accelerate your journey.
                </div>
              </div>
              <div className="ex-arrow">&#8250;</div>
            </div>
            <div className="ex-strip">
              <div className="ex-num">04</div>
              <div className="ex-icon">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <div className="ex-body">
                <div className="ex-title">Learn from Experts</div>
                <div className="ex-desc">
                  Gain actionable insights from seasoned entrepreneurs, innovators and domain specialists.
                </div>
              </div>
              <div className="ex-arrow">&#8250;</div>
            </div>
            <div className="ex-strip">
              <div className="ex-num">05</div>
              <div className="ex-icon">
                <i className="fa-solid fa-globe"></i>
              </div>
              <div className="ex-body">
                <div className="ex-title">Global Opportunities</div>
                <div className="ex-desc">
                  Explore international startup pathways, global accelerator programs and cross-border partnerships.
                </div>
              </div>
              <div className="ex-arrow">&#8250;</div>
            </div>
            <div className="ex-strip">
              <div className="ex-num">06</div>
              <div className="ex-icon">
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div className="ex-body">
                <div className="ex-title">Win Big</div>
                <div className="ex-desc">
                  Compete for cash prizes, trophies, certificates, mentorship slots and incubation opportunities.
                </div>
              </div>
              <div className="ex-arrow">&#8250;</div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL EVENT HIGHLIGHTS */}
      <section style={{ padding: "80px 0", background: "var(--surface)" }}>
        <div className="container">
          <h2 className="section-title anim-el fade-up" style={{ marginBottom: "48px", textAlign: "center" }}>
            FINAL EVENT HIGHLIGHTS
          </h2>
          <div className="tag-cloud anim-el blur-in del-1">
            <div className="tag-float lg">
              <i className="fa-solid fa-microphone-lines"></i> Final Pitching Competition
            </div>
            <div className="tag-float outline">
              <i className="fa-solid fa-sack-dollar"></i> Investor Panel
            </div>
            <div className="tag-float">
              <i className="fa-solid fa-user-astronaut"></i> Student Founder Panel
            </div>
            <div className="tag-float outline lg">
              <i className="fa-solid fa-venus"></i> Women Entrepreneur Panel
            </div>
            <div className="tag-float sm">
              <i className="fa-solid fa-rocket"></i> Startup Opportunities
            </div>
            <div className="tag-float">
              <i className="fa-solid fa-people-arrows"></i> Networking Hall
            </div>
            <div className="tag-float outline sm">
              <i className="fa-solid fa-chalkboard-user"></i> Mentorship Sessions
            </div>
            <div className="tag-float lg">
              <i className="fa-solid fa-shop"></i> Startup Expo
            </div>
            <div className="tag-float outline">
              <i className="fa-solid fa-award"></i> Prize Distribution
            </div>
            <div className="tag-float">
              <i className="fa-solid fa-users"></i> Ugham Community Launch
            </div>
          </div>
        </div>
      </section>

      {/* WHO SHOULD ATTEND */}
      <section style={{ padding: "80px 0" }}>
        <div className="container">
          <h2 className="section-title anim-el fade-up" style={{ marginBottom: "48px", textAlign: "center" }}>
            WHO SHOULD ATTEND
          </h2>
          <div className="network-wrap anim-el scale-up del-1">
            <div className="network-node">
              <div className="network-bubble">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <h4>
                Startups &amp;
                <br />
                Entrepreneurs
              </h4>
            </div>
            <div className="network-node">
              <div className="network-bubble">
                <i className="fa-solid fa-user-graduate"></i>
              </div>
              <h4>
                Students &amp;
                <br />
                Innovators
              </h4>
            </div>
            <div className="network-node">
              <div className="network-bubble">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <h4>Investors</h4>
            </div>
            <div className="network-node">
              <div className="network-bubble">
                <i className="fa-solid fa-building"></i>
              </div>
              <h4>Corporates</h4>
            </div>
            <div className="network-node">
              <div className="network-bubble">
                <i className="fa-solid fa-cubes"></i>
              </div>
              <h4>Incubators</h4>
            </div>
            <div className="network-node">
              <div className="network-bubble">
                <i className="fa-solid fa-landmark"></i>
              </div>
              <h4>
                Government
                <br />
                &amp; Policy
              </h4>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION FORM SECTION */}
      <section id="register" className="relative px-4 py-24 sm:px-6 lg:py-32 overflow-hidden bg-slate-950 text-white">
        <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-blue-700 opacity-20 blur-[140px]"></div>
        <div
          className="absolute -right-20 bottom-0 h-96 w-96 rounded-full opacity-20 blur-[140px]"
          style={{ backgroundColor: "#D600A4" }}
        ></div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div
            className="mb-16 border-l-8 pl-8"
            style={{ borderImage: "linear-gradient(to bottom, #0000FF, #7B00FF, #D600A4) 1" }}
          >
            <h2 className="mt-4 text-4xl sm:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 uppercase">
              Registration.
            </h2>
            <p className="mt-4 text-slate-400 font-medium tracking-wide">Idea &amp; Prototype Pitch Entry Form</p>
          </div>

          <div className="mb-12 grid gap-6 md:grid-cols-2">
            <div
              className={`group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 cursor-pointer ${
                category === "Ideathon"
                  ? "border-purple-500 bg-slate-900 shadow-[0_0_30px_rgba(123,0,255,0.2)]"
                  : "border-slate-800 bg-slate-900/50"
              }`}
              onClick={() => setCategory("Ideathon")}
            >
              <span className="inline-block rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Category 01
              </span>
              <h3 className="mt-4 text-2xl font-black uppercase tracking-tighter text-white">Idea Pitch</h3>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">₹249</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">/ Per Member</span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-400 italic">Using Referral Code Makes It ₹199</p>
            </div>

            <div
              className={`group relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 cursor-pointer ${
                category === "Project Pitch"
                  ? "border-purple-500 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 shadow-[0_0_35px_rgba(214,0,164,0.25)]"
                  : "border-slate-800 bg-slate-900/50"
              }`}
              onClick={() => setCategory("Project Pitch")}
            >
              <span className="inline-block rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Category 02
              </span>
              <h3 className="mt-4 text-2xl font-black uppercase tracking-tighter text-white">Prototype Pitch</h3>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  ₹299
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">/ Per Member</span>
              </div>
              <p className="mt-2 text-xs font-medium text-slate-300 italic">Using Referral Code Makes It ₹249</p>
            </div>
          </div>

          <form className="rounded-[2rem] border border-slate-800 bg-slate-900/40 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
            <div className="grid gap-16 lg:grid-cols-2">
              <div className="space-y-12">
                <section className="space-y-10">
                  <h3 className="text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 border-b border-slate-800 pb-4">
                    01. Team Identity
                  </h3>

                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="relative group sm:col-span-2">
                      <input
                        type="text"
                        name="college"
                        required
                        className="peer w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-white"
                        placeholder="College / Institution Name"
                      />
                    </div>

                    <div className="relative group sm:col-span-2">
                      <input
                        type="text"
                        name="teamName"
                        required
                        className="peer w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-white font-bold"
                        placeholder="Team Name"
                      />
                    </div>

                    <div className="relative group">
                      <input
                        type="text"
                        name="leaderName"
                        required
                        className="peer w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-white"
                        placeholder="Leader Full Name"
                      />
                    </div>

                    <div className="relative group">
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="peer w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-white"
                        placeholder="WhatsApp Number"
                      />
                    </div>

                    <div className="relative group sm:col-span-2">
                      <input
                        type="email"
                        name="email"
                        required
                        className="peer w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-white"
                        placeholder="Email Address"
                      />
                    </div>

                    <div className="relative group">
                      <input
                        type="text"
                        name="dept"
                        required
                        className="peer w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-white"
                        placeholder="Department / Course"
                      />
                    </div>

                    <div className="relative group">
                      <select
                        name="teamSize"
                        value={teamSize}
                        onChange={(e) => setTeamSize(parseInt(e.target.value))}
                        className="w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-sm font-black text-white"
                      >
                        <option value="2" className="bg-slate-900 text-white">2 Members</option>
                        <option value="3" className="bg-slate-900 text-white">3 Members</option>
                        <option value="4" className="bg-slate-900 text-white">4 Members</option>
                        <option value="5" className="bg-slate-900 text-white">5 Members</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Additional members based on team size */}
                {teamSize > 1 && (
                  <section className="space-y-6">
                    {Array.from({ length: teamSize - 1 }).map((_, i) => {
                      const memberNum = i + 2;
                      return (
                        <div
                          key={memberNum}
                          className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4"
                        >
                          <h4 className="text-xs font-black uppercase text-purple-400">
                            Member {memberNum} Details
                          </h4>
                          <div className="grid gap-4 sm:grid-cols-3">
                            <input
                              type="text"
                              name={`member_${memberNum}_name`}
                              placeholder="Name"
                              required
                              className="bg-transparent border-b border-slate-700 py-2 outline-none focus:border-purple-500 text-white text-sm"
                            />
                            <input
                              type="tel"
                              name={`member_${memberNum}_phone`}
                              placeholder="Phone"
                              required
                              className="bg-transparent border-b border-slate-700 py-2 outline-none focus:border-purple-500 text-white text-sm"
                            />
                            <input
                              type="email"
                              name={`member_${memberNum}_email`}
                              placeholder="Email"
                              required
                              className="bg-transparent border-b border-slate-700 py-2 outline-none focus:border-purple-500 text-white text-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </section>
                )}
              </div>

              <div className="space-y-12">
                <section className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 border-b border-slate-800 pb-4">
                    02. Project Details
                  </h3>

                  <div className="grid gap-8">
                    <div className="relative group">
                      <input
                        type="text"
                        name="projectTitle"
                        required
                        className="peer w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-white"
                        placeholder="Title of Idea / Project"
                      />
                    </div>

                    <div className="relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                        Select Domain
                      </label>
                      <div
                        className="flex items-center justify-between border-b-2 border-slate-700 focus-within:border-purple-500 py-2 cursor-pointer"
                        onClick={() => setShowDomainOverlay(!showDomainOverlay)}
                      >
                        <span className="text-sm font-bold text-white">
                          {domain || "Choose Domain"}
                        </span>
                        <i className="fa-solid fa-chevron-down text-slate-400"></i>
                      </div>
                      {showDomainOverlay && (
                        <div className="absolute z-50 mt-2 w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto max-h-64">
                          {domains.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => {
                                setDomain(d);
                                setShowDomainOverlay(false);
                              }}
                              className="text-[10px] font-bold p-2 border border-slate-800 hover:border-purple-500 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 text-slate-300 hover:text-white rounded-lg transition-all uppercase text-left"
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value)}
                        className="peer w-full bg-transparent border-b-2 border-slate-700 py-3 outline-none focus:border-purple-500 transition-all text-white"
                        placeholder="Referral Code (Optional)"
                      />
                    </div>
                  </div>
                </section>

                <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-purple-950 p-8 rounded-[1.5rem] border border-purple-500/30 shadow-2xl text-white">
                  <div className="flex justify-between items-center border-b border-white/10 pb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Checkout</p>
                      <p className="text-xs text-slate-300 mt-1 italic">
                        ₹{effectivePrice} x {teamSize} members
                      </p>
                    </div>
                    <p className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                      ₹{totalAmount}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={isProcessing}
                    className="mt-8 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-5 rounded-xl font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(123,0,255,0.3)]"
                  >
                    {isProcessing ? "Processing..." : "Pay & Register"}
                  </button>

                  {isSuccess && (
                    <div className="mt-4 p-4 bg-green-500/20 border border-green-500/40 rounded-xl text-center text-green-300 font-bold text-sm">
                      <i className="fa-solid fa-circle-check mr-2"></i> Registration received! Ready for payment gateway.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* CONTACT CTA STRIP */}
      <div
        className="cta-contact-strip"
        style={{
          background: "var(--grad)",
          padding: "60px 0",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h3
            style={{
              color: "white",
              fontSize: "clamp(24px,4vw,36px)",
              fontWeight: 900,
              marginBottom: "16px",
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Have Questions About the Innovation Awards?
          </h3>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "18px", marginBottom: "30px" }}>
            We are here to help. Get in touch with our team today.
          </p>
          <Link
            href="/contact"
            className="btn-primary"
            style={{
              background: "white",
              color: "var(--primary)",
              fontWeight: 800,
              padding: "18px 40px",
              fontSize: "16px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            Contact Us &#8250;
          </Link>
        </div>
      </div>
    </>
  );
}
