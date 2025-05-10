const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration Claude
let claudeConfig = {
  webhookUrl: null,
  connected: false,
  lastResponse: null,
  status: 'disconnected'
};

// Initialiser la configuration
const initConfig = () => {
  claudeConfig.webhookUrl = process.env.CLAUDE_WEBHOOK_URL || 'http://localhost:5678/webhook';
  claudeConfig.connected = !!claudeConfig.webhookUrl;
  claudeConfig.status = claudeConfig.connected ? 'connected' : 'disconnected';
  
  return claudeConfig.connected;
};

// Essayer d'initialiser la configuration au démarrage
initConfig();

// Endpoint pour configurer le webhook Claude
router.post('/setup', async (req, res) => {
  try {
    const { webhookUrl } = req.body;

    // Enregistrer l'URL du webhook
    if (webhookUrl) {
      claudeConfig.webhookUrl = webhookUrl;
    } else {
      // Utiliser l'URL par défaut ou depuis l'environnement
      claudeConfig.webhookUrl = process.env.CLAUDE_WEBHOOK_URL || 'http://localhost:5678/webhook';
    }
    
    claudeConfig.connected = true;
    claudeConfig.status = 'connected';

    res.json({
      success: true,
      message: 'Claude webhook configuration updated successfully',
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

// Envoyer un message à Claude via le webhook
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Vérifier si Claude est configuré
    if (!claudeConfig.connected) {
      return res.status(400).json({ error: 'Claude webhook not configured. Please setup the webhook first.' });
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

    // Autrement, retourner une réponse standard
    // Note: Dans une version intégrée à Claude, ce message pourrait être traité
    // différemment ou envoyé au webhook de Claude Desktop
    const simpleResponse = {
      message: `Commande non reconnue. Utilisez le format \`\`\`mcp commande args\`\`\` pour exécuter des commandes MCP.`,
      timestamp: new Date().toISOString()
    };

    claudeConfig.lastResponse = simpleResponse;

    res.json({
      type: 'claude_response',
      message: simpleResponse.message
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

// Obtenir l'état de la configuration Claude
router.get('/status', (req, res) => {
  res.json({
    status: claudeConfig.status,
    webhookUrl: claudeConfig.webhookUrl,
    connected: claudeConfig.connected
  });
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
