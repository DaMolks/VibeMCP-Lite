# Intégration avec Claude Desktop

Ce document détaille comment VibeMCP-Lite s'intègre avec Claude Desktop pour permettre une interaction directe entre Claude et votre système de fichiers local.

## Vue d'ensemble

VibeMCP-Lite permet à Claude Desktop d'interagir avec votre environnement de développement local via un protocole de communication simple mais puissant. Cette intégration permet à Claude de :

1. Éditer des fichiers partiellement (sans avoir à copier/coller tout le contenu)
2. Gérer des projets entiers
3. Exécuter des commandes système
4. Interagir avec GitHub

## Mécanisme d'intégration

L'intégration se fait via un mécanisme de webhook local. Claude Desktop envoie des requêtes au serveur VibeMCP-Lite, qui les exécute et renvoie les résultats.

### Flux de communication

1. L'utilisateur envoie une commande à Claude Desktop (en utilisant la syntaxe MCP)
2. Claude détecte la commande et la transmet au serveur VibeMCP-Lite via le webhook
3. Le serveur exécute la commande et renvoie le résultat
4. Claude présente le résultat à l'utilisateur

## Configuration du webhook

Pour activer l'intégration avec Claude Desktop, vous devez configurer le webhook dans le fichier `.env` :

```
CLAUDE_WEBHOOK_URL=http://localhost:5678/webhook
```

Ce webhook est un point d'endpoint où Claude peut envoyer des requêtes. Dans une installation standard, Claude Desktop écoute sur le port 5678.

## Comment Claude détecte et exécute les commandes MCP

### Détection automatique

Claude analyse automatiquement les messages des utilisateurs pour détecter les commandes MCP, qui sont incluses dans un bloc de code avec le préfixe `mcp`. Par exemple :

````
```mcp create-project mon-app```
````

Lorsque Claude détecte une telle commande, il l'envoie au serveur VibeMCP-Lite via le webhook.

### Exécution manuelle

Vous pouvez également demander à Claude d'exécuter des commandes MCP explicitement :

"Claude, peux-tu exécuter la commande MCP 'list-projects' pour moi ?"

Claude détectera la demande et exécutera la commande correspondante.

## Intégration à VibeMCP-Lite côté serveur

Le serveur VibeMCP-Lite dispose d'un point d'entrée spécifique pour traiter les requêtes de Claude Desktop :

```javascript
// Route pour recevoir les webhooks de Claude Desktop
router.post('/webhook', async (req, res) => {
  const { message, type } = req.body;
  
  // Traitement du message et exécution des commandes
  // ...
  
  // Renvoie le résultat à Claude
  res.json({ success: true, response: result });
});
```

Ce point d'entrée analyse les messages de Claude, extrait les commandes MCP, les exécute et renvoie les résultats.

## Édition partielle de fichiers

L'une des fonctionnalités les plus puissantes de VibeMCP-Lite est la possibilité d'éditer partiellement des fichiers. Voici comment cela fonctionne :

1. L'utilisateur demande à Claude d'éditer des lignes spécifiques d'un fichier :
   ```
   edit <fichier> <ligne_début>-<ligne_fin>
   ```

2. Le serveur VibeMCP-Lite récupère ces lignes et les renvoie à Claude.

3. Claude présente ces lignes à l'utilisateur, qui peut les modifier.

4. L'utilisateur envoie les lignes modifiées à Claude.

5. Claude détecte les modifications et les envoie au serveur VibeMCP-Lite.

6. Le serveur met à jour le fichier avec les nouvelles lignes.

Ce processus permet d'éviter d'avoir à copier/coller des fichiers entiers, ce qui est particulièrement utile pour les fichiers volumineux.

## Modèle de programmation "Vibe Coding"

Cette intégration permet un nouveau modèle de programmation que nous appelons "Vibe Coding", où Claude agit comme un partenaire de programmation qui peut directement manipuler votre code sur demande.

### Avantages du Vibe Coding

1. **Réduction de la charge cognitive** : Vous n'avez pas à copier/coller le code, ce qui vous permet de vous concentrer sur les problèmes de plus haut niveau.

2. **Modifications précises** : Claude peut modifier uniquement les parties du code qui ont besoin d'être changées.

3. **Continuité contextuelle** : Claude maintient le contexte du projet, ce qui lui permet de faire des suggestions plus pertinentes.

4. **Workflow naturel** : Vous pouvez discuter avec Claude de vos besoins en langage naturel, puis lui demander d'effectuer les modifications nécessaires.

## Exemples d'interactions

### Exemple 1 : Création et modification d'un composant React

**Utilisateur** : "Claude, peux-tu créer un nouveau composant React pour afficher un formulaire de contact ?"

**Claude** : "Bien sûr, je vais créer un composant de formulaire de contact. D'abord, créons un nouveau fichier pour ce composant."

```mcp write src/components/ContactForm.js 
import React, { useState } from 'react';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Ajoutez ici la logique d'envoi du formulaire
  };

  return (
    <div className="contact-form">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Send Message</button>
      </form>
    </div>
  );
}

export default ContactForm;
```

**Utilisateur** : "Peux-tu ajouter une validation pour l'email ?"

**Claude** : "Je vais modifier le composant pour ajouter une validation d'email."

```mcp edit src/components/ContactForm.js 10-15
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const handleChange = (e) => {
```

**Claude** : "Maintenant, modifions aussi la fonction handleSubmit pour utiliser cette validation."

```mcp edit src/components/ContactForm.js 20-27
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Valider l'email
    const validationErrors = {};
    if (!validateEmail(formData.email)) {
      validationErrors.email = "Please enter a valid email address";
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Si tout est valide, soumettre le formulaire
    setErrors({});
    console.log('Form submitted:', formData);
    // Ajoutez ici la logique d'envoi du formulaire
  };
```

## Configuration technique

### Côté VibeMCP-Lite

VibeMCP-Lite s'attend à recevoir des requêtes POST à l'endpoint `/api/claude/webhook` avec un corps JSON contenant les propriétés `message` et éventuellement `type`.

Exemple de requête :
```json
{
  "message": "```mcp list-projects```",
  "type": "command"
}
```

Le serveur répond avec un objet JSON contenant le résultat de la commande :
```json
{
  "success": true,
  "response": {
    "projects": [...]
  }
}
```

### Côté Claude Desktop

Pour que Claude Desktop puisse envoyer des requêtes à VibeMCP-Lite, il faut qu'il soit configuré pour écouter les commandes MCP et les envoyer au webhook configuré.

La détection des commandes MCP se fait à l'aide d'expressions régulières pour identifier les blocs de code avec le préfixe `mcp`.

## Sécurité et considérations

### Limitations d'accès

Pour des raisons de sécurité, VibeMCP-Lite limite l'accès aux fichiers au sein des projets créés ou clonés via l'outil. Il ne permet pas d'accéder arbitrairement à n'importe quel fichier du système.

### Exécution de commandes

Bien que VibeMCP-Lite permette l'exécution de commandes shell, cette fonctionnalité devrait être utilisée avec prudence. Par défaut, seules les commandes liées au développement (npm, git, etc.) sont autorisées.

### Protection des informations sensibles

Ne stockez jamais d'informations sensibles (clés API, mots de passe, etc.) dans les fichiers gérés par VibeMCP-Lite, car Claude y aura accès.

## Dépannage de l'intégration

### Problèmes courants

1. **Le webhook n'est pas accessible** : Vérifiez que le serveur VibeMCP-Lite est en cours d'exécution et que l'URL du webhook est correcte.

2. **Claude ne détecte pas les commandes MCP** : Assurez-vous d'utiliser la syntaxe correcte pour les commandes MCP.

3. **Les commandes échouent** : Vérifiez les logs du serveur pour plus d'informations sur l'erreur.

### Logs et debugging

VibeMCP-Lite enregistre toutes les requêtes et réponses dans les logs du serveur. Vous pouvez consulter ces logs pour déboguer les problèmes d'intégration.

## Conclusion

L'intégration de Claude Desktop avec VibeMCP-Lite ouvre de nouvelles possibilités pour la collaboration homme-machine dans le développement logiciel. En permettant à Claude d'interagir directement avec votre environnement de développement, vous pouvez améliorer significativement votre productivité et votre flux de travail.
