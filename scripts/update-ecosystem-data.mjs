/**
 * Script de atualização automática dos dados do ecossistema OpenCode.
 * Executado pelo GitHub Action update-data.yml a cada 6 horas.
 *
 * Agora delega para os coletores modulares em scripts/collectors/.
 *
 * Uso:
 *   node scripts/update-ecosystem-data.mjs
 */

console.log('🔄 Iniciando atualização de dados do ecossistema OpenCode...\n');
console.log('   Delegando para coletores modulares em scripts/collectors/\n');

// Importa e executa o orquestrador principal
await import('./collectors/index.mjs');
