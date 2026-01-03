import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight } from 'lucide-react';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyOTP() {
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyOTP, user, isAuthenticated } = useAuth();

    const email = location.state?.email || '';
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect to dashboard after successful authentication
    useEffect(() => {
        if (isAuthenticated && user) {
            const dashboardPath = user.role === 'admin' || user.role === 'ADMIN' ? '/admin' : '/dashboard';
            navigate(dashboardPath, { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setError('');
        setIsLoading(true);
        const result = await verifyOTP(otp);
        setIsLoading(false);

        if (!result.success) {
            setError(result.error || 'Verification failed');
        }
        // Redirect will be handled by useEffect when user state updates
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link to="/signin" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                            <span className="text-xl font-bold text-primary-foreground">D</span>
                        </div>
                        <span className="text-2xl font-semibold text-foreground">Dayflow</span>
                    </Link>
                </div>

                <Card className="border-border shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Enter OTP</CardTitle>
                        <CardDescription>
                            We've sent a 6-digit code to <strong className="text-foreground">{email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(v) => setOtp(v)}
                                    disabled={isLoading}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    <>
                                        Verify OTP
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <div className="text-center text-sm">
                                <p className="text-muted-foreground">
                                    Didn't receive the code?{' '}
                                    <button type="button" className="font-medium text-primary hover:underline">
                                        Resend OTP
                                    </button>
                                </p>
                                <Link to="/signin" className="inline-block mt-4 text-muted-foreground hover:text-primary">
                                    ← Back to Sign In
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
