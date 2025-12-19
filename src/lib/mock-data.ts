import { Client, ContentMonth, ContentPiece, UserProfile } from './types';

export const MOCK_ADMIN_USER: UserProfile = {
  uid: 'admin-123',
  email: 'sales@nexovadigital.com',
  role: 'agency'
};

export const MOCK_CLIENT_USER: UserProfile = {
  uid: 'client-123',
  email: 'client@demo.com',
  role: 'client',
  clientId: '1'
};

export const MOCK_CLIENTS: Client[] = [
  { 
    id: '1', 
    name: 'Acme Corp', 
    email: 'marketing@acme.com',
    branding: { primaryColor: '#ff0000' }
  },
  { 
    id: '2', 
    name: 'TechStart Inc', 
    email: 'hello@techstart.io',
    branding: { primaryColor: '#0078D4' }
  },
  { 
    id: '3', 
    name: 'GreenLife Organics', 
    email: 'sarah@greenlife.com',
    branding: { primaryColor: '#10b981' }
  },
];

export const MOCK_MONTHS: ContentMonth[] = [
  {
    id: 'm1',
    clientId: '1',
    name: 'October 2025',
    year: 2025,
    month: 10,
    allocation: 15,
    status: 'active'
  },
  {
    id: 'm2',
    clientId: '2',
    name: 'October 2025',
    year: 2025,
    month: 10,
    allocation: 12,
    status: 'active'
  },
  {
    id: 'm3',
    clientId: '3',
    name: 'October 2025',
    year: 2025,
    month: 10,
    allocation: 20,
    status: 'active'
  }
];

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80',
  'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
  'https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80',
  'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?w=800&q=80',
  'https://images.unsplash.com/photo-1501854140884-074cf2b2b388?w=800&q=80',
  'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=800&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80'
];

const SAMPLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

const generateMockPieces = (monthId: string, count: number, startId: number) => {
  return Array.from({ length: count }, (_, i) => {
    const index = i + 1;
    const globalIndex = startId + i;
    // Randomize status slightly based on monthId to create variety
    const statusOptions = ['waiting_for_direction', 'agency_prep', 'client_review', 'approved'];
    // Shift status distribution for different clients
    const shift = monthId === 'm1' ? 0 : monthId === 'm2' ? 1 : 2;
    const status = statusOptions[(i + shift) % 4] as any;
    
    const piece: ContentPiece = {
      id: `c${globalIndex}`,
      monthId: monthId,
      index: index,
      status: status,
      currentWork: {},
      drafts: []
    };

    if (status !== 'waiting_for_direction') {
      piece.direction = {
        topic: `Content Piece ${index} Topic`,
        style: 'Professional and engaging',
        references: 'https://example.com'
      };
    }

    if (status === 'agency_prep') {
      piece.currentWork = {
        visualHeadline: `Working on C${index}`,
        copywriting: 'Drafting content...',
        media: i % 2 === 0 ? [{ url: UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length], type: 'image' }] : undefined
      };

      // Simulate previous drafts with feedback for ALL agency_prep items for demo purposes
      piece.drafts = [
        {
          number: 1,
          work: {
            visualHeadline: 'Old Headline',
            copywriting: 'Old copy...',
            media: []
          },
          submittedAt: Date.now() - 86400000 * 2,
          status: 'changes_requested',
          feedback: 'The headline is too aggressive. Please tone it down.'
        }
      ];
      
      if (i % 2 === 0) {
         piece.drafts.push({
            number: 2,
            work: {
              visualHeadline: 'Slightly better Headline',
              copywriting: 'Old copy...',
              media: []
            },
            submittedAt: Date.now() - 86400000,
            status: 'changes_requested',
            feedback: 'Better, but the image choice is not aligned with our brand colors.'
         });
      }
    }

    if (status === 'client_review' || status === 'approved') {
      // Mix of single image, carousel, and video
      let media: any[] = [];
      
      if (i % 3 === 0) {
        // Single Image
        media = [{ url: UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length], type: 'image' }];
      } else if (i % 3 === 1) {
        // Carousel (2-3 images)
        media = [
          { url: UNSPLASH_IMAGES[i % UNSPLASH_IMAGES.length], type: 'image' },
          { url: UNSPLASH_IMAGES[(i + 1) % UNSPLASH_IMAGES.length], type: 'image' },
          { url: UNSPLASH_IMAGES[(i + 2) % UNSPLASH_IMAGES.length], type: 'image' }
        ];
      } else {
        // Video
        media = [{ url: SAMPLE_VIDEO, type: 'video' }];
      }

      piece.currentWork = {
        visualHeadline: `Headline for C${index}`,
        copywriting: `This is the amazing copy for content piece ${index}. It is very persuasive.`,
        media: media
      };
    }

    return piece;
  });
};

export const MOCK_CONTENT_PIECES: ContentPiece[] = [
  ...generateMockPieces('m1', 15, 1),
  ...generateMockPieces('m2', 12, 100),
  ...generateMockPieces('m3', 20, 200)
];
