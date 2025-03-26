# Atlassian Confluence MCP Server

This project provides a Model Context Protocol (MCP) server that acts as a bridge between AI assistants (like Anthropic's Claude, Cursor AI, or other MCP-compatible clients) and your Atlassian Confluence instance. It allows AI to securely access and interact with your Confluence spaces and pages in real-time.

## What is MCP and Why Use This Server?

Model Context Protocol (MCP) is an open standard enabling AI models to connect securely to external tools and data sources. This server implements MCP specifically for Confluence.

**Benefits:**

- **Real-time Access:** Your AI assistant can directly access up-to-date Confluence content.
- **Eliminate Copy/Paste:** No need to manually transfer information between Confluence and your AI assistant.
- **Enhanced AI Capabilities:** Enables AI to search, summarize, analyze, and reference your Confluence documentation contextually.
- **Security:** You control access via an API token. The AI interacts through the server, and sensitive operations remain contained.

## Available Tools

This MCP server exposes the following capabilities as standardized "Tools" for AI assistants:

| Tool Name     | Key Parameter(s)    | Description                                              | Example Conversational Use            | AI Tool Call Example (Simplified)       |
| :------------ | :------------------ | :------------------------------------------------------- | :------------------------------------ | :-------------------------------------- |
| `search`      | `cql` (string)      | Search Confluence using CQL (Confluence Query Language). | "Find pages about API documentation"  | `{ cql: "text ~ 'API documentation'" }` |
| `list-spaces` | _None required_     | List available Confluence spaces.                        | "Show me all Confluence spaces"       | `{}`                                    |
| `get-space`   | `spaceKey` (string) | Get detailed information about a specific space.         | "Tell me about the 'DEV' space"       | `{ spaceKey: "DEV" }`                   |
| `list-pages`  | _None required_     | List pages (optionally filter by space, status).         | "Show pages in the Engineering space" | `{ spaceId: ["123456"] }`               |
| `get-page`    | `pageId` (string)   | Get the full content and metadata of a specific page.    | "Show me the 'Getting Started' page"  | `{ pageId: "789012" }`                  |

## Interface Philosophy: Minimal Interface, Maximal Detail

This server is designed to be simple for both humans (via CLI) and AI (via MCP Tools) to use, while providing rich information:

1.  **Simple Commands/Tools:** Interfaces require only the essential identifiers or filters (like `pageId`, `spaceKey`, `cql`).
2.  **Comprehensive Results by Default:** Operations that retrieve a specific item (`get-page`, `get-space`) automatically fetch and return all relevant details (content, labels, properties, links, etc.) without needing extra "include" flags.

This philosophy ensures you get the full picture without complex commands, letting the AI focus on using the information.

## Prerequisites

- **Node.js and npm:** Ensure you have Node.js (which includes npm) installed. Download from [nodejs.org](https://nodejs.org/).
- **Atlassian Account:** An active Atlassian account with access to the Confluence instance you want to connect to.

## Quick Start Guide

Follow these steps to connect your AI assistant to Confluence:

### Step 1: Get Your Atlassian API Token

**Important:** Treat your API token like a password. Do not share it or commit it to version control.

1.  Go to your Atlassian API token management page:
    [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2.  Click **Create API token**.
3.  Give it a descriptive **Label** (e.g., `mcp-confluence-access`).
4.  Click **Create**.
5.  **Immediately copy the generated API token.** You won't be able to see it again. Store it securely (e.g., in a password manager).

### Step 2: Configure the Server Credentials

Choose **one** of the following methods:

#### Method A: Global MCP Config File (Recommended for Persistent Use)

This is the preferred method as it keeps credentials separate from your AI client configuration.

1.  **Create the directory** (if it doesn't exist):
    - macOS/Linux: `mkdir -p ~/.mcp`
    - Windows: Create a folder named `.mcp` in your user profile directory (e.g., `C:\Users\<YourUsername>\.mcp`)
2.  **Create the config file:** Inside the `.mcp` directory, create a file named `configs.json`.
3.  **Add the configuration:** Paste the following JSON structure into `configs.json`, replacing the placeholder values:

    ```json
    {
    	"@aashari/mcp-server-atlassian-confluence": {
    		"environments": {
    			"ATLASSIAN_SITE_NAME": "<YOUR_SITE_NAME>",
    			"ATLASSIAN_USER_EMAIL": "<YOUR_ATLASSIAN_EMAIL>",
    			"ATLASSIAN_API_TOKEN": "<YOUR_COPIED_API_TOKEN>"
    		}
    	}
    	// You can add configurations for other @aashari MCP servers here too
    }
    ```

    - `<YOUR_SITE_NAME>`: Your Confluence site name (e.g., if your URL is `mycompany.atlassian.net`, enter `mycompany`).
    - `<YOUR_ATLASSIAN_EMAIL>`: The email address associated with your Atlassian account.
    - `<YOUR_COPIED_API_TOKEN>`: The API token you generated in Step 1.

#### Method B: Environment Variables (Alternative / Temporary)

You can set environment variables directly when running the server. This is less convenient for regular use but useful for testing.

```bash
# Example for running the server directly (adjust for client config)
ATLASSIAN_SITE_NAME=<YOUR_SITE_NAME> \
ATLASSIAN_USER_EMAIL=<YOUR_ATLASSIAN_EMAIL> \
ATLASSIAN_API_TOKEN=<YOUR_COPIED_API_TOKEN> \
npx -y @aashari/mcp-server-atlassian-confluence
```

### Step 3: Connect Your AI Assistant

Configure your MCP client (Claude Desktop, Cursor, etc.) to run this server.

#### Option 1: Claude Desktop

1.  Open Claude Desktop settings (gear icon).
2.  Click **Edit Config**.
3.  Add or merge the following into the `mcpServers` section:

    ```json
    {
    	"mcpServers": {
    		"aashari/mcp-server-atlassian-confluence": {
    			"command": "npx",
    			"args": ["-y", "@aashari/mcp-server-atlassian-confluence"]
    		}
    		// Add other servers here if needed
    	}
    }
    ```

4.  Save the configuration file.
5.  **Restart Claude Desktop.**
6.  Verify the connection: Click the "Tools" (hammer) icon. You should see the Confluence tools listed (e.g., `search`, `list-spaces`).

#### Option 2: Cursor AI

1.  Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`).
2.  Search for and select **Cursor Settings > MCP**.
3.  Click **+ Add new MCP server**.
4.  Fill in the details:
    - **Name**: `aashari/mcp-server-atlassian-confluence` (or another name you prefer)
    - **Type**: `command`
    - **Command**: `npx -y @aashari/mcp-server-atlassian-confluence`
5.  Click **Add**.
6.  Wait for the indicator next to the server name to turn green, confirming it's running and connected.

### Step 4: Start Using It!

Now you can ask your AI assistant questions related to your Confluence instance:

- "List the Confluence spaces."
- "Search Confluence using CQL: `label = meeting-notes AND created > -7d`"
- "Get the content of Confluence page ID 12345678."
- "Summarize the 'API Guidelines' page in the DEV space." (You might need to use `search` or `list-pages` first to find the page ID).

## Using as a Command-Line Tool (CLI)

You can also use this package directly from your terminal for quick checks or scripting.

#### Method 1: `npx` (No Installation Needed)

Run commands directly using `npx`:

```bash
# Ensure credentials are set via ~/.mcp/configs.json or environment variables first!
npx -y @aashari/mcp-server-atlassian-confluence list-spaces
npx -y @aashari/mcp-server-atlassian-confluence get-page --page 123456
npx -y @aashari/mcp-server-atlassian-confluence search --cql "type=page AND text~API" --limit 10
```

#### Method 2: Global Installation (for Frequent Use)

1.  Install globally: `npm install -g @aashari/mcp-server-atlassian-confluence`
2.  Run commands using the `mcp-confluence` alias:

```bash
# Ensure credentials are set via ~/.mcp/configs.json or environment variables first!
mcp-confluence list-spaces --limit 5
mcp-confluence get-space --space DEV
mcp-confluence list-pages --space-id 12345 --status archived
mcp-confluence --help # See all commands
mcp-confluence get-page --help # Help for a specific command
```

## Troubleshooting

- **Authentication Errors:**
    - Double-check your `ATLASSIAN_SITE_NAME`, `ATLASSIAN_USER_EMAIL`, and `ATLASSIAN_API_TOKEN` in your `~/.mcp/configs.json` or environment variables.
    - Ensure the API token is still valid and hasn't been revoked.
    - Verify your user account has permission to access the Confluence instance and the specific spaces/pages you're querying.
- **Server Not Connecting (in AI Client):**
    - Ensure the command in your AI client configuration (`npx -y @aashari/mcp-server-atlassian-confluence`) is correct.
    * Check if Node.js/npm are correctly installed and in your system's PATH.
    * Try running the `npx` command directly in your terminal to see if it outputs any errors.
- **Resource Not Found (404 Errors):**
    - Verify the `pageId` or `spaceKey` you are using is correct.
    - Ensure you have permissions to view the specific page or space.
- **Enable Debug Logs:** Set the `DEBUG` environment variable to `true` for more detailed logs. Add `"DEBUG": "true"` inside the `environments` block in `configs.json` or run like `DEBUG=true npx ...`.

## For Developers: Contributing

Contributions are welcome! Please follow the established architecture and guidelines.

### Project Architecture

This MCP server adheres to a layered architecture promoting separation of concerns:

1.  **`src/cli`**: Defines the command-line interface using `commander`. Minimal logic, mainly argument parsing and calling controllers.
2.  **`src/tools`**: Defines the MCP tool interface for AI clients using `@modelcontextprotocol/sdk` and `zod` for schemas. Minimal logic, maps arguments and calls controllers.
3.  **`src/controllers`**: Contains the core application logic. Orchestrates calls to services, uses formatters, handles pagination, and ensures consistent responses. Implements the "maximal detail" principle for 'get' operations.
4.  **`src/services`**: Acts as an adapter to the specific vendor (Atlassian Confluence) API. Uses `transport.util` for actual HTTP calls.
5.  **`src/formatters`**: Responsible for converting data into user-friendly Markdown output, heavily utilizing `formatter.util`.
6.  **`src/utils`**: Holds shared, reusable utilities (config, logging, errors, formatting, transport, pagination, defaults, ADF conversion).
7.  **`src/types`**: Defines shared internal TypeScript types (`ControllerResponse`, etc.).

### Setting Up Development

1.  Clone the repository: `git clone <repository-url>`
2.  Navigate to the project directory: `cd mcp-server-atlassian-confluence`
3.  Install dependencies: `npm install`
4.  Run the server in development mode (uses `ts-node` and watches for changes): `npm run dev:server`
5.  Run CLI commands during development: `npm run dev:cli -- <command> [options]` (e.g., `npm run dev:cli -- list-spaces`)

### Key Development Scripts

- `npm run dev:server`: Start the MCP server via stdio transport with hot-reloading.
- `npm run dev:cli -- [args]`: Execute CLI commands using `ts-node`.
- `npm run build`: Compile TypeScript to JavaScript in `dist/`.
- `npm test`: Run unit and integration tests using Jest.
- `npm run lint`: Run ESLint to check for code style issues.
- `npm run format`: Format code using Prettier.

### Adding a New Feature (Tool/Command)

1.  **API Research:** Identify the target Confluence API endpoint(s).
2.  **Service Layer:** Add function(s) in `src/services/vendor.atlassian.*.service.ts` using `fetchAtlassian`. Define API types in `src/services/vendor.*.types.ts`.
3.  **Controller Layer:** Add function in `src/controllers/*.controller.ts`. Define internal types (`*Options`, `*Identifier`) in `src/controllers/*.types.ts`. Call the service, ensure maximum detail for 'get' operations, call the formatter, handle pagination (`extractPaginationInfo`), return `ControllerResponse`, and wrap logic in `handleControllerError`.
4.  **Formatter:** Add/update function in `src/controllers/*.formatter.ts` using `formatter.util`.
5.  **Tool Layer:** Define Zod schema in `src/tools/*.types.ts` (minimal args). Define tool in `src/tools/*.tool.ts` using `server.tool()`, including the standard documentation template (see below). Implement handler calling the controller.
6.  **CLI Layer:** Define command in `src/cli/*.cli.ts` using `commander` (options matching tool args). Implement action calling the controller, formatting output, and using `handleCliError`.
7.  **Testing:** Add relevant tests (unit, integration, CLI execution).
8.  **Documentation:** Update this README and ensure tool/CLI descriptions are accurate.

### Standard Tool Documentation Template

Use this template within the description string for `server.tool()`:

```
PURPOSE: [Briefly explain what the tool does and its primary goal.]

WHEN TO USE:
- [Describe the main scenario(s) where this tool is useful.]
- [Mention specific situations or questions it answers.]

WHEN NOT TO USE:
- [Point to alternative tools if they are better suited for certain tasks.]
- [Mention any limitations or anti-patterns.]

RETURNS: [Describe the structure and key information included in the Markdown output. Mention that details are comprehensive by default for 'get' operations.]

EXAMPLES:
- [Provide a simple AI tool call example: { param: "value" }]
- [Provide a more complex example if applicable, e.g., with filters.]

ERRORS:
- [List common error scenarios (e.g., "Not Found", "Permission Denied").]
- [Briefly suggest potential causes or checks (e.g., "Verify the ID/Key", "Check credentials/permissions").]
```

### File Naming Convention

- Utility files in `src/utils/` use `kebab-case`: `config.util.ts`, `error-handler.util.ts`.
- Feature-specific files (CLI, Controller, Formatter, Service, Tool, Types) use the pattern `atlassian.{feature}.{layer}.ts` or `vendor.atlassian.{feature}.{layer}.ts` (for services/service-types), e.g., `atlassian.pages.cli.ts`, `atlassian.pages.controller.ts`, `atlassian.pages.formatter.ts`, `vendor.atlassian.pages.service.ts`, `atlassian.pages.tool.ts`, `atlassian.pages.types.ts`.

## Versioning Note

This project (`@aashari/mcp-server-atlassian-confluence`) follows Semantic Versioning. It is versioned independently from other `@aashari/mcp-server-*` packages (like Jira or Bitbucket). Version differences between these related projects are expected and reflect their individual development cycles.

## License

[ISC](https://opensource.org/licenses/ISC)
