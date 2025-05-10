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

// Tool definitions for the MCP protocol
const tools = [
  {
    id: "create-project",
    name: "Create Project",
    description: "Create a new project",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Project name",
        required: true
      },
      {
        name: "description",
        type: "string",
        description: "Project description",
        required: false
      }
    ]
  },
  {
    id: "list-projects",
    name: "List Projects",
    description: "List all available projects",
    parameters: []
  },
  {
    id: "switch-project",
    name: "Switch Project",
    description: "Switch to a different project",
    parameters: [
      {
        name: "name",
        type: "string",
        description: "Project name",
        required: true
      }
    ]
  },
  {
    id: "edit",
    name: "Edit File",
    description: "Edit specific lines in a file",
    parameters: [
      {
        name: "file",
        type: "string",
        description: "File path",
        required: true
      },
      {
        name: "range",
        type: "string",
        description: "Line range (e.g., '10-20')",
        required: true
      }
    ]
  },
  {
    id: "exec",
    name: "Execute Command",
    description: "Execute a shell command",
    parameters: [
      {
        name: "command",
        type: "string", 
        description: "Shell command to execute",
        required: true
      }
    ]
  },
  {
    id: "git-commit",
    name: "Git Commit",
    description: "Commit changes to git",
    parameters: [
      {
        name: "message",
        type: "string",
        description: "Commit message",
        required: true
      }
    ]
  }
];

// Helper function to send a valid JSON-RPC response
function sendJsonRpcResponse(output, message) {
  // Ensure we have a valid jsonrpc and id field
  const response = {
    jsonrpc: "2.0",
    id: message.id || null, // Include the id from the request or null if not present
    result: message.result,
    // Include error only if present
    ...(message.error ? { error: message.error } : {})
  };

  // Remove result if error exists
  if (response.error) {
    delete response.result;
  }

  // Remove undefined fields
  Object.keys(response).forEach(key => {
    if (response[key] === undefined) {
      delete response[key];
    }
  });

  output.write(JSON.stringify(response) + '\r\n');
}

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
        let responseObj = {
          jsonrpc: '2.0',
          id: message.id
        };
        
        if (message.method === 'initialize') {
          // Handle initialize request
          responseObj.result = {
            serverInfo: {
              name: 'vibemcp-lite',
              version: '0.1.0'
            },
            capabilities: {},
            protocolVersion: '2024-11-05'
          };
        } else if (message.method === 'tools/list') {
          // Handle tools listing request
          responseObj.result = {
            tools: tools
          };
        } else if (message.method === 'resources/list') {
          // Handle resources listing request
          responseObj.result = {
            resources: []
          };
        } else if (message.method === 'prompts/list') {
          // Handle prompts listing request
          responseObj.result = {
            prompts: []
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
            
            responseObj.result = {
              stdout: JSON.stringify(apiResponse.data),
              stderr: ''
            };
          } catch (error) {
            console.error('Error executing command:', error);
            responseObj.error = {
              code: -32603,
              message: `Command execution failed: ${error.message}`
            };
            delete responseObj.result;
          }
        } else if (message.method === 'shutdown') {
          // Handle shutdown request
          responseObj.result = null;
          
          // Give the response time to be sent before shutting down
          sendJsonRpcResponse(process.stdout, responseObj);
          setTimeout(() => {
            if (backendProcess) {
              backendProcess.kill();
            }
            process.exit(0);
          }, 100);
          continue;
        } else {
          // Unknown method
          responseObj.error = {
            code: -32601,
            message: `Method not found: ${message.method}`
          };
          delete responseObj.result;
        }
        
        sendJsonRpcResponse(process.stdout, responseObj);
      }
    } catch (error) {
      console.error('Error processing message from stdin:', error);
      
      const errorResponse = {
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32700,
          message: 'Parse error'
        }
      };
      
      sendJsonRpcResponse(process.stdout, errorResponse);
    }
  }
});

// Also create a TCP server for testing
const tcpServer = createServer(async (socket) => {
  console.error('Client connected to TCP server');
  
  // Wait for the backend to be ready
  try {
    await waitForBackend();
  } catch (error) {
    console.error(error.message);
    sendJsonRpcResponse(socket, {
      id: null,
      error: {
        code: -32603,
        message: 'Internal error: backend not available'
      }
    });
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
        console.error('Received message from TCP:', message);
        
        // Handle JSON-RPC messages
        if (message.jsonrpc === '2.0') {
          let responseObj = {
            jsonrpc: '2.0',
            id: message.id
          };
          
          if (message.method === 'initialize') {
            // Handle initialize request
            responseObj.result = {
              serverInfo: {
                name: 'vibemcp-lite',
                version: '0.1.0'
              },
              capabilities: {},
              protocolVersion: '2024-11-05'
            };
          } else if (message.method === 'tools/list') {
            // Handle tools listing request
            responseObj.result = {
              tools: tools
            };
          } else if (message.method === 'resources/list') {
            // Handle resources listing request
            responseObj.result = {
              resources: []
            };
          } else if (message.method === 'prompts/list') {
            // Handle prompts listing request
            responseObj.result = {
              prompts: []
            };
          } else if (message.method === 'exec') {
            // Handle exec request (pass to backend)
            try {
              const command = message.params.command;
              console.error(`Executing command: ${command}`);
              
              const apiResponse = await axios.post(`${SERVER_URL}/api/mcp/execute`, {
                command
              });
              
              responseObj.result = {
                stdout: JSON.stringify(apiResponse.data),
                stderr: ''
              };
            } catch (error) {
              console.error('Error executing command:', error);
              responseObj.error = {
                code: -32603,
                message: `Command execution failed: ${error.message}`
              };
              delete responseObj.result;
            }
          } else if (message.method === 'shutdown') {
            // Handle shutdown request
            responseObj.result = null;
          } else {
            // Unknown method
            responseObj.error = {
              code: -32601,
              message: `Method not found: ${message.method}`
            };
            delete responseObj.result;
          }
          
          sendJsonRpcResponse(socket, responseObj);
        }
      } catch (error) {
        console.error('Error processing message from TCP:', error);
        
        const errorResponse = {
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: 'Parse error'
          }
        };
        
        sendJsonRpcResponse(socket, errorResponse);
      }
    }
  });
  
  socket.on('end', () => {
    console.error('TCP client disconnected');
  });
  
  socket.on('error', (error) => {
    console.error('TCP socket error:', error);
  });
});

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
