"use client";

import { TEMPLATE_MAP } from "@/app/components/templates";
import type { TemplateProps } from "@/app/components/templates";

interface Props extends Omit<TemplateProps, "editMode"> {
  templateId: string;
}

/**
 * Renders a saved moment inside its visual template (view mode only).
 * If the templateId is unknown, returns null (caller should fall back to generic layout).
 */
export default function MomentTemplateRenderer({ templateId, ...props }: Props) {
  const Component = TEMPLATE_MAP[templateId];
  if (!Component) return null;
  return <Component {...props} editMode={false} />;
}
