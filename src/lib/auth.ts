"use server";

import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createId, now, readDB, updateDB, type User } from "@/lib/store";

const SESSION_COOKIE = "webapp_session";
const SESSION_DAYS = Number(process.env.SESSION_DURATION_DAYS || "7");

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);
export const verifyPassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const createSession = async (userId: string) => {
  const token = crypto.randomUUID() + crypto.randomUUID();
  const expiresAt = addDays(SESSION_DAYS);
  const isProd = process.env.NODE_ENV === "production";

  await updateDB((db) => {
    db.sessions.push({
      id: createId(),
      userId,
      token,
      createdAt: now(),
      expiresAt,
    });
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    expires: new Date(expiresAt),
  });
};

export const clearSession = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await updateDB((db) => {
      db.sessions = db.sessions.filter((session) => session.token !== token);
    });
  }
  cookieStore.delete(SESSION_COOKIE);
};

const sanitizeUser = (user: User) => {
  const { passwordHash, ...rest } = user;
  return rest;
};

export const getUser = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await readDB();
  const session = db.sessions.find((item) => item.token === token);
  if (!session) return null;

  if (new Date(session.expiresAt) < new Date()) {
    return null;
  }

  const user = db.users.find((item) => item.id === session.userId);
  if (!user) return null;

  return sanitizeUser(user);
};

export const requireUser = async () => {
  const user = await getUser();
  if (!user) {
    redirect("/auth");
  }
  return user;
};
