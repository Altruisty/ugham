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
  const [activePortalTab, setActivePortalTab] = useState<string>("dashboard");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const syncTabFromUrl = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") || "dashboard";
      setActivePortalTab(tab);
    }
  };

  const checkAuth = () => {
    try {
      const savedUser = sessionStorage.getItem("ugham_portal_user");
      if (savedUser) {
        setPortalUser(JSON.parse(savedUser));
      } else {
        setPortalUser(null);
      }
    } catch {
      setPortalUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    syncTabFromUrl();
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleTabEvent = (e: any) => {
      if (e?.detail) setActivePortalTab(e.detail);
      else syncTabFromUrl();
    };
    window.addEventListener("ugham_auth_change", checkAuth);
    window.addEventListener("ugham_portal_tab_change", handleTabEvent);
    window.addEventListener("popstate", syncTabFromUrl);
    window.addEventListener("storage", checkAuth);
    return () => {
      window.removeEventListener("ugham_auth_change", checkAuth);
      window.removeEventListener("ugham_portal_tab_change", handleTabEvent);
      window.removeEventListener("popstate", syncTabFromUrl);
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

  const handleStudentTabNav = (tab: string) => {
    setActivePortalTab(tab);
    setIsOpen(false);
    const targetUrl = tab === "dashboard" ? "/portal" : `/portal?tab=${tab}`;
    if (pathname === "/portal") {
      window.history.pushState({}, "", targetUrl);
      window.dispatchEvent(new CustomEvent("ugham_portal_tab_change", { detail: tab }));
    } else {
      router.push(targetUrl);
    }
  };

  const isStudentMode =
    Boolean(portalUser) &&
    !pathname.startsWith("/myadmin") &&
    !pathname.startsWith("/college-");

  return (
    <nav id="navbar" className={isScrolled ? "scrolled" : ""}>
      <div className="nav-inner">
        <Link
          href={isStudentMode ? "/portal" : "/"}
          style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
        >
          <img
            src="/assets/img/logo.png"
            alt="Ugham"
            style={{ height: "90px", objectFit: "contain", transform: "scale(1.1)" }}
          />
        </Link>

        {isStudentMode ? (
          <ul className={`nav-links ${isOpen ? "open" : ""}`} id="navLinks">
            <li>
              <a
                href="/portal"
                onClick={(e) => {
                  e.preventDefault();
                  handleStudentTabNav("dashboard");
                }}
                className={pathname === "/portal" && activePortalTab === "dashboard" ? "active-link" : ""}
              >
                DASHBOARD
              </a>
            </li>
            <li>
              <a
                href="/portal?tab=my-events"
                onClick={(e) => {
                  e.preventDefault();
                  handleStudentTabNav("my-events");
                }}
                className={pathname === "/portal" && activePortalTab === "my-events" ? "active-link" : ""}
              >
                MY EVENTS
              </a>
            </li>
            <li>
              <a
                href="/portal?tab=current-events"
                onClick={(e) => {
                  e.preventDefault();
                  handleStudentTabNav("current-events");
                }}
                className={pathname === "/portal" && activePortalTab === "current-events" ? "active-link" : ""}
              >
                CURRENT EVENTS
              </a>
            </li>
            <li>
              <a
                href="/portal?tab=past-events"
                onClick={(e) => {
                  e.preventDefault();
                  handleStudentTabNav("past-events");
                }}
                className={pathname === "/portal" && activePortalTab === "past-events" ? "active-link" : ""}
              >
                PAST EVENTS
              </a>
            </li>
            <li>
              <a
                href="/portal?tab=certificates"
                onClick={(e) => {
                  e.preventDefault();
                  handleStudentTabNav("certificates");
                }}
                className={pathname === "/portal" && activePortalTab === "certificates" ? "active-link" : ""}
              >
                CERTIFICATES
              </a>
            </li>
            <li>
              <Link
                href="/events-hub"
                className={pathname === "/events-hub" ? "active-link" : ""}
                onClick={() => setIsOpen(false)}
              >
                EVENTS HUB
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="nav-login"
                style={{ cursor: "pointer", border: "none", fontFamily: "inherit" }}
              >
                LOGOUT
              </button>
            </li>
          </ul>
        ) : (
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
            <li>
              <Link href="/collaboration" className={pathname === "/collaboration" ? "active-link" : ""}>
                COLLABORATION
              </Link>
            </li>
            <li>
              <Link href="/contact" className={pathname === "/contact" ? "active-link" : ""}>
                CONTACT
              </Link>
            </li>
            <li>
              <Link href="/login" className={`nav-login ${pathname === "/login" ? "active-link" : ""}`}>
                LOGIN
              </Link>
            </li>
          </ul>
        )}

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
