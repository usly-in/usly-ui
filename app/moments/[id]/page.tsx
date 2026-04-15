"use client";

export function generateStaticParams() { return []; }

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import api from "@/lib/api";
import type { ContentItem } from "@/types";
import MomentTemplateRenderer from "../MomentTemplateRenderer";

export default function MomentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get(`/api/moments/${params.id}`)
      .then((r) => setItem(r.data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Delete this moment? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/moments/${item!.contentId}`);
      router.push("/moments");
    } catch {
      alert("Failed to delete moment.");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-64">
        <Loader2 className="w-6 h-6 text-[#e4a0a0] animate-spin" />
      </div>
    );
  }

  if (!item) {
    return <div className="p-8 text-center text-[#888]">Moment not found.</div>;
  }

  const isCreator = session?.user?.id === item.createdBy;

  // Build flat image URL list for template renderer and generic layout
  let allImages: { fullUrl: string }[];
  if (item.images && item.images.length > 0) {
    allImages = item.images;
  } else if (item.imageUrl) {
    allImages = [{ fullUrl: item.imageUrl }];
  } else {
    allImages = [];
  }
  const imageUrls = allImages.map((img) => img.fullUrl);

  const backButton = (
    <div className="flex items-center justify-between mb-8">
      <Link
        href="/moments"
        className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-[#f5f5f5] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      {isCreator && (
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-40"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          Delete
        </button>
      )}
    </div>
  );

  // Template moment — render inside visual template
  if (item.templateId) {
    return (
      <div className="p-6 md:p-8">
        {backButton}
        <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <MomentTemplateRenderer
            templateId={item.templateId}
            templateData={item.templateData}
            title={item.title}
            caption={item.caption}
            story={item.content}
            images={imageUrls}
            eventDate={item.eventDate}
          />
        </motion.article>
      </div>
    );
  }

  // Custom (no-template) moment — generic layout
  return (
    <div className="p-6 md:p-8">
      {backButton}
      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {allImages.length > 0 && (
          <div className={`mb-6 gap-2 ${allImages.length === 1 ? "block" : "grid grid-cols-2"}`}>
            {allImages.map((img) => (
              <img
                key={img.fullUrl}
                src={img.fullUrl}
                alt={item.title}
                className={`w-full object-cover rounded-2xl ${allImages.length === 1 ? "max-h-[28rem]" : "h-52"}`}
              />
            ))}
          </div>
        )}

        <h1 className="text-3xl font-light tracking-tight text-[#f5f5f5] mb-3">{item.title}</h1>
        {item.caption && (
          <p className="text-base text-[#888] italic mb-4">{item.caption}</p>
        )}
        <div className="flex items-center gap-1.5 text-xs text-[#888] mb-8">
          <Calendar className="w-3.5 h-3.5" />
          {item.eventDate
            ? format(new Date(item.eventDate), "MMMM d, yyyy")
            : format(new Date(item.createdAt), "MMMM d, yyyy")}
        </div>

        {item.content && (
          <div
            className="prose prose-invert prose-sm max-w-none text-[#f5f5f5]"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        )}
      </motion.article>
    </div>
  );
}
