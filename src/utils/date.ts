export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

export function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

export function getCurrentDayRange(): { start: string; end: string } {
  const today = new Date();
  return {
    start: formatDate(today),
    end: formatDate(today)
  };
}

export function getDateRange(type: 'day' | 'week' | 'month'): { start: string; end: string } {
  switch (type) {
    case 'day':
      return getCurrentDayRange();
    case 'week':
      return getCurrentWeekRange();
    case 'month':
      return getCurrentMonthRange();
    default:
      return getCurrentMonthRange();
  }
}