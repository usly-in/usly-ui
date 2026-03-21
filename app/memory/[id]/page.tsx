"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Loader2, Lock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import api from "@/lib/api";
import type { ContentItem } from "@/types";

export default function MemoryDetailPage() {
  const params = useParams();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/content/${params.id}`)
      .then((r) => setItem(r.data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  let backHref = "/letters";
  if (item?.type === "moment") backHref = "/moments";
  else if (item?.type === "chapter") backHref = "/chapters";

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <Loader2 className="w-6 h-6 text-[#e4a0a0] animate-spin" />
    </div>
  );

  if (!item) return (
    <div className="p-8 text-center text-[#888]">Memory not found.</div>
  );

  if (item.locked) {
    return (
      <div className="p-6 md:p-8 max-w-2xl">
        <Link href={backHref} className="inline-flex items-center gap-2 mb-8 text-sm text-[#888] hover:text-[#f5f5f5]">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-[#2a2a2a]">
          <Lock className="w-8 h-8 text-[#e4a0a0] mb-4" />
          <h2 className="text-xl font-light text-[#f5f5f5] mb-2">This is sealed</h2>
          <p className="text-sm text-[#888]">
            Opens {item.openAt ? format(new Date(item.openAt), "MMMM d, yyyy") : "soon"}
          </p>
        </div>
      </div>
    );
  }

  const isMoment = item.type === "moment";
  let allImages: { fullUrl: string }[];
  if (item.images && item.images.length > 0) {
    allImages = item.images;
  } else if (item.imageUrl) {
    allImages = [{ fullUrl: item.imageUrl }];
  } else {
    allImages = [];
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl">
      <Link href={backHref} className="inline-flex items-center gap-2 mb-8 text-sm text-[#888] hover:text-[#f5f5f5] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {/* Moment: photo grid */}
        {isMoment && allImages.length > 0 && (
          <div className={`mb-6 gap-2 ${allImages.length === 1 ? "block" : "grid grid-cols-2"}`}>
            {allImages.map((img) => (
              <img
                key={img.fullUrl}
                src={img.fullUrl}
                alt={item.title}
                className={`w-full object-cover rounded-2xl ${allImages.length === 1 ? "max-h-112" : "h-52"}`}
              />
            ))}
          </div>
        )}

        {/* Non-moment: single image */}
        {!isMoment && item.imageUrl && (
          <img src={item.imageUrl} alt={item.title} className="w-full rounded-2xl object-cover mb-6 max-h-96" />
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
