import { EditorView } from "@/components/EditorView";

interface EditorPageProps {
  onOpenPromptFilter?: () => void;
}

export function EditorPage({ onOpenPromptFilter = () => {} }: EditorPageProps) {
  return <EditorView onOpenPromptFilter={onOpenPromptFilter} />;
}

export default EditorPage;

