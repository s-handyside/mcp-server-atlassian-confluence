# Atlassian Confluence MCP Server

[![smithery badge](https://smithery.ai/badge/@aashari/boilerplate-mcp-server)](https://smithery.ai/server/@aashari/boilerplate-mcp-server)

## About MCP

The Model Context Protocol (MCP) is an open standard developed by Anthropic to simplify how AI systems connect to external data sources and tools. This implementation provides an MCP server for connecting Claude Desktop and other MCP-compatible AI systems to Atlassian Confluence.

## Overview

A TypeScript-based Model Context Protocol (MCP) server for integrating with Atlassian Confluence. This server provides tools for searching and accessing Confluence spaces, pages, and content, allowing Claude/Anthropic AI systems to retrieve information directly from your organization's Confluence knowledge base.

## Setting Up with Claude Desktop

To use this Confluence MCP server with Claude Desktop:

1. **Open Claude Desktop Settings**:

    - Launch Claude Desktop
    - Click on the settings icon (gear) in the top-right corner

2. **Edit MCP Configuration**:

    - Click on "Edit Config" button
    - This will open File Explorer/Finder with the `claude_desktop_config.json` file

3. **Update Configuration File**:

    - Add one of the configuration options from below to the file
    - Save the file

    Example with global configuration file already set up:

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

4. **Restart Claude Desktop**:

    - Close and reopen Claude Desktop to apply the changes

5. **Verify Tool Availability**:

    - On the Claude home page, look for the hammer icon on the right side
    - Click it to see available tools
    - Ensure the Confluence tools are listed

6. **Test the Tool**:
    - Try asking Claude: "search Confluence for information about project X" or "get the contents of the Confluence page with title Y"
    - Claude will use the MCP tool to fetch and display the requested information from your Confluence instance

## Setting Up with Cursor AI

To use this MCP server with Cursor AI:

1. **Open Cursor Settings**:

    - Launch Cursor
    - Press `CMD + SHIFT + P` (or `CTRL + SHIFT + P` on Windows)
    - Type "settings" and select "Cursor Settings"
    - On the sidebar, select "MCP"

2. **Add New MCP Server**:

    - Click "+ Add new MCP server"
    - A configuration form will appear

3. **Configure MCP Server**:

    - **Name**: Enter `aashari/mcp-server-atlassian-confluence`
    - **Type**: Select `command` from the dropdown
    - **Command**: Choose one of the following based on your configuration approach:

    If using global configuration file (recommended):

    ```
    npx -y @aashari/mcp-server-atlassian-confluence
    ```

    If passing configuration directly:

    ```
    DEBUG=true ATLASSIAN_SITE_NAME=your-instance ATLASSIAN_USER_EMAIL=your-email@example.com ATLASSIAN_API_TOKEN=your_token npx -y @aashari/mcp-server-atlassian-confluence
    ```

    - Click "Add"

4. **Verify Server Configuration**:

    - The server should now be listed with a green indicator
    - You should see the Confluence tools listed under the server

5. **Test the Tool**:
    - In the chat sidebar, ensure Agent mode is active
    - Try asking: "search Confluence for information about project X" or "show me the Confluence page with title Y"
    - Cursor AI will use the MCP tool to fetch and display the requested information from your Confluence instance

## Using as a CLI Tool

This package can also be used as a command-line tool:

### Global Installation

You can install this package globally to use as a CLI tool:

```bash
npm install -g @aashari/mcp-server-atlassian-confluence
```

After global installation, you can run the CLI commands directly:

```bash
# Get help
mcp-confluence --help

# Search for content in Confluence using CQL
mcp-confluence search "type=page AND space=DOCS"

# Get a specific page by ID
mcp-confluence get-page 123456789

# List pages with optional filtering
mcp-confluence list-pages --space-id 123456789 --limit 10

# List all spaces
mcp-confluence list-spaces

# Get a specific space by ID
mcp-confluence get-space 123456789
```

## Configuration Options for End Users

Before setting up with Claude Desktop or Cursor AI, you can configure the server. There are two recommended options for end users:

### Option 1: Direct Configuration in Claude/Cursor

Pass your configuration directly in the Claude Desktop config or Cursor AI command:

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
				"ATLASSIAN_API_TOKEN=your_api_token",
				"@aashari/mcp-server-atlassian-confluence"
			]
		}
	}
}
```

### Option 2: Global Configuration File (Recommended)

1. Create a global configuration file at `$HOME/.mcp/configs.json`:

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

2. Then use a simplified configuration in Claude Desktop or Cursor AI:

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

This approach keeps your configuration in one secure location and simplifies your AI assistant setup.

### Available Configuration Options

- **DEBUG**: Set to `true` to enable debug logging.
- **ATLASSIAN_SITE_NAME**: Your Atlassian site name, e.g., 'your-instance' for 'your-instance.atlassian.net' (required)
- **ATLASSIAN_USER_EMAIL**: Your Atlassian account email address (required)
- **ATLASSIAN_API_TOKEN**: API token for Atlassian API access (required)

## Core Features

- **STDIO MCP Server**: Designed for AI clients like Claude Desktop, providing Confluence tools and resources via the Model Context Protocol.
- **CLI Support**: Human-friendly command-line interface for the same functionality, making it easy to test and use directly.
- **Confluence Integration**: Three main modules for complete Confluence access:
    - **Spaces**: List and retrieve detailed information about Confluence spaces.
    - **Pages**: Access and retrieve page content with Markdown conversion for better readability.
    - **Search**: Powerful search capabilities using Confluence Query Language (CQL).
- **Flexible Configuration**: Support for environment variables, .env files, and global config files.
- **Testing & Development Tools**: Built-in inspection, testing, and development utilities.

## Available Tools

### Confluence Spaces

- **list_spaces**: List Confluence spaces with filtering options for type, status, and pagination support.
- **get_space**: Get detailed information about a specific Confluence space by ID.

### Confluence Pages

- **list_pages**: List Confluence pages with filtering options for space, status, sorting, and pagination.
- **get_page**: Get detailed information about a specific Confluence page by ID, including content converted to Markdown.

### Confluence Search

- **search**: Search for content in Confluence using Confluence Query Language (CQL) with pagination support.

## For Developers

### MCP Inspector Usage

This project includes integration with MCP Inspector for easy debugging and testing:

```bash
# Launch the MCP Inspector with your server
npm run inspect

# Launch with debug mode enabled
npm run inspect:debug
```

When you run the inspector:

1. The Inspector will start your MCP server
2. It will launch a web UI (typically at http://localhost:5173)
3. You can use the UI to interact with your server and test its functionality

The inspector provides a visual way to see:

- Your server's tools and resources
- The requests and responses between client and server
- Any errors that occur during communication

## Extending This Project

To add your own tools and resources:

1. Create service files in the `src/services` directory
2. Implement controllers in `src/controllers`
3. Create tool implementations in `src/tools`
4. Register your new tools in `src/index.ts`

## Developer Tools

This project includes several scripts to make development easier:

```bash
# Run tests
npm test

# Check test coverage
npm run test:coverage

# Run linting
npm run lint

# Format code
npm run format

# Build the project
npm run build

# Start the server
npm start

# Run development mode with auto-reload
npm run dev
```

## License

[ISC](https://opensource.org/licenses/ISC)
