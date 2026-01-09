# 🏛️ Silkroad Legends Portal

# YT Video Preview
https://youtu.be/MSxzUPT6kqU

A modern, full-stack web portal for Silkroad Online private servers. Built with React, TypeScript, and Express.js, featuring real-time player statistics, rankings, donation systems, and comprehensive admin tools.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MSSQL](https://img.shields.io/badge/MSSQL-CC2927?style=flat&logo=microsoft-sql-server&logoColor=white)

## ✨ Features

### 🎮 Player Features

- **Character Rankings** - PVP, PVE, guild rankings with detailed statistics
- **Character Profiles** - Public character pages with equipment, skills, and history
- **Guild System** - Guild overview, member lists, and guild rankings
- **Unique Kill Tracker** - Track boss kills and rare monster statistics
- **Donation System** - Integrated payment processing for premium currency
- **Voucher System** - Redeem codes for in-game rewards
- **Referral Program** - Invite friends and earn rewards
- **Vote Rewards** - Vote on toplists and earn in-game currency

### 🛠️ Admin Dashboard

- **User Management** - View and manage player accounts
- **Ticket System** - Customer support with categories and priorities
- **News Management** - Create and publish server announcements
- **Silk Management** - Grant or revoke premium currency
- **Cron Jobs** - Scheduled tasks management
- **Footer & Settings** - Customize website appearance
- **Download Manager** - Manage game client downloads

### 🔧 Technical Features

- **Real-time Online Players** - Live player count tracking
- **Multi-Database Support** - Connects to multiple MSSQL databases (Game, Account, Log, Character)
- **JWT Authentication** - Secure token-based authentication
- **Email System** - Transactional emails for password reset, notifications
- **Redis Caching** - Optional caching layer for performance
- **Swagger API Docs** - Auto-generated API documentation

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MSSQL Server** (Silkroad database)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/skipper159/silkroad-legends-portal.git
cd silkroad-legends-portal
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# For local development, localhost URLs are already configured

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

### 3. Backend Setup

```bash
cd lafftale-backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
# IMPORTANT: Configure your MSSQL connection settings

# Start development server
npm run dev
```

The backend API will be available at `http://localhost:3000`

API Documentation: `http://localhost:3000/api-docs`

---

## 📁 Project Structure

```
silkroad-legends-portal/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   ├── pages/                # Page components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities and helpers
│   └── styles/               # CSS and styling
├── public/                   # Static assets
├── lafftale-backend/         # Backend source code
│   ├── routes/               # API route handlers
│   ├── controllers/          # Business logic controllers
│   ├── middleware/           # Express middleware
│   ├── services/             # Background services
│   ├── utils/                # Utility functions
│   ├── swagger/              # API documentation
│   └── database/             # Database migrations & seeds
├── .github/workflows/        # GitHub Actions CI/CD
└── docs/                     # Additional documentation
```

---

## ⚙️ Configuration

### Frontend Environment Variables

| Variable             | Description           | Example                 |
| -------------------- | --------------------- | ----------------------- |
| `VITE_API_baseurl`   | Backend API URL       | `http://localhost:3000` |
| `VITE_API_weburl`    | Backend WebSocket URL | `http://localhost:3000` |
| `VITE_ASSETS_weburl` | Frontend assets URL   | `http://localhost:8080` |

### Backend Environment Variables

| Variable       | Description                   | Example            |
| -------------- | ----------------------------- | ------------------ |
| `PORT`         | Server port                   | `3000`             |
| `JWT_SECRET`   | JWT signing key               | `your-secret-key`  |
| `DB_VPLUS_*`   | Web database config           | See `.env.example` |
| `DB_GAME_*`    | Game database config          | See `.env.example` |
| `DB_ACCOUNT_*` | Account database config       | See `.env.example` |
| `DB_LOG_*`     | Log database config           | See `.env.example` |
| `DB_CHAR_*`    | Character database config     | See `.env.example` |
| `EMAIL_*`      | SMTP email config             | See `.env.example` |
| `REDIS_*`      | Redis cache config (optional) | See `.env.example` |

See `.env.example` files for complete configuration options.

---

## 🗄️ Database Setup

The portal requires a **SRO_CMS** database for web portal data (users, news, donations, etc.).

### Quick Setup

```bash
# Navigate to the database scripts folder
cd Installation/Database

# Run in SQL Server Management Studio in order:
# 1. 01_create_database.sql  - Creates SRO_CMS database
# 2. 02_create_tables.sql    - Creates all 20+ tables
# 3. 03_seed_data.sql        - Inserts sample data (optional)
```

### Database Overview

| Database             | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `SRO_CMS`            | Web portal data (news, settings, donations) |
| `SILKROAD_R_ACCOUNT` | Player accounts (TB_User)                   |
| `SRO_VT_SHARD`       | Game world data (characters, items)         |
| `SRO_VT_LOG`         | Game logs (transactions, events)            |

📖 **Full documentation**: [Installation/Database/DATABASE_SETUP.md](./Installation/Database/DATABASE_SETUP.md)

> **Note**: Database names may vary based on your Silkroad server configuration.

---

## 🚢 Deployment

This project uses **GitHub Actions with a Self-Hosted Runner** for automatic deployment.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:

- Server setup
- GitHub Runner configuration
- Environment variable management
- PM2 process management

### Quick Deployment Overview

1. Push to `main` branch
2. GitHub Actions automatically triggers
3. Frontend: Builds and deploys static files
4. Backend: Syncs files and restarts PM2

---

## 🛡️ Security

### Two-Factor Authentication (2FA)

The portal supports TOTP-based Two-Factor Authentication for enhanced account security.

**Supported Apps:**

- Google Authenticator
- Authy
- Microsoft Authenticator
- Any TOTP-compatible app

**User Setup:**

1. Go to Account Settings → Two-Factor Authentication
2. Click "Enable Two-Factor Authentication"
3. Scan the QR code with your authenticator app
4. Enter the 6-digit code to verify and enable

**Admin 2FA Reset:**
If a user loses access to their authenticator, admins can reset their 2FA:

1. Go to Admin → User Management
2. Find the user and click "Reset 2FA"
3. User can then set up 2FA again

### Environment Files

| File              | Contains                   | Committed? |
| ----------------- | -------------------------- | ---------- |
| `.env.example`    | Template with placeholders | ✅ Yes     |
| `.env`            | Your local secrets         | ❌ No      |
| `.env.production` | Production secrets         | ❌ No      |

### Security Checklist

- [x] All `.env` files are gitignored
- [x] No hardcoded credentials in source code
- [x] JWT secrets are environment variables
- [x] Database passwords not in repository
- [x] API keys configured via environment
- [x] Two-Factor Authentication available
- [x] Admin can reset user 2FA for support cases

---

## 🧪 Development

### Available Scripts

**Frontend:**

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

**Backend:**

```bash
cd lafftale-backend
npm run dev         # Start with nodemon
npm start           # Start production server
npm test            # Run tests
```

### API Documentation

The backend includes Swagger documentation:

- Development: `http://localhost:3000/api-docs`
- Production: `https://your-backend-url/api-docs`

---

## 📚 Documentation

| Guide                                                       | Description                    |
| ----------------------------------------------------------- | ------------------------------ |
| [Installation Guide](./Installation/INSTALL.md)             | Complete setup from scratch    |
| [Database Setup](./Installation/Database/DATABASE_SETUP.md) | SQL database configuration     |
| [Deployment Guide](./DEPLOYMENT.md)                         | Production deployment          |
| [AI Development](./Installation/AI_IMPLEMENTATION.md)       | MCP server setup for AI coding |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Silkroad Online](https://www.joymax.com/) - Original game
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/skipper159/silkroad-legends-portal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/skipper159/silkroad-legends-portal/discussions)

---

<p align="center">
  Made with ❤️ for the Silkroad community
</p>
