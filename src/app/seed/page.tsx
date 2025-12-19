'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { MOCK_CLIENTS, MOCK_MONTHS, MOCK_CONTENT_PIECES } from '@/lib/mock-data';

export default function SeedPage() {
  const [status, setStatus] = useState('Ready to initialize');
  const [isLoading, setIsLoading] = useState(false);

  const handleSeed = async () => {
    setIsLoading(true);
    setStatus('Starting initialization...');

    try {
      // 1. Create Agency Account
      setStatus('Creating Agency Account (sales@nexovadigital.com)...');
      try {
        await createUserWithEmailAndPassword(auth, 'sales@nexovadigital.com', 'Nexova@1234');
        setStatus('Agency Auth Created. Setting up Firestore profile...');
        
        // We need to manually create the user doc since we don't have cloud functions yet
        await setDoc(doc(db, 'users', auth.currentUser!.uid), {
          email: 'sales@nexovadigital.com',
          role: 'agency'
        });
        setStatus('Agency Profile Created. Signing out...');
        await signOut(auth); // Sign out to create next user
      } catch (e: any) {
        console.error("Agency creation error:", e);
        if (e.code === 'auth/email-already-in-use') {
          setStatus('⚠️ Account sales@nexovadigital.com already exists! If the password is wrong, you MUST delete it in Firebase Console and run this again.');
          // Don't throw, just continue, but warn
        } else {
          setStatus(`Error creating agency: ${e.message}`);
          throw e;
        }
      }

      // 2. Create Client Account
      setStatus('Creating Client Account...');
      try {
        await createUserWithEmailAndPassword(auth, 'client@acme.com', 'password123');
        await setDoc(doc(db, 'users', auth.currentUser!.uid), {
          email: 'client@acme.com',
          role: 'client',
          clientId: '1' // Linking to Acme Corp
        });
        await signOut(auth);
      } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
          setStatus('Client account exists. Attempting to repair profile...');
          try {
            // Try to login to get UID
            await signInWithEmailAndPassword(auth, 'client@acme.com', 'password123');
            await setDoc(doc(db, 'users', auth.currentUser!.uid), {
              email: 'client@acme.com',
              role: 'client',
              clientId: '1'
            });
            await signOut(auth);
            setStatus('Client profile repaired.');
          } catch (loginError) {
             setStatus('⚠️ Could not repair client. Password might be wrong. Delete user in Firebase Console.');
          }
        } else {
          throw e;
        }
      }

      // 3. Write Database Data (Batching)
      setStatus('Writing Database Data...');
      const batch = writeBatch(db);

      // Clients
      MOCK_CLIENTS.forEach(client => {
        const ref = doc(db, 'clients', client.id);
        batch.set(ref, client);
      });

      // Months
      MOCK_MONTHS.forEach(month => {
        const ref = doc(db, 'months', month.id);
        batch.set(ref, month);
      });

      // Content Pieces
      MOCK_CONTENT_PIECES.forEach(piece => {
        const ref = doc(db, 'content_pieces', piece.id);
        // Ensure no undefined values (Firestore hates undefined)
        const cleanPiece = JSON.parse(JSON.stringify(piece));
        batch.set(ref, cleanPiece);
      });

      await batch.commit();

      setStatus('SUCCESS! Database initialized. You can now log in.');
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-6">
      <h1 className="text-2xl font-bold">System Initializer</h1>
      <div className="p-4 bg-secondary rounded-md w-full max-w-md text-center">
        <p className="mb-4 font-mono text-sm">{status}</p>
        <Button onClick={handleSeed} disabled={isLoading} className="w-full">
          {isLoading ? 'Working...' : 'Initialize Database'}
        </Button>
      </div>
      <div className="text-sm text-muted-foreground max-w-md text-center">
        <p>This will create:</p>
        <ul className="list-disc list-inside mt-2 text-left">
          <li>Agency User: sales@nexovadigital.com / Nexova@1234</li>
          <li>Client User: client@acme.com / password123</li>
          <li>All mock data (Clients, Months, Content)</li>
        </ul>
      </div>
    </div>
  );
}
