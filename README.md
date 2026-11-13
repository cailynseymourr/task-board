# Task Board

A Kanban-style task board built for the Software Development internship assessment. Each visitor gets an anonymous guest account and sees only their own tasks.

**Live demo:** https://task-board-six-chi.vercel.app/
**Repository:** https://github.com/cailynseymourr/task-board

## Features

- Four columns: To Do, In Progress, In Review, Done
- Drag and drop between columns, saved to Supabase with an optimistic update and rollback on failure
- Create tasks with a title, and optionally a description, priority, and due date
- Anonymous guest sessions created automatically on first launch (Supabase Auth)
- Row Level Security so each guest can only read and write their own data
- **Due date indicators:** overdue (red), due within two days (amber), or a plain date. Done tasks are never flagged
- **Task comments:** click a card to open a detail panel with timestamped comments in chronological order
- Loading skeletons, error banners with retry, and empty states for every column
- Responsive layout with horizontal scrolling columns on mobile

## Tech stack

React (Vite), Supabase (Postgres, Auth, RLS), dnd-kit, deployed on Vercel.

## Run locally

Requires Node 18 or higher.

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/cailynseymourr/task-board.git
   cd task-board
   npm install
   ```
2. Create a free project at [supabase.com](https://supabase.com).
3. In Supabase, go to **Authentication → Sign In / Providers** and turn on **Allow anonymous sign-ins**.
4. In the **SQL Editor**, run the schema below.
5. Create a file named `.env.local` in the project root:
   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   ```
   Use only the public anon/publishable key. Never use the service role key.
6. Start the app:
   ```bash
   npm run dev
   ```
   Then open http://localhost:5173.

## Database schema

```sql
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo','in_progress','in_review','done')),
  priority text not null default 'normal'
    check (priority in ('low','normal','high')),
  due_date date,
  user_id uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

alter table tasks enable row level security;

create policy "own tasks" on tasks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  user_id uuid not null default auth.uid(),
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index comments_task_id_idx on comments (task_id, created_at);

alter table comments enable row level security;

create policy "own comments" on comments
  for all
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from tasks
      where tasks.id = comments.task_id
        and tasks.user_id = auth.uid()
    )
  );
```

## Security notes

- RLS is enabled on both tables, and `user_id` defaults to `auth.uid()` so it can't be spoofed from the client.
- The comments policy also checks that the parent task belongs to the user.
- Only the public anon/publishable key is used in the frontend. No secrets are committed (`.env.local` is gitignored).

## Project structure

```
src/
  App.jsx               board, data loading, drag handling
  supabaseClient.js     Supabase client
  useGuestSession.js    anonymous sign-in hook
  dateUtils.js          due date parsing and status
  constants.js          column definitions
  components/
    Column.jsx, TaskCard.jsx, AddTaskForm.jsx, TaskDetail.jsx
```

## Tradeoffs and future improvements

- Tasks can move between columns but can't yet be reordered within one.
- No editing or deleting of tasks, or real-time sync across tabs.
- No automated tests.
- Guest sessions are tied to the browser, so clearing site data starts a new guest.