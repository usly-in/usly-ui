"use client";

import type { ComponentType } from "react";
import { TEMPLATE_MAP } from "./templates";
import type { TemplateProps } from "./templates";

interface Props extends Omit<TemplateProps, "editMode"> {
  templateId: string;
  /** Full templateData from S3 — fields are spread into the template component
   *  so EnergyRush-specific props (tags, highlights, stats, timeline, cta,
   *  heroBackground, heroImages) are restored from storage. */
  templateData?: Record<string, unknown>;
}

/**
 * Renders a saved moment inside its visual template (view mode only).
 * If the templateId is unknown, returns null (caller should fall back to generic layout).
 */
export default function MomentTemplateRenderer({
  templateId,
  templateData,
  ...props
}: Props) {
  // Cast to any so EnergyRush-specific extra props in templateData pass through
  // without TypeScript complaining about the base TemplateProps contract.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Component = TEMPLATE_MAP[templateId] as ComponentType<any> | undefined;
  if (!Component) return null;
  // templateData is spread first so explicit props (title, caption, story, images)
  // always win over anything stored in templateData with the same key.
  return <Component {...(templateData ?? {})} {...props} editMode={false} />;
}
