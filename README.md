<img 
    width=100% 
    src="https://capsule-render.vercel.app/api?type=waving&color=00C853&height=120&section=header"
/>

<p align="center">
    <img 
        src="https://img.shields.io/badge/status-em%20progresso-yellow?style=for-the-badge" 
    />
    <img 
        src="https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" 
    />
    <img 
        src="https://img.shields.io/badge/Spring%20Boot-3.4.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" 
    />
    <img 
        src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" 
    />
    <img 
        src="https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" 
    />
    <img 
        src="https://img.shields.io/badge/license-MIT-00C853?style=for-the-badge" 
    />
</p>

<br/>

> **SGFP** é um sistema web completo para gestão financeira pessoal, permitindo o controle de receitas, despesas, contas, categorias, metas e orçamentos — tudo em uma única plataforma.

---

## 📋 Sobre o Projeto

O **SGFP - Sistema de Gestão Financeira Pessoal** foi desenvolvido para ajudar usuários a organizarem e acompanharem suas finanças de forma prática e intuitiva. A plataforma oferece controle centralizado de todas as movimentações financeiras, com dashboard resumido, gestão de metas e controle de orçamento mensal por categoria.

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura **cliente-servidor (Client-Server)**, com separação clara entre frontend e backend:

- **Frontend:** React 18 + Vite, responsável pela interface do usuário
- **Backend:** API REST com Spring Boot 3.4.5, Spring Security (JWT Stateless), Spring Data JPA
- **Banco de Dados:** SQL Server + Flyway (migrations)
- **Segurança:** JWT para autenticação, BCrypt para senhas, CORS configurado globalmente
- **Padrão DTO:** Separação completa entre entidades JPA e objetos de transferência

> 📖 Para mais detalhes sobre a arquitetura utilizada, consulte a [documentação de introdução](https://cloudsupport.dev/manual/introducao/).

---

## 🗂️ Estrutura do Projeto

```
📂 SGFP-Sistema-De-Gestao-Financeira-Pessoal
├── 📂 backend
│   ├── 📂 src/main/java/com/tracker/control
│   │   ├── 📂 dto/auth                  # DTOs de autenticação
│   │   ├── 📂 entity                    # Entidades JPA
│   │   ├── 📂 exception                 # Tratamento global de erros
│   │   ├── 📂 infra                     # Camada de infraestrutura
│   │   │   ├── 📂 config                # Configurações gerais (CORS)
│   │   │   └── 📂 security              # JWT, SecurityConfig, SecurityFilter
│   │   └── 📂 modules                   # Módulos de negócio
│   │       ├── 📂 autenticacao           # Login e registro de usuários
│   │       ├── 📂 categoria              # Categorias de receita/despesa
│   │       ├── 📂 conta                  # Contas bancárias e carteiras
│   │       ├── 📂 dashboard              # Resumo financeiro mensal
│   │       ├── 📂 meta                   # Metas financeiras
│   │       ├── 📂 orcamento              # Orçamento mensal por categoria
│   │       ├── 📂 transacao              # Receitas e despesas
│   │       └── 📂 usuario                # Controle de usuários
│   └── 📄 pom.xml
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 components                # Componentes reutilizáveis
│   │   ├── 📂 pages                     # Páginas da aplicação
│   │   │   └── 📂 auth                  # Login e Registro
│   │   ├── 📂 services                  # Chamadas à API
│   │   └── 📂 styles                    # Estilos globais
│   └── 📄 package.json
└── 📄 README.md
```

---

## ✨ Funcionalidades

- 🔐 **Autenticação** — Registro e login com JWT
- 💰 **Transações** — Cadastro de receitas e despesas com categoria e conta
- 🏦 **Contas** — Gerenciamento de contas bancárias, carteiras e poupanças
- 🏷️ **Categorias** — Organização por tipo (receita/despesa) com ícone e cor
- 📊 **Dashboard** — Resumo mensal com total de receitas, despesas e saldo
- 🎯 **Metas** — Definição de objetivos financeiros com acompanhamento de progresso
- 📋 **Orçamentos** — Limite de gastos mensal por categoria com controle automático

---

## 🛠️ Tecnologias

<div align="center">
    <img 
        alt="Java" 
        title="Java" 
        width="40px" 
        style="padding: 5px;" 
        src="https://skillicons.dev/icons?i=java" 
    />
    <img 
        alt="Spring" 
        title="Spring" 
        width="40px" 
        style="padding: 5px;" 
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/spring/spring-original.svg" 
    />
    <img 
        alt="SQL Server" 
        title="SQL Server" 
        width="40px" 
        style="padding: 5px;" 
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-original.svg" 
    />
    <img 
        alt="JavaScript" 
        title="JavaScript" 
        width="40px" 
        style="padding: 5px;" 
        src="https://skillicons.dev/icons?i=javascript" 
    />
    <img 
        alt="React" 
        title="React" 
        width="40px" 
        style="padding: 5px;" 
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" 
    />
    <img 
        alt="Vite" 
        title="Vite" 
        width="40px" 
        style="padding: 5px;" 
        src="https://skillicons.dev/icons?i=vite" 
    />
    <img 
        alt="HTML" 
        title="HTML" 
        width="40px" 
        style="padding: 5px;" 
        src="https://skillicons.dev/icons?i=html" 
    />
    <img 
        alt="CSS" 
        title="CSS" 
        width="40px" 
        style="padding: 5px;" 
        src="https://skillicons.dev/icons?i=css" 
    />
    <img 
        alt="Git" 
        title="Git" 
        width="40px" 
        style="padding: 5px;" 
        src="https://skillicons.dev/icons?i=git" 
    />
    <img 
        alt="GitHub" 
        title="GitHub" 
        width="40px" 
        style="padding: 5px;" 
        src="https://skillicons.dev/icons?i=github" 
    />
    <img 
        alt="IntelliJ" 
        title="IntelliJ IDEA" 
        width="40px" 
        style="padding: 5px;" 
        src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/intellij/intellij-original.svg" 
    />
    <img 
        alt="VS Code" 
        title="VS Code" 
        width="40px" 
        style="padding: 5px;" 
        src="https://skillicons.dev/icons?i=vscode" 
    />
</div>

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Java 17+](https://adoptium.net/)
- [Node.js 18+](https://nodejs.org/)
- [SQL Server](https://www.microsoft.com/sql-server) rodando na porta `1433`
- [Maven](https://maven.apache.org/) (ou use o wrapper `mvnw` incluso)

### 1. Clone o repositório

```bash
git clone https://github.com/devlucasaf/SGFP-Sistema-De-Gestao-Financeira-Pessoal.git
cd SGFP-Sistema-De-Gestao-Financeira-Pessoal
```

### 2. Configure o Backend

```bash
cd backend
```

Configure o arquivo `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=money_tracker;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=sua_senha

api.security.token.secret=sua-chave-secreta-jwt
```

Inicie o servidor:

```bash
./mvnw spring-boot:run
```

> ✅ API disponível em `http://localhost:8080`

### 3. Configure o Frontend

```bash
cd ../frontend
npm install
npm run dev
```

> ✅ Aplicação disponível em `http://localhost:5173`

---

## 👤 Desenvolvedor

<table>
    <tr>
        <td align="center">
            <a href="https://github.com/devlucasaf">
                <img 
                    src="https://github.com/devlucasaf.png" 
                    width="80px;" 
                    style="border-radius: 50%;" 
                    alt="Lucas Freitas"
                />
                <br/>
                <sub><b>Lucas Freitas</b></sub>
            </a><br/>
            <sub>Fullstack Developer</sub>
        </td>
    </tr>
</table>

---

## 🏆 Licença

Este projeto está sob a licença **MIT**. Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

<img 
    width=100% 
    src="https://capsule-render.vercel.app/api?type=waving&color=00C853&height=120&section=footer"
/>
