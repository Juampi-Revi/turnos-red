export function normalizeDateInput(raw: string): string | null {
  const value = raw.trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/;
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

  if (iso.test(value)) {
    return value;
  }

  const match = value.match(dmy);
  if (!match) {
    return null;
  }

  const day = match[1].padStart(2, '0');
  const month = match[2].padStart(2, '0');
  const year = match[3];
  return `${year}-${month}-${day}`;
}

export function normalizeTimeInput(raw: string): string | null {
  const value = raw.trim().replace('.', ':');
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
