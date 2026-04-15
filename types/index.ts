// Extend next-auth types to include custom fields
import "next-auth";
import "next-auth/jwt";

export type GroupType = "lover" | "family" | "friends" | "custom";

export interface UserGroup {
  tenantId: string;
  userId: string;
  role: "admin" | "member";
  groupType: GroupType;
  name: string; // tenant name
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      role: "admin" | "member";
      groups: UserGroup[];
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    tenantId?: string;
    role?: "admin" | "member";
    picture?: string | null;
    groups?: UserGroup[];
  }
}

// Tenant
export interface Tenant {
  tenantId: string;
  name: string;
  createdAt: string;
  subscriptionPlan: "free" | "premium";
  coverPhotoUrl?: string;
  theme?: string;
  groupType?: GroupType;
  startDate?: string;
}

// User
export interface User {
  userId: string;
  email: string;
  name: string;
  tenantId: string;
  role: "admin" | "member";
  createdAt: string;
  avatarUrl?: string;
}

// Content
export type ContentType = "moment" | "chapter" | "letter";

export interface ImageMeta {
  fullUrl: string;
  // thumbUrl removed — sprite is the only thumbnail artefact
}

export interface SpriteManifest {
  sheetUrl: string;
  cols: number;
  thumbW: number;
  thumbH: number;
  cells: { x: number; y: number; w: number; h: number }[];
}

export interface ContentItem {
  tenantId: string;
  contentId: string;
  type: ContentType;
  title: string;
  content?: string;
  imageUrl?: string;         // full-res of first image (backward compat)
  images?: ImageMeta[];      // all images
  spriteUrl?: string;        // sprite sheet URL
  spriteManifest?: SpriteManifest;
  caption?: string;
  createdAt: string;
  createdBy: string;
  eventDate?: string;
  openAt?: string;           // ISO date — letter is locked until this date
  locked?: boolean;          // computed by backend when openAt is in future
  templateId?: string;       // built-in template used to create this moment
  templateData?: Record<string, unknown>; // opaque template fields (from S3 meta.json on detail)
}

// Invitation
export type InvitationStatus = "pending" | "accepted" | "revoked";

export interface Invitation {
  inviteId: string;
  tenantId: string;
  email: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface UploadResponse {
  images: ImageMeta[];
  sprite?: SpriteManifest;
  /** {fieldName: s3Url} for every named non-gallery file uploaded */
  fileUploads?: Record<string, string | string[]>;
}
