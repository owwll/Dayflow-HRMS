import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function EmailVerification() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || 'your email';
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = () => {
    // In a real app, this would verify via a link in email
    // For demo purposes, we'll simulate verification
    const users = JSON.parse(localStorage.getItem('dayflow_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex !== -1) {
      users[userIndex].isVerified = true;
      localStorage.setItem('dayflow_users', JSON.stringify(users));
      setIsVerified(true);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <span className="text-xl font-bold text-primary-foreground">D</span>
              </div>
              <span className="text-2xl font-semibold text-foreground">Dayflow</span>
            </Link>
          </div>

          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You can now sign in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/signin')} className="w-full">
                Continue to Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <span className="text-xl font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-2xl font-semibold text-foreground">Dayflow</span>
          </Link>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent a verification link to <strong className="text-foreground">{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in your email to verify your account. If you don't see it, check your spam folder.
            </p>

            {/* Demo button - in real app this would be handled via email link */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">
                Demo Mode: Click below to simulate email verification
              </p>
              <Button onClick={handleVerify} variant="outline" className="w-full">
                Verify Email (Demo)
              </Button>
            </div>

            <div className="text-center text-sm">
              <Link to="/signin" className="text-muted-foreground hover:text-primary">
                ← Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
