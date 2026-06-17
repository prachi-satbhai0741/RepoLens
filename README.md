# 🔍 RepoLens

<div align="center">

![License](https://img.shields.io/badge/License-MIT-green.svg)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Backend](https://img.shields.io/badge/Backend-Node.js-brightgreen)
![Database](https://img.shields.io/badge/Database-MongoDB-darkgreen)
![Docker](https://img.shields.io/badge/Containerized-Docker-blue)

**AI-powered GitHub Repository Analyzer for Code Review, Security Scanning, and Semantic Search**

</div>

---

## Overview

RepoLens is an intelligent developer tool designed to analyze GitHub repositories and provide deep insights into code quality, security vulnerabilities, project structure, and repository understanding.

It helps developers, teams, and open-source contributors review repositories faster by combining **AI analysis**, **security scanning**, and **semantic code search** in one platform.

Instead of manually understanding a large codebase, RepoLens provides automated insights within seconds.

---

## Features
1. Intelligent Code Review
2. Security Vulnerability Scanning
3. Semantic Code Search
4. AI-Powered Repository Summary
5. Pull Request Analysis
6. Interactive Dashboard

---
## Tech Stack

### Frontend

- React.js  
- Tailwind CSS  
- Axios  
- React Router  

### Backend

- Node.js  
- Express.js  
- REST APIs  

### Database

- MongoDB  

### DevOps & Deployment

- Docker  
- Docker Compose  
- GitHub Actions  
- CI/CD Pipeline  

### AI Integration

- OpenAI API / LLM APIs  
- Embedding Search  
- NLP Processing  

---
## Architecture

```text
                GitHub Repository
                        │
                        ▼
              Repository Fetcher
                        │
                        ▼
                Code Parser Engine
                        │
      ┌─────────────────┼─────────────────┐
      ▼                 ▼                 ▼
 AI Review        Security Scanner   Semantic Search
   Engine              Engine            Engine
      └─────────────────┼─────────────────┘
                        │
                        ▼
                  API Backend
                        │
                        ▼
                React Dashboard
```
---
## Project Structure

```text
RepoLens/
│
├── frontend/                 # React frontend
│   ├── src/
│   ├── components/
│   ├── pages/
│
├── backend/                 # Backend server
│   ├── routes/
│   ├── services/
│   ├── models/
│   ├── middleware/
│
├── docker-compose.yml
├── .env.example
├── README.md
└── LICENSE
```

---

## Installation

Clone the repository

```bash
git clone https://github.com/your-username/RepoLens.git
```

Move to project directory

```bash
cd RepoLens
```

Install frontend dependencies

```bash
cd frontend
npm install
```

Install backend dependencies

```bash
cd ../backend
npm install
```

Run project

```bash
npm run dev
```

---

##  Future Improvements

- Multi-repository comparison  
- CI/CD pipeline integration  
- Kubernetes deployment analysis  
- AI-generated code suggestions  
- Automated pull request review bot  
- Team collaboration workspace  
- Real-time GitHub webhook integration  

---
## Contributing

Contributions are welcome.

Steps:

1. Fork repository  
2. Create feature branch  
3. Commit changes  
4. Push code  
5. Open pull request  

---

## License

This project is licensed under the MIT License.

---
