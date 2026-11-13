import { useState } from "react";
import { TopBar } from "./components/TopBar";
import { EditorView } from "./components/EditorView";
import { DashboardView } from "./components/DashboardView";
import { LandingPageView } from "./components/LandingPageView";
import { PromptToFilterModal } from "./components/PromptToFilterModal";
import { ExportDialog } from "./components/ExportDialog";

export default function App() {
  const [activeView, setActiveView] = useState<"editor" | "dashboard" | "landing">("editor");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPromptFilterOpen, setIsPromptFilterOpen] = useState(false);

  return (
    <div className="h-full w-full flex flex-col bg-[#0B0C10] text-[#F4EFEA] overflow-hidden">
      {/* Global Top Bar */}
      <TopBar
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAiFilter={() => setIsPromptFilterOpen(true)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {activeView === "editor" && (
          <EditorView onOpenPromptFilter={() => setIsPromptFilterOpen(true)} />
        )}
        {activeView === "dashboard" && (
          <DashboardView
            onOpenEditor={() => setActiveView("editor")}
            onOpenPromptFilter={() => setIsPromptFilterOpen(true)}
          />
        )}
        {activeView === "landing" && (
          <LandingPageView onStartEditing={() => setActiveView("editor")} />
        )}
      </div>

      {/* Modals & Dialogs */}
      <PromptToFilterModal
        isOpen={isPromptFilterOpen}
        onClose={() => setIsPromptFilterOpen(false)}
      />

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
}
