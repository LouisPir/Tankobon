# 🌸 Tankobon

> Track your manga, anime, movies and more — all in one place.

<p align="center">
  <img src="./assets/icon.png" width="120" alt="Tankobon icon" />
</p>

---

## ✨ Features

- 📚 **Multi-type lists** — manga, anime, film, series, video games, books, music, board games
- 📖 **Track your progress** — chapters, episodes, hours played, pages read
- ⭐ **Rate & review** — personal ratings and reviews for each entry
- 🔍 **Search & filters** — filter by status, rating, type and sort by any field
- 🔒 **Password protection** — lock sensitive lists
- 📤 **Import / Export** — JSON format, single list or all at once
- 📊 **Statistics** — global and per-list stats with charts
- 🏆 **Achievements** — 29 achievements across 7 categories, grades from Bronze to Mythic
- 👤 **User profiles** — username, avatar, grade and global stats
- 👥 **Friends** — add friends, view their profile and achievements
- 🔗 **List sharing** — share lists in read-only mode, copy shared lists
- 🔔 **Notifications** — badge for pending friend requests and shared lists
- 🎨 **4 themes** — Sakura 🌸, Water Ninja 💧, Spicy 🌶️, Starry Night ✨
- 🌍 **8 languages** — FR, EN, ES, DE, IT, PT, NL, JA
- 🎟️ **Referral system** — invite-only after 20,000 users
- 👤 **Account management** — change email, password, delete account

---

## 🛠️ Tech Stack

| Layer    | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React Native (Expo)                |
| Backend  | Supabase (PostgreSQL + Auth + RLS) |
| Language | TypeScript (strict)                |
| Storage  | expo-secure-store                  |
| CI/CD    | GitHub Actions                     |
| Build    | EAS Build                          |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A Supabase account → [supabase.com](https://supabase.com)
- Expo Go on your phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779))

### Installation

```bash
# Clone the repository
git clone https://github.com/LouisPir/Tankobon.git
cd Tankobon

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

Open `.env` and fill in your Supabase credentials:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Start the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

> 📖 For the complete Supabase setup (tables, RLS, triggers, Edge Functions), see the [Wiki](../../wiki).

---

## 📁 Project Structure

```bash
src/
├── config/         # Theme, list types and achievements config
├── components/     # Shared components (ThemeBackground, AchievementToast)
├── context/        # React contexts (Theme, Language, AchievementToast)
│   ├── themes/     # One file per theme
│   └── languages/  # One file per language (fr default, en/es/de/it/pt/nl/ja)
├── hooks/          # Custom hooks
├── navigation/     # State-based navigation with Android back button support
├── screens/        # App screens
└── services/       # Supabase API calls
```

---

## 🗄️ Database Schema

```bash
auth.users
└── profiles          (id, username, avatar, referral_code, referred_by, export_count, created_at)
lists                 (id, user_id, name, type, description, password_hash, created_at)
└── entries           (id, user_id, list_id, title, status, current_chapter, current_season, rating, review, created_at)
user_achievements     (id, user_id, achievement_id, unlocked_at)
friend_requests       (id, sender_id, receiver_id, status, seen_by_sender, created_at)
shared_lists          (id, list_id, owner_id, shared_with_id, seen, created_at)
```

---

## 🔐 Environment Variables

| Variable                        | Description               |
| ------------------------------- | ------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`      | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key    |

---

## 📦 Build

To generate an Android APK:

```bash
eas build --profile preview --platform android
```

> See the [Build & Deploy](../../wiki/Build-&-Deploy) wiki page for details.

---

## 🗺️ Roadmap

| Version | Status | Description                        |
| ------- | ------ | ---------------------------------- |
| v0.3.0  | ✅     | Import / Export JSON               |
| v0.4.0  | ✅     | Settings screen                    |
| v0.5.0  | ✅     | Referral system + i18n refactor    |
| v1.0.0  | ✅     | Stable release + EAS Build         |
| v1.1.0  | ✅     | List types (manga, anime, film...) |
| v1.2.0  | ✅     | Sort & filters                     |
| v1.3.0  | ✅     | Dashboard stats                    |
| v1.4.0  | ✅     | Achievement system & grades        |
| v2.0.0  | ✅     | Grand release                      |
| v2.1.0  | ✅     | User profiles                      |
| v2.2.0  | ✅     | Friends & sharing                  |
| v3.0.0  | ✅     | Social grand release               |

---

## 📄 License

MIT — Louis Pirot
