import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background" data-testid="error-boundary-fallback">
          <div className="text-center space-y-4 p-8">
            <AlertTriangle className="w-16 h-16 text-destructive mx-auto" data-testid="error-icon" />
            <h1 className="text-2xl font-bold" data-testid="error-title">Something went wrong</h1>
            <p className="text-muted-foreground" data-testid="error-message">
              The application encountered an error. Please refresh the page.
            </p>
            <Button onClick={() => window.location.reload()} data-testid="button-refresh">
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
