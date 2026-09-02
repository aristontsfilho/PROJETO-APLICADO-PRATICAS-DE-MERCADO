/**
 * Protótipo Seguro - Eixo 3 (Versão Completa com Utilitários e Auditoria)
 * Aplicação dos princípios Secure by Design e mitigações OWASP Top 10:2025:
 * - A01:2025 (Broken Access Control)
 * - A05:2025 (Injection / XSS)
 * - A07:2025 (Authentication Failures)
 * - A09:2025 (Security Logging and Monitoring Failures)
 */

(function () {
    "use strict";

    // Constantes do Sistema
    const VALID_USER_HASH = "admin_sec";
    const VALID_PASS_HASH = "Projeto2@Seguro";
    const SESSION_KEY = "sec_auth_token";
    const THEME_KEY = "sec_theme_pref";
    const MAX_LOGIN_ATTEMPTS = 3;
    const LOCKOUT_DURATION_MS = 30000;
    const SESSION_DURATION_SECONDS = 5 * 60; // 5 minutos

    // Estado em Memória
    let failedAttempts = 0;
    let lockoutUntil = 0;
    let timerInterval = null;
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

    // Medidor de Senha
    const passwordMeterBar = document.getElementById("password-meter-bar");
    const passwordFeedback = document.getElementById("password-feedback");

    // Métricas
    const metricBlocked = document.getElementById("metric-blocked-attempts");
    const metricEvents = document.getElementById("metric-events-count");

    // Utilitários
    const hashInput = document.getElementById("hash-input");
    const btnHash = document.getElementById("btn-hash");
    const hashOutput = document.getElementById("hash-output");
    const passLengthInput = document.getElementById("pass-length");
    const passLengthVal = document.getElementById("pass-length-val");
    const btnGenPass = document.getElementById("btn-gen-pass");
    const btnCopyPass = document.getElementById("btn-copy-pass");
    const generatedPass = document.getElementById("generated-pass");
    const logsTbody = document.getElementById("logs-tbody");

    // =========================================================================
    // MITIGAÇÃO OWASP A05:2025 (Injection / Prevenção contra XSS)
    // =========================================================================
    function sanitizeText(str) {
        if (typeof str !== "string") return "";
        return str.replace(/[&<>"'/]/g, function (char) {
            const map = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#x27;",
                "/": "&#x2F;"
            };
            return map[char];
        });
    }

    function showAlert(msg) {
        loginAlert.textContent = msg; // Uso de textContent contra injeção de HTML
        loginAlert.className = "alert alert-error";
        loginAlert.classList.remove("hidden");
    }

    function clearAlert() {
        loginAlert.textContent = "";
        loginAlert.className = "alert hidden";
    }

    // =========================================================================
    // MITIGAÇÃO OWASP A09:2025 (Security Logging & Audit Trail)
    // =========================================================================
    function logEvent(type, severity, detail) {
        const timestamp = new Date().toLocaleTimeString();
        const event = {
            time: timestamp,
            type: type,
            severity: severity,
            detail: detail
        };
        auditLogs.unshift(event);
        if (auditLogs.length > 25) auditLogs.pop(); // Mantém os últimos 25 em memória

        metricEvents.textContent = auditLogs.length;
        renderLogs();
    }

    function renderLogs() {
        logsTbody.replaceChildren(); // Limpa com segurança sem innerHTML
        auditLogs.forEach(log => {
            const tr = document.createElement("tr");

            const tdTime = document.createElement("td");
            tdTime.textContent = log.time;

            const tdType = document.createElement("td");
            tdType.textContent = log.type;

            const tdSev = document.createElement("td");
            const spanBadge = document.createElement("span");
            spanBadge.textContent = log.severity;
            spanBadge.className = `badge badge-${log.severity === 'CRITICAL' ? 'danger' : log.severity === 'WARN' ? 'warn' : 'info'}`;
            tdSev.appendChild(spanBadge);

            const tdDetail = document.createElement("td");
            tdDetail.textContent = log.detail;

            tr.append(tdTime, tdType, tdSev, tdDetail);
            logsTbody.appendChild(tr);
        });
    }

    // =========================================================================
    // CONTROLE DE SESSÃO COM CONTAGEM REGRESSIVA (OWASP A01 & A07)
    // =========================================================================
    function startSessionTimer(expirationTimestamp) {
        clearInterval(timerInterval);

        function updateCountdown() {
            const now = Date.now();
            const diffSeconds = Math.max(0, Math.floor((expirationTimestamp - now) / 1000));

            const minutes = String(Math.floor(diffSeconds / 60)).padStart(2, "0");
            const seconds = String(diffSeconds % 60).padStart(2, "0");
            sessionTimerDisplay.textContent = `${minutes}:${seconds}`;

            if (diffSeconds <= 60) {
                sessionTimerDisplay.style.color = "var(--danger)";
            } else {
                sessionTimerDisplay.style.color = "var(--primary)";
            }

            if (diffSeconds <= 0) {
                clearInterval(timerInterval);
                logEvent("SESSION_TIMEOUT", "WARN", "Sessão encerrada por expiração de tempo.");
                terminateSession();
                showAlert("Sua sessão expirou por inatividade. Efetue login novamente.");
            }
        }

        updateCountdown();
        timerInterval = setInterval(updateCountdown, 1000);
    }

    function verifySession() {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) {
            showLoginView();
            return;
        }

        try {
            const session = JSON.parse(raw);
            const now = Date.now();
            if (now >= session.expiresAt) {
                terminateSession();
                showAlert("Sessão expirada.");
                return;
            }
            showDashboardView(session.username, session.expiresAt);
        } catch (e) {
            terminateSession();
        }
    }

    function showLoginView() {
        clearInterval(timerInterval);
        dashboardView.classList.add("hidden");
        btnNavLogout.classList.add("hidden");
        loginView.classList.remove("hidden");
        loginForm.reset();
        resetPasswordMeter();
    }

    function showDashboardView(username, expiresAt) {
        loginView.classList.add("hidden");
        dashboardView.classList.remove("hidden");
        btnNavLogout.classList.remove("hidden");
        userDisplay.textContent = sanitizeText(username);
        clearAlert();
        startSessionTimer(expiresAt);
    }

    // =========================================================================
    // FLUXO DE AUTENTICAÇÃO COM RATE LIMITING (OWASP A07:2025)
    // =========================================================================
    function handleLogin(e) {
        e.preventDefault();
        clearAlert();

        const now = Date.now();
        if (now < lockoutUntil) {
            const remaining = Math.ceil((lockoutUntil - now) / 1000);
            showAlert(`Muitas falhas consecutivas. Bloqueio ativo por ${remaining}s.`);
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (username === VALID_USER_HASH && password === VALID_PASS_HASH) {
            failedAttempts = 0;
            const expiresAt = Date.now() + (SESSION_DURATION_SECONDS * 1000);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, expiresAt }));

            logEvent("AUTH_SUCCESS", "INFO", `Login concedido ao usuário [${username}].`);
            showDashboardView(username, expiresAt);
        } else {
            failedAttempts++;
            metricBlocked.textContent = failedAttempts;

            if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                logEvent("AUTH_LOCKOUT", "CRITICAL", `Rate limiting acionado: 3 tentativas falhas para [${username}].`);
                showAlert("Conta bloqueada temporariamente por 30s devido a tentativas inválidas.");
            } else {
                const left = MAX_LOGIN_ATTEMPTS - failedAttempts;
                logEvent("AUTH_FAILED", "WARN", `Tentativa incorreta de login (${failedAttempts}/${MAX_LOGIN_ATTEMPTS}).`);
                showAlert(`Credenciais inválidas. Tentativas restantes: ${left}`);
            }
        }
    }

    function terminateSession() {
        sessionStorage.removeItem(SESSION_KEY);
        logEvent("AUTH_LOGOUT", "INFO", "Sessão encerrada voluntariamente pelo usuário.");
        showLoginView();
    }

    // =========================================================================
    // FERRAMENTAS CRIPTOGRÁFICAS (SHA-256 e Gerador CSPRNG)
    // =========================================================================
    async function calculateSHA256() {
        const text = hashInput.value;
        if (!text) return;
        const msgBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        hashOutput.value = hashHex;
        logEvent("CRYPTO_HASH", "INFO", "Digest SHA-256 calculado com sucesso.");
    }

    function generateSecurePassword() {
        const length = parseInt(passLengthInput.value, 10);
        const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        const randomValues = new Uint32Array(length);
        crypto.getRandomValues(randomValues); // Geração com entropia real via CSPRNG

        let result = "";
        for (let i = 0; i < length; i++) {
            result += charset[randomValues[i] % charset.length];
        }
        generatedPass.value = result;
        logEvent("CRYPTO_KEYGEN", "INFO", `Nova senha gerada (${length} caracteres de entropia).`);
    }

    function copyGeneratedPassword() {
        if (!generatedPass.value) return;
        navigator.clipboard.writeText(generatedPass.value).then(() => {
            btnCopyPass.textContent = "Copiado!";
            setTimeout(() => { btnCopyPass.textContent = "Copiar"; }, 2000);
        });
    }

    // =========================================================================
    // MEDIDOR DE FORÇA DE SENHA E TEMA
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
        const labels = [
            "Digite a senha...",
            "Muito fraca",
            "Fraca",
            "Média",
            "Forte",
            "Excelente (Forte)"
        ];

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

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        themeToggle.textContent = newTheme === "dark" ? "🌙" : "☀️";
        logEvent("UI_THEME", "INFO", `Tema alterado para [${newTheme}].`);
    }

    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY) || "dark";
        document.documentElement.setAttribute("data-theme", saved);
        themeToggle.textContent = saved === "dark" ? "🌙" : "☀️";
    }

    // =========================================================================
    // LISTENERS E INICIALIZAÇÃO
    // =========================================================================
    loginForm.addEventListener("submit", handleLogin);
    btnNavLogout.addEventListener("click", terminateSession);
    passwordInput.addEventListener("input", evaluatePasswordStrength);
    themeToggle.addEventListener("click", toggleTheme);

    btnHash.addEventListener("click", calculateSHA256);
    btnGenPass.addEventListener("click", generateSecurePassword);
    btnCopyPass.addEventListener("click", copyGeneratedPassword);
    passLengthInput.addEventListener("input", () => {
        passLengthVal.textContent = passLengthInput.value;
    });

    document.addEventListener("DOMContentLoaded", () => {
        initTheme();
        verifySession();
        logEvent("SYSTEM_INIT", "INFO", "Aplicação web carregada sob HTTPS seguro.");
    });
})();