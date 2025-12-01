# 🗺️ FLUXO DE NAVEGAÇÃO - MAPEAMENTO DO SISTEMA
## SPA - Sistema de Perfil Discente (FMPSC)

---

## 📋 ÍNDICE

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Diagramas de Fluxo](#diagramas-de-fluxo)
3. [Mapeamento de Telas](#mapeamento-de-telas)
4. [Interações do Usuário](#interações-do-usuário)
5. [Fluxos Detalhados](#fluxos-detalhados)
6. [Mapa de Navegação Visual](#mapa-de-navegação-visual)

---

## 🎯 VISÃO GERAL DO SISTEMA

O **SPA (Sistema de Perfil Discente)** é uma aplicação web Flask que permite:
- **Autenticação de usuários** (login, cadastro, recuperação de senha)
- **Upload e análise de arquivos CSV**
- **Geração de gráficos interativos** (barras, pizza, linha, histograma)
- **Comparação entre arquivos CSV**
- **Download de gráficos gerados**

### Módulos Principais

1. **Módulo de Autenticação** (`/login`, `/cadastro`, `/logout`, `/recuperar_senha`, `/reset_senha`)
2. **Módulo de Análises** (`/analises`, `/api/grafico`, `/api/columns`)
3. **Módulo de Upload** (`/upload`)
4. **Módulo de Download** (`/download_chart/<filename>`)
5. **Página Institucional** (`/quem_somos`)

---

## 📊 DIAGRAMAS DE FLUXO

### 1. FLUXO PRINCIPAL - JORNADA DO USUÁRIO

```
┌─────────────────────────────────────────────────────────────────┐
│                    PONTO DE ENTRADA                             │
│                      (/) - Home                                 │
└────────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   Redireciona automaticamente  │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │    /login - Página de Login   │
         └───────────────┬───────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                   │
        ▼                                   ▼
┌───────────────┐                  ┌───────────────┐
│ Usuário Novo? │                  │ Já Cadastrado?│
└───────┬───────┘                  └───────┬───────┘
        │                                   │
        │                                   │
        ▼                                   ▼
┌───────────────┐                  ┌───────────────┐
│  /cadastro    │                  │  POST /login  │
│  (GET/POST)   │                  │  Validação   │
└───────┬───────┘                  └───────┬───────┘
        │                                   │
        │                                   │
        ▼                                   ▼
┌───────────────┐                  ┌───────────────┐
│ Validações:   │                  │ Credenciais   │
│ - Email       │                  │ Válidas?      │
│ - CPF         │                  └───────┬───────┘
│ - Senha       │                          │
└───────┬───────┘                  ┌─────┴─────┐
        │                          │           │
        │                          ▼           ▼
        │                  ┌──────────┐  ┌──────────┐
        │                  │  SUCESSO  │  │  ERRO    │
        │                  └─────┬─────┘  └─────┬────┘
        │                        │              │
        │                        │              │
        ▼                        │              │
┌───────────────┐               │              │
│ Email Enviado  │               │              │
│ Redireciona    │               │              │
│ para /login   │               │              │
└───────┬───────┘               │              │
        │                       │              │
        └───────────┬───────────┴──────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  /analises (GET)     │
         │  Módulo Principal    │
         │  (Requer Login)      │
         └──────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌───────────────┐      ┌───────────────┐
│ Upload CSV    │      │ Gerar Gráfico │
│ (POST /upload)│      │ (POST /api/   │
└───────┬───────┘      │  grafico)     │
        │              └───────┬───────┘
        │                      │
        ▼                      ▼
┌───────────────┐      ┌───────────────┐
│ Arquivo       │      │ Visualização  │
│ Salvo         │      │ de Gráficos   │
└───────────────┘      └───────┬───────┘
                               │
                               ▼
                    ┌───────────────┐
                    │ Download PNG  │
                    │ (/download_   │
                    │  chart/<file>)│
                    └───────────────┘
```

### 2. FLUXO DE AUTENTICAÇÃO DETALHADO

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE AUTENTICAÇÃO                     │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   /login     │
                    │   (GET)      │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Usuário preenche:     │
              │  - Email                │
              │  - Senha                │
              │  [Botão: Entrar]        │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  POST /login           │
              │  Validação Backend     │
              └───────────┬─────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                            │
            ▼                            ▼
    ┌───────────────┐          ┌───────────────┐
    │  SUCESSO      │          │  ERRO         │
    │  - Login OK   │          │  - Email/Senha │
    │  - Log criado │          │    inválidos  │
    │  - Sessão     │          │  - Flash msg  │
    │    iniciada   │          │  - Retorna    │
    └───────┬───────┘          │    /login     │
            │                 └───────────────┘
            │
            ▼
    ┌───────────────┐
    │ Redirect para │
    │ /analises     │
    └───────────────┘
```

### 3. FLUXO DE CADASTRO

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE CADASTRO                        │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  /cadastro   │
                    │  (GET)       │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Formulário de         │
              │  Cadastro:             │
              │  - Nome completo       │
              │  - CPF (com máscara)   │
              │  - Email institucional │
              │  - Cargo               │
              │  - Senha               │
              │  - Confirmar senha     │
              │  [Botão: Cadastrar]    │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  POST /cadastro         │
              │  Validações:            │
              │  1. Email formato      │
              │  2. CPF formato        │
              │  3. CPF matemático     │
              │  4. Email único        │
              │  5. CPF único          │
              │  6. Senha >= 8 chars  │
              │  7. Senhas coincidem   │
              └───────────┬─────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                            │
            ▼                            ▼
    ┌───────────────┐          ┌───────────────┐
    │  VALIDAÇÃO    │          │  ERRO         │
    │  OK           │          │  - Flash msg  │
    │               │          │  - Retorna    │
    └───────┬───────┘          │    /cadastro  │
            │                 └───────────────┘
            │
            ▼
    ┌───────────────┐
    │  Cria Usuário │
    │  - Hash senha │
    │  - Salva BD   │
    │  - Cria Log   │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Envia Email  │
    │  Boas-vindas  │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Flash Success│
    │  Redirect para│
    │  /login       │
    └───────────────┘
```

### 4. FLUXO DE RECUPERAÇÃO DE SENHA

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE RECUPERAÇÃO DE SENHA                  │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │ /recuperar_  │
                    │ senha (GET)  │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Formulário:           │
              │  - Email cadastrado    │
              │  [Botão: Enviar link]  │
              └───────────┬─────────────┘
                          │
                          ▼
              ┌────────────────────────┐
              │  POST /recuperar_senha  │
              │  - Busca usuário        │
              │  - Gera token           │
              │  - Salva token no BD    │
              │  - Expira em 60 min    │
              └───────────┬─────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                            │
            ▼                            ▼
    ┌───────────────┐          ┌───────────────┐
    │  Email        │          │  Email não    │
    │  encontrado   │          │  encontrado   │
    │               │          │  - Flash msg  │
    └───────┬───────┘          │  - Redirect   │
            │                 │    /login     │
            │                 └───────────────┘
            │
            ▼
    ┌───────────────┐
    │  Envia Email  │
    │  com link:    │
    │  /reset_senha │
    │  /<token>     │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Usuário      │
    │  clica no     │
    │  link do email│
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ /reset_senha/ │
    │ <token> (GET) │
    │ - Valida token│
    │ - Verifica    │
    │   expiração   │
    └───────┬───────┘
            │
    ┌───────┴───────┐
    │               │
    ▼               ▼
┌─────────┐   ┌─────────┐
│ Válido  │   │ Inválido│
└────┬────┘   └────┬────┘
     │            │
     │            ▼
     │    ┌───────────────┐
     │    │ Flash: Link    │
     │    │ inválido/     │
     │    │ expirado      │
     │    │ Redirect      │
     │    │ /recuperar_   │
     │    │ senha         │
     │    └───────────────┘
     │
     ▼
┌───────────────┐
│ Formulário:   │
│ - Nova senha  │
│ - Confirmar   │
│ [Salvar]      │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ POST /reset_  │
│ senha/<token> │
│ - Valida      │
│ - Atualiza    │
│ - Remove token│
│ - Cria log    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Flash Success │
│ Redirect      │
│ /login        │
└───────────────┘
```

### 5. FLUXO DE ANÁLISES E GRÁFICOS

```
┌─────────────────────────────────────────────────────────────┐
│              FLUXO DE ANÁLISES E GRÁFICOS                    │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │ /analises    │
                    │ (GET)        │
                    │ Requer Login │
                    └──────┬───────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────┐                    ┌───────────────┐
│  Upload CSV   │                    │  Selecionar  │
│  (Admin only) │                    │  Arquivo Base │
└───────┬───────┘                    └───────┬───────┘
        │                                     │
        ▼                                     │
┌───────────────┐                            │
│ POST /upload  │                            │
│ - Valida .csv │                            │
│ - Salva em    │                            │
│   uploads/    │                            │
└───────┬───────┘                            │
        │                                    │
        └──────────────┬─────────────────────┘
                       │
                       ▼
            ┌───────────────────────┐
            │  Seleciona arquivo    │
            │  base no dropdown     │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  POST /api/columns    │
            │  - Carrega CSV        │
            │  - Retorna colunas     │
            │  - Tipos de dados      │
            │  - Valores únicos      │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Interface atualiza:  │
            │  - Select de colunas  │
            │  - Select de groupby   │
            │  - Filtros dinâmicos  │
            └───────────┬───────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │  Usuário configura:   │
            │  - Coluna principal   │
            │  - Agrupar por (opt) │
            │  - Tipo de gráfico    │
            │  - Filtros (opt)      │
            │  - Arquivo comparar   │
            │    (opt)              │
            └───────────┬───────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌───────────────┐            ┌───────────────┐
│ Gerar Gráfico │            │ Gerar e       │
│ (Simples)     │            │ Comparar      │
└───────┬───────┘            └───────┬───────┘
        │                            │
        ▼                            ▼
┌───────────────┐            ┌───────────────┐
│ POST /api/    │            │ POST /api/     │
│ grafico       │            │ grafico        │
│ (sem compare) │            │ (com compare)  │
└───────┬───────┘            └───────┬───────┘
        │                            │
        │                            │
        └────────────┬───────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Processamento:        │
        │  - Carrega CSV(s)      │
        │  - Aplica filtros      │
        │  - Agrupa (se houver)  │
        │  - Gera gráficos       │
        │  - Calcula % (se comp)│
        └───────────┬────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  Retorna JSON com:     │
        │  - Array de gráficos   │
        │  - Dados Plotly        │
        └───────────┬────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  Frontend renderiza:   │
        │  - Gráficos Plotly     │
        │  - Cards com gráficos  │
        │  - Botões de download  │
        └───────────┬────────────┘
                    │
                    ▼
        ┌────────────────────────┐
        │  Ações disponíveis:    │
        │  - Zoom/Pan            │
        │  - Download PNG        │
        │  - Salvar todos        │
        └────────────────────────┘
```

---

## 🖥️ MAPEAMENTO DE TELAS

### 1. TELA DE LOGIN (`/login`)

**Arquivo**: `templates/login.html`

**Elementos da Interface:**
- Logo SPA (imagem)
- Título "SPA - Sistema de Perfil Discente"
- Campo de entrada: Email
- Campo de entrada: Senha (com botão "Mostrar/Ocultar")
- Link: "Esqueci a senha" → `/recuperar_senha`
- Botão: "Entrar" (submit)
- Botão: "Cadastrar" → `/cadastro`
- Mensagens flash (sucesso/erro)

**Interações:**
- **GET**: Exibe formulário de login
- **POST**: Valida credenciais
  - ✅ Sucesso: Redireciona para `/analises`
  - ❌ Erro: Exibe mensagem e mantém na página

**Validações:**
- Email e senha obrigatórios
- Verifica se usuário existe
- Verifica se senha está correta

---

### 2. TELA DE CADASTRO (`/cadastro`)

**Arquivo**: `templates/cadastro.html`

**Elementos da Interface:**
- Logo SPA
- Título "Cadastrar Conta"
- Campo: Nome completo
- Campo: CPF (com máscara automática: 000.000.000-00)
- Campo: E-mail institucional
- Campo: Cargo
- Campo: Senha
- Campo: Confirmar senha
- Botão: "Cadastrar" (submit)
- Botão: "Voltar ao Menu" → `/login`
- Mensagens flash

**Interações:**
- **GET**: Exibe formulário
- **POST**: Processa cadastro
  - Validações no frontend (JavaScript)
  - Validações no backend (Python)
  - ✅ Sucesso: Envia email, redireciona para `/login`
  - ❌ Erro: Exibe mensagem específica

**Validações Frontend:**
- CPF com máscara automática
- Validação de CPF (JavaScript)

**Validações Backend:**
- Email no formato `@aluno.fmpsc.edu.br`
- CPF no formato `000.000.000-00`
- CPF matematicamente válido
- Email único no sistema
- CPF único no sistema
- Senha mínimo 8 caracteres
- Senhas devem coincidir

---

### 3. TELA DE RECUPERAÇÃO DE SENHA (`/recuperar_senha`)

**Arquivo**: `templates/recuperar_senha.html`

**Elementos da Interface:**
- Logo SPA
- Título "Recuperar Senha"
- Campo: E-mail cadastrado
- Botão: "Enviar link de recuperação" (submit)
- Link: "Voltar ao login" → `/login`
- Mensagens flash

**Interações:**
- **GET**: Exibe formulário
- **POST**: Processa solicitação
  - Busca usuário por email
  - ✅ Encontrado: Gera token, envia email, redireciona para `/login`
  - ❌ Não encontrado: Exibe mensagem, redireciona para `/login`

**Ações do Sistema:**
- Gera token seguro (itsdangerous)
- Salva token no banco com expiração (60 minutos)
- Envia email com link: `/reset_senha/<token>`
- Cria log da ação

---

### 4. TELA DE REDEFINIR SENHA (`/reset_senha/<token>`)

**Arquivo**: `templates/reset_senha.html`

**Elementos da Interface:**
- Logo SPA
- Título "Redefinir Senha"
- Campo: Nova senha
- Campo: Confirmar nova senha
- Botão: "Salvar nova senha" (submit)
- Link: "Voltar ao login" → `/login`
- Mensagens flash

**Interações:**
- **GET**: Valida token e exibe formulário
  - ✅ Token válido: Exibe formulário
  - ❌ Token inválido/expirado: Flash erro, redireciona para `/recuperar_senha`
- **POST**: Processa nova senha
  - Valida token novamente
  - Valida senhas (mínimo 8 chars, devem coincidir)
  - ✅ Sucesso: Atualiza senha, remove token, cria log, redireciona para `/login`
  - ❌ Erro: Exibe mensagem específica

**Validações:**
- Token válido e não expirado
- Senha mínimo 8 caracteres
- Senhas devem coincidir

---

### 5. TELA DE ANÁLISES (`/analises`)

**Arquivo**: `templates/index.html`

**Elementos da Interface:**

**Navbar:**
- Logo SPA
- Título "Módulo de Análises"
- Informações do usuário (nome e email)
- Botão: "❓ Suporte" (inicia tutorial)
- Botão: "📤 Enviar CSV" (apenas para admin: `marcelo.souza@aluno.fmpsc.edu.br`)
- Botão: "↻" (recarregar lista de arquivos)
- Link: "Sair" → `/logout`

**Painel Esquerdo (Configuração):**

1. **Card: Arquivos CSV**
   - Select: "Arquivo base (para análise)"
   - Select: "Comparar com (opcional)"

2. **Card: Configuração**
   - Select: "Coluna principal"
   - Select: "Agrupar por (opcional)"
   - Select: "Tipo de gráfico" (Barras, Pizza, Linha, Histograma)
   - Área: "Filtros rápidos" (checkboxes dinâmicos)
   - Botão: "Gerar Gráfico"

3. **Card: Comparar**
   - Botão: "Gerar e Comparar"

**Painel Direito (Resultado):**
- Card: "Resultado"
  - Botão: "💾 Salvar todos" (aparece após gerar gráficos)
  - Container: Área de gráficos (Plotly)

**Modal: Upload CSV**
- Título: "Enviar CSV"
- Input: Arquivo (accept=".csv")
- Botão: "Cancelar"
- Botão: "Enviar"

**Interações:**

1. **Seleção de Arquivo Base:**
   - Usuário seleciona arquivo no dropdown
   - JavaScript faz POST `/api/columns`
   - Atualiza selects de colunas e filtros

2. **Upload de CSV:**
   - Apenas admin pode ver botão
   - Abre modal
   - Seleciona arquivo
   - POST `/upload`
   - Recarrega página

3. **Geração de Gráfico:**
   - Usuário configura opções
   - Clica "Gerar Gráfico"
   - POST `/api/grafico`
   - Renderiza gráficos Plotly

4. **Comparação:**
   - Seleciona arquivo para comparar
   - Clica "Gerar e Comparar"
   - POST `/api/grafico` com `compare_with`
   - Renderiza gráficos base, comparador e variação %

5. **Download:**
   - Botão "📥 PNG" em cada gráfico
   - Botão "💾 Salvar todos"
   - Converte Plotly para PNG e baixa

**APIs Utilizadas:**
- `POST /api/columns` - Busca colunas do CSV
- `POST /api/grafico` - Gera gráficos
- `POST /api/save_chart` - Salva gráfico (não usado atualmente)
- `GET /download_chart/<filename>` - Download de gráfico salvo

---

### 6. TELA QUEM SOMOS (`/quem_somos`)

**Arquivo**: `templates/quem_somos.html`

**Elementos da Interface:**
- Botão: "⬅ Voltar" (para `/analises` se logado, `/login` se não)
- Título: "Quem somos"
- Texto institucional sobre iLab
- Footer com link

**Interações:**
- Página informativa estática
- Botão de voltar adapta-se ao estado de autenticação

---

## 🎮 INTERAÇÕES DO USUÁRIO

### Interações por Tipo de Usuário

#### 👤 Usuário Não Autenticado

**Ações Disponíveis:**
1. Acessar `/login` (redirecionamento automático de `/`)
2. Fazer login com email e senha
3. Cadastrar nova conta (`/cadastro`)
4. Recuperar senha (`/recuperar_senha`)
5. Visualizar página "Quem somos" (`/quem_somos`)

**Restrições:**
- Não pode acessar `/analises`
- Não pode fazer upload de CSV
- Não pode gerar gráficos

#### 🔐 Usuário Autenticado (Comum)

**Ações Disponíveis:**
1. Acessar módulo de análises (`/analises`)
2. Selecionar arquivos CSV existentes
3. Configurar e gerar gráficos
4. Comparar arquivos
5. Download de gráficos
6. Acessar tutorial (botão Suporte)
7. Fazer logout (`/logout`)
8. Visualizar "Quem somos"

**Restrições:**
- Não pode fazer upload de CSV (apenas admin)

#### 👑 Usuário Admin (Email específico)

**Ações Adicionais:**
1. Todas as ações de usuário comum
2. **Upload de arquivos CSV** (botão visível apenas para admin)
3. Gerenciar arquivos no sistema

**Identificação:**
- Hardcoded: `current_user.email == "marcelo.souza@aluno.fmpsc.edu.br"`

---

### Fluxos de Interação Detalhados

#### 🔄 Fluxo: Primeiro Acesso (Novo Usuário)

```
1. Usuário acessa sistema → Redirecionado para /login
2. Clica em "Cadastrar"
3. Preenche formulário de cadastro
4. Sistema valida:
   - Email institucional válido
   - CPF válido (formato e matemático)
   - Senha >= 8 caracteres
   - Senhas coincidem
5. Sistema cria conta:
   - Hash da senha
   - Salva no banco
   - Cria log
6. Sistema envia email de boas-vindas
7. Redireciona para /login
8. Usuário faz login
9. Redirecionado para /analises
```

#### 📊 Fluxo: Gerar Gráfico Simples

```
1. Usuário acessa /analises (já logado)
2. Seleciona "Arquivo base" no dropdown
3. Sistema carrega colunas via POST /api/columns
4. Interface atualiza:
   - Select de colunas preenchido
   - Select de agrupamento preenchido
   - Filtros dinâmicos criados
5. Usuário seleciona:
   - Coluna principal
   - Tipo de gráfico (bar/pie/line/histogram)
   - Opcionalmente: Agrupar por
   - Opcionalmente: Filtros
6. Clica "Gerar Gráfico"
7. Sistema processa via POST /api/grafico:
   - Carrega CSV
   - Aplica filtros
   - Agrupa (se houver)
   - Gera gráfico Plotly
8. Frontend renderiza gráfico interativo
9. Usuário pode:
   - Zoom/Pan
   - Download PNG
   - Gerar novo gráfico
```

#### 🔀 Fluxo: Comparar Arquivos

```
1. Usuário seleciona "Arquivo base"
2. Seleciona "Comparar com" (outro arquivo)
3. Configura coluna, tipo, filtros
4. Clica "Gerar e Comparar"
5. Sistema processa:
   - Carrega ambos CSVs
   - Aplica mesmos filtros
   - Gera gráfico base
   - Gera gráfico comparador
   - Calcula variação percentual
6. Frontend renderiza 3 gráficos:
   - Base
   - Comparador
   - Variação %
7. Usuário analisa diferenças
```

#### 📤 Fluxo: Upload de CSV (Admin)

```
1. Admin clica "📤 Enviar CSV"
2. Modal abre
3. Admin seleciona arquivo .csv
4. Clica "Enviar"
5. Sistema valida:
   - Arquivo existe
   - Extensão .csv
6. Sistema salva em uploads/
7. Página recarrega
8. Arquivo aparece nos dropdowns
```

#### 🔑 Fluxo: Recuperação de Senha

```
1. Usuário em /login clica "Esqueci a senha"
2. Acessa /recuperar_senha
3. Informa email cadastrado
4. Sistema:
   - Busca usuário
   - Gera token (válido por 60 min)
   - Salva token no BD
   - Envia email com link
5. Usuário recebe email
6. Clica no link: /reset_senha/<token>
7. Sistema valida token
8. Exibe formulário de nova senha
9. Usuário define nova senha
10. Sistema:
    - Valida senha
    - Atualiza hash
    - Remove token usado
    - Cria log
11. Redireciona para /login
```

---

## 📱 MAPA DE NAVEGAÇÃO VISUAL

```
                    ┌─────────────────┐
                    │   PONTO ZERO    │
                    │      (/)        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   /login (GET)  │
                    │  [Tela Login]   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ POST /login   │   │ /cadastro     │   │ /recuperar_   │
│ (Sucesso)     │   │ (GET/POST)    │   │ senha (GET)   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                    │
        │                   │                    │
        │                   ▼                    │
        │          ┌───────────────┐            │
        │          │ POST /cadastro│            │
        │          │ (Sucesso)     │            │
        │          └───────┬───────┘            │
        │                  │                     │
        │                  │                     │
        │                  ▼                     │
        │          ┌───────────────┐            │
        │          │ Redirect      │            │
        │          │ /login        │            │
        │          └───────┬───────┘            │
        │                  │                     │
        │                  │                     │
        └──────────────────┴─────────────────────┘
                           │
                           ▼
                ┌──────────────────┐
                │  /analises (GET) │
                │  [Tela Principal]│
                │  (Requer Login)   │
                └─────────┬────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ POST /upload │  │ POST /api/   │  │ /quem_somos   │
│ (Admin only) │  │ grafico      │  │ (GET)         │
└───────┬───────┘  └───────┬───────┘  └───────────────┘
        │                  │
        │                  │
        ▼                  ▼
┌───────────────┐  ┌───────────────┐
│ Arquivo salvo │  │ Gráficos      │
│ Recarrega     │  │ renderizados  │
└───────────────┘  └───────┬───────┘
                           │
                           ▼
                ┌──────────────────┐
                │ Download PNG     │
                │ /download_chart/ │
                │ <filename>        │
                └──────────────────┘
```

---

## 🔍 DETALHAMENTO DE ENDPOINTS

### Endpoints Públicos (Não Requerem Autenticação)

| Endpoint | Método | Descrição | Redireciona Para |
|----------|--------|-----------|-------------------|
| `/` | GET | Home | `/login` |
| `/login` | GET | Exibe formulário de login | - |
| `/login` | POST | Processa login | `/analises` (sucesso) ou `/login` (erro) |
| `/cadastro` | GET | Exibe formulário de cadastro | - |
| `/cadastro` | POST | Processa cadastro | `/login` (sucesso) ou `/cadastro` (erro) |
| `/recuperar_senha` | GET | Exibe formulário de recuperação | - |
| `/recuperar_senha` | POST | Envia email de recuperação | `/login` |
| `/reset_senha/<token>` | GET | Exibe formulário de redefinição | `/recuperar_senha` (token inválido) |
| `/reset_senha/<token>` | POST | Processa nova senha | `/login` (sucesso) ou `/reset_senha/<token>` (erro) |
| `/quem_somos` | GET | Página institucional | - |

### Endpoints Protegidos (Requerem `@login_required`)

| Endpoint | Método | Descrição | Retorno |
|----------|--------|-----------|---------|
| `/analises` | GET | Página principal de análises | HTML com interface |
| `/logout` | GET | Faz logout | `/login` |
| `/upload` | POST | Upload de arquivo CSV | JSON `{success: bool, error?: string}` |
| `/api/columns` | POST | Busca colunas de um CSV | JSON `{columns: [...]}` ou `{error: string}` |
| `/api/grafico` | POST | Gera gráficos | JSON `{graficos: [...]}` ou `{error: string}` |
| `/api/save_chart` | POST | Salva gráfico (não usado) | JSON `{saved: bool, file: string}` |
| `/download_chart/<filename>` | GET | Download de gráfico salvo | Arquivo PNG ou redirect |

---

## 🎯 RESUMO DE NAVEGAÇÃO

### Estados do Sistema

1. **Não Autenticado**
   - Acesso: Login, Cadastro, Recuperação de Senha, Quem Somos
   - Bloqueado: Análises, Upload, APIs

2. **Autenticado (Comum)**
   - Acesso: Análises, Logout, Quem Somos, APIs de gráficos
   - Bloqueado: Upload de CSV

3. **Autenticado (Admin)**
   - Acesso: Tudo (incluindo Upload)

### Pontos de Entrada

- **Principal**: `/` → Redireciona para `/login`
- **Direto**: `/login`, `/cadastro`, `/analises` (se autenticado)

### Pontos de Saída

- **Logout**: `/logout` → Redireciona para `/login`
- **Navegação Externa**: Links no footer, email de recuperação

### Transições Principais

```
Login → Análises (sucesso)
Cadastro → Login (sucesso)
Recuperação → Email → Reset Senha → Login
Análises → Logout → Login
```

---

## 📝 NOTAS TÉCNICAS

### Validações de Acesso

- **`@login_required`**: Decorator Flask-Login usado em rotas protegidas
- **Verificação de Admin**: Hardcoded `current_user.email == "marcelo.souza@aluno.fmpsc.edu.br"`
- **Redirecionamento**: Usuários não autenticados tentando acessar `/analises` são redirecionados para `/login`

### Sessões

- Gerenciadas por Flask-Login
- Persistem entre requisições
- Invalidadas no logout

### Mensagens Flash

- Categorias: `success`, `danger`, `warning`, `info`
- Exibidas em todas as telas com formulários
- Persistem por uma requisição

### APIs JSON

- Todas as APIs retornam JSON
- Endpoints: `/api/columns`, `/api/grafico`, `/api/save_chart`
- Requerem autenticação
- Erros retornam `{error: "mensagem"}` com status HTTP apropriado

---

**Documento gerado em**: 2024  
**Versão do Sistema**: Análise baseada no código atual do repositório  
**Última atualização**: Análise completa do fluxo de navegação

