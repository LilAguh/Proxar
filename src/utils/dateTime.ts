const DEFAULT_TIME_ZONE = 'America/Argentina/Buenos_Aires';

export const getCompanyTimeZone = (timeZoneId?: string) => timeZoneId || DEFAULT_TIME_ZONE;

export const getBusinessDayBounds = (timeZoneId?: string) => {
  const timeZone = getCompanyTimeZone(timeZoneId);
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value ?? '1970';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  const localStart = new Date(`${year}-${month}-${day}T00:00:00`);
  const localEnd = new Date(`${year}-${month}-${day}T23:59:59.999`);

  return {
    timeZone,
    startDate: localStart.toISOString(),
    endDate: localEnd.toISOString(),
    businessDate: `${year}-${month}-${day}`,
  };
};

export const formatDateInTimeZone = (date: string, timeZoneId?: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-AR', {
    timeZone: getCompanyTimeZone(timeZoneId),
    ...options,
  }).format(new Date(date));
