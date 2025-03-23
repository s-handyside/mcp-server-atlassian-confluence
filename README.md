# Atlassian Confluence MCP Server

## About

This project is a customizable Model Context Protocol (MCP) server written in TypeScript, designed to extend AI assistants like Claude or Cursor with access to Atlassian Confluence data. MCP is an open-source protocol by Anthropic for connecting AI systems to external capabilities securely and efficiently. For more details on MCP, see [https://modelcontextprotocol.io/docs/](https://modelcontextprotocol.io/docs/). This server allows AI assistants to search and access Confluence spaces, pages, and content directly from your organization's knowledge base.

## Project Features

- **MCP Server**: Exposes Confluence tools and resources to AI clients (e.g., Claude Desktop, Cursor AI) via STDIO or HTTP.
- **Confluence Integration**: Access spaces, pages, and search functionality from your Confluence instance.
- **CLI Support**: Run Confluence queries directly from the command line without an AI client.
- **Flexible Configuration**: Supports direct environment variables for quick use or a global config file at `$HOME/.mcp/configs.json` for managing multiple servers.
- **Development Tools**: Built-in MCP Inspector for debugging, plus testing and linting utilities.

### Available Tools

- **`search`**: Search Confluence content using Confluence Query Language (CQL).
- **`list-spaces`**: Get a list of all available Confluence spaces.
- **`get-space`**: Retrieve detailed information about a specific space.
- **`list-pages`**: Get a list of pages in a space with optional filtering.
- **`get-page`**: Retrieve the full content of a specific page.

## User Guide

### Configuration Options

- **DEBUG**: Set to `true` for detailed logging (default: `false`).
- **ATLASSIAN_SITE_NAME**: Your Atlassian site name (e.g., `your-instance` for `your-instance.atlassian.net`) – required.
- **ATLASSIAN_USER_EMAIL**: Your Atlassian account email address – required.
- **ATLASSIAN_API_TOKEN**: API token for Atlassian API access – required.

#### Method 1: Environment Variables

Pass configs directly when running:

```bash
DEBUG=true ATLASSIAN_SITE_NAME=your-instance ATLASSIAN_USER_EMAIL=your-email@example.com ATLASSIAN_API_TOKEN=your_token npx -y @aashari/mcp-server-atlassian-confluence
```

#### Method 2: Global Config File (Recommended)

Create `$HOME/.mcp/configs.json`:

```json
{
	"@aashari/mcp-server-atlassian-confluence": {
		"environments": {
			"DEBUG": "true",
			"ATLASSIAN_SITE_NAME": "your-instance",
			"ATLASSIAN_USER_EMAIL": "your-email@example.com",
			"ATLASSIAN_API_TOKEN": "your_api_token"
		}
	}
}
```

You can also configure multiple MCP servers in the same file:

```json
{
	"@aashari/boilerplate-mcp-server": {
		"environments": {
			"DEBUG": "true",
			"IPAPI_API_TOKEN": "your_token"
		}
	},
	"@aashari/mcp-server-atlassian-confluence": {
		"environments": {
			"DEBUG": "true",
			"ATLASSIAN_SITE_NAME": "your-instance",
			"ATLASSIAN_USER_EMAIL": "your-email@example.com",
			"ATLASSIAN_API_TOKEN": "your_api_token"
		}
	},
	"@aashari/mcp-server-atlassian-jira": {
		"environments": {
			"DEBUG": "true",
			"ATLASSIAN_SITE_NAME": "your-instance",
			"ATLASSIAN_USER_EMAIL": "your-email@example.com",
			"ATLASSIAN_API_TOKEN": "your_api_token"
		}
	}
}
```

### Using with Claude Desktop

1. **Open Settings**:
    - Launch Claude Desktop, click the gear icon (top-right).
2. **Edit Config**:
    - Click "Edit Config" to open `claude_desktop_config.json` (e.g., `~/Library/Application Support/Claude` on macOS or `%APPDATA%\Claude` on Windows).
3. **Add Server**:
    - Use the global config file (recommended):
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
    - Or configure directly:
        ```json
        {
        	"mcpServers": {
        		"aashari/mcp-server-atlassian-confluence": {
        			"command": "npx",
        			"args": [
        				"-y",
        				"DEBUG=true",
        				"ATLASSIAN_SITE_NAME=your-instance",
        				"ATLASSIAN_USER_EMAIL=your-email@example.com",
        				"ATLASSIAN_API_TOKEN=your_token",
        				"@aashari/mcp-server-atlassian-confluence"
        			]
        		}
        	}
        }
        ```
4. **Restart**: Close and reopen Claude Desktop.
5. **Test**: Click the hammer icon, verify Confluence tools are listed, then ask: "Search Confluence for project documentation" or "Show me the contents of the 'Getting Started' page."

### Using with Cursor AI

1. **Open Settings**:
    - Launch Cursor, press `CMD + SHIFT + P` (or `CTRL + SHIFT + P`), select "Cursor Settings" > "MCP".
2. **Add Server**:
    - Click "+ Add new MCP server".
    - **Name**: `aashari/mcp-server-atlassian-confluence`.
    - **Type**: `command`.
    - **Command**:
        - Global config: `npx -y @aashari/mcp-server-atlassian-confluence`.
        - Direct: `DEBUG=true ATLASSIAN_SITE_NAME=your-instance ATLASSIAN_USER_EMAIL=your-email@example.com ATLASSIAN_API_TOKEN=your_token npx -y @aashari/mcp-server-atlassian-confluence`.
    - Click "Add".
3. **Verify**: Check for a green indicator and Confluence tools listed.
4. **Test**: In Agent mode, ask: "Find info about project X in Confluence" or "Get the 'Onboarding' page content."

### Using as a CLI Tool

Run without installation:

```bash
# Help
npx -y @aashari/mcp-server-atlassian-confluence -- --help
# Search using CQL
npx -y @aashari/mcp-server-atlassian-confluence -- search "type=page space=DOCS"
# Get a page by ID
npx -y @aashari/mcp-server-atlassian-confluence -- get-page 123456789
# List spaces
npx -y @aashari/mcp-server-atlassian-confluence -- list-spaces
```

Or install globally:

```bash
npm install -g @aashari/mcp-server-atlassian-confluence
```

Then run:

```bash
# Help
mcp-confluence --help
# Search using CQL
mcp-confluence search "type=page space=DOCS"
# Get a page by ID
mcp-confluence get-page 123456789
# List pages with optional filtering
mcp-confluence list-pages --space-id 123456789 --limit 10
# List all spaces
mcp-confluence list-spaces
# Get a space by ID
mcp-confluence get-space 123456789
```

Use the global config file or prefix with environment variables:

```bash
DEBUG=true ATLASSIAN_SITE_NAME=your-instance ATLASSIAN_USER_EMAIL=your-email@example.com ATLASSIAN_API_TOKEN=your_token mcp-confluence search "type=page space=DOCS"
```

## Developer Guide

### Extending the Project

To add custom tools or resources:

1. **Services**: Add API/data logic in `src/services`.
2. **Controllers**: Implement business logic in `src/controllers`.
3. **Tools**: Define new tools in `src/tools`.
4. **Resources**: Add data sources in `src/resources`.
5. **Register**: Update `src/index.ts` with your tools/resources.

### Development Tools

```bash
# Run with live reload
npm run dev
# Test
npm run test
# Test coverage
npm run test:coverage
# Lint
npm run lint
# Format
npm run format
```

### MCP Inspector

Debug visually:

```bash
# Start inspector
npm run inspect
# With debug logs
npm run inspect:debug
```

When you run the inspector:

1. The Inspector starts your MCP server.
2. It launches a web UI (typically at `http://localhost:5173`).
3. Use the UI to test Confluence tools, view requests/responses, and check errors.

## License

[ISC](https://opensource.org/licenses/ISC)
