import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, deleteField } from 'firebase/firestore';
import { ContentPiece, AgencyWork, ContentDraft } from '@/lib/types';

const fetchContentPiece = async (id: string): Promise<ContentPiece & { clientId?: string } | undefined> => {
  const docRef = doc(db, 'content_pieces', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const piece = { id: docSnap.id, ...docSnap.data() } as ContentPiece;
    
    // Fetch month to get clientId
    if (piece.monthId) {
      const monthRef = doc(db, 'months', piece.monthId);
      const monthSnap = await getDoc(monthRef);
      if (monthSnap.exists()) {
        return { ...piece, clientId: monthSnap.data().clientId };
      }
    }
    return piece;
  }
  return undefined;
};

const updateContentPiece = async (id: string, work: AgencyWork): Promise<void> => {
  const docRef = doc(db, 'content_pieces', id);
  await updateDoc(docRef, {
    currentWork: work
  });
};

const submitDraft = async (id: string, work: AgencyWork, currentDraftsCount: number): Promise<void> => {
  const docRef = doc(db, 'content_pieces', id);
  
  const newDraft: ContentDraft = {
    number: currentDraftsCount + 1,
    work: work,
    submittedAt: Date.now(),
    status: 'pending'
  };

  await updateDoc(docRef, {
    currentWork: work, // Ensure latest work is saved
    drafts: arrayUnion(newDraft),
    status: 'client_review'
  });
};

const resetContentPiece = async (id: string): Promise<void> => {
  const docRef = doc(db, 'content_pieces', id);
  await updateDoc(docRef, {
    direction: deleteField(),
    currentWork: {},
    drafts: [],
    status: 'waiting_for_direction',
    finalApprovedVersion: deleteField()
  });
};

export const useContentPiece = (id: string) => {
  return useQuery({
    queryKey: ['content-piece', id],
    queryFn: () => fetchContentPiece(id),
    enabled: !!id,
  });
};

export const useUpdateContentPiece = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, work }: { id: string; work: AgencyWork }) => updateContentPiece(id, work),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-piece', variables.id] });
    }
  });
};

export const useSubmitDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, work, currentDraftsCount }: { id: string; work: AgencyWork; currentDraftsCount: number }) => 
      submitDraft(id, work, currentDraftsCount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-piece', variables.id] });
    }
  });
};

export const useResetContentPiece = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => resetContentPiece(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content-piece', id] });
      queryClient.invalidateQueries({ queryKey: ['agency-dashboard'] }); // Refresh list
    }
  });
};
