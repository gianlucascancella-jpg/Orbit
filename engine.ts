import {
  addDays, addMonths, addWeeks, addYears, differenceInCalendarDays,
  eachDayOfInterval, endOfMonth, format, isAfter, isBefore, isWeekend,
  parseISO, startOfDay, startOfMonth
} from "date-fns";
import type { Transaction } from "./types";

export interface Occurrence {
  id: string;
  sourceId: string;
  title: string;
  type: "income" | "expense";
  amount: number;
  nominalDate: Date;
  date: Date;
  category: string;
}

export interface DayState {
  date: Date;
  income: number;
  expense: number;
  balance: number;
  spendable: number;
  events: Occurrence[];
}

export function shiftWeekend(date: Date, enabled: boolean) {
  if (!enabled || !isWeekend(date)) return date;
  return date.getDay() === 6 ? addDays(date, 2) : addDays(date, 1);
}

function occurrencesFor(tx: Transaction, from: Date, to: Date, globalShift: boolean): Occurrence[] {
  if (!tx.active) return [];
  const result: Occurrence[] = [];
  let d = startOfDay(parseISO(tx.date));
  const end = startOfDay(to);
  const first = startOfDay(from);
  while (!isAfter(d, end)) {
    if (!isBefore(d, first)) {
      result.push({
        id: `${tx.id}-${format(d, "yyyy-MM-dd")}`,
        sourceId: tx.id,
        title: tx.title,
        type: tx.type,
        amount: tx.amount,
        nominalDate: d,
        date: shiftWeekend(d, globalShift && tx.shift_weekend),
        category: tx.category
      });
    }
    if (tx.frequency === "once") break;
    if (tx.frequency === "monthly") d = addMonths(d, 1);
    else if (tx.frequency === "weekly") d = addWeeks(d, 1);
    else if (tx.frequency === "yearly") d = addYears(d, 1);
  }
  return result;
}

export function buildDays(transactions: Transaction[], from: Date, to: Date, safetyBuffer = 0, globalShift = true): DayState[] {
  const all = transactions.flatMap(t => occurrencesFor(t, from, to, globalShift));
  let balance = 0;
  return eachDayOfInterval({ start: startOfDay(from), end: startOfDay(to) }).map(date => {
    const events = all.filter(e => format(e.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
    const income = events.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
    const expense = events.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
    balance += income - expense;
    return { date, income, expense, balance, spendable: Math.max(0, balance - safetyBuffer), events };
  });
}

export function buildHorizon(transactions: Transaction[], anchor: Date, safetyBuffer = 0, globalShift = true) {
  const start = startOfDay(anchor);
  const end = endOfMonth(addMonths(start, 2));
  return buildDays(transactions, start, end, safetyBuffer, globalShift);
}

export function todaySpendable(transactions: Transaction[], safetyBuffer = 0, globalShift = true) {
  const today = startOfDay(new Date());
  const horizonStart = addYears(today, -1);
  const days = buildDays(transactions, horizonStart, today, safetyBuffer, globalShift);
  return days.at(-1)?.spendable ?? 0;
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function heat(value: number) {
  if (value >= 1000) return "hot";
  if (value >= 500) return "warm";
  if (value >= 200) return "mild";
  if (value > 0) return "cool";
  return "cold";
}

export function findBestWindows(days: DayState[], minSpend = 150) {
  return days.filter((d, i) => {
    const next = days[i + 1];
    return d.spendable >= minSpend && (!next || next.spendable >= minSpend);
  }).slice(0, 6);
}