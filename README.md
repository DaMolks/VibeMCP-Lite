# VibeMCP-Lite

Version simplifiée et épurée de VibeMCP (Model Control Panel) avec focus sur l'intégration directe avec Claude Desktop.

## Vue d'ensemble

VibeMCP-Lite est un panneau de contrôle minimaliste qui permet à Claude de manipuler des fichiers sur votre système local et d'interagir avec GitHub directement via le protocole MCP (Model Context Protocol).

## Fonctionnalités principales

- **Édition partielle de fichiers** : Modifiez des sections spécifiques des fichiers sans avoir à copier/coller l'intégralité du contenu
- **Intégration directe avec Claude Desktop** : Utilisation de webhooks locaux pour permettre à Claude d'exécuter des commandes
- **Gestion simplifiée des projets** : Création et organisation de vos projets de développement
- **Intégration GitHub** : Manipulez vos dépôts GitHub directement

## Architecture

Le projet est volontairement simplifié avec une approche modulaire :

```
VibeMCP-Lite/
├── server/             # Serveur Express minimaliste
├── claude-integration/ # Intégration avec Claude Desktop
└── client/             # Interface utilisateur simple (optionnelle)
```

## Fonctionnement

1. Le serveur MCP est lancé localement
2. Claude Desktop est configuré pour communiquer avec le serveur via des webhooks
3. Vous pouvez alors demander à Claude de modifier certaines parties de vos fichiers sans avoir à copier-coller l'intégralité du code

## Commandes disponibles

- `create-project <nom>` : Créer un nouveau projet
- `list-projects` : Lister tous les projets
- `edit <fichier> <ligne_début>-<ligne_fin>` : Éditer uniquement les lignes spécifiées
- `exec <commande>` : Exécuter une commande shell
- `git-commit <message>` : Enregistrer les changements dans Git

## Intégration avec Claude Desktop

VibeMCP-Lite est spécialement conçu pour fonctionner avec Claude Desktop, permettant une interaction directe via le protocole MCP sans avoir à copier-coller de grandes quantités de code.

## Installation

Consultez le fichier [INSTALLATION.md](./docs/INSTALLATION.md) pour des instructions détaillées.

## License

MIT
