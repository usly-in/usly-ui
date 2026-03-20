"use client";

import dynamic from "next/dynamic";
import type { MDEditorProps } from "@uiw/react-md-editor";

// Dynamically import to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });
const MDPreview = dynamic(() => import("@uiw/react-md-editor").then((m) => m.default.Markdown), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (val: string) => void;
  preview?: boolean;
  height?: number;
}

export function MarkdownEditor({ value, onChange, height = 400 }: MarkdownEditorProps) {
  return (
    <div data-color-mode="dark" className="markdown-editor-wrapper">
      <style>{`
        .markdown-editor-wrapper .w-md-editor {
          background: #141414;
          border: 1px solid #2a2a2a;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: none;
          color: #f5f5f5;
        }
        .markdown-editor-wrapper .w-md-editor-toolbar {
          background: #1c1c1c;
          border-bottom: 1px solid #2a2a2a;
        }
        .markdown-editor-wrapper .w-md-editor-toolbar li > button {
          color: #888;
        }
        .markdown-editor-wrapper .w-md-editor-toolbar li > button:hover {
          color: #f5f5f5;
          background: #2a2a2a;
        }
        .markdown-editor-wrapper .w-md-editor-content {
          background: #141414;
        }
        .markdown-editor-wrapper .w-md-editor-text-input {
          background: transparent;
          color: #f5f5f5;
        }
        .markdown-editor-wrapper .w-md-editor-preview {
          background: #141414;
          color: #f5f5f5;
        }
      `}</style>
      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        height={height}
        preview="live"
      />
    </div>
  );
}

export { MDPreview };
