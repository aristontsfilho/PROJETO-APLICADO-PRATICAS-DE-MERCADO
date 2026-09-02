/**
 * Protótipo Seguro - Eixo 3 (Com Telemetria em Tempo Real do Servidor Ubuntu)
 */
(function () {
    "use strict";

    const VALID_USER_HASH = "admin_sec";
    const VALID_PASS_HASH = "Projeto2@Seguro";
    const SESSION_KEY = "sec_auth_token";
    const THEME_KEY = "sec_theme_pref";
    const MAX_LOGIN_ATTEMPTS = 3;
    const LOCKOUT_DURATION_MS = 30000;
    const SESSION_DURATION_SECONDS = 5 * 60;

    let failedAttempts = 0;
    let lockoutUntil = 0;
    let timerInterval = null;
    let metricsInterval = null;
    let auditLogs = [];

    // Elementos do DOM
    const loginView = document.getElementById("login-view");
    const dashboardView = document.getElementById("dashboard-view");
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginAlert = document.getElementById("login-alert");
    const userDisplay = document.getElementById("user-display");
    const btnNavLogout = document.getElementById("btn-nav-logout");
    const themeToggle = document.getElementById("theme-toggle");
    const sessionTimerDisplay = document.getElementById("session-timer");

    // Elementos de Telemetria
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

    // Utilitários Criptográficos
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

    function sanitize(str) {
        if (typeof str !== "string") return "";
        return str.replace(/[&<>"'/]/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;"
        }[c]));
    }

    function logEvent(type, severity, detail) {
        const time = new Date().toLocaleTimeString();
        auditLogs.unshift({ time, type, severity, detail });
        if (auditLogs.length > 20) auditLogs.pop();
        metricEvents.textContent = auditLogs.length;

        logsTbody.replaceChildren();
        auditLogs.forEach(l => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${sanitize(l.time)}</td><td>${sanitize(l.type)}</td><td><span class="badge badge-${l.severity === 'CRITICAL' ? 'danger' : l.severity === 'WARN' ? 'warn' : 'info'}">${sanitize(l.severity)}</span></td><td>${sanitize(l.detail)}</td>`;
            logsTbody.appendChild(tr);
        });
    }

    // TELEMETRIA DO SISTEMA OPERACIONAL UBUNTU
    async function fetchServerMetrics() {
        try {
            const res = await fetch("/api/metrics");
            if (!res.ok) throw new Error("Falha ao obter telemetria");
            const data = await res.json();

            // Uptime
            srvUptime.textContent = data.system.uptime;

            // Status Serviços
            updateServiceBadge(statusNginx, data.services.nginx);
            updateServiceBadge(statusFail2ban, data.services.fail2ban);
            updateServiceBadge(statusSshd, data.services.sshd);

            // CPU
            cpuText.textContent = `${data.cpu_usage_percent}%`;
            cpuBar.style.width = `${Math.min(100, data.cpu_usage_percent)}%`;
            cpuBar.style.backgroundColor = data.cpu_usage_percent > 85 ? "var(--danger)" : "var(--primary)";

            // RAM
            ramText.textContent = `${data.ram.used_mb} MB / ${data.ram.total_mb} MB`;
            ramBar.style.width = `${data.ram.percent}%`;
            ramFree.textContent = `${data.ram.free_mb} MB`;
            ramPercent.textContent = `${data.ram.percent}%`;
            ramBar.style.backgroundColor = data.ram.percent > 90 ? "var(--danger)" : "var(--primary)";

            // SWAP
            swapText.textContent = `${data.swap.used_mb} MB / ${data.swap.total_mb} MB`;
            swapBar.style.width = `${data.swap.percent}%`;
            swapFree.textContent = `${data.swap.free_mb} MB`;
            swapPercent.textContent = `${data.swap.percent}%`;

            // Processos e Sessões
            metricProcesses.textContent = data.system.total_processes;
            metricSessions.textContent = data.system.active_sessions;
        } catch (err) {
            // Em caso de falha de conexão com a API
            srvUptime.textContent = "Offline";
        }
    }

    function updateServiceBadge(element, status) {
        element.textContent = status ? status.toUpperCase() : "INACTIVE";
        element.className = (status === "active") ? "badge badge-success" : "badge badge-danger";
    }

    function startMetricsPolling() {
        fetchServerMetrics();
        clearInterval(metricsInterval);
        metricsInterval = setInterval(fetchServerMetrics, 3000); // Polling a cada 3 segundos
    }

    function stopMetricsPolling() {
        clearInterval(metricsInterval);
    }

    // SESSÃO E CONTAGEM REGRESSIVA
    function startSessionTimer(expirationTimestamp) {
        clearInterval(timerInterval);
        function tick() {
            const diff = Math.max(0, Math.floor((expirationTimestamp - Date.now()) / 1000));
            const m = String(Math.floor(diff / 60)).padStart(2, "0");
            const s = String(diff % 60).padStart(2, "0");
            sessionTimerDisplay.textContent = `${m}:${s}`;
            if (diff <= 60) sessionTimerDisplay.style.color = "var(--danger)";
            if (diff <= 0) {
                clearInterval(timerInterval);
                terminateSession();
            }
        }
        tick();
        timerInterval = setInterval(tick, 1000);
    }

    function verifySession() {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) { showLogin(); return; }
        try {
            const s = JSON.parse(raw);
            if (Date.now() >= s.expiresAt) { terminateSession(); return; }
            showDashboard(s.username, s.expiresAt);
        } catch (e) { terminateSession(); }
    }

    function showLogin() {
        clearInterval(timerInterval);
        stopMetricsPolling();
        dashboardView.classList.add("hidden");
        btnNavLogout.classList.add("hidden");
        loginView.classList.remove("hidden");
        loginForm.reset();
    }

    function showDashboard(username, expiresAt) {
        loginView.classList.add("hidden");
        dashboardView.classList.remove("hidden");
        btnNavLogout.classList.remove("hidden");
        userDisplay.textContent = sanitize(username);
        startSessionTimer(expiresAt);
        startMetricsPolling();
    }

    function handleLogin(e) {
        e.preventDefault();
        const now = Date.now();
        if (now < lockoutUntil) return;

        const u = usernameInput.value.trim();
        const p = passwordInput.value;

        if (u === VALID_USER_HASH && p === VALID_PASS_HASH) {
            failedAttempts = 0;
            const expiresAt = Date.now() + (SESSION_DURATION_SECONDS * 1000);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: u, expiresAt }));
            logEvent("AUTH_SUCCESS", "INFO", `Sessão concedida para ${u}`);
            showDashboard(u, expiresAt);
        } else {
            failedAttempts++;
            metricBlocked.textContent = failedAttempts;
            if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                logEvent("AUTH_LOCKOUT", "CRITICAL", `Rate limiting acionado para ${u}`);
            }
        }
    }

    function terminateSession() {
        sessionStorage.removeItem(SESSION_KEY);
        logEvent("AUTH_LOGOUT", "INFO", "Sessão finalizada");
        showLogin();
    }

    // EVENT LISTENERS
    loginForm.addEventListener("submit", handleLogin);
    btnNavLogout.addEventListener("click", terminateSession);

    // Utilitários SHA-256 e Password Gen
    btnHash.addEventListener("click", async () => {
        const t = hashInput.value;
        if (!t) return;
        const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
        hashOutput.value = Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join("");
        logEvent("CRYPTO_HASH", "INFO", "SHA-256 gerado");
    });

    btnGenPass.addEventListener("click", () => {
        const len = parseInt(passLengthInput.value, 10);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        generatedPass.value = Array.from(arr).map(x => chars[x % chars.length]).join("");
        logEvent("CRYPTO_GEN", "INFO", `Senha segura de ${len} bytes gerada`);
    });

    btnCopyPass.addEventListener("click", () => {
        if (!generatedPass.value) return;
        navigator.clipboard.writeText(generatedPass.value);
    });

    passLengthInput.addEventListener("input", () => {
        passLengthVal.textContent = passLengthInput.value;
    });

    // Tema
    themeToggle.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme") || "dark";
        const nxt = cur === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nxt);
        localStorage.setItem(THEME_KEY, nxt);
        themeToggle.textContent = nxt === "dark" ? "🌙" : "☀️";
    });

    document.addEventListener("DOMContentLoaded", () => {
        const saved = localStorage.getItem(THEME_KEY) || "dark";
        document.documentElement.setAttribute("data-theme", saved);
        themeToggle.textContent = saved === "dark" ? "🌙" : "☀️";
        verifySession();
    });
})();