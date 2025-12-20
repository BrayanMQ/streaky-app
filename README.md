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
   SUPABASE_PROJECT_ID=your_supabase_project_id
   ```
   
   **How to get your Supabase credentials:**
   - Go to your [Supabase Dashboard](https://app.supabase.com)
   - Select your project (or create a new one)
   - Navigate to **Settings** → **API**
   - Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the **anon public** key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the **Project ID** (found in the project URL or Settings → General) and paste it as `SUPABASE_PROJECT_ID`
   
   > **Note:** The `NEXT_PUBLIC_` prefix is required for these variables to be accessible in both server and client components in Next.js.

4. **Set up the database**
   
   Apply the database migrations using Supabase CLI:
   ```bash
   npx supabase db push
   ```
   
   This will apply all migrations from `supabase/migrations/` in chronological order. The migrations include:
   - `habits` table - Stores user habits
   - `habit_logs` table - Stores daily completion records
   - Indexes for query optimization
   - Constraints for data validation
   - Row Level Security (RLS) policies for data protection
   
   > **Alternative:** You can also run the SQL schema manually in Supabase SQL Editor. See `docs/database-schema.sql` for the complete schema.

5. **Generate TypeScript types** (Optional but recommended)
   
   After setting up your database schema, generate TypeScript types from your Supabase database:
   ```bash
   npm run generate:types
   ```
   
   This command uses the `SUPABASE_PROJECT_ID` environment variable from your `.env.local` file to generate type-safe database types in `types/database.ts`. Run this command whenever you make changes to your database schema.
   
   > **Note:** Make sure you have set `SUPABASE_PROJECT_ID` in your `.env.local` file before running this command.

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open your browser**
   
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
- `npm run generate:types` - Generate TypeScript types from Supabase database schema (requires `SUPABASE_PROJECT_ID` in `.env.local`)

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
   - Apply migrations using: `npx supabase db push`
   - Or manually run the schema from `docs/database-schema.sql` in SQL Editor
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
SUPABASE_PROJECT_ID=your_supabase_project_id
```

> **Note:** `SUPABASE_PROJECT_ID` is required for the `generate:types` script to automatically generate TypeScript types from your Supabase database schema.

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

## 🗄️ Database Migrations

The project uses Supabase migrations to manage database schema changes. Migrations are located in `supabase/migrations/` and are applied using:

```bash
npx supabase db push
```

Migrations are executed in chronological order based on their timestamp. Each migration is idempotent and can be safely re-run.

### Migration Structure

- `20251220100000_create_habits_table.sql` - Creates the habits table with indexes and constraints
- `20251220100001_create_habit_logs_table.sql` - Creates the habit_logs table with indexes
- `20251220100002_enable_rls.sql` - Enables Row Level Security on both tables
- `20251220100003_create_habits_rls_policies.sql` - RLS policies for habits table
- `20251220100004_create_habit_logs_rls_policies.sql` - RLS policies for habit_logs table

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
