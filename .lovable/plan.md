## Diagnóstico — bugs encontrados nos 4 bônus

Inspecionei os 4 PDFs (`bonus-1` até `bonus-4`) convertendo cada página em JPEG e analisando visualmente. Os bônus foram gerados na **versão antiga** do gerador (antes das correções aplicadas no guia principal), e por isso reproduzem os mesmos defeitos sistêmicos:

### Bônus 1 — Tabela de Tecidos (1 página)
- **Texto saindo da célula:** as colunas "PODE USAR" e "NUNCA USE" ultrapassam a borda direita ("Pano úmido + detergente neutro", "Removedor, esponja abrasiva", "Calor, secador, água quente" — exatamente o bug do print que você enviou).
- **Kerning quebrado:** "TEC IDOS", "Couro Legitim o", "Suede / Cam urça", "M icrofibra", "Pano úm ido", "Á lcool puro", "RC Lim pa+".
- **Sem zebra (linhas alternadas)** — comparado ao print de referência que tem fundo creme alternado.
- **Header da tabela cinza** em vez do azul-marinho da identidade visual.

### Bônus 2 — Kit Caseiro (1 página)
- Kerning quebrado em todos os títulos negrito: "KIT CASE IRO", "VOCÊ JÁ TEM EM CASA", "B icarbonato de sódio", "Á lcool 70°", "Pano de m icrofibra", "Sabão neutro Ypê (líqu ido)", "Pano m icrofibra branco (k it 3)", "D ICA DO ESPECIA LISTA".

### Bônus 3 — 5 Erros (6 páginas)
- Capa com kerning quebrado: "5 ERROS", "QUE DESTROEM", "O SEU SOFÁ".
- Em todas as páginas internas: "USAR ÁGUA QUENTE", "CONSEQUÊNC IA", "FAÇA NO LUGAR", "Use SEMPRE", etc.

### Bônus 4 — Grupo VIP (1 página)
- "GRUPO V IP", "Bem -vindo à com unidade RC Lim pa+", "1. SUPORTE NO AC IDENTE", "2. D ICA DA SEMANA", "3. DESCONTOS PRÉ -LANÇAM ENTO", "REGRAS DO G RUPO", "ENTRE AGORA NO G RUPO".

### Causa-raiz comum
Mesma do guia principal antes da correção: o script gerador dos bônus usa `Helvetica-Bold` padrão do ReportLab (sem suporte adequado a acentos/kerning) e as células das tabelas recebem strings cruas (sem `Paragraph`), então não há word-wrap automático.

---

## Correção (a aplicar quando aprovado)

Vou criar **um único script** `/tmp/gen_bonus.py` que reaproveita as mesmas funções já validadas no `gen_guia.py` (correção do guia principal) e gera os 4 PDFs num só passe:

### A) Fonte Inter registrada (fix de kerning)
```python
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
# Reaproveitar Inter Regular/Bold/SemiBold/ExtraBold já baixado em /tmp/fonts
pdfmetrics.registerFont(TTFont('Inter',         '/tmp/fonts/Inter-Regular.ttf'))
pdfmetrics.registerFont(TTFont('Inter-Bold',    '/tmp/fonts/Inter-Bold.ttf'))
pdfmetrics.registerFont(TTFont('Inter-Semi',    '/tmp/fonts/Inter-SemiBold.ttf'))
pdfmetrics.registerFont(TTFont('Inter-Extra',   '/tmp/fonts/Inter-ExtraBold.ttf'))
pdfmetrics.registerFontFamily('Inter', normal='Inter', bold='Inter-Bold')
```
Isso elimina 100% dos casos de kerning quebrado ("TEC IDOS" → "TECIDOS", "Lim pa+" → "Limpa+", etc.).

### B) Tabela de tecidos (Bônus 1) com word-wrap + zebra + header azul
```python
def fancy_table(header, rows, col_widths):
    data = [[Paragraph(h, S_TH_WHITE) for h in header]]   # header com Paragraph (fonte branca)
    for r in rows:
        data.append([Paragraph(cell, S_TD) for cell in r])  # cada célula word-wrap
    t = Table(data, colWidths=col_widths, repeatRows=1)
    style = TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY),               # header azul-marinho
        ('TEXTCOLOR',  (0,0), (-1,0), WHITE),
        ('GRID',       (0,0), (-1,-1), 0.5, GRID_GRAY),
        ('VALIGN',     (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING',(0,0), (-1,-1), 6),
        ('RIGHTPADDING',(0,0),(-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING',(0,0),(-1,-1), 8),
    ])
    # zebra (linhas alternadas)
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.add('BACKGROUND', (0,i), (-1,i), CREAM)
    t.setStyle(style)
    return t
```
Largura das colunas calibrada para 174mm úteis: `[35mm, 50mm, 50mm, 39mm]` — garante que "Pano úmido + detergente neutro" e "Removedor, esponja abrasiva" quebrem em 2 linhas em vez de estourar a borda.

### C) Imagens proporcionais (caso bônus tenham imagens)
Reaproveitar a função `fit_image()` corrigida do guia principal (calcula altura proporcional via PIL, com clamp `max_h_mm`). Hoje os bônus não usam imagem, mas a função fica disponível.

### D) QA visual obrigatório
1. Rodar `python /tmp/gen_bonus.py` → regenera os 4 PDFs em `/mnt/documents/bonus-guia-sofa/`.
2. `pdftoppm -jpeg -r 150` em todas as páginas (1 + 1 + 6 + 1 = 9 páginas).
3. Inspecionar **cada uma** com `code--view` procurando especificamente:
   - Zero kerning quebrado (testar palavras-armadilha: "RC Limpa+", "Microfibra", "Bicarbonato", "Limpa+", "Bem-vindo", "Bônus #3").
   - Tabela do Bônus 1 com 4 colunas dentro da borda e zebra alternada.
   - Header azul-marinho com texto branco.
   - Nenhum overflow horizontal em nenhuma página.
   - Marcas de check (`✓`) e X (`✗`) renderizando corretamente.
4. Validar com `pdftotext` + `grep` que palavras-chave aparecem juntas (sem espaços parasitas).

---

## Arquivos afetados

- **Criar:** `/tmp/gen_bonus.py` (script único, ~400 linhas)
- **Sobrescrever:** 
  - `/mnt/documents/bonus-guia-sofa/bonus-1-tabela-tecidos.pdf`
  - `/mnt/documents/bonus-guia-sofa/bonus-2-lista-compras-kit.pdf`
  - `/mnt/documents/bonus-guia-sofa/bonus-3-cinco-erros.pdf`
  - `/mnt/documents/bonus-guia-sofa/bonus-4-grupo-vip-instrucoes.pdf`

Conteúdo textual e estrutura dos bônus permanecem **idênticos** — só a renderização visual é corrigida. Nenhum código do projeto React/Supabase é tocado.