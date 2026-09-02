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
*(Aqui serão adicionados os arquivos e scripts do Eixo 3)*