import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ClavisTone = "scholarly" | "devotional" | "balanced" | "auto";

export interface UserProfile {
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  city: string;
  state: string;
  country: string;
  profession: string;
  denomination: string;
  reasons: string[];
  journey: string;
  translation: string;
  topics: string[];
  dailyMinutes: number;
  setDailyGoal: boolean;
  clavisTone: ClavisTone;
  onboarded: boolean;
  memberSince: string;
}

export interface PrayerEntry {
  id: string;
  date: string;
  text: string;
  category: string;
  status: "praying" | "answered" | "in_progress";
  scripture?: string;
  forWhom?: string;
  answeredText?: string;
  answeredDate?: string;
}

export interface AppState {
  profile: UserProfile;
  prayers: PrayerEntry[];
  bookmarks: string[]; // "book ch:v"
  notes: Record<string, string>;
  lastRead: { book: string; chapter: number };
  minutesToday: number;
  streak: number;
  longestStreak: number;
  totalDays: number;
  clavisSessions: number;
  lastReadDate: string;
  userId: string | null;
  loading: boolean;
}

const STORAGE_KEY = "aperio:v1";

const defaultState: AppState = {
  profile: {
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    profession: "",
    denomination: "",
    reasons: [],
    journey: "",
    translation: "BSB",
    topics: [],
    dailyMinutes: 15,
    setDailyGoal: true,
    clavisTone: "balanced",
    onboarded: false,
    memberSince: new Date().toISOString(),
  },
  prayers: [],
  bookmarks: [],
  notes: {},
  lastRead: { book: "John", chapter: 1 },
  minutesToday: 0,
  streak: 0,
  longestStreak: 0,
  totalDays: 0,
  clavisSessions: 0,
  lastReadDate: "",
  userId: null,
  loading: true,
};

let state: AppState = defaultState;
let initialized = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setStateInternal(patch: Partial<AppState>) {
  state = { ...state, ...patch };
  emit();
}

// ---- Cloud sync ----

function rowToProfile(r: any): UserProfile {
  return {
    firstName: r.first_name ?? "",
    lastName: r.last_name ?? "",
    dob: r.dob ?? "",
    gender: r.gender ?? "",
    city: r.city ?? "",
    state: r.state ?? "",
    country: r.country ?? "",
    profession: r.profession ?? "",
    denomination: r.denomination ?? "",
    reasons: r.reasons ?? [],
    journey: r.journey ?? "",
    translation: r.translation ?? "BSB",
    topics: r.topics ?? [],
    dailyMinutes: r.daily_minutes ?? 15,
    setDailyGoal: r.set_daily_goal ?? true,
    clavisTone: (r.clavis_tone ?? "balanced") as ClavisTone,
    onboarded: r.onboarded ?? false,
    memberSince: r.member_since ?? new Date().toISOString(),
  };
}

function profileToRow(p: Partial<UserProfile>): Record<string, any> {
  const out: Record<string, any> = {};
  if (p.firstName !== undefined) out.first_name = p.firstName;
  if (p.lastName !== undefined) out.last_name = p.lastName;
  if (p.dob !== undefined) out.dob = p.dob;
  if (p.gender !== undefined) out.gender = p.gender;
  if (p.city !== undefined) out.city = p.city;
  if (p.state !== undefined) out.state = p.state;
  if (p.country !== undefined) out.country = p.country;
  if (p.profession !== undefined) out.profession = p.profession;
  if (p.denomination !== undefined) out.denomination = p.denomination;
  if (p.reasons !== undefined) out.reasons = p.reasons;
  if (p.journey !== undefined) out.journey = p.journey;
  if (p.translation !== undefined) out.translation = p.translation;
  if (p.topics !== undefined) out.topics = p.topics;
  if (p.dailyMinutes !== undefined) out.daily_minutes = p.dailyMinutes;
  if (p.setDailyGoal !== undefined) out.set_daily_goal = p.setDailyGoal;
  if (p.clavisTone !== undefined) out.clavis_tone = p.clavisTone;
  if (p.onboarded !== undefined) out.onboarded = p.onboarded;
  if (p.memberSince !== undefined) out.member_since = p.memberSince;
  return out;
}

function rowToPrayer(r: any): PrayerEntry {
  return {
    id: r.id,
    date: r.created_at,
    text: r.text,
    category: r.category,
    status: r.status,
    scripture: r.scripture ?? undefined,
    forWhom: r.for_whom ?? undefined,
    answeredText: r.answered_text ?? undefined,
    answeredDate: r.answered_date ?? undefined,
  };
}

async function loadAll(userId: string) {
  setStateInternal({ loading: true, userId });
  const [profileRes, prayersRes, bookmarksRes, notesRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("prayers").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    supabase.from("bookmarks").select("reference").eq("user_id", userId),
    supabase.from("notes").select("reference, content").eq("user_id", userId),
  ]);

  const profile = profileRes.data ? rowToProfile(profileRes.data) : defaultState.profile;
  const stats: any = profileRes.data ?? {};
  const notes: Record<string, string> = {};
  (notesRes.data ?? []).forEach((n: any) => { notes[n.reference] = n.content; });

  setStateInternal({
    userId,
    profile,
    prayers: (prayersRes.data ?? []).map(rowToPrayer),
    bookmarks: (bookmarksRes.data ?? []).map((b: any) => b.reference),
    notes,
    lastRead: { book: stats.last_read_book ?? "John", chapter: stats.last_read_chapter ?? 1 },
    minutesToday: stats.minutes_today ?? 0,
    streak: stats.streak ?? 0,
    longestStreak: stats.longest_streak ?? 0,
    totalDays: stats.total_days ?? 0,
    clavisSessions: stats.clavis_sessions ?? 0,
    lastReadDate: stats.last_read_date ?? "",
    loading: false,
  });
}

function clearAll() {
  state = { ...defaultState, loading: false };
  emit();
}

export function initAuthSync() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      void loadAll(session.user.id);
    } else {
      clearAll();
    }
  });

  void supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) void loadAll(session.user.id);
    else setStateInternal({ loading: false });
  });
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  emit();
}

export async function setProfile(patch: Partial<UserProfile>) {
  state = { ...state, profile: { ...state.profile, ...patch } };
  emit();

  let userId = state.userId;
  if (!userId) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    userId = session?.user?.id ?? null;
    if (userId) setStateInternal({ userId });
  }

  if (!userId) throw new Error("You need to be signed in to save onboarding.");

  const row = { id: userId, ...profileToRow(patch) };
  const { data, error } = await supabase
    .from("profiles")
    .upsert(row as never, { onConflict: "id" })
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (data) {
    state = { ...state, profile: rowToProfile(data) };
    emit();
  }
}

export async function addPrayer(p: Omit<PrayerEntry, "id" | "date">) {
  if (!state.userId) return null;
  const { data, error } = await supabase
    .from("prayers")
    .insert({
      user_id: state.userId,
      text: p.text,
      category: p.category,
      status: p.status,
      scripture: p.scripture ?? null,
      for_whom: p.forWhom ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  const entry = rowToPrayer(data);
  state = { ...state, prayers: [entry, ...state.prayers] };
  emit();
  return entry;
}

export async function updatePrayer(id: string, patch: Partial<PrayerEntry>) {
  state = {
    ...state,
    prayers: state.prayers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
  emit();
  if (!state.userId) return;
  const row: Record<string, any> = {};
  if (patch.text !== undefined) row.text = patch.text;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.scripture !== undefined) row.scripture = patch.scripture;
  if (patch.forWhom !== undefined) row.for_whom = patch.forWhom;
  if (patch.answeredText !== undefined) row.answered_text = patch.answeredText;
  if (patch.answeredDate !== undefined) row.answered_date = patch.answeredDate;
  await supabase.from("prayers").update(row as never).eq("id", id);
}

export async function toggleBookmark(ref: string) {
  const has = state.bookmarks.includes(ref);
  state = {
    ...state,
    bookmarks: has ? state.bookmarks.filter((b) => b !== ref) : [...state.bookmarks, ref],
  };
  emit();
  if (!state.userId) return;
  if (has) {
    await supabase.from("bookmarks").delete().eq("user_id", state.userId).eq("reference", ref);
  } else {
    await supabase.from("bookmarks").insert({ user_id: state.userId, reference: ref });
  }
}

export async function setNote(ref: string, text: string) {
  const notes = { ...state.notes };
  if (text.trim()) notes[ref] = text;
  else delete notes[ref];
  state = { ...state, notes };
  emit();
  if (!state.userId) return;
  if (text.trim()) {
    await supabase
      .from("notes")
      .upsert({ user_id: state.userId, reference: ref, content: text }, { onConflict: "user_id,reference" });
  } else {
    await supabase.from("notes").delete().eq("user_id", state.userId).eq("reference", ref);
  }
}

export function recordReading(book: string, chapter: number, addMinutes = 1) {
  const today = new Date().toDateString();
  const { lastReadDate } = state;
  let { streak, longestStreak, totalDays, minutesToday } = state;
  if (lastReadDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    streak = lastReadDate === yesterday.toDateString() ? streak + 1 : 1;
    longestStreak = Math.max(longestStreak, streak);
    totalDays += 1;
    minutesToday = 0;
  }
  minutesToday = minutesToday + addMinutes;
  state = {
    ...state,
    lastRead: { book, chapter },
    minutesToday,
    streak,
    longestStreak,
    totalDays,
    lastReadDate: today,
  };
  emit();
  if (state.userId) {
    void supabase.from("profiles").update({
      last_read_book: book,
      last_read_chapter: chapter,
      minutes_today: minutesToday,
      streak,
      longest_streak: longestStreak,
      total_days: totalDays,
      last_read_date: today,
    }).eq("id", state.userId);
  }
}

export function bumpClavis() {
  const next = state.clavisSessions + 1;
  state = { ...state, clavisSessions: next };
  emit();
  if (state.userId) {
    void supabase.from("profiles").update({ clavis_sessions: next }).eq("id", state.userId);
  }
}

export async function resetAll() {
  if (!state.userId) return;
  const uid = state.userId;
  await Promise.all([
    supabase.from("prayers").delete().eq("user_id", uid),
    supabase.from("bookmarks").delete().eq("user_id", uid),
    supabase.from("notes").delete().eq("user_id", uid),
    supabase.from("profiles").update({
      onboarded: false, first_name: "", last_name: "", topics: [], reasons: [],
      streak: 0, longest_streak: 0, total_days: 0, minutes_today: 0, clavis_sessions: 0,
    }).eq("id", uid),
  ]);
  await loadAll(uid);
}

export async function signOut() {
  await supabase.auth.signOut();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

export function useAperio(): AppState {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    initAuthSync();
    setHydrated(true);
  }, []);
  const s = useSyncExternalStore(subscribe, getSnapshot, () => defaultState);
  return hydrated ? s : defaultState;
}
