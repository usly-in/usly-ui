"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Lock, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import api from "@/lib/api";
import type { ContentItem } from "@/types";
import { useSession } from "next-auth/react";

export default function LetterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [letter, setLetter] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/api/letters/${params.id}`)
      .then((r) => setLetter(r.data))
      .catch(() => setLetter(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this letter?")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/letters/${params.id}`);
      router.push("/letters");
    } catch {
      alert("Failed to delete letter.");
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <Loader2 className="w-6 h-6 text-[#e4a0a0] animate-spin" />
    </div>
  );

  if (!letter) return (
    <div className="p-8 text-center text-[#888]">Letter not found.</div>
  );

  if (letter.locked) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <Link href="/letters" className="inline-flex items-center gap-2 mb-8 text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">
          <ArrowLeft className="w-4 h-4" /> Letters
        </Link>
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[#2a2a2a]">
          <div className="w-16 h-16 rounded-2xl bg-[#e4a0a0]/10 flex items-center justify-center mb-5">
            <Lock className="w-8 h-8 text-[#e4a0a0]" />
          </div>
          <h2 className="text-xl font-light text-[#f5f5f5] mb-2">This letter is sealed</h2>
          <p className="text-sm text-[#888] max-w-xs">
            It will open on{" "}
            <span className="text-[#e4a0a0]">
              {letter.openAt ? format(new Date(letter.openAt), "MMMM d, yyyy") : "a future date"}
            </span>
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <Link href="/letters" className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#2a2a2a] text-[#888] hover:text-[#f5f5f5] hover:border-[#888]/40 transition-all">
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
        <h1 className="text-3xl font-light tracking-tight text-[#f5f5f5] mb-3">{letter.title}</h1>
        <div className="flex items-center gap-1.5 text-xs text-[#888] mb-8">
          <Calendar className="w-3.5 h-3.5" />
          {letter.openAt
            ? `Opened ${format(new Date(letter.openAt), "MMMM d, yyyy")}`
            : format(new Date(letter.createdAt), "MMMM d, yyyy")}
        </div>

        <div className="rounded-2xl border border-[#e4a0a0]/20 bg-[#141414] p-6">
            <div
              className="prose prose-invert prose-sm max-w-none text-[#f5f5f5]"
              dangerouslySetInnerHTML={{ __html: letter.content ?? "" }}
            />
          </div>
      </motion.article>
    </div>
  );
}
