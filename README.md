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
	"confluence": {
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

**Note:** For backward compatibility, the server will also recognize configurations under the full package name (`@aashari/mcp-server-atlassian-confluence`), the unscoped package name (`mcp-server-atlassian-confluence`), or the `atlassian-confluence` format if the recommended `confluence` key is not found. However, using the short `confluence` key is preferred for new configurations.

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
		"confluence": {
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

## `conf_ls_spaces`

Lists Confluence spaces accessible to the user.

- Filters: `type` ('global', 'personal'), `status` ('current', 'archived').
- Pagination: `limit`, `cursor`. Pagination information, including the next cursor value, is included directly in the returned text content.
- Default sort: by name.

**Example:**

```json
{ "type": "global", "status": "current", "limit": 10 }
```

> "Show me the first 10 current global Confluence spaces."

---

## `conf_get_space`

Get full details for a specific space using its `spaceKey`. Includes homepage, description, and other metadata.

**Example:**

```json
{ "spaceKey": "DEV" }
```

> "Tell me about the DEV space in Confluence."

---

## `conf_ls_pages`

Lists pages.

- Filters: `spaceIds` (array of space IDs), `spaceKeys` (array of space keys), `title` (text in title), `status` (e.g., 'current', 'archived').
- Sorting: `sort` (e.g., '-modified-date', 'title').
- Pagination: `limit`, `cursor`. Pagination information, including the next cursor value, is included directly in the returned text content.

**Example (by space key and title):**

```json
{
	"spaceKeys": ["DEV"],
	"title": "API Documentation",
	"status": ["current"],
	"sort": "-modified-date"
}
```

**Example (multiple space keys):**

```json
{
	"spaceKeys": ["DEV", "HR", "MARKETING"],
	"limit": 15,
	"sort": "-modified-date"
}
```

> "Show me current pages in the DEV space with 'API Documentation' in the title, sorted by modification date."

---

## `conf_get_page`

Get full content (as Markdown) and metadata for a specific page by its `pageId`.

**Example:**

```json
{ "pageId": "12345678" }
```

> "Get the content of Confluence page 12345678."

---

## `conf_search`

Searches Confluence content.

- Querying: `cql` (full Confluence Query Language string) or combine simpler filters:
    - `query` (free-text search for body and title)
    - `title` (text in title)
    - `spaceKey` (limit to a space)
    - `labels` (array of labels - content must have ALL)
    - `contentType` ('page', 'blogpost')
- Pagination: `limit`, `cursor`. Pagination information, including the next cursor value, is included directly in the returned text content.
- Returns results as Markdown, including snippets and metadata. The executed CQL query is also included directly in the returned text content.

**Example (simple search):**

```json
{
	"query": "release notes Q1",
	"spaceKey": "PRODUCT",
	"contentType": "page",
	"limit": 5
}
```

> "Search for 'release notes Q1' in pages within the PRODUCT space."

**Example (advanced CQL):**

```json
{ "cql": "space = DEV AND label = api AND created >= '2023-01-01'" }
```

> "Find content in the DEV space, labeled 'api', created since January 1st, 2023."

---

# Command-Line Interface (CLI)

The CLI uses kebab-case for commands (e.g., `ls-spaces`) and options (e.g., `--space-key`).

## Quick Use with `npx`

```bash
npx -y @aashari/mcp-server-atlassian-confluence ls-spaces --type global --status current --limit 10
npx -y @aashari/mcp-server-atlassian-confluence get-space --space-key DEV
npx -y @aashari/mcp-server-atlassian-confluence ls-pages --space-keys DEV HR MARKETING --limit 15 --sort "-modified-date"
npx -y @aashari/mcp-server-atlassian-confluence get-page --page-id 12345678
npx -y @aashari/mcp-server-atlassian-confluence search --query "security best practices" --space-key DOCS --type page --limit 5
npx -y @aashari/mcp-server-atlassian-confluence search --cql "label = official-docs AND creator = currentUser()"
```

## Install Globally

```bash
npm install -g @aashari/mcp-server-atlassian-confluence
```

Then run directly:

```bash
mcp-atlassian-confluence ls-spaces
mcp-atlassian-confluence get-page --page-id 12345678
```

## Available Commands

The following CLI commands are available:

### `ls-spaces`

Lists Confluence spaces with optional filtering and pagination.

```bash
mcp-atlassian-confluence ls-spaces [options]

Options:
  -l, --limit <number>    Maximum number of items to return (1-100). Default is 25
  -c, --cursor <string>   Pagination cursor for retrieving the next set of results
  -t, --type <type>       Filter spaces by type. Options: "global" (team spaces), 
                          "personal" (user spaces), or "archived" (archived spaces)
  -s, --status <status>   Filter spaces by status. Options: "current" (active spaces) 
                          or "archived" (archived spaces)
```

### `get-space`

Gets detailed information about a specific Confluence space.

```bash
mcp-atlassian-confluence get-space --space-key <key>

Options:
  -k, --space-key <key>   The key of the Confluence space to retrieve (required)
```

### `ls-pages`

Lists Confluence pages with filtering, sorting, and pagination.

```bash
mcp-atlassian-confluence ls-pages [options]

Options:
  -l, --limit <number>         Maximum number of items to return (1-250). Default is 25
  -c, --cursor <string>        Pagination cursor for next set of results
  -t, --title <text>           Filter pages by title (EXACT match)
  -S, --space-ids <ids...>     Filter by space IDs (repeatable)
  -k, --space-keys <keys...>   Filter by space keys (repeatable, e.g., "DEV" "HR")
  -s, --status <status>        Filter by status (current, archived, trashed, deleted)
  -o, --sort <sort>            Property to sort pages by (e.g., "-modified-date", "title")
  -p, --parent-id <id>         Filter to show only child pages of the specified parent page ID
```

### `get-page`

Gets detailed information and content for a specific Confluence page.

```bash
mcp-atlassian-confluence get-page --page-id <id>

Options:
  -p, --page-id <id>    The numeric ID of the Confluence page to retrieve (required)
```

### `search`

Searches Confluence content using CQL (Confluence Query Language) or simplified filters.

```bash
mcp-atlassian-confluence search [options]

Options:
  -l, --limit <number>       Maximum number of items to return (1-100). Default is 25
  -c, --cursor <string>      Pagination cursor for next set of results
  -q, --cql <cql>            Full CQL query for advanced filtering
  -t, --title <text>         Filter results by title (contains)
  -k, --space-key <key>      Filter results to a specific space
  --label <labels...>        Filter by one or more labels (repeatable)
  --type <type>              Filter by content type (page or blogpost)
  -s, --query <text>         Simple text search query
```

## Discover More CLI Options

Use `--help` to see flags and usage for all available commands:

```bash
mcp-atlassian-confluence --help
```

Or get detailed help for a specific command:

```bash
mcp-atlassian-confluence ls-spaces --help
mcp-atlassian-confluence get-space --help
mcp-atlassian-confluence ls-pages --help
mcp-atlassian-confluence get-page --help
mcp-atlassian-confluence search --help
```

---

# License

[ISC License](https://opensource.org/licenses/ISC)
