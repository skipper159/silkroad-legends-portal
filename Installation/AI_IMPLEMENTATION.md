# 🤖 AI-Assisted Development Guide

This guide describes how to set up AI coding assistants with MCP (Model Context Protocol) server support for enhanced development experience in VS Code.

## 📋 What is MCP?

MCP (Model Context Protocol) allows AI assistants to interact with external tools and databases directly. For this project, we use:

- **MSSQL MCP Server** - Direct database queries from AI
- **File System Access** - AI can read/modify project files

## 🚀 Setup for VS Code

### Prerequisites

- VS Code with AI extension (Copilot, Cursor, Cline, etc.)
- Node.js 18+
- MCP-compatible AI extension

---

## 📁 Configuration Files

### 1. Copy MCP Configuration Template

```bash
# From the project root
cp .vscode/mcp.json.example .vscode/mcp.json
```

### 2. Edit .vscode/mcp.json

Fill in your database credentials:

```json
{
  "mcpServers": {
    "mssql": {
      "command": "node",
      "args": ["C:/path/to/dist/index.js"],
      "env": { ... }
    }
  }
}
```

---

## 🗄️ Database MCP Server

We recommend using the official **MssqlMcp** from Azure SQL AI Samples for the best compatibility.

### Option A: Local Node.js Setup (Recommended)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Azure-Samples/SQL-AI-samples.git
   ```

2. **Build the MCP Server**:

   ```bash
   cd SQL-AI-samples/MssqlMcp/Node
   npm install
   npm run build
   ```

3. **Configure VS Code**:
   Update your `.vscode/mcp.json` to point to the built file (see [.vscode/mcp.json.example](../.vscode/mcp.json.example)).

   ```json
   {
     "mcpServers": {
       "mssql-local": {
         "command": "node",
         "args": ["C:/Path/To/SQL-AI-samples/MssqlMcp/Node/dist/index.js"],
         "env": {
           "SERVER_NAME": "localhost",
           "DATABASE_NAME": "SRO_CMS",
           "USERNAME": "sa",
           "PASSWORD": "your-password",
           "READONLY": "false"
         }
       }
     }
   }
   ```

### Option B: Remote NPM Package (No Build Required)

For a quick start without cloning/building, use the Anthropic package via `npx`:

```json
"mssql": {
  "command": "npx",
  "args": ["-y", "@anthropic/mcp-server-mssql"],
  "env": { ... }
}
```

### Capabilities

The MCP server allows AI to:

- Execute SQL queries directly
- Explore database schema
- Generate migrations based on actual data
- Debug database issues in real-time

### Example Usage in AI Chat

```
"Show me the structure of the users table"
"How many active vouchers are there?"
"Generate a query to find top 10 donors"
```

---

## 🔒 Security Notes

> ⚠️ **Important**: Never commit your actual `mcp.json` to version control!

The `.gitignore` already ignores `.vscode/*` (except `extensions.json`), so your credentials are safe.

For production-like testing, create a read-only database user:

```sql
CREATE LOGIN mcp_readonly WITH PASSWORD = 'secure-password';
USE SRO_CMS;
CREATE USER mcp_readonly FOR LOGIN mcp_readonly;
ALTER ROLE db_datareader ADD MEMBER mcp_readonly;
```

---

## 🛠️ Supported AI Extensions

| Extension      | MCP Support | Notes            |
| -------------- | ----------- | ---------------- |
| GitHub Copilot | ✅          | Via Copilot Chat |
| Cursor         | ✅          | Native support   |
| Cline          | ✅          | Native support   |
| Aider          | ⚠️          | Limited          |
| Continue       | ✅          | Via config       |

---

## 📚 Useful AI Prompts for This Project

### Database Queries

```
"Show me all tables in SRO_CMS"
"Display the referral_rewards tier structure"
"Find users who registered in the last 7 days"
```

### Code Generation

```
"Create an API endpoint for user statistics"
"Add a new settings key for maximum daily votes"
"Generate TypeScript types for the donations API response"
```

### Debugging

```
"Why is the vote cooldown not working correctly?"
"Check if the referral foreign keys are set up properly"
"Analyze the news table for any orphaned records"
```

---

## ❓ Troubleshooting

### MCP server won't connect

1. Verify SQL Server is running
2. Check TCP/IP is enabled in SQL Configuration Manager
3. Ensure port 1433 is not blocked by firewall
4. Restart VS Code after changing mcp.json

### AI doesn't see database

1. Reload VS Code window (`Ctrl+Shift+P` → "Reload Window")
2. Check MCP extension logs for errors
3. Verify credentials in mcp.json are correct

### "Permission denied" errors

- Create a user with appropriate permissions (see Security Notes)
- For development, `db_datareader` is usually sufficient
