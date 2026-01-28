/**
 * DOCX Editor View
 * 
 * Presentational component for DOCX document editing.
 * Uses TipTap editor for rich text editing.
 * 
 * Responsibilities:
 * - Render DOCX editor interface
 * - Display TipTap editor
 */

'use client'

import type { Editor } from '@tiptap/react'
import DocxEditor from './DocxEditor'

interface DocxEditorViewProps {
  editor: Editor
}

export default function DocxEditorView({ editor }: DocxEditorViewProps) {
  return <DocxEditor editor={editor} />
}
