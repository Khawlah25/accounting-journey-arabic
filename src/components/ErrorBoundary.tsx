import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 ErrorBoundary: تم اكتشاف خطأ في التطبيق:', error);
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 ErrorBoundary - تفاصيل الخطأ:', error);
    console.error('🚨 ErrorBoundary - معلومات إضافية:', errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🗑️ تم مسح جميع بيانات التخزين المحلي');
      window.location.reload();
    } catch (error) {
      console.error('❌ خطأ في مسح التخزين المحلي:', error);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center max-w-2xl">
            <div className="text-destructive text-6xl mb-4">💥</div>
            <h1 className="text-3xl font-bold text-foreground mb-4">خطأ في النظام</h1>
            <p className="text-muted-foreground mb-6">
              حدث خطأ غير متوقع في النظام. يرجى المحاولة مرة أخرى.
            </p>
            
            {this.state.error && (
              <div className="bg-destructive-light border border-destructive/20 rounded-lg p-4 mb-6 text-right">
                <h3 className="font-medium text-destructive mb-2">تفاصيل الخطأ:</h3>
                <p className="text-sm font-mono text-destructive/80 break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                إعادة تحميل الصفحة
              </button>
              <button
                onClick={this.handleClearStorage}
                className="w-full bg-destructive text-destructive-foreground px-6 py-3 rounded-lg hover:bg-destructive/90 transition-colors font-medium"
              >
                مسح البيانات وإعادة البدء
              </button>
            </div>

            <details className="mt-6 text-right">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                عرض التفاصيل التقنية
              </summary>
              <div className="mt-4 bg-muted rounded-lg p-4 text-sm font-mono text-right">
                <pre className="whitespace-pre-wrap break-all">
                  {this.state.error?.stack}
                </pre>
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;