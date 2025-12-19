import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
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

export const useClientDashboard = (clientId: string, selectedMonthId?: string) => {
  const monthsQuery = useQuery({
    queryKey: ['client-months', clientId],
    queryFn: () => fetchMonths(clientId),
    enabled: !!clientId,
  });

  const contentQuery = useQuery({
    queryKey: ['client-content', selectedMonthId],
    queryFn: () => fetchContentPieces(selectedMonthId!),
    enabled: !!selectedMonthId,
  });

  return {
    months: monthsQuery.data,
    contentPieces: contentQuery.data,
    isLoading: monthsQuery.isLoading || contentQuery.isLoading,
  };
};
