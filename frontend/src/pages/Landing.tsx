import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowRight, 
  Users, 
  Clock, 
  CalendarDays, 
  Wallet,
  CheckCircle2,
  Shield,
  Zap
} from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: Users,
      title: 'Employee Management',
      description: 'Manage employee profiles, documents, and organizational structure.',
    },
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Simple check-in/out with real-time tracking and reports.',
    },
    {
      icon: CalendarDays,
      title: 'Leave Management',
      description: 'Streamlined leave requests with approval workflows.',
    },
    {
      icon: Wallet,
      title: 'Payroll System',
      description: 'Accurate salary processing with detailed pay slips.',
    },
  ];

  const benefits = [
    { icon: CheckCircle2, text: 'Easy to use interface' },
    { icon: Shield, text: 'Role-based access control' },
    { icon: Zap, text: 'Real-time updates' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">D</span>
            </div>
            <span className="text-xl font-semibold">Dayflow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
            Simplify Your{' '}
            <span className="text-primary">HR Management</span>{' '}
            Today
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Dayflow is a modern, easy-to-use Human Resource Management System designed 
            for growing teams. Manage employees, attendance, leaves, and payroll all in one place.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/signin">
                View Demo
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2">
                <benefit.icon className="h-4 w-4 text-primary" />
                <span>{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Everything You Need</h2>
            <p className="mt-3 text-muted-foreground">
              Comprehensive HR tools to manage your workforce efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-card p-6 rounded-xl border shadow-sm">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="bg-primary rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mt-3 text-primary-foreground/80 max-w-xl mx-auto">
              Join thousands of companies using Dayflow to streamline their HR operations.
            </p>
            <Button size="lg" variant="secondary" className="mt-8" asChild>
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
              <span className="text-xs font-bold text-primary-foreground">D</span>
            </div>
            <span className="font-semibold">Dayflow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Dayflow HRMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
