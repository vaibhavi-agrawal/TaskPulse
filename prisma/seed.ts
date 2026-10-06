import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing data...");
  await prisma.task.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Creating users...");
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@taskpulse.io",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@taskpulse.io",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    },
  });

  const charlie = await prisma.user.create({
    data: {
      name: "Charlie Brown",
      email: "charlie@taskpulse.io",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    },
  });

  const diana = await prisma.user.create({
    data: {
      name: "Diana Prince",
      email: "diana@taskpulse.io",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    },
  });

  const evan = await prisma.user.create({
    data: {
      name: "Evan Wright",
      email: "evan@taskpulse.io",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
  });

  const fiona = await prisma.user.create({
    data: {
      name: "Fiona Gallagher",
      email: "fiona@taskpulse.io",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
  });

  console.log("Creating project...");
  const project = await prisma.project.create({
    data: {
      name: "TaskPulse Platform v1.0",
      description: "Next-gen collaborative Kanban board with automated workload balancing and team wellness alerts.",
    },
  });

  console.log("Adding members to project...");
  const users = [alice, bob, charlie, diana, evan, fiona];
  for (const user of users) {
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id,
        role: user.id === alice.id ? "LEAD" : "MEMBER",
      },
    });
  }

  console.log("Creating tasks with Alice having 6 In Progress tasks (OVERLOADED > 5)...");
  
  // Alice Tasks: 3 TODO, 6 IN_PROGRESS (triggers overloaded pulse!), 2 DONE
  const aliceTasks = [
    // 3 TODO
    { title: "Refactor auth middleware", description: "Standardize session token validation", status: "TODO", priority: "HIGH", daysDue: 2 },
    { title: "Configure Redis caching", description: "Speed up heavy dashboard aggregates", status: "TODO", priority: "MEDIUM", daysDue: 5 },
    { title: "Audit npm vulnerabilities", description: "Review and resolve security audit alerts", status: "TODO", priority: "LOW", daysDue: 7 },
    
    // 6 IN_PROGRESS -> OVERLOADED!
    { title: "Implement Stripe webhooks", description: "Listen for invoice.payment_succeeded events", status: "IN_PROGRESS", priority: "HIGH", daysDue: 1 },
    { title: "Database connection pooling", description: "Fine-tune pool sizing for high traffic spikes", status: "IN_PROGRESS", priority: "HIGH", daysDue: -1 }, // Overdue!
    { title: "Workload balancing calculation API", description: "Ensure server-side counting for Kanban boards", status: "IN_PROGRESS", priority: "HIGH", daysDue: 0 },
    { title: "Drag and drop Kanban events", description: "Wire dnd-kit drop handlers to PATCH status endpoints", status: "IN_PROGRESS", priority: "MEDIUM", daysDue: 2 },
    { title: "Real-time overloaded user badges", description: "Apply pulsing red CSS animation when >5 tasks active", status: "IN_PROGRESS", priority: "MEDIUM", daysDue: 3 },
    { title: "Add Zod schema validations", description: "Validate incoming request payloads at API boundary", status: "IN_PROGRESS", priority: "LOW", daysDue: 4 },
    
    // 2 DONE
    { title: "Initialize Next.js project", description: "Setup Next.js with Tailwind and TypeScript", status: "DONE", priority: "HIGH", daysDue: -3 },
    { title: "Setup Prisma schema models", description: "Define User, Project, ProjectMember, and Task entities", status: "DONE", priority: "HIGH", daysDue: -2 },
  ];

  for (const t of aliceTasks) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + t.daysDue);
    await prisma.task.create({
      data: {
        projectId: project.id,
        assignedUserId: alice.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate,
      },
    });
  }

  // Bob Tasks: 3 TODO, 2 IN_PROGRESS, 2 DONE
  const bobTasks = [
    { title: "Design Figma design system", description: "Create tokens for dark mode and Kanban cards", status: "TODO", priority: "MEDIUM", daysDue: 4 },
    { title: "Mobile responsive navbar", description: "Implement hamburger menu and responsive toolbar", status: "TODO", priority: "LOW", daysDue: 6 },
    { title: "Export board to CSV/JSON", description: "Allow project managers to backup task history", status: "TODO", priority: "LOW", daysDue: 8 },
    { title: "Priority badge color tokens", description: "Distinguish Low, Medium, and High priorities", status: "IN_PROGRESS", priority: "MEDIUM", daysDue: 1 },
    { title: "Empty column placeholder cards", description: "Show friendly empty state when column has 0 tasks", status: "IN_PROGRESS", priority: "LOW", daysDue: 3 },
    { title: "Setup Tailwind typography", description: "Load Inter font and configure base heading sizes", status: "DONE", priority: "LOW", daysDue: -4 },
    { title: "Icon set integration", description: "Import lucide-react icons for columns and status tags", status: "DONE", priority: "MEDIUM", daysDue: -2 },
  ];

  for (const t of bobTasks) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + t.daysDue);
    await prisma.task.create({
      data: {
        projectId: project.id,
        assignedUserId: bob.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate,
      },
    });
  }

  // Charlie Tasks: 2 TODO, 1 IN_PROGRESS, 1 DONE
  const charlieTasks = [
    { title: "E2E testing with Playwright", description: "Write automated tests for card drag-and-drop", status: "TODO", priority: "HIGH", daysDue: 3 },
    { title: "Add Docker Compose configuration", description: "Provide multi-container setup for Postgres & app", status: "TODO", priority: "MEDIUM", daysDue: 5 },
    { title: "Fix date-fns timezone shifts", description: "Format dates consistently across client locales", status: "IN_PROGRESS", priority: "MEDIUM", daysDue: 2 },
    { title: "Setup ESLint and Prettier", description: "Ensure clean code formatting across the repo", status: "DONE", priority: "LOW", daysDue: -5 },
  ];

  for (const t of charlieTasks) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + t.daysDue);
    await prisma.task.create({
      data: {
        projectId: project.id,
        assignedUserId: charlie.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate,
      },
    });
  }

  // Diana Tasks: 1 TODO, 1 IN_PROGRESS, 1 DONE
  const dianaTasks = [
    { title: "Write API documentation in README", description: "Document all REST endpoints and schemas", status: "TODO", priority: "HIGH", daysDue: 2 },
    { title: "Prepare Viva presentation slides", description: "Cover workload balancing architecture and tradeoffs", status: "IN_PROGRESS", priority: "HIGH", daysDue: 1 },
    { title: "Draft schema ER diagram", description: "Illustrate relational keys between Project, User, and Task", status: "DONE", priority: "MEDIUM", daysDue: -1 },
  ];

  for (const t of dianaTasks) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + t.daysDue);
    await prisma.task.create({
      data: {
        projectId: project.id,
        assignedUserId: diana.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate,
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
