import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ContentPiece, ContentDraft, ContentDirection } from '@/lib/types';

const approveContent = async (id: string) => {
  const ref = doc(db, 'content_pieces', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Content not found');
  
  const data = snap.data() as ContentPiece;
  const drafts = data.drafts || [];
  const lastDraftIndex = drafts.length - 1;

  // Update the last draft status
  if (lastDraftIndex >= 0) {
    drafts[lastDraftIndex].status = 'approved';
  }

  await updateDoc(ref, {
    status: 'approved',
    finalApprovedVersion: drafts.length,
    drafts: drafts
  });
};

const requestChanges = async (id: string, feedback: string) => {
  const ref = doc(db, 'content_pieces', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Content not found');
  
  const data = snap.data() as ContentPiece;
  const drafts = data.drafts || [];
  const lastDraftIndex = drafts.length - 1;

  // Update the last draft status and feedback
  if (lastDraftIndex >= 0) {
    drafts[lastDraftIndex].status = 'changes_requested';
    drafts[lastDraftIndex].feedback = feedback;
  }

  await updateDoc(ref, {
    status: 'changes_requested', // Explicit status for feedback alerts
    drafts: drafts
  });
};

const submitDirection = async (id: string, direction: ContentDirection) => {
  const ref = doc(db, 'content_pieces', id);
  await updateDoc(ref, {
    direction: direction,
    status: 'agency_prep' // Move status forward so agency knows to start working
  });
};

export const useClientActions = () => {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: approveContent,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['content-piece', id] });
      queryClient.invalidateQueries({ queryKey: ['client-content'] });
    }
  });

  const requestChangesMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: string }) => requestChanges(id, feedback),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-piece', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['client-content'] });
    }
  });

  const submitDirectionMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: ContentDirection }) => submitDirection(id, direction),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-piece', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['client-content'] });
    }
  });

  return {
    approveContent: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    requestChanges: requestChangesMutation.mutate,
    isRequesting: requestChangesMutation.isPending,
    submitDirection: submitDirectionMutation.mutate,
    isSubmittingDirection: submitDirectionMutation.isPending
  };
};
