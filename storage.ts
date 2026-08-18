import type { AppState, Transaction } from "./types";
import { supabase } from "./supabase";

const KEY = "orbit-budget-v1";

const seed: AppState = {
  settings: { weekendShift: true, currency: "EUR", safetyBuffer: 0 },
  transactions: [
    { id: "demo-income-1", title: "Stipendio", type: "income", amount: 1500, date: "2026-08-27", frequency: "monthly", category: "Lavoro", shift_weekend: true, active: true },
    { id: "demo-income-2", title: "Entrata familiare", type: "income", amount: 900, date: "2026-08-20", frequency: "monthly", category: "Familia", shift_weekend: true, active: true },
    { id: "demo-expense-1", title: "Affitto / mutuo", type: "expense", amount: 650, date: "2026-08-05", frequency: "monthly", category: "Casa", shift_weekend: true, active: true },
    { id: "demo-expense-2", title: "Finanziamento", type: "expense", amount: 500, date: "2026-08-10", frequency: "monthly", category: "Finanza", shift_weekend: true, active: true },
    { id: "demo-expense-3", title: "Spesa alimentare", type: "expense", amount: 180, date: "2026-08-22", frequency: "once", category: "Casa", shift_weekend: true, active: true }
  ]
};

export function loadLocal(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(KEY, JSON.stringify(seed));
  return seed;
}

export function saveLocal(state: AppState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export async function loadCloud(userId: string): Promise<AppState> {
  if (!supabase) return loadLocal();
  const [{ data: tx, error: txError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from("transactions").select("*").eq("user_id", userId).order("date"),
    supabase.from("profiles").select("weekend_shift,currency,safety_buffer").eq("id", userId).maybeSingle()
  ]);
  if (txError) throw txError;
  if (settingsError) throw settingsError;
  return {
    transactions: (tx ?? []) as Transaction[],
    settings: {
      weekendShift: settings?.weekend_shift ?? true,
      currency: settings?.currency ?? "EUR",
      safetyBuffer: Number(settings?.safety_buffer ?? 0)
    }
  };
}

export async function upsertTransaction(userId: string, tx: Transaction) {
  if (!supabase) return;
  const { error } = await supabase.from("transactions").upsert({ ...tx, user_id: userId }, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteTransaction(id: string) {
  if (!supabase) return;
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function saveSettings(userId: string, state: AppState) {
  if (!supabase) {
    saveLocal(state);
    return;
  }
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    weekend_shift: state.settings.weekendShift,
    currency: state.settings.currency,
    safety_buffer: state.settings.safetyBuffer
  }, { onConflict: "id" });
  if (error) throw error;
}