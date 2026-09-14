(function () {
    "use strict";

    let authorizedUsers = {};

    const SESSION_KEY = "sec_auth_token";
    const THEME_KEY = "sec_theme_pref";
    const MAX_LOGIN_ATTEMPTS = 3;
    const LOCKOUT_DURATION_MS = 30000;
    const SESSION_DURATION_SECONDS = 20 * 60;

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
            if (!res.ok) throw new Error("Fallback simulação");
            const data = await res.json();
            renderMetrics(data);
        } catch (err) {
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

    // =========================================================================
    // INICIALIZAÇÃO DO LIGHTBOX (AMPLIAÇÃO EM TAMANHO REAL)
    // =========================================================================
    function setupLightbox() {
        const modal = document.getElementById("lightbox-modal");
        const modalImg = document.getElementById("lightbox-img");
        const modalCaption = document.getElementById("lightbox-caption");
        const modalClose = document.getElementById("lightbox-close");

        if (!modal || !modalImg) return;

        let scale = 1;
        let panX = 0;
        let panY = 0;
        let isDragging = false;
        let startX = 0;
        let startY = 0;

        let toolbar = modal.querySelector(".lightbox-toolbar");
        if (!toolbar) {
            toolbar = document.createElement("div");
            toolbar.className = "lightbox-toolbar";
            toolbar.innerHTML = `
                <button id="lb-zoom-out" class="lightbox-btn" title="Reduzir Zoom (Scroll para baixo)">🔍 -</button>
                <span id="lb-zoom-level" class="lightbox-zoom-level">100%</span>
                <button id="lb-zoom-in" class="lightbox-btn" title="Ampliar Zoom (Scroll para cima)">🔍 +</button>
                <button id="lb-zoom-reset" class="lightbox-btn" title="Restaurar Tamanho">↺ 100%</button>
            `;
            modal.appendChild(toolbar);
        }

        const btnZoomIn = document.getElementById("lb-zoom-in");
        const btnZoomOut = document.getElementById("lb-zoom-out");
        const btnZoomReset = document.getElementById("lb-zoom-reset");
        const zoomLevelDisplay = document.getElementById("lb-zoom-level");

        function updateTransform() {
            modalImg.style.transition = isDragging ? "none" : "transform 0.15s ease-out";
            modalImg.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
            if (zoomLevelDisplay) {
                zoomLevelDisplay.textContent = `${Math.round(scale * 100)}%`;
            }
            if (scale > 1) {
                modalImg.style.cursor = isDragging ? "grabbing" : "grab";
            } else {
                modalImg.style.cursor = "zoom-in";
            }
        }

        function setZoom(newScale) {
            scale = Math.min(5, Math.max(1, newScale));
            if (scale === 1) {
                panX = 0;
                panY = 0;
            }
            updateTransform();
        }

        function resetZoom() {
            scale = 1;
            panX = 0;
            panY = 0;
            updateTransform();
        }

        if (btnZoomIn) btnZoomIn.addEventListener("click", (e) => { e.stopPropagation(); setZoom(scale + 0.5); });
        if (btnZoomOut) btnZoomOut.addEventListener("click", (e) => { e.stopPropagation(); setZoom(scale - 0.5); });
        if (btnZoomReset) btnZoomReset.addEventListener("click", (e) => { e.stopPropagation(); resetZoom(); });

        modalImg.addEventListener("click", (e) => {
            e.stopPropagation();
            if (scale > 1) {
                resetZoom();
            } else {
                setZoom(2.5);
            }
        });

        modal.addEventListener("wheel", (e) => {
            if (!modal.classList.contains("active")) return;
            e.preventDefault();
            const delta = e.deltaY < 0 ? 0.25 : -0.25;
            setZoom(scale + delta);
        }, { passive: false });

        modalImg.addEventListener("mousedown", (e) => {
            if (scale <= 1) return;
            e.preventDefault();
            isDragging = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            updateTransform();
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            updateTransform();
        });

        window.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                updateTransform();
            }
        });

        document.querySelectorAll(".gallery-item").forEach(card => {
            card.addEventListener("click", () => {
                const img = card.querySelector(".gallery-thumb");
                const tag = card.querySelector(".gallery-tag");
                const name = card.querySelector(".gallery-name");

                if (img) {
                    resetZoom();
                    modalImg.src = img.src;
                    if (modalCaption) {
                        modalCaption.innerHTML = `<strong>${name ? name.textContent : ''}</strong> — <span style="font-family: monospace; color: var(--primary);">${tag ? tag.textContent : ''}</span>`;
                    }
                    modal.classList.add("active");
                }
            });
        });

        function closeModal() {
            modal.classList.remove("active");
            resetZoom();
            modalImg.src = "";
        }

        if (modalClose) modalClose.addEventListener("click", closeModal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal || e.target.classList.contains("lightbox-content")) {
                closeModal();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("active")) {
                closeModal();
            }
        });
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
        setupLightbox();
    });
})();
