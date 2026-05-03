-- Remover equipamentos que não serão mais utilizados
DELETE FROM alugueis 
WHERE equipamento IN (
  'Aluguel de Enceradeira CLEANER 350',
  'Aluguel de Lavadora de Alta Pressão',
  'Aluguel Vaporetto'
);

-- Atualizar período "Diária Econômica" para "Econômico"
UPDATE alugueis 
SET periodo_aluguel = 'Econômico'
WHERE equipamento = 'Aluguel de Extratora IPC A135' 
  AND periodo_aluguel = 'Diária Econômica';

-- Atualizar preço do Semanal de 400 para 350
UPDATE alugueis 
SET preco = 350.00
WHERE equipamento = 'Aluguel de Extratora IPC A135' 
  AND periodo_aluguel = 'Semanal';