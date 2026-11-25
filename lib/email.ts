import nodemailer, { Transporter } from "nodemailer";
import { RegistrationRecord, TeamMember } from "./db";
import fs from "fs";
import path from "path";

// Persistent Brevo Dispatch Logger
export function logBrevoDispatch(dispatch: {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  type?: string;
  eventName?: string;
  teamName?: string;
  status: "sent" | "failed";
  messageId?: string;
}) {
  try {
    const dataDir = path.join(process.cwd(), "data");
    const logFile = path.join(dataDir, "brevo_dispatches.json");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    let list: any[] = [];
    if (fs.existsSync(logFile)) {
      try {
        list = JSON.parse(fs.readFileSync(logFile, "utf-8") || "[]");
      } catch (e) {
        list = [];
      }
    }
    list.unshift({
      id: `disp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      recipientEmail: dispatch.recipientEmail,
      recipientName: dispatch.recipientName || dispatch.recipientEmail.split("@")[0],
      subject: dispatch.subject,
      type: dispatch.type || "Transactional Notice",
      eventName: dispatch.eventName || "UGHAM Events",
      teamName: dispatch.teamName || "Squad Participant",
      status: dispatch.status,
      messageId: dispatch.messageId,
      timestamp: new Date().toISOString(),
    });
    fs.writeFileSync(logFile, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Error logging dispatch:", err);
  }
}

export function getBrevoDispatches(): any[] {
  try {
    const logFile = path.join(process.cwd(), "data", "brevo_dispatches.json");
    if (fs.existsSync(logFile)) {
      return JSON.parse(fs.readFileSync(logFile, "utf-8") || "[]");
    }
  } catch (e) {
    console.error("Error reading dispatches:", e);
  }
  return [];
}

export function deleteBrevoDispatchesByIds(ids: string[]): any[] {
  try {
    const logFile = path.join(process.cwd(), "data", "brevo_dispatches.json");
    if (!fs.existsSync(logFile)) return [];
    const current: any[] = JSON.parse(fs.readFileSync(logFile, "utf-8") || "[]");
    const idSet = new Set(ids);
    const filtered = current.filter((d) => !idSet.has(d.id) && !idSet.has(d.recipientEmail));
    fs.writeFileSync(logFile, JSON.stringify(filtered, null, 2), "utf-8");
    return filtered;
  } catch (e) {
    console.error("Error deleting dispatches:", e);
    return getBrevoDispatches();
  }
}

// ========================================================
// CENTRALIZED BREVO SMTP CONFIGURATION & TYPES
// ========================================================

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromName: string;
  fromAddress: string;
  replyTo: string;
}

export interface EmailDispatchResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

export function getSmtpConfig(): SmtpConfig {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const fromName = process.env.EMAIL_FROM_NAME || "UGHAM Events";
  const fromAddress = process.env.EMAIL_FROM_ADDRESS || "events@ugham.com";
  const replyTo = process.env.EMAIL_REPLY_TO || "ughambusiness@gmail.com";

  return {
    host,
    port,
    user,
    pass,
    fromName,
    fromAddress,
    replyTo,
  };
}

let cachedTransporter: Transporter | null = null;
let lastUser = "";
let lastPass = "";

export function getTransporter(): Transporter | null {
  const config = getSmtpConfig();

  // If credentials are not provided yet, return null (triggers safe simulation)
  if (!config.user.trim() || !config.pass.trim()) {
    return null;
  }

  // Reuse transporter if config hasn't changed
  if (cachedTransporter && lastUser === config.user && lastPass === config.pass) {
    return cachedTransporter;
  }

  // Brevo SMTP: Port 587 with STARTTLS
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465, // false for 587 (STARTTLS)
    auth: {
      user: config.user,
      pass: config.pass,
    },
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5, // Maximum 5 emails/second to protect Brevo daily sending quota
  });

  lastUser = config.user;
  lastPass = config.pass;

  return cachedTransporter;
}

// ========================================================
// CONNECTION VERIFICATION
// ========================================================

export interface SmtpVerificationResult {
  connected: boolean;
  mode: string;
  host: string;
  port: number;
  fromName: string;
  fromAddress: string;
  replyTo: string;
  user: string;
  hasUser: boolean;
  hasPass: boolean;
  configured: boolean;
  statusMessage: string;
  analysis: {
    hostConfigured: boolean;
    portConfigured: boolean;
    userConfigured: boolean;
    passConfigured: boolean;
    domainAuthenticated: boolean;
    relayHandshake: boolean;
    ipRestrictionDetected: boolean;
    ipResolutionHint?: string;
  };
  config: {
    host: string;
    port: number;
    sender: string;
    replyTo: string;
    hasCredentials: boolean;
  };
}

export async function verifySmtpConnection(): Promise<SmtpVerificationResult> {
  const config = getSmtpConfig();
  const hasUser = Boolean(config.user && config.user.trim());
  const hasPass = Boolean(config.pass && config.pass.trim());
  const hasCredentials = hasUser && hasPass;

  if (!hasCredentials) {
    return {
      connected: false,
      mode: "Simulation Mode (Credentials Missing)",
      host: config.host,
      port: config.port,
      fromName: config.fromName,
      fromAddress: config.fromAddress,
      replyTo: config.replyTo,
      user: config.user ? `${config.user.slice(0, 4)}***` : "Not Configured",
      hasUser,
      hasPass,
      configured: false,
      statusMessage: "SMTP credentials (SMTP_USER or SMTP_PASS) are not fully set in .env.local.",
      analysis: {
        hostConfigured: Boolean(config.host),
        portConfigured: Boolean(config.port),
        userConfigured: hasUser,
        passConfigured: hasPass,
        domainAuthenticated: config.fromAddress.endsWith("@ugham.com"),
        relayHandshake: false,
        ipRestrictionDetected: false,
        ipResolutionHint: "Add SMTP_USER and SMTP_PASS in .env.local to activate live Brevo relay.",
      },
      config: {
        host: config.host,
        port: config.port,
        sender: `"${config.fromName}" <${config.fromAddress}>`,
        replyTo: config.replyTo,
        hasCredentials: false,
      },
    };
  }

  try {
    const transporter = getTransporter();
    if (!transporter) throw new Error("Could not initialize Nodemailer transporter");

    await transporter.verify();
    return {
      connected: true,
      mode: "Live Authenticated SMTP (Brevo Relay)",
      host: config.host,
      port: config.port,
      fromName: config.fromName,
      fromAddress: config.fromAddress,
      replyTo: config.replyTo,
      user: config.user ? `${config.user.slice(0, 4)}***` : "",
      hasUser: true,
      hasPass: true,
      configured: true,
      statusMessage: `Successfully connected to Brevo SMTP (${config.host}:${config.port}) using authenticated domain ${config.fromAddress}.`,
      analysis: {
        hostConfigured: true,
        portConfigured: true,
        userConfigured: true,
        passConfigured: true,
        domainAuthenticated: config.fromAddress.endsWith("@ugham.com"),
        relayHandshake: true,
        ipRestrictionDetected: false,
      },
      config: {
        host: config.host,
        port: config.port,
        sender: `"${config.fromName}" <${config.fromAddress}>`,
        replyTo: config.replyTo,
        hasCredentials: true,
      },
    };
  } catch (err: any) {
    const errMsg = err.message || "";
    const isIpUnauthorized = errMsg.includes("525") || errMsg.includes("Unauthorized IP address");

    let resolutionHint = "Check that your Brevo credentials are correct and STARTTLS on port 587 is allowed.";
    if (isIpUnauthorized) {
      resolutionHint =
        "Brevo Error 525 5.7.1: Brevo has an IP whitelist active for this SMTP key. Go to Brevo Dashboard -> SMTP & API -> Authorized IP addresses, and either remove the IP restriction (to allow sending from anywhere) or whitelist your current server/network IP.";
    }

    return {
      connected: false,
      mode: isIpUnauthorized ? "Brevo IP Restriction (525 5.7.1)" : "Relay Handshake Failed",
      host: config.host,
      port: config.port,
      fromName: config.fromName,
      fromAddress: config.fromAddress,
      replyTo: config.replyTo,
      user: config.user ? `${config.user.slice(0, 4)}***` : "",
      hasUser: true,
      hasPass: true,
      configured: true,
      statusMessage: `Brevo SMTP verification failed: ${errMsg}`,
      analysis: {
        hostConfigured: true,
        portConfigured: true,
        userConfigured: true,
        passConfigured: true,
        domainAuthenticated: config.fromAddress.endsWith("@ugham.com"),
        relayHandshake: false,
        ipRestrictionDetected: isIpUnauthorized,
        ipResolutionHint: resolutionHint,
      },
      config: {
        host: config.host,
        port: config.port,
        sender: `"${config.fromName}" <${config.fromAddress}>`,
        replyTo: config.replyTo,
        hasCredentials: true,
      },
    };
  }
}

// ========================================================
// CORE SENDER WITH EXPONENTIAL RETRY & SECURITY
// ========================================================

export interface SendMailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendMail(
  params: SendMailParams,
  maxRetries = 2
): Promise<EmailDispatchResult> {
  const config = getSmtpConfig();
  const transporter = getTransporter();

  // If no credentials, simulate delivery safely
  if (!transporter) {
    const recipient = Array.isArray(params.to) ? params.to.join(", ") : params.to;
    console.log(
      `[BREVO SIMULATOR] Outgoing email to ${recipient} | Subject: "${params.subject}" | From: "${config.fromName}" <${config.fromAddress}>`
    );
    return {
      success: true,
      simulated: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    };
  }

  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      const fromHeader = `"${config.fromName}" <${config.fromAddress}>`;
      const replyToHeader = params.replyTo || config.replyTo;

      const info = await transporter.sendMail({
        from: fromHeader,
        to: params.to,
        replyTo: replyToHeader,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });

      // Sanitized log without printing passwords or tokens
      const recipient = Array.isArray(params.to) ? params.to.join(", ") : params.to;
      console.log(
        `[BREVO SMTP SUCCESS] Delivered to ${recipient} | MessageID: ${info.messageId} | Status: Sent`
      );

      // Record dispatch persistently
      logBrevoDispatch({
        recipientEmail: recipient,
        subject: params.subject,
        status: "sent",
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (err: any) {
      lastError = err;
      attempt++;
      console.error(
        `[BREVO SMTP RETRY ${attempt}/${maxRetries}] Failed to send to ${params.to}: ${err.message}`
      );

      // Wait with exponential backoff before retrying
      if (attempt <= maxRetries) {
        const delayMs = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // Graceful failure - never throw or undo payment/registration
  return {
    success: false,
    error: lastError?.message || "Failed to dispatch email after retries",
  };
}

// Controlled sequential sender for multiple squad members
export async function sendSequentialEmails(
  tasks: Array<() => Promise<EmailDispatchResult>>,
  delayMs = 200
): Promise<EmailDispatchResult[]> {
  const results: EmailDispatchResult[] = [];
  for (let i = 0; i < tasks.length; i++) {
    const res = await tasks[i]();
    results.push(res);
    if (i < tasks.length - 1 && delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}

// ========================================================
// EMAIL TEMPLATES & DISPATCHERS
// ========================================================

/**
 * 1. Registration Confirmation & Member Portal Credentials
 * Pure White Background • Minimalist Black & White • Corporate Typography • Logo Corner Watermark
 */
export async function sendMemberWelcomeEmail(
  record: RegistrationRecord,
  member: TeamMember
): Promise<EmailDispatchResult> {
  const eventTitle =
    record.event_name === "shepitch_coimbatore"
      ? "UGHAM SHEPITCH COIMBATORE EDITION"
      : (record.event_name === "shepitch" || record.event_name === "shepitch_chennai")
      ? "UGHAM SHEPITCH CHENNAI EDITION 2"
      : "UGHAM HACKPICK 2026";
  const defaultPassword = "UGHAM2026";

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official Registration Confirmation — ${eventTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #ffffff;
      color: #111827;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }
    .wrapper {
      width: 100% !important;
      background-color: #ffffff;
      padding: 0 !important;
      margin: 0 !important;
      box-sizing: border-box;
    }
    .email-container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #ffffff;
      border: none !important;
      border-radius: 0 !important;
      overflow: hidden;
      position: relative;
    }
    .header-bar {
      padding: 24px 28px 20px;
      border-bottom: 1.5px solid #111827;
      width: 100%;
      box-sizing: border-box;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #000000;
      margin: 0;
      text-transform: uppercase;
    }
    .sub-brand {
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 3px;
    }
    .status-pill {
      display: inline-block;
      border: 1.5px solid #111827;
      padding: 3px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #111827;
      background: #ffffff;
    }
    .body-content {
      padding: 28px 28px 24px;
    }
    .greeting {
      font-size: 22px;
      font-weight: 800;
      color: #000000;
      margin: 0 0 10px 0;
      letter-spacing: -0.3px;
    }
    .intro-paragraph {
      font-size: 14.5px;
      color: #4b5563;
      margin: 0 0 24px 0;
      line-height: 1.6;
    }
    /* Summary Details Table */
    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
    }
    .summary-table td {
      padding: 10px 0;
      font-size: 13.5px;
    }
    .summary-table tr:not(:last-child) td {
      border-bottom: 1px solid #f3f4f6;
    }
    .label-col {
      color: #6b7280;
      font-weight: 600;
      width: 38%;
    }
    .value-col {
      color: #000000;
      font-weight: 700;
      text-align: right;
    }
    /* Member Portal Access Box */
    .credentials-card {
      background-color: #fafafa;
      border: 1.5px solid #111827;
      border-radius: 8px;
      padding: 22px 20px;
      margin: 24px 0;
      text-align: center;
    }
    .credentials-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #111827;
      margin-bottom: 12px;
    }
    .credentials-row {
      display: inline-block;
      text-align: left;
      margin: 0 auto 16px;
      font-size: 14px;
      color: #374151;
    }
    .cred-line {
      margin: 6px 0;
    }
    .cred-val {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 800;
      color: #000000;
      background: #ffffff;
      border: 1px solid #d1d5db;
      padding: 2px 8px;
      border-radius: 4px;
      margin-left: 6px;
    }
    .portal-btn {
      display: inline-block;
      background-color: #000000;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    /* Student Team Details Squad Box */
    .squad-box {
      background-color: #ffffff;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      padding: 18px 20px;
      margin: 24px 0;
      box-sizing: border-box;
    }
    .squad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1.5px solid #111827;
      margin-bottom: 12px;
    }
    .squad-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #000000;
      margin: 0;
    }
    .squad-count {
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
    }
    .squad-table {
      width: 100%;
      border-collapse: collapse;
    }
    .squad-th {
      text-align: left;
      padding: 8px 10px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #4b5563;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    .squad-td {
      padding: 10px 10px;
      font-size: 13px;
      color: #111827;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }
    .role-badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .role-leader {
      background: #f3e8ff;
      color: #7c3aed;
      border: 1px solid #d8b4fe;
    }
    .role-member {
      background: #f1f5f9;
      color: #475569;
      border: 1px solid #cbd5e1;
    }
    .footer-bar {
      padding: 24px 28px 28px;
      border-top: 1px solid #e5e7eb;
      background-color: #ffffff;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      line-height: 1.7;
    }
    .footer-bar a {
      color: #000000;
      font-weight: 700;
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .header-bar { padding: 18px 16px 14px !important; }
      .body-content { padding: 20px 16px !important; }
      .summary-table td { padding: 8px 0 !important; font-size: 13px !important; }
      .credentials-card { padding: 16px 12px !important; }
      .portal-btn { width: 100% !important; box-sizing: border-box; text-align: center; }
      .squad-box { padding: 14px 10px !important; }
      .squad-th { padding: 6px 8px !important; font-size: 10px !important; }
      .squad-td { padding: 8px 8px !important; font-size: 12px !important; }
      .footer-bar { padding: 20px 16px !important; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      <!-- Header with Brand Identification -->
      <table class="header-bar" style="width: 100%;">
        <tr>
          <td>
            <div class="brand-title">UGHAM</div>
            <div class="sub-brand">Events &amp; Innovation Desk</div>
          </td>
          <td style="text-align: right;">
            <div class="status-pill">Confirmed</div>
          </td>
        </tr>
      </table>

      <!-- Main Content -->
      <div class="body-content">
        <h1 class="greeting">Welcome, ${member.name}!</h1>
        <p class="intro-paragraph">
          Your squad registration for <strong>${eventTitle}</strong> is successfully locked. Keep this confirmation for your official records and orientation entry.
        </p>

        <!-- Summary Specifications -->
        <table class="summary-table">
          <tr>
            <td class="label-col">Registration ID</td>
            <td class="value-col" style="font-family: monospace;">${record.id}</td>
          </tr>
          <tr>
            <td class="label-col">Competition</td>
            <td class="value-col">${eventTitle}</td>
          </tr>
          ${record.track ? `<tr><td class="label-col">Track</td><td class="value-col">${record.track}</td></tr>` : ""}
          <tr>
            <td class="label-col">Domain</td>
            <td class="value-col">${record.domain}</td>
          </tr>
          <tr>
            <td class="label-col">Squad Name</td>
            <td class="value-col">${record.team_name}</td>
          </tr>
          <tr>
            <td class="label-col">Institution</td>
            <td class="value-col">${record.college_name}</td>
          </tr>
          <tr>
            <td class="label-col">Team Leader</td>
            <td class="value-col">${record.leader_name} (${record.leader_email})</td>
          </tr>
          <tr>
            <td class="label-col">Payment Reference</td>
            <td class="value-col" style="font-family: monospace;">${record.payment_id}</td>
          </tr>
        </table>

        <!-- Participant Portal Credentials -->
        <div class="credentials-card">
          <div class="credentials-title">Participant Portal Credentials</div>
          <div class="credentials-row">
            <div class="cred-line"><strong>Username:</strong> <span class="cred-val">${member.email}</span></div>
            <div class="cred-line"><strong>Password:</strong> <span class="cred-val">${defaultPassword}</span></div>
          </div>
          <div>
            <a href="https://ugham.com/login" class="portal-btn">Access Participant Portal &rarr;</a>
          </div>
        </div>

        <!-- Student Team Details (Squad Roster Table Box) -->
        <div class="squad-box">
          <table style="width: 100%; margin-bottom: 10px; border-bottom: 1.5px solid #111827; padding-bottom: 8px;">
            <tr>
              <td>
                <span class="squad-title">Students Team Details</span>
              </td>
              <td style="text-align: right;">
                <span class="squad-count">${(record.members && record.members.length > 0) ? record.members.length : (record.team_size || 1)} Members Enrolled</span>
              </td>
            </tr>
          </table>

          <table class="squad-table">
            <thead>
              <tr>
                <th class="squad-th">Student Name</th>
                <th class="squad-th">Role</th>
                <th class="squad-th">Portal Login Email</th>
              </tr>
            </thead>
            <tbody>
              ${(record.members && record.members.length > 0)
                ? record.members.map((m) => `
                  <tr>
                    <td class="squad-td" style="font-weight: 700;">${m.name}</td>
                    <td class="squad-td">
                      <span class="role-badge ${(m.role === 'Leader' || m.email === record.leader_email) ? 'role-leader' : 'role-member'}">
                        ${(m.role === 'Leader' || m.email === record.leader_email) ? 'Team Leader' : (m.role || 'Member')}
                      </span>
                    </td>
                    <td class="squad-td" style="font-family: monospace; color: #374151;">${m.email}</td>
                  </tr>
                `).join('')
                : `
                  <tr>
                    <td class="squad-td" style="font-weight: 700;">${record.leader_name}</td>
                    <td class="squad-td"><span class="role-badge role-leader">Team Leader</span></td>
                    <td class="squad-td" style="font-family: monospace; color: #374151;">${record.leader_email}</td>
                  </tr>
                `
              }
            </tbody>
          </table>
        </div>

        <p style="font-size: 13px; color: #6b7280; margin: 24px 0 0 0; line-height: 1.6;">
          You will receive further schedules, jury rubrics, and briefing links ahead of the competition. For inquiries, contact our official desk at <a href="mailto:ughambusiness@gmail.com" style="color: #000000; font-weight: 700;">ughambusiness@gmail.com</a>.
        </p>
      </div>

      <!-- Footer -->
      <div class="footer-bar">
        <div>&copy; 2026 Ugham Innovation Studio • Official Domain Transmission</div>
        <div style="margin-top: 6px;">
          Delivered via <strong>events@ugham.com</strong> • Support: <a href="mailto:ughambusiness@gmail.com">ughambusiness@gmail.com</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendMail({
    to: member.email,
    subject: `[CONFIRMED] Registration for ${eventTitle} — Team ${record.team_name}`,
    html: emailHtml,
    text: `Registration Confirmed for ${eventTitle}!\n\nTeam: ${record.team_name}\nRegistration ID: ${record.id}\nUsername: ${member.email}\nPassword: ${defaultPassword}\n\nAccess your portal at https://ugham.com`,
  });
}

/**
 * 2. OTP Verification Email (Clean White Background)
 */
export async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  purpose: string = "verification"
): Promise<EmailDispatchResult> {
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your Ugham Verification Code</title>
  <style>
    body { margin: 0; padding: 0; background-color: #ffffff; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #ffffff; padding: 40px 16px; box-sizing: border-box; }
    .email-container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .header { padding: 28px 32px 20px; border-bottom: 1px solid #f3f4f6; }
    .content { padding: 32px; text-align: center; }
    .otp-code { font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #000000; background: #f9fafb; padding: 16px 28px; border-radius: 8px; display: inline-block; margin: 24px 0; font-family: monospace; border: 1.5px solid #111827; }
    .footer { padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6; font-size: 12px; color: #6b7280; background: #fafafa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      <div class="header">
        <div style="font-size: 18px; font-weight: 900; letter-spacing: 1.5px; color: #000000;">UGHAM SECURITY</div>
      </div>
      <div class="content">
        <h2 style="font-size: 19px; margin: 0 0 8px 0; color: #000000;">Verification Code</h2>
        <p style="color: #4b5563; font-size: 14px; margin: 0; line-height: 1.6;">
          Use the single-use code below to complete your ${purpose}. This code is valid for 10 minutes.
        </p>
        <div class="otp-code">${otpCode}</div>
        <p style="color: #6b7280; font-size: 12px; margin: 16px 0 0 0;">
          If you did not request this code, please disregard this message or notify <a href="mailto:ughambusiness@gmail.com" style="color: #000000; font-weight: 700;">ughambusiness@gmail.com</a>.
        </p>
      </div>
      <div class="footer">
        &copy; 2026 Ugham Innovation Studio • Authenticated Delivery (events@ugham.com)
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendMail({
    to: toEmail,
    subject: `[UGHAM] Your Verification Code is ${otpCode}`,
    html: emailHtml,
    text: `Your Ugham verification code is: ${otpCode}. Valid for 10 minutes.`,
  });
}

/**
 * 3. Payment Confirmation Notification (Clean White Background)
 */
export async function sendPaymentConfirmationEmail(params: {
  toEmail: string;
  name: string;
  amount: number;
  paymentId: string;
  eventName: string;
  teamName: string;
}): Promise<EmailDispatchResult> {
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Payment Receipt — Ugham Innovation</title>
  <style>
    body { margin: 0; padding: 0; background-color: #ffffff; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #ffffff; padding: 40px 16px; box-sizing: border-box; }
    .email-container { max-width: 520px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .header { padding: 28px 32px 20px; border-bottom: 1px solid #f3f4f6; }
    .content { padding: 32px; }
    .amount { font-size: 36px; font-weight: 900; color: #000000; margin: 12px 0; }
    .receipt-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
    .footer { padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6; font-size: 12px; color: #6b7280; background: #fafafa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      <div class="header">
        <div style="font-size: 18px; font-weight: 900; letter-spacing: 1.5px; color: #000000;">PAYMENT RECEIPT</div>
      </div>
      <div class="content">
        <p style="color: #4b5563; font-size: 14px; margin: 0 0 6px 0;">Hello ${params.name},</p>
        <p style="color: #111827; font-size: 15px; margin: 0 0 16px 0;">Your payment for <strong>${params.eventName}</strong> has been confirmed.</p>
        <div class="receipt-box">
          <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; font-weight: 700;">Amount Verified</span>
          <div class="amount">₹${params.amount}</div>
          <span style="font-size: 13px; color: #374151; font-family: monospace;">Transaction ID: ${params.paymentId}</span>
        </div>
        <p style="font-size: 13.5px; color: #4b5563; margin: 0;">Squad: <strong>${params.teamName}</strong></p>
      </div>
      <div class="footer">
        &copy; 2026 Ugham Innovation Studio • Official Payment Record
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendMail({
    to: params.toEmail,
    subject: `[RECEIPT] Payment Confirmed — ₹${params.amount} for ${params.eventName}`,
    html: emailHtml,
  });
}

/**
 * 4. General Notification / Event Reminder Email (Clean White Background)
 */
export async function sendEventReminderEmail(params: {
  toEmail: string;
  name: string;
  subject: string;
  eventName: string;
  message: string;
  meetingLink?: string;
}): Promise<EmailDispatchResult> {
  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${params.subject}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #ffffff; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .wrapper { width: 100%; background-color: #ffffff; padding: 40px 16px; box-sizing: border-box; }
    .email-container { max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
    .header { padding: 28px 32px 20px; border-bottom: 1px solid #f3f4f6; }
    .content { padding: 32px; font-size: 15px; line-height: 1.7; color: #374151; }
    .footer { padding: 20px 32px; text-align: center; border-top: 1px solid #f3f4f6; font-size: 12px; color: #6b7280; background: #fafafa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="email-container">
      <div class="header">
        <h2 style="margin: 0; font-size: 18px; font-weight: 800; color: #000000;">${params.eventName}</h2>
      </div>
      <div class="content">
        <p style="margin-top: 0;">Hello ${params.name},</p>
        <div>${params.message}</div>
        ${params.meetingLink ? `<p style="margin-top: 24px;"><a href="${params.meetingLink}" style="display: inline-block; background: #000000; color: #ffffff; padding: 12px 26px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13.5px;">Join Session &rarr;</a></p>` : ""}
      </div>
      <div class="footer">
        &copy; 2026 Ugham Innovation Studio • Official Support: <a href="mailto:ughambusiness@gmail.com" style="color: #111827; font-weight: 700;">ughambusiness@gmail.com</a>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  return sendMail({
    to: params.toEmail,
    subject: params.subject,
    html: emailHtml,
  });
}
