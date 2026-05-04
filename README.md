# 📸 Momento — Collaborative Album App

## 🧠 Overview

**Momento** is a collaborative album application built with React Native (Expo) that allows multiple users to create, share, and contribute to albums for events and memories.

Unlike simple photo storage apps, Momento focuses on **shared experiences**, where users can collectively build and view albums in real time.

---

## 🚀 Features (MVP)

### 🔐 Authentication

* User sign up (Email/Password)
* User login
* Persistent authentication state

### 📁 Albums

* Create albums
* View owned albums
* View shared albums
* Album details (title, description, metadata)

### 👥 Collaboration

* Invite users to albums
* Role-based access:

  * Owner
  * Contributor
  * Viewer

### 🖼️ Gallery (Mock Implementation)

* Add photos using image URLs
* View photos inside albums
* Basic gallery display

---

## 🏗️ Tech Stack

* **React Native (Expo)**
* **TypeScript**
* **Expo Router** (navigation)
* **Firebase Authentication**
* **Cloud Firestore**
* *(Firebase Storage planned for future version)*

---

## 📁 Project Structure

```
momento/
│
├── app/                  # Screens (Expo Router)
│   ├── (auth)/           # Login & Signup
│   ├── (tabs)/           # Main app screens
│   └── _layout.tsx       # Navigation layout
│
├── src/                  # Core logic
│   ├── components/
│   ├── services/
│   │   └── firebase/
│   │       ├── config.ts
│   │       ├── auth.ts
│   │       └── albums.ts
│   ├── hooks/
│   ├── utils/
│   └── types/
│
├── assets/
├── constants/
└── scripts/
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/your-username/momento.git
cd momento
```

### 2. Install dependencies

```
npm install
```

### 3. Start the development server

```
npx expo start
```

### 4. Download the application Expo on App Store / Google PlayStore

```
Scan the QR Code generated after 'npx expo start'
```

---

## 🔥 Firebase Setup

1. Create a Firebase project
2. Enable:

   * Authentication (Email/Password)
   * Firestore Database
3. Add your Firebase config in:

```
src/services/firebase/config.ts
```

---

## 📌 Current Limitations

* No real image uploads (uses URL placeholders)
* No push notifications
* No offline support
* Basic UI (focus is functionality)

---

## 🧭 Roadmap

### ✅ Version 1 (MVP)

* Auth
* Albums
* Collaboration
* Mock gallery

### 🔄 Version 2

* Timeline view
* Reactions / favorites
* Album themes

### 🚀 Version 3

* Firebase Storage (real uploads)
* Memory recap / slideshow
* Highlight generation

---

## 👥 Team Roles (Suggested)

* Auth & User Management
* Album System
* Upload / Gallery
* UI / UX
* Collaboration & Permissions

---

## 🎯 Goal

To build a platform where users can:

> “Capture, share, and relive moments together — not alone.”

---

## 📄 License

This project is for academic purposes.
