# Documentation de l'API VibeMCP-Lite

Ce document décrit l'API RESTful exposée par VibeMCP-Lite, permettant d'interagir programmatiquement avec le serveur.

## Base URL

Toutes les URL d'API sont relatives à la base URL du serveur : `http://localhost:3000/api/`

## Authentification

Actuellement, l'API ne nécessite pas d'authentification pour un usage local. Pour une installation en production, il est recommandé d'ajouter une couche d'authentification.

## Format des réponses

Toutes les réponses sont au format JSON. En cas de succès, la réponse contient un objet avec les données demandées. En cas d'erreur, la réponse contient un objet avec une propriété `error` décrivant l'erreur.

Exemple de réponse réussie :
```json
{
  "success": true,
  "data": { ... }
}
```

Exemple de réponse d'erreur :
```json
{
  "error": "Project not found"
}
```

## Endpoints API

### Statut du serveur

#### GET /api/status

Vérifie si le serveur est en cours d'exécution et renvoie des informations de base.

**Réponse** :
```json
{
  "status": "ok",
  "version": "0.1.0",
  "features": ["mcp", "github-integration", "claude-desktop-webhook"]
}
```

### Gestion des projets

#### GET /api/projects/list

Liste tous les projets disponibles.

**Réponse** :
```json
{
  "projects": [
    {
      "name": "mon-projet",
      "description": "Un projet d'exemple",
      "created": "2025-05-10T12:00:00Z",
      "updated": "2025-05-10T13:00:00Z"
    },
    ...
  ]
}
```

#### POST /api/projects/create

Crée un nouveau projet.

**Corps de la requête** :
```json
{
  "name": "nouveau-projet",
  "description": "Description du nouveau projet"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Project 'nouveau-projet' created successfully",
  "project": {
    "name": "nouveau-projet",
    "description": "Description du nouveau projet",
    "path": "/chemin/vers/le/projet"
  }
}
```

#### DELETE /api/projects/delete/:name

Supprime un projet existant.

**Paramètres d'URL** :
- `name` : Nom du projet à supprimer

**Réponse** :
```json
{
  "success": true,
  "message": "Project 'nom-du-projet' deleted successfully"
}
```

### Gestion des fichiers

#### GET /api/files/list

Liste les fichiers d'un projet.

**Paramètres de requête** :
- `project` : Nom du projet
- `dir` (optionnel) : Chemin du répertoire à lister (par défaut : racine du projet)

**Réponse** :
```json
{
  "files": [
    {
      "name": "index.js",
      "path": "src/index.js",
      "type": "file",
      "isHidden": false
    },
    {
      "name": "components",
      "path": "src/components",
      "type": "directory",
      "isHidden": false
    },
    ...
  ]
}
```

#### GET /api/files/read

Lit le contenu d'un fichier.

**Paramètres de requête** :
- `project` : Nom du projet
- `path` : Chemin du fichier à lire

**Réponse** :
```json
{
  "content": "contenu du fichier..."
}
```

#### POST /api/files/write

Écrit un fichier complet.

**Corps de la requête** :
```json
{
  "project": "mon-projet",
  "path": "src/nouveau-fichier.js",
  "content": "contenu du fichier..."
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "File written successfully"
}
```

#### PATCH /api/files/edit-lines

Modifie des lignes spécifiques d'un fichier.

**Corps de la requête** :
```json
{
  "project": "mon-projet",
  "path": "src/fichier.js",
  "startLine": 10,
  "endLine": 15,
  "newContent": "nouvelles lignes de code..."
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Lines 10 to 15 updated successfully",
  "lineCount": 6
}
```

#### DELETE /api/files/delete

Supprime un fichier.

**Corps de la requête** :
```json
{
  "project": "mon-projet",
  "path": "src/fichier-a-supprimer.js"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Modèle Context Protocol (MCP)

#### POST /api/mcp/execute

Exécute une commande MCP.

**Corps de la requête** :
```json
{
  "command": "create-project mon-projet Une description du projet"
}
```

**Réponse** :
```json
{
  "success": true,
  "command": "create-project mon-projet Une description du projet",
  "result": {
    "success": true,
    "message": "Project 'mon-projet' created successfully",
    "project": {
      "name": "mon-projet",
      "description": "Une description du projet",
      "path": "/chemin/vers/le/projet"
    }
  }
}
```

#### GET /api/mcp/context

Récupère le contexte MCP actuel.

**Réponse** :
```json
{
  "context": {
    "currentProject": "mon-projet",
    "lastCommand": "create-project mon-projet",
    "history": [
      {
        "command": "create-project mon-projet",
        "timestamp": "2025-05-10T12:00:00Z"
      },
      ...
    ]
  }
}
```

### Intégration avec Claude

#### POST /api/claude/setup

Configure l'intégration avec Claude.

**Corps de la requête** :
```json
{
  "apiKey": "clé_api_claude"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Claude configuration updated successfully",
  "webhookUrl": "http://localhost:5678/webhook"
}
```

#### POST /api/claude/webhook

Point d'entrée pour les webhooks de Claude Desktop.

**Corps de la requête** :
```json
{
  "message": "```mcp list-projects```",
  "type": "command"
}
```

**Réponse** :
```json
{
  "success": true,
  "response": {
    "projects": [
      {
        "name": "mon-projet",
        "description": "Un projet d'exemple",
        "created": "2025-05-10T12:00:00Z",
        "updated": "2025-05-10T13:00:00Z",
        "isActive": true
      },
      ...
    ]
  }
}
```

#### POST /api/claude/message

Envoie un message à Claude.

**Corps de la requête** :
```json
{
  "message": "Peux-tu lister mes projets ?"
}
```

**Réponse** :
```json
{
  "type": "claude_response",
  "message": "Bien sûr, voici vos projets : ..."
}
```

#### POST /api/claude/parse-commands

Extrait les commandes MCP d'un texte.

**Corps de la requête** :
```json
{
  "text": "Voici une commande : ```mcp list-projects```"
}
```

**Réponse** :
```json
{
  "success": true,
  "commands": [
    "list-projects"
  ],
  "count": 1
}
```

#### POST /api/claude/execute-commands

Exécute les commandes MCP extraites d'un texte.

**Corps de la requête** :
```json
{
  "text": "Voici une commande : ```mcp list-projects```"
}
```

**Réponse** :
```json
{
  "success": true,
  "result": {
    "executed": 1,
    "successful": 1,
    "results": [
      {
        "command": "list-projects",
        "success": true,
        "result": {
          "projects": [...]
        }
      }
    ]
  }
}
```

### Intégration GitHub

#### GET /api/github/repos

Liste les repositories GitHub de l'utilisateur.

**Réponse** :
```json
{
  "repos": [
    {
      "id": 123456789,
      "name": "mon-repo",
      "full_name": "utilisateur/mon-repo",
      "description": "Description du repository",
      "url": "https://github.com/utilisateur/mon-repo",
      "private": false
    },
    ...
  ]
}
```

#### GET /api/github/contents

Récupère les contenus d'un repository GitHub.

**Paramètres de requête** :
- `owner` : Propriétaire du repository
- `repo` : Nom du repository
- `path` (optionnel) : Chemin du fichier ou du dossier à récupérer

**Réponse (pour un dossier)** :
```json
{
  "contents": [
    {
      "name": "index.js",
      "path": "src/index.js",
      "type": "file",
      "size": 1024,
      "url": "https://github.com/utilisateur/mon-repo/blob/main/src/index.js"
    },
    ...
  ]
}
```

**Réponse (pour un fichier)** :
```json
{
  "name": "index.js",
  "path": "src/index.js",
  "content": "contenu du fichier...",
  "sha": "abc123def456..."
}
```

#### POST /api/github/clone

Clone un repository GitHub en local.

**Corps de la requête** :
```json
{
  "owner": "utilisateur",
  "repo": "mon-repo",
  "projectName": "mon-projet-local"
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Repository 'utilisateur/mon-repo' cloned to project 'mon-projet-local'",
  "project": {
    "name": "mon-projet-local",
    "path": "/chemin/vers/le/projet"
  }
}
```

#### POST /api/github/commit

Commit et push les changements vers GitHub.

**Corps de la requête** :
```json
{
  "project": "mon-projet",
  "message": "Correction du bug #123",
  "files": [
    "src/components/Button.js",
    "src/styles/button.css"
  ]
}
```

**Réponse** :
```json
{
  "success": true,
  "message": "Committed 2 files to utilisateur/mon-repo",
  "results": [
    {
      "path": "src/components/Button.js",
      "success": true,
      "commit": "abc123def456..."
    },
    {
      "path": "src/styles/button.css",
      "success": true,
      "commit": "ghi789jkl012..."
    }
  ]
}
```

## Codes d'erreur

| Code HTTP | Description                                                |
|-----------|------------------------------------------------------------|
| 200       | Succès                                                     |
| 201       | Créé avec succès                                           |
| 400       | Requête invalide (paramètres manquants ou invalides)       |
| 401       | Non autorisé (authentification requise)                    |
| 404       | Ressource non trouvée                                      |
| 500       | Erreur interne du serveur                                  |

## Exemples d'utilisation avec cURL

### Lister les projets

```bash
curl -X GET http://localhost:3000/api/projects/list
```

### Créer un nouveau projet

```bash
curl -X POST http://localhost:3000/api/projects/create \
  -H "Content-Type: application/json" \
  -d '{"name": "nouveau-projet", "description": "Un nouveau projet"}'
```

### Exécuter une commande MCP

```bash
curl -X POST http://localhost:3000/api/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "list-projects"}'
```

## Extension de l'API

VibeMCP-Lite est conçu pour être facilement extensible. Pour ajouter de nouvelles fonctionnalités à l'API :

1. Créez un nouveau fichier dans le dossier `server/routes/`
2. Implémentez vos nouvelles routes
3. Importez et enregistrez votre routeur dans `server/index.js`

Exemple d'extension :

```javascript
// server/routes/custom.js
const express = require('express');
const router = express.Router();

router.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

module.exports = router;

// Dans server/index.js
const customRoutes = require('./routes/custom');
app.use('/api/custom', customRoutes);
```

## Sécurité et bonnes pratiques

- **Ne pas exposer l'API sur Internet** sans une authentification appropriée
- **Limiter l'accès aux fichiers** à l'intérieur des projets pour éviter l'accès à des fichiers sensibles
- **Valider toutes les entrées utilisateur** pour éviter les injections et autres vulnérabilités
- **Mettre en place des limites de taux** pour éviter la surcharge du serveur

## Intégration avec d'autres applications

L'API REST de VibeMCP-Lite permet une intégration facile avec d'autres applications. Vous pouvez développer :

- Une interface utilisateur web personnalisée
- Des plugins pour des éditeurs de code
- Des intégrations avec d'autres LLMs que Claude
- Des outils de ligne de commande
