#!/usr/bin/env node
const { createServer } = require('net');
const { join } = require('path');
const { exec } = require('child_process');
const axios = require('axios');

// Configuration
const PORT = process.env.PORT || 3000;
const SERVER_URL = `http://localhost:${PORT}`;

// Start the VibeMCP server in the background
console.error('Starting VibeMCP-Lite server...');
let backendProcess;

// Function to start the backend process
function startBackendProcess() {
  try {
    // We use exec instead of spawn to allow the process to run independently
    backendProcess = exec(`node ${join(__dirname, 'index.js')}`, {
      env: { ...process.env, PORT }
    });

    backendProcess.stdout.on('data', (data) => {
      console.error(`VibeMCP-Lite stdout: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
      console.error(`VibeMCP-Lite stderr: ${data}`);
    });

    backendProcess.on('close', (code) => {
      console.error(`VibeMCP-Lite process exited with code ${code}`);
      if (code !== 0) {
        startBackendProcess(); // Restart the process if it crashes
      }
    });
  } catch (error) {
    console.error('Failed to start VibeMCP-Lite backend:', error);
  }
}

// Start the backend
startBackendProcess();

// Wait for the backend to be ready
const waitForBackend = async () => {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      const response = await axios.get(`${SERVER_URL}/api/status`);
      if (response.data.status === 'ok') {
        console.error('VibeMCP-Lite backend is ready');
        return true;
      }
    } catch (error) {
      // Backend not ready yet
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  throw new Error('Failed to connect to VibeMCP-Lite backend');
};

// Create a JSON-RPC MCP server
const server = createServer(async (socket) => {
  console.error('Client connected to MCP server');
  
  // Wait for the backend to be ready
  try {
    await waitForBackend();
  } catch (error) {
    console.error(error.message);
    socket.end(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error: backend not available'
      },
      id: null
    }) + '\r\n');
    return;
  }
  
  let buffer = '';
  
  socket.on('data', async (data) => {
    buffer += data.toString();
    
    // Process each complete message
    let newlineIndex;
    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
      const line = buffer.substring(0, newlineIndex).trim();
      buffer = buffer.substring(newlineIndex + 1);
      
      if (!line) continue;
      
      try {
        const message = JSON.parse(line);
        console.error('Received message:', message);
        
        // Handle JSON-RPC messages
        if (message.jsonrpc === '2.0') {
          if (message.method === 'initialize') {
            // Handle initialize request
            socket.write(JSON.stringify({
              jsonrpc: '2.0',
              result: {
                serverInfo: {
                  name: 'vibemcp-lite',
                  version: '0.1.0'
                },
                capabilities: {},
                protocolVersion: '2024-11-05'
              },
              id: message.id
            }) + '\r\n');
          } else if (message.method === 'exec') {
            // Handle exec request (pass to backend)
            try {
              const command = message.params.command;
              console.error(`Executing command: ${command}`);
              
              const response = await axios.post(`${SERVER_URL}/api/mcp/execute`, {
                command
              });
              
              socket.write(JSON.stringify({
                jsonrpc: '2.0',
                result: {
                  stdout: JSON.stringify(response.data),
                  stderr: ''
                },
                id: message.id
              }) + '\r\n');
            } catch (error) {
              console.error('Error executing command:', error);
              socket.write(JSON.stringify({
                jsonrpc: '2.0',
                error: {
                  code: -32603,
                  message: `Command execution failed: ${error.message}`
                },
                id: message.id
              }) + '\r\n');
            }
          } else if (message.method === 'shutdown') {
            // Handle shutdown request
            socket.write(JSON.stringify({
              jsonrpc: '2.0',
              result: null,
              id: message.id
            }) + '\r\n');
          } else {
            // Unknown method
            socket.write(JSON.stringify({
              jsonrpc: '2.0',
              error: {
                code: -32601,
                message: `Method not found: ${message.method}`
              },
              id: message.id
            }) + '\r\n');
          }
        }
      } catch (error) {
        console.error('Error processing message:', error);
        socket.write(JSON.stringify({
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: 'Parse error'
          },
          id: null
        }) + '\r\n');
      }
    }
  });
  
  socket.on('end', () => {
    console.error('Client disconnected');
  });
  
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Listen on stdin/stdout for JSON-RPC messages
process.stdin.pipe(server.listen()).pipe(process.stdout);

// Handle process termination
process.on('exit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});

process.on('SIGINT', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  process.exit(0);
});
