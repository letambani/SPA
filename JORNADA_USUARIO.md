# 🗺️ JORNADA DO USUÁRIO - REPRESENTAÇÃO GRÁFICA
## SPA - Sistema de Perfil Discente (FMPSC)

---

## 📊 DIAGRAMAS INTERATIVOS (Mermaid)

Os diagramas abaixo podem ser visualizados em:
- GitHub/GitLab (renderização automática)
- [Mermaid Live Editor](https://mermaid.live)
- Extensões do VS Code (Markdown Preview Mermaid Support)
- Ferramentas que suportam Mermaid

---

## 1. JORNADA COMPLETA DO USUÁRIO

```mermaid
graph TD
    Start([Usuário Acessa o Sistema]) --> Home[/]
    Home --> Login[Página de Login]
    
    Login -->|Novo Usuário| Cadastro[Página de Cadastro]
    Login -->|Já Cadastrado| LoginForm[Preenche Email e Senha]
    Login -->|Esqueceu Senha| Recuperar[Recuperar Senha]
    
    Cadastro --> CadastroForm[Preenche Formulário]
    CadastroForm -->|Validações OK| CriarConta[Cria Conta no Sistema]
    CadastroForm -->|Erro| Cadastro
    CriarConta --> EmailBoasVindas[Envia Email de Boas-vindas]
    EmailBoasVindas --> Login
    
    LoginForm -->|Credenciais Válidas| Autenticado[Usuário Autenticado]
    LoginForm -->|Credenciais Inválidas| Login
    
    Recuperar --> RecuperarForm[Informa Email]
    RecuperarForm -->|Email Encontrado| TokenEmail[Gera Token e Envia Email]
    RecuperarForm -->|Email Não Encontrado| Login
    TokenEmail --> ResetSenha[Página Reset Senha]
    ResetSenha --> NovaSenha[Define Nova Senha]
    NovaSenha -->|Sucesso| Login
    
    Autenticado --> Analises[Módulo de Análises]
    
    Analises -->|Admin| Upload[Upload de CSV]
    Analises --> SelecionarArquivo[Seleciona Arquivo CSV]
    
    Upload --> SalvarArquivo[Arquivo Salvo]
    SalvarArquivo --> Analises
    
    SelecionarArquivo --> CarregarColunas[Carrega Colunas do CSV]
    CarregarColunas --> Configurar[Configura Análise]
    
    Configurar -->|Simples| GerarGrafico[Gera Gráfico]
    Configurar -->|Comparar| CompararArquivos[Seleciona Arquivo para Comparar]
    
    CompararArquivos --> GerarComparacao[Gera Gráficos Comparativos]
    GerarGrafico --> Visualizar[Visualiza Gráficos]
    GerarComparacao --> Visualizar
    
    Visualizar -->|Download| DownloadPNG[Baixa Gráfico PNG]
    Visualizar -->|Novo Gráfico| Configurar
    Visualizar -->|Logout| Logout[Sair do Sistema]
    
    DownloadPNG --> Visualizar
    Logout --> Login
    
    style Start fill:#e1f5ff
    style Autenticado fill:#c8e6c9
    style Analises fill:#fff9c4
    style Visualizar fill:#f3e5f5
    style Login fill:#ffccbc
```

---

## 2. FLUXO DE AUTENTICAÇÃO

```mermaid
sequenceDiagram
    participant U as Usuário
    participant L as Página Login
    participant B as Backend
    participant DB as Banco de Dados
    participant A as Módulo Análises
    
    U->>L: Acessa /login
    L->>U: Exibe formulário
    
    U->>L: Preenche email e senha
    U->>L: Clica "Entrar"
    
    L->>B: POST /login (email, senha)
    B->>DB: Busca usuário por email
    DB-->>B: Retorna usuário (ou null)
    
    alt Usuário encontrado e senha válida
        B->>DB: Cria log de login
        B->>B: Inicia sessão (Flask-Login)
        B-->>L: Redirect /analises
        L->>A: Redireciona para análises
        A->>U: Exibe módulo de análises
    else Credenciais inválidas
        B-->>L: Flash mensagem de erro
        L->>U: Exibe erro, mantém na página
    end
```

---

## 3. FLUXO DE CADASTRO

```mermaid
flowchart TD
    A[Usuário acessa /cadastro] --> B[Exibe formulário]
    B --> C[Usuário preenche dados]
    C --> D{Validação Frontend<br/>JavaScript}
    
    D -->|CPF inválido| C
    D -->|OK| E[POST /cadastro]
    
    E --> F{Validação Backend}
    
    F -->|Email inválido| G[Flash: Email inválido]
    F -->|CPF inválido| H[Flash: CPF inválido]
    F -->|Email já existe| I[Flash: Email já cadastrado]
    F -->|CPF já existe| J[Flash: CPF já cadastrado]
    F -->|Senha < 8 chars| K[Flash: Senha muito curta]
    F -->|Senhas não coincidem| L[Flash: Senhas não coincidem]
    
    G --> B
    H --> B
    I --> B
    J --> B
    K --> B
    L --> B
    
    F -->|Todas validações OK| M[Cria usuário no BD]
    M --> N[Gera hash da senha]
    N --> O[Salva no banco]
    O --> P[Cria log de cadastro]
    P --> Q[Envia email de boas-vindas]
    Q --> R[Flash: Cadastro realizado]
    R --> S[Redirect /login]
    
    style A fill:#e3f2fd
    style M fill:#c8e6c9
    style Q fill:#fff9c4
    style S fill:#f3e5f5
```

---

## 4. FLUXO DE RECUPERAÇÃO DE SENHA

```mermaid
stateDiagram-v2
    [*] --> Login: Usuário acessa sistema
    Login --> RecuperarSenha: Clica "Esqueci senha"
    
    RecuperarSenha --> PreencherEmail: Exibe formulário
    PreencherEmail --> ValidarEmail: Usuário informa email
    
    ValidarEmail --> EmailEncontrado: Email existe no BD
    ValidarEmail --> EmailNaoEncontrado: Email não existe
    
    EmailNaoEncontrado --> Login: Flash erro, redirect
    
    EmailEncontrado --> GerarToken: Gera token seguro
    GerarToken --> SalvarToken: Salva token no BD (60min)
    SalvarToken --> EnviarEmail: Envia email com link
    EnviarEmail --> Login: Flash sucesso, redirect
    
    Login --> AguardarClique: Usuário aguarda email
    
    AguardarClique --> ClicarLink: Usuário clica no link
    ClicarLink --> ValidarToken: GET /reset_senha/<token>
    
    ValidarToken --> TokenValido: Token válido e não expirado
    ValidarToken --> TokenInvalido: Token inválido/expirado
    
    TokenInvalido --> RecuperarSenha: Flash erro, redirect
    
    TokenValido --> FormNovaSenha: Exibe formulário
    FormNovaSenha --> PreencherNovaSenha: Usuário preenche
    
    PreencherNovaSenha --> ValidarSenha: POST /reset_senha/<token>
    
    ValidarSenha --> SenhaValida: Senha >= 8 chars e coincidem
    ValidarSenha --> SenhaInvalida: Senha inválida
    
    SenhaInvalida --> FormNovaSenha: Flash erro
    
    SenhaValida --> AtualizarSenha: Atualiza hash no BD
    AtualizarSenha --> RemoverToken: Remove token usado
    RemoverToken --> CriarLog: Cria log da ação
    CriarLog --> Login: Flash sucesso, redirect
    
    Login --> [*]: Usuário faz login
```

---

## 5. FLUXO DE ANÁLISES E GRÁFICOS

```mermaid
graph LR
    subgraph "Módulo de Análises"
        A[Usuário acessa /analises] --> B{É Admin?}
        B -->|Sim| C[Botão Upload visível]
        B -->|Não| D[Botão Upload oculto]
        
        C --> E[Upload CSV]
        E --> F[Arquivo salvo em uploads/]
        F --> G[Lista de arquivos atualizada]
        
        D --> G
        G --> H[Seleciona arquivo base]
        
        H --> I[POST /api/columns]
        I --> J[Backend carrega CSV]
        J --> K[Retorna colunas e metadados]
        K --> L[Interface atualiza selects]
        
        L --> M[Usuário configura análise]
        M --> N{Tipo de análise}
        
        N -->|Simples| O[Gera Gráfico]
        N -->|Comparar| P[Seleciona arquivo comparador]
        
        P --> Q[Gera Comparação]
        O --> R[Processa dados]
        Q --> R
        
        R --> S[Aplica filtros]
        S --> T[Agrupa dados se necessário]
        T --> U[Gera gráficos Plotly]
        U --> V[Retorna JSON com gráficos]
        V --> W[Frontend renderiza Plotly]
        
        W --> X{Usuário interage}
        X -->|Zoom/Pan| W
        X -->|Download PNG| Y[Converte e baixa]
        X -->|Novo gráfico| M
        X -->|Logout| Z[Sair]
    end
    
    style A fill:#e3f2fd
    style C fill:#fff9c4
    style R fill:#c8e6c9
    style W fill:#f3e5f5
    style Y fill:#ffccbc
```

---

## 6. JORNADA DO USUÁRIO NOVO (User Journey)

```mermaid
journey
    title Jornada do Usuário Novo no Sistema SPA
    
    section Descoberta
      Acessa sistema: 3: Usuário
      Vê página de login: 4: Usuário
      Clica em Cadastrar: 5: Usuário
    
    section Cadastro
      Preenche formulário: 3: Usuário
      Sistema valida dados: 2: Sistema
      Recebe email boas-vindas: 4: Usuário
      Volta para login: 3: Usuário
    
    section Primeiro Acesso
      Faz login: 3: Usuário
      Acessa módulo análises: 5: Usuário
      Vê interface pela primeira vez: 4: Usuário
    
    section Exploração
      Clica em Tutorial: 4: Usuário
      Aprende funcionalidades: 5: Usuário
      Seleciona arquivo CSV: 3: Usuário
      Configura primeira análise: 4: Usuário
    
    section Uso
      Gera primeiro gráfico: 5: Usuário
      Visualiza resultados: 5: Usuário
      Faz download do gráfico: 4: Usuário
      Compara arquivos: 4: Usuário
```

---

## 7. FLUXO DE COMPARAÇÃO DE ARQUIVOS

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant API as API /api/grafico
    participant CSV as Serviço CSV
    participant P as Plotly
    
    U->>F: Seleciona arquivo base
    F->>API: POST /api/columns (arquivo base)
    API->>CSV: Carrega CSV base
    CSV-->>API: DataFrame base
    API-->>F: Colunas e metadados
    
    U->>F: Seleciona arquivo comparador
    U->>F: Configura análise
    U->>F: Clica "Gerar e Comparar"
    
    F->>API: POST /api/grafico (com compare_with)
    
    API->>CSV: Carrega CSV base
    CSV-->>API: DataFrame base
    
    API->>CSV: Carrega CSV comparador
    CSV-->>API: DataFrame comparador
    
    API->>API: Aplica filtros em ambos
    API->>API: Agrupa por categoria (se houver)
    
    loop Para cada grupo
        API->>API: Calcula contagens base
        API->>API: Calcula contagens comparador
        API->>API: Calcula variação percentual
        API->>P: Gera gráfico base
        API->>P: Gera gráfico comparador
        API->>P: Gera gráfico variação %
    end
    
    API-->>F: JSON com array de gráficos
    
    F->>P: Renderiza gráficos Plotly
    P-->>U: Exibe gráficos interativos
    
    U->>F: Interage com gráficos
    U->>F: Faz download PNG
```

---

## 8. MAPA DE ESTADOS DO SISTEMA

```mermaid
stateDiagram-v2
    [*] --> NaoAutenticado
    
    NaoAutenticado --> Login: Acessa /
    NaoAutenticado --> Cadastro: Clica Cadastrar
    NaoAutenticado --> RecuperarSenha: Clica Esqueci Senha
    
    Login --> Autenticado: Login OK
    Login --> NaoAutenticado: Login Falha
    
    Cadastro --> NaoAutenticado: Cadastro OK
    Cadastro --> Cadastro: Cadastro Falha
    
    RecuperarSenha --> ResetSenha: Token válido
    RecuperarSenha --> NaoAutenticado: Email não encontrado
    
    ResetSenha --> NaoAutenticado: Senha redefinida
    
    Autenticado --> Analises: Acessa /analises
    Autenticado --> NaoAutenticado: Logout
    
    Analises --> Upload: Admin faz upload
    Analises --> GerarGrafico: Gera gráfico
    Analises --> Comparar: Compara arquivos
    
    Upload --> Analises: Upload concluído
    GerarGrafico --> Analises: Gráfico gerado
    Comparar --> Analises: Comparação concluída
    
    Analises --> NaoAutenticado: Logout
```

---

## 9. DIAGRAMA DE COMPONENTES E INTERAÇÕES

```mermaid
graph TB
    subgraph "Frontend"
        A[Páginas HTML]
        B[JavaScript]
        C[Plotly.js]
        D[Bootstrap]
    end
    
    subgraph "Backend Flask"
        E[Rotas]
        F[Services]
        G[Models]
        H[Validators]
    end
    
    subgraph "Banco de Dados"
        I[(MySQL)]
        J[Tabela Usuario]
        K[Tabela Log]
        L[Tabela RecuperacaoSenha]
    end
    
    subgraph "Sistema de Arquivos"
        M[uploads/]
        N[saved_charts/]
    end
    
    subgraph "Serviços Externos"
        O[Email SMTP]
    end
    
    A --> B
    B --> C
    A --> D
    B --> E
    
    E --> F
    E --> H
    F --> G
    G --> I
    I --> J
    I --> K
    I --> L
    
    E --> M
    E --> N
    F --> O
    
    style A fill:#e3f2fd
    style E fill:#c8e6c9
    style I fill:#fff9c4
    style O fill:#ffccbc
```

---

## 10. FLUXO DE PERMISSÕES E ACESSO

```mermaid
flowchart TD
    Start([Requisição]) --> CheckAuth{Usuário<br/>Autenticado?}
    
    CheckAuth -->|Não| PublicRoutes{Rota Pública?}
    CheckAuth -->|Sim| CheckRole{Tipo de Usuário}
    
    PublicRoutes -->|Sim| Allow[Permitir Acesso]
    PublicRoutes -->|Não| RedirectLogin[Redirect /login]
    
    CheckRole -->|Admin| AdminRoutes{Rota Admin?}
    CheckRole -->|Comum| UserRoutes{Rota Usuário?}
    
    AdminRoutes -->|Sim| Allow
    AdminRoutes -->|Não| UserRoutes
    
    UserRoutes -->|Sim| Allow
    UserRoutes -->|Não| Deny[Negar Acesso]
    
    Allow --> Process[Processar Requisição]
    Deny --> Error403[Erro 403]
    RedirectLogin --> LoginPage[Página Login]
    
    style Start fill:#e3f2fd
    style Allow fill:#c8e6c9
    style Deny fill:#ffcdd2
    style Process fill:#f3e5f5
```

---

## 📈 DIAGRAMAS ASCII ART (Alternativa Visual)

### Jornada Principal - Versão ASCII

```
┌─────────────────────────────────────────────────────────────────┐
│                    🏠 PONTO DE ENTRADA                          │
│                         (/) Home                                │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  🔐 LOGIN        │
                    │  /login          │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ 📝 CADASTRO   │   │ ✅ LOGIN OK   │   │ 🔑 RECUPERAR  │
│ /cadastro     │   │               │   │ /recuperar_   │
└───────┬───────┘   └───────┬───────┘   │ senha         │
        │                   │           └───────┬───────┘
        │                   │                   │
        ▼                   │                   │
┌───────────────┐           │                   │
│ 📧 Email      │           │                   │
│ Boas-vindas   │           │                   │
└───────┬───────┘           │                   │
        │                   │                   │
        └───────────┬───────┴───────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │ ✅ AUTENTICADO │
            └───────┬───────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  📊 MÓDULO ANÁLISES   │
        │  /analises            │
        └───────────┬───────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌─────────┐   ┌──────────┐   ┌──────────┐
│ 📤 UPLOAD│   │ 📈 GRÁFICO│   │ 🔄 COMPARAR│
│ (Admin) │   │ Simples   │   │ Arquivos  │
└────┬────┘   └─────┬─────┘   └─────┬────┘
     │              │               │
     │              └───────┬───────┘
     │                      │
     └──────────┬───────────┘
                │
                ▼
        ┌───────────────┐
        │ 🎨 VISUALIZAR  │
        │ Gráficos       │
        └───────┬───────┘
                │
    ┌───────────┼───────────┐
    │           │           │
    ▼           ▼           ▼
┌────────┐  ┌────────┐  ┌────────┐
│ 📥 PNG │  │ 🔄 NOVO│  │ 🚪 SAIR│
│ Download│  │ Gráfico│  │ Logout │
└────────┘  └────────┘  └────────┘
```

---

## 🎯 PERSONAS E JORNADAS

### Persona 1: Estudante (Usuário Novo)

```mermaid
journey
    title Jornada do Estudante - Primeiro Uso
    section Descoberta
      Recebe convite: 5: Estudante
      Acessa sistema: 4: Estudante
      Vê página login: 3: Estudante
    section Cadastro
      Clica em cadastrar: 4: Estudante
      Preenche dados: 3: Estudante
      Recebe email: 5: Estudante
    section Primeiro Acesso
      Faz login: 4: Estudante
      Vê tutorial: 5: Estudante
      Explora interface: 4: Estudante
    section Uso
      Seleciona CSV: 3: Estudante
      Gera gráfico: 5: Estudante
      Analisa dados: 5: Estudante
```

### Persona 2: Administrador

```mermaid
journey
    title Jornada do Administrador
    section Acesso
      Login: 5: Admin
      Acessa análises: 5: Admin
    section Gerenciamento
      Faz upload CSV: 5: Admin
      Verifica arquivos: 4: Admin
    section Análise
      Gera gráficos: 5: Admin
      Compara dados: 5: Admin
      Exporta resultados: 4: Admin
```

---

## 📱 RESPONSIVIDADE E DISPOSITIVOS

```mermaid
graph LR
    A[Usuário] --> B{Dispositivo}
    
    B -->|Desktop| C[Experiência Completa]
    B -->|Tablet| D[Experiência Adaptada]
    B -->|Mobile| E[Experiência Limitada]
    
    C --> F[Todas funcionalidades]
    C --> G[Gráficos interativos]
    C --> H[Upload facilitado]
    
    D --> I[Funcionalidades principais]
    D --> J[Gráficos responsivos]
    
    E --> K[Visualização básica]
    E --> L[Gráficos simplificados]
    
    style C fill:#c8e6c9
    style D fill:#fff9c4
    style E fill:#ffccbc
```

---

## 🔄 CICLO DE VIDA DA SESSÃO

```mermaid
sequenceDiagram
    participant U as Usuário
    participant B as Browser
    participant S as Servidor
    participant DB as Banco
    
    Note over U,DB: Início da Sessão
    U->>B: Acessa sistema
    B->>S: GET /
    S->>B: Redirect /login
    B->>S: GET /login
    S->>B: HTML login
    
    U->>B: Preenche credenciais
    B->>S: POST /login
    S->>DB: Valida usuário
    DB-->>S: Usuário válido
    S->>S: Cria sessão Flask-Login
    S->>B: Set-Cookie (session)
    S->>B: Redirect /analises
    
    Note over U,DB: Sessão Ativa
    loop Durante uso
        B->>S: Requisições (com cookie)
        S->>S: Valida sessão
        S->>B: Resposta
    end
    
    Note over U,DB: Fim da Sessão
    U->>B: Clica Logout
    B->>S: GET /logout
    S->>S: Invalida sessão
    S->>B: Redirect /login
    B->>S: GET /login
    S->>B: HTML login
```

---

## 📊 MÉTRICAS DE NAVEGAÇÃO

### Tempo Médio por Fluxo

| Fluxo | Tempo Estimado | Complexidade |
|-------|---------------|--------------|
| Cadastro | 2-3 min | Média |
| Login | 10-15 seg | Baixa |
| Recuperação Senha | 3-5 min | Média |
| Gerar Gráfico Simples | 1-2 min | Baixa |
| Comparar Arquivos | 2-3 min | Média |
| Upload CSV | 30 seg | Baixa |

### Taxa de Conversão Esperada

```
Cadastro → Login: 90%
Login → Análises: 95%
Análises → Primeiro Gráfico: 70%
Primeiro Gráfico → Uso Regular: 60%
```

---

## 🎨 LEGENDA DOS DIAGRAMAS

### Cores e Significados

- 🔵 **Azul Claro**: Ponto de entrada, início
- 🟢 **Verde**: Ações bem-sucedidas, autenticação
- 🟡 **Amarelo**: Processamento, análise
- 🟣 **Roxo**: Visualização, resultados
- 🟠 **Laranja**: Ações do usuário
- 🔴 **Vermelho**: Erros, bloqueios

### Símbolos

- 📊 Gráficos e análises
- 🔐 Autenticação
- 📝 Cadastro
- 📧 Email
- 📤 Upload
- 📥 Download
- 🔄 Processamento
- ✅ Sucesso
- ❌ Erro

---

**Documento gerado em**: 2024  
**Formato**: Mermaid Diagrams + ASCII Art  
**Compatibilidade**: GitHub, GitLab, VS Code, Mermaid Live Editor

