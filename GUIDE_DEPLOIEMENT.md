# 🚀 Guide de déploiement — AM Transport 31

## Ce que tu vas avoir au final
- Une URL type `am-transport-31.vercel.app` accessible depuis n'importe quel téléphone ou PC
- Connexion sécurisée par email/mot de passe
- Données stockées en base (Supabase) — photos conservées indéfiniment
- Tout gratuit

---

## ÉTAPE 1 — Créer le projet Supabase (10 min)

1. Va sur **supabase.com** → "Start your project" → crée un compte gratuit
2. Clique **"New project"**
   - Organisation : crées-en une (ex: AM Transport)
   - Nom du projet : `am-transport-31`
   - Mot de passe base de données : génère-en un fort et **note-le**
   - Région : **West EU (Ireland)** — le plus proche
3. Attends ~2 min que le projet se crée

### Récupérer tes clés API
Dans ton projet Supabase → **Settings → API** :
- Copie **Project URL** (ex: `https://abcdefgh.supabase.co`)
- Copie **anon public key** (longue clé commençant par `eyJ...`)

### Créer les tables
1. Dans Supabase → **SQL Editor** → clic sur **"New query"**
2. Colle tout le contenu du fichier `supabase_schema.sql`
3. Clique **"Run"**
4. Tu dois voir "Success. No rows returned"

### Créer le bucket photos
1. Supabase → **Storage** → **"New bucket"**
2. Nom : `photos`
3. Coche **"Public bucket"** → Save
4. Clique sur le bucket `photos` → **Policies** → **"New policy"**
   - Template : "Give users access to only their own top level folder named as uid"
   - Applies to : INSERT, SELECT
   - Save

---

## ÉTAPE 2 — Configurer l'application (2 min)

Ouvre le fichier `src/js/supabase.js` et remplace :

```js
const SUPABASE_URL = 'https://XXXXXXXXXXXXXXXX.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXX';
```

Par tes vraies valeurs copiées à l'étape 1.

---

## ÉTAPE 3 — Déployer sur Vercel (5 min)

1. Va sur **github.com** → crée un compte si pas déjà fait
2. **"New repository"** → nom : `am-transport-31` → Public → Create
3. Sur ta machine (ou utilise l'interface web GitHub) :
   - Upload tous les fichiers du dossier `am-transport/`
   - Commit → Push

4. Va sur **vercel.com** → "Continue with GitHub" → autoriser
5. **"New Project"** → importe `am-transport-31`
6. Framework : **Other** (pas de framework)
7. Clique **Deploy**

✅ En 2 minutes tu as une URL publique type `am-transport-31.vercel.app`

---

## ÉTAPE 4 — Créer les comptes utilisateurs (5 min)

### Ton compte responsable
1. Supabase → **Authentication → Users** → **"Invite user"**
2. Email : ton email
3. Une fois créé, dans **SQL Editor** :
```sql
update public.profiles set role = 'manager', full_name = 'Jérôme L.'
where email = 'ton@email.com';
```

### Comptes chauffeurs
Pour chaque chauffeur :
1. Supabase → **Authentication → Users** → **"Invite user"**
2. Il reçoit un email avec un lien pour définir son mot de passe
3. Dans SQL Editor :
```sql
update public.profiles set role = 'driver', full_name = 'Prénom Nom'
where email = 'chauffeur@email.com';
```

---

## ÉTAPE 5 — Partager avec les chauffeurs

Envoie-leur simplement :
- L'URL : `https://am-transport-31.vercel.app`
- Leur email
- Leur mot de passe (qu'ils auront défini via l'email d'invitation)

Sur mobile, ils peuvent **ajouter l'appli à l'écran d'accueil** :
- iPhone : Safari → partager → "Sur l'écran d'accueil"
- Android : Chrome → menu (3 points) → "Ajouter à l'écran d'accueil"

L'appli se comporte alors comme une vraie appli installée 📱

---

## Structure des fichiers

```
am-transport/
├── index.html              ← point d'entrée
├── supabase_schema.sql     ← à coller dans Supabase SQL Editor
├── src/
│   ├── css/
│   │   └── app.css         ← tous les styles
│   └── js/
│       ├── supabase.js     ← ⚠️ à configurer avec tes clés
│       ├── auth.js         ← gestion connexion/session
│       ├── router.js       ← navigation entre écrans
│       ├── utils.js        ← fonctions utilitaires
│       ├── app.js          ← point d'entrée JS
│       └── pages/
│           ├── login.js    ← page de connexion
│           ├── manager.js  ← dashboard responsable
│           └── driver.js   ← interface chauffeur
```

---

## Fonctionnalités incluses

### Responsable
- ✅ Tableau de bord avec alertes du jour
- ✅ Suivi des chauffeurs (route, camion, télépéage, km, photos, statut)
- ✅ Planning semaine (ajout/modification par chauffeur et jour)
- ✅ Attributions véhicules du jour
- ✅ Historique complet des camions (qui / quand / km) avec filtre par plaque
- ✅ Badges télépéage (état actuel + historique des attributions)
- ✅ Galerie photos avec liens directs
- ✅ Rapport kilométrages 7 jours
- ✅ Administration des comptes

### Chauffeur
- ✅ Véhicule + badge télépéage + route visibles dès connexion
- ✅ Formulaire matin : km départ + photo camion + photo Mobilic
- ✅ Formulaire soir : km retour + photo camion + photo Mobilic
- ✅ Clôture de tournée en 2 étapes
- ✅ Planning personnel de la semaine

---

## Coût

| Service | Plan | Prix |
|---------|------|------|
| Supabase | Free | 0 €/mois |
| Vercel | Hobby | 0 €/mois |
| **Total** | | **0 €/mois** |

Limites gratuites largement suffisantes pour 50 chauffeurs :
- Supabase : 500 MB base de données, 1 GB stockage photos
- Vercel : 100 GB bande passante

---

## Questions fréquentes

**Les photos sont-elles conservées ?**
Oui, indefiniment dans Supabase Storage. Tu peux les télécharger à tout moment.

**L'appli marche sans internet ?**
Non, une connexion est nécessaire pour envoyer les données.

**Peut-on changer un mot de passe ?**
Oui, depuis Supabase → Authentication → Users → clic sur l'utilisateur.

**Comment personnaliser l'URL ?**
Dans Vercel → Settings → Domains → ajoute ton propre domaine si tu en as un.
