export type ServiceItem = {
  id: string;
  icon: string;
  name: string;
  category?: 'home' | 'business' | 'both';
  specifications?: {
    sizes?: string[];
    models?: string[];
    materials?: string[];
    measurements?: boolean;
  };
};

export type ComboItem = {
  id: string;
  icon: string;
  name: string;
  description: string;
  category?: 'home' | 'business' | 'both';
};

export type RentalKit = {
  id: string;
  name: string;
  available: boolean;
  pricing?: RentalPricing;
};

export type RentalPricing = {
  [durationId: string]: {
    [periodId: string]: number;
  };
};

export type RentalDuration = {
  id: string;
  name: string;
  hours: string;
};

export type RentalPeriod = {
  id: string;
  name: string;
};

export type RentalOptions = {
  kits: RentalKit[];
  durations: RentalDuration[];
  periods: RentalPeriod[];
};

// Serviços para Casa - Mais agendados
export const homeMostScheduledServices: ServiceItem[] = [
  { id: 'sofa', icon: 'Sofa', name: 'Sofá', category: 'home', specifications: { 
    models: ['Sofá Retrátil', 'Sofá Comum', 'Sofá de Canto', 'Sofá com Chaise', 'Sofá-Cama'],
    materials: ['Tecido', 'Couro']
  }},
  { id: 'carpet', icon: 'Square', name: 'Tapete', category: 'home', specifications: { measurements: true, models: ['Comum'] }},
  { id: 'armchair', icon: 'Armchair', name: 'Poltrona', category: 'home', specifications: {
    materials: ['Tecido', 'Couro'],
    models: ['Amamentação', 'Comum', 'Papai', 'Pé Palito', 'Almofadas Soltas']
  }},
  { id: 'chair', icon: 'ChairOffice', name: 'Cadeira', category: 'home', specifications: {
    models: ['Estofado no assento', 'Estofado no encosto', 'Estofado no assento e encosto', 'Luís XV, XIV ou XVI']
  }},
  { id: 'mattress', icon: 'Bed', name: 'Colchão', category: 'home', specifications: {
    sizes: ['Solteiro', 'Viúvo', 'Casal', 'Queen', 'King', 'Super King', 'Cama Auxiliar', 'Berço'],
    models: ['Box/Baú', 'Cabeceira']
  }},
  { id: 'ac', icon: 'Wind', name: 'Ar condicionado', category: 'home' },
  { id: 'car', icon: 'Car', name: 'Automóvel', category: 'home' },
  { id: 'puff', icon: 'Circle', name: 'Puff', category: 'home' },
  { id: 'baby-seat', icon: 'Baby', name: 'Bebê conforto', category: 'home' },
  { id: 'floor-carpet', icon: 'Grid3x3', name: 'Carpete', category: 'home' },
  { id: 'stroller', icon: 'Stroller', name: 'Carrinho de bebê', category: 'home' },
  { id: 'pillow', icon: 'Square', name: 'Almofada', category: 'home' },
];

// Combos para Casa
export const homeCombos: ComboItem[] = [
  { 
    id: 'combo-sofa-6-chairs', 
    icon: 'Package', 
    name: 'Sofá + 6 Cadeiras',
    description: 'Combo de limpeza completo para sala',
    category: 'home'
  },
  { 
    id: 'combo-sofa-mattress-couple', 
    icon: 'Package', 
    name: 'Sofá + 1 Colchão de Casal',
    description: 'Combo sala e quarto casal',
    category: 'home'
  },
  { 
    id: 'combo-sofa-6-chairs-mattress', 
    icon: 'Package', 
    name: 'Sofá + 6 Cadeiras + 1 Colchão',
    description: 'Combo completo sala e quarto',
    category: 'home'
  },
  { 
    id: 'combo-sofa-chairs-2-mattress', 
    icon: 'Package', 
    name: 'Sofá + 6 Cadeiras + 1 Colchão Casal + 1 Colchão de Solteiro',
    description: 'Combo família completa',
    category: 'home'
  },
  { 
    id: 'combo-sofa-car-seats', 
    icon: 'Package', 
    name: 'Sofá + Bancos do Carro',
    description: 'Combo casa e carro',
    category: 'home'
  },
  { 
    id: 'combo-sofa-chairs-car', 
    icon: 'Package', 
    name: 'Sofá + 6 Cadeiras + Bancos do carro',
    description: 'Combo completo casa e carro',
    category: 'home'
  }
];

// Serviços para Casa - Outros serviços
export const homeOtherServices: ServiceItem[] = [
  { id: 'aircraft', icon: 'Plane', name: 'Aeronave', category: 'home' },
  { id: 'church-bench', icon: 'Church', name: 'Banco de igreja', category: 'home' },
  { id: 'stool', icon: 'Square', name: 'Banqueta', category: 'home' },
  { id: 'plush-toy', icon: 'Heart', name: 'Bichinho de pelúcia', category: 'home' },
  { id: 'box', icon: 'Package', name: 'Box', category: 'home' },
  { id: 'headboard', icon: 'Rectangle', name: 'Cabeceira', category: 'home' },
  { id: 'truck', icon: 'Truck', name: 'Caminhão', category: 'home' },
  { id: 'german-corner', icon: 'Home', name: 'Canto alemão', category: 'home' },
  { id: 'chaise', icon: 'Sofa', name: 'Chaise', category: 'home' },
  { id: 'divan', icon: 'Bed', name: 'Divã', category: 'home' },
  { id: 'boat', icon: 'Ship', name: 'Embarcação', category: 'home' },
  { id: 'acoustic-foam', icon: 'Volume2', name: 'Espuma acústica', category: 'home' },
];

// Serviços para Empresa - Mais agendados  
export const businessMostScheduledServices: ServiceItem[] = [
  { id: 'floor-carpet-biz', icon: 'Grid3x3', name: 'Carpete', category: 'business' },
  { id: 'chair-biz', icon: 'ChairOffice', name: 'Cadeira', category: 'business', specifications: {
    models: ['Estofado no assento', 'Estofado no encosto', 'Estofado no assento e encosto', 'Luís XV, XIV ou XVI']
  }},
  { id: 'sofa-biz', icon: 'Sofa', name: 'Sofá', category: 'business', specifications: { 
    models: ['Sofá Retrátil', 'Sofá Comum', 'Sofá de Canto', 'Sofá com Chaise', 'Sofá-Cama'],
    materials: ['Tecido', 'Couro']
  }},
  { id: 'armchair-biz', icon: 'Armchair', name: 'Poltrona', category: 'business', specifications: {
    materials: ['Tecido', 'Couro'],
    models: ['Amamentação', 'Comum', 'Papai', 'Pé Palito', 'Almofadas Soltas']
  }},
  { id: 'carpet-biz', icon: 'Square', name: 'Tapete', category: 'business', specifications: { measurements: true, models: ['Comum'] }},
  { id: 'car-biz', icon: 'Car', name: 'Automóvel', category: 'business' },
  { id: 'puff-biz', icon: 'Circle', name: 'Puff', category: 'business' },
  { id: 'mattress-biz', icon: 'Bed', name: 'Colchão', category: 'business', specifications: {
    sizes: ['Solteiro', 'Viúvo', 'Casal', 'Queen', 'King', 'Super King', 'Cama Auxiliar', 'Berço'],
    models: ['Box/Baú', 'Cabeceira']
  }},
];

// Combos para Empresa
export const businessCombos: ComboItem[] = [
  { 
    id: 'combo-sofa-6-chairs-biz', 
    icon: 'Package', 
    name: 'Sofá + 6 Cadeiras',
    description: 'Combo escritório completo',
    category: 'business'
  },
  { 
    id: 'combo-sofa-mattress-couple-biz', 
    icon: 'Package', 
    name: 'Sofá + 1 Colchão de Casal',
    description: 'Combo para hotel/pousada',
    category: 'business'
  },
  { 
    id: 'combo-sofa-6-chairs-mattress-biz', 
    icon: 'Package', 
    name: 'Sofá + 6 Cadeiras + 1 Colchão',
    description: 'Combo estabelecimento completo',
    category: 'business'
  },
  { 
    id: 'combo-sofa-chairs-2-mattress-biz', 
    icon: 'Package', 
    name: 'Sofá + 6 Cadeiras + 1 Colchão Casal + 1 Colchão de Solteiro',
    description: 'Combo hotelaria premium',
    category: 'business'
  },
  { 
    id: 'combo-sofa-car-seats-biz', 
    icon: 'Package', 
    name: 'Sofá + Bancos do Carro',
    description: 'Combo empresa e frota',
    category: 'business'
  },
  { 
    id: 'combo-sofa-chairs-car-biz', 
    icon: 'Package', 
    name: 'Sofá + 6 Cadeiras + Bancos do carro',
    description: 'Combo empresarial completo',
    category: 'business'
  }
];

// Serviços para Empresa - Outros serviços
export const businessOtherServices: ServiceItem[] = [
  { id: 'pillow-biz', icon: 'Square', name: 'Almofada', category: 'business' },
  { id: 'ac-biz', icon: 'Wind', name: 'Ar condicionado', category: 'business' },
  { id: 'stool-biz', icon: 'Square', name: 'Banqueta', category: 'business' },
  { id: 'chaise-biz', icon: 'Sofa', name: 'Chaise', category: 'business' },
  { id: 'costume-upholstered', icon: 'Shirt', name: 'Fantasia estofada', category: 'business' },
  { id: 'plush-toy-biz', icon: 'Heart', name: 'Bichinho de pelúcia', category: 'business' },
  { id: 'headboard-biz', icon: 'Rectangle', name: 'Cabeceira', category: 'business' },
  { id: 'german-corner-biz', icon: 'Home', name: 'Canto alemão', category: 'business' },
  { id: 'acoustic-foam-biz', icon: 'Volume2', name: 'Espuma acústica', category: 'business' },
  { id: 'futon', icon: 'Bed', name: 'Futton', category: 'business' },
  { id: 'recamier', icon: 'Sofa', name: 'Récamier', category: 'business' },
  { id: 'aircraft-biz', icon: 'Plane', name: 'Aeronave', category: 'business' },
  { id: 'church-bench-biz', icon: 'Church', name: 'Banco de igreja', category: 'business' },
  { id: 'baby-seat-biz', icon: 'Baby', name: 'Bebê conforto', category: 'business' },
  { id: 'box-biz', icon: 'Package', name: 'Box', category: 'business' },
  { id: 'truck-biz', icon: 'Truck', name: 'Caminhão', category: 'business' },
  { id: 'stroller-biz', icon: 'Stroller', name: 'Carrinho de bebê', category: 'business' },
  { id: 'divan-biz', icon: 'Bed', name: 'Divã', category: 'business' },
];

// Tabela de preços dos kits
export const kitPricing: { [kitId: string]: RentalPricing } = {
  'basic-plus': {
    '22h': {
      'weekday': 149.90,
      'weekend': 179.90
    },
    '46h': {
      'weekday': 249.90,
      'weekend': 299.90
    }
  },
  'confort': {
    '22h': {
      'weekday': 199.90,
      'weekend': 239.90
    },
    '46h': {
      'weekday': 349.90,
      'weekend': 419.90
    }
  },
  'basic': {
    '22h': {
      'weekday': 99.90,
      'weekend': 129.90
    },
    '46h': {
      'weekday': 179.90,
      'weekend': 219.90
    }
  }
};

// Função para obter o preço dinâmico
export const getKitPrice = (kitId: string, durationId: string, periodId: string): number | null => {
  const pricing = kitPricing[kitId];
  if (!pricing) return null;
  
  const durationPricing = pricing[durationId];
  if (!durationPricing) return null;
  
  return durationPricing[periodId] || null;
};

// Opções de aluguel para "Para economizar"
export const rentalOptions: RentalOptions = {
  kits: [
    { id: 'basic-plus', name: 'BASIC PLUS', available: true, pricing: kitPricing['basic-plus'] },
    { id: 'confort', name: 'CONFORT', available: true, pricing: kitPricing['confort'] },
    { id: 'basic', name: 'BASIC (SEM VAGAS)', available: false, pricing: kitPricing['basic'] }
  ],
  durations: [
    { id: '22h', name: '22h', hours: '22h' },
    { id: '46h', name: '46h', hours: '46h' }
  ],
  periods: [
    { id: 'weekday', name: 'Dia de Semana' },
    { id: 'weekend', name: 'Final de Semana' }
  ]
};

// Upsell System
export interface UpsellItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  category: string;
  serviceTypes: string[]; // Service categories this upsell applies to
  conditions?: {
    forKits?: string[]; // Specific kit IDs
  };
}

export const upsellProducts: UpsellItem[] = [
  // Rental Machine Upsells
  {
    id: 'shampoo-estofados',
    name: 'Shampoo para Estofados',
    price: 15.00,
    description: 'Frasco 200ml – rende 10L. Profissional concentrado.',
    category: 'rental',
    serviceTypes: ['rental']
  },
  {
    id: 'shampoo-clareador',
    name: 'Shampoo Clareador',
    price: 15.00,
    description: 'Frasco 200ml – rende 10L. Ideal para tecidos claros.',
    category: 'rental',
    serviceTypes: ['rental', 'mattress']
  },
  {
    id: 'perfume-estofados',
    name: 'Perfume para Estofados',
    price: 15.00,
    description: 'Fragrância Bamboo – cheirinho de hotel.',
    category: 'universal',
    serviceTypes: ['rental', 'cleaning', 'mattress']
  },
  {
    id: 'escova-automatica',
    name: 'Escova Automática',
    price: 40.00,
    description: 'Escova elétrica que facilita a escovação. Valor por diária.',
    category: 'rental',
    serviceTypes: ['rental'],
    conditions: {
      forKits: ['basic-plus', 'basic']
    }
  },
  // Cleaning Service Upsells
  {
    id: 'impermeabilizacao',
    name: 'Impermeabilização de Estofados',
    price: 0, // Variable price
    description: 'Proteção contra manchas e líquidos. Preço varia conforme peça.',
    category: 'cleaning',
    serviceTypes: ['cleaning']
  }
];

// Function to get relevant upsells based on cart items
export const getRelevantUpsells = (cartItems: any[]): UpsellItem[] => {
  if (!cartItems.length) return [];

  const serviceTypes = new Set<string>();
  const kitIds = new Set<string>();

  // Analyze cart items to determine service types
  cartItems.forEach(item => {
    const itemName = item.name.toLowerCase();
    const itemDetails = item.details?.toLowerCase() || '';
    
    // Check if it's a rental service
    if (itemName.includes('aluguel') || itemName.includes('kit') || itemDetails.includes('kit')) {
      serviceTypes.add('rental');
      
      // Extract kit type for specific conditions
      if (itemName.includes('basic plus') || itemDetails.includes('basic plus')) {
        kitIds.add('basic-plus');
      } else if (itemName.includes('basic') || itemDetails.includes('basic')) {
        kitIds.add('basic');
      }
    }
    // Check for cleaning services
    else if (itemName.includes('limpeza') || 
             itemName.includes('sofá') ||
             itemName.includes('cadeira') ||
             itemName.includes('estofado') ||
             itemName.includes('poltrona')) {
      serviceTypes.add('cleaning');
    }
    // Check for mattress services
    else if (itemName.includes('colchão') || itemName.includes('colchao')) {
      serviceTypes.add('mattress');
    }
  });

  // Cart analysis complete

  // Filter upsells based on service types and conditions
  return upsellProducts.filter(upsell => {
    // Check if upsell applies to any service type in cart
    const hasMatchingServiceType = upsell.serviceTypes.some(type => serviceTypes.has(type));
    
    if (!hasMatchingServiceType) return false;

    // Check specific conditions if they exist
    if (upsell.conditions?.forKits) {
      const hasMatchingKit = upsell.conditions.forKits.some(kitId => kitIds.has(kitId));
      return hasMatchingKit;
    }

    return true;
  });
};

// Compatibilidade com código existente
export const mostScheduledServices = homeMostScheduledServices;
export const otherServices = homeOtherServices;