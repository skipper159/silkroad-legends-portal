# Deployment Guides - Silkroad Legends Portal

This project supports multiple deployment strategies depending on your infrastructure and needs.

## Available Guides

### 1. [GitHub Actions Deployment](./GITHUB_DEPLOYMENT.md)

**Recommended for**: Production environments with a dedicated self-hosted runner.

- **What it does**: Automatically builds and deploys changes when you push to the `main` branch.
- **Requirements**: A Linux server (VPS) with a GitHub Self-Hosted Runner installed.

### 2. [Manual & Vercel Deployment](./Installation/MANUAL_DEPLOYMENT.md)

**Recommended for**: Users without a dedicated runner, testing, or using PaaS like Vercel.

- **What it does**: Explains how to:
  - Deploy the **Frontend** to Vercel (free & easy).
  - Deploy the **Backend** to a standard VPS or Node.js host manually.
  - Link them together properly.

---

## Which one should I choose?

- **Automation High?** -> Use [GitHub Actions](./GITHUB_DEPLOYMENT.md).
- **Just testing?** -> Use [Manual/Vercel](./Installation/MANUAL_DEPLOYMENT.md).
- **Shared Hosting / cPanel?** -> Use [Manual Deployment](./Installation/MANUAL_DEPLOYMENT.md) (Standard Hosting section).
