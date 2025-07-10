"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface SimpleRichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SimpleRichEditor({ value, onChange, placeholder }: SimpleRichEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [selectedText, setSelectedText] = useState("")

  const insertFormatting = useCallback(
    (before: string, after = "") => {
      const textarea = textareaRef.current
      if (!textarea) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selectedText = textarea.value.substring(start, end)

      const beforeText = textarea.value.substring(0, start)
      const afterText = textarea.value.substring(end)

      const newText = beforeText + before + selectedText + after + afterText
      onChange(newText)

      // Set cursor position after formatting
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + before.length, end + before.length)
      }, 0)
    },
    [onChange],
  )

  const handleBold = () => insertFormatting("**", "**")
  const handleItalic = () => insertFormatting("*", "*")
  const handleUnderline = () => insertFormatting("__", "__")
  const handleBulletList = () => insertFormatting("\n• ", "")
  const handleNumberedList = () => insertFormatting("\n1. ", "")

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "b":
          e.preventDefault()
          handleBold()
          break
        case "i":
          e.preventDefault()
          handleItalic()
          break
        case "u":
          e.preventDefault()
          handleUnderline()
          break
      }
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center gap-1 flex-wrap bg-muted/50">
        <Button variant="ghost" size="sm" onClick={handleBold} className="h-8 w-8 p-0" title="Bold (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleItalic} className="h-8 w-8 p-0" title="Italic (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleUnderline} className="h-8 w-8 p-0" title="Underline (Ctrl+U)">
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button variant="ghost" size="sm" onClick={handleBulletList} className="h-8 w-8 p-0" title="Bullet List">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleNumberedList} className="h-8 w-8 p-0" title="Numbered List">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <div className="text-xs text-muted-foreground px-2">Use **bold**, *italic*, __underline__ for formatting</div>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          placeholder || "Start typing your notes here... Use **bold**, *italic*, __underline__ for formatting"
        }
        className="min-h-[400px] resize-none border-0 focus-visible:ring-0 text-base leading-relaxed font-mono"
      />
    </div>
  )
}
