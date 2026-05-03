 // Templates de keywords para geração automática de conteúdo SEO
 
 export const CLUSTERS = [
   { value: 'sofa', label: 'Sofá' },
   { value: 'colchao', label: 'Colchão' },
   { value: 'poltrona', label: 'Poltrona' },
   { value: 'cadeira', label: 'Cadeira' },
   { value: 'tapete', label: 'Tapete' },
   { value: 'carro', label: 'Carro' },
   { value: 'bebe', label: 'Bebê' },
   { value: 'aluguel', label: 'Aluguel Extratora' },
   { value: 'outros', label: 'Outros' },
 ] as const;
 
 export const FUNNEL_STAGES = [
   { value: 'topo', label: 'Topo de Funil', description: 'Informacional' },
   { value: 'meio', label: 'Meio de Funil', description: 'Comparativo/Decisão' },
   { value: 'fundo', label: 'Fundo de Funil', description: 'Transacional/Local' },
 ] as const;
 
 export const MANCHAS = [
   'café', 'vinho', 'sangue', 'gordura', 'tinta', 'caneta',
   'chocolate', 'catchup', 'mostarda', 'molho', 'urina', 'xixi',
   'fezes', 'vômito', 'maquiagem', 'batom', 'base', 'rímel',
   'cerveja', 'refrigerante', 'suco', 'óleo', 'graxa', 'tinta de cabelo',
 ];
 
 export const CHEIROS = [
   'xixi de gato', 'xixi de cachorro', 'urina de animal', 'mofo', 'bolor',
   'umidade', 'cigarro', 'fumaça', 'leite azedo', 'vômito', 'cachorro molhado',
   'suor', 'animal', 'urina', 'mofo velho',
 ];
 
 export const TECIDOS = [
   'suede', 'veludo', 'linho', 'couro', 'courino', 'chenille',
   'jacquard', 'sarja', 'algodão', 'poliéster', 'sintético', 'microfibra',
 ];
 
 export const PRODUTOS = [
   'bicarbonato', 'vinagre', 'detergente', 'água sanitária', 'sabão neutro',
   'álcool', 'limpa vidros', 'multiuso', 'amaciante', 'água oxigenada',
 ];
 
 // Templates TOPO DE FUNIL - Informacional
 export const TEMPLATES_TOPO = [
   'como tirar mancha de {mancha} do {objeto}',
   'como tirar cheiro de {cheiro} do {objeto}',
   '{objeto} com mofo o que fazer',
   'como limpar {objeto} em casa',
   'pode usar {produto} no {objeto}',
   'quanto tempo demora para secar {objeto}',
   'dica para limpar {objeto}',
   'como fazer limpeza de {objeto}',
   'passo a passo limpeza de {objeto}',
   '{objeto} de {tecido} como limpar',
   'como higienizar {objeto}',
   '{objeto} manchado como tirar',
   'como limpar {objeto} sem danificar',
   'pode lavar {objeto} com água',
   '{objeto} encardido como resolver',
   'como clarear {objeto} amarelado',
   'tirar {mancha} de {objeto} {tecido}',
   '{objeto} com acaro como limpar',
   'como tirar pelo de animal do {objeto}',
   'limpeza caseira de {objeto}',
 ];
 
 // Templates MEIO DE FUNIL - Comparativo/Decisão
 export const TEMPLATES_MEIO = [
   'limpeza profissional vs caseira {objeto}',
   'vale a pena contratar limpeza de {objeto}',
   'vale a pena alugar extratora para {objeto}',
   'extratora doméstica vs profissional',
   'melhor produto para limpar {objeto}',
   'limpeza a seco {objeto} funciona',
   'impermeabilizar {objeto} vale a pena',
   'quanto custa limpar {objeto}',
   'preço limpeza de {objeto}',
   'limpeza de {objeto} preço médio',
   'limpeza profissional de {objeto} compensa',
   'limpar {objeto} sozinho ou contratar',
   'alugar ou comprar extratora',
   'aluguel de extratora preço',
   'como escolher empresa de limpeza de {objeto}',
   'impermeabilização de {objeto} dura quanto tempo',
   'limpeza e impermeabilização de {objeto} junto',
 ];
 
 // Templates FUNDO DE FUNIL - Transacional/Local
 export const TEMPLATES_FUNDO_LOCAL = [
   'limpeza de {objeto} em {cidade}',
   'limpeza de estofados em {cidade}',
   'limpar {objeto} {cidade}',
   'empresa de limpeza de {objeto} em {cidade}',
   'aluguel de extratora em {cidade}',
   'quanto custa limpar {objeto} em {cidade}',
   'limpeza de {objeto} no {bairro}',
   'limpeza de estofados {bairro}',
 ];
 
 export const TEMPLATES_FUNDO_TRANSACIONAL = [
   'contratar limpeza de {objeto}',
   'agendar limpeza de {objeto}',
   'orçamento limpeza de {objeto}',
   'melhor empresa limpeza de {objeto}',
   'limpeza de {objeto} preço acessível',
   'limpeza de {objeto} com garantia',
 ];
 
 // Serviços mapeados por cluster
 export const SERVICOS_POR_CLUSTER: Record<string, string[]> = {
   sofa: [
     'Sofá Retrátil', 'Sofá Cama', 'Sofá com Chaise', 'Sofá Comum', 'Sofá de Canto',
   ],
   colchao: [
     'Colchão Solteiro', 'Colchão Casal', 'Colchão Queen', 'Colchão King',
     'Colchão Super King', 'Colchão Viúvo', 'Colchão Berço', 'Cama Auxiliar',
   ],
   poltrona: [
     'Poltrona Comum', 'Poltrona Amamentação', 'Poltrona Papai', 'Poltrona Eames',
     'Poltrona Pé Palito', 'Poltrona de Almofadas Soltas',
   ],
   cadeira: [
     'Cadeira de Escritório', 'Cadeira Toda Estofada', 'Cadeira Estofado no Assento',
     'Cadeira Estofado no Encosto', 'Cadeira Estofado Assento e Encosto', 'Luis XV', 'Banqueta',
   ],
   tapete: ['Tapete P', 'Tapete M', 'Tapete G', 'Tapete GG'],
   carro: ['Bancos de Carro', 'Bancos + Teto', 'Bancos + Teto + Carpete'],
   bebe: ['Bebê Conforto', 'Cadeirinha', 'Carrinho de Bebê', 'Moisés'],
   aluguel: ['Extratora IPC A135 Diária', 'Extratora Final de Semana', 'Extratora Semanal', 'Extratora Econômico'],
   outros: [
     'Puff P', 'Puff M', 'Puff G', 'Divã', 'Namoradeira', 'Recamier',
     'Chaise P', 'Chaise M', 'Chaise G', 'Travesseiro', 'Carpete',
     'Ar Condicionado', 'Banco de Igreja', 'Auditório',
   ],
 };
 
 // Objetos simplificados para templates (sem tamanho/detalhe)
 export const OBJETOS_SIMPLIFICADOS: Record<string, string> = {
   sofa: 'sofá',
   colchao: 'colchão',
   poltrona: 'poltrona',
   cadeira: 'cadeira',
   tapete: 'tapete',
   carro: 'banco do carro',
   bebe: 'carrinho de bebê',
   aluguel: 'estofado',
   outros: 'estofado',
 };
 
 // Cidades e bairros principais
 export const CIDADES_ATENDIDAS = [
   'Belo Horizonte', 'Contagem', 'Betim', 'Nova Lima',
   'Ibirité', 'Lagoa Santa', 'Sarzedo', 'Vespasiano',
 ];
 
 export const BAIRROS_PRINCIPAIS_BH = [
   'Barreiro', 'Centro', 'Savassi', 'Buritis', 'Belvedere', 'Mangabeiras',
   'Pampulha', 'Funcionários', 'Lourdes', 'Santo Agostinho', 'Santa Efigênia',
   'São Pedro', 'Cidade Nova', 'Padre Eustáquio', 'Venda Nova', 'Santa Tereza',
   'Horto', 'Ouro Preto', 'Castelo', 'Sion', 'Gutierrez', 'Grajaú',
   'Carlos Prates', 'Sagrada Família', 'Floresta', 'Serra', 'Anchieta',
   'Carmo', 'Coração de Jesus', 'Santa Lúcia', 'Luxemburgo', 'Coração Eucarístico',
 ];
 
 // Função para gerar keywords com variáveis
 export function generateKeywordsFromTemplate(
   template: string,
   cluster: string,
   options?: {
     mancha?: string;
     cheiro?: string;
     tecido?: string;
     produto?: string;
     cidade?: string;
     bairro?: string;
   }
 ): string {
   let keyword = template;
   const objeto = OBJETOS_SIMPLIFICADOS[cluster] || 'estofado';
   
   keyword = keyword.replace(/{objeto}/g, objeto);
   keyword = keyword.replace(/{mancha}/g, options?.mancha || 'mancha');
   keyword = keyword.replace(/{cheiro}/g, options?.cheiro || 'cheiro ruim');
   keyword = keyword.replace(/{tecido}/g, options?.tecido || 'tecido');
   keyword = keyword.replace(/{produto}/g, options?.produto || 'produto');
   keyword = keyword.replace(/{cidade}/g, options?.cidade || 'belo horizonte');
   keyword = keyword.replace(/{bairro}/g, options?.bairro || 'centro');
   
   return keyword.toLowerCase();
 }
 
 // Estimar dificuldade baseado em heurísticas
 export function estimateDifficulty(keyword: string): 'baixa' | 'media' | 'alta' {
   const wordCount = keyword.split(' ').length;
   const hasLocation = CIDADES_ATENDIDAS.some(c => keyword.toLowerCase().includes(c.toLowerCase())) ||
                       BAIRROS_PRINCIPAIS_BH.some(b => keyword.toLowerCase().includes(b.toLowerCase()));
   const hasSpecificProblem = MANCHAS.some(m => keyword.includes(m)) || 
                               CHEIROS.some(c => keyword.includes(c));
   const hasTecido = TECIDOS.some(t => keyword.includes(t));
   
   // Long-tail com localização = baixa
   if (wordCount >= 6 && hasLocation) return 'baixa';
   
   // Long-tail com problema específico = baixa
   if (wordCount >= 5 && (hasSpecificProblem || hasTecido)) return 'baixa';
   
   // Long-tail geral = média
   if (wordCount >= 5) return 'media';
   
   // Short-tail = alta
   return 'alta';
 }
 
 // Calcular opportunity score
 export function calculateOpportunityScore(keyword: string, difficulty: string): number {
   let score = 50;
   
   // Long-tail bonus
   const wordCount = keyword.split(' ').length;
   score += Math.min(wordCount * 5, 25);
   
   // Difficulty bonus
   if (difficulty === 'baixa') score += 25;
   else if (difficulty === 'media') score += 10;
   
   // Problema específico bonus
   if (MANCHAS.some(m => keyword.includes(m))) score += 5;
   if (CHEIROS.some(c => keyword.includes(c))) score += 5;
   
   return Math.min(score, 100);
 }