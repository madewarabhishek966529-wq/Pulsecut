import { motion, AnimatePresence } from "framer-motion";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    category: "Playback & Navigation",
    shortcuts: [
      { key: "Space", desc: "Toggle Play / Pause" },
      { key: "← / →", desc: "Step 1 frame backward / forward" },
      { key: "Shift + ← / →", desc: "Jump 1 second backward / forward" },
      { key: "Home / End", desc: "Jump to beginning / end of project" },
    ],
  },
  {
    category: "Editing & Timeline",
    shortcuts: [
      { key: "S", desc: "Split clip at playhead" },
      { key: "Delete / Backspace", desc: "Delete selected clip" },
      { key: "Ctrl + Z", desc: "Undo last edit" },
      { key: "Ctrl + Y / Shift+Ctrl+Z", desc: "Redo" },
      { key: "Arrow Keys", desc: "Nudge selected clip by 1px (Shift: 10px)" },
    ],
  },
  {
    category: "Tools & Views",
    shortcuts: [
      { key: "?", desc: "Open keyboard shortcuts cheat sheet" },
      { key: "Esc", desc: "Deselect clip / Close open modal" },
    ],
  },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-full max-w-[640px] rounded-[14px] glass border border-[#262936] bg-[#121318]/95 shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col select-none"
        >
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-[#262936]">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[20px] text-[#E05A2B]">keyboard</span>
              <h3 className="font-semibold text-[16px] text-[#F4EFEA]">Keyboard Shortcuts</h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#9396A5] hover:text-[#F4EFEA] hover:bg-[#1A1C24] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.category} className="space-y-2.5">
                <h4 className="text-[12px] font-semibold text-[#E05A2B] uppercase tracking-wider font-mono">
                  {group.category}
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {group.shortcuts.map((s) => (
                    <div
                      key={s.key}
                      className="flex items-center justify-between p-2 rounded-[6px] bg-[#1A1C24] border border-[#262936]"
                    >
                      <span className="text-[12px] text-[#9396A5]">{s.desc}</span>
                      <kbd className="px-2 py-0.5 rounded bg-[#0B0C10] border border-[#262936] font-mono text-[11px] text-[#F4EFEA] shadow-xs">
                        {s.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#262936] bg-[#0B0C10]/60 flex items-center justify-between text-[11px] text-[#9396A5]">
            <span>Press <kbd className="px-1.5 py-0.2 rounded bg-[#1A1C24] border border-[#262936] font-mono text-[#F4EFEA]">?</kbd> anywhere to open this sheet</span>
            <button
              onClick={onClose}
              className="btn-primary px-4 py-1 text-[12px] text-[#0B0C10] font-semibold"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
