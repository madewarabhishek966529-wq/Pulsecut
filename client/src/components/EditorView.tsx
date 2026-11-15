import { LeftPanel } from "./LeftPanel";
import { PreviewStage } from "./PreviewStage";
import { Inspector } from "./Inspector";
import { Timeline } from "./Timeline";
import { ErrorBoundary } from "./ErrorBoundary";

interface EditorViewProps {
  onOpenPromptFilter: () => void;
}

export function EditorView({ onOpenPromptFilter }: EditorViewProps) {
  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-0 overflow-hidden">
      {/* Upper Workstage: Left Panel + Center Preview + Right Inspector */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel (Media, Effects, Text, Audio) - 320px */}
        <ErrorBoundary fallbackTitle="Media & Effects Panel Error">
          <LeftPanel onOpenAiFilter={onOpenPromptFilter} />
        </ErrorBoundary>

        {/* Center Preview Viewport Canvas */}
        <ErrorBoundary fallbackTitle="Viewport Stage Error">
          <PreviewStage />
        </ErrorBoundary>

        {/* Right Inspector - 300px */}
        <ErrorBoundary fallbackTitle="Clip Inspector Error">
          <Inspector />
        </ErrorBoundary>
      </div>

      {/* Bottom Timeline - 280px */}
      <ErrorBoundary fallbackTitle="Timeline Track Error">
        <Timeline />
      </ErrorBoundary>
    </div>
  );
}
