import type { SetupGuide } from './types';

export type { SetupGuide };

export const setupGuides: SetupGuide[] = [
  {
    name: "OpenRouter",
    slug: "openrouter",
    provider: "OpenRouter",
    description: "Gateway unificado para dezenas de modelos de IA com uma única API. Ideal para testar diferentes modelos sem múltiplas contas.",
    icon: "globe",
    difficulty: "iniciante",
    timeToComplete: "10 minutos",
    requirements: [
      "Conta no OpenRouter (gratuita)",
      "Chave de API",
      "OpenCode instalado"
    ],
    steps: [
      {
        title: "Criar conta no OpenRouter",
        description: "Acesse openrouter.ai e crie sua conta gratuita. Você pode usar Google ou GitHub para login rápido.",
        code: "# Acesse https://openrouter.ai e clique em 'Sign Up'"
      },
      {
        title: "Gerar chave de API",
        description: "No menu 'Keys', clique em 'Create Key'. Dê um nome para sua chave e selecione os modelos que deseja acessar.",
        code: "# Em https://openrouter.ai/keys\n# Clique em 'Create Key'\n# Copie a chave gerada (sk-or-v1-...)"
      },
      {
        title: "Adicionar créditos (opcional)",
        description: "OpenRouter oferece modelos gratuitos e pagos. Adicione créditos para acessar modelos premium como Claude Sonnet ou GPT-5.5.",
        code: "# Vá em 'Credit' no menu lateral\n# Adicione o valor desejado\n# Modelos gratuitos não precisam de créditos"
      },
      {
        title: "Configurar no OpenCode",
        description: "No arquivo opencode.json do seu projeto, adicione o provedor OpenRouter com sua chave de API.",
        code: `{
  "providers": {
    "openrouter": {
      "apiKey": "sk-or-v1-sua-chave-aqui",
      "model": "anthropic/claude-sonnet-4"
    }
  }
}`
      },
      {
        title: "Testar a conexão",
        description: "Execute um comando simples para verificar se a configuração está funcionando.",
        code: "opencode --model openrouter --prompt 'Olá, responda com OK'"
      }
    ],
    tips: [
      "Use modelos gratuitos (Mistral, Llama) para testar antes de usar modelos pagos",
      "Configure um limite de gastos mensal no dashboard do OpenRouter",
      "OpenRouter oferece fallback automático entre modelos"
    ]
  },
  {
    name: "Gemini API",
    slug: "gemini",
    provider: "Google AI",
    description: "API oficial do Google para acessar os modelos Gemini, incluindo o Flash (grátis) e o Pro (contexto de 2M tokens).",
    icon: "sparkles",
    difficulty: "iniciante",
    timeToComplete: "10 minutos",
    requirements: [
      "Conta Google",
      "Chave de API do Google AI Studio",
      "OpenCode instalado"
    ],
    steps: [
      {
        title: "Acessar Google AI Studio",
        description: "Vá para aistudio.google.com e faça login com sua conta Google.",
        code: "# Acesse https://aistudio.google.com"
      },
      {
        title: "Criar chave de API",
        description: "No menu 'Get API Key', clique em 'Create API Key'. Selecione seu projeto Google Cloud ou crie um novo.",
        code: "# Em 'Get API Key' → 'Create API Key'\n# Copie a chave gerada"
      },
      {
        title: "Configurar no OpenCode",
        description: "Adicione o provedor Gemini no arquivo de configuração do OpenCode.",
        code: `{
  "providers": {
    "gemini": {
      "apiKey": "AIza-sua-chave-aqui",
      "model": "gemini-2.5-pro"
    }
  }
}`
      },
      {
        title: "Testar com Gemini Flash (grátis)",
        description: "O Gemini Flash é gratuito e tem contexto de 1M tokens. Perfeito para testar.",
        code: "opencode --model gemini --prompt 'Resuma este texto em 3 linhas'"
      }
    ],
    tips: [
      "Gemini Flash é gratuito e tem contexto de 1M tokens",
      "Gemini Pro tem 2M tokens de contexto, ideal para codebases grandes",
      "Cuidado com rate limits na versão gratuita"
    ]
  },
  {
    name: "Claude (Anthropic)",
    slug: "claude",
    provider: "Anthropic",
    description: "API oficial da Anthropic para acessar Claude Sonnet, Haiku e outros modelos. Referência em coding e análise.",
    icon: "message-circle",
    difficulty: "iniciante",
    timeToComplete: "10 minutos",
    requirements: [
      "Conta na Anthropic Console",
      "Chave de API",
      "Saldo disponível (modelos pagos)"
    ],
    steps: [
      {
        title: "Criar conta na Anthropic",
        description: "Acesse console.anthropic.com e crie sua conta. Você precisará verificar seu email.",
        code: "# Acesse https://console.anthropic.com\n# Crie sua conta e verifique o email"
      },
      {
        title: "Gerar chave de API",
        description: "No menu 'API Keys', clique em 'Create Key'. Dê um nome para sua chave.",
        code: "# Vá em 'API Keys' → 'Create Key'\n# Copie a chave (sk-ant-...)"
      },
      {
        title: "Adicionar créditos",
        description: "Diferente do Gemini, a API da Anthropic não tem camada gratuita. Adicione créditos no menu 'Billing'.",
        code: "# Vá em 'Billing'\n# Adicione créditos (mínimo $5)\n# Configure alertas de gastos"
      },
      {
        title: "Configurar no OpenCode",
        description: "Adicione o provedor Claude na configuração do OpenCode.",
        code: `{
  "providers": {
    "anthropic": {
      "apiKey": "sk-ant-sua-chave-aqui",
      "model": "claude-sonnet-4"
    }
  }
}`
      },
      {
        title: "Testar a conexão",
        description: "Verifique se a API está funcionando corretamente.",
        code: "opencode --model anthropic --prompt 'Teste de conexão com Claude'"
      }
    ],
    tips: [
      "Claude Sonnet é o melhor modelo para coding atualmente",
      "Claude Haiku é mais rápido e barato para tarefas simples",
      "Configure um orçamento máximo para evitar gastos inesperados"
    ]
  },
  {
    name: "GPT (OpenAI)",
    slug: "gpt",
    provider: "OpenAI",
    description: "API oficial da OpenAI para acessar GPT-4o, GPT-5.5, o3 e outros modelos. O ecossistema mais maduro de IA.",
    icon: "zap",
    difficulty: "iniciante",
    timeToComplete: "10 minutos",
    requirements: [
      "Conta na OpenAI",
      "Chave de API",
      "Saldo disponível (modelos pagos)"
    ],
    steps: [
      {
        title: "Criar conta na OpenAI",
        description: "Acesse platform.openai.com e crie sua conta.",
        code: "# Acesse https://platform.openai.com\n# Crie sua conta"
      },
      {
        title: "Gerar chave de API",
        description: "No menu 'API Keys', clique em 'Create new secret key'. Salve a chave imediatamente.",
        code: "# Vá em 'API Keys' → 'Create new secret key'\n# Copie a chave (sk-proj-...)\n# Atenção: a chave só é mostrada uma vez"
      },
      {
        title: "Configurar pagamento",
        description: "Adicione um método de pagamento em 'Billing' para acessar modelos pagos. GPT-4o mini é muito barato.",
        code: "# Vá em 'Billing' → 'Payment methods'\n# Adicione seu cartão\n# Configure limites de uso"
      },
      {
        title: "Configurar no OpenCode",
        description: "Adicione o provedor OpenAI na configuração do OpenCode.",
        code: `{
  "providers": {
    "openai": {
      "apiKey": "sk-proj-sua-chave-aqui",
      "model": "gpt-4o"
    }
  }
}`
      },
      {
        title: "Testar a conexão",
        description: "Execute um teste simples com o modelo configurado.",
        code: "opencode --model openai --prompt 'Olá, mundo!'"
      }
    ],
    tips: [
      "GPT-4o mini é o melhor custo-benefício da OpenAI",
      "Configure limites de gastos no dashboard",
      "Use o Playground da OpenAI para testar prompts antes"
    ]
  },
  {
    name: "GitHub Copilot",
    slug: "github-copilot",
    provider: "GitHub / Microsoft",
    description: "Assistente de código da GitHub com modelos da OpenAI. Integração nativa com VS Code, JetBrains e mais.",
    icon: "github",
    difficulty: "iniciante",
    timeToComplete: "15 minutos",
    requirements: [
      "Conta GitHub",
      "Assinatura do GitHub Copilot (gratuita para estudantes/mantenedores open source)",
      "VS Code, JetBrains ou outro editor suportado"
    ],
    steps: [
      {
        title: "Instalar extensão",
        description: "No VS Code, instale a extensão 'GitHub Copilot' da GitHub.",
        code: "# VS Code: Extensions → GitHub Copilot\n# Clique em Install"
      },
      {
        title: "Autenticar com GitHub",
        description: "Após instalar, um ícone do Copilot aparece no canto inferior. Clique e faça login com sua conta GitHub.",
        code: "# Clique no ícone do Copilot\n# 'Sign in to GitHub'\n# Autorize no navegador"
      },
      {
        title: "Escolher modelo",
        description: "O GitHub Copilot usa GPT-4o por padrão, mas você pode alternar para outros modelos da OpenAI.",
        code: `# Configuração no VS Code settings.json:
{
  "github.copilot.chat.model": "gpt-4o",
  "github.copilot.enable": {
    "*": true
  }
}`
      },
      {
        title: "Usar com OpenCode",
        description: "Configure o OpenCode para usar o GitHub Copilot como provedor ou use-o separadamente.",
        code: `# opencode.json
{
  "providers": {
    "github-copilot": {
      "auth": "token-github"
    }
  }
}`
      },
      {
        title: "Testar completions",
        description: "Comece a digitar código no editor e veja as sugestões automáticas do Copilot.",
        code: "# Digite um comentário: // função que calcula fibonacci\n# O Copilot sugere automaticamente o código"
      }
    ],
    tips: [
      "GitHub Copilot é gratuito para estudantes e mantenedores de projetos open source",
      "Use Ctrl+Enter para ver múltiplas sugestões",
      "Quanto mais contexto, melhores as sugestões"
    ]
  },
  {
    name: "LM Studio",
    slug: "lm-studio",
    provider: "LM Studio",
    description: "Interface gráfica para rodar modelos de linguagem localmente no seu computador. Suporta modelos GGUF do HuggingFace.",
    icon: "monitor",
    difficulty: "intermediário",
    timeToComplete: "20 minutos",
    requirements: [
      "Windows, macOS ou Linux",
      "Pelo menos 8GB de RAM (16GB+ recomendado)",
      "GPU dedicada (opcional, mas recomendada)",
      "10GB+ de espaço livre em disco"
    ],
    steps: [
      {
        title: "Baixar e instalar LM Studio",
        description: "Acesse lmstudio.ai e baixe a versão para seu sistema operacional. A instalação é simples.",
        code: "# Acesse https://lmstudio.ai\n# Baixe e instale a versão adequada"
      },
      {
        title: "Baixar um modelo",
        description: "Abra o LM Studio, vá na aba 'Search' e procure por modelos. Recomendamos começar com Mistral 7B ou Llama 3.2 (3B).",
        code: "# Aba 'Search' → Busque 'Mistral 7B GGUF'\n# Clique no modelo e 'Download'"
      },
      {
        title: "Carregar o modelo",
        description: "Vá na aba 'AI Chat' e selecione o modelo baixado no menu suspenso. Aguarde o carregamento.",
        code: "# Aba 'Chat' → Selecione o modelo\n# Aguarde 'Model loaded successfully'"
      },
      {
        title: "Iniciar servidor local",
        description: "Na aba 'Server', ative o servidor local (porta 1234 por padrão) para usar com OpenCode.",
        code: "# Aba 'Server' → Start Server\n# URL: http://localhost:1234"
      },
      {
        title: "Configurar OpenCode",
        description: "Configure o OpenCode para apontar para o servidor local do LM Studio.",
        code: `{
  "providers": {
    "lm-studio": {
      "baseUrl": "http://localhost:1234",
      "model": "mistral-7b-instruct"
    }
  }
}`
      },
      {
        title: "Testar conexão local",
        description: "Execute um comando para verificar a conexão com o modelo local.",
        code: "opencode --model lm-studio --prompt 'Qual é a capital do Brasil?'"
      }
    ],
    tips: [
      "Modelos menores (3B-7B) rodam em qualquer notebook",
      "Modelos maiores (13B-70B) precisam de GPU dedicada",
      "Feche outros programas pesados ao rodar modelos localmente",
      "Use modelos quantizados (Q4_K_M ou Q5_K_M) para melhor performance"
    ]
  },
  {
    name: "Ollama",
    slug: "ollama",
    provider: "Ollama",
    description: "Ferramenta de linha de comando para rodar LLMs localmente. Suporta dezenas de modelos como Llama, Mistral, DeepSeek e mais.",
    icon: "terminal",
    difficulty: "intermediário",
    timeToComplete: "15 minutos",
    requirements: [
      "Windows, macOS ou Linux",
      "Terminal básico",
      "Pelo menos 8GB de RAM",
      "5GB+ de espaço livre"
    ],
    steps: [
      {
        title: "Instalar Ollama",
        description: "Acesse ollama.com e baixe o instalador para seu sistema. No Linux, use o script de instalação.",
        code: "# Windows/macOS: Baixe de https://ollama.com\n# Linux:\ncurl -fsSL https://ollama.com/install.sh | sh"
      },
      {
        title: "Baixar um modelo",
        description: "Use o comando `ollama pull` para baixar um modelo. Comece com o Llama 3.2 (3B) ou Mistral.",
        code: "ollama pull llama3.2:3b\n# ou\nollama pull mistral"
      },
      {
        title: "Testar o modelo",
        description: "Execute o modelo diretamente no terminal para verificar se está funcionando.",
        code: "ollama run llama3.2:3b\n# Digite 'Olá, como você está?' e veja a resposta"
      },
      {
        title: "Iniciar servidor",
        description: "O Ollama já inicia um servidor automaticamente na porta 11434 quando você usa `ollama serve`.",
        code: "ollama serve\n# Servidor rodando em http://localhost:11434"
      },
      {
        title: "Configurar OpenCode",
        description: "Configure o OpenCode para usar o Ollama como provedor local.",
        code: `{
  "providers": {
    "ollama": {
      "baseUrl": "http://localhost:11434",
      "model": "llama3.2:3b"
    }
  }
}`
      },
      {
        title: "Testar integração",
        description: "Verifique se o OpenCode consegue se comunicar com o Ollama.",
        code: "opencode --model ollama --prompt 'Diga olá em português'"
      }
    ],
    tips: [
      "Use `ollama list` para ver modelos baixados",
      "Modelos ficam em ~/.ollama/models/",
      "Ollama suporta GPU acceleration (NVIDIA CUDA e Apple Metal)",
      "Experimente `ollama run deepseek-r1:8b` para um modelo com reasoning"
    ]
  }
];

export function getSetupGuideBySlug(slug: string): SetupGuide | undefined {
  return setupGuides.find(g => g.slug === slug);
}
