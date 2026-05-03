import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, TrendingUp, MapPinOff, Edit2 } from 'lucide-react';
import { getInitials } from '@/utils/dashboardHelpers';
import { useTecnicoStats } from '@/hooks/useTecnicos';
import type { Tecnico } from '@/hooks/useTecnicos';
import { useNavigate } from 'react-router-dom';
import EditTecnicoLocationModal from './EditTecnicoLocationModal';

interface TecnicoCardProps {
  tecnico: Tecnico;
}

export default function TecnicoCard({ tecnico }: TecnicoCardProps) {
  const navigate = useNavigate();
  const { data: stats } = useTecnicoStats(tecnico.id);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const handleVerAgenda = () => {
    navigate(`/admin/agendamentos?tecnico=${tecnico.id}`);
  };

  const hasLocation = tecnico.latitude && tecnico.longitude;

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={tecnico.avatar_url || ''} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(tecnico.nome_completo)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{tecnico.nome_completo}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {stats?.servicosHoje || 0} serviços hoje
                </Badge>
              </div>
            </div>
            <Badge 
              variant={stats && stats.servicosHoje > 0 ? 'default' : 'outline'}
              className="ml-2"
            >
              {stats && stats.servicosHoje > 0 ? 'Ocupado' : 'Disponível'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{tecnico.telefone || 'Não informado'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span className="truncate">{tecnico.email}</span>
          </div>
          
          {/* Location Status */}
          {hasLocation ? (
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group w-full"
            >
              <MapPin className="h-4 w-4 text-green-500" />
              <span>Localização cadastrada</span>
              <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ) : (
            <button
              onClick={() => setLocationModalOpen(true)}
              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 transition-colors w-full"
            >
              <MapPinOff className="h-4 w-4" />
              <span className="font-medium">Definir localização</span>
            </button>
          )}

          {stats && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium">{stats.taxaConclusao}% de conclusão</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleVerAgenda}
            >
              Ver Agenda
            </Button>
            <Button variant="default" size="sm" className="w-full">
              Atribuir
            </Button>
          </div>
        </CardContent>
      </Card>

      <EditTecnicoLocationModal
        open={locationModalOpen}
        onOpenChange={setLocationModalOpen}
        tecnico={tecnico}
      />
    </>
  );
}
