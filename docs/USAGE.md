# Guide d'utilisation de VibeMCP-Lite

Ce document explique comment utiliser VibeMCP-Lite pour interagir avec vos projets de développement via Claude, en particulier comment effectuer des modifications partielles de fichiers.

## Introduction

VibeMCP-Lite est conçu pour permettre à Claude d'interagir directement avec vos projets de développement sans avoir à copier/coller de grandes quantités de code. Le système utilise un protocole simple mais puissant (MCP - Model Context Protocol) pour permettre la manipulation de fichiers et l'interaction avec GitHub.

## Commandes MCP de base

Les commandes MCP peuvent être utilisées directement dans Claude Desktop en utilisant la syntaxe suivante :

````
```mcp nom_de_la_commande arguments```
````

Par exemple :

````
```mcp create-project mon-app Une application web simple```
````

## Gestion des projets

### Créer un nouveau projet

```
create-project <nom> [description]
```

Exemple :
````
```mcp create-project portfolio-website Mon site web portfolio personnel```
````

### Lister les projets existants

```
list-projects
```

Exemple :
````
```mcp list-projects```
````

### Changer de projet actif

```
switch-project <nom>
```
ou
```
use-project <nom>
```

Exemple :
````
```mcp switch-project portfolio-website```
````

## Manipulation des fichiers

### Éditer des lignes spécifiques d'un fichier

Cette commande est le cœur de VibeMCP-Lite, permettant la modification partielle de fichiers.

```
edit <chemin_du_fichier> <ligne_début>-<ligne_fin>
```

Exemple :
````
```mcp edit src/App.js 10-20```
````

Cette commande récupère les lignes 10 à 20 du fichier `src/App.js` et les renvoie à Claude. Vous pouvez alors modifier ces lignes et les soumettre à nouveau.

### Comment soumettre les modifications

Après avoir modifié le contenu que Claude vous a montré, vous pouvez soumettre les modifications en utilisant un format similaire :

````
Voici les modifications pour les lignes 10-20 de src/App.js :

```javascript
// Votre code modifié ici
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Mon Portfolio</h1>
        <p>Bienvenue sur mon site portfolio</p>
      </header>
    </div>
  );
}
```

Veuillez appliquer ces modifications.
````

Claude analysera votre demande et utilisera l'API VibeMCP-Lite pour mettre à jour le fichier avec vos modifications.

## Intégration Git et GitHub

### Committer les changements

```
git-commit <message>
```

Exemple :
````
```mcp git-commit Mise à jour du header de la page d'accueil```
````

### Cloner un dépôt GitHub

Vous pouvez cloner un dépôt GitHub en utilisant l'API GitHub, bien que ce ne soit pas directement une commande MCP. Vous pouvez demander à Claude de le faire pour vous :

"Claude, peux-tu cloner le dépôt github.com/utilisateur/repo dans un nouveau projet appelé 'mon-clone'?"

## Exécution de commandes shell

VibeMCP-Lite peut également exécuter des commandes shell, ce qui est utile pour diverses tâches :

```
exec <commande>
```

Exemple :
````
```mcp exec ls -la```
````

## Exemples de workflows

### Exemple 1 : Créer et développer un site web simple

1. Créer un nouveau projet :
   ````
   ```mcp create-project mon-site-web Un site web personnel simple```
   ````

2. Créer un fichier HTML de base :
   ````
   Claude, peux-tu créer un fichier index.html de base dans mon projet ?
   ````

3. Modifier une section spécifique :
   ````
   ```mcp edit index.html 10-20```
   ````

4. Ajouter du CSS :
   ````
   Claude, peux-tu créer un fichier style.css pour mon site ?
   ````

5. Committer les changements :
   ````
   ```mcp git-commit Première version du site```
   ````

### Exemple 2 : Corriger un bug dans une application React

1. Passer au projet existant :
   ````
   ```mcp switch-project mon-app-react```
   ````

2. Examiner le fichier contenant le bug :
   ````
   ```mcp edit src/components/Button.js 1-50```
   ````

3. Modifier uniquement les lignes contenant le bug :
   ````
   ```mcp edit src/components/Button.js 25-30```
   ````

4. Tester la correction :
   ````
   ```mcp exec npm test```
   ````

5. Committer la correction :
   ````
   ```mcp git-commit Correction du bug #123 dans le composant Button```
   ````

## Bonnes pratiques

1. **Modifications ciblées** : Toujours cibler uniquement les lignes qui doivent être modifiées. Cela réduit les risques d'erreurs.

2. **Vérification** : Après avoir appliqué une modification, demandez à Claude de vérifier le résultat.

3. **Commits fréquents** : Faites des commits fréquents pour suivre vos changements.

4. **Lisibilité** : Gardez vos modifications lisibles et bien commentées pour faciliter la maintenance.

## Limitations

- Les modifications sont limitées aux fichiers texte. Les fichiers binaires ne sont pas supportés.
- VibeMCP-Lite ne peut pas exécuter directement du code JavaScript ou d'autres langages de programmation, bien qu'il puisse exécuter des commandes shell qui, elles, peuvent lancer des interpréteurs.
- L'intégration avec GitHub nécessite un token d'accès avec les permissions appropriées.

## Dépannage

### Si une commande échoue

1. Vérifiez que le serveur VibeMCP-Lite est en cours d'exécution
2. Assurez-vous que le chemin du fichier est correct
3. Vérifiez que les numéros de ligne sont valides
4. Consultez les logs du serveur pour plus de détails
5. Vérifiez que vous avez bien sélectionné un projet avec `switch-project` avant d'essayer de manipuler des fichiers

### Si l'intégration avec Claude ne fonctionne pas

1. Vérifiez que le webhook est correctement configuré dans le fichier `.env`
2. Assurez-vous que le serveur est accessible depuis Claude Desktop
3. Essayez de faire un test en envoyant une commande MCP simple comme `list-projects`

## Suggestions d'amélioration de workflow

1. **Projets distincts** : Créez des projets distincts pour différentes applications ou domaines.
2. **Fichiers centraux** : Identifiez les fichiers clés de votre projet et concentrez-vous sur eux.
3. **Changements atomiques** : Faites des modifications atomiques, une fonctionnalité à la fois.
4. **Tests réguliers** : Testez régulièrement vos modifications pour détecter les problèmes tôt.
5. **Documentation** : Maintenez à jour la documentation de votre projet.

## Ressources additionnelles

Pour plus d'informations, consultez les documents suivants :

- [Guide d'installation](INSTALLATION.md)
- [Documentation de l'API](API.md)
- [Intégration avec Claude Desktop](CLAUDE_DESKTOP_INTEGRATION.md)

Pour toute question ou problème, n'hésitez pas à ouvrir une issue sur le dépôt GitHub du projet.
