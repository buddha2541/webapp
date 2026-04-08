import fs from "fs";
import path from "path";
import crypto from "crypto";

export type Role = "dom" | "sub" | "neutral";
export type TaskStatus =
  | "OPEN"
  | "CLAIMED"
  | "SUBMITTED"
  | "APPROVED"
  | "DISAPPROVED";
export type ContentType = "image" | "video" | "text";
export type Visibility = "public" | "followers" | "private";

export type User = {
  id: string;
  username: string;
  passwordHash?: string | null;
  isAnonymous: boolean;
  role: Role;
  title?: string | null;
  xp: number;
  reputation: number;
  stains: number;
  createdAt: string;
};

export type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

export type ConsentProfile = {
  id: string;
  userId: string;
  hardLimits: string;
  softLimits: string;
  intensity: number;
  safewordConfirmed: boolean;
  aftercareNotes?: string | null;
  updatedAt: string;
};

export type TaskTemplate = {
  id: string;
  title: string;
  description: string;
  createdById?: string | null;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  xpReward: number;
  isQuest: boolean;
  createdAt: string;
  createdById?: string | null;
  assignedToId?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
};

export type TaskApproval = {
  id: string;
  taskId: string;
  userId: string;
  decision: "APPROVE" | "DISAPPROVE";
  note?: string | null;
  createdAt: string;
};

export type TrainingPlan = {
  id: string;
  userId: string;
  title: string;
  focus: string;
  cadence: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETE";
  createdAt: string;
};

export type RoleplayEntry = {
  id: string;
  userId: string;
  title: string;
  summary: string;
  tags: string;
  createdAt: string;
};

export type ChastityLog = {
  id: string;
  userId: string;
  status: "LOCKED" | "RELEASED" | "PAUSED";
  durationDays: number;
  note?: string | null;
  createdAt: string;
};

export type ChastityLock = {
  id: string;
  ownerId: string;
  keyholderId?: string | null;
  title: string;
  lockedUntil: string;
  allowManualUnlock: boolean;
  status: "LOCKED" | "UNLOCKED" | "PAUSED";
  createdAt: string;
};

export type LockEvent = {
  id: string;
  lockId: string;
  actorId: string;
  type:
    | "LOCKED"
    | "UNLOCKED"
    | "TIME_ADDED"
    | "TIME_REMOVED"
    | "REQUESTED"
    | "KEYHOLDER_SET";
  minutes?: number | null;
  note?: string | null;
  createdAt: string;
};

export type KeyholderRequest = {
  id: string;
  lockId: string;
  requesterId: string;
  targetId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
};

export type LockAddon = {
  id: string;
  lockId: string;
  name: string;
  effect: string;
  createdAt: string;
};

export type Adventure = {
  id: string;
  userId: string;
  title: string;
  rules: string;
  createdAt: string;
};

export type Ownership = {
  id: string;
  domId: string;
  subId: string;
  createdAt: string;
};

export type DirectMessage = {
  id: string;
  fromUserId: string;
  toUserId: string;
  body: string;
  createdAt: string;
};

export type Content = {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: ContentType;
  visibility: Visibility;
  url: string;
  tags: string;
  createdAt: string;
};

export type Promo = {
  id: string;
  userId: string;
  bio: string;
  style: string;
  featured: boolean;
  createdAt: string;
};

export type ChatRoom = {
  id: string;
  slug: string;
  name: string;
  createdAt: string;
};

export type Message = {
  id: string;
  roomId: string;
  userId: string;
  body: string;
  createdAt: string;
};

export type DB = {
  users: User[];
  sessions: Session[];
  consentProfiles: ConsentProfile[];
  taskTemplates: TaskTemplate[];
  tasks: Task[];
  approvals: TaskApproval[];
  trainingPlans: TrainingPlan[];
  roleplayEntries: RoleplayEntry[];
  chastityLogs: ChastityLog[];
  chastityLocks: ChastityLock[];
  lockEvents: LockEvent[];
  keyholderRequests: KeyholderRequest[];
  lockAddons: LockAddon[];
  adventures: Adventure[];
  ownerships: Ownership[];
  content: Content[];
  promos: Promo[];
  rooms: ChatRoom[];
  messages: Message[];
  directMessages: DirectMessage[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

const nowIso = () => new Date().toISOString();

const seedData = (): DB => {
  const roomId = crypto.randomUUID();
  const lockId = crypto.randomUUID();
  return {
    users: [],
    sessions: [],
    consentProfiles: [],
    taskTemplates: [
      {
        id: crypto.randomUUID(),
        title: "Daily posture check",
        description: "Short, structured check-in with clear expectations.",
        createdAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        title: "Timed silence block",
        description: "Focus drill with start and end checkpoints.",
        createdAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        title: "Submission journal",
        description: "Reflection log with accountability prompts.",
        createdAt: nowIso(),
      },
    ],
    tasks: [
      {
        id: crypto.randomUUID(),
        title: "Morning Protocol",
        description: "Daily routine check-in with confirmation.",
        status: "OPEN",
        xpReward: 40,
        isQuest: true,
        createdAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        title: "Posture Drill",
        description: "10-minute discipline session.",
        status: "OPEN",
        xpReward: 60,
        isQuest: true,
        createdAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        title: "Reflection Log",
        description: "End-of-day accountability log.",
        status: "OPEN",
        xpReward: 30,
        isQuest: true,
        createdAt: nowIso(),
      },
    ],
    approvals: [],
    trainingPlans: [
      {
        id: crypto.randomUUID(),
        userId: "seed",
        title: "Discipline Week One",
        focus: "Posture, protocol, and accountability.",
        cadence: "Daily",
        status: "ACTIVE",
        createdAt: nowIso(),
      },
    ],
    roleplayEntries: [
      {
        id: crypto.randomUUID(),
        userId: "seed",
        title: "Command Session Outline",
        summary: "Structured scene flow with consent checkpoints.",
        tags: "scene,protocol",
        createdAt: nowIso(),
      },
    ],
    chastityLogs: [
      {
        id: crypto.randomUUID(),
        userId: "seed",
        status: "LOCKED",
        durationDays: 7,
        note: "Placeholder log for timeline view.",
        createdAt: nowIso(),
      },
    ],
    chastityLocks: [
      {
        id: lockId,
        ownerId: "seed",
        keyholderId: null,
        title: "Protocol Lock",
        lockedUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        allowManualUnlock: false,
        status: "LOCKED",
        createdAt: nowIso(),
      },
    ],
    lockEvents: [],
    keyholderRequests: [],
    lockAddons: [
      {
        id: crypto.randomUUID(),
        lockId,
        name: "Dice Extension",
        effect: "Random adds between 15-60 minutes on roll.",
        createdAt: nowIso(),
      },
    ],
    adventures: [
      {
        id: crypto.randomUUID(),
        userId: "seed",
        title: "Seven Day Protocol",
        rules: "Daily check-in, posture drills, and a structured reflection log.",
        createdAt: nowIso(),
      },
    ],
    ownerships: [],
    content: [
      {
        id: crypto.randomUUID(),
        userId: "seed",
        title: "Protocol Preview",
        description: "Placeholder media for the content library.",
        type: "image",
        visibility: "public",
        url: "placeholder://content/preview",
        tags: "sample,placeholder",
        createdAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        userId: "seed",
        title: "Training Outline",
        description: "Placeholder entry for structured content.",
        type: "text",
        visibility: "public",
        url: "placeholder://content/training",
        tags: "training,placeholder",
        createdAt: nowIso(),
      },
      {
        id: crypto.randomUUID(),
        userId: "seed",
        title: "Vault Starter Pack",
        description: "Private vault placeholder content.",
        type: "image",
        visibility: "private",
        url: "placeholder://content/vault",
        tags: "vault,placeholder",
        createdAt: nowIso(),
      },
    ],
    promos: [],
    rooms: [
      {
        id: roomId,
        slug: "general",
        name: "General",
        createdAt: nowIso(),
      },
    ],
    messages: [],
    directMessages: [],
  };
};

const ensureDB = (): DB => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const seeded = seedData();
    fs.writeFileSync(DB_PATH, JSON.stringify(seeded, null, 2));
    return seeded;
  }
  const raw = fs.readFileSync(DB_PATH, "utf8");
  const data = JSON.parse(raw) as Partial<DB>;
  data.users ??= [];
  data.sessions ??= [];
  data.consentProfiles ??= [];
  data.taskTemplates ??= [];
  data.tasks ??= [];
  data.approvals ??= [];
  data.trainingPlans ??= [];
  data.roleplayEntries ??= [];
  data.chastityLogs ??= [];
  data.chastityLocks ??= [];
  data.lockEvents ??= [];
  data.keyholderRequests ??= [];
  data.lockAddons ??= [];
  data.adventures ??= [];
  data.ownerships ??= [];
  data.content ??= [];
  data.promos ??= [];
  data.rooms ??= [];
  data.messages ??= [];
  data.directMessages ??= [];
  return data as DB;
};

export const readDB = (): DB => ensureDB();

export const writeDB = (db: DB) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

export const updateDB = <T>(fn: (db: DB) => T): T => {
  const db = ensureDB();
  const result = fn(db);
  writeDB(db);
  return result;
};

export const createId = () => crypto.randomUUID();
export const now = () => nowIso();
