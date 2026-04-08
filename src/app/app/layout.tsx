import { requireUser } from "@/lib/auth";
import { signOut } from "@/app/actions";

export const runtime = "nodejs";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
              Webapp
            </p>
            <h1 className="font-display text-xl">Control Center</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            <span className="rounded-full border border-white/10 px-3 py-1">
              {user.username}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              {user.role.toUpperCase()}
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              XP {user.xp}
            </span>
            <form action={signOut}>
              <button className="rounded-full border border-white/10 px-3 py-1 text-xs">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
