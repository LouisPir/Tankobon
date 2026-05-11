# 📚 Manga Tracker

> Mobile app to track manga reading progress, chapters and personal reviews.

## 🛠️ Tech Stack

- **Frontend** : React Native (Expo)
- **Backend** : Supabase (PostgreSQL + REST API)
- **Language** : TypeScript
- **CI/CD** : GitHub Actions

## 📋 Features

- ✅ Track manga reading progress
- ✅ Save chapter advancement
- ✅ Add personal ratings and reviews
- ✅ Search through your manga list
- ✅ Add, edit and delete entries

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI
- A Supabase account

### Installation

```bash
# Clone the repository
git clone https://github.com/TON_USERNAME/manga-tracker.git
cd manga-tracker

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Fill in your Supabase credentials in .env

# Start the app
npx expo start
```

## 🗄️ Database Schema

*Coming soon*

## 📁 Project Structure

src/
├── components/     # Reusable components
├── screens/        # App screens
├── services/       # Supabase API calls
├── hooks/          # Custom hooks
├── navigation/     # Navigation config
└── types/          # TypeScript types

## 🔐 Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📌 Project Board

Toutes les tâches sont gérées via [GitHub Projects](../../projects).

## 📄 License

MIT
