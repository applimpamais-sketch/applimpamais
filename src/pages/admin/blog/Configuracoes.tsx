 import { useState, useEffect } from 'react';
 import AdminContainer from '@/components/admin/AdminContainer';
 import PageHeader from '@/components/admin/PageHeader';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { useBlogConfig, useUpdateBlogConfig } from '@/hooks/useBlogConfig';
 import { Loader2, Save, Eye, EyeOff, CheckCircle, XCircle, Wifi } from 'lucide-react';
 import { toast } from 'sonner';
 import { supabase } from '@/integrations/supabase/client';
 
 export default function Configuracoes() {
   const { data: config, isLoading } = useBlogConfig();
   const updateConfig = useUpdateBlogConfig();
   
   const [showPassword, setShowPassword] = useState(false);
   const [testingConnection, setTestingConnection] = useState(false);
   const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
   const [formData, setFormData] = useState({
     wordpress_url: '',
     wordpress_username: '',
     wordpress_app_password: '',
     min_word_count: 1200,
     min_h2_count: 4,
     min_faq_count: 5,
     auto_publish: false,
   });
   
   useEffect(() => {
     if (config?.map) {
       setFormData({
         wordpress_url: config.map.wordpress_url || '',
         wordpress_username: config.map.wordpress_username || '',
         wordpress_app_password: '',
         min_word_count: config.map.min_word_count || 1200,
         min_h2_count: config.map.min_h2_count || 4,
         min_faq_count: config.map.min_faq_count || 5,
         auto_publish: config.map.auto_publish || false,
       });
     }
   }, [config]);
   
   const handleSave = async (key: string, value: any) => {
     try {
       await updateConfig.mutateAsync({ key, value });
       toast.success('Configuração salva');
     } catch (error) {
       toast.error('Erro ao salvar configuração');
     }
   };
   
   const handleSaveAll = async () => {
     try {
       await handleSave('wordpress_url', formData.wordpress_url);
       await handleSave('wordpress_username', formData.wordpress_username);
       if (formData.wordpress_app_password) {
         await handleSave('wordpress_app_password', formData.wordpress_app_password);
       }
       await handleSave('min_word_count', formData.min_word_count);
       await handleSave('min_h2_count', formData.min_h2_count);
       await handleSave('min_faq_count', formData.min_faq_count);
       await handleSave('auto_publish', formData.auto_publish);
       toast.success('Todas as configurações foram salvas');
     } catch (error) {
       toast.error('Erro ao salvar configurações');
     }
   };
   
   const testWordPressConnection = async () => {
     if (!formData.wordpress_url || !formData.wordpress_username) {
       toast.error('Preencha URL e usuário do WordPress primeiro');
       return;
     }
     
     setTestingConnection(true);
     setConnectionStatus('idle');
     
     try {
       // Salvar configs primeiro
       await handleSave('wordpress_url', formData.wordpress_url);
       await handleSave('wordpress_username', formData.wordpress_username);
       
       // Testar conexão via API WordPress
       const wpUrl = formData.wordpress_url.replace(/\/$/, '');
       const response = await fetch(`${wpUrl}/wp-json/wp/v2/users/me`, {
         headers: {
           'Authorization': `Basic ${btoa(`${formData.wordpress_username}:${formData.wordpress_app_password || 'test'}`)}`,
         },
       });
       
       if (response.ok) {
         const user = await response.json();
         setConnectionStatus('success');
         toast.success(`Conectado como: ${user.name}`);
       } else if (response.status === 401) {
         setConnectionStatus('error');
         toast.error('Credenciais inválidas. Verifique usuário e Application Password.');
       } else {
         setConnectionStatus('error');
         toast.error(`Erro: ${response.status} - ${response.statusText}`);
       }
     } catch (error: any) {
       setConnectionStatus('error');
       toast.error(`Erro de conexão: ${error.message}`);
     }
     
     setTestingConnection(false);
   };
   
   if (isLoading) {
     return (
       <div className="flex items-center justify-center py-12">
         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
       </div>
     );
   }
   
   return (
    <AdminContainer>
       <PageHeader
         title="Configurações do Blog"
         description="Configure a integração com WordPress e regras de SEO"
       />
       
       {/* WordPress */}
       <Card>
         <CardHeader>
           <CardTitle>WordPress</CardTitle>
           <CardDescription>
             Configurações de conexão com o WordPress para publicação automática
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="wp_url">URL do WordPress</Label>
               <Input 
                 id="wp_url"
                 placeholder="https://seusite.com.br"
                 value={formData.wordpress_url}
                 onChange={(e) => setFormData(prev => ({ ...prev, wordpress_url: e.target.value }))}
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="wp_username">Username</Label>
               <Input 
                 id="wp_username"
                 placeholder="admin"
                 value={formData.wordpress_username}
                 onChange={(e) => setFormData(prev => ({ ...prev, wordpress_username: e.target.value }))}
               />
             </div>
           </div>
           
           <div className="space-y-2">
             <Label htmlFor="wp_password">Application Password</Label>
             <div className="relative">
               <Input 
                 id="wp_password"
                 type={showPassword ? 'text' : 'password'}
                 placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
                 value={formData.wordpress_app_password}
                 onChange={(e) => setFormData(prev => ({ ...prev, wordpress_app_password: e.target.value }))}
               />
               <Button
                 type="button"
                 variant="ghost"
                 size="icon"
                 className="absolute right-2 top-1/2 -translate-y-1/2"
                 onClick={() => setShowPassword(!showPassword)}
               >
                 {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
               </Button>
             </div>
             <p className="text-xs text-muted-foreground">
               Gere uma Application Password em WordPress → Usuários → Seu Perfil → Application Passwords
             </p>
           </div>
             
             <div className="pt-2">
               <Button 
                 variant="outline" 
                 onClick={testWordPressConnection}
                 disabled={testingConnection}
               >
                 {testingConnection ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 ) : connectionStatus === 'success' ? (
                   <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                 ) : connectionStatus === 'error' ? (
                   <XCircle className="mr-2 h-4 w-4 text-red-500" />
                 ) : (
                   <Wifi className="mr-2 h-4 w-4" />
                 )}
                 Testar Conexão
               </Button>
             </div>
         </CardContent>
       </Card>
       
       {/* Regras SEO */}
       <Card>
         <CardHeader>
           <CardTitle>Regras de SEO</CardTitle>
           <CardDescription>
             Defina os padrões mínimos de qualidade para os posts gerados
           </CardDescription>
         </CardHeader>
         <CardContent className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="space-y-2">
               <Label htmlFor="min_words">Mínimo de palavras</Label>
               <Input 
                 id="min_words"
                 type="number"
                 value={formData.min_word_count}
                 onChange={(e) => setFormData(prev => ({ ...prev, min_word_count: parseInt(e.target.value) }))}
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="min_h2">Mínimo de H2</Label>
               <Input 
                 id="min_h2"
                 type="number"
                 value={formData.min_h2_count}
                 onChange={(e) => setFormData(prev => ({ ...prev, min_h2_count: parseInt(e.target.value) }))}
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="min_faq">Mínimo de FAQs</Label>
               <Input 
                 id="min_faq"
                 type="number"
                 value={formData.min_faq_count}
                 onChange={(e) => setFormData(prev => ({ ...prev, min_faq_count: parseInt(e.target.value) }))}
               />
             </div>
           </div>
         </CardContent>
       </Card>
       
       {/* Publicação */}
       <Card>
         <CardHeader>
           <CardTitle>Publicação</CardTitle>
           <CardDescription>
             Configurações de comportamento de publicação
           </CardDescription>
         </CardHeader>
         <CardContent>
           <div className="flex items-center justify-between">
             <div className="space-y-0.5">
               <Label>Auto-publicar</Label>
               <p className="text-sm text-muted-foreground">
                 Publicar automaticamente posts aprovados no WordPress
               </p>
             </div>
             <Switch 
               checked={formData.auto_publish}
               onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_publish: checked }))}
             />
           </div>
         </CardContent>
       </Card>
       
       {/* Salvar */}
       <div className="flex justify-end">
         <Button onClick={handleSaveAll} disabled={updateConfig.isPending}>
           {updateConfig.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
           <Save className="mr-2 h-4 w-4" />
           Salvar Configurações
         </Button>
       </div>
    </AdminContainer>
   );
 }