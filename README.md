# Atlassian Confluence MCP Server

This project provides a Model Context Protocol (MCP) server that acts as a bridge between AI assistants (like Anthropic's Claude, Cursor AI, or other MCP-compatible clients) and your Atlassian Confluence instance. It allows AI to securely access and interact with your Confluence spaces and pages in real time.

---

# Overview

## What is MCP?

Model Context Protocol (MCP) is an open standard that allows AI systems to securely and contextually connect with external tools and data sources.

This server implements MCP specifically for Confluence Cloud, bridging your Confluence data with AI assistants.

## Why Use This Server?

- **Minimal Input, Maximum Output Philosophy**: Simple identifiers like `spaceKey` and `pageId` are all you need. Each tool returns comprehensive details without requiring extra flags.

- **Complete Knowledge Base Access**: Provide your AI assistant with full visibility into your documentation, wikis, and knowledge base content in real time.

- **Rich Content Formatting**: All page content is automatically converted from Atlassian Document Format to Markdown with proper headings, tables, lists, and other formatting elements.

- **Secure Local Authentication**: Credentials are never stored in the server. The server runs locally, so your tokens never leave your machine and you can request only the permissions you need.

- **Intuitive Markdown Responses**: All responses use well-structured Markdown for readability with consistent formatting and navigational links.

---

# Getting Started

## Prerequisites

- **Node.js** (>=18.x): [Download](https://nodejs.org/)
- **Atlassian Account** with access to Confluence Cloud

---

## Step 1: Get Your Atlassian API Token

1. Go to your Atlassian API token management page:
   [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**.
3. Give it a descriptive **Label** (e.g., `mcp-confluence-access`).
4. Click **Create**.
5. **Copy the generated API token** immediately. You won't be able to see it again.

---

## Step 2: Configure Credentials

### Method A: MCP Config File (Recommended)

Create or edit `~/.mcp/configs.json`:

```json
{
	"@aashari/mcp-server-atlassian-confluence": {
		"environments": {
			"ATLASSIAN_SITE_NAME": "<YOUR_SITE_NAME>",
			"ATLASSIAN_USER_EMAIL": "<YOUR_ATLASSIAN_EMAIL>",
			"ATLASSIAN_API_TOKEN": "<YOUR_COPIED_API_TOKEN>"
		}
	}
}
```

- `<YOUR_SITE_NAME>`: Your Confluence site name (e.g., `mycompany` for `mycompany.atlassian.net`).
- `<YOUR_ATLASSIAN_EMAIL>`: Your Atlassian account email.
- `<YOUR_COPIED_API_TOKEN>`: The API token from Step 1.

### Method B: Environment Variables

Pass credentials directly when running the server:

```bash
ATLASSIAN_SITE_NAME="<YOUR_SITE_NAME>" \
ATLASSIAN_USER_EMAIL="<YOUR_EMAIL>" \
ATLASSIAN_API_TOKEN="<YOUR_API_TOKEN>" \
npx -y @aashari/mcp-server-atlassian-confluence
```

---

## Step 3: Connect Your AI Assistant

Configure your MCP-compatible client to launch this server.

**Claude / Cursor Configuration:**

```json
{
	"mcpServers": {
		"aashari/mcp-server-atlassian-confluence": {
			"command": "npx",
			"args": ["-y", "@aashari/mcp-server-atlassian-confluence"]
		}
	}
}
```

This configuration launches the server automatically at runtime.

---

# Tools

This section covers the MCP tools available when using this server with an AI assistant. Note that MCP tools use `snake_case` for tool names and `camelCase` for parameters.

## `confluence_list_spaces`

List available Confluence spaces with optional filtering.

```json
{}
```

_or:_

```json
{ "type": "global", "status": "current" }
```

> "Show me all Confluence spaces."

---

## `confluence_get_space`

Get full details for a specific space, including homepage information.

```json
{ "spaceKey": "DEV" }
```

> "Tell me about the DEV space in Confluence."

---

## `confluence_list_pages`

List pages within one or more spaces with optional filtering.

```json
{ "spaceId": ["123456"] }
```

_or:_

```json
{ "status": ["current"], "query": "Project Plan" }
```

> "Show me current pages in space 123456."

---

## `confluence_get_page`

Get full content and metadata for a specific page.

```json
{ "pageId": "12345678" }
```

> "Get the content of Confluence page 12345678."

---

## `confluence_search`

Search Confluence content using CQL (Confluence Query Language).

```json
{ "cql": "text ~ 'project plan'" }
```

_or:_

```json
{ "cql": "space = DEV AND label = api AND created >= '2023-01-01'" }
```

> "Search Confluence for pages about project plans."

---

# Command-Line Interface (CLI)

The CLI uses kebab-case for commands (e.g., `confluence-list-spaces`) and options (e.g., `--space-key`).

## Quick Use with `npx`

```bash
npx -y @aashari/mcp-server-atlassian-confluence confluence-list-spaces
npx -y @aashari/mcp-server-atlassian-confluence confluence-get-page --page-id 12345678
```

## Install Globally

```bash
npm install -g @aashari/mcp-server-atlassian-confluence
```

Then run directly:

```bash
mcp-atlassian-confluence confluence-list-spaces
```

## Discover More CLI Options

Use `--help` to see flags and usage for all available commands:

```bash
mcp-atlassian-confluence --help
```

Or get detailed help for a specific command:

```bash
mcp-atlassian-confluence confluence-get-space --help
mcp-atlassian-confluence confluence-search --help
mcp-atlassian-confluence confluence-list-pages --help
```

---

# License

[ISC License](https://opensource.org/licenses/ISC)
