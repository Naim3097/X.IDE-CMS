'use client';

import { useClients } from '@/features/agency/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Users, ArrowRight, AlertCircle, CheckCircle2, Clock, FileText } from 'lucide-react';

export default function AgencyOverviewPage() {
  const { data: clients, isLoading } = useClients();

  if (isLoading) return <div className="p-8 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Agency Overview</h1>
          <p className="text-muted-foreground mt-1">Manage your clients and their content pipelines.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {clients?.map((client) => (
          <Link href={`/dashboard/client/${client.id}`} key={client.id} className="block group">
            <Card className="h-full transition-all duration-200 hover:shadow-lg hover:border-primary/20">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/20">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                      style={{ backgroundColor: client.branding.primaryColor || '#000' }}
                    >
                      {client.name.substring(0, 1)}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {client.name}
                      </CardTitle>
                      <CardDescription className="text-xs truncate max-w-[180px]">
                        {client.email}
                      </CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {client.activeMonth ? (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Active Month</span>
                      <Badge variant="secondary" className="font-normal">
                        {client.activeMonth.name}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span>Approved</span>
                        </div>
                        <span className="font-bold">{client.stats.approved}/{client.stats.total}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>In Review</span>
                        </div>
                        <span className="font-bold">{client.stats.inReview}</span>
                      </div>

                      {client.stats.needsAction > 0 && (
                        <div className="flex items-center justify-between text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-100 dark:border-red-900/30">
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Needs Action</span>
                          </div>
                          <span className="font-bold text-red-600 dark:text-red-400">{client.stats.needsAction}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full transition-all duration-500" 
                        style={{ width: `${(client.stats.approved / client.stats.total) * 100}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <FileText className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No active content plan</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
