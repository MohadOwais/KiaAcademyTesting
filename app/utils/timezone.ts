import axios from 'axios';

export interface Timezone {
  value: string;
  label: string;
}

/**
 * Fetches timezones from the TimezoneDB API
 * @returns Promise<Timezone[]> Array of formatted timezone objects
 */
export const fetchTimezones = async (): Promise<Timezone[]> => {
  try {
    const response = await axios.get('https://api.timezonedb.com/v2.1/list-time-zone?key=U3XB8OHVWVAD&format=json');

    if (response.data?.zones) {
      const zones = response.data.zones;
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const formattedTimezones: Timezone[] = [
        {
          value: userTimezone,
          label: `${userTimezone} (Your timezone)`
        },
        ...zones
          .filter((tz: any) => tz.zoneName !== userTimezone)
          .sort((a: any, b: any) => a.gmtOffset - b.gmtOffset)
          .map((tz: any) => ({
            value: tz.zoneName,
            label: `${tz.zoneName} (GMT${tz.gmtOffset >= 0 ? '+' : ''}${tz.gmtOffset / 3600})`
          }))
      ];

      return formattedTimezones;
    } else {
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('Timezone fetch error:', error);
    throw new Error('Failed to fetch timezones');
  }
};

/**
 * Gets the user's current timezone
 * @returns string The user's timezone identifier
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Formats a timezone offset for display
 * @param offsetSeconds Timezone offset in seconds
 * @returns string Formatted offset string (e.g., "GMT+5:30")
 */
export const formatTimezoneOffset = (offsetSeconds: number): string => {
  const hours = Math.floor(offsetSeconds / 3600);
  const minutes = Math.abs(Math.floor((offsetSeconds % 3600) / 60));
  const sign = offsetSeconds >= 0 ? '+' : '-';
  
  if (minutes === 0) {
    return `GMT${sign}${Math.abs(hours)}`;
  } else {
    return `GMT${sign}${Math.abs(hours)}:${minutes.toString().padStart(2, '0')}`;
  }
};

/**
 * Converts a date to a specific timezone
 * @param date Date to convert
 * @param timezone Target timezone
 * @returns Date object in the target timezone
 */
export const convertToTimezone = (date: Date, timezone: string): Date => {
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  const targetTime = new Date(utc + (new Date().toLocaleString("en-US", { timeZone: timezone })));
  return targetTime;
};

/**
 * Gets timezone options for a select dropdown
 * @returns Promise<Timezone[]> Array of timezone options
 */
export const getTimezoneOptions = async (): Promise<Timezone[]> => {
  try {
    return await fetchTimezones();
  } catch (error) {
    // Fallback to basic timezones if API fails
    const basicTimezones: Timezone[] = [
      { value: 'UTC', label: 'UTC (GMT+0)' },
      { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
      { value: 'America/Chicago', label: 'America/Chicago (GMT-6)' },
      { value: 'America/Denver', label: 'America/Denver (GMT-7)' },
      { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
      { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
      { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
      { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
      { value: 'Asia/Shanghai', label: 'Asia/Shanghai (GMT+8)' },
      { value: 'Asia/Kolkata', label: 'Asia/Kolkata (GMT+5:30)' },
      { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10)' },
    ];
    
    const userTimezone = getUserTimezone();
    if (!basicTimezones.find(tz => tz.value === userTimezone)) {
      basicTimezones.unshift({
        value: userTimezone,
        label: `${userTimezone} (Your timezone)`
      });
    }
    
    return basicTimezones;
  }
}; 