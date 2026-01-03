import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export function PageContainer({ children, className, title, description }: PageContainerProps) {
  return (
    <div className={cn('flex-1 p-6 md:p-8', className)}>
      {(title || description) && (
        <div className="mb-6">
          {title && <h1 className="text-2xl font-semibold text-foreground">{title}</h1>}
          {description && <p className="mt-1 text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
