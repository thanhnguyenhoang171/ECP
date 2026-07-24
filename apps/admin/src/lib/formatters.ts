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
 * Formats a number with thousand separators using dot (.) and decimal separator using comma (,)
 * @param value The value to format
 * @param decimals Number of decimal digits (default 0)
 * @returns Formatted number string (e.g. 1.234.567 or 1.234.567,50)
 */
export const formatNumber = (value?: number | string, decimals: number = 0) => {
  if (value === undefined || value === null || value === '') return '0';
  const num = Number(value);
  if (isNaN(num)) return '0';

  const parts = num.toFixed(decimals).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1] ? `,${parts[1]}` : '';

  return `${integerPart}${decimalPart}`;
};

/**
 * Formats a number into a Vietnamese currency string (VND)
 * Uses dots (.) for thousands and comma (,) for decimals (e.g. 1.234.567 ₫)
 * @param amount The amount to format
 * @param showSymbol Whether to append the '₫' symbol (default true)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount?: number | string, showSymbol: boolean = true) => {
  if (amount === undefined || amount === null || amount === '') {
    return showSymbol ? '0 ₫' : '0';
  }
  const num = Number(amount);
  if (isNaN(num)) return showSymbol ? '0 ₫' : '0';

  // Check if amount has decimals
  const hasDecimals = num % 1 !== 0;
  const formatted = formatNumber(num, hasDecimals ? 2 : 0);

  return showSymbol ? `${formatted} ₫` : formatted;
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
