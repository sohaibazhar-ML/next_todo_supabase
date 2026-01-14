/**
 * DOCX Editor Toolbar Component
 * Contains all formatting buttons for the TipTap editor
 */

'use client'

import { Editor } from '@tiptap/react'

interface DocxToolbarProps {
  editor: Editor
}

export default function DocxToolbar({ editor }: DocxToolbarProps) {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1.5 text-sm rounded font-semibold transition-colors ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1.5 text-sm rounded italic transition-colors ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Italic"
          >
            I
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`px-3 py-1.5 text-sm rounded underline transition-colors ${editor.isActive('underline') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Underline"
          >
            U
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`px-3 py-1.5 text-sm rounded line-through transition-colors ${editor.isActive('strike') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Strikethrough"
          >
            S
          </button>
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Align Left"
          >
            ←
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Align Center"
          >
            ↔
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Align Right"
          >
            →
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Justify"
          >
            ≡
          </button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`px-3 py-1.5 text-sm rounded font-bold transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`px-3 py-1.5 text-sm rounded font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`px-3 py-1.5 text-sm rounded font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Bullet List"
          >
            •
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900 hover:bg-gray-100'}`}
            title="Numbered List"
          >
            1.
          </button>
        </div>

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || '#000000'}
            className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
            title="Text Color"
          />
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="px-3 py-1.5 text-sm rounded text-gray-900 hover:bg-gray-100 transition-colors"
            title="Remove Color"
          >
            🎨
          </button>
        </div>
      </div>
    </div>
  )
}

