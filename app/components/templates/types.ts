export interface TemplateProps {
  readonly title: string;
  readonly caption?: string;
  /** Plain text or TipTap HTML. Templates handle both in view mode. */
  readonly story?: string;
  /** Image URLs (blob preview while editing, S3 URLs when viewing). */
  readonly images?: readonly string[];
  readonly eventDate?: string;
  readonly editMode?: boolean;
  readonly onTitleChange?: (v: string) => void;
  readonly onCaptionChange?: (v: string) => void;
  readonly onStoryChange?: (v: string) => void;
  /** Called when user clicks an image slot — parent opens file picker. */
  readonly onImageSlotClick?: (index: number) => void;
}

export interface TemplateEntry {
  id: string;
  name: string;
  tag: string;
  emoji: string;
  placeholders: {
    title: string;
    caption: string;
    story: string;
  };
}
