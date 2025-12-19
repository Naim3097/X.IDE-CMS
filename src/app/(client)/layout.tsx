import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link href="/client" className="text-xl font-bold text-green-700">
              AXTRA Client
            </Link>
            <nav className="flex gap-4">
              <Link href="/client" className="text-sm font-medium hover:text-green-700">
                My Content
              </Link>
              <Link href="/client/profile" className="text-sm font-medium hover:text-green-700">
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
