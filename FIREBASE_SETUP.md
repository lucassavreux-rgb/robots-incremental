# 🔥 Configuration Firebase - Guide Rapide (10 minutes)

## Étape 1 : Créer un compte Firebase (2 minutes)

1. Va sur https://console.firebase.google.com/
2. Clique sur "Ajouter un projet" (ou "Add project")
3. Nom du projet : **"game-arcade"** (ou ce que tu veux)
4. Désactive Google Analytics (pas nécessaire)
5. Clique sur "Créer le projet"

---

## Étape 2 : Activer l'authentification (2 minutes)

1. Dans le menu de gauche, clique sur **"Authentication"**
2. Clique sur **"Get started"** ou **"Commencer"**
3. Va dans l'onglet **"Sign-in method"** (Méthode de connexion)
4. Clique sur **"Email/Password"** (Email/Mot de passe)
5. **Active** la première option (Email/Password)
6. Clique sur **"Enregistrer"**

---

## Étape 3 : Activer Realtime Database (2 minutes)

1. Dans le menu de gauche, clique sur **"Realtime Database"**
2. Clique sur **"Créer une base de données"**
3. Localisation : **Choisis le plus proche de toi** (ex: europe-west1)
4. Règles de sécurité : Choisis **"Mode test"** pour l'instant
5. Clique sur **"Activer"**

### ⚠️ Important : Modifier les règles de sécurité

Une fois la database créée, va dans l'onglet **"Règles"** et remplace tout par :

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "$uid === auth.uid || root.child('users').child(auth.uid).child('isAdmin').val() === true"
      }
    },
    "usernames": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "leaderboards": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

Clique sur **"Publier"**

---

## Étape 4 : Obtenir la configuration (3 minutes)

1. Clique sur l'icône **"Paramètres"** (⚙️) en haut à gauche
2. Clique sur **"Paramètres du projet"**
3. Scroll en bas jusqu'à **"Vos applications"**
4. Clique sur l'icône **Web** (</>) - "Ajouter une application"
5. Nom de l'app : **"Game Arcade Web"**
6. Ne coche PAS "Firebase Hosting"
7. Clique sur **"Enregistrer l'application"**

### 📋 Copier la configuration

Tu vas voir un bloc de code comme ça :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "game-arcade-xxxxx.firebaseapp.com",
  databaseURL: "https://game-arcade-xxxxx-default-rtdb.firebaseio.com",
  projectId: "game-arcade-xxxxx",
  storageBucket: "game-arcade-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

**COPIE TOUT ÇA !**

---

## Étape 5 : Configurer le jeu (1 minute)

1. Ouvre le fichier **`login.html`**
2. Cherche la ligne 219 (ou cherche "YOUR_API_KEY")
3. **REMPLACE** cette section :

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

Par **TA configuration** que tu viens de copier !

4. **SAUVEGARDE** le fichier

---

## Étape 6 : Créer ton compte admin (30 secondes)

1. Ouvre **`login.html`** dans ton navigateur
2. Clique sur **"Créer un compte"**
3. Pseudo : **Ton pseudo** (ex: "admin")
4. Mot de passe : **Ton mot de passe sécurisé**
5. Clique sur **"Créer mon compte"**

---

## Étape 7 : Te donner les droits admin (1 minute)

1. Retourne sur Firebase Console
2. Va dans **"Realtime Database"**
3. Tu verras ta structure de données :
   ```
   users/
     └─ [ton-user-id]/
         ├─ username: "ton-pseudo"
         ├─ isAdmin: false  ← Clique ici !
         └─ ...
   ```
4. Clique sur **`false`** à côté de **`isAdmin`**
5. Change en **`true`**
6. Clique sur la coche ✓

---

## ✅ C'est fini !

Teste en ouvrant **`login.html`** et connecte-toi !

---

## 🚨 Problèmes courants

### Erreur "Firebase not configured"
→ Tu n'as pas remplacé la config dans login.html

### Erreur "Permission denied"
→ Vérifie les règles de sécurité (Étape 3)

### Erreur "Network error"
→ Vérifie que Realtime Database est bien activé

### Je ne peux pas me connecter
→ Vérifie que l'authentification Email/Password est activée

---

## 📞 Besoin d'aide ?

Si tu es bloqué, envoie-moi :
1. Une capture d'écran de l'erreur
2. Le message exact dans la console (F12 → Console)
