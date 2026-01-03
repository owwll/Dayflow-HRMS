import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; requiresOTP?: boolean; error?: string }>;
    verifyOTP: (otp: string) => Promise<{ success: boolean; error?: string }>;
    signup: (data: any) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = authService.getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await authService.login(email, password);
            // If the backend returns requiresOTP: true, we don't set the user yet
            if (response.requiresOTP) {
                return { success: true, requiresOTP: true };
            }
            // If it doesn't require OTP (e.g. in some dev modes or if already verified), 
            // but usually it will. 
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message || 'Login failed'
            };
        }
    };

    const verifyOTP = async (otp: string) => {
        try {
            const response = await authService.verifyOTP(otp);
            setUser(response.user);
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message || 'OTP verification failed'
            };
        }
    };

    const signup = async (data: any) => {
        // Signup is usually handled by Admin in this HRMS
        return { success: false, error: 'Self-registration is not enabled. Please contact HR.' };
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const updateUser = (updates: Partial<User>) => {
        if (!user) return;
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('dayflow_user_data', JSON.stringify(updatedUser));
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        verifyOTP,
        signup,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
