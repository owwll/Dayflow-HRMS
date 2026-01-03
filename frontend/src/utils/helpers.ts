import { format, parse, isValid } from 'date-fns';
import { DATE_FORMATS } from './constants';

/**
 * Format date for display
 */
export const formatDate = (date: string | Date, formatStr: string = DATE_FORMATS.DISPLAY): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!isValid(dateObj)) return '';

    return format(dateObj, formatStr);
};

/**
 * Format date for API
 */
export const formatDateForAPI = (date: Date | string): string => {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (!isValid(dateObj)) return '';

    return format(dateObj, DATE_FORMATS.API);
};

/**
 * Get user's current location
 */
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * Get initials from name
 */
export const getInitials = (firstName?: string | null, lastName?: string | null): string => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    
    if (!first && !last) {
        return 'U'; // Unknown/User
    }
    
    if (!first) {
        return last.charAt(0).toUpperCase();
    }
    
    if (!last) {
        return first.charAt(0).toUpperCase();
    }
    
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSize: number): boolean => {
    return file.size <= maxSize;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Download file from URL
 */
export const downloadFile = (url: string, filename: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

/**
 * Get greeting based on time
 */
export const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

/**
 * Calculate work hours between two times
 */
export const calculateWorkHours = (checkIn: string, checkOut: string): number => {
    const checkInTime = new Date(`2000-01-01 ${checkIn}`);
    const checkOutTime = new Date(`2000-01-01 ${checkOut}`);

    const diff = checkOutTime.getTime() - checkInTime.getTime();
    return diff / (1000 * 60 * 60); // Convert to hours
};

/**
 * Get status color
 */
export const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('approved') || statusLower.includes('present') || statusLower.includes('active')) {
        return 'success';
    }
    if (statusLower.includes('rejected') || statusLower.includes('absent') || statusLower.includes('terminated')) {
        return 'error';
    }
    if (statusLower.includes('pending') || statusLower.includes('half')) {
        return 'warning';
    }
    if (statusLower.includes('leave')) {
        return 'info';
    }

    return 'default';
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};
