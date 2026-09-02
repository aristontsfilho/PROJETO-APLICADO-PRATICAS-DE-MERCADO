# Projeto Aplicado- Infraestrutura Segura e Computação em Nuvem

Repositório destinado à entrega técnica do Projeto Aplicado Pratica de Mercado, demonstrando a implantação de infraestrutura segura na Oracle Cloud Infrastructure (OCI) e boas práticas de desenvolvimento seguro.
---

## 🛡️ Eixo 1: Infraestrutura e Segurança de Redes
- **Acesso Remoto Seguro:** Acesso administrativo restrito via chaves SSH assimétricas (Ed25519); autenticação por senha padrão desabilitada e login direto do usuário `root` bloqueado no `sshd_config`.
- **Firewall de Menor Privilégio (Least Privilege):** Exposição estrita das portas essenciais `22/TCP` (gerência remota), `80/TCP` (redirecionamento/ACME) e `443/TCP` (HTTPS).
- **Defesa Ativa (Fail2Ban):** Monitoramento da porta 22 com tolerância máxima de **4 falhas consecutivas** e tempo de **banimento de 24 horas**.
- **Criptografia e HTTPS:**
  - Redirecionamento automático 301 de todo o tráfego HTTP para HTTPS.
  - Certificado SSL/TLS via Let's Encrypt com autorrenovação periódica.
  - Avaliação **Nota A** no Qualys SSL Labs com suporte a **PQC (Post-Quantum Cryptography - X25519MLKEM768)** devidamente ativado.

---

## 📂 Eixo 2: Repositório e Gestão de Segredos
- **Hospedagem Pública:** Código versionado publicamente no GitHub (`aristontsfilho/PROJETO-APLICADO-PRATICAS-DE-MERCADO`).
- **Prevenção de Vazamento de Dados:** Utilização de `.gitignore` rigoroso bloqueando arquivos `.env`, chaves privadas (`*.key`, `*.pem`, `id_*`), credenciais de cloud e dumps locais.
- **Armazenamento Seguro:** Isolamento completo de credenciais de infraestrutura utilizando o recurso **GitHub Secrets** (`SERVER_HOST`, `SERVER_USER`, `SERVER_PORT`, `SSH_PRIVATE_KEY`).

---

## 💻 Eixo 3: Protótipo de Software Web (Secure by Design)

Single Page Application (SPA) desenvolvida com HTML5, CSS3 e JavaScript moderno, mitigando ativamente 3 categorias do **OWASP Top 10:2025**:

| Categoria OWASP Top 10:2025 | Vulnerabilidade Enfrentada | Onde e Como o Código Previne |
| :--- | :--- | :--- |
| **A01:2025 – Broken Access Control** | Acesso não autorizado a rotas/telas internas sem login. | **`app.js` (`verifySession`):** Princípio de *deny-by-default*. Sem token ativo ou com sessão inativa expirada, o dashboard permanece oculto e o usuário é forçado para o login. |
| **A05:2025 – Injection (XSS)** | Execução arbitrária de scripts injetados em inputs de formulário. | **`app.js` (`sanitizeInput` / `textContent`):** Todos os dados inseridos são sanitizados para entidades HTML seguras, manipulando o DOM sem uso de `innerHTML`. |
| **A07:2025 – Authentication Failures** | Ataques de força bruta e roubo de sessões abandonadas. | **`app.js` (`handleLogin`):** Limitação de tentativas (*rate limiting*) com bloqueio de 30s após 3 falhas e expiração automática de sessão por inatividade. |

---

## 🚀 Eixos 1, 2 e 3: Integração e Entrega Contínuas (CI/CD)

O ciclo de implantação é disparado automaticamente a cada alteração:
1. **Ambiente Local:** Escrita e testes do código na IDE assistida por IA (Antigravity).
2. **Versionamento:** Envio das alterações para o repositório central através do comando `git push origin main`.
3. **Pipeline no GitHub Actions:** O runner executa o arquivo `.github/workflows/deploy.yml`, recupera as chaves criptografadas via Secrets e autentica via SSH na VM da Oracle Cloud.
4. **Deploy Automático:** O servidor atualiza os arquivos em `/var/www/projeto-aplicado/src`, refletindo as mudanças em produção sob HTTPS instantaneamente.