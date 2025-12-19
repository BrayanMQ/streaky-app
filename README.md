# 🔥 Streaky - Habit Tracker App

A minimalist, fast, and user-friendly habit tracking application built with Next.js and Supabase. Focus on consistency, not complexity.

## 📱 About

Streaky is a Progressive Web App (PWA) designed for daily habit tracking with extreme simplicity and zero friction. The goal is to make tracking habits as easy as a single tap, encouraging daily consistency without overwhelming users with features.

### Core Principles

- ✨ **One-tap habit tracking** - Mark habits as complete with a single action
- 🎯 **Minimal UI** - No unnecessary steps or complexity
- ⚡ **Fast load time** - Optimized for quick access
- 📱 **Works offline** - Basic offline support via PWA
- 🔄 **Focus on consistency** - Track streaks and build lasting habits

## ✨ Features

### MVP Features

- 🔐 **Authentication** - Google OAuth and email/password login
- 📝 **Habit Management** - Create, edit, and delete habits
- ✅ **Daily Tracking** - Mark habits as completed each day
- 🔥 **Streak Calculation** - Track consecutive days of completion
- 📊 **Basic Statistics** - View completion rates and progress
- 📅 **Calendar View** - Visual representation of habit completion
- 📱 **PWA Support** - Installable on mobile devices
- 🎨 **Responsive Design** - Works seamlessly on desktop and mobile

### Coming Soon (Future Versions)

- Push notifications
- Social features
- Gamification
- Health integrations
- Templates & routines
- Advanced analytics

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - UI component library

### State Management
- **React Query** - Server state management
- **Zustand** - UI and local state

### Backend
- **Supabase** - Backend as a Service
  - Authentication (Google OAuth + Email)
  - PostgreSQL Database
  - Row Level Security (RLS)
  - Edge Functions (optional)

### Mobile
- **Progressive Web App (PWA)** - Installable on mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account ([sign up here](https://supabase.com))
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/BrayanMQ/streaky-app.git
   cd streaky-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and replace the placeholder values with your actual Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   **How to get your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project (or create a new one)
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the **anon public** key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
   > **Note:** The `NEXT_PUBLIC_` prefix is required for these variables to be accessible in both server and client components in Next.js.

4. **Set up the database**
   
   Run the SQL schema in your Supabase SQL Editor. See `docs/database-schema.sql` for the complete schema.
   
   The schema includes:
   - `habits` table - Stores user habits
   - `habit_logs` table - Stores daily completion records
   - Row Level Security (RLS) policies for data protection

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
streaky-app/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── callback/      # OAuth callback
│   ├── dashboard/         # Dashboard page
│   ├── habits/            # Habits management pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── HabitCard.tsx
│   ├── HabitList.tsx
│   ├── AddHabitModal.tsx
│   ├── CalendarGrid.tsx
│   ├── Header.tsx
│   └── BottomNav.tsx
├── hooks/                 # Custom React hooks
│   ├── useHabits.ts
│   ├── useHabitLogs.ts
│   └── useAuth.ts
├── lib/                   # Utility functions
│   ├── supabaseClient.ts
│   ├── auth.ts
│   ├── streaks.ts
│   └── stats.ts
├── store/                 # Zustand stores
│   ├── ui.ts
│   └── habits.ts
├── public/                # Static assets
│   ├── manifest.json      # PWA manifest
│   └── icons/             # App icons
├── docs/                  # Documentation
│   └── context.md         # Technical context
├── issues/                # Development issues/tasks
└── scripts/               # Utility scripts
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Supabase Setup

1. **Create a Supabase project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project

2. **Configure Authentication**
   - Go to Authentication → Providers
   - Enable Email provider
   - Enable Google OAuth (requires OAuth credentials)

3. **Set up the database**
   - Go to SQL Editor
   - Run the schema from `docs/database-schema.sql`
   - Verify RLS policies are enabled

4. **Get your credentials**
   - Go to Settings → API
   - Copy Project URL and anon key to `.env.local`
   - Make sure to use the `NEXT_PUBLIC_` prefix for both variables

### Environment Variables

**Required environment variables:**

The project uses `NEXT_PUBLIC_` prefixed variables so they work in both Server and Client Components:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Why `NEXT_PUBLIC_`?** In Next.js, only environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Since our Supabase client (`lib/supabaseClient.ts`) is used in both Server and Client Components, we use this prefix to ensure it works everywhere.

**Optional (for production):**

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Using the Supabase Client

The Supabase client is configured in `lib/supabaseClient.ts` and can be used in both Server and Client Components:

```tsx
// In a Server Component
import { supabase } from '@/lib/supabaseClient'

// In a Client Component
'use client'
import { supabase } from '@/lib/supabaseClient'
```

The client automatically validates that the required environment variables are set and will throw helpful error messages if they're missing.

## 🧩 Development

### Code Style

- TypeScript strict mode enabled
- ESLint configured with Next.js rules
- Prefer functional components with hooks
- Use TypeScript for type safety

### State Management Guidelines

- **React Query**: Use for all server state (API calls, Supabase queries)
- **Zustand**: Use for UI state (modals, selected items, local preferences)
- **Local State**: Use `useState` for component-specific state

## 📚 Documentation

- [Technical Context](./docs/context.md) - Full technical documentation
- [Supabase Docs](https://supabase.com/docs) - Supabase documentation
- [Next.js Docs](https://nextjs.org/docs) - Next.js documentation

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Backend powered by [Supabase](https://supabase.com)
- UI components from [shadcn/ui](https://ui.shadcn.com)

---

**Made with ❤️ for building better habits**
