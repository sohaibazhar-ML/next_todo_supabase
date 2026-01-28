/**
 * Document Editor Component
 * 
 * Main entry point for document editing.
 * Re-exports DocumentEditorContainer for backward compatibility.
 * 
 * This component has been refactored into smaller, focused components:
 * - DocumentEditorContainer: Main orchestration and state management
 * - DocxEditorView: DOCX-specific editing interface
 * - PdfEditorView: PDF-specific viewing and annotation interface
 */

export { default } from './document-editor/DocumentEditorContainer'
