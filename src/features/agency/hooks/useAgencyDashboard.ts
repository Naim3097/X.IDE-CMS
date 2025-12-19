import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { ContentMonth, ContentPiece } from '@/lib/types';

// Fetch functions
const fetchMonths = async (clientId: string): Promise<ContentMonth[]> => {
  const q = query(collection(db, 'months'), where('clientId', '==', clientId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentMonth));
};

const fetchContentPieces = async (monthId: string): Promise<ContentPiece[]> => {
  const q = query(collection(db, 'content_pieces'), where('monthId', '==', monthId));
  const snapshot = await getDocs(q);
  // Sort by index
  return snapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as ContentPiece))
    .sort((a, b) => a.index - b.index);
};

const createMonth = async (clientId: string, name: string, year: number, month: number, allocation: number): Promise<ContentMonth> => {
  const batch = writeBatch(db);
  
  // 1. Create Month Document
  const monthRef = doc(collection(db, 'months'));
  const newMonth: ContentMonth = {
    id: monthRef.id,
    clientId,
    name,
    year,
    month,
    allocation,
    status: 'active'
  };
  batch.set(monthRef, newMonth);

  // 2. Create Content Pieces
  const newPieces: ContentPiece[] = Array.from({ length: allocation }, (_, i) => {
    const pieceRef = doc(collection(db, 'content_pieces'));
    return {
      id: pieceRef.id,
      monthId: monthRef.id,
      index: i + 1,
      status: 'waiting_for_direction',
      currentWork: {},
      drafts: []
    };
  });

  newPieces.forEach(piece => {
    const ref = doc(db, 'content_pieces', piece.id);
    batch.set(ref, piece);
  });

  await batch.commit();

  return newMonth;
};

export const useAgencyDashboard = (clientId: string, selectedMonthId?: string) => {
  const monthsQuery = useQuery({
    queryKey: ['months', clientId],
    queryFn: () => fetchMonths(clientId),
    enabled: !!clientId,
  });

  const contentQuery = useQuery({
    queryKey: ['content', selectedMonthId],
    queryFn: () => fetchContentPieces(selectedMonthId!),
    enabled: !!selectedMonthId,
  });

  return {
    months: monthsQuery.data,
    contentPieces: contentQuery.data,
    isLoading: monthsQuery.isLoading || contentQuery.isLoading,
  };
};

export const useCreateMonth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ clientId, name, year, month, allocation }: { clientId: string, name: string, year: number, month: number, allocation: number }) => 
      createMonth(clientId, name, year, month, allocation),
    onSuccess: (newMonth, variables) => {
      queryClient.invalidateQueries({ queryKey: ['months', variables.clientId] });
    }
  });
};
