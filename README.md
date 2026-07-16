<img 
    width=100% 
    src="https://capsule-render.vercel.app/api?type=waving&color=A020F0&height=120&section=header"
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
        src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" 
    />
    <img 
        src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" 
    />
    <img 
        src="https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white" 
    />
    <img 
        src="https://img.shields.io/badge/license-MIT-00C853?style=for-the-badge" 
    />
</p>

<br/>

> **Money Tracker** é um sistema web completo para gestão financeira pessoal, permitindo o controle de receitas, despesas, contas, categorias, metas e orçamentos — tudo em uma única plataforma.

---

## 📋 Sobre o Projeto

O **Money Tracker - Sistema de Gestão Financeira Pessoal** foi desenvolvido para ajudar usuários a organizarem e acompanharem suas finanças de forma prática e intuitiva. A plataforma oferece controle centralizado de todas as movimentações financeiras, com dashboard resumido, gestão de metas e controle de orçamento mensal por categoria.

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura **cliente-servidor (Client-Server)**, com separação clara entre frontend e backend:

- **Frontend:** Vanilla JavaScript (ES6+ Modules) + Vite 5, SPA com template-based routing
- **Backend:** API REST com Spring Boot 3.4.5, Spring Security (JWT Stateless), Spring Data JPA
- **Banco de Dados:** SQL Server (Microsoft) com Hibernate DDL Auto e suporte a Flyway
- **Segurança:** JWT (Auth0 java-jwt) para autenticação, BCrypt para senhas, CORS configurado globalmente
- **Padrão DTO:** Separação completa entre entidades JPA e objetos de transferência
- **Arquitetura Modular:** Backend organizado por módulos de negócio (feature-based)
- **Proxy:** Vite dev server com proxy `/api` para o backend

---

## 🗂️ Estrutura do Projeto

```
📂 money-tracker-control
├── 📂 backend
│   ├── 📂 src/main/java/cloudsupport/moneytracker
│   │   ├── 📂 dto/auth                  # DTOs de autenticação (login/registro)
│   │   ├── 📂 exception                 # Tratamento global de erros
│   │   ├── 📂 infra                     # Camada de infraestrutura
│   │   │   ├── 📂 config                # Configurações gerais (CORS, dev server)
│   │   │   └── 📂 security              # JWT, SecurityConfig, SecurityFilter, TokenService
│   │   └── 📂 modules                   # Módulos de negócio
│   │       ├── 📂 autenticacao          # Login e registro de usuários
│   │       ├── 📂 categoria             # Categorias de receita/despesa
│   │       ├── 📂 conta                 # Contas bancárias e carteiras
│   │       ├── 📂 contapagar            # Contas a pagar (contas/boletos)
│   │       ├── 📂 dashboard             # Resumo financeiro e evolução mensal
│   │       ├── 📂 investimento          # Controle de investimentos
│   │       ├── 📂 meta                  # Metas financeiras e movimentações
│   │       ├── 📂 orcamento             # Orçamento mensal por categoria
│   │       ├── 📂 plano                 # Plano de gastos
│   │       ├── 📂 transacao             # Receitas, despesas e recorrências
│   │       ├── 📂 transferencia         # Transferências entre contas
│   │       └── 📂 usuario               # Controle e perfil de usuários
│   └── 📄 pom.xml
├── 📂 frontend
│   ├── 📂 src
│   │   ├── 📂 scripts                   # Lógica principal da aplicação
│   │   │   ├── 📄 app.js                # Router e inicialização da SPA
│   │   │   ├── 📄 util.js               # Utilitários (tema, helpers)
│   │   │   ├── 📄 customSelect.js       # Componente de select customizado
│   │   │   ├── 📄 datepicker.js         # Componente de seleção de datas
│   │   │   ├── 📄 notificacoes.js       # Central de notificações (sininho)
│   │   │   ├── 📄 buscaGlobal.js        # Busca global no topbar
│   │   │   ├── 📄 confirmacaoSenha.js   # Confirmação por senha em ações críticas
│   │   │   ├── 📂 pages                 # Lógica de cada página
│   │   │   └── 📂 remotes               # Chamadas à API (fetch)
│   │   │       ├── 📂 auth              # Login e Registro
│   │   │       ├── 📂 categorias        # CRUD de categorias
│   │   │       ├── 📂 contas            # CRUD de contas
│   │   │       ├── 📂 contaspagar       # CRUD de contas a pagar
│   │   │       ├── 📂 dashboard         # Dados do dashboard
│   │   │       ├── 📂 investimentos     # CRUD de investimentos
│   │   │       ├── 📂 metas             # CRUD de metas
│   │   │       ├── 📂 orcamentos        # CRUD de orçamentos
│   │   │       ├── 📂 plano             # CRUD de plano de gastos
│   │   │       ├── 📂 transacoes        # CRUD de transações
│   │   │       ├── 📂 transferencias    # Transferências entre contas
│   │   │       └── 📂 usuario           # Perfil do usuário
│   │   ├── 📂 styles                    # Estilos globais e componentes
│   │   └── 📂 templates                 # Templates HTML das páginas
│   ├── 📄 index.html                    # Entry point da SPA
│   ├── 📄 vite.config.js                # Configuração do Vite + proxy
│   └── 📄 package.json
└── 📄 README.md
```

---

## ✨ Funcionalidades

- 🔐 **Autenticação** — Registro e login com JWT
- 💰 **Transações** — Receitas e despesas com categoria, conta, tags, recorrência e parcelamento
- 🔍 **Filtros e Busca** — Filtragem de transações por período, categoria, conta, tipo e tag
- 🏦 **Contas** — Gerenciamento de contas bancárias, carteiras e poupanças
- 🔄 **Transferências** — Movimentação de valores entre contas
- 🏷️ **Categorias** — Organização por tipo (receita/despesa) com cor
- 📄 **Contas a Pagar/Receber** — Controle de compromissos a vencer com baixa automática no saldo
- 📈 **Investimentos** — Acompanhamento de investimentos, rendimento e gráfico de rentabilidade
- 📊 **Dashboard** — Resumo mensal com receitas, despesas, saldo, gráficos e navegação por mês
- 📉 **Comparativo Mês a Mês** — Variação percentual de receitas e despesas frente ao mês anterior
- 🔮 **Saldo Projetado** — Previsão do saldo de fim de mês com base em pendências e recorrências
- 🎯 **Metas** — Objetivos financeiros com aportes/resgates, gráfico de evolução e **previsão de conclusão**
- 📋 **Orçamentos** — Limite mensal por categoria com alertas e **rollover** (acúmulo de sobra)
- 🗓️ **Plano de Gastos** — Divisão da renda em gastar / emergência / guardar
- 🔔 **Central de Notificações** — Alertas de contas vencendo, orçamentos estourados e metas atingidas
- 🔎 **Busca Global** — Pesquisa unificada em transações, contas, metas e categorias
- 🔒 **Confirmação por Senha** — Validação da senha em ações críticas (ex.: excluir conta)
- 👤 **Perfil** — Edição de dados pessoais, moeda preferida e senha
- 🌙 **Tema** — Alternância entre tema claro e escuro

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
git clone https://github.com/devlucasaf/money-tracker-control.git
cd money-tracker-control
```

### 2. Configure o Backend

```bash
cd backend
```

Configure as variáveis de ambiente (ou edite `src/main/resources/application.properties`):

```properties
DB_URL=jdbc:sqlserver://localhost:1433;databaseName=money_tracker;encrypt=true;trustServerCertificate=true
DB_USERNAME=sa
DB_PASSWORD=sua_senha
JWT_SECRET=sua-chave-secreta-jwt
```

> 💡 Para desenvolvimento local, você pode usar o profile `local` (`application-local.properties`), ativo por padrão.

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
    src="https://capsule-render.vercel.app/api?type=waving&color=A020F0&height=120&section=footer"
/>
