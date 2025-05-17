import React, { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md text-center">
            <h2 className="text-xl font-semibold text-red-700 mb-4">
              ¡Algo salió mal!
            </h2>
            <p className="text-gray-600 mb-4">
              Ocurrió un error inesperado. Por favor, intenta de nuevo o
              contacta al soporte.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Error: {this.state.error?.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
