# TaskPulse — Kanban Task Management & Workload Balancing

TaskPulse is a full-stack collaborative Kanban task management application designed for personal and team productivity. It provides interactive task organization across customizable workflow stages while enforcing **server-side workload balancing** to prevent team burnout.

---

## 📋 Problem Statement & Purpose

In fast-paced engineering teams, Kanban boards often suffer from task overloading in the "In Progress" column. When engineers take on too many simultaneous tasks, context switching increases and throughput declines. 

**TaskPulse** solves this by:
1. Providing an intuitive Kanban dashboard for managing tasks across **To-Do**, **In Progress**, and **Done** states.
2. Enforcing a **server-side Workload Balancing rule** where the backend monitors each team member's active tasks and flags overloaded members (`inProgressCount > 5`) with a pulsing red visual alert.
3. Guaranteeing relational data integrity (Projects, Users, Members, Tasks) and rejecting invalid assignments at the API boundary.

---

## ✨ Implemented Features

1. **Three-Column Kanban Board**:
   - **To-Do**, **In Progress**, and **Done** columns.
   - Column headers display live task count pills (e.g., `To-Do (4)`, `In Progress (7)`, `Done (12)`).
   - Real drag-and-drop between columns powered by `@dnd-kit`.
   - Empty column states with quick task creation actions.

2. **Complete Task Lifecycle (CRUD)**:
   - **Create**: Add new tasks with title, description, priority, due date, status, and assigned member.
   - **Read**: View task cards with title, description snippet, priority badges, formatted due date, overdue badges, and assignee avatar/name.
   - **Update**: Edit task details through a responsive modal dialog.
   - **Delete**: Safe task deletion with a confirmation prompt.
   - **Status Move**: Drag-and-drop or status selector moves tasks and triggers optimistic UI updates with backend persistence.

3. **Special Workload Balancing ("Vibe Check")**:
   - **Team Capacity Section**: Displays each project member's avatar, name, and current In Progress task count.
   - **The >5 In Progress Rule**:
     - The calculation is executed exclusively on the server (`workload.service.ts`).
     - Rule: `overloaded = inProgressCount > 5`.
     - When `overloaded` is true, the member's avatar background pulses red using CSS keyframes (`@keyframes pulse-red`) and displays an overload warning badge.
     - Moving a task out of `IN_PROGRESS` (reducing count to 5 or fewer) automatically clears the warning without page reload.
   - The frontend never computes this business rule independently—it consumes the API evaluation.

4. **Project Membership & Assignment Validation**:
   - Relational `ProjectMember` junction table linking Projects and Users.
   - "Add Member" modal allowing existing users to join the current project.
   - **Server-Side Security**: The backend validates that tasks can **only** be assigned to active members of that project, rejecting invalid assignments with HTTP 400.

5. **Filtering & Search**:
   - **Priority Filter**: Toggle between `All`, `Low`, `Medium`, and `High` priority tasks.
   - **Search Filter**: Search tasks by title or description text in real time.
   - **Member Filter**: Click any team member card to isolate their assigned tasks.

6. **Automated Test Suite**:
   - Comprehensive test suite covering task creation, status updates, assignment validation, and workload calculations (`tests/business-logic.test.ts`).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React icons.
- **Drag & Drop**: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`.
- **Backend**: Next.js Route Handlers (`/api/...`), TypeScript.
- **Database & ORM**: PostgreSQL schema & migrations (`prisma/schema.postgresql.prisma`), Prisma ORM (v5.22.0) with turnkey SQLite engine (`prisma/schema.prisma`) for zero-dependency local execution.
- **Validation**: Zod schema validation on API request boundaries.
- **Testing**: Vitest (Node environment).

---

## 🏛️ Project Structure

```text
TaskPulse/
├── prisma/
│   ├── migrations/
│   │   └── 0_init/
│   │       └── migration.sql       # PostgreSQL DDL migration
│   ├── schema.prisma               # Local database schema (SQLite)
│   ├── schema.postgresql.prisma    # PostgreSQL production schema with native enums
│   └── seed.ts                     # Database seed script with overloaded scenario
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── route.ts                 # GET /api/projects, POST /api/projects
│   │   │   │   └── [projectId]/
│   │   │   │       ├── route.ts             # GET, PUT, DELETE /api/projects/[projectId]
│   │   │   │       ├── members/route.ts     # GET, POST /api/projects/[projectId]/members
│   │   │   │       ├── tasks/route.ts       # GET, POST /api/projects/[projectId]/tasks
│   │   │   │       └── workload/route.ts    # GET /api/projects/[projectId]/workload
│   │   │   ├── tasks/
│   │   │   │   └── [taskId]/
│   │   │   │       ├── route.ts             # GET, PUT, DELETE /api/tasks/[taskId]
│   │   │   │       └── status/route.ts      # PATCH /api/tasks/[taskId]/status
│   │   │   └── users/
│   │   │       └── route.ts                 # GET /api/users
│   │   ├── globals.css                      # Global Tailwind styles & @keyframes pulse-red
│   │   ├── layout.tsx                       # Root layout
│   │   └── page.tsx                         # Dashboard Kanban interface
│   ├── components/
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx              # Drag-and-drop context & layout
│   │   │   ├── KanbanColumn.tsx             # Column with count pills & drop target
│   │   │   └── TaskCard.tsx                 # Draggable task card with priority/due date
│   │   ├── layout/
│   │   │   └── Navbar.tsx                   # Navbar with project selector & filters
│   │   ├── tasks/
│   │   │   └── TaskModal.tsx                # Create and edit task modal
│   │   └── team/
│   │       ├── AddMemberModal.tsx           # Add member dialog
│   │       └── TeamMembersSection.tsx       # Member avatars with pulsing red overload
│   ├── lib/
│   │   ├── api.ts                           # Client API abstraction
│   │   ├── prisma.ts                        # Prisma client instance
│   │   └── validations.ts                   # Zod schemas for validation
│   ├── services/
│   │   ├── project.service.ts               # Project business logic
│   │   ├── task.service.ts                  # Task CRUD & membership check logic
│   │   └── workload.service.ts              # Workload balancing & overload logic
│   └── types/
│       └── index.ts                         # Shared TypeScript interfaces
├── tests/
│   └── business-logic.test.ts               # Vitest test suite
├── .env.example                             # Environment variable template
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vitest.config.ts
```

---

## 🗄️ Database Schema & Relationships

### Entities

1. **User** (`users` table):
   - `id`: String (UUID, PK)
   - `name`: String
   - `email`: String (Unique)
   - `avatar`: String (Optional URL)
   - `createdAt`, `updatedAt`: DateTime

2. **Project** (`projects` table):
   - `id`: String (UUID, PK)
   - `name`: String
   - `description`: String (Optional)
   - `createdAt`, `updatedAt`: DateTime

3. **ProjectMember** (`project_members` table):
   - `id`: String (UUID, PK)
   - `projectId`: Foreign Key -> `projects.id` (`onDelete: Cascade`)
   - `userId`: Foreign Key -> `users.id` (`onDelete: Cascade`)
   - `role`: String (Default: `"MEMBER"`)
   - Unique Constraint: `[projectId, userId]`

4. **Task** (`tasks` table):
   - `id`: String (UUID, PK)
   - `projectId`: Foreign Key -> `projects.id` (`onDelete: Cascade`)
   - `title`: String
   - `description`: String (Optional)
   - `status`: String/Enum (`"TODO"`, `"IN_PROGRESS"`, `"DONE"`)
   - `priority`: String/Enum (`"LOW"`, `"MEDIUM"`, `"HIGH"`)
   - `dueDate`: DateTime (Optional)
   - `assignedUserId`: Foreign Key -> `users.id` (`onDelete: SetNull`)
   - `createdAt`, `updatedAt`: DateTime

### Indexes
- `Task.projectId`
- `Task.assignedUserId`
- `Task.status`
- `ProjectMember.projectId`
- `ProjectMember.userId`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/projects` | List all projects with task and member counts |
| `POST` | `/api/projects` | Create a new project (validated with Zod) |
| `GET` | `/api/projects/[projectId]` | Get project details, members, and tasks |
| `PUT` | `/api/projects/[projectId]` | Update project metadata |
| `DELETE` | `/api/projects/[projectId]` | Delete project (cascades tasks and members) |
| `GET` | `/api/projects/[projectId]/tasks` | Get project tasks (supports `?priority=LOW\|MEDIUM\|HIGH`) |
| `POST` | `/api/projects/[projectId]/tasks` | Create task (validates member assignment) |
| `GET` | `/api/tasks/[taskId]` | Get single task details |
| `PUT` | `/api/tasks/[taskId]` | Update task details |
| `DELETE` | `/api/tasks/[taskId]` | Delete a task |
| `PATCH` | `/api/tasks/[taskId]/status` | Update task column/status during drag-and-drop |
| `GET` | `/api/projects/[projectId]/members` | List members of a project |
| `POST` | `/api/projects/[projectId]/members` | Add member to project |
| `GET` | `/api/projects/[projectId]/workload` | Returns column counts, member tasks, and `overloaded` boolean |
| `GET` | `/api/users` | List all system users for member selection |

---

## ⚖️ Workload Balancing Business Logic

The workload rule is implemented in `src/services/workload.service.ts`:

```typescript
export const OVERLOADED_THRESHOLD = 5;

export function isUserOverloaded(inProgressCount: number): boolean {
  return inProgressCount > OVERLOADED_THRESHOLD;
}
```

When `/api/projects/[projectId]/workload` is called:
1. The server loads all tasks and members associated with the project.
2. It tallies each member's assigned tasks by status (`TODO`, `IN_PROGRESS`, `DONE`).
3. For every member, it evaluates `overloaded = inProgressCount > 5`.
4. The JSON response returns:
   ```json
   {
     "userId": "8eb59c07-...",
     "name": "Alice Johnson",
     "inProgressCount": 6,
     "overloaded": true
   }
   ```
5. In the UI, any member with `overloaded: true` triggers:
   ```css
   @keyframes pulse-red {
     0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8); }
     50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
   }
   ```
   accompanied by an alert badge.

---

## 🚀 Setup & How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhavi-agrawal/TaskPulse.git
cd TaskPulse
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create `.env` based on `.env.example`:
```bash
cp .env.example .env
```

Content:
```env
# Ready out of the box (SQLite):
DATABASE_URL="file:./dev.db"

# Or configure PostgreSQL:
# DATABASE_URL="postgresql://user:password@localhost:5432/taskpulse"
```

### 4. Database Setup & Prisma Generation
```bash
npx prisma db push
```
*(For PostgreSQL deployment, use `npx prisma db push --schema=prisma/schema.postgresql.prisma` or run `npx prisma migrate dev`)*.

### 5. Seed Demo Data
```bash
npm run db:seed
```
*Seeds 1 project, 6 team members, and 26 tasks. Alice Johnson is seeded with 6 `IN_PROGRESS` tasks to demonstrate the overloaded pulsing red avatar immediately.*

### 6. Run the Automated Tests
```bash
npm test
```

### 7. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Verification

Run the test suite using Vitest:
```bash
npm test
```
The tests verify:
1. `isUserOverloaded` returns `true` when `inProgressCount > 5`.
2. `isUserOverloaded` returns `false` when `inProgressCount <= 5`.
3. Task creation succeeds with valid inputs.
4. Task status transitions update properly.
5. Task assignment to a project member succeeds.
6. Assigning a task to a non-project member is rejected with an error.
7. End-to-end database workload aggregation flags overloaded users accurately.

---

## 🔮 Future Improvements (Roadmap)
- WebSockets / Server-Sent Events (SSE) for multi-user live board synchronization.
- Role-based permissions (Project Admin vs Member).
- Column customization (adding custom stages beyond the default three).
- Task attachments and rich Markdown editor in task descriptions.
