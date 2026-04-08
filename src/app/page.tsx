const modules = [
  {
    title: "Content Library",
    description:
      "Upload and organize images and video with tags, filters, and per-post visibility controls.",
    meta: "Images / Video / Tags",
  },
  {
    title: "Community",
    description:
      "Real-time rooms and DMs with consent gates, role labels, and reporting built in.",
    meta: "Rooms / DMs / Moderation",
  },
  {
    title: "Roleplay Fiction",
    description:
      "A curated library plus an editor for templates, tags, and session prompts.",
    meta: "Library / Editor / Tags",
  },
  {
    title: "Chastity Area",
    description:
      "Timers, milestones, logs, and approvals, structured and transparent.",
    meta: "Timers / Logs / Approvals",
  },
  {
    title: "Training",
    description:
      "Programs, daily drills, and progress tracking for consistent discipline.",
    meta: "Plans / Tasks / Progress",
  },
  {
    title: "Dom Console",
    description:
      "Rules, task assignment, review queue, and oversight in one control panel.",
    meta: "Rules / Review / Control",
  },
];

const questBoard = [
  {
    title: "Morning Protocol",
    detail: "Daily routine check-in",
    xp: "+40 XP",
    tier: "Daily",
  },
  {
    title: "Posture Drill",
    detail: "10-minute discipline session",
    xp: "+60 XP",
    tier: "Core",
  },
  {
    title: "Service Window",
    detail: "Timed service block",
    xp: "+90 XP",
    tier: "Advanced",
  },
  {
    title: "Reflection Log",
    detail: "End-of-day accountability",
    xp: "+30 XP",
    tier: "Daily",
  },
];

const taskTemplates = [
  "Daily posture check",
  "Timed silence block",
  "Uniform protocol",
  "Service checklist",
  "Submission journal",
  "Boundary review",
];

const domTitles = [
  "Princess",
  "Mistress",
  "Empress",
  "Warden",
  "Matron",
  "Regent",
];

const subTitles = ["Slave", "Pet", "Servant", "Novice", "Devotee", "Oathbound"];

const safety = [
  {
    title: "Safeword Protocol",
    description:
      'Onboarding requires the single safeword "RED". Using it pauses all tasks and DMs.',
  },
  {
    title: "Consent & Limits",
    description:
      "Hard limits, soft limits, and intensity sliders are required before any interaction.",
  },
  {
    title: "Reputation Guardrails",
    description:
      "Approvals raise reputation; disapprovals leave a visible stain and lower it.",
  },
  {
    title: "Privacy Controls",
    description:
      "Anonymous mode, private vaults, and granular visibility settings.",
  },
];

const reputationRules = [
  "Slaves gain XP and reputation only after dom approval.",
  "Disapproved tasks leave a stain and reduce reputation points.",
  "Doms gain XP for creating tasks, reviewing, and consistent engagement.",
  "Doms lose reputation if they repeatedly disapprove without feedback.",
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div className="pointer-events-none absolute -top-48 right-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(210,59,59,0.45),transparent_60%)] blur-2xl animate-float" />
      <div className="pointer-events-none absolute top-56 left-[-8%] h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(242,183,123,0.35),transparent_60%)] blur-2xl animate-float" />

      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Webapp
            </p>
            <h1 className="font-display text-2xl">Obsidian Protocol</h1>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-[var(--muted)]">
              18+ Gate
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-[var(--muted)]">
              Consent First
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-[var(--muted)]">
              Safeword: RED
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <section className="grid gap-10 pb-12 pt-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
              Command First
            </p>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              Dominion. Discipline. Consent.
            </h2>
            <p className="text-base leading-relaxed text-[var(--muted)] md:text-lg">
              A strict, femdom-first 18+ platform built around authority, structured
              tasks, and transparent reputation. Every interaction is gated by limits,
              safeword control, and accountability.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/auth"
                className="rounded-full bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-black shadow-[0_0_30px_rgba(210,59,59,0.45)] transition hover:translate-y-[-1px]"
              >
                Enter Protocol
              </a>
              <button className="rounded-full border border-white/15 px-5 py-2 text-sm text-[var(--muted)] transition hover:border-white/30">
                Review Rules
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Entry Protocol
                </p>
                <h3 className="font-display text-2xl">Onboarding Gate</h3>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]">
                Mandatory
              </span>
            </div>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm text-[var(--muted)]">Safeword</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--accent)]">
                  RED
                </p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Using the safeword pauses all tasks and direct messages.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Age Gate
                  </p>
                  <p className="mt-2 text-sm">18+ confirmation required</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Anonymous Mode
                  </p>
                  <p className="mt-2 text-sm">Optional anonymous entry</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Consent Profile
                  </p>
                  <p className="mt-2 text-sm">Limits + intensity required</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Data Control
                  </p>
                  <p className="mt-2 text-sm">Minimal PII, clear privacy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Core Modules
              </p>
              <h3 className="font-display text-3xl">Everything in one system</h3>
            </div>
            <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)] md:inline-flex">
              Neutral demo content only
            </span>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {modules.map((item) => (
              <div
                key={item.title}
                className="group rounded-3xl border border-white/10 bg-[var(--card)] p-6 transition hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-xl">{item.title}</h4>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]">
                    {item.meta}
                  </span>
                </div>
                <p className="mt-4 text-sm text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="quests" className="grid gap-8 py-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Quest Board
            </p>
            <h3 className="font-display text-3xl">Tasks with visible incentives</h3>
            <p className="mt-4 text-sm text-[var(--muted)]">
              Slaves select quests, complete them, and earn XP only after approval.
              Doms can author tasks quickly from reusable templates.
            </p>
            <div className="mt-6 space-y-4">
              {questBoard.map((quest) => (
                <div
                  key={quest.title}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-[var(--card)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold">{quest.title}</p>
                    <p className="text-xs text-[var(--muted)]">{quest.detail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase text-[var(--muted)]">
                      {quest.tier}
                    </p>
                    <p className="text-sm font-semibold text-[var(--accent)]">
                      {quest.xp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-2xl">Task Templates</h4>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]">
                1-click create
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {taskTemplates.map((template) => (
                <div
                  key={template}
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm"
                >
                  {template}
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--muted)]">
              Doms gain XP for creation, review, and consistent engagement.
            </div>
          </div>
        </section>

        <section id="reputation" className="py-12">
          <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Reputation Engine
            </p>
            <h3 className="font-display text-3xl">Approval = progression</h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm font-semibold">Slave Reputation</p>
                <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                  <li>Approvals increase XP and reputation points.</li>
                  <li>Disapprovals leave a visible stain on record.</li>
                  <li>Stains reduce reputation until cleared.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm font-semibold">Dom Reputation</p>
                <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
                  {reputationRules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="titles" className="grid gap-8 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Titles & Persona
            </p>
            <h3 className="font-display text-3xl">Identity is explicit and intentional</h3>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
                <p className="text-sm font-semibold">Dom Titles</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {domTitles.map((title) => (
                    <span
                      key={title}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
                <p className="text-sm font-semibold">Sub Titles</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {subTitles.map((title) => (
                    <span
                      key={title}
                      className="rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)]"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Dom Self-Promo
            </p>
            <h3 className="font-display text-2xl">Spotlight Panels</h3>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-semibold">Mistress Nyx</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Verified / 4.8 Reputation / Tasks reviewed: 182
                </p>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Discipline-first style. Structured tasks. Clear boundaries.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <p className="text-sm font-semibold">Empress Vale</p>
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Verified / 4.6 Reputation / Tasks reviewed: 141
                </p>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  High-structure programs, clean protocols, consistent feedback.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="safety" className="py-12">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                Safety & Privacy
              </p>
              <h3 className="font-display text-3xl">Non-negotiables</h3>
            </div>
            <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs text-[var(--muted)] md:inline-flex">
              Consent always
            </span>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {safety.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-[var(--card)] p-6"
              >
                <h4 className="font-display text-xl">{item.title}</h4>
                <p className="mt-3 text-sm text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="rounded-3xl border border-white/10 bg-[var(--card)] p-8">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  Launch Checklist
                </p>
                <h3 className="font-display text-3xl">Ready for build-out</h3>
              </div>
              <button className="rounded-full bg-white/10 px-5 py-2 text-sm text-[var(--muted)] transition hover:bg-white/20">
                Export Requirements
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--muted)]">
                Auth: anonymous + account mode
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--muted)]">
                Storage: explicit content library
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--muted)]">
                Moderation: reports + queue
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--muted)]">
                Real-time chat + DM gate
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--muted)]">
                XP + reputation engine
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--muted)]">
                Vaulted content visibility
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-xs text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>
            Neutral demo content only. This platform is 18+ and consent-first.
          </p>
          <p>Privacy-forward / No explicit filenames / Minimal PII</p>
        </div>
      </footer>
    </div>
  );
}
