import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Client, ContentMonth, ContentPiece } from '@/lib/types';

export interface ClientSummary extends Client {
  activeMonth?: ContentMonth;
  stats: {
    total: number;
    approved: number;
    inReview: number;
    needsAction: number; // waiting_for_direction
  };
}

const fetchClientsWithSummary = async (): Promise<ClientSummary[]> => {
  // 1. Fetch all clients
  const clientsSnap = await getDocs(collection(db, 'clients'));
  const clients = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client));

  // 2. Fetch all active months
  const monthsQuery = query(collection(db, 'months'), where('status', '==', 'active'));
  const monthsSnap = await getDocs(monthsQuery);
  const activeMonths = monthsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContentMonth));

  // 3. Build summaries (fetching pieces for active months)
  const summaries = await Promise.all(clients.map(async (client) => {
    const activeMonth = activeMonths.find(m => m.clientId === client.id);
    let stats = { total: 0, approved: 0, inReview: 0, needsAction: 0 };

    if (activeMonth) {
      const piecesQuery = query(collection(db, 'content_pieces'), where('monthId', '==', activeMonth.id));
      const piecesSnap = await getDocs(piecesQuery);
      const pieces = piecesSnap.docs.map(doc => doc.data() as ContentPiece);

      stats.total = activeMonth.allocation;
      stats.approved = pieces.filter(p => p.status === 'approved').length;
      stats.inReview = pieces.filter(p => p.status === 'client_review').length;
      stats.needsAction = pieces.filter(p => p.status === 'waiting_for_direction').length;
    }

    return {
      ...client,
      activeMonth,
      stats
    };
  }));

  return summaries;
};

export const useClients = () => {
  return useQuery({
    queryKey: ['clients-summary'],
    queryFn: fetchClientsWithSummary,
  });
};
