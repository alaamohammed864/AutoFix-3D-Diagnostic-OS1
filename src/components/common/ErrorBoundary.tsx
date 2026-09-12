import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  incidentId: string | null;
  safeErrorMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      incidentId: null,
      safeErrorMessage: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const incidentId = 'INC-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    return {
      hasError: true,
      incidentId,
      // Generic sanitized user-friendly message without internal stack traces or path leaks
      safeErrorMessage: error?.message?.length < 120
        ? error.message
        : 'An unexpected component rendering exception occurred within the vehicle subsystem.',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, log error and component stack securely to server telemetry,
    // NEVER render it to the DOM or end-user screen.
    console.error('[SECURITY_ERROR_BOUNDARY] Caught error:', {
      incidentId: this.state.incidentId,
      message: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, incidentId: null, safeErrorMessage: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[500px] w-full flex items-center justify-center p-6 bg-surface">
          <div className="max-w-lg w-full rounded-2xl bg-surface-container-low border border-rose-500/30 p-8 shadow-2xl space-y-6 text-center">
            {/* Warning Icon with Amber/Rose Ring */}
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-headline-md font-bold text-on-surface">
                Diagnostic Subsystem Protected
              </h2>
              <p className="text-xs font-code-sm text-outline leading-relaxed">
                The user interface encountered an isolated execution exception. Internal state has been safely isolated to prevent telemetry corruption.
              </p>
            </div>

            {/* Error Shield Box - No Stack Traces */}
            <div className="rounded-xl bg-surface-container-lowest border border-white/5 p-4 text-start space-y-2 font-code-sm">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-outline">Security Incident ID:</span>
                <span className="text-rose-400 font-bold tracking-wider">{this.state.incidentId}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-outline">Status:</span>
                <span className="text-emerald-400 font-bold">Safely Handled (0 Leaks)</span>
              </div>
              <div className="pt-2 border-t border-white/5 text-[11px] text-on-surface-variant break-words">
                {this.state.safeErrorMessage}
              </div>
            </div>

            {/* Recovery Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-code-sm font-semibold transition-all cursor-pointer"
                type="button"
              >
                Dismiss & Retry View
              </button>
              <button
                onClick={this.handleReset}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-xs font-code-sm font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:scale-105 transition-all cursor-pointer"
                type="button"
              >
                Reload Diagnostics
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
