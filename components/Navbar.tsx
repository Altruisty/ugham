"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [portalUser, setPortalUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const checkAuth = () => {
    try {
      const savedUser = sessionStorage.getItem("ugham_portal_user");
      if (savedUser) {
        setPortalUser(JSON.parse(savedUser));
      } else {
        setPortalUser(null);
      }
    } catch (e) {
      setPortalUser(null);
    }
  };

  // Re-check auth on mount, route changes, or custom auth event
  useEffect(() => {
    checkAuth();
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("ugham_auth_change", checkAuth);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("ugham_auth_change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("ugham_portal_user");
    sessionStorage.removeItem("ugham_admin_auth");
    setPortalUser(null);
    setIsOpen(false);
    window.dispatchEvent(new Event("ugham_auth_change"));
    router.push("/login");
  };

  const participantFirstName = portalUser?.name ? portalUser.name.split(" ")[0].toUpperCase() : "PORTAL";

  return (
    <nav id="navbar" className={isScrolled ? "scrolled" : ""}>
      <div className="nav-inner">
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img
            src="/assets/img/logo.png"
            alt="Ugham"
            style={{ height: "90px", objectFit: "contain", transform: "scale(1.1)" }}
          />
        </Link>

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

          {/* DYNAMIC: When logged in as participant, show MY EVENTS */}
          {portalUser && (
            <li>
              <Link
                href="/portal"
                className={pathname === "/portal" ? "active-link" : ""}
                style={{
                  color: "#7C3AED",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#10b981",
                  }}
                ></span>
                <span>MY EVENTS</span>
              </Link>
            </li>
          )}

          <li>
            <Link href="/collaboration" className={pathname === "/collaboration" ? "active-link" : ""}>
              COLLABORATION
            </Link>
          </li>
          <li>
            <Link href="/awards" className={pathname === "/awards" ? "active-link" : ""}>
              AWARDS
            </Link>
          </li>
          <li>
            <Link href="/contact" className={pathname === "/contact" ? "active-link" : ""}>
              CONTACT
            </Link>
          </li>

          {/* ALWAYS SHOW LOGIN BUTTON IN NAVBAR (NO ADMIN DESK) */}
          <li>
            <Link href="/login" className={`nav-login ${pathname === "/login" ? "active-link" : ""}`}>
              LOGIN
            </Link>
          </li>

          {/* Mobile Drawer Logout Shortcut */}
          {portalUser && (
            <li className="mobile-only" style={{ marginTop: "10px" }}>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign Out of {portalUser.email}
              </button>
            </li>
          )}
        </ul>

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
  );
}
