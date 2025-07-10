"use client"

import type React from "react"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered } from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditorFocused, setIsEditorFocused] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const executeCommand = useCallback(
    (command: string, value?: string) => {
      if (!mounted || !editorRef.current) return

      try {
        document.execCommand(command, false, value)
        editorRef.current.focus()
        handleContentChange()
      } catch (error) {
        console.warn("Command execution failed:", error)
      }
    },
    [mounted],
  )

  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }, [onChange])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            executeCommand("bold")
            break
          case "i":
            e.preventDefault()
            executeCommand("italic")
            break
          case "u":
            e.preventDefault()
            executeCommand("underline")
            break
        }
      }
    },
    [executeCommand],
  )

  // Only update content if it's different and we're not focused
  useEffect(() => {
    if (mounted && editorRef.current && !isEditorFocused) {
      const currentContent = editorRef.current.innerHTML
      if (currentContent !== value) {
        editorRef.current.innerHTML = value || ""
      }
    }
  }, [value, isEditorFocused, mounted])

  if (!mounted) {
    return (
      <div className="border rounded-lg overflow-hidden bg-background">
        <div className="border-b p-2 flex items-center gap-1 flex-wrap">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
        </div>
        <div className="min-h-[400px] p-4 bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b p-2 flex items-center gap-1 flex-wrap">
        <Button variant="ghost" size="sm" onClick={() => executeCommand("bold")} className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("italic")} className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("underline")} className="h-8 w-8 p-0">
          <Underline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button variant="ghost" size="sm" onClick={() => executeCommand("justifyLeft")} className="h-8 w-8 p-0">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("justifyCenter")} className="h-8 w-8 p-0">
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("justifyRight")} className="h-8 w-8 p-0">
          <AlignRight className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button variant="ghost" size="sm" onClick={() => executeCommand("insertUnorderedList")} className="h-8 w-8 p-0">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => executeCommand("insertOrderedList")} className="h-8 w-8 p-0">
          <ListOrdered className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <select
          className="h-8 px-2 text-sm border rounded bg-background"
          onChange={(e) => executeCommand("fontSize", e.target.value)}
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Extra Large</option>
        </select>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[400px] p-4 focus:outline-none prose prose-sm max-w-none dark:prose-invert"
        onInput={handleContentChange}
        onFocus={() => setIsEditorFocused(true)}
        onBlur={() => setIsEditorFocused(false)}
        onKeyDown={handleKeyDown}
        suppressContentEditableWarning={true}
        style={{ minHeight: "400px" }}
      >
        {!value && !isEditorFocused && (
          <div className="text-muted-foreground pointer-events-none absolute">
            {placeholder || "Start typing your notes here..."}
          </div>
        )}
      </div>
    </div>
  )
}
