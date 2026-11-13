import { LeftPanel } from "./LeftPanel";
import { PreviewStage } from "./PreviewStage";
import { Inspector } from "./Inspector";
import { Timeline } from "./Timeline";

interface EditorViewProps {
  onOpenPromptFilter: () => void;
}

export function EditorView({ onOpenPromptFilter }: EditorViewProps) {
  return (
    <div className="flex-1 w-full h-full flex flex-col min-h-0 overflow-hidden">
      {/* Upper Workstage: Left Panel + Center Preview + Right Inspector */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Left Panel (Media, Effects, Text, Audio) - 320px */}
        <LeftPanel onOpenAiFilter={onOpenPromptFilter} />

        {/* Center Preview Viewport Canvas */}
        <PreviewStage />

        {/* Right Inspector - 300px */}
        <Inspector />
      </div>

      {/* Bottom Timeline - 280px */}
      <Timeline />
    </div>
  );
}

