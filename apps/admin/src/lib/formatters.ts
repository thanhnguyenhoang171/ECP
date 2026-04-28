/**
 * Formats a date string into a localized format (vi-VN)
 * @param dateString The date string to format
 * @returns Formatted date string or '---' if input is invalid
 */
export const formatDate = (dateString?: string | Date) => {
  if (!dateString) return '---';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return typeof dateString === 'string' ? dateString : '---';
  }
};

/**
 * Formats a number into a currency string (VND)
 * @param amount The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount?: number) => {
  if (amount === undefined || amount === null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

/**
 * Formats a number with thousand separators
 * @param value The value to format
 * @returns Formatted number string
 */
export const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
};

/**
 * Formats a date for use in filenames (DD-MM-YYYY_HH-mm-ss)
 * Note: Uses hyphens instead of slashes because slashes are invalid in filenames
 * @param date The date to format
 * @returns Formatted string suitable for filenames
 */
export const formatDateTimeForFilename = (date: Date = new Date()) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  
  return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
};
