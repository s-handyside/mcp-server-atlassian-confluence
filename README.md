# Boilerplate MCP Server

[![smithery badge](https://smithery.ai/badge/@aashari/boilerplate-mcp-server)](https://smithery.ai/server/@aashari/boilerplate-mcp-server)

## About MCP

The Model Context Protocol (MCP) is an open standard developed by Anthropic to simplify how AI systems connect to external data sources and tools. This boilerplate implementation provides a starting point for creating MCP servers that can be used with Claude Desktop and other MCP-compatible AI systems.

## Overview

A TypeScript-based Model Context Protocol (MCP) server boilerplate for building AI-connected tools. Features IP lookup tools, CLI support, MCP Inspector integration, and extensible architecture for connecting Claude/Anthropic AI systems to external data sources.

## Configuration Options

Before setting up with any integration method, you should understand the available configuration options:

### Available Configuration Options

- **DEBUG**: Set to `true` to enable debug logging.
- **IPAPI_API_TOKEN**: API token for the IP API service (if required).

### Configuration Methods

You can configure the server in two ways:

#### Option 1: Direct Configuration (Environment Variables)

Pass configuration directly as environment variables before the start command:

```bash
DEBUG=true IPAPI_API_TOKEN=your_token npx -y @aashari/boilerplate-mcp-server
```

#### Option 2: Global Configuration File (Recommended)

Create a global configuration file at `$HOME/.mcp/configs.json`:

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

This approach keeps your configuration in one secure location and simplifies your AI assistant setup.

## Setting Up with Claude Desktop

To use this MCP server with Claude Desktop:

1. **Open Claude Desktop Settings**:

    - Launch Claude Desktop
    - Click on the settings icon (gear) in the top-right corner

2. **Edit MCP Configuration**:

    - Click on "Edit Config" button
    - This will open File Explorer/Finder with the `claude_desktop_config.json` file

3. **Update Configuration File**:

    - Add configuration using one of the methods below
    - Save the file

    #### Method 1: Using Global Configuration File (Recommended)

    First, create the global config file as described in the "Configuration Options" section above, then use this simplified configuration:

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

    #### Method 2: Direct Configuration in Claude Desktop

    Pass configuration directly in the Claude Desktop config:

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

4. **Restart Claude Desktop**:

    - Close and reopen Claude Desktop to apply the changes

5. **Verify Tool Availability**:

    - On the Claude home page, look for the hammer icon on the right side
    - Click it to see available tools
    - Ensure the `get-ip-details` tool is listed

6. **Test the Tool**:
    - Try asking Claude: "give me my public IP" or "analyze this IP: 8.8.8.8"
    - Claude will use the MCP tool to fetch and display the requested information

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

    - **Name**: Enter `aashari/boilerplate-mcp-server`
    - **Type**: Select `command` from the dropdown
    - **Command**: Choose one of the following configuration methods:

    #### Method 1: Using Global Configuration File (Recommended)

    First, create the global config file at `$HOME/.mcp/configs.json` as described in the "Configuration Options" section, then use this command:

    ```
    npx -y @aashari/boilerplate-mcp-server
    ```

    #### Method 2: Direct Configuration with Environment Variables

    Pass configuration directly in the command:

    ```
    DEBUG=true IPAPI_API_TOKEN=your_token npx -y @aashari/boilerplate-mcp-server
    ```

    - Click "Add"

4. **Verify Server Configuration**:

    - The server should now be listed with a green indicator
    - You should see the `get_ip_details` tool listed under the server

5. **Test the Tool**:
    - In the chat sidebar, ensure Agent mode is active
    - Try asking: "give me my public IP" or "analyze this IP: 8.8.8.8"
    - Cursor AI will use the MCP tool to fetch and display the requested information

## Using as a CLI Tool

This package can also be used as a command-line tool:

### Global Installation

You can install this package globally to use as a CLI tool:

```bash
npm install -g @aashari/boilerplate-mcp-server
```

After global installation, you can run the CLI commands directly:

```bash
# Get help
mcp-server --help

# Get current IP details
mcp-server get-ip-details

# Get details for a specific IP
mcp-server get-ip-details 8.8.8.8
```

### CLI Configuration

The CLI tool uses the same configuration options as the MCP server:

#### Method 1: Using Global Configuration File (Recommended)

Create a global configuration file at `$HOME/.mcp/configs.json` as described above.

#### Method 2: Direct Environment Variables

Run commands with environment variables:

```bash
DEBUG=true IPAPI_API_TOKEN=your_token mcp-server get-ip-details
```

## Core Features

- **STDIO MCP Server**: Designed for AI clients like Claude Desktop, providing tools and resources via the Model Context Protocol.
- **CLI Support**: Human-friendly command-line interface for the same functionality, making it easy to test and use directly.
- **IP Address Lookup**: Get details about any IP address or your current device's IP.
- **Flexible Configuration**: Support for environment variables, .env files, and global config files.
- **Testing & Development Tools**: Built-in inspection, testing, and development utilities.

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
4. Create resource implementations in `src/resources`
5. Register your new tools and resources in `src/index.ts`

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

# Run the server with live reload during development
npm run dev

# Use the MCP Inspector to visually test your server
npm run inspect

# Use the MCP Inspector with debug mode enabled
npm run inspect:debug
```

## License

[ISC](https://opensource.org/licenses/ISC)
