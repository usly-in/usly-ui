"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import api from "@/lib/api";
import type { ContentItem } from "@/types";
import { useSession } from "next-auth/react";

interface Props { id: string }

export default function ClientPage({ id }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [chapter, setChapter] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/api/chapters/${id}`)
      .then((r) => setChapter(r.data))
      .catch(() => setChapter(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this chapter?")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/chapters/${id}`);
      router.push("/chapters");
    } catch {
      alert("Failed to delete chapter.");
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <Loader2 className="w-6 h-6 text-[#e4a0a0] animate-spin" />
    </div>
  );

  if (!chapter) return (
    <div className="p-8 text-center text-[#888]">Chapter not found.</div>
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <Link href="/chapters" className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] hover:border-[#888]/40 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        {session?.user?.role === "admin" && (
          <button onClick={handleDelete} disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-[#888] hover:text-red-400 hover:bg-red-400/10 transition-all border border-[#2a2a2a]">
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        )}
      </div>

      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-light tracking-tight text-[#f5f5f5] mb-3">{chapter.title}</h1>
        <div className="flex items-center gap-1.5 text-xs text-[#888] mb-8">
          <Calendar className="w-3.5 h-3.5" />
          {chapter.eventDate
            ? format(new Date(chapter.eventDate), "MMMM d, yyyy")
            : format(new Date(chapter.createdAt), "MMMM d, yyyy")}
        </div>

        {chapter.imageUrl && (
          <img src={chapter.imageUrl} alt={chapter.title}
            className="w-full rounded-2xl object-cover mb-8 max-h-80" />
        )}

        <div
          className="prose prose-invert prose-sm max-w-none text-[#f5f5f5]"
          dangerouslySetInnerHTML={{ __html: chapter.content ?? "" }}
        />
      </motion.article>
    </div>
  );
}
