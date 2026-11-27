"use client";

import { useState } from "react";

interface WorkStep {
  step: number;
  title: string;
  description: string;
  tone: "blue" | "purple";
  tag: string;
  icon: React.ReactNode;
}

const HOW_UGHAM_STEPS: WorkStep[] = [
  {
    step: 1,
    title: "Campus Innovation Club",
    description: "Explore innovation, technology and entrepreneurship.",
    tone: "blue",
    tag: "Foundation",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    step: 2,
    title: "Skill Development Programs",
    description: "Workshops, bootcamps and expert talks.",
    tone: "purple",
    tag: "Upskilling",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: "Innovation & Project Development",
    description: "Develop ideas, build prototypes.",
    tone: "blue",
    tag: "Execution",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" />
      </svg>
    ),
  },
  {
    step: 4,
    title: "Industry Connect",
    description: "Interact with industry professionals & mentors.",
    tone: "purple",
    tag: "Mentorship",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="m11 17 2 2a1 1 0 1 0 3-3" />
        <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
        <path d="m21 3 1 11h-2" />
        <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
        <path d="M3 4h8" />
      </svg>
    ),
  },
  {
    step: 5,
    title: "Startup & Pitching Opportunities",
    description: "Present ideas & join challenges.",
    tone: "blue",
    tag: "Acceleration",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
  {
    step: 6,
    title: "Internship & Career Connect",
    description: "Explore internships and career opportunities.",
    tone: "purple",
    tag: "Outcomes",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        <path d="M2 13h20" />
      </svg>
    ),
  },
];

export default function HowUghamWorks() {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <section className="ugham-works-section">
      <div className="holo-bg" style={{ opacity: 0.28 }} />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <div className="text-center anim-el slide-down" style={{ marginBottom: "36px" }}>
          <div className="ugham-works-eyebrow">
            <span className="ugham-works-eyebrow-dot" />
            6-STAGE INNOVATION ECOSYSTEM
          </div>
          <h2 className="section-title" style={{ marginTop: "12px" }}>
            HOW UGHAM WORKS
          </h2>
          <p
            style={{
              color: "var(--muted)",
              margin: "12px auto 0",
              maxWidth: "640px",
              fontSize: "16.5px",
              lineHeight: 1.65,
            }}
          >
            From joining a Campus Innovation Club to landing internships and startup funding — every stage moves you forward seamlessly.
          </p>
        </div>

        {/* Interactive Stage Stepper Strip */}
        <div className="ugham-works-stepper anim-el fade-up" role="tablist" aria-label="Ugham 6-step pipeline">
          <div className="ugham-works-stepper-track" aria-hidden="true">
            <div
              className="ugham-works-stepper-fill"
              style={{ width: `${((activeStep - 1) / (HOW_UGHAM_STEPS.length - 1)) * 100}%` }}
            />
          </div>
          {HOW_UGHAM_STEPS.map((item) => {
            const isSelected = activeStep === item.step;
            const isCompleted = item.step <= activeStep;
            return (
              <button
                key={item.step}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveStep(item.step)}
                onMouseEnter={() => setActiveStep(item.step)}
                className={`ugham-stepper-node tone-${item.tone} ${isSelected ? "active" : ""} ${isCompleted ? "reached" : ""}`}
              >
                <span className="ugham-stepper-num">0{item.step}</span>
                <span className="ugham-stepper-name">{item.tag}</span>
              </button>
            );
          })}
        </div>

        {/* 6 Connected Glassmorphic Step Cards */}
        <div className="ugham-works-grid anim-el blur-in del-1">
          {HOW_UGHAM_STEPS.map((item, idx) => {
            const isFocused = activeStep === item.step;
            return (
              <div
                key={item.step}
                className={`ugham-works-card tone-${item.tone} ${isFocused ? "is-focused" : ""}`}
                style={{ animationDelay: `${idx * 0.07}s` }}
                onMouseEnter={() => setActiveStep(item.step)}
                onClick={() => setActiveStep(item.step)}
              >
                {/* Floating Step Badge */}
                <div className="ugham-works-card-top">
                  <span className={`ugham-step-pill tone-${item.tone}`}>
                    Step {item.step}
                  </span>
                  <span className="ugham-step-stage-tag">{item.tag}</span>
                </div>

                {/* Sculpted Dual-Tone Icon Halo */}
                <div className={`ugham-works-icon-wrap tone-${item.tone}`}>
                  <div className="ugham-works-icon-ring" />
                  <div className="ugham-works-icon-core">{item.icon}</div>
                </div>

                {/* Title & Concise Description */}
                <h3 className="ugham-works-card-title">{item.title}</h3>
                <p className="ugham-works-card-desc">{item.description}</p>

                {/* Sequential 6-Segment Progress Footer */}
                <div className="ugham-works-card-footer">
                  <div className="ugham-mini-bars" aria-hidden="true">
                    {HOW_UGHAM_STEPS.map((seg) => (
                      <span
                        key={seg.step}
                        className={`ugham-mini-bar ${seg.step <= item.step ? `filled tone-${item.tone}` : ""}`}
                      />
                    ))}
                  </div>
                  <span className="ugham-works-flow-arrow" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      {item.step < 6 ? (
                        <polyline points="9 18 15 12 9 6" />
                      ) : (
                        <polyline points="20 6 9 17 4 12" />
                      )}
                    </svg>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
