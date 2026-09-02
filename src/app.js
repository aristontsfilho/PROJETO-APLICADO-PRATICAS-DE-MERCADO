/**
 * Protótipo Seguro - Eixo 3
 * Painel Administrativo com Telemetria OCI, Sessão Criptografada e Mitigações OWASP Top 10:2025
 */
(function () {
    "use strict";

    // Credenciais Autorizadas
    const AUTHORIZED_USER = "aristontsfilho";

    const SESSION_KEY = "sec_auth_token";
    const THEME_KEY = "sec_theme_pref";
    const MAX_LOGIN_ATTEMPTS = 3;
    const LOCKOUT_DURATION_MS = 30000;
    const SESSION_DURATION_SECONDS = 5 * 60; // 5 minutos

    let failedAttempts = 0;
    let lockoutUntil = 0;
    let timerInterval = null;
    let metricsInterval = null;
    let auditLogs = [];
    let expectedHash = null;

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

    // =========================================================================
    // CRIPTOGRAFIA ASSÍNCRONA NATIVA (SHA-256 via Web Crypto API)
    // =========================================================================
    async function calculateSHA256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    }

    // Inicializa a referência de comparação do hash criptográfico
    async function initializeSecurityContext() {
        expectedHash = await calculateSHA256("projeto@aristontsfilho");
    }

    function sanitize(str) {
        if (typeof str !== "string") return "";
        return str.replace(/[&<>"'/]/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;", "/": "&#x2F;"
        }[c]));
    }

    function showAlert(msg) {
        loginAlert.textContent = msg;
        loginAlert.className = "alert alert-error";
        loginAlert.classList.remove("hidden");
    }

    function clearAlert() {
        loginAlert.textContent = "";
        loginAlert.className = "alert hidden";
    }

    function logEvent(type, severity, detail) {
        const time = new Date().toLocaleTimeString();
        auditLogs.unshift({ time, type, severity, detail });
        if (auditLogs.length > 25) auditLogs.pop();
        metricEvents.textContent = auditLogs.length;

        logsTbody.replaceChildren();
        auditLogs.forEach(l => {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td>${sanitize(l.time)}</td><td>${sanitize(l.type)}</td><td><span class="badge badge-${l.severity === 'CRITICAL' ? 'danger' : l.severity === 'WARN' ? 'warn' : 'info'}">${sanitize(l.severity)}</span></td><td>${sanitize(l.detail)}</td>`;
            logsTbody.appendChild(tr);
        });
    }

    // =========================================================================
    // TELEMETRIA DO SERVIDOR UBUNTU (OCI)
    // =========================================================================
    async function fetchServerMetrics() {
        try {
            const res = await fetch("/api/metrics");
            if (!res.ok) throw new Error("Falha no proxy de métricas");
            const data = await res.json();

            srvUptime.textContent = data.system.uptime;

            updateServiceBadge(statusNginx, data.services.nginx);
            updateServiceBadge(statusFail2ban, data.services.fail2ban);
            updateServiceBadge(statusSshd, data.services.sshd);

            cpuText.textContent = `${data.cpu_usage_percent}%`;
            cpuBar.style.width = `${Math.min(100, data.cpu_usage_percent)}%`;
            cpuBar.style.backgroundColor = data.cpu_usage_percent > 85 ? "var(--danger)" : "var(--primary)";

            ramText.textContent = `${data.ram.used_mb} MB / ${data.ram.total_mb} MB`;
            ramBar.style.width = `${data.ram.percent}%`;
            ramFree.textContent = `${data.ram.free_mb} MB`;
            ramPercent.textContent = `${data.ram.percent}%`;
            ramBar.style.backgroundColor = data.ram.percent > 90 ? "var(--danger)" : "var(--primary)";

            swapText.textContent = `${data.swap.used_mb} MB / ${data.swap.total_mb} MB`;
            swapBar.style.width = `${data.swap.percent}%`;
            swapFree.textContent = `${data.swap.free_mb} MB`;
            swapPercent.textContent = `${data.swap.percent}%`;

            metricProcesses.textContent = data.system.total_processes;
            metricSessions.textContent = data.system.active_sessions;
        } catch (err) {
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
        metricsInterval = setInterval(fetchServerMetrics, 3000);
    }

    function stopMetricsPolling() {
        clearInterval(metricsInterval);
    }

    // =========================================================================
    // GESTÃO DE SESSÃO E CONTAGEM REGRESSIVA (OWASP A01 / A07)
    // =========================================================================
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
                logEvent("SESSION_TIMEOUT", "WARN", "Sessão expirada por inatividade.");
                terminateSession();
                showAlert("Sua sessão expirou por inatividade. Faça login novamente.");
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
        resetPasswordMeter();
    }

    function showDashboard(username, expiresAt) {
        loginView.classList.add("hidden");
        dashboardView.classList.remove("hidden");
        btnNavLogout.classList.remove("hidden");
        userDisplay.textContent = sanitize(username);
        clearAlert();
        startSessionTimer(expiresAt);
        startMetricsPolling();
    }

    // =========================================================================
    // FLUXO DE LOGIN COM VALIDAÇÃO VIA HASH SHA-256 E RATE LIMITING
    // =========================================================================
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

        if (!expectedHash) {
            await initializeSecurityContext();
        }

        // Calcula o hash SHA-256 da senha digitada
        const inputHash = await calculateSHA256(password);

        // Validação criptográfica (compara usuário e o digest gerado)
        if (username === AUTHORIZED_USER && inputHash === expectedHash) {
            failedAttempts = 0;
            const expiresAt = Date.now() + (SESSION_DURATION_SECONDS * 1000);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, expiresAt }));
            logEvent("AUTH_SUCCESS", "INFO", `Autenticação concedida via SHA-256 para ${username}`);
            showDashboard(username, expiresAt);
        } else {
            failedAttempts++;
            metricBlocked.textContent = failedAttempts;
            if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                logEvent("AUTH_LOCKOUT", "CRITICAL", `Rate limit acionado: 3 tentativas inválidas para ${username}`);
                showAlert("Conta temporariamente bloqueada por 30s devido a tentativas inválidas.");
            } else {
                const remaining = MAX_LOGIN_ATTEMPTS - failedAttempts;
                logEvent("AUTH_FAILED", "WARN", `Tentativa de login incorreta (${failedAttempts}/${MAX_LOGIN_ATTEMPTS}).`);
                showAlert(`Credenciais inválidas. Tentativas restantes: ${remaining}`);
            }
        }
    }

    function terminateSession() {
        sessionStorage.removeItem(SESSION_KEY);
        logEvent("AUTH_LOGOUT", "INFO", "Sessão encerrada com sucesso.");
        showLogin();
    }

    // =========================================================================
    // FERRAMENTAS CRIPTOGRÁFICAS E MEDIDOR DE SENHA
    // =========================================================================
    function evaluatePasswordStrength() {
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
        passwordFeedback.textContent = labels[score];
        passwordFeedback.style.color = colors[score];
    }

    function resetPasswordMeter() {
        passwordMeterBar.style.width = "0%";
        passwordFeedback.textContent = "Digite a senha para avaliar a força";
        passwordFeedback.style.color = "var(--text-muted)";
    }

    // =========================================================================
    // EVENT LISTENERS E INICIALIZAÇÃO
    // =========================================================================
    loginForm.addEventListener("submit", handleLogin);
    btnNavLogout.addEventListener("click", terminateSession);
    passwordInput.addEventListener("input", evaluatePasswordStrength);

    btnHash.addEventListener("click", async () => {
        const t = hashInput.value;
        if (!t) return;
        hashOutput.value = await calculateSHA256(t);
        logEvent("CRYPTO_HASH", "INFO", "Digest SHA-256 gerado");
    });

    btnGenPass.addEventListener("click", () => {
        const len = parseInt(passLengthInput.value, 10);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        const arr = new Uint32Array(len);
        crypto.getRandomValues(arr);
        generatedPass.value = Array.from(arr).map(x => chars[x % chars.length]).join("");
        logEvent("CRYPTO_GEN", "INFO", `Nova credencial CSPRNG de ${len} caracteres gerada`);
    });

    btnCopyPass.addEventListener("click", () => {
        if (!generatedPass.value) return;
        navigator.clipboard.writeText(generatedPass.value).then(() => {
            btnCopyPass.textContent = "Copiado!";
            setTimeout(() => { btnCopyPass.textContent = "Copiar"; }, 2000);
        });
    });

    passLengthInput.addEventListener("input", () => {
        passLengthVal.textContent = passLengthInput.value;
    });

    themeToggle.addEventListener("click", () => {
        const cur = document.documentElement.getAttribute("data-theme") || "dark";
        const nxt = cur === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", nxt);
        localStorage.setItem(THEME_KEY, nxt);
        themeToggle.textContent = nxt === "dark" ? "🌙" : "☀️";
    });

    document.addEventListener("DOMContentLoaded", async () => {
        const savedTheme = localStorage.getItem(THEME_KEY) || "dark";
        document.documentElement.setAttribute("data-theme", savedTheme);
        themeToggle.textContent = savedTheme === "dark" ? "🌙" : "☀️";

        await initializeSecurityContext();
        verifySession();
    });
})();