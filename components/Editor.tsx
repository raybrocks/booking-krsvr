"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import "react-quill/dist/quill.snow.css";
import { Loader2 } from "lucide-react";

// Dynamically import react-quill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { 
  ssr: false, 
  loading: () => <div className="h-64 flex items-center justify-center border border-zinc-800 rounded-xl bg-zinc-900/50"><Loader2 className="w-6 h-6 animate-spin text-[#9C39FF]" /></div> 
});

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  return (
    <div className="bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 focus-within:border-[#9C39FF] focus-within:ring-1 focus-within:ring-[#9C39FF] transition-all">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
        className="text-white"
      />
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #27272a !important;
          background: #18181b;
          font-family: inherit;
        }
        .ql-container.ql-snow {
          border: none !important;
          min-height: 200px;
          font-family: inherit;
          font-size: 1rem;
        }
        .ql-editor {
          min-height: 200px;
        }
        .ql-editor.ql-blank::before {
          color: #71717a !important;
          font-style: normal;
        }
        .ql-snow .ql-stroke {
          stroke: #a1a1aa !important;
        }
        .ql-snow .ql-fill, .ql-snow .ql-stroke.ql-fill {
          fill: #a1a1aa !important;
        }
        .ql-snow .ql-picker {
          color: #a1a1aa !important;
        }
        .ql-snow .ql-picker-options {
          background-color: #18181b !important;
          border-color: #27272a !important;
        }
        .ql-snow .ql-picker-item.ql-selected, .ql-snow .ql-picker-item:hover, .ql-snow .ql-picker-label.ql-active, .ql-snow .ql-picker-label:hover {
          color: #9C39FF !important;
        }
        .ql-snow .ql-picker-item.ql-selected .ql-stroke, .ql-snow .ql-picker-item:hover .ql-stroke, .ql-snow .ql-picker-label.ql-active .ql-stroke, .ql-snow .ql-picker-label:hover .ql-stroke {
          stroke: #9C39FF !important;
        }
        .ql-snow .ql-picker-item.ql-selected .ql-fill, .ql-snow .ql-picker-item:hover .ql-fill, .ql-snow .ql-picker-label.ql-active .ql-fill, .ql-snow .ql-picker-label:hover .ql-fill {
          fill: #9C39FF !important;
        }
        button.ql-active .ql-stroke { stroke: #9C39FF !important; }
        button.ql-active .ql-fill { fill: #9C39FF !important; }
        button:hover .ql-stroke { stroke: #9C39FF !important; }
        button:hover .ql-fill { fill: #9C39FF !important; }
      `}</style>
    </div>
  );
}
