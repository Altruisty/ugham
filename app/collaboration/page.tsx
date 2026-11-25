import Link from "next/link";
import NeuralCanvas from "@/components/NeuralCanvas";

export default function CollaborationPage() {
  return (
    <>
      <NeuralCanvas />

      {/* HERO */}
      <section className="split-hero">
        <div className="split-hero-container">
          <div className="split-hero-left">
            <h1 className="split-hero-title anim-el slide-right">
              Partner With <span className="highlight">Us.</span>
              <br />
              Grow <span className="highlight">Together.</span>
            </h1>
            <p className="split-hero-desc anim-el slide-right del-1">
              At Ugham, innovation grows through collaboration. We partner with colleges, investors, and mentors to foster a rich ecosystem.
            </p>
            <div className="split-hero-buttons anim-el slide-right del-2">
              <a href="#mentor" className="btn-primary-solid">
                Join with Us &rarr;
              </a>
              <Link href="/contact" className="btn-secondary-outline">
                Partner With Us
              </Link>
            </div>
          </div>
          <div className="split-hero-right anim-el scale-up del-1">
            <div className="split-hero-image-wrapper">
              <img src="/assets/img/hero_handshake.png" alt="Hero Graphic" />
              <div className="floating-badge badge-1">
                <i className="fa-solid fa-handshake-angle"></i> PARTNER
              </div>
              <div className="floating-badge badge-2">
                <i className="fa-solid fa-building-columns"></i> INSTITUTE
              </div>
              <div className="floating-badge badge-3">
                <i className="fa-solid fa-industry"></i> INDUSTRY
              </div>
              <div className="floating-badge badge-4">
                <i className="fa-solid fa-seedling"></i> INCUBATE
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

      {/* WHO CAN COLLABORATE */}
      <div className="section-flow" style={{ padding: "80px 0", position: "relative" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="text-center anim-el fade-up" style={{ marginBottom: "48px" }}>
            <h2 className="section-title">WHO CAN COLLABORATE</h2>
          </div>
          <div className="holo-grid anim-el blur-in del-1">
            <div className="holo-card">
              <div className="holo-icon">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <h4>Educational Institutions</h4>
              <p>Integrate innovation programs into your academic ecosystem</p>
            </div>
            <div className="holo-card">
              <div className="holo-icon">
                <i className="fa-solid fa-industry"></i>
              </div>
              <h4>Industry Partners</h4>
              <p>Connect with fresh talent and innovative student solutions</p>
            </div>
            <div className="holo-card">
              <div className="holo-icon">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <h4>Incubation Centers</h4>
              <p>Provide spaces and mentorship for emerging startups</p>
            </div>
            <div className="holo-card">
              <div className="holo-icon">
                <i className="fa-solid fa-landmark"></i>
              </div>
              <h4>Government Bodies</h4>
              <p>Enable policy support and startup ecosystem development</p>
            </div>
            <div className="holo-card">
              <div className="holo-icon">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <h4>Investors</h4>
              <p>Discover and fund promising student led ventures early</p>
            </div>
            <div className="holo-card">
              <div className="holo-icon">
                <i className="fa-solid fa-chalkboard-user"></i>
              </div>
              <h4>Mentors</h4>
              <p>Guide the next generation with your domain expertise</p>
            </div>
          </div>
        </div>
      </div>

      {/* COLLABORATION PHOTOS */}
      <div className="container anim-el slide-fade-up" style={{ padding: "50px 0" }}>
        <div className="grid-2" style={{ alignItems: "center", gap: "40px" }}>
          <div className="photo-glass-frame">
            <img src="/assets/img/collab-1.jpg" alt="Ugham Collaboration Partners" />
            <div className="photo-caption">Strategic Partnership at Amrita University</div>
          </div>
          <div className="photo-glass-frame">
            <img src="/assets/img/workshop-2.jpg" alt="Ugham Workshop Session" />
            <div className="photo-caption">Mentorship Driven Workshop Session</div>
          </div>
        </div>
      </div>

      {/* OUR PARTNERSHIP OPPORTUNITIES (Sliding Glass Strips) */}
      <div id="mentor" className="section-flow" style={{ padding: "80px 0", position: "relative" }}>
        <div className="container" style={{ position: "relative", zIndex: 1, maxWidth: "900px" }}>
          <h2 className="section-title anim-el slide-fade-up" style={{ marginBottom: "50px" }}>
            OUR PARTNERSHIP OPPORTUNITIES
          </h2>
          <div className="glass-strip-container anim-el slide-fade-up del-1">
            <div className="glass-strip">
              <div className="strip-icon">
                <i className="fa-solid fa-industry"></i>
              </div>
              <div className="strip-content">
                <div className="strip-header">
                  <h4 className="strip-title">Industry Partners</h4>
                </div>
                <div className="strip-desc">
                  Support innovation through cutting-edge technology, expert mentorship, and practical internships.
                </div>
              </div>
              <div className="strip-separator"></div>
            </div>
            <div className="glass-strip">
              <div className="strip-icon">
                <i className="fa-solid fa-building"></i>
              </div>
              <div className="strip-content">
                <div className="strip-header">
                  <h4 className="strip-title">Incubation Partners</h4>
                </div>
                <div className="strip-desc">
                  Provide physical incubation spaces, dedicated mentorship, and rapid scaling support.
                </div>
              </div>
              <div className="strip-separator"></div>
            </div>
            <div className="glass-strip">
              <div className="strip-icon">
                <i className="fa-solid fa-earth-americas"></i>
              </div>
              <div className="strip-content">
                <div className="strip-header">
                  <h4 className="strip-title">Ecosystem Partners</h4>
                </div>
                <div className="strip-desc">
                  Enable awareness, navigate policy guidance, and bolster overall startup ecosystem support.
                </div>
              </div>
              <div className="strip-separator"></div>
            </div>
            <div className="glass-strip">
              <div className="strip-icon">
                <i className="fa-solid fa-sack-dollar"></i>
              </div>
              <div className="strip-content">
                <div className="strip-header">
                  <h4 className="strip-title">Investment Partners</h4>
                </div>
                <div className="strip-desc">
                  Discover, evaluate, and invest in high-potential student startups and disruptive products.
                </div>
              </div>
              <div className="strip-separator"></div>
            </div>
            <div className="glass-strip">
              <div className="strip-icon">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div className="strip-content">
                <div className="strip-header">
                  <h4 className="strip-title">Mentor Partners</h4>
                </div>
                <div className="strip-desc">
                  Guide the next generation of ambitious innovators with specialized domain expertise.
                </div>
              </div>
              <div className="strip-separator"></div>
            </div>
          </div>
        </div>
      </div>

      {/* GET STARTED (Separate Islands) */}
      <div className="section-flow" style={{ padding: "80px 0 60px", textAlign: "center", position: "relative" }}>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <h2 className="section-title anim-el slide-fade-up" style={{ marginBottom: "48px" }}>
            GET STARTED
          </h2>
          <div className="collab-islands anim-el blur-in del-1">
            <div className="collab-island">
              <div className="ci-icon">
                <i className="fa-solid fa-building-columns"></i>
              </div>
              <h4>Partner as Institution</h4>
              <p>Bring Ugham innovation programs to your campus and empower your students</p>
            </div>
            <div className="collab-island">
              <div className="ci-icon">
                <i className="fa-solid fa-industry"></i>
              </div>
              <h4>Partner as Industry</h4>
              <p>Access fresh talent, sponsor innovation challenges, and co-create solutions</p>
            </div>
            <div className="collab-island">
              <div className="ci-icon">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <h4>Join as Mentor or Investor</h4>
              <p>Share your expertise or discover promising ventures to support early</p>
            </div>
            <div className="collab-island">
              <div className="ci-icon">
                <i className="fa-solid fa-handshake"></i>
              </div>
              <h4>Collaborate on Programs</h4>
              <p>Host workshops, hackathons, and startup initiatives together with Ugham</p>
            </div>
          </div>
        </div>
      </div>

      {/* PARTNER ECOSYSTEM SECTION */}
      <div className="ecosystem-section" style={{ padding: "80px 0 0", position: "relative" }}>
        <div className="container">
          <div className="ecosystem-header text-center" style={{ marginBottom: "60px" }}>
            <h2
              className="section-title partner-title-glow"
              style={{ fontSize: "clamp(32px, 5vw, 48px)", marginBottom: "20px" }}
            >
              OUR PARTNERS
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "18px", maxWidth: "600px", margin: "0 auto" }}>
              Powered by a network of visionary industry leaders, mentors, and partners driving the next generation of innovators.
            </p>
          </div>
        </div>

        <div className="partner-marquee-container">
          {/* Knowledge Partners Track */}
          <div className="partner-track-wrapper">
            <div className="track-badge">
              <i className="fa-solid fa-graduation-cap"></i> Knowledge Partners
            </div>
            <div className="marquee-content scroll-left">
              <div className="marquee-group">
                <div className="partner-logo-box"><img src="/assets/img/partner-shortfundly.png" alt="Shortfundly" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-haris.png" alt="Hari's Media" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-afop.png" alt="AFOP Crafting Lives" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-shortfundly.png" alt="Shortfundly" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-haris.png" alt="Hari's Media" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-afop.png" alt="AFOP Crafting Lives" /></div>
              </div>
              <div className="marquee-group">
                <div className="partner-logo-box"><img src="/assets/img/partner-shortfundly.png" alt="Shortfundly" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-haris.png" alt="Hari's Media" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-afop.png" alt="AFOP Crafting Lives" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-shortfundly.png" alt="Shortfundly" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-haris.png" alt="Hari's Media" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-afop.png" alt="AFOP Crafting Lives" /></div>
              </div>
            </div>
          </div>

          {/* Industry Partners Track */}
          <div className="partner-track-wrapper">
            <div className="track-badge" style={{ alignSelf: "flex-end", marginLeft: 0, marginRight: "5%" }}>
              <i className="fa-solid fa-building"></i> Industry Partners
            </div>
            <div className="marquee-content scroll-right">
              <div className="marquee-group">
                <div className="partner-logo-box"><img src="/assets/img/partner-yaalee.png" alt="Yaalee Biotech" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-dechta.png" alt="Dechta" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-campusx.png" alt="CampusX" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-altruisty.png" alt="Altruisty Innovation" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-seclance.png" alt="Sec Lance" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-yaalee.png" alt="Yaalee Biotech" /></div>
              </div>
              <div className="marquee-group">
                <div className="partner-logo-box"><img src="/assets/img/partner-yaalee.png" alt="Yaalee Biotech" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-dechta.png" alt="Dechta" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-campusx.png" alt="CampusX" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-altruisty.png" alt="Altruisty Innovation" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-seclance.png" alt="Sec Lance" /></div>
                <div className="partner-logo-box"><img src="/assets/img/partner-yaalee.png" alt="Yaalee Biotech" /></div>
              </div>
            </div>
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
            Interested in Partnering With Us?
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
