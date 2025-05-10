# Guide d'installation de VibeMCP-Lite

Ce document vous guidera à travers les étapes pour installer et configurer VibeMCP-Lite, un outil permettant de manipuler des fichiers sur votre système et d'interagir avec GitHub via une API.

## Prérequis

- Node.js (v14.0.0 ou supérieur)
- npm (v6.0.0 ou supérieur)
- Git (pour l'intégration GitHub)

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/DaMolks/VibeMCP-Lite.git
cd VibeMCP-Lite
```

### 2. Configurer le serveur

```bash
# Accéder au dossier du serveur
cd server

# Installer les dépendances
npm install

# Copier le fichier d'environnement d'exemple
cp .env.example .env

# Modifier le fichier .env avec vos paramètres
nano .env  # ou utilisez votre éditeur préféré
```

Dans le fichier `.env`, configurez les paramètres suivants :

```
PORT=3000                                    # Port sur lequel le serveur s'exécutera
GITHUB_TOKEN=votre_token_github              # Token d'accès GitHub (optionnel)
```

### 3. Démarrer le serveur

```bash
# Dans le dossier server
npm run dev
```

Cela démarrera le serveur en mode développement avec rechargement automatique. Vous devriez voir un message indiquant que le serveur est en cours d'exécution sur le port configuré.

## Comment utiliser VibeMCP-Lite

Une fois le serveur en marche, vous pouvez utiliser VibeMCP-Lite de deux façons :

### Via l'API REST

VibeMCP-Lite expose une API REST que vous pouvez appeler directement :

```bash
# Exemple : Créer un nouveau projet
curl -X POST http://localhost:3000/api/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "create-project mon-projet \"Description du projet\""}'

# Exemple : Lister les projets
curl -X POST http://localhost:3000/api/mcp/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "list-projects"}'
```

### Avec Claude (assistant)

Consultez le document [Intégration avec Claude](./CLAUDE_SETUP.md) pour comprendre comment utiliser VibeMCP-Lite en tandem avec Claude, même s'il n'y a pas d'intégration directe actuellement.

## Configuration de l'intégration GitHub (optionnel)

Pour utiliser les fonctionnalités d'intégration GitHub :

1. Créez un token d'accès personnel sur GitHub :
   - Connectez-vous à votre compte GitHub
   - Accédez à Paramètres > Paramètres développeur > Tokens d'accès personnel
   - Générez un nouveau token avec les autorisations `repo`
   
2. Ajoutez ce token à votre fichier `.env` :
   ```
   GITHUB_TOKEN=votre_token_github
   ```

3. Redémarrez le serveur VibeMCP-Lite

## Structure des dossiers créés

Une fois configuré, VibeMCP-Lite créera la structure suivante :

```
VibeMCP-Lite/
├── server/
│   ├── projects/          # Dossier où seront stockés vos projets
│   │   ├── projet1/       # Un exemple de projet
│   │   │   ├── .vibemcp.json  # Métadonnées du projet
│   │   │   └── ...        # Fichiers du projet
```

## Tester l'installation

Pour vérifier que tout fonctionne correctement, exécutez les commandes suivantes dans votre navigateur :

1. http://localhost:3000/api/status - Devrait retourner un statut "ok"
2. http://localhost:3000/api/projects/list - Devrait retourner la liste des projets (vide au début)

## Commandes MCP disponibles

Voici les principales commandes que vous pouvez utiliser avec l'API MCP :

- `create-project <nom> [description]` - Crée un nouveau projet
- `list-projects` - Liste tous les projets
- `switch-project <nom>` - Change le projet actif
- `edit <fichier> <ligne_début>-<ligne_fin>` - Édite des lignes spécifiques d'un fichier
- `exec <commande>` - Exécute une commande shell
- `git-commit <message>` - Commit les changements dans Git

## Dépannage

### Le serveur ne démarre pas

- Vérifiez que Node.js est installé correctement : `node -v`
- Assurez-vous que le port n'est pas déjà utilisé
- Vérifiez les erreurs dans la console

### L'intégration GitHub échoue

- Vérifiez que votre token GitHub est valide et a les bonnes autorisations
- Assurez-vous que le token est correctement configuré dans le fichier `.env`
- Vérifiez la connexion internet et les erreurs dans la console

## Mise à jour

Pour mettre à jour VibeMCP-Lite :

```bash
# À la racine du projet
git pull

# Mettre à jour les dépendances
cd server
npm install
```
