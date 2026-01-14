/**
 * DOCX Editor Component
 * Main component for editing DOCX documents using TipTap
 */

'use client'

import { EditorContent } from '@tiptap/react'
import { Editor } from '@tiptap/react'
import DocxToolbar from './DocxToolbar'

interface DocxEditorProps {
  editor: Editor | null
}

export default function DocxEditor({ editor }: DocxEditorProps) {
  if (!editor) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <DocxToolbar editor={editor} />
      <div className="p-8 min-h-[600px] prose prose-sm max-w-none text-gray-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

