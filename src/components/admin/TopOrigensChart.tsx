 import { ModernBarChart } from '@/components/charts/ModernBarChart';
 import { Link } from 'lucide-react';
 
 interface OrigemData {
   nome: string;
   tipo: 'parceiro' | 'canal' | 'bot' | 'atendente' | 'manual' | 'direto';
   quantidade: number;
 }
 
 interface TopOrigensChartProps {
   data: OrigemData[];
 }
 
 const getTipoLabel = (tipo: OrigemData['tipo']): string => {
   const labels: Record<OrigemData['tipo'], string> = {
     parceiro: 'Parceiro',
     canal: 'Canal Orgânico',
     bot: 'Bot WhatsApp',
     atendente: 'Atendente',
     manual: 'Manual',
     direto: 'Direto (Site)',
   };
   return labels[tipo] || tipo;
 };
 
 export default function TopOrigensChart({ data }: TopOrigensChartProps) {
   const total = data.reduce((sum, item) => sum + item.quantidade, 0);
   
   const chartData = data.map(item => ({
     name: item.nome,
     value: item.quantidade,
     label: `${item.nome} (${total > 0 ? Math.round((item.quantidade / total) * 100) : 0}%)`,
   }));
 
   return (
     <ModernBarChart
       title="TOP ORIGENS"
       description="De onde vêm seus agendamentos"
       data={chartData}
       colorScheme="brand"
       formatValue={(value) => `${value} agend.`}
       barSize={50}
       height={300}
       icon={Link}
     />
   );
 }