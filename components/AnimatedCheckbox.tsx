"use client";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

export default function AnimatedCheckbox({
  checked,
  onChange,
  label,
  subLabel,
  disabled = false,
}: AnimatedCheckboxProps) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      role="checkbox"
      aria-checked={checked}
      className={`animated-checkbox-btn ${checked ? "is-checked" : ""}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 14px",
        borderRadius: "10px",
        border: checked ? "1.5px solid #0f172a" : "1.5px solid #cbd5e1",
        background: checked
          ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)"
          : "#ffffff",
        color: "#0f172a",
        fontSize: "12.5px",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        textAlign: "left",
        boxShadow: checked ? "0 4px 12px rgba(15, 23, 42, 0.08)" : "none",
      }}
    >
      <span
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "6px",
          border: checked ? "1.5px solid #0f172a" : "1.5px solid #94a3b8",
          background: checked ? "#0f172a" : "#ffffff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transform: checked ? "scale(1.04)" : "scale(1)",
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 28,
            strokeDashoffset: checked ? 0 : 28,
            transition: "stroke-dashoffset 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span style={{ display: "flex", flexDirection: "column" }}>
        <span>{label}</span>
        {subLabel && (
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
            {subLabel}
          </span>
        )}
      </span>
    </button>
  );
}
