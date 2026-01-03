import crypto from 'crypto';

/**
 * Generate Login ID in format: OT + First2Last2 + Year + Serial
 * Example: OTTODO20250001
 */
export const generateLoginId = (firstName: string, lastName: string, year: number, serial: number): string => {
    const first2 = firstName.substring(0, 2).toUpperCase();
    const last2 = lastName.substring(0, 2).toUpperCase();
    const serialStr = serial.toString().padStart(4, '0');
    return `OT${first2}${last2}${year}${serialStr}`;
};

/**
 * Generate a random secure password
 */
export const generatePassword = (length: number = 10): string => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Generate 6-digit OTP
 */
export const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

/**
 * Calculate work hours between check-in and check-out
 */
export const calculateWorkHours = (checkIn: Date, checkOut: Date, breakMinutes: number = 60): number => {
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const breakHours = breakMinutes / 60;
    return Math.max(0, diffHours - breakHours);
};

/**
 * Calculate extra hours beyond standard working hours
 */
export const calculateExtraHours = (workHours: number, standardHours: number = 8): number => {
    return Math.max(0, workHours - standardHours);
};

/**
 * Calculate number of days between two dates
 */
export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

/**
 * Get month-year string in format YYYY-MM
 */
export const getMonthYear = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
};

/**
 * Convert number to words (for payslip)
 */
export const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    if (num === 0) return 'Zero';

    const crores = Math.floor(num / 10000000);
    const lakhs = Math.floor((num % 10000000) / 100000);
    const thousands = Math.floor((num % 100000) / 1000);
    const hundreds = Math.floor((num % 1000) / 100);
    const remainder = num % 100;

    let words = '';

    if (crores > 0) {
        words += convertTwoDigit(crores) + ' Crore ';
    }
    if (lakhs > 0) {
        words += convertTwoDigit(lakhs) + ' Lakh ';
    }
    if (thousands > 0) {
        words += convertTwoDigit(thousands) + ' Thousand ';
    }
    if (hundreds > 0) {
        words += ones[hundreds] + ' Hundred ';
    }
    if (remainder > 0) {
        if (remainder < 10) {
            words += ones[remainder];
        } else if (remainder < 20) {
            words += teens[remainder - 10];
        } else {
            words += tens[Math.floor(remainder / 10)] + ' ' + ones[remainder % 10];
        }
    }

    function convertTwoDigit(n: number): string {
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
    }

    return words.trim() + ' Rupees Only';
};

/**
 * Get start and end dates of a month
 */
export const getMonthDateRange = (year: number, month: number): { start: Date; end: Date } => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
};

/**
 * Calculate pro-rated amount based on payable days
 */
export const calculateProRatedAmount = (
    monthlyAmount: number,
    totalDays: number,
    payableDays: number
): number => {
    return (monthlyAmount / totalDays) * payableDays;
};
