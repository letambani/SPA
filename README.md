# 📊 SPA - Sistema de Perfil Discente

Sistema web desenvolvido em Flask para análise de dados acadêmicos, geração de gráficos interativos e comparação de informações.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🎯 Sobre o Projeto

O **SPA (Sistema de Perfil Discente)** é uma plataforma web desenvolvida para a **FMPSC (Faculdade de Medicina de Santa Catarina)** que permite:

- ✅ Autenticação segura de usuários (login, cadastro, recuperação de senha)
- ✅ Upload e processamento de arquivos CSV
- ✅ Geração de gráficos interativos (barras, pizza, linha, histograma)
- ✅ Comparação entre diferentes arquivos de dados
- ✅ Download de gráficos em formato PNG
- ✅ Sistema de logs e auditoria

## 🚀 Tecnologias Utilizadas

- **Backend**: Python 3.8+, Flask
- **Banco de Dados**: MySQL/MariaDB
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Visualização**: Plotly.js
- **Autenticação**: Flask-Login
- **Email**: Flask-Mail
- **Segurança**: Flask-Bcrypt, itsdangerous

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Python 3.8 ou superior
- MySQL ou MariaDB
- pip (gerenciador de pacotes Python)
- Git

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/letambani/SPA.git
cd SPA/projeto_fmpscGit
```

### 2. Crie um ambiente virtual (recomendado)

```bash
python -m venv venv

# No Windows
venv\Scripts\activate

# No Linux/Mac
source venv/bin/activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

**Nota**: Se o arquivo `requirements.txt` estiver vazio, instale manualmente:

```bash
pip install Flask Flask-Login Flask-Mail Flask-SQLAlchemy Flask-Bcrypt
pip install pandas numpy plotly itsdangerous pymysql
```

### 4. Configure o banco de dados

1. Crie um banco de dados MySQL chamado `spa`:

```sql
CREATE DATABASE spa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Edite o arquivo `config.py` e configure a conexão:

```python
SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://usuario:senha@localhost/spa?charset=utf8mb4'
```

### 5. Configure variáveis de ambiente

Crie um arquivo `.env` ou configure as variáveis de ambiente:

```bash
export SECRET_KEY='sua-chave-secreta-forte-aqui'
export MAIL_USERNAME='seu-email@gmail.com'
export MAIL_PASSWORD='sua-senha-de-app'
```

**Importante**: 
- Use uma chave secreta forte (pode gerar com: `python -c "import secrets; print(secrets.token_hex(32))"`)
- Para Gmail, use uma "Senha de App" em vez da senha normal

### 6. Execute a aplicação

```bash
python app.py
```

A aplicação estará disponível em: **http://localhost:5000**

## 📁 Estrutura do Projeto

```
SPA/
├── projeto_fmpscGit/
│   ├── app.py                 # Aplicação principal Flask
│   ├── config.py              # Configurações
│   ├── requirements.txt        # Dependências Python
│   ├── models/                 # Modelos de dados
│   │   ├── user.py            # Modelo de usuário
│   │   ├── log.py             # Modelo de log
│   │   └── recuperacao_senha.py
│   ├── templates/              # Templates HTML
│   │   ├── login.html
│   │   ├── cadastro.html
│   │   ├── index.html         # Módulo de análises
│   │   └── ...
│   ├── static/                 # Arquivos estáticos
│   │   ├── css/
│   │   ├── js/
│   │   └── logo.png
│   ├── uploads/                # Arquivos CSV enviados
│   └── saved_charts/           # Gráficos salvos
├── ANALISE_COMPLETA.md          # Análise técnica completa
├── FLUXO_NAVEGACAO.md          # Mapeamento de navegação
├── JORNADA_USUARIO.md          # Jornada do usuário
├── README.md                    # Este arquivo
└── index.html                   # Landing page (GitHub Pages)
```

## 🎮 Como Usar

### Primeiro Acesso

1. Acesse `http://localhost:5000`
2. Clique em "Cadastrar"
3. Preencha o formulário com:
   - Nome completo
   - CPF (formato: 000.000.000-00)
   - Email institucional (@aluno.fmpsc.edu.br)
   - Cargo
   - Senha (mínimo 8 caracteres)
4. Após cadastro, faça login

### Gerar Gráficos

1. Acesse o módulo de análises (após login)
2. Selecione um arquivo CSV base
3. Escolha a coluna para análise
4. Configure tipo de gráfico e filtros (opcional)
5. Clique em "Gerar Gráfico"
6. Visualize e faça download se necessário

### Comparar Arquivos

1. Selecione arquivo base
2. Selecione arquivo para comparar
3. Configure análise
4. Clique em "Gerar e Comparar"
5. Visualize gráficos base, comparador e variação percentual

## 🔐 Permissões

- **Usuário Comum**: Pode gerar gráficos e comparar arquivos
- **Administrador**: Pode fazer upload de arquivos CSV
  - Email admin hardcoded: `marcelo.souza@aluno.fmpsc.edu.br`

## 📚 Documentação

- [Análise Completa do Código](ANALISE_COMPLETA.md) - Análise técnica detalhada
- [Fluxo de Navegação](FLUXO_NAVEGACAO.md) - Mapeamento completo do sistema
- [Jornada do Usuário](JORNADA_USUARIO.md) - Diagramas interativos

## ⚠️ Importante sobre GitHub Pages

**Este projeto é uma aplicação Flask que requer um servidor Python para funcionar.**

O GitHub Pages serve apenas arquivos estáticos (HTML/CSS/JS) e **não pode executar aplicações Flask**.

Para usar o sistema, você precisa:
- ✅ Executar localmente seguindo os passos de instalação
- ✅ Ou fazer deploy em serviços como:
  - [Heroku](https://www.heroku.com/)
  - [Railway](https://railway.app/)
  - [Render](https://render.com/)
  - [PythonAnywhere](https://www.pythonanywhere.com/)
  - VPS próprio

A página `index.html` na raiz é apenas uma landing page informativa para o GitHub Pages.

## 🛠️ Desenvolvimento

### Executar em modo debug

O arquivo `app.py` já está configurado para rodar em modo debug:

```python
app.run(debug=True)
```

### Criar banco de dados

O banco é criado automaticamente na primeira execução:

```python
with app.app_context():
    db.create_all()
```

## 🔒 Segurança

⚠️ **ATENÇÃO**: Antes de usar em produção, implemente as melhorias de segurança listadas em [ANALISE_COMPLETA.md](ANALISE_COMPLETA.md), especialmente:

- [ ] Configurar SECRET_KEY forte via variável de ambiente
- [ ] Desabilitar debug mode em produção
- [ ] Configurar SQLALCHEMY_ECHO = False em produção
- [ ] Implementar CSRF protection
- [ ] Adicionar rate limiting
- [ ] Validar uploads adequadamente

## 📝 Licença

Este projeto foi desenvolvido para uso interno da FMPSC.

## 👥 Contribuidores

- Desenvolvido para FMPSC - Faculdade de Medicina de Santa Catarina
- iLab - Sistema de Processamento e Análises

## 📞 Suporte

Para questões e suporte, abra uma [issue](https://github.com/letambani/SPA/issues) no repositório.

---

**Desenvolvido com ❤️ para FMPSC**

