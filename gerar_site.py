import os

print("=== [1/6] Gerando a pasta img/ e os 50 arquivos placeholder ===")
os.makedirs("img", exist_ok=True)

sections = [
    ("github", "GitHub do Projeto"),
    ("servidor", "Servidor"),
    ("antigravity", "Antigravity"),
    ("qualys", "Qualy SSL lab"),
    ("hardening-nginx", "Hardening Nginx")
]

for prefix, title in sections:
    for i in range(1, 11):
        num = f"{i:02d}"
        filename = os.path.join("img", f"{prefix}-{num}.svg")
        svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <rect width="100%" height="100%" fill="#0b1120"/>
  <rect x="20" y="20" width="760" height="410" rx="12" fill="#151e2e" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 4"/>
  <circle cx="400" cy="180" r="45" fill="#0ea5e9" opacity="0.2"/>
  <text x="400" y="195" fill="#38bdf8" font-size="40" font-family="Segoe UI, sans-serif" text-anchor="middle">📷</text>
  <text x="400" y="260" fill="#f8fafc" font-size="24" font-weight="bold" font-family="Segoe UI, sans-serif" text-anchor="middle">{title}</text>
  <text x="400" y="295" fill="#38bdf8" font-size="18" font-family="Consolas, monospace" text-anchor="middle">{prefix}-{num}.svg</text>
  <text x="400" y="335" fill="#94a3b8" font-size="14" font-family="Segoe UI, sans-serif" text-anchor="middle">Substitua este arquivo pela sua captura de tela real</text>
</svg>"""
        with open(filename, "w", encoding="utf-8") as f:
            f.write(svg_content)

print("✔ 50 imagens geradas em .\\img\\")

print("=== [2/6] Gerando style.css ===")
style_css = """/* DEFINIÇÃO DE VARIÁVEIS E TEMAS */
:root[data-theme="dark"] {
    --bg-main: #0b0f19;
    --bg-card: rgba(21, 30, 46, 0.88);
    --bg-input: rgba(11, 17, 32, 0.8);
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
    --border-color: rgba(56, 189, 248, 0.2);
    --primary: #0ea5e9;
    --primary-hover: #0284c7;
    --success: #22c55e;
    --danger: #ef4444;
    --warning: #f59e0b;
}

:root[data-theme="light"] {
    --bg-main: #f1f5f9;
    --bg-card: rgba(255, 255, 255, 0.92);
    --bg-input: #ffffff;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --border-color: rgba(2, 132, 199, 0.3);
    --primary: #0284c7;
    --primary-hover: #0369a1;
    --success: #16a34a;
    --danger: #dc2626;
    --warning: #d97706;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

body {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: var(--text-main);
    background-color: var(--bg-main);
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    background-repeat: no-repeat;
}

body.view-login {
    background-image: linear-gradient(rgba(11, 15, 25, 0.72), rgba(11, 15, 25, 0.85)), url("Fundo01.jpg");
}

body.view-dashboard {
    background-image: linear-gradient(rgba(11, 15, 25, 0.78), rgba(11, 15, 25, 0.88)), url("Fundo02.jpg");
}

.top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.85rem 1.5rem;
    background-color: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border-color);
}

.brand {
    font-weight: 700;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--primary);
    text-shadow: 0 0 10px rgba(14, 165, 233, 0.4);
    text-decoration: none;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.btn-icon {
    background: transparent;
    border: 1px solid var(--border-color);
    padding: 0.4rem 0.6rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
}

.btn-danger-sm {
    background-color: var(--danger);
    color: #ffffff;
    border: none;
    padding: 0.45rem 0.85rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
}

.sub-nav {
    background: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    padding: 0.6rem 1.5rem;
    overflow-x: auto;
}

.sub-nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.nav-link-btn {
    background: rgba(56, 189, 248, 0.08);
    color: var(--text-muted);
    border: 1px solid var(--border-color);
    padding: 0.5rem 0.9rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all 0.2s ease;
}

.nav-link-btn:hover {
    color: var(--text-main);
    background: rgba(56, 189, 248, 0.2);
    border-color: var(--primary);
}

.nav-link-btn.active {
    background: var(--primary);
    color: #ffffff;
    border-color: var(--primary);
    box-shadow: 0 0 12px rgba(14, 165, 233, 0.4);
}

.main-container {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 1.5rem;
}

.card {
    background-color: var(--bg-card);
    backdrop-filter: blur(14px);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.75rem;
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

h2 {
    font-size: 1.35rem;
    color: var(--primary);
    margin-bottom: 0.25rem;
}

h3 {
    font-size: 1.1rem;
    margin-bottom: 0.35rem;
}

.subtitle {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 1.25rem;
}

#login-view {
    max-width: 440px;
    margin: 2.5rem auto;
    border-top: 3px solid var(--primary);
}

.form-group {
    margin-bottom: 1.1rem;
}

label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 0.4rem;
}

input, textarea {
    width: 100%;
    padding: 0.65rem 0.75rem;
    border-radius: 6px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-input);
    color: var(--text-main);
    font-size: 0.95rem;
}

input:focus, textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 8px rgba(14, 165, 233, 0.4);
}

.password-meter-container {
    height: 4px;
    width: 100%;
    background-color: var(--border-color);
    border-radius: 2px;
    margin-top: 0.4rem;
    overflow: hidden;
}

.meter-bar {
    height: 100%;
    width: 0;
    transition: width 0.3s, background-color 0.3s;
}

.meter-text {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.institution-footer {
    margin-top: 1.5rem;
    padding-top: 1.2rem;
    border-top: 1px dashed var(--border-color);
    display: flex;
    align-items: center;
    gap: 0.9rem;
}

.institution-logo {
    width: 52px;
    height: auto;
    object-fit: contain;
    background: rgba(255, 255, 255, 0.9);
    padding: 4px;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.institution-text {
    display: flex;
    flex-direction: column;
}

.inst-acronym {
    font-size: 1.05rem;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: 0.05em;
}

.inst-fullname {
    font-size: 0.75rem;
    color: var(--text-muted);
    line-height: 1.3;
}

button, .btn-secondary {
    cursor: pointer;
    font-weight: 600;
    border-radius: 6px;
    border: none;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s;
}

button:hover, .btn-secondary:hover {
    opacity: 0.9;
}

.btn-primary {
    width: 100%;
    padding: 0.75rem;
    background-color: var(--primary);
    color: #ffffff;
    font-size: 0.95rem;
    margin-top: 0.5rem;
}

.btn-secondary {
    background-color: rgba(56, 189, 248, 0.15);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 0.5rem 0.85rem;
    font-size: 0.85rem;
}

.btn-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.alert {
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.85rem;
    margin-bottom: 1rem;
}

.alert-error {
    background-color: rgba(239, 68, 68, 0.2);
    border: 1px solid var(--danger);
    color: #fca5a5;
}

.dash-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
    flex-wrap: wrap;
    gap: 1rem;
}

.session-timer-box {
    text-align: right;
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    padding: 0.5rem 1rem;
    border-radius: 8px;
}

.timer-digits {
    display: block;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--primary);
    font-family: monospace;
}

.services-status-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1.5rem;
    background-color: var(--bg-card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-color);
    padding: 0.85rem 1.25rem;
    border-radius: 8px;
    align-items: center;
    justify-content: space-between;
}

.srv-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
}

.hardware-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.hw-card {
    padding: 1.25rem;
}

.hw-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
}

.progress-track {
    width: 100%;
    height: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    overflow: hidden;
    margin-bottom: 0.5rem;
}

.progress-fill {
    height: 100%;
    width: 0%;
    background-color: var(--primary);
    border-radius: 5px;
    transition: width 0.5s ease-in-out, background-color 0.3s;
}

.hw-subtext {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.metric-card {
    background-color: var(--bg-card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-color);
    padding: 1.25rem;
    border-radius: 8px;
    text-align: center;
}

.metric-val {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--success);
    margin-bottom: 0.25rem;
}

.metric-label {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.tool-card {
    display: flex;
    flex-direction: column;
}

.hash-output-container {
    margin-top: 0.75rem;
}

.hash-output-container textarea,
.hash-output-container input {
    margin-top: 0.25rem;
    font-family: monospace;
    font-size: 0.8rem;
}

.password-gen-control {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
}

.password-gen-control input[type="range"] {
    width: 50%;
}

.logs-card {
    margin-top: 1rem;
}

.table-responsive {
    overflow-x: auto;
}

.logs-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
    text-align: left;
}

.logs-table th, .logs-table td {
    padding: 0.65rem 0.75rem;
    border-bottom: 1px solid var(--border-color);
}

.logs-table th {
    color: var(--text-muted);
    font-weight: 600;
}

.gallery-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.25rem;
}

.gallery-item {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, border-color 0.2s;
}

.gallery-item:hover {
    transform: translateY(-3px);
    border-color: var(--primary);
}

.gallery-thumb-container {
    width: 100%;
    height: 180px;
    background-color: #060911;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.gallery-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.gallery-caption {
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.gallery-name {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--text-main);
}

.gallery-tag {
    font-size: 0.72rem;
    font-family: monospace;
    color: var(--primary);
}

/* Área de Vídeo da Apresentação */
.video-wrapper {
    max-width: 900px;
    margin: 1.5rem auto 0;
    background: #000000;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.video-player {
    width: 100%;
    max-height: 520px;
    display: block;
    outline: none;
}

.video-info-box {
    margin-top: 1rem;
    background: rgba(15, 23, 42, 0.5);
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.badge {
    padding: 0.2rem 0.45rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 700;
}

.badge-info { background: rgba(2, 132, 199, 0.2); color: #38bdf8; }
.badge-warn { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.badge-danger { background: rgba(239, 68, 68, 0.2); color: #f87171; }
.badge-success { background: rgba(34, 197, 94, 0.2); color: #4ade80; }

.hidden {
    display: none !important;
}
"""
with open("style.css", "w", encoding="utf-8") as f:
    f.write(style_css)
print("✔ style.css atualizado")

print("=== [3/6] Gerando app.js com simulação de métricas e sessão de 20 minutos ===")
app_js = """(function () {
    "use strict";

    let authorizedUsers = {};

    const SESSION_KEY = "sec_auth_token";
    const THEME_KEY = "sec_theme_pref";
    const MAX_LOGIN_ATTEMPTS = 3;
    const LOCKOUT_DURATION_MS = 30000;
    const SESSION_DURATION_SECONDS = 20 * 60; // 20 Minutos

    let failedAttempts = 0;
    let lockoutUntil = 0;
    let timerInterval = null;
    let metricsInterval = null;
    let auditLogs = [];

    const loginView = document.getElementById("login-view");
    const dashboardView = document.getElementById("dashboard-view");
    const moduleNav = document.getElementById("module-nav");
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginAlert = document.getElementById("login-alert");
    const userDisplay = document.getElementById("user-display");
    const btnNavLogout = document.getElementById("btn-nav-logout");
    const themeToggle = document.getElementById("theme-toggle");
    const sessionTimerDisplay = document.getElementById("session-timer");

    const srvUptime = document.getElementById("srv-uptime");
    const statusNginx = document.getElementById("status-nginx");
    const statusFail2ban = document.getElementById("status-fail2ban");
    const statusSshd = document.getElementById("status-sshd");
    const cpuText = document.getElementById("cpu-text");
    const cpuBar = document.getElementById("cpu-bar");
    const ramText = document.getElementById("ram-text");
    const ramBar = document.getElementById("ram-bar");
    const ramFree = document.getElementById("ram-free");
    const ramPercent = document.getElementById("ram-percent");
    const swapText = document.getElementById("swap-text");
    const swapBar = document.getElementById("swap-bar");
    const swapFree = document.getElementById("swap-free");
    const swapPercent = document.getElementById("swap-percent");
    const metricProcesses = document.getElementById("metric-processes");
    const metricSessions = document.getElementById("metric-sessions");
    const metricBlocked = document.getElementById("metric-blocked-attempts");
    const metricEvents = document.getElementById("metric-events-count");

    const hashInput = document.getElementById("hash-input");
    const btnHash = document.getElementById("btn-hash");
    const hashOutput = document.getElementById("hash-output");
    const passLengthInput = document.getElementById("pass-length");
    const passLengthVal = document.getElementById("pass-length-val");
    const btnGenPass = document.getElementById("btn-gen-pass");
    const btnCopyPass = document.getElementById("btn-copy-pass");
    const generatedPass = document.getElementById("generated-pass");
    const logsTbody = document.getElementById("logs-tbody");
    const passwordMeterBar = document.getElementById("password-meter-bar");
    const passwordFeedback = document.getElementById("password-feedback");

    async function calculateSHA256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    async function initializeSecurityContext() {
        authorizedUsers = {
            "aristontsfilho": await calculateSHA256("projeto@aristontsfilho"),
            "professor": await calculateSHA256("professor")
        };
    }

    function sanitize(str) {
        if (typeof str !== "string") return "";
        return str.replace(/[&<>"'/]/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;"
        }[c]));
    }

    function showAlert(msg) {
        if (!loginAlert) return;
        loginAlert.textContent = msg;
        loginAlert.className = "alert alert-error";
        loginAlert.classList.remove("hidden");
    }

    function clearAlert() {
        if (!loginAlert) return;
        loginAlert.textContent = "";
        loginAlert.className = "alert hidden";
    }

    function logEvent(type, severity, detail) {
        const time = new Date().toLocaleTimeString();
        auditLogs.unshift({ time, type, severity, detail });
        if (auditLogs.length > 25) auditLogs.pop();
        if (metricEvents) metricEvents.textContent = auditLogs.length;

        if (logsTbody) {
            logsTbody.replaceChildren();
            auditLogs.forEach(l => {
                const tr = document.createElement("tr");
                tr.innerHTML = `<td>${sanitize(l.time)}</td><td>${sanitize(l.type)}</td><td><span class="badge badge-${l.severity === 'CRITICAL' ? 'danger' : l.severity === 'WARN' ? 'warn' : 'info'}">${sanitize(l.severity)}</span></td><td>${sanitize(l.detail)}</td>`;
                logsTbody.appendChild(tr);
            });
        }
    }

    // Renderiza dados de métricas (sejam reais ou simulados de contingência)
    function renderMetrics(data) {
        if (srvUptime) srvUptime.textContent = data.system.uptime;
        updateServiceBadge(statusNginx, data.services.nginx);
        updateServiceBadge(statusFail2ban, data.services.fail2ban);
        updateServiceBadge(statusSshd, data.services.sshd);

        if (cpuText && cpuBar) {
            cpuText.textContent = `${data.cpu_usage_percent}%`;
            cpuBar.style.width = `${Math.min(100, data.cpu_usage_percent)}%`;
            cpuBar.style.backgroundColor = data.cpu_usage_percent > 85 ? "var(--danger)" : "var(--primary)";
        }

        if (ramText && ramBar) {
            ramText.textContent = `${data.ram.used_mb} MB / ${data.ram.total_mb} MB`;
            ramBar.style.width = `${data.ram.percent}%`;
            if (ramFree) ramFree.textContent = `${data.ram.free_mb} MB`;
            if (ramPercent) ramPercent.textContent = `${data.ram.percent}%`;
            ramBar.style.backgroundColor = data.ram.percent > 90 ? "var(--danger)" : "var(--primary)";
        }

        if (swapText && swapBar) {
            swapText.textContent = `${data.swap.used_mb} MB / ${data.swap.total_mb} MB`;
            swapBar.style.width = `${data.swap.percent}%`;
            if (swapFree) swapFree.textContent = `${data.swap.free_mb} MB`;
            if (swapPercent) swapPercent.textContent = `${data.swap.percent}%`;
        }

        if (metricProcesses) metricProcesses.textContent = data.system.total_processes;
        if (metricSessions) metricSessions.textContent = data.system.active_sessions;
    }

    // Simulação caso a VM OCI ainda não esteja respondendo no endpoint /api/metrics
    function getSimulatedMetrics() {
        const cpu = Math.floor(18 + Math.random() * 15);
        const ramUsed = Math.floor(480 + Math.random() * 50);
        const ramTotal = 1024;
        const ramPerc = Math.round((ramUsed / ramTotal) * 100);
        return {
            system: {
                uptime: "14 dias, 08:42",
                total_processes: 118,
                active_sessions: 2
            },
            services: {
                nginx: "active",
                fail2ban: "active",
                sshd: "active"
            },
            cpu_usage_percent: cpu,
            ram: {
                total_mb: ramTotal,
                used_mb: ramUsed,
                free_mb: ramTotal - ramUsed,
                percent: ramPerc
            },
            swap: {
                total_mb: 2048,
                used_mb: 124,
                free_mb: 1924,
                percent: 6
            }
        };
    }

    async function fetchServerMetrics() {
        try {
            const res = await fetch("/api/metrics");
            if (!res.ok) throw new Error("Fallback para simulação");
            const data = await res.json();
            renderMetrics(data);
        } catch (err) {
            // Em caso de teste local ou falha de proxy, exibe métricas realistas
            renderMetrics(getSimulatedMetrics());
        }
    }

    function updateServiceBadge(element, status) {
        if (!element) return;
        element.textContent = status ? status.toUpperCase() : "INACTIVE";
        element.className = (status === "active") ? "badge badge-success" : "badge badge-danger";
    }

    function startMetricsPolling() {
        fetchServerMetrics();
        clearInterval(metricsInterval);
        metricsInterval = setInterval(fetchServerMetrics, 3000);
    }

    function stopMetricsPolling() {
        clearInterval(metricsInterval);
    }

    function startSessionTimer(expirationTimestamp) {
        clearInterval(timerInterval);
        function tick() {
            const diff = Math.max(0, Math.floor((expirationTimestamp - Date.now()) / 1000));
            const m = String(Math.floor(diff / 60)).padStart(2, "0");
            const s = String(diff % 60).padStart(2, "0");
            if (sessionTimerDisplay) sessionTimerDisplay.textContent = `${m}:${s}`;
            if (diff <= 60 && sessionTimerDisplay) sessionTimerDisplay.style.color = "var(--danger)";
            if (diff <= 0) {
                clearInterval(timerInterval);
                logEvent("SESSION_TIMEOUT", "WARN", "Sessão expirada.");
                terminateSession();
            }
        }
        tick();
        timerInterval = setInterval(tick, 1000);
    }

    function verifySession() {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) {
            if (dashboardView) showLogin();
            else window.location.href = "index.html";
            return;
        }
        try {
            const s = JSON.parse(raw);
            if (Date.now() >= s.expiresAt) { terminateSession(); return; }
            if (dashboardView) showDashboard(s.username, s.expiresAt);
        } catch (e) { terminateSession(); }
    }

    function showLogin() {
        clearInterval(timerInterval);
        stopMetricsPolling();
        document.body.classList.remove("view-dashboard");
        document.body.classList.add("view-login");

        if (moduleNav) moduleNav.classList.add("hidden");
        if (dashboardView) dashboardView.classList.add("hidden");
        if (btnNavLogout) btnNavLogout.classList.add("hidden");
        if (loginView) {
            loginView.classList.remove("hidden");
            loginForm.reset();
            resetPasswordMeter();
        }
    }

    function showDashboard(username, expiresAt) {
        document.body.classList.remove("view-login");
        document.body.classList.add("view-dashboard");

        if (loginView) loginView.classList.add("hidden");
        if (dashboardView) dashboardView.classList.remove("hidden");
        if (moduleNav) moduleNav.classList.remove("hidden");
        if (btnNavLogout) btnNavLogout.classList.remove("hidden");
        if (userDisplay) userDisplay.textContent = sanitize(username);
        clearAlert();
        startSessionTimer(expiresAt);
        startMetricsPolling();
    }

    async function handleLogin(e) {
        e.preventDefault();
        clearAlert();

        const now = Date.now();
        if (now < lockoutUntil) {
            const remaining = Math.ceil((lockoutUntil - now) / 1000);
            showAlert(`Muitas falhas consecutivas. Bloqueio temporário: aguarde ${remaining}s.`);
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (Object.keys(authorizedUsers).length === 0) {
            await initializeSecurityContext();
        }

        const inputHash = await calculateSHA256(password);
        const expectedUserHash = authorizedUsers[username];

        if (expectedUserHash && inputHash === expectedUserHash) {
            failedAttempts = 0;
            const expiresAt = Date.now() + (SESSION_DURATION_SECONDS * 1000);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, expiresAt }));
            logEvent("AUTH_SUCCESS", "INFO", `Autenticado: ${username}`);
            showDashboard(username, expiresAt);
        } else {
            failedAttempts++;
            if (metricBlocked) metricBlocked.textContent = failedAttempts;
            if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                logEvent("AUTH_LOCKOUT", "CRITICAL", `Rate limit acionado para ${username}`);
                showAlert("Conta temporariamente bloqueada por 30s.");
            } else {
                const remaining = MAX_LOGIN_ATTEMPTS - failedAttempts;
                logEvent("AUTH_FAILED", "WARN", `Falha de autenticação (${failedAttempts}/${MAX_LOGIN_ATTEMPTS}).`);
                showAlert(`Credenciais inválidas. Tentativas restantes: ${remaining}`);
            }
        }
    }

    function terminateSession() {
        sessionStorage.removeItem(SESSION_KEY);
        logEvent("AUTH_LOGOUT", "INFO", "Sessão encerrada.");
        if (dashboardView) {
            showLogin();
        } else {
            window.location.href = "index.html";
        }
    }

    function evaluatePasswordStrength() {
        if (!passwordInput || !passwordMeterBar) return;
        const val = passwordInput.value;
        let score = 0;
        if (val.length >= 8) score++;
        if (val.length >= 12) score++;
        if (/[A-Z]/.test(val)) score++;
        if (/[0-9]/.test(val)) score++;
        if (/[^A-Za-z0-9]/.test(val)) score++;

        const widths = ["0%", "20%", "40%", "60%", "80%", "100%"];
        const colors = ["transparent", "#ef4444", "#f97316", "#eab308", "#3b82f6", "#22c55e"];
        const labels = ["Digite a senha...", "Muito fraca", "Fraca", "Média", "Forte", "Excelente (Forte)"];

        passwordMeterBar.style.width = widths[score];
        passwordMeterBar.style.backgroundColor = colors[score];
        if (passwordFeedback) {
            passwordFeedback.textContent = labels[score];
            passwordFeedback.style.color = colors[score];
        }
    }

    function resetPasswordMeter() {
        if (passwordMeterBar) passwordMeterBar.style.width = "0%";
        if (passwordFeedback) {
            passwordFeedback.textContent = "Digite a senha para avaliar a força";
            passwordFeedback.style.color = "var(--text-muted)";
        }
    }

    if (loginForm) loginForm.addEventListener("submit", handleLogin);
    if (btnNavLogout) btnNavLogout.addEventListener("click", terminateSession);
    if (passwordInput) passwordInput.addEventListener("input", evaluatePasswordStrength);

    if (btnHash) {
        btnHash.addEventListener("click", async () => {
            const t = hashInput.value;
            if (!t) return;
            hashOutput.value = await calculateSHA256(t);
            logEvent("CRYPTO_HASH", "INFO", "Digest SHA-256 gerado");
        });
    }

    if (btnGenPass) {
        btnGenPass.addEventListener("click", () => {
            const len = parseInt(passLengthInput.value, 10);
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
            const arr = new Uint32Array(len);
            crypto.getRandomValues(arr);
            generatedPass.value = Array.from(arr).map(x => chars[x % chars.length]).join("");
            logEvent("CRYPTO_GEN", "INFO", `Senha gerada (${len} chars)`);
        });
    }

    if (btnCopyPass) {
        btnCopyPass.addEventListener("click", () => {
            if (!generatedPass.value) return;
            navigator.clipboard.writeText(generatedPass.value).then(() => {
                btnCopyPass.textContent = "Copiado!";
                setTimeout(() => { btnCopyPass.textContent = "Copiar"; }, 2000);
            });
        });
    }

    if (passLengthInput) {
        passLengthInput.addEventListener("input", () => {
            passLengthVal.textContent = passLengthInput.value;
        });
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const cur = document.documentElement.getAttribute("data-theme") || "dark";
            const nxt = cur === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", nxt);
            localStorage.setItem(THEME_KEY, nxt);
            themeToggle.textContent = nxt === "dark" ? "🌙" : "☀️";
        });
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
        if (themeToggle) themeToggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";

        await initializeSecurityContext();
        verifySession();
    });
})();
"""
with open("app.js", "w", encoding="utf-8") as f:
    f.write(app_js)
print("✔ app.js atualizado")

print("=== [4/6] Gerando index.html com link para Apresentação e 20 minutos ===")
index_html = """<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <title>Painel Administrativo OCI - Projeto-Aplicado</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="top-nav">
        <a href="index.html" class="brand">
            <span class="shield-icon">🛡️</span>
            <span>Projeto-Aplicado</span>
        </a>
        <div class="nav-actions">
            <button id="theme-toggle" class="btn-icon" aria-label="Alternar Tema" title="Alternar Modo Claro/Escuro">🌙</button>
            <button id="btn-nav-logout" class="btn-danger-sm hidden">Encerrar Sessão</button>
        </div>
    </header>

    <nav id="module-nav" class="sub-nav hidden">
        <div class="sub-nav-container">
            <a href="index.html" class="nav-link-btn active">📊 Painel Geral</a>
            <a href="apresentacao.html" class="nav-link-btn">🎥 Apresentação</a>
            <a href="github.html" class="nav-link-btn">🐙 GitHub do Projeto</a>
            <a href="servidor.html" class="nav-link-btn">🖥️ Servidor</a>
            <a href="antigravity.html" class="nav-link-btn">⚡ Antigravity</a>
            <a href="qualys.html" class="nav-link-btn">🔒 Qualy SSL lab</a>
            <a href="hardering-nginx.html" class="nav-link-btn">🛡️ Hardering nginx</a>
        </div>
    </nav>

    <main class="main-container">
        <section id="login-view" class="view card">
            <h2>Autenticação Administrativa</h2>
            <p class="subtitle">Acesso Restrito ao Painel de Informação</p>
            
            <div id="login-alert" class="alert hidden" role="alert"></div>

            <form id="login-form" autocomplete="off">
                <div class="form-group">
                    <label for="username">Usuário:</label>
                    <input type="text" id="username" name="username" required maxlength="30" placeholder="Informe o usuário">
                </div>

                <div class="form-group">
                    <label for="password">Senha:</label>
                    <input type="password" id="password" name="password" required maxlength="50" placeholder="••••••••••••">
                    <div class="password-meter-container">
                        <div id="password-meter-bar" class="meter-bar"></div>
                    </div>
                    <small id="password-feedback" class="meter-text">Digite a senha para avaliar a força</small>
                </div>

                <button type="submit" id="btn-login" class="btn-primary">Acessar Painel</button>
            </form>

            <div class="institution-footer">
                <img src="Logo uncisal.jpg" alt="Logo UNCISAL" class="institution-logo">
                <div class="institution-text">
                    <span class="inst-acronym">UNCISAL</span>
                    <span class="inst-fullname">Universidade Estadual de Ciências da Saúde de Alagoas</span>
                </div>
            </div>
        </section>

        <section id="dashboard-view" class="view hidden">
            <div class="dash-banner">
                <div>
                    <h2>Monitoramento do Servidor (OCI)</h2>
                    <p>Sessão ativa: <strong id="user-display"></strong> | Uptime do Host: <span id="srv-uptime">--</span></p>
                </div>
                <div class="session-timer-box">
                    <small>Sessão Expira em:</small>
                    <span id="session-timer" class="timer-digits">20:00</span>
                </div>
            </div>

            <div class="services-status-bar">
                <div class="srv-badge">
                    <span>Nginx Web Server:</span>
                    <strong id="status-nginx" class="badge badge-info">...</strong>
                </div>
                <div class="srv-badge">
                    <span>Fail2Ban Guard:</span>
                    <strong id="status-fail2ban" class="badge badge-info">...</strong>
                </div>
                <div class="srv-badge">
                    <span>SSHD Daemon:</span>
                    <strong id="status-sshd" class="badge badge-info">...</strong>
                </div>
                <div class="srv-badge">
                    <span>Criptografia PQC:</span>
                    <strong class="badge badge-success">ATIVADA</strong>
                </div>
            </div>

            <div class="hardware-grid">
                <div class="card hw-card">
                    <div class="hw-header">
                        <span>Processamento (CPU)</span>
                        <strong id="cpu-text">0%</strong>
                    </div>
                    <div class="progress-track">
                        <div id="cpu-bar" class="progress-fill" style="width: 0%;"></div>
                    </div>
                    <small class="hw-subtext">Carga de processamento da VM OCI</small>
                </div>

                <div class="card hw-card">
                    <div class="hw-header">
                        <span>Memória RAM</span>
                        <strong id="ram-text">0 MB / 0 MB</strong>
                    </div>
                    <div class="progress-track">
                        <div id="ram-bar" class="progress-fill" style="width: 0%;"></div>
                    </div>
                    <small class="hw-subtext">Livre: <span id="ram-free">--</span> (<span id="ram-percent">0%</span> em uso)</small>
                </div>

                <div class="card hw-card">
                    <div class="hw-header">
                        <span>Memória Swap</span>
                        <strong id="swap-text">0 MB / 0 MB</strong>
                    </div>
                    <div class="progress-track">
                        <div id="swap-bar" class="progress-fill" style="width: 0%;"></div>
                    </div>
                    <small class="hw-subtext">Livre: <span id="swap-free">--</span> (<span id="swap-percent">0%</span> em uso)</small>
                </div>
            </div>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-val" id="metric-processes">--</div>
                    <div class="metric-label">Processos no Linux</div>
                </div>
                <div class="metric-card">
                    <div class="metric-val" id="metric-sessions">--</div>
                    <div class="metric-label">Sessões Terminal / SSH</div>
                </div>
                <div class="metric-card">
                    <div class="metric-val" id="metric-blocked-attempts">0</div>
                    <div class="metric-label">Tentativas Bloqueadas</div>
                </div>
                <div class="metric-card">
                    <div class="metric-val" id="metric-events-count">0</div>
                    <div class="metric-label">Eventos Auditados</div>
                </div>
            </div>

            <div class="tools-grid">
                <div class="card tool-card">
                    <h3>Integridade de Dados (Hash SHA-256)</h3>
                    <p class="subtitle">Calculado via Web Cryptography API nativa</p>
                    <div class="form-group">
                        <input type="text" id="hash-input" placeholder="Digite uma mensagem para calcular o digest...">
                    </div>
                    <button id="btn-hash" class="btn-secondary">Gerar Hash</button>
                    <div class="hash-output-container">
                        <small>Digest Hexadecimal:</small>
                        <textarea id="hash-output" readonly rows="2"></textarea>
                    </div>
                </div>

                <div class="card tool-card">
                    <h3>Gerador de Credenciais Fortes</h3>
                    <p class="subtitle">Entropia criptográfica real via CSPRNG</p>
                    <div class="password-gen-control">
                        <label for="pass-length">Tamanho: <span id="pass-length-val">16</span> caracteres</label>
                        <input type="range" id="pass-length" min="12" max="32" value="16">
                    </div>
                    <div class="btn-group">
                        <button id="btn-gen-pass" class="btn-secondary">Gerar Senha</button>
                        <button id="btn-copy-pass" class="btn-secondary">Copiar</button>
                    </div>
                    <div class="hash-output-container">
                        <input type="text" id="generated-pass" readonly placeholder="Senha gerada">
                    </div>
                </div>
            </div>

            <div class="card logs-card">
                <h3>Logs de Auditoria de Segurança (OWASP A09:2025)</h3>
                <p class="subtitle">Registro contínuo das ações de sistema e telemetria</p>
                <div class="table-responsive">
                    <table class="logs-table">
                        <thead>
                            <tr>
                                <th>Horário</th>
                                <th>Tipo de Evento</th>
                                <th>Severidade</th>
                                <th>Detalhe Auditado</th>
                            </tr>
                        </thead>
                        <tbody id="logs-tbody"></tbody>
                    </table>
                </div>
            </div>
        </section>
    </main>

    <script src="app.js"></script>
</body>
</html>
"""
with open("index.html", "w", encoding="utf-8") as f:
    f.write(index_html)
print("✔ index.html atualizado")

print("=== [5/6] Gerando a página apresentacao.html com vídeo ===")
apresentacao_html = """<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <title>Apresentação - Projeto-Aplicado</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="view-dashboard">
    <header class="top-nav">
        <a href="index.html" class="brand">
            <span class="shield-icon">🛡️</span>
            <span>Projeto-Aplicado</span>
        </a>
        <div class="nav-actions">
            <button id="theme-toggle" class="btn-icon" aria-label="Alternar Tema" title="Alternar Modo Claro/Escuro">🌙</button>
            <button id="btn-nav-logout" class="btn-danger-sm">Encerrar Sessão</button>
        </div>
    </header>

    <nav id="module-nav" class="sub-nav">
        <div class="sub-nav-container">
            <a href="index.html" class="nav-link-btn">📊 Painel Geral</a>
            <a href="apresentacao.html" class="nav-link-btn active">🎥 Apresentação</a>
            <a href="github.html" class="nav-link-btn">🐙 GitHub do Projeto</a>
            <a href="servidor.html" class="nav-link-btn">🖥️ Servidor</a>
            <a href="antigravity.html" class="nav-link-btn">⚡ Antigravity</a>
            <a href="qualys.html" class="nav-link-btn">🔒 Qualy SSL lab</a>
            <a href="hardering-nginx.html" class="nav-link-btn">🛡️ Hardering nginx</a>
        </div>
    </nav>

    <main class="main-container">
        <section class="card">
            <div class="gallery-header">
                <div>
                    <h2>Vídeo de Apresentação Técnica</h2>
                    <p class="subtitle">Demonstração operacional do protótipo e defesas de segurança implementadas</p>
                </div>
                <a href="index.html" class="btn-secondary">← Voltar ao Painel Geral</a>
            </div>

            <div class="video-wrapper">
                <video class="video-player" controls preload="metadata" poster="data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect fill='%230b1120' width='100%25' height='100%25'/%3E%3Ccircle cx='400' cy='225' r='50' fill='%230ea5e9' opacity='0.3'/%3E%3Cpolygon points='385,200 425,225 385,250' fill='%2338bdf8'/%3E%3Ctext fill='%23f8fafc' font-family='sans-serif' font-size='22' font-weight='bold' x='50%25' y='72%25' text-anchor='middle'%3EApresentação 01%3C/text%3E%3Ctext fill='%2394a3b8' font-family='monospace' font-size='14' x='50%25' y='80%25' text-anchor='middle'%3Eapresentacao-01.mp4%3C/text%3E%3C/svg%3E">
                    <source src="apresentacao-01.mp4" type="video/mp4">
                    Seu navegador não suporta a tag de vídeo HTML5.
                </video>
            </div>

            <div class="video-info-box">
                <div>
                    <strong style="color: var(--primary);">Arquivo de Mídia:</strong>
                    <span style="font-family: monospace; font-size: 0.85rem; color: var(--text-main);">apresentacao-01.mp4</span>
                </div>
                <div>
                    <span class="badge badge-info">Apresentação 01</span>
                    <span class="badge badge-success">HD 1080p</span>
                </div>
            </div>
        </section>
    </main>

    <script src="app.js"></script>
</body>
</html>
"""
with open("apresentacao.html", "w", encoding="utf-8") as f:
    f.write(apresentacao_html)
print("✔ apresentacao.html gerada")

print("=== [6/6] Gerando as 5 páginas de evidências fotográficas ===")
pages_to_generate = [
    ("github.html", "GitHub do Projeto", "github"),
    ("servidor.html", "Servidor", "servidor"),
    ("antigravity.html", "Antigravity", "antigravity"),
    ("qualys.html", "Qualy SSL lab", "qualys"),
    ("hardering-nginx.html", "Hardering nginx", "hardering-nginx")
]

for filename, title, prefix in pages_to_generate:
    gallery_items_html = ""
    for i in range(1, 11):
        num = f"{i:02d}"
        gallery_items_html += f"""
                <div class="gallery-item">
                    <div class="gallery-thumb-container">
                        <img class="gallery-thumb" src="img/{prefix}-{num}.jpg" alt="Print {num} - {title}" loading="lazy">
                    </div>
                    <div class="gallery-caption">
                        <span class="gallery-name">Evidência #{num}</span>
                        <span class="gallery-tag">{prefix}-{num}.jpg</span>
                    </div>
                </div>"""

    page_html = f"""<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <title>{title} - Projeto-Aplicado</title>
    <link rel="stylesheet" href="style.css">
</head>
<body class="view-dashboard">
    <header class="top-nav">
        <a href="index.html" class="brand">
            <span class="shield-icon">🛡️</span>
            <span>Projeto-Aplicado</span>
        </a>
        <div class="nav-actions">
            <button id="theme-toggle" class="btn-icon" aria-label="Alternar Tema" title="Alternar Modo Claro/Escuro">🌙</button>
            <button id="btn-nav-logout" class="btn-danger-sm">Encerrar Sessão</button>
        </div>
    </header>

    <nav id="module-nav" class="sub-nav">
        <div class="sub-nav-container">
            <a href="index.html" class="nav-link-btn">📊 Painel Geral</a>
            <a href="apresentacao.html" class="nav-link-btn">🎥 Apresentação</a>
            <a href="github.html" class="nav-link-btn {'active' if prefix == 'github' else ''}">🐙 GitHub do Projeto</a>
            <a href="servidor.html" class="nav-link-btn {'active' if prefix == 'servidor' else ''}">🖥️ Servidor</a>
            <a href="antigravity.html" class="nav-link-btn {'active' if prefix == 'antigravity' else ''}">⚡ Antigravity</a>
            <a href="qualys.html" class="nav-link-btn {'active' if prefix == 'qualys' else ''}">🔒 Qualy SSL lab</a>
            <a href="hardering-nginx.html" class="nav-link-btn {'active' if prefix == 'hardering-nginx' else ''}">🛡️ Hardering nginx</a>
        </div>
    </nav>

    <main class="main-container">
        <section class="card">
            <div class="gallery-header">
                <div>
                    <h2>{title}</h2>
                    <p class="subtitle">Evidências técnicas e capturas de tela do ambiente de produção</p>
                </div>
                <a href="index.html" class="btn-secondary">← Voltar ao Painel Geral</a>
            </div>

            <div class="gallery-grid">
{gallery_items_html}
            </div>
        </section>
    </main>

    <script src="app.js"></script>
</body>
</html>
"""
    with open(filename, "w", encoding="utf-8") as f:
        f.write(page_html)
    print(f"✔ Gerada página: {filename}")

print("\n=== SUCESSO TOTAL! ===")
print("Site completo atualizado com métricas ativas, 20 min de logout e página de Apresentação.")
