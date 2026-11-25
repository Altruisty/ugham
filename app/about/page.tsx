import Link from "next/link";
import DnaCanvas from "@/components/DnaCanvas";

export default function AboutPage() {
  return (
    <>
      <DnaCanvas />

      {/* HERO */}
      <section className="split-hero">
        <div className="split-hero-container">
          <div className="split-hero-left">
            <h1 className="split-hero-title anim-el slide-right">
              Who We Are.
              <br />
              Driving <span className="highlight">Evolution</span> Together.
            </h1>
            <p className="split-hero-desc anim-el slide-right del-1">
              We are a platform where creativity meets execution. Our mission is to bridge the gap between academia and industry.
            </p>
            <div className="split-hero-buttons anim-el slide-right del-2">
              <a href="#mission" className="btn-primary-solid">
                Our Mission &rarr;
              </a>
              <a href="#team" className="btn-secondary-outline">
                Meet the Team
              </a>
            </div>
          </div>
          <div className="split-hero-right anim-el scale-up del-1">
            <div className="split-hero-image-wrapper">
              <img src="/assets/img/hero_brain.png" alt="Hero Graphic" />
              <div className="floating-badge badge-1">
                <i className="fa-solid fa-bullseye"></i> MISSION
              </div>
              <div className="floating-badge badge-2">
                <i className="fa-solid fa-eye"></i> VISION
              </div>
              <div className="floating-badge badge-3">
                <i className="fa-solid fa-heart"></i> VALUES
              </div>
              <div className="floating-badge badge-4">
                <i className="fa-solid fa-handshake"></i> TRUST
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

      {/* STATS */}
      <div className="section-flow" style={{ padding: "40px 0 80px" }}>
        <div className="container">
          <div className="stat-grid anim-el scale-up del-2" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <div className="stat-block">
              <div className="stat-number">100+</div>
              <div className="stat-label">Innovations Target</div>
            </div>
            <div className="stat-block">
              <div className="stat-number">2030</div>
              <div className="stat-label">Mission Year</div>
            </div>
            <div className="stat-block">
              <div className="stat-number">&infin;</div>
              <div className="stat-label">Student Potential</div>
            </div>
            <div className="stat-block">
              <div className="stat-number">1&deg;</div>
              <div className="stat-label">Step at a Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* VISION & MISSION */}
      <div id="mission" className="section-flow" style={{ padding: "80px 0", position: "relative" }}>
        <div className="mesh-bg">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="grid-2" style={{ gap: "32px" }}>
            <div className="vm-panel vision anim-el blur-in del-1">
              <div className="vm-badge">
                <i className="fa-solid fa-eye"></i> VISION
              </div>
              <h3>Our Vision</h3>
              <div className="vm-line"></div>
              <p>To build a generation of innovators who create meaningful, scalable solutions for real-world challenges.</p>
            </div>
            <div className="vm-panel mission anim-el blur-in del-2">
              <div className="vm-badge">
                <i className="fa-solid fa-bullseye"></i> MISSION
              </div>
              <h3>Our Mission</h3>
              <div className="vm-line"></div>
              <p>
                Create 100 student led innovations by 2030 and scale them into impactful ventures by enabling students to learn, build, and grow through the right ecosystem, mentorship, and opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CINEMATIC EVENT STRIP */}
      <div className="container anim-el fade-up" style={{ padding: "40px 0" }}>
        <div className="photo-cinematic">
          <img src="/assets/img/event-1.jpg" alt="Ugham Innovation Event" />
        </div>
      </div>

      {/* WHAT WE DO */}
      <div className="section-flow" style={{ padding: "100px 0", position: "relative" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="text-center anim-el fade-up" style={{ marginBottom: "60px" }}>
            <h2 className="section-title">WHAT WE DO</h2>
          </div>
          <div className="grid-4">
            <div className="expertise-v2 anim-el flip-in-y del-1">
              <div className="ev2-icon">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <h4>Education Empowerment</h4>
              <p>Developing innovation and problem-solving skills</p>
            </div>
            <div className="expertise-v2 anim-el flip-in-y del-2">
              <div className="ev2-icon">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <h4>Innovation Enabling</h4>
              <p>Supporting idea validation and structured development</p>
            </div>
            <div className="expertise-v2 anim-el flip-in-y del-3">
              <div className="ev2-icon">
                <i className="fa-solid fa-hammer"></i>
              </div>
              <h4>Product Building</h4>
              <p>Transforming ideas into working prototypes</p>
            </div>
            <div className="expertise-v2 anim-el flip-in-y del-4">
              <div className="ev2-icon">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <h4>Venture Creation</h4>
              <p>Helping innovations evolve into scalable startups</p>
            </div>
          </div>
        </div>
      </div>

      {/* WHY CHOOSE UGHAM */}
      <div className="island-section" style={{ background: "rgba(124,58,237,0.03)" }}>
        <div className="container">
          <div className="grid-2" style={{ alignItems: "center", gap: "64px" }}>
            <div className="anim-el slide-right del-1">
              <h2 className="section-title" style={{ fontSize: "32px" }}>WHY CHOOSE UGHAM</h2>
              <p style={{ color: "var(--muted)", marginBottom: "32px", fontSize: "17px" }}>
                What sets us apart in the innovation ecosystem
              </p>
              <div className="reason-list">
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>Hands on innovation building</p>
                </div>
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>Real world problem solving</p>
                </div>
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>Access to mentors, experts and opportunities</p>
                </div>
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>Structured pathway from idea to execution</p>
                </div>
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>Focus on scalability and impact</p>
                </div>
              </div>
            </div>
            <div className="anim-el scale-up del-2">
              <div className="photo-tilt">
                <img src="/assets/img/workshop-1.jpg" alt="Ugham Workshop" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WHAT MAKES US DIFFERENT */}
      <div id="team" className="island-section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: "center", gap: "64px" }}>
            <div className="anim-el scale-up del-1">
              <div className="photo-stacked">
                <img src="/assets/img/hands-on-1.jpg" alt="Ugham Hands On" />
              </div>
            </div>
            <div className="anim-el slide-left del-2">
              <h2 className="section-title" style={{ fontSize: "32px" }}>WHAT MAKES US DIFFERENT</h2>
              <p style={{ color: "var(--muted)", marginBottom: "32px", fontSize: "17px" }}>
                We don&apos;t just guide — we build alongside you
              </p>
              <div className="reason-list">
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>We work closely with students, not just guide them</p>
                </div>
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>We emphasize execution over theory</p>
                </div>
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>We connect ideas with real opportunities</p>
                </div>
                <div className="reason-item">
                  <div className="ri-dot"></div>
                  <p>We support the full journey from idea to venture</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SPLIT SCREEN SESSION PHOTO */}
      <div className="container anim-el scale-up" style={{ padding: "40px 0 100px" }}>
        <div className="photo-split">
          <div className="split-img">
            <img src="/assets/img/session-1.jpg" alt="Ugham Session" />
          </div>
          <div className="split-text">
            <p>
              Every session, every interaction, every idea shared is a step towards building something extraordinary. Ugham is where innovation comes alive.
            </p>
          </div>
        </div>
      </div>

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
        <div
          className="cta-glow-orb"
          style={{
            position: "absolute",
            top: "-50px",
            left: "20%",
            width: "200px",
            height: "200px",
            background: "rgba(255,255,255,0.08)",
            borderRadius: "50%",
          }}
        ></div>
        <div
          className="cta-glow-orb"
          style={{
            position: "absolute",
            bottom: "-50px",
            right: "15%",
            width: "150px",
            height: "150px",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "50%",
          }}
        ></div>
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
            Ready to Learn More About Ugham?
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
