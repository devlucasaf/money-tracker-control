-- Usuários
CREATE TABLE usuarios (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    ativo BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Categorias
CREATE TABLE categorias (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    icone VARCHAR(50),
    cor VARCHAR(7),
    usuario_id BIGINT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Contas
CREATE TABLE contas (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    saldo DECIMAL(15,2) NOT NULL DEFAULT 0,
    cor VARCHAR(7),
    icone VARCHAR(50),
    ativo BIT NOT NULL DEFAULT 1,
    usuario_id BIGINT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Transações
CREATE TABLE transacoes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    data DATE NOT NULL,
    observacao VARCHAR(MAX),
    usuario_id BIGINT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
    categoria_id BIGINT NOT NULL FOREIGN KEY REFERENCES categorias(id),
    conta_id BIGINT NOT NULL FOREIGN KEY REFERENCES contas(id),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Orçamentos
CREATE TABLE orcamentos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    valor_limite DECIMAL(15,2) NOT NULL,
    mes INT NOT NULL,
    ano INT NOT NULL,
    usuario_id BIGINT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
    categoria_id BIGINT NOT NULL FOREIGN KEY REFERENCES categorias(id),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Metas financeiras
CREATE TABLE metas (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao VARCHAR(MAX),
    valor_alvo DECIMAL(15,2) NOT NULL,
    valor_atual DECIMAL(15,2) NOT NULL DEFAULT 0,
    data_limite DATE,
    concluida BIT NOT NULL DEFAULT 0,
    usuario_id BIGINT NOT NULL FOREIGN KEY REFERENCES usuarios(id),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE()
);
