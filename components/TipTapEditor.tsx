"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading1, Heading2, List, ListOrdered,
  Quote, Minus, Link2, AlignLeft, AlignCenter, AlignRight, Undo, Redo,
} from "lucide-react";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  height?: number;
}

function ToolbarButton({
  onClick, active, title, children,
}: Readonly<{ onClick: () => void; active?: boolean; title: string; children: React.ReactNode }>) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${
        active
          ? "bg-[#e4a0a0]/20 text-[#e4a0a0]"
          : "text-[#888] hover:text-[#f5f5f5] hover:bg-[#2a2a2a]"
      }`}
    >
      {children}
    </button>
  );
}

export function TipTapEditor({ value, onChange, placeholder = "Write something…", height = 400 }: Readonly<TipTapEditorProps>) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "outline-none min-h-full text-[#f5f5f5] text-sm leading-relaxed px-5 py-4 prose prose-invert prose-sm max-w-none",
      },
    },
    onUpdate({ editor: e }) {
      onChange(e.getHTML());
    },
  });

  // Sync external value changes (e.g. reset on form clear)
  useEffect(() => {
    if (!editor) return;
    if (value === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.clearContent();
    }
  }, [value, editor]);

  if (!editor) return null;

  const iconSize = "w-3.5 h-3.5";

  const setLink = () => {
    const url = globalThis.prompt("URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-[#2a2a2a] bg-[#1c1c1c]">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Bold className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Italic className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
          <UnderlineIcon className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#2a2a2a] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
          <Heading1 className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
          <Heading2 className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#2a2a2a] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <List className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">
          <ListOrdered className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
          <Quote className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">
          <Minus className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#2a2a2a] mx-1" />

        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Link">
          <Link2 className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#2a2a2a] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left">
          <AlignLeft className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center">
          <AlignCenter className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right">
          <AlignRight className={iconSize} />
        </ToolbarButton>

        <div className="w-px h-4 bg-[#2a2a2a] mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
          <Undo className={iconSize} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
          <Redo className={iconSize} />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <EditorContent
        editor={editor}
        style={{ minHeight: height }}
        className="flex-1 overflow-y-auto [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:text-[#555] [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}
