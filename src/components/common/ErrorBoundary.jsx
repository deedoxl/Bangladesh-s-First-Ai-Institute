import React from 'react';
import Button from '../ui/Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        // Nuclear option: clear local storage if data is corrupted causing crash
        if (confirm("This will reset your local settings to fix the crash. Continue?")) {
            localStorage.clear();
            window.location.href = '/';
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-4 text-center">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                    <p className="text-white/60 mb-8 max-w-md">The application encountered a critical error. This is likely due to corrupted local data.</p>
                    <div className="bg-white/5 p-4 rounded-xl border border-red-500/20 mb-8 max-w-lg overflow-auto text-left font-mono text-xs text-red-300">
                        {this.state.error?.toString()}
                    </div>
                    <div className="flex gap-4">
                        <Button onClick={() => window.location.reload()} variant="outline">Reload Page</Button>
                        <Button onClick={this.handleReset} variant="primary" className="bg-red-600 hover:bg-red-700 border-none text-white">Reset App Data</Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
