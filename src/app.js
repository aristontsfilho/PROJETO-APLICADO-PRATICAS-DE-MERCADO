/**
 * Protótipo Seguro - Eixo 3
 * Aplicação dos princípios Secure by Design e mitigação das categorias OWASP Top 10:2025:
 * - A01:2025 (Broken Access Control)
 * - A05:2025 (Injection / XSS)
 * - A07:2025 (Authentication Failures)
 */

(function () {
    "use strict";

    // Constantes de credenciais e segurança de sessão
    const VALID_USER_HASH = "admin_sec";
    const VALID_PASS_HASH = "Projeto2@Seguro";
    const SESSION_KEY = "sec_auth_token";
    const MAX_LOGIN_ATTEMPTS = 3;
    const LOCKOUT_DURATION_MS = 30000; // 30 segundos de bloqueio temporário
    const SESSION_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutos de expiração por inatividade

    // Estado interno em memória
    let failedAttempts = 0;
    let lockoutUntil = 0;

    // Elementos do DOM
    const loginView = document.getElementById("login-view");
    const dashboardView = document.getElementById("dashboard-view");
    const loginForm = document.getElementById("login-form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginAlert = document.getElementById("login-alert");
    const userDisplay = document.getElementById("user-display");
    const btnLogout = document.getElementById("btn-logout");

    // =========================================================================
    // MITIGAÇÃO OWASP A05:2025 (Injection - Prevenção contra Cross-Site Scripting)
    // =========================================================================
    function sanitizeInput(str) {
        if (typeof str !== "string") return "";
        return str
            .trim()
            .replace(/[&<>"'/]/g, function (char) {
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

    function showAlert(message) {
        // Uso exclusivo de textContent para evitar injeções XSS refletidas
        loginAlert.textContent = message;
        loginAlert.className = "alert alert-error";
        loginAlert.classList.remove("hidden");
    }

    function clearAlert() {
        loginAlert.textContent = "";
        loginAlert.className = "alert hidden";
    }

    // =========================================================================
    // MITIGAÇÃO OWASP A01:2025 (Broken Access Control - Deny by Default)
    // =========================================================================
    function verifySession() {
        const sessionDataRaw = sessionStorage.getItem(SESSION_KEY);
        if (!sessionDataRaw) {
            // Nenhuma sessão ativa: força estado de acesso negado
            showLoginView();
            return false;
        }

        try {
            const session = JSON.parse(sessionDataRaw);
            const now = Date.now();

            // Expira a sessão se o tempo limite foi atingido
            if (now - session.timestamp > SESSION_EXPIRATION_MS) {
                terminateSession();
                showAlert("Sessão expirada por inatividade. Faça login novamente.");
                return false;
            }

            // Sessão válida: atualiza o timestamp e renderiza a tela protegida
            session.timestamp = now;
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            showDashboardView(session.username);
            return true;
        } catch (e) {
            terminateSession();
            showLoginView();
            return false;
        }
    }

    function showLoginView() {
        dashboardView.classList.add("hidden");
        loginView.classList.remove("hidden");
        userDisplay.textContent = "";
        loginForm.reset();
    }

    function showDashboardView(username) {
        loginView.classList.add("hidden");
        dashboardView.classList.remove("hidden");
        clearAlert();
        // Renderiza o nome sanitizado estritamente via textContent
        userDisplay.textContent = sanitizeInput(username);
    }

    // =========================================================================
    // MITIGAÇÃO OWASP A07:2025 (Authentication Failures - Rate Limiting e Logout)
    // =========================================================================
    function handleLogin(event) {
        event.preventDefault();
        clearAlert();

        const now = Date.now();
        if (now < lockoutUntil) {
            const secondsLeft = Math.ceil((lockoutUntil - now) / 1000);
            showAlert(`Muitas tentativas falhas. Aguarde ${secondsLeft}s para tentar novamente.`);
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Validação de formato e preenchimento
        if (!username || !password) {
            showAlert("Por favor, preencha todos os campos.");
            return;
        }

        // Checagem de credenciais
        if (username === VALID_USER_HASH && password === VALID_PASS_HASH) {
            // Reset de falhas em caso de sucesso
            failedAttempts = 0;
            const sessionPayload = {
                username: username,
                timestamp: Date.now()
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
            showDashboardView(username);
        } else {
            failedAttempts += 1;
            if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
                lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
                showAlert("Conta temporariamente bloqueada por 30s devido a tentativas consecutivas inválidas.");
            } else {
                const remaining = MAX_LOGIN_ATTEMPTS - failedAttempts;
                showAlert(`Credenciais inválidas. Tentativas restantes antes do bloqueio: ${remaining}`);
            }
        }
    }

    function terminateSession() {
        sessionStorage.removeItem(SESSION_KEY);
        showLoginView();
    }

    // Ouvintes de eventos
    loginForm.addEventListener("submit", handleLogin);
    btnLogout.addEventListener("click", terminateSession);

    // Inicialização da verificação de autorização ao carregar a página
    document.addEventListener("DOMContentLoaded", verifySession);
})();