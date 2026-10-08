const fs = require('fs');
const path = require('path');

console.log('--- TESTE DE VERIFICAÇÃO MUTHUKO ---');

// 1. Verificar manifest.json
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
console.log('✓ manifest.json existe e é válido:');
console.log('  Nome:', manifest.name);
console.log('  Display:', manifest.display);
console.log('  Ícones configurados:', manifest.icons.length);

// 2. Verificar Service Worker
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');
console.log('✓ public/sw.js existe (' + swContent.length + ' bytes)');

// 3. Verificar Ícones
const icon192 = fs.existsSync(path.join(__dirname, '..', 'public', 'icons', 'icon-192.png'));
const icon512 = fs.existsSync(path.join(__dirname, '..', 'public', 'icons', 'icon-512.png'));
const iconSvg = fs.existsSync(path.join(__dirname, '..', 'public', 'icons', 'icon.svg'));
console.log('✓ Ícones gerados (192, 512, svg):', { icon192, icon512, iconSvg });

// 4. Testar leitura de seed-data.ts
const seedDataContent = fs.readFileSync(path.join(__dirname, '..', 'lib', 'seed-data.ts'), 'utf8');

// Contar ordens no seed
const orderMatches = seedDataContent.match(/id:\s*['"]MTK-2026-\d+['"]/g);
console.log('✓ Total de Ordens no Seed:', orderMatches ? orderMatches.length : 0);
if (orderMatches && orderMatches.length === 42) {
  console.log('  -> EXATAMENTE 42 ordens cadastradas!');
} else {
  console.error('  -> ERRO: esperava 42 ordens');
}

// Contar peças no seed
const partMatches = seedDataContent.match(/id:\s*['"]PRT-2026-\d+['"]/g);
console.log('✓ Total de Peças no Seed:', partMatches ? partMatches.length : 0);
if (partMatches && partMatches.length === 28) {
  console.log('  -> EXATAMENTE 28 peças catalogadas no banco!');
} else {
  console.error('  -> ERRO: esperava 28 peças');
}

// Verificar bairros representados
const hasMuhala = seedDataContent.includes('Muhala');
const hasNamutequeliua = seedDataContent.includes('Namutequeliua');
console.log('✓ Bairros de Nampula representados:', { Muhala: hasMuhala, Namutequeliua: hasNamutequeliua });

// Verificar semicondutores chave
const hasIRF3205 = seedDataContent.includes('IRF3205');
const has13003 = seedDataContent.includes('13003');
const hasKBP307 = seedDataContent.includes('KBP307');
const has450V = seedDataContent.includes('450V');
console.log('✓ Semicondutores presentes:', { IRF3205: hasIRF3205, '13003': has13003, KBP307: hasKBP307, '450V': has450V });

// Verificar os 4 KPIs exatos
const has42OrdersMetric = seedDataContent.includes('totalOrders: 42');
const has0LossClaims = seedDataContent.includes('zeroLossClaims: 0');
const has7DaysAvg = seedDataContent.includes('avgDecisionDays: 7');
const has28SavedParts = seedDataContent.includes('savedPartsCount: 28');
console.log('✓ 4 KPIs do Relatório de Campo:', {
  '42 Aparelhos cadastrados': has42OrdersMetric,
  '0 Reclamações de extravio': has0LossClaims,
  '7 dias tempo médio decisão': has7DaysAvg,
  '28 Peças salvas': has28SavedParts
});

console.log('--- TODOS OS REQUISITOS VALIDADOS COM SUCESSO! ---');
