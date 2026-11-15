import { useState, useEffect } from "react";
import { TopBar } from "./components/TopBar";
import { EditorView } from "./components/EditorView";
import { DashboardView } from "./components/DashboardView";
import { LandingPageView } from "./components/LandingPageView";
import { PromptToFilterModal } from "./components/PromptToFilterModal";
import { ExportDialog } from "./components/ExportDialog";
import { ShortcutsModal } from "./components/ShortcutsModal";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  const [activeView, setActiveView] = useState<"editor" | "dashboard" | "landing">("editor");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPromptFilterOpen, setIsPromptFilterOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global '?' shortcut cheat sheet trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsExportOpen(false);
        setIsPromptFilterOpen(false);
        setIsShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-[#0B0C10] text-[#F4EFEA] overflow-hidden">
      {/* Global Top Bar */}
      <TopBar
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenAiFilter={() => setIsPromptFilterOpen(true)}
      />

      {/* Main View Area with Error Boundary */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <ErrorBoundary fallbackTitle="View Failed to Render">
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
        </ErrorBoundary>
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

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
