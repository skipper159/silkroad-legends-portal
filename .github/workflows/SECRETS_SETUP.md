# GitHub Actions Secrets Setup

To securely deploy your application using GitHub Actions, you must configure **Repository Secrets**. These secrets prevent sensitive information (like server paths and service names) from being exposed in your public code.

## 🚀 How to Add Secrets

1.  Go to your repository on GitHub.
2.  Click on the **Settings** tab.
3.  In the left sidebar, expand **Secrets and variables** and click **Actions**.
4.  Click the green **New repository secret** button.
5.  Add the secrets listed below one by one.

## 🔑 Required Secrets

| Secret Name              | Value Example             | Description                                                  |
| :----------------------- | :------------------------ | :----------------------------------------------------------- |
| **DEPLOY_HOST_BACKEND**  | `/path/to/backend/`       | Absolute path to the backend directory on your server.       |
| **DEPLOY_HOST_FRONTEND** | `/path/to/frontend/`      | Absolute path to the frontend directory on your server.      |
| **PM2_SERVICE_NAME**     | `lafftale-api`            | Name of the PM2 process managing the backend.                |
| **API_BASE_URL**         | `https://api.example.com` | Public URL of your backend API (used during build).          |
| **APP_URL**              | `https://example.com`     | Public URL of your frontend application (used during build). |

## ⚠️ Important Notes

- **Exact Match**: Ensure the secret names match exactly (including underscores and capitalization).
- **No Leading/Trailing Spaces**: When pasting values, verify there are no accidental spaces.
- **Failures**: If a deployment fails with an error like "rsync: missing argument" or "pm2: command not found", usually a secret is missing or empty.

## 🏃‍♂️ Self-Hosted Runners

This configuration assumes you are using **Self-Hosted Runners** on your production server (as indicated by `runs-on: self-hosted` in the workflow files). Ensure your runner is valid and active in **Settings > Actions > Runners**.
