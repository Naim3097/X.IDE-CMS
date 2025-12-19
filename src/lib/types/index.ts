export type UserRole = 'agency' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  clientId?: string; // If role is client
}

export interface Client {
  id: string;
  name: string;
  email: string;
  branding: {
    logoUrl?: string;
    primaryColor?: string;
  };
}

export interface ContentMonth {
  id: string;
  clientId: string;
  name: string; // e.g., "October 2025"
  year: number;
  month: number;
  allocation: number; // e.g., 15 pieces
  status: 'active' | 'archived';
}

export type ContentStatus = 
  | 'waiting_for_direction' // Client needs to fill inputs
  | 'agency_prep'           // Person A or B working
  | 'client_review'         // Submitted as Draft X
  | 'changes_requested'     // Client requested changes
  | 'approved';             // Final

export type MediaType = 'image' | 'video';

export interface MediaItem {
  url: string;
  type: MediaType;
}

export interface ContentDirection {
  topic: string;
  style: string;
  references?: string;
}

export interface AgencyWork {
  visualHeadline?: string; // Person A
  copywriting?: string;    // Person A
  media?: MediaItem[];     // Person B (Supports multiple items for carousel)
}

export interface ContentDraft {
  number: number;
  work: AgencyWork;
  submittedAt: number;
  status: 'pending' | 'approved' | 'changes_requested';
  feedback?: string;
}

export interface ContentPiece {
  id: string;
  monthId: string;
  index: number; // Piece #1, #2, etc.
  status: ContentStatus;
  direction?: ContentDirection;
  currentWork: AgencyWork;
  drafts: ContentDraft[];
  finalApprovedVersion?: number;
}
