import Link from "next/link";
import OrbitCanvas from "@/components/OrbitCanvas";
import BentoTilt from "@/components/BentoTilt";
import HowUghamWorks from "@/components/HowUghamWorks";

export default function HomePage() {
  return (
    <>
      <BentoTilt />

      {/* HERO */}
      <section className="split-hero">
        <div className="split-hero-container">
          <div className="split-hero-left">
            <h1 className="split-hero-title anim-el slide-right">
              Empowering <span className="highlight">Innovators.</span>
              <br />
              Building <span className="highlight">Impactful</span> Solutions.
            </h1>
            <p className="split-hero-desc anim-el slide-right del-1">
              UGHAM is an innovation platform that fuels creativity, supports problem solvers, and creates real-world impact.
            </p>
            <div className="split-hero-buttons anim-el slide-right del-2">
              <Link href="/events-hub" className="btn-primary-solid">
                Explore Events Hub &rarr;
              </Link>
              <Link href="/collaboration" className="btn-secondary-outline">
                Collaborate With Us
              </Link>
            </div>
          </div>
          <div className="split-hero-right anim-el scale-up del-1">
            <div className="split-hero-image-wrapper">
              <img src="/assets/img/hero_lightbulb.png" alt="Hero Graphic" />
              <div className="floating-badge badge-1">
                <i className="fa-solid fa-rocket"></i> INNOVATION
              </div>
              <div className="floating-badge badge-2">
                <i className="fa-solid fa-lightbulb"></i> IDEATION
              </div>
              <div className="floating-badge badge-3">
                <i className="fa-solid fa-users"></i> COMMUNITY
              </div>
              <div className="floating-badge badge-4">
                <i className="fa-solid fa-chart-line"></i> GROWTH
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

      {/* WHY US */}
      <section style={{ padding: "100px 0", background: "rgba(255,255,255,0.4)", position: "relative", overflow: "hidden" }}>
        <div className="container text-center">
          <h2 className="section-title anim-el fade-up">WHY US</h2>
          <p
            className="anim-el fade-up del-1"
            style={{
              fontSize: "17px",
              color: "var(--muted)",
              margin: "0 auto 60px",
              lineHeight: 1.9,
              maxWidth: "800px",
            }}
          >
            Most ideas never move beyond imagination. Ugham bridges that gap by providing the right ecosystem with mentorship, resources, and opportunities to turn ideas into impactful innovations.
          </p>

          <div className="orbit-center-layout anim-el scale-in del-2">
            <div className="orbit-side side-left">
              <div className="side-item anim-el slide-right del-3">
                <i className="fa-solid fa-graduation-cap"></i>
                <p>Expert Mentorship</p>
              </div>
              <div className="side-item anim-el slide-right del-4">
                <i className="fa-solid fa-rocket"></i>
                <p>Rapid Prototyping</p>
              </div>
            </div>
            <div className="orbit-center-wrapper orbit-enhanced">
              <div className="orbit-ring orbit-ring-1"></div>
              <div className="orbit-ring orbit-ring-2"></div>
              <div className="orbit-ring orbit-ring-3"></div>
              <div className="orbit-pip pip-1"></div>
              <div className="orbit-pip pip-2"></div>
              <div className="orbit-pip pip-3"></div>
              <div className="orbit-pip pip-4"></div>
              <div className="orbit-pip pip-5"></div>
              <div className="orbit-pip pip-6"></div>
              <OrbitCanvas />
            </div>
            <div className="orbit-side side-right">
              <div className="side-item anim-el slide-left del-3">
                <i className="fa-solid fa-sack-dollar"></i>
                <p>Investment Access</p>
              </div>
              <div className="side-item anim-el slide-left del-4">
                <i className="fa-solid fa-network-wired"></i>
                <p>Global Ecosystem</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE EXPERTISE */}
      <section style={{ padding: "100px 0" }}>
        <div className="container">
          <div className="text-center anim-el fade-up" style={{ marginBottom: "60px" }}>
            <h2 className="section-title">OUR CORE EXPERTISE</h2>
          </div>
          <div className="grid-4">
            <div className="expertise-v2 anim-el flip-in-y del-1">
              <div className="ev2-icon">
                <i className="fa-solid fa-graduation-cap"></i>
              </div>
              <h4>Education Empowerment</h4>
              <p>Developing problem-solving and innovation mindset</p>
            </div>
            <div className="expertise-v2 anim-el flip-in-y del-2">
              <div className="ev2-icon">
                <i className="fa-solid fa-lightbulb"></i>
              </div>
              <h4>Innovation Enabling</h4>
              <p>Supporting idea validation and structured execution</p>
            </div>
            <div className="expertise-v2 anim-el flip-in-y del-3">
              <div className="ev2-icon">
                <i className="fa-solid fa-hammer"></i>
              </div>
              <h4>Product Building</h4>
              <p>Turning concepts into functional real-world solutions</p>
            </div>
            <div className="expertise-v2 anim-el flip-in-y del-4">
              <div className="ev2-icon">
                <i className="fa-solid fa-rocket"></i>
              </div>
              <h4>Venture Creation</h4>
              <p>Helping ideas grow into scalable ventures</p>
            </div>
          </div>
        </div>
      </section>

      {/* KEYNOTE BANNER */}
      <div className="anim-el fade-up" style={{ position: "relative", zIndex: 1 }}>
        <div className="photo-hero-banner">
          <img src="/assets/img/keynote-1.jpg" alt="Ugham Keynote Session" />
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h3>Empowering Student Innovators</h3>
            <p>
              From packed auditoriums to one-on-one mentorship, Ugham creates the ecosystem where ideas transform into impactful solutions.
            </p>
            <Link href="/about" className="btn-banner">
              Discover Our Story &#8250;
            </Link>
          </div>
        </div>
      </div>

      {/* HOW UGHAM WORKS (6-Stage Connected Ecosystem) */}
      <HowUghamWorks />

      {/* TEAM BANNER */}
      <div className="anim-el scale-up" style={{ position: "relative", zIndex: 1 }}>
        <div className="section-side-anim left-anim">
          <img src="/assets/img/logo.png" alt="" style={{ width: "150px" }} />
        </div>
        <div className="section-side-anim right-anim">
          <img src="/assets/img/logo.png" alt="" style={{ width: "120px", animationDirection: "reverse", animationDuration: "25s" }} />
        </div>
        <div className="photo-hero-banner">
          <img src="/assets/img/team-1.jpg" alt="Ugham Team" />
          <div className="banner-overlay"></div>
          <div className="banner-content">
            <h3>Building the Future Together</h3>
            <p>
              A passionate community of innovators, mentors, and changemakers driving the next wave of student led ventures.
            </p>
            <Link href="/collaboration" className="btn-banner">
              Create community with us in your college &#8250;
            </Link>
          </div>
        </div>
      </div>

      {/* WHAT YOU CAN BUILD (Bento Grid) */}
      <section style={{ padding: "100px 0" }}>
        <div className="container">
          <div className="text-center anim-el fade-up" style={{ marginBottom: "48px" }}>
            <h2 className="section-title">WHAT YOU CAN BUILD</h2>
            <p style={{ color: "var(--muted)", margin: "12px auto 0", maxWidth: "600px", fontSize: "17px" }}>
              From concept to product — here&apos;s what innovators create with Ugham
            </p>
          </div>
          <div className="bento-grid anim-el blur-in del-1">
            <div className="bento-card span-2">
              <div className="bn-icon">
                <i className="fa-solid fa-box-open"></i>
              </div>
              <h4>Innovative Products</h4>
              <p>Hardware and software solutions that solve pressing real-world problems with creativity and technical depth</p>
            </div>
            <div className="bento-card span-2">
              <div className="bn-icon">
                <i className="fa-solid fa-microchip"></i>
              </div>
              <h4>Tech Driven Solutions</h4>
              <p>AI, IoT, blockchain and emerging tech applications designed to disrupt traditional industries</p>
            </div>
            <div className="bento-card">
              <div className="bn-icon">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <h4>Scalable Innovations</h4>
              <p>Solutions built for growth</p>
            </div>
            <div className="bento-card span-2">
              <div className="bn-icon">
                <i className="fa-solid fa-earth-americas"></i>
              </div>
              <h4>Real World Impact Projects</h4>
              <p>Community-focused initiatives addressing healthcare, education, sustainability, and social equity</p>
            </div>
            <div className="bento-card">
              <div className="bn-icon">
                <i className="fa-solid fa-flask-vial"></i>
              </div>
              <h4>Research Projects</h4>
              <p>Deep-dive explorations</p>
            </div>
          </div>
        </div>
      </section>

      {/* OUR IMPACT (Animated Grid) */}
      <section style={{ padding: "100px 0", background: "rgba(124,58,237,0.03)" }}>
        <div className="container">
          <div className="text-center anim-el fade-up" style={{ marginBottom: "12px" }}>
            <h2 className="section-title">OUR IMPACT</h2>
            <p style={{ color: "var(--muted)", margin: "12px auto 48px", maxWidth: "600px", fontSize: "17px" }}>
              We are building a generation of creators, thinkers, and innovators.
            </p>
          </div>
          <div className="flow-steps anim-el blur-in del-1" style={{ maxWidth: "600px" }}>
            <div className="flow-step">
              <div className="flow-dot">
                <i className="fa-solid fa-brain" style={{ fontSize: "18px" }}></i>
              </div>
              <div className="flow-body">
                <h4>Beyond Theory</h4>
                <p>Empowering students to think beyond textbooks and apply knowledge to real challenges</p>
              </div>
            </div>
            <div className="flow-step" style={{ flexDirection: "row-reverse" }}>
              <div className="flow-dot">
                <i className="fa-solid fa-puzzle-piece" style={{ fontSize: "18px" }}></i>
              </div>
              <div className="flow-body" style={{ textAlign: "right" }}>
                <h4>Problem Solving</h4>
                <p>Enabling real-world problem solving through structured innovation frameworks</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-dot">
                <i className="fa-solid fa-map-location-dot" style={{ fontSize: "18px" }}></i>
              </div>
              <div className="flow-body">
                <h4>Idea to Execution</h4>
                <p>Supporting the journey from idea to execution of left over projects in events</p>
              </div>
            </div>
            <div className="flow-step" style={{ flexDirection: "row-reverse" }}>
              <div className="flow-dot">
                <i className="fa-solid fa-seedling" style={{ fontSize: "18px" }}></i>
              </div>
              <div className="flow-body" style={{ textAlign: "right" }}>
                <h4>Growth Catalyst</h4>
                <p>Creating opportunities for sustained growth and innovation in every student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* UGHAM INNOVATION CLUB (Kanban Board) */}
      <section style={{ padding: "100px 0" }}>
        <div className="container">
          <div className="text-center anim-el fade-up" style={{ marginBottom: "48px" }}>
            <h2 className="section-title">UGHAM INNOVATION CLUB</h2>
            <p style={{ color: "var(--muted)", margin: "12px auto 0", fontSize: "17px" }}>
              What happens inside the innovation club that powers student success
            </p>
          </div>
          <div className="kanban-board anim-el blur-in del-1">
            <div className="kanban-col">
              <div className="kc-header">Activities</div>
              <div className="kanban-card purple">
                <h4>Innovation Competitions</h4>
                <p>Programs and challenges that push boundaries and reward creative thinking</p>
              </div>
              <div className="kanban-card magenta">
                <h4>Hands On Workshops</h4>
                <p>Masterclasses and practical sessions led by industry experts</p>
              </div>
            </div>
            <div className="kanban-col">
              <div className="kc-header">Growth</div>
              <div className="kanban-card blue">
                <h4>Development Tracks</h4>
                <p>Mentorship driven development paths tailored to individual goals</p>
              </div>
              <div className="kanban-card teal">
                <h4>Ecosystem Connections</h4>
                <p>Connect with incubation centers, mentors, and active investors</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW YOU CAN GET STARTED (Flowchart) */}
      <section style={{ padding: "100px 0", background: "rgba(124,58,237,0.03)" }}>
        <div className="container">
          <div className="text-center anim-el fade-up" style={{ marginBottom: "48px" }}>
            <h2 className="section-title">HOW YOU CAN GET STARTED</h2>
            <p style={{ color: "var(--muted)", margin: "12px auto 0", maxWidth: "600px", fontSize: "17px" }}>
              Your innovation journey in four steps
            </p>
          </div>
          <div className="flow-steps anim-el blur-in del-1">
            <div className="flow-step">
              <div className="flow-dot">1</div>
              <div className="flow-body">
                <h4>Start the Club</h4>
                <p>Launch Ugham Innovation Club in your college and rally fellow innovators to join the movement</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-dot">2</div>
              <div className="flow-body">
                <h4>Share Your Idea</h4>
                <p>Present your concept, pitch your vision, or express interest in club activities and programs</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-dot">3</div>
              <div className="flow-body">
                <h4>Collaborate &amp; Learn</h4>
                <p>Work with mentors, peers, and industry experts to refine and validate your innovation</p>
              </div>
            </div>
            <div className="flow-step">
              <div className="flow-dot">4</div>
              <div className="flow-body">
                <h4>Build Your Innovation</h4>
                <p>Start building, iterating, and scaling your innovation into a real-world solution</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
            Ready to Start Your Innovation Journey?
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
