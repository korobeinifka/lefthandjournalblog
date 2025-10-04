---
title: "Checkpoint técnico de deploy"
description: "Checklist mínimo para evitar surpresas em produção."
pubDate: 2025-10-04T10:30:00.000Z
category: Technology
author: "antonio maluf"
heroImage: /images/placeholder-card.svg
heroImageAlt: "Ícone de foguete representando deploy"
---

Antes de publicar:

- Build local limpo (`npm ci && npm run build`);
- Variáveis de ambiente conferidas;
- **Logs silenciosos** (sem warn desnecessário);
- _Fallbacks_ presentes (erro + rota de saída).

```bash
# smoke test
curl -s -o /dev/null -w "%{http_code}\n" https://lefthandjournal.com/
```