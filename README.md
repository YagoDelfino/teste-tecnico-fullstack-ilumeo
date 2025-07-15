# ⏰ Controle de Ponto Ilumeo

Este é um projeto Fullstack desenvolvido como parte de um desafio técnico para criar uma aplicação de controle de ponto. Ele permite que colaboradores registrem suas entradas e saídas, visualizem o total de horas trabalhadas no dia atual, e acompanhem um histórico de horas em dias anteriores.

### Orquestração e Ambiente
* **Docker:** Para containerização do banco de dados, backend e frontend.
* **Docker Compose:** Para orquestrar e gerenciar a inicialização de todos os serviços em um único comando.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* [**Node.js**](https://nodejs.org/en/download/) (versão 18.x ou superior) e **npm** (gerenciador de pacotes).
* [**Docker Desktop**](https://www.docker.com/products/docker-desktop/) (inclui Docker Engine e Docker Compose) ou **Docker Engine** e **Docker Compose** separadamente (para Linux).

## ⚙️ Configuração e Instalação

Siga os passos abaixo para configurar e rodar o projeto em sua máquina.

### 1. Clonar o Repositório

```bash
git clone https://github.com/YagoDelfino/teste-tecnico-fullstack-ilumeo.git
cd ilumeo-time-tracker
```

Crie um arquivo .env na raiz do projeto (ilumeo-time-tracker/.env) e preencha-o com as variáveis de ambiente necessárias. Você pode usar o .env.example como base para o backend.

Embora o Docker instale as dependências dentro dos containers, recomendamos rodar o comando abaixo localmente nos diretórios backend/ e frontend/:

```bash
cd backend
npm install

cd ../frontend
npm install
```
Depois é só ir para raíz do projeto e rodar 

```bash
docker-compose up --build
```