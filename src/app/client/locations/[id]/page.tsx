import { ClientLocationEditorView } from "./ClientLocationEditorView";

export default async function ClientLocationEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientLocationEditorView id={id} />;
}
