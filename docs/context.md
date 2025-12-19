# 📱 Habit Tracker App — Technical Context & Architecture

## 1. Overview

This document provides full technical and product context for a **habit tracking application** focused on:
- Extreme simplicity
- Zero friction when marking habits
- Daily usage
- Web + smartphone support

The goal is to build a **clean MVP** that is scalable, easy to maintain, and fast to iterate.

---

## 2. Product Vision

### Core Principles
- One-tap habit tracking
- Minimal UI, no unnecessary steps
- Fast load time
- Works offline (basic support)
- Focus on consistency, not complexity

### Target Platforms
- Web (desktop & mobile)
- Smartphone via PWA (installable)

---

## 3. MVP Scope

### Included
- User authentication (Google + email)
- Habit CRUD
- Daily habit completion tracking
- Weekly overview
- Streak calculation
- Basic statistics
- Responsive UI
- PWA support

### Explicitly Excluded (Future Versions)
- Push notifications
- Social features
- Gamification
- Health integrations
- Templates & routines
- Advanced analytics

---

## 4. High-Level Architecture
```
Frontend (Next.js + React)
│
├── UI (Client Components)
├── State Management (Zustand + React Query)
├── PWA (Service Worker + Manifest)
│
└── Supabase SDK Calls

Backend (Supabase)
│
├── Authentication (Google / Email)
├── PostgreSQL Database
├── Row Level Security (RLS)
├── Edge Functions (optional)
└── Realtime (optional)

```
Deployment:
- Frontend: Vercel
- Backend: Supabase

---

## 5. Tech Stack

### Frontend
- React
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui

### State & Data
- React Query (server state)
- Zustand (UI & local state)

### Backend
- Supabase
  - Auth
  - PostgreSQL
  - RLS
  - Edge Functions

### Mobile
- Progressive Web App (PWA)

---

## 6. Folder Structure (Next.js)
```
app/
  auth/
    login/
      page.tsx
    callback/
      page.tsx

  dashboard/
    page.tsx

  habits/
    page.tsx
    [id]/
      page.tsx

  api/
    habits/
      route.ts
    logs/
      route.ts

  components/
    HabitCard.tsx
    HabitList.tsx
    AddHabitModal.tsx
    CalendarGrid.tsx
    Header.tsx
    BottomNav.tsx

  hooks/
    useHabits.ts
    useHabitLogs.ts
    useAuth.ts

  store/
    ui.ts
    habits.ts

  lib/
    supabaseClient.ts
    auth.ts
    api.ts
    validators.ts
    constants.ts

  styles/
    globals.css

  public/
    manifest.json
    icons/

middleware.ts
```


---

## 7. Authentication & Security

### Authentication
- Supabase Auth
- Providers:
  - Google OAuth
  - Email + password

### Route Protection
- Next.js middleware to protect private routes:
  - `/dashboard`
  - `/habits`

### Security Model
- No user can access data that does not belong to them
- Enforced via PostgreSQL Row Level Security (RLS)

---

## 8. Database Schema

### `habits`
| Field | Type |
|------|------|
| id | uuid |
| user_id | uuid |
| title | text |
| icon | text |
| color | text |
| frequency | jsonb |
| created_at | timestamp |

### `habit_logs`
| Field | Type |
|------|------|
| id | uuid |
| habit_id | uuid |
| date | date |
| completed | boolean |

---

## 9. Row Level Security (RLS)

Example policy for `habits`:

```sql
CREATE POLICY "user can access own habits"
ON habits
USING (user_id = auth.uid());

```
Same logic applies to `habit_logs` via `habit_id`.

---

## 10. Data Access Strategy

### Preferred Method
- Direct Supabase SDK calls from the frontend
- Simpler, faster, less boilerplate

### API Routes (Next.js)
Used only when:
- Extra validation is required
- Combining multiple queries
- Business logic grows

### Edge Functions (Optional)
Future use cases:
- Daily streak calculations
- Scheduled jobs
- Notifications (future)

---

## 11. Core User Flows

### First Time User
1. Open app
2. Sign in with Google or email
3. Empty dashboard
4. CTA: **“Create your first habit”**

### Daily Usage
1. Open app
2. See today’s habits
3. One tap to mark as completed
4. Visual feedback (streak / progress)

---

## 12. State Management

### React Query
- Fetch habits
- Fetch daily logs
- Handle caching & revalidation
- Optimistic updates when marking habits

### Zustand
- UI state (modals, selected habit)
- Local habit state if needed

---

## 13. PWA Strategy

### Features
- Installable on mobile
- Cached UI
- Offline-first reading
- Sync when connection returns (future)

### Files
- `manifest.json`
- Service worker

---

## 14. Deployment

### Frontend
- Vercel
- Automatic deployments
- Preview environments

### Backend
- Supabase hosted services

---

## 15. MVP Deliverables
- Web app
- Google / email authentication
- Habit CRUD
- Daily & weekly views
- Streak tracking
- PWA support
- Clean, minimal UI

---

## 16. Guiding Constraints for AI

When assisting with this project:
- Prefer simplicity over abstraction
- Avoid overengineering
- Favor direct Supabase usage
- Keep UI minimal and fast
- Optimize for daily habit usage
- Assume MVP mindset
