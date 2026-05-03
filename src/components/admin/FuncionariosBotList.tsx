import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useFuncionariosBot, FuncionarioBot } from '@/hooks/useFuncionariosBot';
import FuncionarioBotCard from './FuncionarioBotCard';
import { Skeleton } from '@/components/ui/skeleton';
import InviteFuncionarioBotModal from './InviteFuncionarioBotModal';

export default function FuncionariosBotList() {
  const { data: funcionarios, isLoading } = useFuncionariosBot();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFuncionario, setEditingFuncionario] = useState<FuncionarioBot | null>(null);

  const filteredFuncionarios = funcionarios?.filter((f) => {
    const search = searchTerm.toLowerCase();
    return (
      f.nome.toLowerCase().includes(search) ||
      f.telefone_whatsapp.includes(search)
    );
  });

  const ativos = filteredFuncionarios?.filter((f) => f.ativo).length || 0;
  const inativos = filteredFuncionarios?.filter((f) => !f.ativo).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredFuncionarios?.length || 0}</span> total
          {' • '}
          <span className="text-green-600">{ativos} ativos</span>
          {' • '}
          <span className="text-muted-foreground">{inativos} inativos</span>
        </div>
      </div>

      {filteredFuncionarios && filteredFuncionarios.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFuncionarios.map((funcionario) => (
            <FuncionarioBotCard
              key={funcionario.id}
              funcionario={funcionario}
              onEdit={setEditingFuncionario}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Nenhum funcionário encontrado com este termo de busca'
              : 'Nenhum funcionário bot cadastrado ainda'}
          </p>
        </div>
      )}

      {editingFuncionario && (
        <InviteFuncionarioBotModal
          editingFuncionario={editingFuncionario}
          onClose={() => setEditingFuncionario(null)}
        />
      )}
    </div>
  );
}
