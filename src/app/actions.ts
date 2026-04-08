"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createId,
  now,
  readDB,
  updateDB,
  type Role,
  type TaskStatus,
} from "@/lib/store";
import { createSession, clearSession, hashPassword, verifyPassword, requireUser } from "@/lib/auth";

const usernameSchema = z
  .string()
  .min(3)
  .max(24)
  .regex(/^[a-zA-Z0-9_-]+$/);

const passwordSchema = z.string().min(6).max(64);

const roleSchema = z.enum(["dom", "sub", "neutral"]);

const titleSchema = z.string().min(2).max(24);

export async function signUp(formData: FormData) {
  const parsed = z
    .object({
      username: usernameSchema,
      password: passwordSchema,
      role: roleSchema,
    })
    .safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
      role: formData.get("role") || "neutral",
    });

  if (!parsed.success) {
    redirect("/auth?error=invalid");
  }

  const { username, password, role } = parsed.data;
  const db = await readDB();
  if (db.users.some((user) => user.username === username)) {
    redirect("/auth?error=exists");
  }

  const passwordHash = await hashPassword(password);
  const userId = createId();

  await updateDB((store) => {
    store.users.push({
      id: userId,
      username,
      passwordHash,
      isAnonymous: false,
      role: role as Role,
      title: null,
      xp: 0,
      reputation: 0,
      stains: 0,
      createdAt: now(),
    });
  });

  await createSession(userId);
  redirect("/app");
}

export async function signIn(formData: FormData) {
  const parsed = z
    .object({
      username: usernameSchema,
      password: passwordSchema,
    })
    .safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });

  if (!parsed.success) {
    redirect("/auth?error=invalid");
  }

  const { username, password } = parsed.data;
  const db = await readDB();
  const user = db.users.find((item) => item.username === username);
  if (!user || !user.passwordHash) {
    redirect("/auth?error=invalid");
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    redirect("/auth?error=invalid");
  }

  await createSession(user.id);
  redirect("/app");
}

export async function createGuest(formData: FormData) {
  const parsed = z
    .object({
      role: roleSchema,
    })
    .safeParse({
      role: formData.get("role") || "neutral",
    });

  if (!parsed.success) {
    redirect("/auth?error=invalid");
  }

  const guestId = createId();
  const db = await readDB();
  let username = `guest-${Math.floor(Math.random() * 9000 + 1000)}`;
  let attempts = 0;
  while (db.users.some((item) => item.username === username) && attempts < 5) {
    username = `guest-${Math.floor(Math.random() * 9000 + 1000)}`;
    attempts += 1;
  }

  await updateDB((store) => {
    store.users.push({
      id: guestId,
      username,
      passwordHash: null,
      isAnonymous: true,
      role: parsed.data.role as Role,
      title: null,
      xp: 0,
      reputation: 0,
      stains: 0,
      createdAt: now(),
    });
  });

  await createSession(guestId);
  redirect("/app");
}

export async function signOut() {
  await clearSession();
  redirect("/auth");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      role: roleSchema,
      title: titleSchema.optional(),
    })
    .safeParse({
      role: formData.get("role"),
      title: formData.get("title") || undefined,
    });

  if (!parsed.success) {
    redirect("/app?error=profile");
  }

  await updateDB((db) => {
    const target = db.users.find((item) => item.id === user.id);
    if (!target) return;
    target.role = parsed.data.role as Role;
    target.title = parsed.data.title || null;
  });

  revalidatePath("/app");
}

export async function saveConsent(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      hardLimits: z.string().min(2).max(400),
      softLimits: z.string().min(2).max(400),
      intensity: z.coerce.number().min(1).max(10),
      aftercareNotes: z.string().max(400).optional(),
      safewordConfirmed: z.string().optional(),
    })
    .safeParse({
      hardLimits: formData.get("hardLimits"),
      softLimits: formData.get("softLimits"),
      intensity: formData.get("intensity"),
      aftercareNotes: formData.get("aftercareNotes") || undefined,
      safewordConfirmed: formData.get("safewordConfirmed") || undefined,
    });

  if (!parsed.success) {
    redirect("/app?error=consent");
  }

  await updateDB((db) => {
    const existing = db.consentProfiles.find((item) => item.userId === user.id);
    const payload = {
      id: existing?.id || createId(),
      userId: user.id,
      hardLimits: parsed.data.hardLimits,
      softLimits: parsed.data.softLimits,
      intensity: parsed.data.intensity,
      safewordConfirmed: Boolean(parsed.data.safewordConfirmed),
      aftercareNotes: parsed.data.aftercareNotes || null,
      updatedAt: now(),
    };

    if (existing) {
      Object.assign(existing, payload);
    } else {
      db.consentProfiles.push(payload);
    }
  });

  revalidatePath("/app");
}

export async function createTemplate(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      title: z.string().min(2).max(40),
      description: z.string().min(2).max(200),
    })
    .safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
    });

  if (!parsed.success) {
    redirect("/app?error=template");
  }

  await updateDB((db) => {
    const target = db.users.find((item) => item.id === user.id);
    if (!target || target.role !== "dom") return;

    db.taskTemplates.unshift({
      id: createId(),
      title: parsed.data.title,
      description: parsed.data.description,
      createdById: user.id,
      createdAt: now(),
    });

    target.xp += 3;
  });

  revalidatePath("/app");
}

export async function createTask(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      title: z.string().min(2).max(60),
      description: z.string().min(4).max(300),
      xpReward: z.coerce.number().min(0).max(500),
      isQuest: z.string().optional(),
    })
    .safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      xpReward: formData.get("xpReward"),
      isQuest: formData.get("isQuest") || undefined,
    });

  if (!parsed.success) {
    redirect("/app?error=task");
  }

  await updateDB((db) => {
    const target = db.users.find((item) => item.id === user.id);
    if (!target || target.role !== "dom") return;

    db.tasks.unshift({
      id: createId(),
      title: parsed.data.title,
      description: parsed.data.description,
      status: "OPEN",
      xpReward: parsed.data.xpReward,
      isQuest: Boolean(parsed.data.isQuest),
      createdAt: now(),
      createdById: user.id,
      assignedToId: null,
    });

    target.xp += 5;
  });

  revalidatePath("/app");
}

export async function claimTask(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId"));

  await updateDB((db) => {
    const target = db.users.find((item) => item.id === user.id);
    const task = db.tasks.find((item) => item.id === taskId);
    if (!target || !task) return;
    if (target.role !== "sub") return;
    if (task.status !== "OPEN") return;

    task.status = "CLAIMED";
    task.assignedToId = user.id;
  });

  revalidatePath("/app");
}

export async function submitTask(formData: FormData) {
  const user = await requireUser();
  const taskId = String(formData.get("taskId"));

  await updateDB((db) => {
    const task = db.tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (task.assignedToId !== user.id) return;
    if (task.status !== "CLAIMED") return;

    task.status = "SUBMITTED";
    task.submittedAt = now();
  });

  revalidatePath("/app");
}

export async function reviewTask(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      taskId: z.string(),
      decision: z.enum(["APPROVE", "DISAPPROVE"]),
      note: z.string().max(200).optional(),
    })
    .safeParse({
      taskId: formData.get("taskId"),
      decision: formData.get("decision"),
      note: formData.get("note") || undefined,
    });

  if (!parsed.success) {
    redirect("/app?error=review");
  }

  await updateDB((db) => {
    const reviewer = db.users.find((item) => item.id === user.id);
    if (!reviewer || reviewer.role !== "dom") return;

    const task = db.tasks.find((item) => item.id === parsed.data.taskId);
    if (!task || task.status !== "SUBMITTED") return;

    const assignee = db.users.find((item) => item.id === task.assignedToId);
    if (!assignee) return;

    const decision = parsed.data.decision;
    const note = parsed.data.note || null;

    task.status = decision === "APPROVE" ? "APPROVED" : "DISAPPROVED";
    task.reviewedAt = now();

    db.approvals.unshift({
      id: createId(),
      taskId: task.id,
      userId: reviewer.id,
      decision,
      note,
      createdAt: now(),
    });

    reviewer.xp += 2;

    if (decision === "APPROVE") {
      assignee.xp += task.xpReward;
      assignee.reputation += Math.max(1, Math.round(task.xpReward / 20));
    } else {
      assignee.stains += 1;
      assignee.reputation = Math.max(0, assignee.reputation - 1);
      if (!note) {
        reviewer.reputation = Math.max(0, reviewer.reputation - 1);
      }
    }
  });

  revalidatePath("/app");
}

export async function createPromo(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      bio: z.string().min(6).max(280),
      style: z.string().min(2).max(120),
      featured: z.string().optional(),
    })
    .safeParse({
      bio: formData.get("bio"),
      style: formData.get("style"),
      featured: formData.get("featured") || undefined,
    });

  if (!parsed.success) {
    redirect("/app?error=promo");
  }

  await updateDB((db) => {
    const target = db.users.find((item) => item.id === user.id);
    if (!target || target.role !== "dom") return;

    const existing = db.promos.find((item) => item.userId === user.id);
    const payload = {
      id: existing?.id || createId(),
      userId: user.id,
      bio: parsed.data.bio,
      style: parsed.data.style,
      featured: Boolean(parsed.data.featured),
      createdAt: existing?.createdAt || now(),
    };

    if (existing) {
      Object.assign(existing, payload);
    } else {
      db.promos.push(payload);
    }
  });

  revalidatePath("/app");
}

export async function addContent(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      title: z.string().min(2).max(80),
      description: z.string().min(2).max(200),
      type: z.enum(["image", "video", "text"]),
      visibility: z.enum(["public", "followers", "private"]),
      url: z.string().min(6).max(200),
      tags: z.string().min(2).max(80),
    })
    .safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      type: formData.get("type"),
      visibility: formData.get("visibility"),
      url: formData.get("url"),
      tags: formData.get("tags"),
    });

  if (!parsed.success) {
    redirect("/app?error=content");
  }

  await updateDB((db) => {
    db.content.unshift({
      id: createId(),
      userId: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      visibility: parsed.data.visibility,
      url: parsed.data.url,
      tags: parsed.data.tags,
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function addTrainingPlan(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      title: z.string().min(2).max(80),
      focus: z.string().min(2).max(200),
      cadence: z.string().min(2).max(40),
    })
    .safeParse({
      title: formData.get("title"),
      focus: formData.get("focus"),
      cadence: formData.get("cadence"),
    });

  if (!parsed.success) {
    redirect("/app?error=training");
  }

  await updateDB((db) => {
    db.trainingPlans.unshift({
      id: createId(),
      userId: user.id,
      title: parsed.data.title,
      focus: parsed.data.focus,
      cadence: parsed.data.cadence,
      status: "ACTIVE",
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function addRoleplayEntry(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      title: z.string().min(2).max(80),
      summary: z.string().min(4).max(300),
      tags: z.string().min(2).max(80),
    })
    .safeParse({
      title: formData.get("title"),
      summary: formData.get("summary"),
      tags: formData.get("tags"),
    });

  if (!parsed.success) {
    redirect("/app?error=roleplay");
  }

  await updateDB((db) => {
    db.roleplayEntries.unshift({
      id: createId(),
      userId: user.id,
      title: parsed.data.title,
      summary: parsed.data.summary,
      tags: parsed.data.tags,
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function addChastityLog(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      status: z.enum(["LOCKED", "RELEASED", "PAUSED"]),
      durationDays: z.coerce.number().min(0).max(3650),
      note: z.string().max(200).optional(),
    })
    .safeParse({
      status: formData.get("status"),
      durationDays: formData.get("durationDays"),
      note: formData.get("note") || undefined,
    });

  if (!parsed.success) {
    redirect("/app?error=chastity");
  }

  await updateDB((db) => {
    db.chastityLogs.unshift({
      id: createId(),
      userId: user.id,
      status: parsed.data.status,
      durationDays: parsed.data.durationDays,
      note: parsed.data.note || null,
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function markTaskStatus(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      taskId: z.string(),
      status: z.enum(["OPEN", "CLAIMED", "SUBMITTED", "APPROVED", "DISAPPROVED"]),
    })
    .safeParse({
      taskId: formData.get("taskId"),
      status: formData.get("status"),
    });

  if (!parsed.success) {
    redirect("/app?error=task");
  }

  await updateDB((db) => {
    const target = db.tasks.find((item) => item.id === parsed.data.taskId);
    if (!target) return;
    if (user.role !== "dom") return;
    target.status = parsed.data.status as TaskStatus;
  });

  revalidatePath("/app");
}

export async function createLock(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      title: z.string().min(2).max(80),
      durationHours: z.coerce.number().min(1).max(24 * 365),
      allowManualUnlock: z.string().optional(),
    })
    .safeParse({
      title: formData.get("title"),
      durationHours: formData.get("durationHours"),
      allowManualUnlock: formData.get("allowManualUnlock") || undefined,
    });

  if (!parsed.success) {
    redirect("/app?error=lock");
  }

  const lockedUntil = new Date(
    Date.now() + parsed.data.durationHours * 60 * 60 * 1000,
  ).toISOString();

  await updateDB((db) => {
    db.chastityLocks.unshift({
      id: createId(),
      ownerId: user.id,
      keyholderId: null,
      title: parsed.data.title,
      lockedUntil,
      allowManualUnlock: Boolean(parsed.data.allowManualUnlock),
      status: "LOCKED",
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function adjustLockTime(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      lockId: z.string(),
      minutes: z.coerce.number().min(1).max(60 * 24 * 30),
      direction: z.enum(["ADD", "REMOVE"]),
    })
    .safeParse({
      lockId: formData.get("lockId"),
      minutes: formData.get("minutes"),
      direction: formData.get("direction"),
    });

  if (!parsed.success) {
    redirect("/app?error=lock");
  }

  await updateDB((db) => {
    const lock = db.chastityLocks.find((item) => item.id === parsed.data.lockId);
    if (!lock) return;
    const isOwner = lock.ownerId === user.id;
    const isKeyholder = lock.keyholderId === user.id;
    if (!isOwner && !isKeyholder) return;

    const current = new Date(lock.lockedUntil).getTime();
    const delta = parsed.data.minutes * 60 * 1000;
    const next =
      parsed.data.direction === "ADD" ? current + delta : current - delta;
    lock.lockedUntil = new Date(Math.max(next, Date.now())).toISOString();

    db.lockEvents.unshift({
      id: createId(),
      lockId: lock.id,
      actorId: user.id,
      type: parsed.data.direction === "ADD" ? "TIME_ADDED" : "TIME_REMOVED",
      minutes: parsed.data.minutes,
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function unlockLock(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      lockId: z.string(),
    })
    .safeParse({
      lockId: formData.get("lockId"),
    });

  if (!parsed.success) {
    redirect("/app?error=lock");
  }

  await updateDB((db) => {
    const lock = db.chastityLocks.find((item) => item.id === parsed.data.lockId);
    if (!lock) return;
    const isOwner = lock.ownerId === user.id;
    const isKeyholder = lock.keyholderId === user.id;
    const timeUp = new Date(lock.lockedUntil) <= new Date();
    if (!timeUp && !lock.allowManualUnlock && !isKeyholder) return;
    if (!isOwner && !isKeyholder) return;

    lock.status = "UNLOCKED";

    db.lockEvents.unshift({
      id: createId(),
      lockId: lock.id,
      actorId: user.id,
      type: "UNLOCKED",
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function requestKeyholder(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      lockId: z.string(),
      targetUsername: z.string().min(2).max(24),
    })
    .safeParse({
      lockId: formData.get("lockId"),
      targetUsername: formData.get("targetUsername"),
    });

  if (!parsed.success) {
    redirect("/app?error=keyholder");
  }

  await updateDB((db) => {
    const lock = db.chastityLocks.find((item) => item.id === parsed.data.lockId);
    const target = db.users.find(
      (item) => item.username === parsed.data.targetUsername,
    );
    if (!lock || !target) return;
    if (lock.ownerId !== user.id) return;

    db.keyholderRequests.unshift({
      id: createId(),
      lockId: lock.id,
      requesterId: user.id,
      targetId: target.id,
      status: "PENDING",
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function respondKeyholderRequest(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      requestId: z.string(),
      decision: z.enum(["APPROVED", "REJECTED"]),
    })
    .safeParse({
      requestId: formData.get("requestId"),
      decision: formData.get("decision"),
    });

  if (!parsed.success) {
    redirect("/app?error=keyholder");
  }

  await updateDB((db) => {
    const request = db.keyholderRequests.find(
      (item) => item.id === parsed.data.requestId,
    );
    if (!request) return;
    if (request.targetId !== user.id) return;
    request.status = parsed.data.decision;

    if (parsed.data.decision === "APPROVED") {
      const lock = db.chastityLocks.find((item) => item.id === request.lockId);
      if (lock) {
        lock.keyholderId = user.id;
        db.lockEvents.unshift({
          id: createId(),
          lockId: lock.id,
          actorId: user.id,
          type: "KEYHOLDER_SET",
          createdAt: now(),
        });
      }
    }
  });

  revalidatePath("/app");
}

export async function addLockAddon(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      lockId: z.string(),
      name: z.string().min(2).max(40),
      effect: z.string().min(4).max(200),
    })
    .safeParse({
      lockId: formData.get("lockId"),
      name: formData.get("name"),
      effect: formData.get("effect"),
    });

  if (!parsed.success) {
    redirect("/app?error=addon");
  }

  await updateDB((db) => {
    const lock = db.chastityLocks.find((item) => item.id === parsed.data.lockId);
    if (!lock) return;
    const isOwner = lock.ownerId === user.id;
    const isKeyholder = lock.keyholderId === user.id;
    if (!isOwner && !isKeyholder) return;

    db.lockAddons.unshift({
      id: createId(),
      lockId: lock.id,
      name: parsed.data.name,
      effect: parsed.data.effect,
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function addAdventure(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      title: z.string().min(2).max(80),
      rules: z.string().min(6).max(400),
    })
    .safeParse({
      title: formData.get("title"),
      rules: formData.get("rules"),
    });

  if (!parsed.success) {
    redirect("/app?error=adventure");
  }

  await updateDB((db) => {
    db.adventures.unshift({
      id: createId(),
      userId: user.id,
      title: parsed.data.title,
      rules: parsed.data.rules,
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function sendDirectMessage(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      toUsername: z.string().min(2).max(24),
      body: z.string().min(1).max(500),
    })
    .safeParse({
      toUsername: formData.get("toUsername"),
      body: formData.get("body"),
    });

  if (!parsed.success) {
    redirect("/app?error=dm");
  }

  await updateDB((db) => {
    const target = db.users.find(
      (item) => item.username === parsed.data.toUsername,
    );
    if (!target) return;

    db.directMessages.unshift({
      id: createId(),
      fromUserId: user.id,
      toUserId: target.id,
      body: parsed.data.body,
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}

export async function assignOwnership(formData: FormData) {
  const user = await requireUser();
  const parsed = z
    .object({
      subUsername: z.string().min(2).max(24),
    })
    .safeParse({
      subUsername: formData.get("subUsername"),
    });

  if (!parsed.success) {
    redirect("/app?error=ownership");
  }

  await updateDB((db) => {
    const dom = db.users.find((item) => item.id === user.id);
    if (!dom || dom.role !== "dom") return;
    const sub = db.users.find(
      (item) => item.username === parsed.data.subUsername,
    );
    if (!sub || sub.role !== "sub") return;

    const exists = db.ownerships.some(
      (item) => item.domId === dom.id && item.subId === sub.id,
    );
    if (exists) return;

    db.ownerships.unshift({
      id: createId(),
      domId: dom.id,
      subId: sub.id,
      createdAt: now(),
    });
  });

  revalidatePath("/app");
}
