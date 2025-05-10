# Guide d'installation de VibeMCP-Lite

Ce document vous guidera à travers les étapes pour installer et configurer VibeMCP-Lite, un outil permettant à Claude de manipuler des fichiers sur votre système et d'interagir avec GitHub.

## Prérequis

- Node.js (v14.0.0 ou supérieur)
- npm (v6.0.0 ou supérieur)
- Git (pour l'intégration GitHub)
- Claude Desktop (pour l'intégration complète)

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
CLAUDE_WEBHOOK_URL=http://localhost:5678/webhook  # URL du webhook Claude Desktop
CLAUDE_API_KEY=votre_cle_api_claude          # Clé API Claude (optionnel pour le moment)
```

### 3. Démarrer le serveur

```bash
# Dans le dossier server
npm run dev
```

Cela démarrera le serveur en mode développement avec rechargement automatique. Vous devriez voir un message indiquant que le serveur est en cours d'exécution sur le port configuré.

## Configuration de l'intégration avec Claude Desktop

Il existe deux façons d'intégrer VibeMCP-Lite avec Claude Desktop :

### Option 1 : Utilisation directe avec des commandes MCP

Vous pouvez utiliser Claude directement en incluant des commandes MCP dans vos messages. 

1. Démarrez une conversation avec Claude Desktop
2. Utilisez le format suivant pour exécuter des commandes MCP :

```
```mcp create-project mon-projet```
```

Les commandes seront automatiquement interceptées et exécutées sur votre serveur VibeMCP-Lite.

### Option 2 : Intégration via un webhook local

Pour une intégration plus transparente :

1. Assurez-vous que votre serveur VibeMCP-Lite est en cours d'exécution
2. Dans votre conversation avec Claude, dites-lui que vous souhaitez utiliser VibeMCP-Lite
3. Les commandes MCP seront automatiquement reconnues et exécutées

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

Voici les principales commandes que vous pouvez utiliser dans Claude :

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

### L'intégration avec Claude ne fonctionne pas

- Assurez-vous que le serveur VibeMCP-Lite est en cours d'exécution
- Vérifiez que l'URL du webhook est correctement configurée
- Essayez de redémarrer le serveur

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
