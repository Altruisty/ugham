"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showFloatBtn, setShowFloatBtn] = useState(true);
  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (formRef.current) {
        const rect = formRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          setShowFloatBtn(false);
        } else {
          setShowFloatBtn(true);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      reason: String(formData.get("reason") || "").trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit inquiry. Please try again.");
      }
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to send your inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* HERO */}
      <section className="split-hero">
        <div className="split-hero-container">
          <div className="split-hero-left">
            <h1 className="split-hero-title anim-el slide-right">
              Let&apos;s Build <span className="highlight">The Future.</span>
              <br />
              Reach <span className="highlight">Out.</span>
            </h1>
            <p className="split-hero-desc anim-el slide-right del-1">
              Have an idea, a query, or want to collaborate? Get in touch with our team today and let&apos;s make it happen.
            </p>
            <div className="split-hero-buttons anim-el slide-right del-2">
              <a href="mailto:info@ugham.com" className="btn-primary-solid">
                Email Us &rarr;
              </a>
              <a href="tel:+918667839838" className="btn-secondary-outline">
                Call Now
              </a>
            </div>
          </div>
          <div className="split-hero-right anim-el scale-up del-1">
            <div className="split-hero-image-wrapper">
              <img src="/assets/img/hero_envelope.png" alt="Hero Graphic" />
              <div className="floating-badge badge-1">
                <i className="fa-solid fa-headset"></i> SUPPORT
              </div>
              <div className="floating-badge badge-2">
                <i className="fa-solid fa-clipboard-question"></i> INQUIRIES
              </div>
              <div className="floating-badge badge-3">
                <i className="fa-solid fa-handshake"></i> PARTNERSHIPS
              </div>
              <div className="floating-badge badge-4">
                <i className="fa-solid fa-briefcase"></i> CAREERS
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

      {/* CONTACT DETAILS + JOURNEY */}
      <div className="section-flow" style={{ padding: "80px 0 100px", position: "relative" }}>
        <div className="mesh-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="grid-2" style={{ gap: "80px" }}>
            <div className="anim-el slide-left del-1">
              <h2 className="section-title" style={{ marginBottom: "32px" }}>
                GET IN TOUCH
              </h2>
              <p style={{ fontSize: "17px", color: "var(--muted)", marginBottom: "40px", lineHeight: 1.9 }}>
                Whether you are a student, institution, partner, or innovator, connect with us to start your journey with Ugham.
              </p>
              <div className="contact-glass">
                <div className="contact-info-block">
                  <div className="ci-icon">
                    <i className="fa-solid fa-envelope"></i>
                  </div>
                  <div>
                    <div className="ci-label">Email</div>
                    <div className="ci-value">info@ugham.com</div>
                  </div>
                </div>
                <div className="contact-info-block">
                  <div className="ci-icon">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <div className="ci-label">Phone</div>
                    <div className="ci-value">+91 86678 39838</div>
                  </div>
                </div>
                <div className="contact-info-block">
                  <div className="ci-icon">
                    <i className="fa-solid fa-globe"></i>
                  </div>
                  <div>
                    <div className="ci-label">Website</div>
                    <div className="ci-value">www.ugham.com</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="anim-el slide-right del-2">
              <h2 className="section-title" style={{ marginBottom: "32px" }}>
                YOUR JOURNEY
              </h2>
              <p style={{ fontSize: "18px", lineHeight: 1.8, marginBottom: "20px", color: "var(--muted)" }}>
                At Ugham, we help you turn ideas into innovations and innovations into ventures.
              </p>
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 800,
                  background: "var(--grad-text)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginBottom: "40px",
                }}
              >
                Let&apos;s learn, build, and grow together.
              </p>
              <div className="dark-glass-card">
                <h3>FOR COLLABORATIONS</h3>
                <div className="dark-glass-item">
                  <i className="fa-solid fa-building-columns"></i>
                  <p>Institutional Partnerships</p>
                </div>
                <div className="dark-glass-item">
                  <i className="fa-solid fa-industry"></i>
                  <p>Industry and Startup Collaborations</p>
                </div>
                <div className="dark-glass-item">
                  <i className="fa-solid fa-chalkboard-user"></i>
                  <p>Mentorship and Workshops</p>
                </div>
                <div className="dark-glass-item">
                  <i className="fa-solid fa-sack-dollar"></i>
                  <p>Investment and Incubation Opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REGISTRATION FORM */}
      <div
        id="registration-form"
        ref={formRef}
        className="section-flow"
        style={{ padding: "100px 0 120px", position: "relative", background: "var(--bg)" }}
      >
        <div className="mesh-bg">
          <div className="orb orb-1" style={{ background: "var(--secondary)", left: "80%", top: "20%" }}></div>
          <div className="orb orb-2" style={{ background: "var(--primary)", left: "10%", top: "70%" }}></div>
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "850px" }}>
          {/* Floating side animations */}
          <div className="floating-side-anim left-side anim-el slide-left del-2">
            <i className="fa-solid fa-rocket"></i>
          </div>
          <div className="floating-side-anim right-side anim-el slide-right del-3">
            <i className="fa-solid fa-lightbulb"></i>
          </div>

          <div
            className="contact-glass anim-el fade-up del-1"
            style={{
              padding: "60px",
              borderRadius: "32px",
              boxShadow: "0 30px 60px rgba(124,58,237,0.15)",
              border: "1px solid rgba(255,255,255,0.4)",
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h2 className="section-title text-center" style={{ marginBottom: "12px", fontSize: "36px" }}>
              Partner With Us
            </h2>
            <p
              className="text-center"
              style={{
                color: "var(--muted)",
                marginBottom: "50px",
                fontSize: "18px",
                maxWidth: "600px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Fill out the form below and our team will get back to you shortly to start your journey.
            </p>

            {!submitted ? (
              <form id="ughamContactForm" className="ugham-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>
                    <i className="fa-regular fa-user" style={{ color: "var(--primary)", marginRight: "8px" }}></i> Full Name
                  </label>
                  <input type="text" name="name" required placeholder="Enter your full name" />
                </div>

                <div className="grid-2" style={{ gap: "24px", marginBottom: 0 }}>
                  <div className="form-group">
                    <label>
                      <i className="fa-regular fa-envelope" style={{ color: "var(--primary)", marginRight: "8px" }}></i> Email Address
                    </label>
                    <input type="email" name="email" required placeholder="you@example.com" />
                  </div>
                  <div className="form-group">
                    <label>
                      <i className="fa-solid fa-phone" style={{ color: "var(--primary)", marginRight: "8px" }}></i> Phone Number
                    </label>
                    <input type="tel" name="phone" required placeholder="+91 00000 00000" />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <i className="fa-solid fa-circle-question" style={{ color: "var(--primary)", marginRight: "8px" }}></i> Why do you want to contact us?
                  </label>
                  <div className="select-wrapper">
                    <select name="reason" required defaultValue="">
                      <option value="" disabled>
                        Select an option...
                      </option>
                      <option value="Institutional Partnerships">Institutional Partnerships</option>
                      <option value="Industry and Startup Collaborations">Industry and Startup Collaborations</option>
                      <option value="Mentorship and Workshops">Mentorship and Workshops</option>
                      <option value="Investment and Incubation Opportunities">Investment and Incubation Opportunities</option>
                      <option value="Start a club in your college with us">Start a club in your college with us</option>
                      <option value="Arrange an event with us">Arrange an event with us</option>
                      <option value="Industry Partners">Industry Partners</option>
                      <option value="Incubation Partners">Incubation Partners</option>
                      <option value="Ecosystem Partners">Ecosystem Partners</option>
                      <option value="Investment Partners">Investment Partners</option>
                      <option value="Mentor Partners">Mentor Partners</option>
                    </select>
                    <i className="fa-solid fa-chevron-down select-icon"></i>
                  </div>
                </div>

                {submitError && (
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid rgba(239, 68, 68, 0.3)",
                      color: "#dc2626",
                      fontSize: "13.5px",
                      fontWeight: 700,
                    }}
                  >
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-100"
                  style={{
                    marginTop: "30px",
                    padding: "20px",
                    fontSize: "18px",
                    justifyContent: "center",
                    borderRadius: "16px",
                    width: "100%",
                  }}
                >
                  {submitting ? (
                    <>
                      <i className="fa-solid fa-circle-notch fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration <i className="fa-solid fa-paper-plane" style={{ marginLeft: "12px" }}></i>
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div
                id="formSuccess"
                style={{
                  marginTop: "30px",
                  padding: "24px",
                  background: "rgba(34,197,94,0.1)",
                  color: "#16a34a",
                  borderRadius: "16px",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "18px",
                  border: "2px solid rgba(34,197,94,0.2)",
                }}
              >
                <i className="fa-solid fa-circle-check" style={{ fontSize: "32px", display: "block", marginBottom: "12px" }}></i>
                Awesome! Your registration has been received successfully.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Register Box */}
      <a
        href="#registration-form"
        id="floatingRegisterBtn"
        className={`floating-register-btn ${showFloatBtn ? "show" : ""}`}
      >
        <span>REGISTER WITH US RIGHT NOW!</span>
        <div className="arrow-circle">
          <i className="fa-solid fa-arrow-down fa-bounce"></i>
        </div>
      </a>

      {/* ATMOSPHERIC EVENT PHOTO */}
      <div className="anim-el fade-up" style={{ position: "relative", zIndex: 1 }}>
        <div className="photo-atmosphere">
          <div className="atmo-bg" style={{ backgroundImage: "url('/assets/img/event-2.jpg')" }}></div>
          <div className="atmo-overlay"></div>
          <div className="atmo-content">
            <h2 className="section-title" style={{ marginBottom: "20px", fontSize: "36px" }}>
              INNOVATION STARTS HERE
            </h2>
            <p style={{ fontSize: "20px", maxWidth: "600px", margin: "0 auto 30px", lineHeight: 1.7 }}>
              Join a community of thinkers, builders, and changemakers. Together, we create what&apos;s next.
            </p>
            <Link href="/collaboration" className="btn-primary" style={{ background: "white", color: "var(--primary)", fontWeight: 800 }}>
              Explore Collaboration &#8250;
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
