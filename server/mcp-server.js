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

// Function to handle client connections
const handleConnection = async (socket) => {
  console.error('Client connected to MCP server');
  
  // Wait for the backend to be ready
  try {
    await waitForBackend();
  } catch (error) {
    console.error(error.message);
    socket.write(JSON.stringify({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error: backend not available'
      },
      id: null
    }) + '\r\n');
    socket.end();
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
};

// Create a MCP server using stdin/stdout
process.stdin.setEncoding('utf8');
let stdinBuffer = '';

process.stdin.on('data', async (chunk) => {
  stdinBuffer += chunk;
  
  // Process each complete message
  let newlineIndex;
  while ((newlineIndex = stdinBuffer.indexOf('\n')) !== -1) {
    const line = stdinBuffer.substring(0, newlineIndex).trim();
    stdinBuffer = stdinBuffer.substring(newlineIndex + 1);
    
    if (!line) continue;
    
    try {
      const message = JSON.parse(line);
      console.error('Received message from stdin:', message);
      
      // Handle JSON-RPC messages
      if (message.jsonrpc === '2.0') {
        let response;
        
        if (message.method === 'initialize') {
          // Handle initialize request
          response = {
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
          };
        } else if (message.method === 'exec') {
          // Handle exec request (pass to backend)
          try {
            // Wait for the backend to be ready
            try {
              await waitForBackend();
            } catch (error) {
              throw new Error('Backend not available: ' + error.message);
            }
            
            const command = message.params.command;
            console.error(`Executing command: ${command}`);
            
            const apiResponse = await axios.post(`${SERVER_URL}/api/mcp/execute`, {
              command
            });
            
            response = {
              jsonrpc: '2.0',
              result: {
                stdout: JSON.stringify(apiResponse.data),
                stderr: ''
              },
              id: message.id
            };
          } catch (error) {
            console.error('Error executing command:', error);
            response = {
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: `Command execution failed: ${error.message}`
              },
              id: message.id
            };
          }
        } else if (message.method === 'shutdown') {
          // Handle shutdown request
          response = {
            jsonrpc: '2.0',
            result: null,
            id: message.id
          };
          
          // Give the response time to be sent before shutting down
          process.stdout.write(JSON.stringify(response) + '\r\n');
          setTimeout(() => {
            if (backendProcess) {
              backendProcess.kill();
            }
            process.exit(0);
          }, 100);
          continue;
        } else {
          // Unknown method
          response = {
            jsonrpc: '2.0',
            error: {
              code: -32601,
              message: `Method not found: ${message.method}`
            },
            id: message.id
          };
        }
        
        process.stdout.write(JSON.stringify(response) + '\r\n');
      }
    } catch (error) {
      console.error('Error processing message from stdin:', error);
      process.stdout.write(JSON.stringify({
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

// Also create a TCP server for testing
const tcpServer = createServer(handleConnection);
tcpServer.listen(0, () => {
  const address = tcpServer.address();
  console.error(`TCP server listening on ${address.port}`);
});

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
