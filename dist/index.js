#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.logger = void 0;
exports.startServer = startServer;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const logger_util_js_1 = require("./utils/logger.util.js");
Object.defineProperty(exports, "logger", { enumerable: true, get: function () { return logger_util_js_1.logger; } });
const config_util_js_1 = require("./utils/config.util.js");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return config_util_js_1.config; } });
const error_util_js_1 = require("./utils/error.util.js");
const index_js_1 = require("./cli/index.js");
const ipaddress_tool_js_1 = __importDefault(require("./tools/ipaddress.tool.js"));
const ipaddress_resource_js_1 = __importDefault(require("./resources/ipaddress.resource.js"));
let serverInstance = null;
let transportInstance = null;
async function startServer(mode = 'stdio') {
    // Load configuration
    config_util_js_1.config.load();
    // Enable debug logging if DEBUG is set to true
    if (config_util_js_1.config.getBoolean('DEBUG')) {
        logger_util_js_1.logger.debug('[src/index.ts] Debug mode enabled');
    }
    // Log the DEBUG value to verify configuration loading
    logger_util_js_1.logger.info(`[src/index.ts] DEBUG value: ${process.env.DEBUG}`);
    logger_util_js_1.logger.info(`[src/index.ts] IPAPI_API_TOKEN value exists: ${Boolean(process.env.IPAPI_API_TOKEN)}`);
    logger_util_js_1.logger.info(`[src/index.ts] Config DEBUG value: ${config_util_js_1.config.get('DEBUG')}`);
    serverInstance = new mcp_js_1.McpServer({
        name: '@aashari/boilerplate-mcp-server',
        version: '1.1.0',
    });
    if (mode === 'stdio') {
        transportInstance = new stdio_js_1.StdioServerTransport();
    }
    else {
        throw (0, error_util_js_1.createUnexpectedError)('SSE mode is not supported yet');
    }
    logger_util_js_1.logger.info(`[src/index.ts] Starting server with ${mode.toUpperCase()} transport...`);
    // register tools
    ipaddress_tool_js_1.default.register(serverInstance);
    // register resources
    ipaddress_resource_js_1.default.register(serverInstance);
    return serverInstance.connect(transportInstance).catch((err) => {
        logger_util_js_1.logger.error(`[src/index.ts] Failed to start server`, err);
        process.exit(1);
    });
}
// Main entry point - this will run when executed directly
async function main() {
    // Load configuration
    config_util_js_1.config.load();
    // Log the DEBUG value to verify configuration loading
    logger_util_js_1.logger.info(`[src/index.ts] DEBUG value: ${process.env.DEBUG}`);
    logger_util_js_1.logger.info(`[src/index.ts] IPAPI_API_TOKEN value exists: ${Boolean(process.env.IPAPI_API_TOKEN)}`);
    logger_util_js_1.logger.info(`[src/index.ts] Config DEBUG value: ${config_util_js_1.config.get('DEBUG')}`);
    // Check if arguments are provided (CLI mode)
    if (process.argv.length > 2) {
        // CLI mode: Pass arguments to CLI runner
        await (0, index_js_1.runCli)(process.argv.slice(2));
    }
    else {
        // MCP Server mode: Start server with default STDIO
        await startServer();
    }
}
// If this file is being executed directly (not imported), run the main function
if (require.main === module) {
    main();
}
__exportStar(require("./utils/error.util.js"), exports);
