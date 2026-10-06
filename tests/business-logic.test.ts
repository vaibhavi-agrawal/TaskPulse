import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { isUserOverloaded, getProjectWorkload, OVERLOADED_THRESHOLD } from "../src/services/workload.service";
import { createTask, updateTaskStatus, updateTask } from "../src/services/task.service";
import { prisma } from "../src/lib/prisma";

describe("Workload Balancing Business Rules", () => {
  it("should mark user as overloaded when IN_PROGRESS > 5", () => {
    expect(isUserOverloaded(6)).toBe(true);
    expect(isUserOverloaded(10)).toBe(true);
  });

  it("should NOT mark user as overloaded when IN_PROGRESS <= 5", () => {
    expect(isUserOverloaded(5)).toBe(false);
    expect(isUserOverloaded(4)).toBe(false);
    expect(isUserOverloaded(0)).toBe(false);
  });

  it("threshold should be exactly 5", () => {
    expect(OVERLOADED_THRESHOLD).toBe(5);
  });
});

describe("Backend Task & Project Workload Database Tests", () => {
  let testProjectId: string;
  let testMemberId: string;
  let nonMemberId: string;

  beforeAll(async () => {
    // Setup temporary test user & project
    const user = await prisma.user.create({
      data: {
        name: "Test Member",
        email: `test-${Date.now()}@test.io`,
      },
    });
    testMemberId = user.id;

    const nonUser = await prisma.user.create({
      data: {
        name: "Non Member",
        email: `non-${Date.now()}@test.io`,
      },
    });
    nonMemberId = nonUser.id;

    const project = await prisma.project.create({
      data: {
        name: "Test Project",
      },
    });
    testProjectId = project.id;

    await prisma.projectMember.create({
      data: {
        projectId: testProjectId,
        userId: testMemberId,
      },
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.task.deleteMany({ where: { projectId: testProjectId } });
    await prisma.projectMember.deleteMany({ where: { projectId: testProjectId } });
    await prisma.project.delete({ where: { id: testProjectId } }).catch(() => {});
    await prisma.user.delete({ where: { id: testMemberId } }).catch(() => {});
    await prisma.user.delete({ where: { id: nonMemberId } }).catch(() => {});
  });

  it("1. Creating a task successfully", async () => {
    const task = await createTask(testProjectId, {
      title: "Unit Test Task",
      status: "TODO",
      priority: "HIGH",
    });
    expect(task).toBeDefined();
    expect(task.title).toBe("Unit Test Task");
    expect(task.status).toBe("TODO");
  });

  it("2. Updating task status", async () => {
    const task = await createTask(testProjectId, {
      title: "Status Test Task",
      status: "TODO",
    });

    const updated = await updateTaskStatus(task.id, "IN_PROGRESS");
    expect(updated.status).toBe("IN_PROGRESS");
  });

  it("3. Assigning a task to a project member", async () => {
    const task = await createTask(testProjectId, {
      title: "Assignment Task",
      assignedUserId: testMemberId,
    });
    expect(task.assignedUserId).toBe(testMemberId);
  });

  it("4. Prevent assigning a task to a non-project member", async () => {
    await expect(
      createTask(testProjectId, {
        title: "Invalid Assignment Task",
        assignedUserId: nonMemberId,
      })
    ).rejects.toThrow("Assigned user is not a member of this project");
  });

  it("5. Workload calculation accurately detects overloaded > 5 in progress", async () => {
    // Create 6 IN_PROGRESS tasks for testMemberId
    for (let i = 0; i < 6; i++) {
      await createTask(testProjectId, {
        title: `Overload Task ${i}`,
        status: "IN_PROGRESS",
        assignedUserId: testMemberId,
      });
    }

    const workloadSummary = await getProjectWorkload(testProjectId);
    const memberWorkload = workloadSummary.membersWorkload.find(
      (m) => m.userId === testMemberId
    );

    expect(memberWorkload).toBeDefined();
    expect(memberWorkload!.inProgressCount).toBeGreaterThan(5);
    expect(memberWorkload!.overloaded).toBe(true);
  });
});
