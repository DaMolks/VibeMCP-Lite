# Intégration avec Claude

Ce document clarifie comment VibeMCP-Lite peut être utilisé avec Claude et les limitations actuelles de cette intégration.

## Clarification importante

**Important** : Claude Desktop (l'application de bureau d'Anthropic) n'a pas actuellement de fonctionnalité native permettant d'exécuter des requêtes HTTP vers des services externes comme VibeMCP-Lite, ni de système d'extensions ou de plugins permettant d'ajouter cette fonctionnalité.

## Options d'intégration

### Option 1 : Utilisation de Claude comme interface de conversation

Cette option utilise Claude comme une interface conversationnelle pour VibeMCP-Lite, mais **vous** devez exécuter manuellement les commandes suggérées par Claude.

1. **Discutez avec Claude** de votre projet, des modifications que vous souhaitez faire, etc.

2. **Claude vous suggère des commandes MCP** à exécuter, par exemple :
   ```
   Je vous suggère d'utiliser la commande suivante dans VibeMCP-Lite :
   create-project mon-projet "Description du projet"
   ```

3. **Vous exécutez la commande** via l'interface de ligne de commande ou l'API REST de VibeMCP-Lite :
   ```bash
   # Via curl
   curl -X POST http://localhost:3000/api/mcp/execute \
     -H "Content-Type: application/json" \
     -d '{"command": "create-project mon-projet \"Description du projet\""}'
   ```

4. **Vous communiquez les résultats à Claude** pour continuer la conversation.

### Option 2 : Interface utilisateur VibeMCP

Une interface utilisateur web pour VibeMCP-Lite peut être développée pour :

1. Afficher les projets et fichiers
2. Permettre d'éditer visuellement les fichiers
3. Exécuter les commandes MCP suggérées par Claude
4. Voir l'historique des commandes et leurs résultats

Cette option n'est pas encore implémentée, mais elle fait partie des plans de développement futurs.

### Option 3 : API Claude (pour les développeurs)

Les développeurs disposant d'un accès à l'API Claude pourraient développer une intégration plus complète entre Claude et VibeMCP-Lite. Cela nécessiterait :

1. Un accès à l'API Claude
2. Le développement d'une application intermédiaire qui :
   - Envoie les messages de l'utilisateur à l'API Claude
   - Intercepte les commandes MCP dans les réponses de Claude
   - Exécute ces commandes sur le serveur VibeMCP-Lite
   - Retourne les résultats à l'utilisateur

## Utilisation pratique actuelle

En attendant une intégration plus profonde, voici comment utiliser VibeMCP-Lite efficacement avec Claude :

1. **Utilisez Claude pour la réflexion et la génération de code** :
   - Discutez de votre projet avec Claude
   - Demandez des suggestions de code
   - Demandez des modifications spécifiques à apporter à votre code existant

2. **Utilisez VibeMCP-Lite pour manipuler les fichiers** :
   - Suivez les suggestions de Claude pour créer/modifier des fichiers
   - Exécutez les commandes MCP via l'API ou l'interface que vous préférez
   - Utilisez particulièrement la fonctionnalité d'édition partielle (`edit <fichier> <ligne_début>-<ligne_fin>`)

3. **Partagez les résultats avec Claude** :
   - Informez Claude des résultats des commandes
   - Demandez des ajustements ou des suggestions supplémentaires

## Exemple de workflow

```
Vous (à Claude) : J'aimerais ajouter une fonction de validation d'email dans mon formulaire React.

Claude : Je peux vous aider avec ça. Pouvez-vous me montrer le code actuel du formulaire ?

Vous : Voici le code des lignes 10-20 du fichier src/components/ContactForm.js dans mon projet "site-web" :
[collez le code ici]

Claude : Je suggère d'ajouter une fonction de validation comme celle-ci :
[Claude génère le code]

Pour l'intégrer à votre formulaire, utilisez VibeMCP-Lite avec cette commande :
edit src/components/ContactForm.js 10-20

Puis remplacez ces lignes par le code que je viens de vous fournir.

Vous : [Exécutez la commande avec VibeMCP-Lite et appliquez les modifications]

Vous (à Claude) : J'ai appliqué les modifications. Maintenant je dois aussi modifier la fonction handleSubmit pour utiliser cette validation.

Claude : [Continue à vous aider avec le développement]
```

## Plans de développement futur

Nous travaillons sur plusieurs améliorations pour faciliter l'intégration entre Claude et VibeMCP-Lite :

1. **Interface utilisateur web** pour VibeMCP-Lite
2. **Extension de navigateur** pour faciliter les interactions entre Claude (version web) et VibeMCP-Lite
3. **Intégration API** pour les développeurs ayant accès à l'API Claude

Restez à l'écoute pour ces mises à jour dans les versions futures.
