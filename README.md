# SUPMAP - Interface Web avec Connexion Google et Authentification JWT

Ce projet est une interface web pour SUPMAP permettant aux utilisateurs de se connecter via un formulaire classique (email/mot de passe) ou via Google OAuth.

## Installation

### 1. Cloner le projet

```bash
git clone https://github.com/TON_REPO/supmap-client.git
cd supmap-client
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer l'application

```bash
npm start
```

L'application sera accessible sur `http://localhost:3000/`.

---

## Dépendances principales

- `react-router-dom` : Gestion des routes
- `axios` : Requêtes API
- `@react-oauth/google` : Connexion Google OAuth
- `express` : Backend API
- `passport` et `passport-google-oauth20` : Authentification Google
- `jsonwebtoken` : Gestion des tokens JWT
- `dotenv` : Gestion des variables d'environnement

---

## Fonctionnalités

- **Connexion avec email/mot de passe** : Formulaire classique qui envoie une requête à l'API `http://localhost:3000/api/users/login`.
- **Connexion avec Google** : Utilisation de `react-oauth/google` pour afficher un bouton Google et gérer l'authentification.
- **Stockage du token** : Le token JWT est sauvegardé dans `localStorage` après connexion.
- **Déconnexion** : Suppression du token et retour à la page de connexion.
- **Redirection vers /map après connexion**.

---

## Structure du projet

```
/supmap-client
│── /src
│   ├── /pages
│   │   ├── Login.js
│   │   ├── Map.js
│   ├── App.js
│   ├── index.js
│── package.json
│── README.md
```

---

## Backend - API Express

### 1. Cloner le projet backend

```bash
git clone https://github.com/TON_REPO/supmap-api.git
cd supmap-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` et ajouter :

```
PORT=3000
GOOGLE_CLIENT_ID="TON_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="TON_GOOGLE_CLIENT_SECRET"
GOOGLE_CALLBACK_URL="http://localhost:3000/api/users/auth/google/callback"
DATABASE_URL=postgresql://Supmap:niambe@localhost:5432/supmap
SECRET_KEY="MaSuperSecretKey"
```

### 4. Lancer le serveur

```bash
npm run dev
```

L'API sera accessible sur `http://localhost:3000/`.

---

## Routes Backend

- **Connexion classique** : `POST /api/users/login` (email & password)
- **Connexion avec Google** : `GET /api/users/auth/google`
- **Callback après connexion Google** : `GET /api/users/auth/google/callback`

---

## Gestion des branches

### Création d'une nouvelle branche

```bash
git checkout -b feature/nom-de-la-feature
```

### Pousser une branche

```bash
git push origin feature/nom-de-la-feature
```

### Faire une pull request

Une fois la feature développée, ouvrez une pull request sur GitHub pour relecture et validation.

---

## Auteur

**Ndiambe Gueye**

