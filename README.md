# Boilerplate MCP Server

## About

This project is a customizable Model Context Protocol (MCP) server written in TypeScript, designed to extend AI assistants like Claude or Cursor with external tools and data sources. MCP is an open-source protocol by Anthropic for connecting AI systems to external capabilities securely and efficiently. For more details on MCP, see [https://modelcontextprotocol.io/docs/](https://modelcontextprotocol.io/docs/). This boilerplate provides a starting point with an IP lookup tool, CLI support, and a flexible architecture for adding your own features.

## Project Features

- **MCP Server**: Exposes tools and resources to AI clients (e.g., Claude Desktop, Cursor AI) via STDIO or HTTP.
- **IP Address Lookup**: Includes an example tool (`get-ip-details`) for fetching IP details, configurable with [ipapi.co](https://ipapi.co).
- **CLI Support**: Run tools directly from the command line without an AI client.
- **Flexible Configuration**: Supports direct environment variables for quick use or a global config file at `$HOME/.mcp/configs.json` for managing multiple servers.
- **Development Tools**: Built-in MCP Inspector for debugging, plus testing and linting utilities.

## User Guide

### Configuration Options

- **DEBUG**: Set to `true` for detailed logging (default: `false`).
- **IPAPI_API_TOKEN**: Optional API token for [ipapi.co](https://ipapi.co) to enhance IP lookups (basic lookups work without it).

#### Method 1: Environment Variables

Pass configs directly when running:

```bash
DEBUG=true IPAPI_API_TOKEN=your_token npx -y @aashari/boilerplate-mcp-server
```

#### Method 2: Global Config File (Recommended)

Create `$HOME/.mcp/configs.json`:

```json
{
	"@aashari/boilerplate-mcp-server": {
		"environments": {
			"DEBUG": "true",
			"IPAPI_API_TOKEN": "your_token"
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
    - Click "Edit Config" to open `claude_desktop_config.json` (e.g., `~/Library/Application Support/Claude` on macOS or>%APPDATA%\Claude` on Windows).
3. **Add Server**:
    - Use the global config file (recommended):
        ```json
        {
        	"mcpServers": {
        		"aashari/boilerplate-mcp-server": {
        			"command": "npx",
        			"args": ["-y", "@aashari/boilerplate-mcp-server"]
        		}
        	}
        }
        ```
    - Or configure directly:
        ```json
        {
        	"mcpServers": {
        		"aashari/boilerplate-mcp-server": {
        			"command": "npx",
        			"args": [
        				"-y",
        				"DEBUG=true",
        				"IPAPI_API_TOKEN=your_token",
        				"@aashari/boilerplate-mcp-server"
        			]
        		}
        	}
        }
        ```
4. **Restart**: Close and reopen Claude Desktop.
5. **Test**: Click the hammer icon, verify `get-ip-details` is listed, then ask: "What's my public IP?"

### Using with Cursor AI

1. **Open Settings**:
    - Launch Cursor, press `CMD + SHIFT + P` (or `CTRL + SHIFT + P`), select "Cursor Settings" > "MCP".
2. **Add Server**:
    - Click "+ Add new MCP server".
    - **Name**: `aashari/boilerplate-mcp-server`.
    - **Type**: `command`.
    - **Command**:
        - Global config: `npx -y @aashari/boilerplate-mcp-server`.
        - Direct: `DEBUG=true IPAPI_API_TOKEN=your_token npx -y @aashari/boilerplate-mcp-server`.
    - Click "Add".
3. **Verify**: Check for a green indicator and `get_ip_details` tool.
4. **Test**: In Agent mode, ask: "Analyze IP 8.8.8.8."

### Using as a CLI Tool

Run without installation:

```bash
# Help
npx -y @aashari/boilerplate-mcp-server -- --help
# Current IP
npx -y @aashari/boilerplate-mcp-server -- get-ip-details
# Specific IP
npx -y @aashari/boilerplate-mcp-server -- get-ip-details 8.8.8.8
```

Or install globally:

```bash
npm install -g @aashari/boilerplate-mcp-server
```

Then run:

```bash
# Help
mcp-server --help
# Current IP
mcp-server get-ip-details
# Specific IP
mcp-server get-ip-details 8.8.8.8
```

Use the global config file or prefix with environment variables:

```bash
DEBUG=true IPAPI_API_TOKEN=your_token mcp-server get-ip-details
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
3. Use the UI to test tools/resources, view requests/responses, and check errors.

## License

[ISC](https://opensource.org/licenses/ISC)
