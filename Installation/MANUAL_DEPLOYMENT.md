# Manual Deployment Guide - Silkroad Legends Portal

> **Note**: This guide is intended for users who wish to deploy the project manually or through third-party services (like Vercel) instead of using the automated GitHub Actions pipeline.

## 1. Definitions & Declarations

To successfully deploy this project, it is essential to understand its architecture. The application defines two distinct components that must be deployed separately but linked together.

### The Components

1.  **frontend** (`/` root directory)

    - **Type**: Single Page Application (SPA).
    - **Technology**: React, Vite, TypeScript.
    - **Output**: Static files (HTML, CSS, JavaScript) generated in the `dist/` folder.
    - **Hosting**: Can be hosted on **any** static file server (Vercel, Netlify, Apache, Nginx, etc.).

2.  **backend** (`/lafftale-backend` directory)
    - **Type**: Runtime Application / REST API.
    - **Technology**: Node.js, Express, MSSQL.
    - **Output**: A running process that listens on a specific port.
    - **Hosting**: Requires a server that can execute Node.js (VPS, DigitalOcean, Railway, Render, Heroku).

---

## 2. Frontend Deployment

The frontend is what your users see. It needs to know where the backend is located.

### Option A: Vercel (Recommended)

Vercel is the easiest way to deploy Vite applications. It automatically handles build settings and domains.

1.  **Create Account**: Go to [vercel.com](https://vercel.com) and sign up.
2.  **Import Project**:
    - Click **"Add New..."** -> **"Project"**.
    - Select your Git repository (GitHub/GitLab/Bitbucket).
3.  **Configure Project**:
    - **Framework Preset**: Vercel should automatically detect **Vite**.
    - **Root Directory**: Leave as `./` (default).
4.  **Environment Variables**:
    - Open the **"Environment Variables"** section.
    - Add the following variables (pointing to your **deployed backend** URL):
      - `VITE_API_baseurl`: `https://api.your-domain.com`
      - `VITE_API_weburl`: `https://api.your-domain.com`
      - `VITE_ASSETS_weburl`: `https://your-domain.com`
5.  **Deploy**: Click **Deploy**. Vercel will build your site and provide a URL.
6.  **Custom Domain**:
    - Go to **Settings** -> **Domains**.
    - Enter your domain (e.g., `www.myserver.com`).
    - Follow the DNS instructions (usually adding a CNAME record).

### Option B: Manual Static Hosting (Oldschool)

If you have a standard web host (Apache, Nginx, FTP):

1.  **Build Locally**:
    Open your terminal in the project root and run:

    ```bash
    npm install
    npm run build
    ```

    This creates a `dist` folder.

2.  **Upload**:
    Upload the **contents** of the `dist` folder to your web server (e.g., `public_html`).

3.  **Configure Redirects (Important!)**:
    Since this is an SPA, all requests must be redirected to `index.html` so React Router can handle them.

    - **For Apache** (`.htaccess`):

      ```apache
      <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
      </IfModule>
      ```

    - **For Nginx**:
      ```nginx
      location / {
        try_files $uri $uri/ /index.html;
      }
      ```

---

## 3. Backend Deployment

The backend connects to your MSSQL database and processes game logic.

### Option A: VPS / Directed Server (Standard)

This is the most robust method, suitable for connecting to a local or remote Database.

1.  **Prerequisites**:

    - A server (Ubuntu/Debian recommended).
    - **Node.js (v20+)** installed.
    - **PM2** (Process Manager) installed globally: `npm install -g pm2`.

2.  **Upload Files**:
    Copy the `lafftale-backend` folder to your server (via FTP, SCP, or Git).

3.  **Installation**:
    Navigate to the folder on your server:

    ```bash
    cd /path/to/lafftale-backend
    npm install
    ```

4.  **Configuration**:

    - Rename `.env.example` to `.env`.
    - Edit `.env` with your **Production Database** details.

    ```bash
    cp .env.example .env
    nano .env
    ```

5.  **Start the Process**:
    Use PM2 to keep the app running in the background.

    ```bash
    pm2 start app.js --name "silkroad-api"
    pm2 save
    pm2 startup
    ```

6.  **Expose to Internet**:
    You usually need a Reverse Proxy (Nginx) to add SSL (HTTPS) and forward traffic from port 80/443 to the Node.js port (usually 5000 or 3000).

    - **Example Nginx Config**:

      ```nginx
      server {
          server_name api.your-domain.com;

          location / {
              proxy_pass http://localhost:5000; # Match your backend port
              proxy_http_version 1.1;
              proxy_set_header Upgrade $http_upgrade;
              proxy_set_header Connection 'upgrade';
              proxy_set_header Host $host;
              proxy_cache_bypass $http_upgrade;
          }
      }
      ```

### Option B: Cloud PaaS (Railway / Render)

Services like Railway or Render can host the backend easily without managing a server.

1.  **Connect Repo**: Connect your GitHub repo.
2.  **Root Directory**: Set the "Root Directory" to `lafftale-backend`.
3.  **Build Command**: `npm install`.
4.  **Start Command**: `node app.js`.
5.  **Environment Variables**: Enter your MSSQL database credentials in the dashboard variables.

> **Note on Vercel for Backend**: While Vercel can host Node.js, it is primarily serverless. Standard Express servers (like this project) with database connections are often better hosted on **persistent** servers (VPS, Railway, Render) to avoid "Cold Boot" issues and connection limits, though Vercel can be configured to run it using `vercel.json` rewrites if strictly necessary.

---

## 4. Connecting Them

Once both are deployed:

1.  Take the **URL of your deployed backend** (e.g., `https://api.myserver.com`).
2.  Go back to your **Frontend** configuration (Vercel Dashboard or `.env` before building).
3.  Update `VITE_API_baseurl` to match your backend URL.
4.  Store `VITE_API_weburl` as the backend URL as well.
5.  Store `VITE_ASSETS_weburl` as your **Frontend URL**.

The system is now fully linked and operational.
