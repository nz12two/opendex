import type { Projeto, Gargalo } from './types';

/**
 * Analisa gargalos e sugestões baseado nos padrões detectados no projeto.
 */
export function analisarGargalos(projeto: Projeto): Gargalo[] {
  const gargalos: Gargalo[] = [];

  // 1. Sem testes
  if (!projeto.features?.includes('testes')) {
    gargalos.push({
      tipo: 'warning',
      mensagem: 'Sem testes detectados',
      sugestao: 'Considere adicionar o Test Runner plugin ou usar o agente Tester para gerar suites de teste automatizadas.',
    });
  }

  // 2. Sem Docker
  if (!projeto.features?.includes('docker')) {
    gargalos.push({
      tipo: 'info',
      mensagem: 'Sem Docker detectado',
      sugestao: 'O Docker Manager pode ajudar a containerizar seu projeto e gerenciar ambientes de desenvolvimento.',
    });
  }

  // 3. Refatoração - alta complexidade
  if (projeto.features?.includes('refactor') || projeto.descricao.toLowerCase().includes('grande')) {
    gargalos.push({
      tipo: 'danger',
      mensagem: 'Alta complexidade — refatoração necessária',
      sugestao: 'Use o workflow de Refatoração ou o agente Planner para estruturar a refatoração em etapas seguras.',
    });
  }

  // 4. API sem docs
  if (projeto.features?.includes('api') && !projeto.features?.includes('docs')) {
    gargalos.push({
      tipo: 'warning',
      mensagem: 'API sem documentação detectada',
      sugestao: 'O Doc Builder ou o prompt de Documentação pode gerar docs automáticas para sua API.',
    });
  }

  // 5. Sem autenticação
  if (projeto.features?.includes('api') && !projeto.features?.includes('auth')) {
    gargalos.push({
      tipo: 'info',
      mensagem: 'API pode precisar de autenticação',
      sugestao: 'Considere adicionar JWT/OAuth. O prompt "Criar API REST" inclui autenticação JWT.',
    });
  }

  // 6. Deploy não planejado
  if (
    (projeto.features?.includes('web') || projeto.features?.includes('api')) &&
    !projeto.features?.includes('deploy')
  ) {
    gargalos.push({
      tipo: 'info',
      mensagem: 'Pipeline de deploy não planejado',
      sugestao: 'O workflow de Deploy automatizado pode configurar CI/CD com validação e rollback.',
    });
  }

  // 7. Performance pode ser problema
  if (
    projeto.features?.includes('api') &&
    !projeto.features?.includes('performance') &&
    !projeto.features?.includes('cache')
  ) {
    gargalos.push({
      tipo: 'warning',
      mensagem: 'Performance não considerada',
      sugestao: 'O MCP Redis pode ajudar com cache. Considere análise de performance com o agente Reviewer.',
    });
  }

  // 8. Sem CI/CD
  if (!projeto.features?.includes('deploy') && !projeto.features?.includes('docker')) {
    gargalos.push({
      tipo: 'info',
      mensagem: 'Automação de qualidade não detectada',
      sugestao: 'O Git Automator + Test Runner podem formar uma pipeline de qualidade antes de cada commit.',
    });
  }

  // 9. Projeto Discord sem moderação
  if (projeto.features?.includes('discord') || projeto.features?.includes('bot')) {
    gargalos.push({
      tipo: 'warning',
      mensagem: 'Bot pode precisar de segurança adicional',
      sugestao: 'O VibeGuard plugin pode proteger tokens do seu bot contra vazamento em commits.',
    });
  }

  // 10. Projeto monolítico
  if (projeto.features?.includes('fullstack') || (projeto.features?.includes('api') && projeto.features?.includes('frontend'))) {
    gargalos.push({
      tipo: 'info',
      mensagem: 'Projeto full-stack detectado',
      sugestao: 'Considere usar o workflow de Desenvolvimento Web para orquestrar back-end e front-end em paralelo.',
    });
  }

  return gargalos;
}
