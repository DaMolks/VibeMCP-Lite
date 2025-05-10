const express = require('express');
const router = express.Router();
const { Octokit } = require('octokit');
const fs = require('fs').promises;
const path = require('path');

// Initialiser Octokit avec le token GitHub
let octokit = null;

const initOctokit = () => {
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    octokit = new Octokit({ auth: token });
    return true;
  }
  return false;
};

// Middleware pour vérifier l'initialisation d'Octokit
const checkOctokit = (req, res, next) => {
  if (!octokit && !initOctokit()) {
    return res.status(401).json({ error: 'GitHub token not configured' });
  }
  next();
};

// Liste les repositories de l'utilisateur
router.get('/repos', checkOctokit, async (req, res) => {
  try {
    const response = await octokit.rest.repos.listForAuthenticatedUser();
    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      private: repo.private
    }));

    res.json({ repos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupère les contenus d'un repository
router.get('/contents', checkOctokit, async (req, res) => {
  try {
    const { owner, repo, path: contentPath = '' } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({ error: 'Owner and repo are required' });
    }

    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: contentPath
    });

    // Traiter le contenu en fonction s'il s'agit d'un fichier ou d'un dossier
    if (Array.isArray(response.data)) {
      // C'est un dossier, retourner la liste des fichiers
      const contents = response.data.map(item => ({
        name: item.name,
        path: item.path,
        type: item.type,
        size: item.size,
        url: item.html_url
      }));

      res.json({ contents });
    } else {
      // C'est un fichier, retourner le contenu
      const content = Buffer.from(response.data.content, 'base64').toString('utf8');
      res.json({
        name: response.data.name,
        path: response.data.path,
        content,
        sha: response.data.sha
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clone un dépôt GitHub en local
router.post('/clone', checkOctokit, async (req, res) => {
  try {
    const { owner, repo, projectName } = req.body;

    if (!owner || !repo || !projectName) {
      return res.status(400).json({ error: 'Owner, repo, and project name are required' });
    }

    const PROJECTS_DIR = path.join(__dirname, '../projects');
    const projectPath = path.join(PROJECTS_DIR, projectName);

    // Vérifier si le projet existe déjà
    try {
      await fs.access(projectPath);
      return res.status(400).json({ error: 'Project already exists' });
    } catch {
      // Le projet n'existe pas, c'est ce qu'on veut
    }

    // Créer le dossier du projet
    await fs.mkdir(projectPath, { recursive: true });

    // Récupérer les informations du repository
    const repoInfo = await octokit.rest.repos.get({ owner, repo });

    // Créer un fichier de configuration pour le projet
    const configPath = path.join(projectPath, '.vibemcp.json');
    const configContent = JSON.stringify({
      name: projectName,
      description: repoInfo.data.description || '',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      github: {
        owner,
        repo,
        default_branch: repoInfo.data.default_branch
      }
    }, null, 2);

    await fs.writeFile(configPath, configContent, 'utf8');

    // Récupérer les contenus de la racine du repository
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: ''
    });

    // Télécharger chaque fichier et dossier récursivement
    await downloadContents(response.data, owner, repo, projectPath, '');

    res.json({
      success: true,
      message: `Repository '${owner}/${repo}' cloned to project '${projectName}'`,
      project: { name: projectName, path: projectPath }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fonction récursive pour télécharger les contenus d'un dépôt GitHub
async function downloadContents(contents, owner, repo, projectPath, relativePath) {
  for (const item of contents) {
    const itemPath = path.join(projectPath, relativePath, item.name);

    if (item.type === 'file') {
      // Télécharger le fichier
      const fileContent = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: item.path
      });

      const content = Buffer.from(fileContent.data.content, 'base64').toString('utf8');
      await fs.writeFile(itemPath, content, 'utf8');
    } else if (item.type === 'dir') {
      // Créer le dossier
      await fs.mkdir(itemPath, { recursive: true });

      // Récupérer les contenus du dossier
      const dirContent = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: item.path
      });

      // Récursion pour télécharger les contenus du dossier
      await downloadContents(dirContent.data, owner, repo, projectPath, path.join(relativePath, item.name));
    }
  }
}

// Commit et push les changements vers GitHub
router.post('/commit', checkOctokit, async (req, res) => {
  try {
    const { project, message, files } = req.body;

    if (!project || !message || !files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Project name, commit message, and files are required' });
    }

    const PROJECTS_DIR = path.join(__dirname, '../projects');
    const projectPath = path.join(PROJECTS_DIR, project);
    const configPath = path.join(projectPath, '.vibemcp.json');

    // Lire le fichier de configuration
    let config;
    try {
      const configContent = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(configContent);
    } catch {
      return res.status(404).json({ error: 'Project not found or not a GitHub project' });
    }

    if (!config.github) {
      return res.status(400).json({ error: 'Project is not linked to GitHub' });
    }

    const { owner, repo, default_branch: branch } = config.github;

    // Traiter chaque fichier
    const commitFiles = [];
    for (const file of files) {
      const filePath = path.join(projectPath, file);
      const relativeFilePath = path.relative(projectPath, filePath);

      // Lire le contenu du fichier
      const content = await fs.readFile(filePath, 'utf8');

      // Récupérer le SHA du fichier s'il existe déjà
      let sha = null;
      try {
        const response = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: relativeFilePath,
          ref: branch
        });
        sha = response.data.sha;
      } catch {
        // Le fichier n'existe pas encore
      }

      commitFiles.push({
        path: relativeFilePath,
        content,
        sha
      });
    }

    // Créer un commit pour chaque fichier
    const results = [];
    for (const file of commitFiles) {
      try {
        const response = await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: file.path,
          message: `${message} [${file.path}]`,
          content: Buffer.from(file.content).toString('base64'),
          sha: file.sha,
          branch
        });

        results.push({
          path: file.path,
          success: true,
          commit: response.data.commit.sha
        });
      } catch (error) {
        results.push({
          path: file.path,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Committed ${results.filter(r => r.success).length} files to ${owner}/${repo}`,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
