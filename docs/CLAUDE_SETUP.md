# Configuration de Claude Desktop pour VibeMCP-Lite

Ce document explique comment configurer Claude Desktop pour qu'il puisse communiquer directement avec VibeMCP-Lite via le protocole MCP.

## Prérequis

- VibeMCP-Lite installé sur votre système
- Claude Desktop installé
- Accès au fichier de configuration de Claude Desktop

## Configuration de Claude Desktop

### Étape 1 : Localiser le fichier de configuration de Claude Desktop

Le fichier de configuration de Claude Desktop se trouve généralement dans le répertoire d'installation de Claude Desktop, sous un nom comme `config.json` ou `claude_desktop_config.json`.

### Étape 2 : Ajouter VibeMCP-Lite à la configuration MCP

Ouvrez le fichier de configuration dans un éditeur de texte et recherchez la section `mcpServers`. Si elle n'existe pas, vous devrez la créer. Ajoutez ensuite VibeMCP-Lite comme suit :

```json
"mcpServers": {
  "vibemcp": {
    "args": [
      "server"
    ],
    "command": "node",
    "cwd": "C:\\chemin\\vers\\VibeMCP-Lite\\server"
  }
}
```

Si vous utilisez des chemins sur Windows, assurez-vous de doubler les barres obliques inverses comme montré ci-dessus.

Pour Linux/macOS, la configuration serait :

```json
"mcpServers": {
  "vibemcp": {
    "args": [
      "server"
    ],
    "command": "node",
    "cwd": "/chemin/vers/VibeMCP-Lite/server"
  }
}
```

### Étape 3 : Sauvegarder la configuration

Sauvegardez le fichier de configuration et redémarrez Claude Desktop pour appliquer les changements.

### Étape 4 : Vérifier l'installation

Pour vérifier que Claude Desktop peut maintenant communiquer avec VibeMCP-Lite, démarrez une conversation avec Claude et essayez une commande MCP simple comme :

```
```mcp list-projects```
```

Si tout est correctement configuré, Claude devrait exécuter la commande et vous montrer les résultats.

## Configuration alternative pour une installation existante

Si VibeMCP-Lite est déjà installé et en cours d'exécution comme un service séparé, vous pouvez configurer Claude Desktop pour se connecter à ce service comme suit :

```json
"mcpServers": {
  "vibemcp": {
    "url": "http://localhost:3000/api/mcp"
  }
}
```

Cela indique à Claude Desktop d'envoyer les commandes MCP à l'URL spécifiée plutôt que de démarrer un nouveau processus.

## Utilisation avec Fleur

Si vous utilisez déjà Fleur avec Claude Desktop, vous pouvez ajouter VibeMCP-Lite en plus de Fleur dans la configuration :

```json
"mcpServers": {
  "fleur": {
    "args": [
      "mcp-fleur"
    ],
    "command": "C:\\Users\\Utilisateur\\.local\\bin\\uvx.exe"
  },
  "vibemcp": {
    "args": [
      "server"
    ],
    "command": "node",
    "cwd": "C:\\chemin\\vers\\VibeMCP-Lite\\server"
  }
}
```

Dans ce cas, vous devrez spécifier quel serveur MCP vous souhaitez utiliser en préfixant vos commandes MCP :

- Pour Fleur : `` ```mcp:fleur commande args``` ``
- Pour VibeMCP-Lite : `` ```mcp:vibemcp commande args``` ``

Si vous ne spécifiez pas de préfixe, Claude Desktop utilisera le premier serveur MCP configuré par défaut.

## Personnalisation du point d'entrée MCP

Si vous souhaitez modifier le point d'entrée MCP dans VibeMCP-Lite, vous devrez ajuster le fichier `server/index.js` pour exposer le point d'entrée à l'URL que Claude Desktop attend.

Le point d'entrée par défaut pour Claude Desktop est `/mcp`. Assurez-vous que VibeMCP-Lite expose ses fonctionnalités à cette URL si vous utilisez la configuration `url` plutôt que `command`.

## Dépannage

### Claude ne détecte pas les commandes MCP

- Vérifiez que le fichier de configuration est correctement formaté (JSON valide)
- Assurez-vous que les chemins vers VibeMCP-Lite sont corrects
- Vérifiez que VibeMCP-Lite est correctement installé

### Claude détecte les commandes mais ne les exécute pas

- Vérifiez que VibeMCP-Lite est en cours d'exécution ou peut être démarré par Claude Desktop
- Assurez-vous que les ports utilisés ne sont pas bloqués par un pare-feu
- Consultez les logs de Claude Desktop et VibeMCP-Lite pour plus de détails

### Problèmes de permissions

- Sur certains systèmes, des problèmes de permissions peuvent survenir
- Assurez-vous que Claude Desktop a les permissions nécessaires pour exécuter les commandes spécifiées
- Essayez d'exécuter Claude Desktop en tant qu'administrateur si nécessaire
