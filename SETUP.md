# Guide de Configuration - Discovery Flights Flex

Ce guide vous accompagne étape par étape pour configurer votre application.

## 1. Configuration de la Base de Données Supabase

La base de données Supabase est déjà provisionnée avec Replit. Vous devez simplement :

### Étape 1 : Vérifier les variables d'environnement

Les variables suivantes doivent déjà être dans votre fichier `.env` :
- `DATABASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Étape 2 : Créer les tables

Exécutez la commande suivante pour créer toutes les tables nécessaires :

```bash
npm run db:push
```

Cette commande va :
- Créer les tables `searches`, `alerts`, et `price_history`
- Activer Row Level Security (RLS)
- Créer les index pour de meilleures performances

## 2. Configuration de Kiwi.com Tequila API

Kiwi.com propose une API flexible pour rechercher des vols à travers le monde entier.

### Étape 1 : Créer un compte

1. Allez sur https://tequila.kiwi.com/portal/login
2. Cliquez sur "Sign up" pour créer un compte gratuit
3. Validez votre email

### Étape 2 : Obtenir votre clé API

1. Connectez-vous au portail Tequila
2. Allez dans "API Keys" ou "Settings"
3. Générez une nouvelle clé API
4. Copiez la clé API

### Étape 3 : Configurer l'affiliation (Optionnel mais recommandé)

Pour monétiser votre application via des liens d'affiliation :

1. Dans le portail Kiwi.com, recherchez la section "Affiliation" ou "Partner Program"
2. Inscrivez-vous au programme partenaire
3. Obtenez votre Partner ID
4. Ce Partner ID sera ajouté automatiquement à tous les liens de réservation

### Étape 4 : Ajouter les clés dans .env

```env
KIWI_API_KEY=votre_clé_api_ici
KIWI_PARTNER_ID=votre_partner_id_ici
```

## 3. Configuration de Resend (Email)

Resend permet d'envoyer des emails transactionnels professionnels.

### Étape 1 : Créer un compte

1. Allez sur https://resend.com/
2. Cliquez sur "Sign up" pour créer un compte gratuit
3. Le plan gratuit inclut 100 emails/jour et 3000 emails/mois

### Étape 2 : Obtenir votre clé API

1. Connectez-vous à votre dashboard Resend
2. Allez dans "API Keys"
3. Cliquez sur "Create API Key"
4. Donnez un nom à votre clé (ex: "Discovery Flights Prod")
5. Copiez la clé API (vous ne pourrez la voir qu'une seule fois)

### Étape 3 : Configurer votre domaine (Optionnel)

Pour envoyer des emails depuis votre propre domaine :

1. Dans Resend, allez dans "Domains"
2. Ajoutez votre domaine
3. Configurez les enregistrements DNS (SPF, DKIM, DMARC)
4. Attendez la validation (quelques heures)

Note : Sans domaine personnalisé, les emails seront envoyés depuis "onboarding@resend.dev"

### Étape 4 : Ajouter la clé dans .env

```env
RESEND_API_KEY=re_votre_clé_api_ici
```

## 4. Tester la Configuration

### Test 1 : Vérifier la connexion à la base de données

Lancez l'application en mode développement :

```bash
npm run dev
```

Si vous voyez des erreurs liées à DATABASE_URL, vérifiez que la variable est bien configurée.

### Test 2 : Tester l'API Kiwi.com

1. Allez sur http://localhost:5000
2. Remplissez le formulaire de recherche
3. Sélectionnez quelques destinations
4. Cliquez sur "Voir les vols disponibles"

Si vous voyez des vols, l'API Kiwi fonctionne correctement.

### Test 3 : Tester les emails

1. Créez une recherche et sauvegardez-la
2. Vérifiez votre boîte mail pour l'email de bienvenue
3. Si vous ne recevez rien, vérifiez :
   - Votre clé API Resend
   - Les logs de l'application pour les erreurs
   - Votre dossier spam

## 5. Activer les Alertes Automatiques

Par défaut, le scheduler d'alertes est désactivé en développement.

### Pour activer en développement :

Dans votre `.env`, ajoutez :

```env
ENABLE_ALERTS=true
```

Le scheduler vérifiera les recherches actives toutes les 30 minutes en développement.

### En production :

Le scheduler s'active automatiquement et vérifie toutes les 6 heures.

## 6. Limites et Quotas

### Kiwi.com Tequila API

Le plan gratuit inclut généralement :
- 1000-2000 requêtes/mois
- Rate limit : 5-10 requêtes/seconde

L'application optimise les appels via :
- Cache de 1 heure
- Échantillonnage des dates (3 dates max)
- Limitation à 5 destinations par recherche

### Resend

Plan gratuit :
- 100 emails/jour
- 3000 emails/mois
- 1 domaine personnalisé

### Supabase

Inclus avec Replit :
- 500 MB de stockage
- Bande passante illimitée
- Connexions illimitées

## 7. Dépannage

### Erreur "DATABASE_URL is required"

Solution : Vérifiez que DATABASE_URL est bien dans votre `.env`

### Erreur "Kiwi API error (401)"

Solution : Votre clé API Kiwi.com est invalide ou expirée. Générez-en une nouvelle.

### Erreur "Error sending email"

Solutions :
- Vérifiez votre clé API Resend
- Vérifiez que l'email est valide
- Consultez les logs Resend pour plus de détails

### Les vols ne s'affichent pas

Solutions :
- Vérifiez votre clé API Kiwi.com
- Essayez d'augmenter le budget
- Vérifiez la distance maximale
- Regardez les logs du serveur pour les erreurs

## 8. Prochaines Étapes

Une fois que tout fonctionne :

1. Testez avec différentes recherches
2. Créez plusieurs recherches sauvegardées
3. Attendez les alertes automatiques (si activées)
4. Partagez l'application avec des testeurs
5. Collectez des retours utilisateurs

## Support

Pour toute question ou problème :
- Consultez les logs du serveur : `npm run dev`
- Vérifiez la console du navigateur (F12)
- Relisez ce guide de configuration
