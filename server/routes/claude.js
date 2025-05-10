const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration Claude
let claudeConfig = {
  apiKey: null,
  webhookUrl: null,
  connected: false,
  lastResponse: null,
  status: 'disconnected'
};

// Endpoint pour configurer Claude
router.post('/setup', async (req, res) => {
  try {
    const { apiKey } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    // Enregistrer la clé API
    claudeConfig.apiKey = apiKey;
    claudeConfig.webhookUrl = process.env.CLAUDE_WEBHOOK_URL || 'http://localhost:5678/webhook';
    claudeConfig.connected = true;
    claudeConfig.status = 'connected';

    res.json({
      success: true,
      message: 'Claude configuration updated successfully',
      webhookUrl: claudeConfig.webhookUrl
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recevoir un message de Claude Desktop et exécuter les commandes MCP
router.post('/webhook', async (req, res) => {
  try {
    const { message, type } = req.body;

    // Vérifier si c'est un message valide
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Enregistrer la demande pour debugging
    console.log('Received webhook from Claude Desktop:', req.body);

    let response;

    // Traiter les différents types de messages
    if (type === 'command') {
      // Exécuter directement la commande MCP
      response = await executeMcpCommand(message);
    } else {
      // Extraire et exécuter les commandes MCP du message de Claude
      response = await extractAndExecuteCommands(message);
    }

    res.json({
      success: true,
      response
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Envoyer un message à Claude
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Vérifier si Claude est configuré
    if (!claudeConfig.apiKey) {
      return res.status(400).json({ error: 'Claude API not configured' });
    }

    // Détecter si c'est une commande MCP directe (format: ```mcp commande args```)
    const mcpCommandMatch = message.match(/```mcp\s+(.*?)```/s);
    if (mcpCommandMatch) {
      const command = mcpCommandMatch[1].trim();
      const result = await executeMcpCommand(command);

      return res.json({
        type: 'mcp_command',
        result
      });
    }

    // Autrement, envoyer le message à l'API Claude
    // Note: Ceci est une simulation car la vraie API Claude nécessiterait une intégration spécifique
    // que nous remplaçons ici par un simple retour
    // Dans une version réelle, cette partie appellerait l'API Claude

    const claudeResponse = {
      message: `J'ai reçu votre message: "${message}". Comment puis-je vous aider avec votre projet?`,
      timestamp: new Date().toISOString()
    };

    claudeConfig.lastResponse = claudeResponse;

    res.json({
      type: 'claude_response',
      message: claudeResponse.message
    });
  } catch (error) {
    res.status(500).json({
      type: 'error',
      message: error.message
    });
  }
});

// Extraire les commandes MCP d'un texte
router.post('/parse-commands', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Rechercher les blocs de code MCP
    const mcpCodeBlockRegex = /```mcp\s+(.*?)```/gs;
    const matches = [...text.matchAll(mcpCodeBlockRegex)];

    const commands = matches.map(match => match[1].trim());

    res.json({
      success: true,
      commands,
      count: commands.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Exécuter les commandes MCP extraites d'un texte
router.post('/execute-commands', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await extractAndExecuteCommands(text);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fonctions utilitaires

// Extraire et exécuter les commandes MCP d'un texte
async function extractAndExecuteCommands(text) {
  // Rechercher les blocs de code MCP
  const mcpCodeBlockRegex = /```mcp\s+(.*?)```/gs;
  const matches = [...text.matchAll(mcpCodeBlockRegex)];

  if (matches.length === 0) {
    return {
      executed: 0,
      message: 'No MCP commands found in the text'
    };
  }

  const commands = matches.map(match => match[1].trim());
  const results = [];

  // Exécuter chaque commande
  for (const command of commands) {
    try {
      const result = await executeMcpCommand(command);
      results.push({
        command,
        success: true,
        result
      });
    } catch (error) {
      results.push({
        command,
        success: false,
        error: error.message
      });
    }
  }

  return {
    executed: results.length,
    successful: results.filter(r => r.success).length,
    results
  };
}

// Exécuter une commande MCP
async function executeMcpCommand(command) {
  try {
    // Appeler l'API MCP pour exécuter la commande
    const response = await axios.post('http://localhost:3000/api/mcp/execute', {
      command
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'MCP command execution failed');
    }
    throw error;
  }
}

module.exports = router;
