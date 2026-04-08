import { signIn, signUp, createGuest } from "@/app/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const errorMessages: Record<string, string> = {
  invalid: "Check your entries and try again.",
  exists: "That username is already taken.",
};

export default function AuthPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams?.error ? errorMessages[searchParams.error] : null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
              Access Gate
            </p>
            <h1 className="font-display text-4xl">Enter the Protocol</h1>
            <p className="text-sm text-[var(--muted)]">
              18+ only. Femdom-first. Safeword is "RED" and always active.
              Anonymous entry is allowed.
            </p>
            {error ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-[var(--accent)]">
                {error}
              </div>
            ) : null}
            <form
              action={createGuest}
              className="rounded-3xl border border-white/10 bg-[var(--card)] p-6"
            >
              <h2 className="font-display text-2xl">Anonymous Entry</h2>
              <p className="mt-2 text-xs text-[var(--muted)]">
                No account. Minimal data stored.
              </p>
              <div className="mt-4 grid gap-3">
                <label className="text-xs uppercase tracking-wide text-[var(--muted)]">
                  Role
                </label>
                <select
                  name="role"
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  defaultValue="neutral"
                >
                  <option value="dom">Dom</option>
                  <option value="sub">Sub</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <button className="mt-6 w-full rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black">
                Enter Anonymously
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <form
              action={signIn}
              className="rounded-3xl border border-white/10 bg-[var(--card)] p-6"
            >
              <h2 className="font-display text-2xl">Sign In</h2>
              <div className="mt-4 grid gap-3">
                <input
                  name="username"
                  placeholder="Username"
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  required
                />
              </div>
              <button className="mt-6 w-full rounded-full border border-white/10 px-4 py-2 text-sm">
                Sign In
              </button>
            </form>

            <form
              action={signUp}
              className="rounded-3xl border border-white/10 bg-[var(--card)] p-6"
            >
              <h2 className="font-display text-2xl">Create Account</h2>
              <div className="mt-4 grid gap-3">
                <input
                  name="username"
                  placeholder="Username"
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  required
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  required
                />
                <select
                  name="role"
                  className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-sm"
                  defaultValue="neutral"
                >
                  <option value="dom">Dom</option>
                  <option value="sub">Sub</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <button className="mt-6 w-full rounded-full bg-white/10 px-4 py-2 text-sm">
                Create Account
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
