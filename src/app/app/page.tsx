import ChatRoom from "@/app/app/ChatRoom";
import {
  addAdventure,
  addChastityLog,
  addContent,
  addLockAddon,
  addRoleplayEntry,
  addTrainingPlan,
  assignOwnership,
  claimTask,
  createLock,
  createPromo,
  createTask,
  createTemplate,
  requestKeyholder,
  respondKeyholderRequest,
  reviewTask,
  saveConsent,
  sendDirectMessage,
  submitTask,
  unlockLock,
  updateProfile,
  adjustLockTime,
} from "@/app/actions";
import { requireUser } from "@/lib/auth";
import { readDB } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const domTitleOptions = [
  "Princess",
  "Mistress",
  "Empress",
  "Warden",
  "Matron",
  "Regent",
];

const subTitleOptions = [
  "Slave",
  "Pet",
  "Servant",
  "Novice",
  "Devotee",
  "Oathbound",
];

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const unlockCode = (lockId: string) => lockId.replace(/-/g, "").slice(0, 6).toUpperCase();

export default async function AppPage() {
  const user = await requireUser();
  const db = await readDB();
  const consent = db.consentProfiles.find((item) => item.userId === user.id);
  const promo = db.promos.find((item) => item.userId === user.id);

  const tasks = db.tasks;
  const openQuests = tasks.filter((task) => task.isQuest && task.status === "OPEN");
  const openTasks = tasks.filter((task) => !task.isQuest && task.status === "OPEN");
  const myTasks = tasks.filter((task) => task.assignedToId === user.id);
  const submittedTasks = tasks.filter((task) => task.status === "SUBMITTED");

  const templates = db.taskTemplates;
  const content = db.content;
  const vaultItems = content.filter((item) => item.visibility === "private");
  const libraryItems = content.filter((item) => item.visibility !== "private");

  const trainingPlans = db.trainingPlans.slice(0, 4);
  const roleplayEntries = db.roleplayEntries.slice(0, 4);
  const chastityLogs = db.chastityLogs.slice(0, 4);

  const ownedLocks = db.chastityLocks.filter((lock) => lock.ownerId === user.id);
  const keyholderLocks = db.chastityLocks.filter(
    (lock) => lock.keyholderId === user.id,
  );
  const lockEvents = db.lockEvents.filter((event) =>
    ownedLocks.some((lock) => lock.id === event.lockId),
  );

  const keyholderRequests = db.keyholderRequests.filter(
    (request) => request.targetId === user.id && request.status === "PENDING",
  );

  const adventures = db.adventures.slice(0, 4);
  const lockAddons = db.lockAddons.slice(0, 4);

  const ownerships = db.ownerships;
  const doms = db.users.filter((item) => item.role === "dom");
  const subs = db.users.filter((item) => item.role === "sub");

  const domLeaderboard = doms
    .map((dom) => ({
      ...dom,
      subsOwned: ownerships.filter((item) => item.domId === dom.id).length,
    }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 5);

  const subReputation = [...subs]
    .sort((a, b) => b.reputation - a.reputation)
    .slice(0, 5);

  const subXp = [...subs].sort((a, b) => b.xp - a.xp).slice(0, 5);

  const directMessages = db.directMessages
    .filter((message) => message.fromUserId === user.id || message.toUserId === user.id)
    .slice(0, 8)
    .map((message) => {
      const from = db.users.find((item) => item.id === message.fromUserId);
      const to = db.users.find((item) => item.id === message.toUserId);
      return {
        ...message,
        fromName: from?.username || "unknown",
        toName: to?.username || "unknown",
      };
    });

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-white/10 bg-[var(--card)] p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
          Command Deck
        </p>
        <h2 className="font-display text-4xl">Dominion Console</h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Femdom protocol, discipline, and consent-first structure. Safeword "RED" is
          always active. All interactions require limits and accountability.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Identity
          </p>
          <h2 className="font-display text-3xl">Role and Title</h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Choose your role and title. Dom titles are public markers of authority.
          </p>
          <form action={updateProfile} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Role
              </label>
              <select
                name="role"
                defaultValue={user.role}
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              >
                <option value="dom">Dom</option>
                <option value="sub">Sub</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Title
              </label>
              <select
                name="title"
                defaultValue={user.title || ""}
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              >
                <option value="">No title</option>
                {(user.role === "dom" ? domTitleOptions : subTitleOptions).map(
                  (title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ),
                )}
              </select>
            </div>
            <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black">
              Update Profile
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Reputation
          </p>
          <h2 className="font-display text-3xl">Status Overview</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase text-[var(--muted)]">XP</p>
              <p className="mt-2 text-2xl font-semibold">{user.xp}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase text-[var(--muted)]">Reputation</p>
              <p className="mt-2 text-2xl font-semibold">{user.reputation}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase text-[var(--muted)]">Stains</p>
              <p className="mt-2 text-2xl font-semibold">{user.stains}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Approvals increase XP and reputation. Disapprovals add stains and reduce
            reputation. Doms gain XP for creation and review.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Consent Profile
          </p>
          <h2 className="font-display text-3xl">Limits and Safeword</h2>
          <form action={saveConsent} className="mt-6 grid gap-4">
            <textarea
              name="hardLimits"
              placeholder="Hard limits"
              defaultValue={consent?.hardLimits || ""}
              className="min-h-[90px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <textarea
              name="softLimits"
              placeholder="Soft limits"
              defaultValue={consent?.softLimits || ""}
              className="min-h-[90px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <div className="grid gap-2">
              <label className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Intensity (1-10)
              </label>
              <input
                type="number"
                name="intensity"
                min={1}
                max={10}
                defaultValue={consent?.intensity || 5}
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              />
            </div>
            <textarea
              name="aftercareNotes"
              placeholder="Aftercare notes"
              defaultValue={consent?.aftercareNotes || ""}
              className="min-h-[80px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                name="safewordConfirmed"
                defaultChecked={Boolean(consent?.safewordConfirmed)}
              />
              Safeword confirmed: RED
            </label>
            <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black">
              Save Consent Profile
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Quest Board
          </p>
          <h2 className="font-display text-3xl">Official Tasks</h2>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Only doms can publish quests. Male subs claim tasks and earn XP + reputation on approval.
          </p>
          <div className="mt-6 space-y-3">
            {openQuests.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No open quests.</p>
            ) : (
              openQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="grid gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-[1.2fr_0.4fr_0.4fr_auto]"
                >
                  <div>
                    <p className="text-sm font-semibold">{quest.title}</p>
                    <p className="text-xs text-[var(--muted)]">{quest.description}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[var(--muted)]">XP</p>
                    <p className="text-sm font-semibold">{quest.xpReward}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-[var(--muted)]">Rep</p>
                    <p className="text-sm font-semibold">
                      {Math.max(1, Math.round(quest.xpReward / 20))}
                    </p>
                  </div>
                  {user.role === "sub" ? (
                    <form action={claimTask}>
                      <input type="hidden" name="taskId" value={quest.id} />
                      <button className="rounded-full border border-white/10 px-3 py-1 text-xs">
                        Claim
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-[var(--muted)]">Dom view</span>
                  )}
                </div>
              ))
            )}
          </div>
          {user.role === "dom" ? (
            <form action={createTask} className="mt-6 grid gap-3">
              <input
                name="title"
                placeholder="Quest title"
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                required
              />
              <textarea
                name="description"
                placeholder="Quest description"
                className="min-h-[70px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                required
              />
              <div className="flex gap-3">
                <input
                  name="xpReward"
                  type="number"
                  min={0}
                  max={500}
                  defaultValue={40}
                  className="w-32 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <input type="checkbox" name="isQuest" defaultChecked />
                  Publish to board
                </label>
              </div>
              <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black">
                Publish Quest
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Task Control
          </p>
          <h2 className="font-display text-3xl">Assignments and Reviews</h2>
          {user.role === "dom" ? (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <form action={createTask} className="space-y-3">
                <h3 className="font-display text-xl">Create Task</h3>
                <input
                  name="title"
                  placeholder="Task title"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Task description"
                  className="min-h-[80px] w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  required
                />
                <div className="flex gap-3">
                  <input
                    name="xpReward"
                    type="number"
                    min={0}
                    max={500}
                    defaultValue={40}
                    className="w-32 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                    <input type="checkbox" name="isQuest" />
                    Add to quest board
                  </label>
                </div>
                <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black">
                  Publish Task
                </button>
              </form>

              <div className="space-y-3">
                <h3 className="font-display text-xl">Review Queue</h3>
                <div className="space-y-3">
                  {submittedTasks.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">No submissions.</p>
                  ) : (
                    submittedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-white/10 bg-black/30 p-3"
                      >
                        <p className="text-sm font-semibold">{task.title}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {task.description}
                        </p>
                        <form action={reviewTask} className="mt-3 grid gap-2">
                          <input type="hidden" name="taskId" value={task.id} />
                          <select
                            name="decision"
                            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs"
                          >
                            <option value="APPROVE">Approve</option>
                            <option value="DISAPPROVE">Disapprove</option>
                          </select>
                          <input
                            name="note"
                            placeholder="Feedback required for disapproval"
                            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs"
                          />
                          <button className="rounded-full border border-white/10 px-3 py-1 text-xs">
                            Submit Review
                          </button>
                        </form>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-display text-xl">Open Tasks</h3>
                {openTasks.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No open tasks.</p>
                ) : (
                  openTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{task.title}</p>
                        <p className="text-xs text-[var(--muted)]">
                          {task.description}
                        </p>
                      </div>
                      <form action={claimTask}>
                        <input type="hidden" name="taskId" value={task.id} />
                        <button className="rounded-full border border-white/10 px-3 py-1 text-xs">
                          Claim
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-display text-xl">My Tasks</h3>
                {myTasks.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No assigned tasks.</p>
                ) : (
                  myTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-white/10 bg-black/30 p-3"
                    >
                      <p className="text-sm font-semibold">{task.title}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {task.description}
                      </p>
                      {task.status === "CLAIMED" ? (
                        <form action={submitTask} className="mt-2">
                          <input type="hidden" name="taskId" value={task.id} />
                          <button className="rounded-full border border-white/10 px-3 py-1 text-xs">
                            Submit for Review
                          </button>
                        </form>
                      ) : (
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          Status: {task.status}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Task Templates
          </p>
          <h2 className="font-display text-3xl">Quick Creation</h2>
          <div className="mt-6 space-y-3">
            {templates.slice(0, 6).map((template) => (
              <div
                key={template.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-3"
              >
                <p className="text-sm font-semibold">{template.title}</p>
                <p className="text-xs text-[var(--muted)]">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
          {user.role === "dom" ? (
            <form action={createTemplate} className="mt-6 grid gap-3">
              <input
                name="title"
                placeholder="Template title"
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                required
              />
              <textarea
                name="description"
                placeholder="Template description"
                className="min-h-[70px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                required
              />
              <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
                Add Template
              </button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Training
          </p>
          <h2 className="font-display text-2xl">Male Sub Training</h2>
          <div className="mt-4 space-y-3">
            {trainingPlans.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No plans yet.</p>
            ) : (
              trainingPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="text-sm font-semibold">{plan.title}</p>
                  <p className="text-xs text-[var(--muted)]">{plan.focus}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {plan.cadence} / {plan.status}
                  </p>
                </div>
              ))
            )}
          </div>
          <form action={addTrainingPlan} className="mt-4 grid gap-2">
            <input
              name="title"
              placeholder="Plan title"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="focus"
              placeholder="Focus"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="cadence"
              placeholder="Cadence (Daily / Weekly)"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
              Add Plan
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Roleplay Fiction
          </p>
          <h2 className="font-display text-2xl">Library and Editor</h2>
          <div className="mt-4 space-y-3">
            {roleplayEntries.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No entries yet.</p>
            ) : (
              roleplayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="text-sm font-semibold">{entry.title}</p>
                  <p className="text-xs text-[var(--muted)]">{entry.summary}</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">Tags: {entry.tags}</p>
                </div>
              ))
            )}
          </div>
          <form action={addRoleplayEntry} className="mt-4 grid gap-2">
            <input
              name="title"
              placeholder="Scene title"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="summary"
              placeholder="Summary"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="tags"
              placeholder="Tags"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
              Add Entry
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Chastity Core
          </p>
          <h2 className="font-display text-2xl">Locks and Control</h2>
          <div className="mt-4 space-y-3 text-xs text-[var(--muted)]">
            <p>1. Time-based locks with history and unlock code release.</p>
            <p>2. Keyholder system with add/remove time controls.</p>
            <p>3. Shared locks and session requests.</p>
            <p>4. Add-ons for random extensions and rule twists.</p>
            <p>5. Custom adventures (rule sets) saved as templates.</p>
          </div>
          <div className="mt-4 space-y-3">
            {ownedLocks.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No active locks.</p>
            ) : (
              ownedLocks.map((lock) => {
                const expired = new Date(lock.lockedUntil) <= new Date();
                return (
                  <div
                    key={lock.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{lock.title}</p>
                      <span className="text-xs text-[var(--muted)]">
                        {lock.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">
                      Locked until {formatDate(lock.lockedUntil)}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Lock ID: {lock.id}
                    </p>
                    {expired ? (
                      <p className="mt-1 text-xs text-[var(--accent)]">
                        Unlock code: {unlockCode(lock.id)}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={adjustLockTime} className="flex items-center gap-2">
                        <input type="hidden" name="lockId" value={lock.id} />
                        <input type="hidden" name="direction" value="ADD" />
                        <input
                          name="minutes"
                          type="number"
                          min={1}
                          max={1440}
                          defaultValue={60}
                          className="w-20 rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-xs"
                        />
                        <button className="rounded-full border border-white/10 px-2 py-1 text-xs">
                          Add
                        </button>
                      </form>
                      <form action={adjustLockTime} className="flex items-center gap-2">
                        <input type="hidden" name="lockId" value={lock.id} />
                        <input type="hidden" name="direction" value="REMOVE" />
                        <input
                          name="minutes"
                          type="number"
                          min={1}
                          max={1440}
                          defaultValue={30}
                          className="w-20 rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-xs"
                        />
                        <button className="rounded-full border border-white/10 px-2 py-1 text-xs">
                          Remove
                        </button>
                      </form>
                      <form action={unlockLock}>
                        <input type="hidden" name="lockId" value={lock.id} />
                        <button className="rounded-full border border-white/10 px-2 py-1 text-xs">
                          Unlock
                        </button>
                      </form>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {keyholderLocks.length > 0 ? (
            <div className="mt-4 space-y-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Keyholder Locks
              </p>
              {keyholderLocks.map((lock) => (
                <div
                  key={lock.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{lock.title}</p>
                    <span className="text-xs text-[var(--muted)]">
                      {lock.status}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">
                    Locked until {formatDate(lock.lockedUntil)}
                  </p>
                  <p className="text-xs text-[var(--muted)]">Lock ID: {lock.id}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <form action={adjustLockTime} className="flex items-center gap-2">
                      <input type="hidden" name="lockId" value={lock.id} />
                      <input type="hidden" name="direction" value="ADD" />
                      <input
                        name="minutes"
                        type="number"
                        min={1}
                        max={1440}
                        defaultValue={60}
                        className="w-20 rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-xs"
                      />
                      <button className="rounded-full border border-white/10 px-2 py-1 text-xs">
                        Add
                      </button>
                    </form>
                    <form action={adjustLockTime} className="flex items-center gap-2">
                      <input type="hidden" name="lockId" value={lock.id} />
                      <input type="hidden" name="direction" value="REMOVE" />
                      <input
                        name="minutes"
                        type="number"
                        min={1}
                        max={1440}
                        defaultValue={30}
                        className="w-20 rounded-xl border border-white/10 bg-black/40 px-2 py-1 text-xs"
                      />
                      <button className="rounded-full border border-white/10 px-2 py-1 text-xs">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <form action={createLock} className="mt-4 grid gap-2">
            <input
              name="title"
              placeholder="Lock title"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="durationHours"
              type="number"
              min={1}
              max={8760}
              placeholder="Duration (hours)"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <input type="checkbox" name="allowManualUnlock" />
              Allow manual unlock
            </label>
            <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
              Create Lock
            </button>
          </form>
          <form action={requestKeyholder} className="mt-4 grid gap-2">
            <input
              name="lockId"
              placeholder="Lock ID"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="targetUsername"
              placeholder="Keyholder username"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
              Request Keyholder
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Keyholder Requests
          </p>
          <h2 className="font-display text-2xl">Pending Approvals</h2>
          <div className="mt-4 space-y-3">
            {keyholderRequests.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No requests.</p>
            ) : (
              keyholderRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="text-sm font-semibold">Lock: {request.lockId}</p>
                  <form action={respondKeyholderRequest} className="mt-2 flex gap-2">
                    <input type="hidden" name="requestId" value={request.id} />
                    <button
                      name="decision"
                      value="APPROVED"
                      className="rounded-full border border-white/10 px-3 py-1 text-xs"
                    >
                      Approve
                    </button>
                    <button
                      name="decision"
                      value="REJECTED"
                      className="rounded-full border border-white/10 px-3 py-1 text-xs"
                    >
                      Reject
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Lock Add-ons
          </p>
          <h2 className="font-display text-2xl">Randomizers</h2>
          <div className="mt-4 space-y-3">
            {lockAddons.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No add-ons yet.</p>
            ) : (
              lockAddons.map((addon) => (
                <div
                  key={addon.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="text-sm font-semibold">{addon.name}</p>
                  <p className="text-xs text-[var(--muted)]">{addon.effect}</p>
                </div>
              ))
            )}
          </div>
          <form action={addLockAddon} className="mt-4 grid gap-2">
            <input
              name="lockId"
              placeholder="Lock ID"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="name"
              placeholder="Add-on name"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="effect"
              placeholder="Effect"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
              Add Add-on
            </button>
          </form>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Adventures
          </p>
          <h2 className="font-display text-3xl">Custom Lock Rules</h2>
          <div className="mt-4 space-y-3">
            {adventures.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No adventures yet.</p>
            ) : (
              adventures.map((adv) => (
                <div
                  key={adv.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="text-sm font-semibold">{adv.title}</p>
                  <p className="text-xs text-[var(--muted)]">{adv.rules}</p>
                </div>
              ))
            )}
          </div>
          <form action={addAdventure} className="mt-4 grid gap-2">
            <input
              name="title"
              placeholder="Adventure title"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <textarea
              name="rules"
              placeholder="Rule set"
              className="min-h-[80px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
              Save Adventure
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Lock History
          </p>
          <h2 className="font-display text-3xl">Recent Events</h2>
          <div className="mt-4 space-y-3">
            {lockEvents.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No events yet.</p>
            ) : (
              lockEvents.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3"
                >
                  <p className="text-xs text-[var(--muted)]">{event.type}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {formatDate(event.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Leaderboards
          </p>
          <h2 className="font-display text-3xl">Top Doms</h2>
          <div className="mt-4 space-y-3">
            {domLeaderboard.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No doms yet.</p>
            ) : (
              domLeaderboard.map((dom) => (
                <div
                  key={dom.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{dom.username}</p>
                    <p className="text-xs text-[var(--muted)]">
                      XP {dom.xp} / Subs owned {dom.subsOwned}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--muted)]">{dom.title || ""}</span>
                </div>
              ))
            )}
          </div>
          {user.role === "dom" ? (
            <form action={assignOwnership} className="mt-4 grid gap-2">
              <input
                name="subUsername"
                placeholder="Assign sub by username"
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                required
              />
              <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
                Add Ownership
              </button>
            </form>
          ) : null}
        </div>

        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Sub Leaderboards
          </p>
          <h2 className="font-display text-3xl">Reputation and XP</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Reputation
              </p>
              {subReputation.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs"
                >
                  {sub.username} / {sub.reputation}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                XP
              </p>
              {subXp.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs"
                >
                  {sub.username} / {sub.xp}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Content Library
          </p>
          <h2 className="font-display text-3xl">Media Vault</h2>
          <div className="mt-6 grid gap-4">
            {libraryItems.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No content yet.</p>
            ) : (
              libraryItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-[var(--muted)]">{item.description}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {item.type.toUpperCase()} / {item.visibility.toUpperCase()}
                  </p>
                </div>
              ))
            )}
          </div>
          <form action={addContent} className="mt-6 grid gap-3">
            <input
              name="title"
              placeholder="Content title"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="description"
              placeholder="Description"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                name="type"
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                defaultValue="image"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="text">Text</option>
              </select>
              <select
                name="visibility"
                className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                defaultValue="public"
              >
                <option value="public">Public</option>
                <option value="followers">Followers</option>
                <option value="private">Private</option>
              </select>
            </div>
            <input
              name="url"
              placeholder="Media URL or placeholder"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="tags"
              placeholder="Tags"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
              Add Content
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
              Private Vault
            </p>
            <h2 className="font-display text-3xl">Restricted Content</h2>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Vault content is private. Placeholder items are provided until you upload real media.
            </p>
            <div className="mt-4 space-y-3">
              {vaultItems.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No vault items yet.</p>
              ) : (
                vaultItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-[var(--muted)]">{item.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {user.role === "dom" ? (
            <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
                Dom Self-Promo
              </p>
              <h2 className="font-display text-3xl">Spotlight Panel</h2>
              <form action={createPromo} className="mt-6 grid gap-3">
                <textarea
                  name="bio"
                  placeholder="Bio"
                  defaultValue={promo?.bio || ""}
                  className="min-h-[90px] rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  required
                />
                <input
                  name="style"
                  placeholder="Style and focus"
                  defaultValue={promo?.style || ""}
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  required
                />
                <label className="flex items-center gap-2 text-xs text-[var(--muted)]">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={promo?.featured || false}
                  />
                  Feature this profile
                </label>
                <button className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black">
                  Save Promo
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
            Direct Messages
          </p>
          <h2 className="font-display text-3xl">Private Channel</h2>
          <form action={sendDirectMessage} className="mt-4 grid gap-2">
            <input
              name="toUsername"
              placeholder="Recipient username"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <input
              name="body"
              placeholder="Message"
              className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
              required
            />
            <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
              Send Message
            </button>
          </form>
          <div className="mt-4 space-y-3">
            {directMessages.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No messages yet.</p>
            ) : (
              directMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl border border-white/10 bg-black/30 p-3 text-xs"
                >
                  <p className="text-[var(--muted)]">
                    {message.fromName} to {message.toName}
                  </p>
                  <p className="mt-1">{message.body}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <ChatRoom roomSlug="general" />
      </section>

      <section className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
          Chastity Logs
        </p>
        <h2 className="font-display text-3xl">Timeline</h2>
        <div className="mt-4 space-y-3">
          {chastityLogs.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No logs yet.</p>
          ) : (
            chastityLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-2xl border border-white/10 bg-black/30 p-3"
              >
                <p className="text-sm font-semibold">{log.status}</p>
                <p className="text-xs text-[var(--muted)]">
                  Duration: {log.durationDays} days
                </p>
                {log.note ? (
                  <p className="mt-1 text-xs text-[var(--muted)]">{log.note}</p>
                ) : null}
              </div>
            ))
          )}
        </div>
        <form action={addChastityLog} className="mt-4 grid gap-2">
          <select
            name="status"
            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          >
            <option value="LOCKED">Locked</option>
            <option value="RELEASED">Released</option>
            <option value="PAUSED">Paused</option>
          </select>
          <input
            name="durationDays"
            type="number"
            min={0}
            max={3650}
            placeholder="Duration (days)"
            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
            required
          />
          <input
            name="note"
            placeholder="Note"
            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
          />
          <button className="rounded-full border border-white/10 px-3 py-2 text-sm">
            Add Log
          </button>
        </form>
      </section>
    </div>
  );
}
