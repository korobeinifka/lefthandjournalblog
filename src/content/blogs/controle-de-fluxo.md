---
title: 'Controle de fluxo (if, for, while)'
pubDate: 2026-01-12T00:00:00.000Z
category: tecnologia
author: antonio maluf
heroImage: /aaaa.webp
---

### Controle de fluxo (if, for, while)

Em Python, **controle de fluxo** é o conjunto de estruturas usadas para decidir **o que o programa faz em cada situação** e **quantas vezes** algo deve ser executado. As principais são `if`, `for` e `while`.

#### if / elif / else

O `if` executa um bloco de código apenas se uma condição for verdadeira.

* `if` testa a condição principal
* `elif` adiciona condições alternativas
* `else` cobre o caso em que nenhuma condição anterior foi verdadeira

Em Python, condições usam valores booleanos (`True` / `False`), mas também podem usar qualquer valor *truthy* ou *falsy*.\
Por exemplo: `0`, `""`, `[]` e `None` são tratados como falsos em contextos condicionais.

#### for

O `for` é usado para **percorrer itens de uma sequência** (como listas, strings e tuplas) ou qualquer objeto iterável (como dicionários e geradores).

Em Python, o `for` não funciona como um contador por padrão. Ele funciona como “para cada item em…”.\
Quando é necessário contar repetições, geralmente utiliza-se `range()`.

Casos comuns de uso:

* iterar por uma lista de valores
* iterar por caracteres de uma string
* iterar por chaves e valores de um dicionário

#### while

O `while` executa um bloco de código **enquanto** uma condição for verdadeira.

É usado quando não se sabe, de antemão, quantas repetições serão necessárias, como em:

* esperar uma condição mudar
* repetir até um valor atingir um limite
* processar dados até não haver mais entrada

Por depender de uma condição de parada explícita, o `while` pode gerar loops infinitos se essa condição não for atualizada corretamente.

#### break e continue

* `break` encerra o loop imediatamente
* `continue` interrompe a iteração atual e passa para a próxima

Ambos funcionam em `for` e `while`.

#### else em loops

Python permite o uso de `else` em loops (`for` e `while`).

Nesse caso, o bloco `else` é executado **apenas se o loop terminar normalmente**, sem que o `break` seja acionado.\
Esse recurso é comum quando se busca um item dentro de uma sequência e se deseja tratar o caso em que ele não é encontrado.
