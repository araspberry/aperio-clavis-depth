import { useEffect, useState, useSyncExternalStore } from "react";

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
};

let state: AppState = defaultState;
let initialized = false;
const listeners = new Set<() => void>();

function load() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...defaultState, ...JSON.parse(raw) };
  } catch {}
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function emit() {
  listeners.forEach((l) => l());
}

export function setState(patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
  emit();
}

export function setProfile(patch: Partial<UserProfile>) {
  state = { ...state, profile: { ...state.profile, ...patch } };
  persist();
  emit();
}

export function addPrayer(p: Omit<PrayerEntry, "id" | "date">) {
  const entry: PrayerEntry = {
    ...p,
    id: Math.random().toString(36).slice(2),
    date: new Date().toISOString(),
  };
  state = { ...state, prayers: [entry, ...state.prayers] };
  persist();
  emit();
  return entry;
}

export function updatePrayer(id: string, patch: Partial<PrayerEntry>) {
  state = {
    ...state,
    prayers: state.prayers.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  };
  persist();
  emit();
}

export function toggleBookmark(ref: string) {
  const has = state.bookmarks.includes(ref);
  state = {
    ...state,
    bookmarks: has ? state.bookmarks.filter((b) => b !== ref) : [...state.bookmarks, ref],
  };
  persist();
  emit();
}

export function setNote(ref: string, text: string) {
  const notes = { ...state.notes };
  if (text.trim()) notes[ref] = text;
  else delete notes[ref];
  state = { ...state, notes };
  persist();
  emit();
}

export function recordReading(book: string, chapter: number, addMinutes = 1) {
  const today = new Date().toDateString();
  let { streak, longestStreak, totalDays, lastReadDate, minutesToday } = state;
  if (lastReadDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    streak = lastReadDate === yesterday.toDateString() ? streak + 1 : 1;
    longestStreak = Math.max(longestStreak, streak);
    totalDays += 1;
    minutesToday = 0;
  }
  state = {
    ...state,
    lastRead: { book, chapter },
    minutesToday: minutesToday + addMinutes,
    streak,
    longestStreak,
    totalDays,
    lastReadDate: today,
  };
  persist();
  emit();
}

export function bumpClavis() {
  state = { ...state, clavisSessions: state.clavisSessions + 1 };
  persist();
  emit();
}

export function resetAll() {
  state = defaultState;
  persist();
  emit();
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
    load();
    setHydrated(true);
  }, []);
  const s = useSyncExternalStore(subscribe, getSnapshot, () => defaultState);
  return hydrated ? s : defaultState;
}