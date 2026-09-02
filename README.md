# Projeto Aplicado- Infraestrutura Segura e Computação em Nuvem

Repositório destinado à entrega técnica do Projeto Aplicado Pratica de Mercado, demonstrando a implantação de infraestrutura segura na Oracle Cloud Infrastructure (OCI) e boas práticas de desenvolvimento seguro.

## 🛡️ Medidas de Segurança Implementadas
- **Acesso Administrativo Seguro:** Acesso remoto restrito via chaves SSH (Ed25519), bloqueio do usuário `root` e desativação total de autenticação por senha.
- **Princípio do Menor Privilégio (Firewall):** Exposição estrita das portas `22/TCP` (gerência), `80/TCP` (ACME/redirecionamento) e `443/TCP` (HTTPS).
- **Proteção contra Força Bruta:** Monitoramento da porta SSH com Fail2Ban (tolerância máxima de 4 tentativas incorretas e banimento de 24 horas).
- **Criptografia e HTTPS:**
  - Redirecionamento automático 301 de HTTP para HTTPS.
  - Certificado SSL/TLS via Let's Encrypt com autorrenovação.
  - Avaliação **Nota A** no Qualys SSL Labs com suporte a **PQC (Post-Quantum Cryptography - X25519MLKEM768)**.

## 📂 Artefatos do Projeto
## 🛡️ Eixo 1: Infraestrutura e Segurança de Redes
- **Acesso Remoto:** SSH com autenticação restrita via chaves Ed25519; acesso do usuário `root` e senhas desativados no `sshd_config`.
- **Firewall de Menor Privilégio:** Apenas as portas `22` (SSH gerenciado), `80` (ACME/HTTP) e `443` (HTTPS) liberadas via UFW e Security Lists da OCI.
- **Defesa Ativa (Fail2Ban):** Monitoramento na porta 22 com tolerância estrita de 4 falhas e bloqueio de 24 horas via `jail.local`.
- **Criptografia e HTTPS:**
  - Redirecionamento automático 301 de HTTP para HTTPS.
  - Certificado SSL/TLS Let's Encrypt com script de autorrenovação periódica.
  - **Nota A** no Qualys SSL Labs com troca de chaves **PQC (Post-Quantum Cryptography - X25519MLKEM768)** habilitada.

---

## 💻 Eixo 3: Protótipo de Software Web (Secure by Design)

O protótipo consiste em uma Single Page Application (SPA) desenvolvida com HTML5, CSS3 e JavaScript seguro, hospedada na infraestrutura Nginx sob HTTPS.

### Estrutura Funcional:
1. **Tela de Login:** Autenticação de usuários com proteção ativa contra abuso.
2. **Página Interna (Dashboard):** Área acessível apenas após validação de token de sessão em memória.
3. **Logout Funcional:** Encerramento explícito com limpeza de sessão e retorno ao estado inicial.

---

## 🛡️ Comprovação de Mitigações OWASP Top 10:2025

| Categoria OWASP Top 10:2025 | Vulnerabilidade Enfrentada | Onde e Como o Código Previne |
| :--- | :--- | :--- |
| **A01:2025 – Broken Access Control** | Acesso indevido a telas internas sem credencial ou via bypass de URL. | **Implementação em `app.js` (`verifySession()`):** Aplica o princípio de *deny-by-default*. Caso não exista token válido e não expirado no `sessionStorage`, o dashboard permanece oculto e o usuário é redirecionado para a tela de login. |
| **A05:2025 – Injection (XSS)** | Execução de scripts maliciosos injetados via campos de formulário no navegador. | **Implementação em `app.js` (`sanitizeInput()` e `textContent`):** Todos os dados inseridos pelo usuário são sanitizados convertendo caracteres como `<`, `>`, `&`, `"`, `'` em entidades HTML. Não se utiliza `innerHTML`, manipulando o DOM exclusivamente através de `textContent`. |
| **A07:2025 – Authentication Failures** | Ataques de força bruta (*brute-force*), *credential stuffing* e sequestro de sessão inativa. | **Implementação em `app.js` (`handleLogin()` e temporizador):** Sistema de *rate limiting* que bloqueia novas tentativas por 30 segundos após 3 erros consecutivos de login. Além disso, as sessões expiram automaticamente após 5 minutos de inatividade. |

---

## 🚀 Como Executar Localmente ou em Produção
1. Clone o repositório:
   ```bash
   git clone git@github.com:aristontsfilho/PROJETO-APLICADO-PRATICAS-DE-MERCADO.git