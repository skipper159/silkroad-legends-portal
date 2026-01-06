# 🚀 Installation Guide - Silkroad Legends Portal

Complete installation guide for setting up the Silkroad Legends Portal from scratch.

## 📋 Prerequisites

### Required Software

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Microsoft SQL Server** 2017+ (Express or higher)
- **SQL Server Management Studio (SSMS)** ([Download](https://aka.ms/ssmsfullsetup))
- **Git** ([Download](https://git-scm.com/))

### Existing Silkroad Databases

Make sure your Silkroad server is running with these databases:

- `SILKROAD_R_ACCOUNT` - Player accounts
- `SRO_VT_SHARD` - Game world data
- `SRO_VT_LOG` - Game logs

---

## 📥 Step 1: Clone Repository

```bash
git clone https://github.com/skipper159/silkroad-legends-portal.git
cd silkroad-legends-portal
```

---

## 🗄️ Step 2: Database Setup

### 2.1 Create SRO_CMS Database

Run these SQL scripts **in order** using SSMS:

| Order | Script                                         | Purpose                       |
| ----- | ---------------------------------------------- | ----------------------------- |
| 1     | `Installation/Database/01_create_database.sql` | Create SRO_CMS database       |
| 2     | `Installation/Database/02_create_tables.sql`   | Create all 20+ tables         |
| 3     | `Installation/Database/03_seed_data.sql`       | Insert sample data (optional) |

📖 Detailed guide: [DATABASE_SETUP.md](./Database/DATABASE_SETUP.md)

---

## 🖥️ Step 3: Backend Setup

```bash
cd lafftale-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# See .env.example for all required variables

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

### Verify Installation

- API Health: `http://localhost:3000/api`
- Swagger Docs: `http://localhost:3000/api-docs`

---

## 🌐 Step 4: Frontend Setup

```bash
# From the root directory
cd ..

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (localhost URLs are pre-configured for development)

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

---

## 👤 Step 5: Create Admin User

1. Register a new account via the website
2. Grant admin role via SQL:

```sql
USE SRO_CMS;
-- Replace 1 with your user's id from the users table
INSERT INTO user_roles (user_id, role, granted_at)
VALUES (1, 'admin', GETDATE());
```

---

## ✅ Installation Complete!

Your development environment is now ready:

| Component   | URL                              |
| ----------- | -------------------------------- |
| Frontend    | `http://localhost:8080`          |
| Backend API | `http://localhost:3000`          |
| API Docs    | `http://localhost:3000/api-docs` |

---

## 📚 Related Documentation

- [README.md](../README.md) - Project overview
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Production deployment
- [DATABASE_SETUP.md](./Database/DATABASE_SETUP.md) - Database details
- [AI_IMPLEMENTATION.md](./AI_IMPLEMENTATION.md) - AI/MCP setup for development

---

## ❓ Troubleshooting

### Backend won't start

- Check SQL Server is running
- Verify database credentials in `.env`
- Ensure SRO_CMS database exists

### Frontend won't connect to backend

- Verify backend is running on port 3000
- Check `.env` has correct `VITE_API_baseurl`

### Database connection errors

- Enable TCP/IP in SQL Server Configuration Manager
- Check Windows Firewall allows port 1433
