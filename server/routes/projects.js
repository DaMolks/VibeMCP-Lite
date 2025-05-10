const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const PROJECTS_DIR = path.join(__dirname, '../projects');

// Liste tous les projets
router.get('/list', async (req, res) => {
  try {
    const items = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects = [];

    for (const item of items) {
      if (item.isDirectory()) {
        try {
          const configPath = path.join(PROJECTS_DIR, item.name, '.vibemcp.json');
          const configContent = await fs.readFile(configPath, 'utf8');
          const config = JSON.parse(configContent);

          projects.push({
            name: config.name,
            description: config.description,
            created: config.created,
            updated: config.updated
          });
        } catch (error) {
          // Si le fichier de configuration n'existe pas, ajouter juste le nom
          projects.push({ name: item.name, description: '', created: null, updated: null });
        }
      }
    }

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crée un nouveau projet
router.post('/create', async (req, res) => {
  try {
    const { name, description = '' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projectPath = path.join(PROJECTS_DIR, name);

    // Vérifier si le projet existe déjà
    try {
      await fs.access(projectPath);
      return res.status(400).json({ error: 'Project already exists' });
    } catch {
      // Le projet n'existe pas, c'est ce qu'on veut
    }

    // Créer le dossier du projet
    await fs.mkdir(projectPath, { recursive: true });

    // Créer un fichier README.md par défaut
    const readmePath = path.join(projectPath, 'README.md');
    const readmeContent = `# ${name}\n\n${description || 'A VibeMCP-Lite project'}\n`;

    await fs.writeFile(readmePath, readmeContent, 'utf8');

    // Créer un fichier de configuration pour le projet
    const configPath = path.join(projectPath, '.vibemcp.json');
    const configContent = JSON.stringify({
      name,
      description: description || '',
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    }, null, 2);

    await fs.writeFile(configPath, configContent, 'utf8');

    res.status(201).json({
      success: true,
      message: `Project '${name}' created successfully`,
      project: { name, description, path: projectPath }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprime un projet
router.delete('/delete/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const projectPath = path.join(PROJECTS_DIR, name);

    // Vérifier si le projet existe
    try {
      await fs.access(projectPath);
    } catch {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Supprimer le dossier et tout son contenu
    await fs.rm(projectPath, { recursive: true, force: true });

    res.json({
      success: true,
      message: `Project '${name}' deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
