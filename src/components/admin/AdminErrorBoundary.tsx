 import { Component, ReactNode } from 'react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 import { AlertTriangle, RefreshCw } from 'lucide-react';
 
 interface Props {
   children: ReactNode;
 }
 
 interface State {
   hasError: boolean;
   error: Error | null;
 }
 
 export class AdminErrorBoundary extends Component<Props, State> {
   constructor(props: Props) {
     super(props);
     this.state = { hasError: false, error: null };
   }
 
   static getDerivedStateFromError(error: Error): State {
     return { hasError: true, error };
   }
 
   componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
     console.error('[AdminErrorBoundary] Caught error:', error, errorInfo);
   }
 
   handleRetry = () => {
     this.setState({ hasError: false, error: null });
   };
 
   render() {
     if (this.state.hasError) {
       return (
         <div className="min-h-[400px] flex items-center justify-center p-4">
           <Card className="max-w-md w-full">
             <CardContent className="pt-6">
               <div className="flex flex-col items-center text-center gap-4">
                 <AlertTriangle className="h-12 w-12 text-destructive" />
                 <h2 className="text-xl font-semibold">Algo deu errado</h2>
                 <p className="text-sm text-muted-foreground">
                   {this.state.error?.message || 'Erro desconhecido ao carregar esta página'}
                 </p>
                 <div className="flex gap-2">
                   <Button variant="outline" onClick={this.handleRetry}>
                     <RefreshCw className="mr-2 h-4 w-4" />
                     Tentar Novamente
                   </Button>
                   <Button onClick={() => window.location.href = '/admin'}>
                     Voltar ao Dashboard
                   </Button>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
       );
     }
 
     return this.props.children;
   }
 }