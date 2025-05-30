require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

// Routes
const projectsRoutes = require('./routes/projects');
const filesRoutes = require('./routes/files');
const githubRoutes = require('./routes/github');
const mcpRoutes = require('./routes/mcp');
const claudeRoutes = require('./routes/claude');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Créer le dossier des projets s'il n'existe pas
const ensureProjectFolder = async () => {
  try {
    const projectsDir = path.join(__dirname, 'projects');
    await fs.mkdir(projectsDir, { recursive: true });
    console.log('Projects directory initialized');
  } catch (error) {
    console.error('Error creating projects directory:', error);
  }
};

// Routes
app.use('/api/projects', projectsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/claude', claudeRoutes);

// Point d'entrée MCP principal pour l'intégration Claude Desktop
app.post('/mcp', async (req, res) => {
  try {
    // Format attendu par Claude Desktop
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    console.log(`MCP command received: ${command}`);
    
    // Rediriger vers le gestionnaire MCP interne
    const mcpResponse = await axios.post(`http://localhost:${PORT}/api/mcp/execute`, {
      command
    });
    
    res.json(mcpResponse.data);
  } catch (error) {
    console.error('Error executing MCP command:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route de test
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    features: ['mcp', 'github-integration', 'claude-desktop-integration']
  });
});

// Démarrage du serveur
(async () => {
  await ensureProjectFolder();

  app.listen(PORT, () => {
    console.log(`VibeMCP-Lite server running on port ${PORT}`);
    console.log(`MCP endpoint available at http://localhost:${PORT}/mcp`);
  });
})();
