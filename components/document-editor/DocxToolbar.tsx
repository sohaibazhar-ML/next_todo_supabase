/**
 * DOCX Editor Toolbar Component
 * Contains all formatting buttons for the TipTap editor
 */

'use client'

import { Editor } from '@tiptap/react'
import { IconButton } from '@/components/ui'
import { THEME } from '@/constants/theme'

interface DocxToolbarProps {
  editor: Editor
}

export default function DocxToolbar({ editor }: DocxToolbarProps) {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <IconButton
            icon={<span className="font-semibold">B</span>}
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            tooltip="Bold"
            size="sm"
          />
          <IconButton
            icon={<span className="italic">I</span>}
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            tooltip="Italic"
            size="sm"
          />
          <IconButton
            icon={<span className="underline">U</span>}
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            tooltip="Underline"
            size="sm"
          />
          <IconButton
            icon={<span className="line-through">S</span>}
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            tooltip="Strikethrough"
            size="sm"
          />
        </div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <IconButton
            icon={<span>←</span>}
            active={editor.isActive({ textAlign: 'left' })}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            tooltip="Align Left"
            size="sm"
          />
          <IconButton
            icon={<span>↔</span>}
            active={editor.isActive({ textAlign: 'center' })}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            tooltip="Align Center"
            size="sm"
          />
          <IconButton
            icon={<span>→</span>}
            active={editor.isActive({ textAlign: 'right' })}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            tooltip="Align Right"
            size="sm"
          />
          <IconButton
            icon={<span>≡</span>}
            active={editor.isActive({ textAlign: 'justify' })}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            tooltip="Justify"
            size="sm"
          />
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <IconButton
            icon={<span className="font-bold">H1</span>}
            active={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            tooltip="Heading 1"
            size="sm"
          />
          <IconButton
            icon={<span className="font-bold">H2</span>}
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            tooltip="Heading 2"
            size="sm"
          />
          <IconButton
            icon={<span className="font-bold">H3</span>}
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            tooltip="Heading 3"
            size="sm"
          />
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
          <IconButton
            icon={<span>•</span>}
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            tooltip="Bullet List"
            size="sm"
          />
          <IconButton
            icon={<span>1.</span>}
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            tooltip="Numbered List"
            size="sm"
          />
        </div>

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            value={editor.getAttributes('textStyle').color || THEME.COLORS.ANNOTATION.BLACK}
            className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
            title="Text Color"
          />
          <IconButton
            icon={<span>🎨</span>}
            onClick={() => editor.chain().focus().unsetColor().run()}
            tooltip="Remove Color"
            size="sm"
          />
        </div>
      </div>
    </div>
  )
}

