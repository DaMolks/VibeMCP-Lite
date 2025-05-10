# VibeMCP-Lite

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

VibeMCP-Lite est un panneau de contrôle minimaliste qui permet à Claude de manipuler des fichiers sur votre système local et d'interagir avec GitHub directement via le protocole MCP (Model Context Protocol).

## 🌟 Caractéristiques principales

- **Édition partielle de fichiers** : Modifiez des sections spécifiques des fichiers sans avoir à copier/coller l'intégralité du contenu
- **Intégration directe avec Claude Desktop** : Utilisation de webhooks locaux pour permettre à Claude d'exécuter des commandes
- **Gestion simplifiée des projets** : Création et organisation de vos projets de développement
- **Intégration GitHub** : Manipulez vos dépôts GitHub directement

## 🚀 Pourquoi VibeMCP-Lite ?

Lorsque vous travaillez avec Claude Desktop, l'un des principaux défis est la manipulation de code. Les assistants IA comme Claude ont souvent une limite sur la quantité de texte qu'ils peuvent traiter, ce qui rend difficile la manipulation de fichiers volumineux.

VibeMCP-Lite résout ce problème en permettant à Claude de :

1. Accéder uniquement aux parties pertinentes des fichiers
2. Effectuer des modifications précises sans connaître l'intégralité du fichier
3. Interagir directement avec votre système de fichiers et GitHub

## 💻 Comment ça marche

1. Vous démarrez le serveur VibeMCP-Lite localement
2. Dans Claude Desktop, vous pouvez utiliser des commandes spéciales entourées de backticks triples :

```
```mcp create-project mon-app```
```

3. Claude communique avec le serveur VibeMCP-Lite via un webhook
4. Le serveur exécute la commande et renvoie le résultat à Claude
5. Claude vous présente le résultat

## 📋 Commandes disponibles

- `create-project <nom> [description]` : Crée un nouveau projet
- `list-projects` : Liste tous les projets disponibles
- `switch-project <nom>` : Change le projet actif
- `edit <fichier> <ligne_début>-<ligne_fin>` : Édite uniquement les lignes spécifiées
- `exec <commande>` : Exécute une commande shell
- `git-commit <message>` : Commit les changements dans Git

## 🔧 Installation rapide

```bash
# Cloner le dépôt
git clone https://github.com/DaMolks/VibeMCP-Lite.git
cd VibeMCP-Lite/server

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifiez .env selon vos besoins

# Démarrer le serveur
npm run dev
```

Pour des instructions détaillées, consultez notre [Guide d'installation](./docs/INSTALLATION.md).

## 📝 Documentation

- [Guide d'installation](./docs/INSTALLATION.md) - Instructions détaillées pour l'installation et la configuration
- [Guide d'utilisation](./docs/USAGE.md) - Comment utiliser VibeMCP-Lite avec Claude
- [Intégration avec Claude Desktop](./docs/CLAUDE_DESKTOP_INTEGRATION.md) - Détails sur l'intégration avec Claude
- [Documentation de l'API](./docs/API.md) - Description complète de l'API RESTful

## 🏗️ Architecture simplifiée

VibeMCP-Lite suit une architecture simple et modulaire :

```
VibeMCP-Lite/
├── server/             # Serveur Express minimaliste
│   ├── routes/         # Points d'API organisés par fonctionnalité
│   ├── projects/       # Dossier où sont stockés les projets
│   └── index.js        # Point d'entrée principal
├── docs/               # Documentation complète
└── README.md           # Ce fichier README
```

## 🧩 Modèle de programmation "Vibe Coding"

VibeMCP-Lite permet un nouveau modèle de programmation que nous appelons "Vibe Coding", où Claude agit comme un partenaire de programmation qui peut directement interagir avec votre environnement de développement.

Ce modèle vous permet de vous concentrer sur les aspects créatifs et stratégiques du développement, tandis que Claude gère efficacement les détails d'implémentation.

## 🛠️ Extension et personnalisation

VibeMCP-Lite est conçu pour être facilement extensible. Vous pouvez :

- Ajouter de nouvelles commandes MCP
- Intégrer d'autres services (au-delà de GitHub)
- Créer des interfaces utilisateur personnalisées

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir des issues ou des pull requests pour améliorer VibeMCP-Lite.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

Développé avec ❤️ pour la communauté Claude
