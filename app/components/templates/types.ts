export interface TemplateProps {
  title: string;
  caption?: string;
  /** Plain text or TipTap HTML. Templates handle both in view mode. */
  story?: string;
  /** Image URLs (blob preview while editing, S3 URLs when viewing). */
  images?: string[];
  eventDate?: string;
  editMode?: boolean;
  onTitleChange?: (v: string) => void;
  onCaptionChange?: (v: string) => void;
  onStoryChange?: (v: string) => void;
  /** Called when user clicks an image slot — parent opens file picker. */
  onImageSlotClick?: (index: number) => void;
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
