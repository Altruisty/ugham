"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

export interface CustomSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  badge?: string;
}

interface CustomSelectProps {
  options: (string | CustomSelectOption)[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  searchable?: boolean;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  icon,
  searchable = false,
  disabled = false,
  compact = false,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options
  const normalizedOptions: CustomSelectOption[] = options.map((opt) => {
    if (typeof opt === "string") {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((o) => o.value === value);

  // Filter options if searchable
  const filteredOptions = normalizedOptions.filter((opt) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(term))
    );
  });

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
      setSearchTerm("");
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, searchable]);

  return (
    <div
      ref={dropdownRef}
      className={`custom-select-container ${isOpen ? "is-open" : ""} ${className}`}
      style={{ position: "relative", width: "100%" }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="custom-select-trigger"
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: compact ? "40px" : "52px",
          padding: icon ? (compact ? "8px 12px 8px 36px" : "14px 18px 14px 48px") : (compact ? "8px 12px" : "14px 18px"),
          border: isOpen ? "1.5px solid #0f172a" : "1.5px solid #cbd5e1",
          borderRadius: compact ? "10px" : "14px",
          background: compact ? "#ffffff" : "#f8fafc",
          fontFamily: "inherit",
          fontSize: compact ? "13px" : "15px",
          fontWeight: 600,
          color: selectedOption ? "#0f172a" : "#94a3b8",
          boxShadow: isOpen
            ? "0 0 0 3px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.06)"
            : "0 1px 2px rgba(0, 0, 0, 0.02)",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)",
          textAlign: "left",
          position: "relative",
        }}
      >
        {/* Left Icon */}
        {icon && (
          <span
            style={{
              position: "absolute",
              left: "18px",
              top: "50%",
              transform: "translateY(-50%)",
              color: isOpen ? "#7C3AED" : "#94a3b8",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              transition: "color 0.25s ease",
            }}
          >
            {icon}
          </span>
        )}

        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            paddingRight: "10px",
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Professional SVG Chevron Arrow */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isOpen ? "#7C3AED" : "#64748b",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.25s ease",
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </button>

      {/* Floating Animated Dropdown Menu */}
      {isOpen && (
        <div
          className="custom-select-menu"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            background: "#ffffff",
            borderRadius: "16px",
            border: "1.5px solid rgba(124, 58, 237, 0.2)",
            boxShadow:
              "0 20px 45px rgba(124, 58, 237, 0.16), 0 4px 16px rgba(0, 0, 0, 0.06)",
            padding: "8px",
            maxHeight: "320px",
            display: "flex",
            flexDirection: "column",
            animation: "selectMenuSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* Search Box if Searchable */}
          {searchable && (
            <div
              style={{
                position: "relative",
                padding: "4px 4px 8px 4px",
                borderBottom: "1px solid #f1f5f9",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: "16px",
                  top: "45%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  height: "38px",
                  padding: "8px 12px 8px 36px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  fontSize: "13px",
                  outline: "none",
                  color: "#0f172a",
                }}
              />
            </div>
          )}

          {/* Options Scroll List */}
          <div
            style={{
              overflowY: "auto",
              maxHeight: "250px",
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#94a3b8",
                }}
              >
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt, idx) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`custom-select-option ${isSelected ? "selected" : ""}`}
                    style={{
                      width: "100%",
                      padding: "11px 14px",
                      borderRadius: "10px",
                      border: "none",
                      background: isSelected
                        ? "linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(192, 38, 211, 0.08) 100%)"
                        : "transparent",
                      color: isSelected ? "#7C3AED" : "#334155",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "14px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.15s ease",
                      animation: "selectOptionFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                      animationDelay: `${Math.min(idx * 20, 200)}ms`,
                      opacity: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.color = "#0f172a";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#334155";
                      }
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span>{opt.label}</span>
                      {opt.subLabel && (
                        <span style={{ fontSize: "11.5px", color: "#64748b" }}>
                          {opt.subLabel}
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {opt.badge && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: "100px",
                            background: "rgba(124, 58, 237, 0.1)",
                            color: "#7C3AED",
                          }}
                        >
                          {opt.badge}
                        </span>
                      )}

                      {/* Professional SVG Checkmark */}
                      {isSelected && (
                        <span
                          style={{
                            color: "#7C3AED",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
