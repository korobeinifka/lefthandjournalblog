---
title: 'Variáveis, tipos e mutabilidade'
pubDate: '2026-01-12T00:00:00.000Z'
category: tecnologia
author: antonio maluf
heroImage: /aaaa.webp
---


Em Python, uma variável é um nome que referencia um valor armazenado na memória. Diferente de algumas linguagens, a variável não possui um tipo fixo. O tipo está associado ao valor, não ao nome da variável.

Por exemplo, uma mesma variável pode referenciar um número em um momento e, depois, uma string. Essa característica está ligada ao fato de Python ser uma linguagem dinamicamente tipada.

Python possui tipos básicos amplamente utilizados, como números inteiros (int), números de ponto flutuante (float), textos (str) e valores booleanos (bool). Além desses, existem tipos compostos, como listas, tuplas, conjuntos e dicionários.

Um conceito importante em Python é a diferença entre tipos mutáveis e imutáveis.

Tipos imutáveis não podem ser alterados depois de criados. Exemplos comuns são int, float, str e tuple. Quando se “altera” um desses valores, na prática um novo objeto é criado.

Tipos mutáveis podem ser modificados após a criação. Listas (list), dicionários (dict) e conjuntos (set) permitem alterações diretas em seu conteúdo, como adicionar, remover ou modificar elementos.

Essa diferença afeta o comportamento das variáveis quando elas são copiadas ou passadas para funções. Em tipos mutáveis, duas variáveis podem referenciar o mesmo objeto, fazendo com que alterações em um lugar apareçam em outro. Em tipos imutáveis, isso não acontece da mesma forma.
