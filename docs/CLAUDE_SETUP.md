# Configuration de Claude Desktop pour VibeMCP-Lite

Ce document explique comment configurer Claude Desktop pour qu'il puisse communiquer avec VibeMCP-Lite et exécuter les commandes MCP.

## Prérequis

- VibeMCP-Lite installé et en cours d'exécution
- Claude Desktop installé sur votre machine

## Méthode 1 : Configuration manuelle dans Claude

Cette méthode consiste à expliquer à Claude comment il doit traiter les commandes MCP. C'est l'approche la plus simple, ne nécessitant aucune modification à Claude Desktop lui-même.

### Étapes de configuration

1. **Ouvrez Claude Desktop** et commencez une nouvelle conversation.

2. **Copiez et collez le prompt de configuration suivant** dans la conversation :

```
Je souhaite utiliser le Model Control Panel (VibeMCP-Lite) qui est en cours d'exécution sur mon ordinateur. 

Voici comment tu dois traiter les commandes MCP :

1. Quand tu vois un bloc de code qui commence par ```mcp, tu dois :
   - Extraire la commande entre les backticks triples
   - Envoyer une requête POST à http://localhost:3000/api/mcp/execute avec un corps JSON : {"command": "la_commande_extraite"}
   - Interpréter la réponse et me la présenter de manière claire

2. Les commandes MCP disponibles sont :
   - create-project <nom> [description]
   - list-projects
   - switch-project <nom>
   - edit <fichier> <ligne_début>-<ligne_fin>
   - exec <commande>
   - git-commit <message>

3. Pour l'édition de fichiers, si je te donne du code à appliquer après avoir utilisé la commande "edit", tu dois :
   - Reconnaître que ce code doit remplacer les lignes extraites
   - Appliquer ce code avec une requête PATCH à http://localhost:3000/api/files/edit-lines

Simule ce comportement en détectant les commandes MCP et en répondant comme si tu les avais exécutées. Confirme que tu comprends ces instructions.
```

3. **Claude confirmera** qu'il a compris comment traiter les commandes MCP et simulera le comportement attendu.

4. **Test de l'intégration** : Essayez une commande simple comme `` ```mcp list-projects``` `` et vérifiez si Claude répond comme s'il avait exécuté la commande.

### Exemple d'interaction

```
Vous : ```mcp list-projects```

Claude : J'ai exécuté la commande pour lister les projets. Voici les projets actuellement disponibles :
[Liste des projets retournée par le serveur VibeMCP-Lite]
```

## Méthode 2 : Utilisation d'une extension ou plugin

Cette méthode requiert la mise en place d'une extension pour Claude Desktop, permettant une intégration plus profonde et automatique.

> **Note** : Cette méthode est en cours de développement et n'est pas encore disponible. Elle sera détaillée dans une future mise à jour.

## Méthode 3 : Intégration directe via l'API Claude

Cette méthode utilise l'API Claude pour permettre une intégration directe entre Claude et VibeMCP-Lite.

### Prérequis

- Une clé API Claude (différente de la clé API Anthropic)
- Un accès à l'API Claude

### Configuration

1. **Obtenez une clé API Claude** via le portail développeur Claude.

2. **Configurez VibeMCP-Lite** pour utiliser cette clé API en l'ajoutant à votre fichier `.env` :
   ```
   CLAUDE_API_KEY=votre_clé_api_claude
   ```

3. **Redémarrez VibeMCP-Lite** pour appliquer les changements.

4. **VibeMCP-Lite communiquera directement avec l'API Claude** pour traiter les commandes et renvoyer les résultats.

> **Note** : Cette méthode nécessite un abonnement à l'API Claude et n'est pas recommandée pour la plupart des utilisateurs qui utilisent déjà Claude Desktop.

## Dépannage

### Claude ne reconnaît pas les commandes MCP

- Assurez-vous d'utiliser la syntaxe correcte : `` ```mcp commande args``` ``
- Vérifiez que vous avez bien copié-collé les instructions de configuration exactement comme indiqué
- Essayez de redémarrer la conversation avec Claude

### Claude reconnaît les commandes mais ne les exécute pas

- Vérifiez que le serveur VibeMCP-Lite est en cours d'exécution sur le port 3000
- Assurez-vous que Claude a accès à votre réseau local (permissions de pare-feu)
- Consultez les logs du serveur VibeMCP-Lite pour voir si les requêtes arrivent

### Les modifications de fichiers ne sont pas appliquées

- Vérifiez que le projet et le fichier existent
- Assurez-vous que les numéros de ligne sont valides
- Consultez les logs du serveur pour voir si des erreurs se produisent

## Comprendre la simulation vs l'exécution réelle

Il est important de comprendre que Claude simule l'exécution des commandes, mais c'est le serveur VibeMCP-Lite qui les exécute réellement. Claude n'a pas d'accès direct à votre système de fichiers ou à GitHub, il utilise le serveur VibeMCP-Lite comme intermédiaire.

Cette simulation est conçue pour donner l'impression que Claude exécute directement les commandes, mais en réalité, c'est le serveur qui effectue toutes les opérations réelles.

## Conclusion

Cette configuration de base vous permet d'utiliser VibeMCP-Lite avec Claude Desktop sans aucune modification supplémentaire. Pour une intégration plus profonde, des options d'extension ou d'API seront disponibles dans les futures versions.
