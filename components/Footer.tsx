import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "var(--bg)", padding: "20px 0 30px", position: "relative" }}>
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="grid-4" style={{ marginBottom: "40px" }}>
          <div>
            <Link href="/" style={{ display: "inline-block", textDecoration: "none" }}>
              <img
                src="/assets/img/logo.png"
                alt="Ugham"
                style={{ height: "80px", marginBottom: "16px", objectFit: "contain" }}
              />
            </Link>
            <p style={{ color: "var(--muted)", fontSize: "14px" }}>
              Where Evolution Starts.
              <br />
              Learn. Build. Grow.
            </p>
          </div>
          <div>
            <h4
              style={{
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "20px",
              }}
            >
              Explore
            </h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "14px" }}>
              <li>
                <Link href="/about" style={{ color: "var(--text)", textDecoration: "none", fontSize: "15px", fontWeight: 500 }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/events-hub" style={{ color: "var(--text)", textDecoration: "none", fontSize: "15px", fontWeight: 500 }}>
                  Events Hub
                </Link>
              </li>
              <li>
                <Link href="/collaboration" style={{ color: "var(--text)", textDecoration: "none", fontSize: "15px", fontWeight: 500 }}>
                  Collaboration
                </Link>
              </li>
              <li>
                <Link href="/awards" style={{ color: "var(--text)", textDecoration: "none", fontSize: "15px", fontWeight: 500 }}>
                  Awards
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4
              style={{
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "20px",
              }}
            >
              Contact
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                color: "var(--muted)",
                fontSize: "15px",
              }}
            >
              <li>info@ugham.com</li>
              <li>+91 86678 39838</li>
              <li>www.ugham.com</li>
            </ul>
          </div>
          <div>
            <h4
              style={{
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontSize: "13px",
                color: "var(--muted)",
                marginBottom: "20px",
              }}
            >
              Get Started
            </h4>
            <Link href="/contact" className="btn-primary" style={{ padding: "14px 28px", fontSize: "14px" }}>
              Connect With Us
            </Link>
          </div>
        </div>
        <div style={{ paddingTop: "20px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
          <p>&copy; 2026 Ugham Innovation Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
