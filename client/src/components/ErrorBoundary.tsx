import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Pulsecut Panel Crash]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 w-full h-full p-6 flex flex-col items-center justify-center bg-[#121318] text-center select-none border border-[#F87171]/30 rounded-[8px]">
          <span className="material-symbols-outlined text-[36px] text-[#F87171] mb-2">
            bug_report
          </span>
          <h4 className="text-[14px] font-semibold text-[#F4EFEA]">
            {this.props.fallbackTitle || "Panel Encountered an Error"}
          </h4>
          <p className="text-[11px] text-[#9396A5] mt-1 max-w-xs font-mono">
            {this.state.error?.message || "An unexpected rendering fault occurred."}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-4 px-4 py-1.5 rounded-[6px] bg-[#1A1C24] border border-[#262936] hover:border-[#E05A2B] text-[12px] font-medium text-[#F4EFEA] transition-colors"
          >
            Recover Panel
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
