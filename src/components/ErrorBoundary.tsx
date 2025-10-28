"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Error Boundary caught an error:", error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // TODO: Log error to error reporting service (Sentry, LogRocket, etc.)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                    <Card className="max-w-lg w-full">
                        <div className="text-center">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                We're sorry for the inconvenience. The application encountered
                                an unexpected error.
                            </p>

                            {/* Error details (only in development) */}
                            {process.env.NODE_ENV === "development" && this.state.error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                                    <p className="font-mono text-sm text-red-800 dark:text-red-300 mb-2">
                                        <strong>Error:</strong> {this.state.error.message}
                                    </p>
                                    {this.state.errorInfo && (
                                        <details className="text-xs text-red-700 dark:text-red-400">
                                            <summary className="cursor-pointer font-semibold mb-2">
                                                Stack Trace
                                            </summary>
                                            <pre className="overflow-auto max-h-40 whitespace-pre-wrap">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            {/* Action buttons */}
                            <div className="flex gap-3 justify-center">
                                <Button onClick={this.handleReset} variant="primary">
                                    Try Again
                                </Button>
                                <Button
                                    onClick={() => (window.location.href = "/")}
                                    variant="secondary"
                                >
                                    Go Home
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Hook version for functional components
 * Usage: Wrap around components that might throw errors
 */
export function withErrorBoundary<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryComponent(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <Component {...props} />
            </ErrorBoundary>
        );
    };
}




