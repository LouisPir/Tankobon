# 📚 Tankobon

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
- Expo Go app on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

---

## ☁️ Supabase Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in with GitHub
2. Click **New project**
3. Fill in the project name and choose a region close to you
4. Save your database password somewhere safe
5. Wait for the project to initialize (~2 minutes)

### 2. Create the mangas table

In your Supabase dashboard, go to **Table Editor → New table** and create a table named `mangas` with the following columns:

| Column | Type | Default | Required |
|---|---|---|---|
| id | uuid | gen_random_uuid() | ✅ (Primary Key) |
| user_id | uuid | — | ✅ |
| title | text | — | ✅ |
| status | text | ongoing | ✅ |
| current_chapter | int4 | 0 | ✅ |
| rating | int4 | — | ❌ |
| review | text | — | ❌ |
| created_at | timestamptz | now() | ✅ |

Enable **Row Level Security (RLS)** on the table.

### 3. Configure RLS policies

In **Authentication → Policies**, create the following 4 policies for the `mangas` table :

|             Policy name           |  Command  |       Expression       |
|-----------------------------------|-----------|------------------------|
| Users can view their own mangas   |  SELECT   | `auth.uid() = user_id` |
| Users can insert their own mangas |  INSERT   | `auth.uid() = user_id` |
| Users can update their own mangas |  UPDATE   | `auth.uid() = user_id` |
| Users can delete their own mangas |  DELETE   | `auth.uid() = user_id` |

### 4. Get your API keys

In **Settings → API**, copy:
- **Project URL**
- **Publishable (anon) key**

---

## 💻 Installation

### 1. Clone and install

```bash
# Clone the repository
git clone https://github.com/LouisPir/manga-tracker.git
cd manga-tracker

# Install dependencies
npm install
```

### 2. Configure environment variables

```bash
# Copy the example file
cp .env.example .env
```

Open the `.env` file and fill in your Supabase credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Start the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

---

## 🗄️ Database Schema
```bash
mangas
├── id              uuid (PK)
├── user_id         uuid (FK → auth.users)
├── title           text
├── status          text (ongoing | completed | dropped)
├── current_chapter int4
├── rating          int4 (nullable, 1-5)
├── review          text (nullable)
└── created_at      timestamptz
```
## 📁 Project Structure
```bash
src/
├── components/     # Reusable components
├── screens/        # App screens
├── services/       # Supabase API calls
├── hooks/          # Custom hooks
├── navigation/     # Navigation config
└── types/          # TypeScript types
```
## 🔐 Environment Variables

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📌 Project Board

Toutes les tâches sont gérées via [GitHub Projects](../../projects).

## 📄 License

MIT
