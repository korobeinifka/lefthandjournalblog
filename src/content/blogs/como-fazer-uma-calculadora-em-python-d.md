---
title: 'Como fazer uma calculadora em Python >:D'
description: 'Descubra agora. '
pubDate: 2025-10-09T00:00:00.000Z
category: Tecnologia
author: antonio maluf
---

![](/images/Graficos-em-python-1.png)

Para criar uma calculadora em Python, você pode optar por uma versão simples via terminal, que usa funções input() para coletar números e operações, ou uma versão com interface gráfica utilizando bibliotecas como Tkinter para criar botões e campos de texto. Ambas envolvem lógica condicional (if/elif/else) para processar as operações matemáticas solicitadas pelo usuário. 

Calculadora Simples (no Terminal)

Esta abordagem coleta a entrada do usuário via texto no terminal e utiliza funções para realizar as operações. 

Solicite a entrada: Use a função input() para pedir dois números ao usuário e converta-os para o tipo float para permitir números decimais. 

Peça a operação: Peça ao usuário para escolher a operação desejada (soma, subtração, multiplicação, divisão). 

Use condicionais: Crie uma estrutura if/elif/else para verificar a operação escolhida e executar o cálculo correspondente. 

Exiba o resultado: Use a função print() para mostrar o resultado na tela. 

```python
# Exemplo de um código básico para calculadora
num1 = float(input("Digite o primeiro número: "))
num2 = float(input("Digite o segundo número: "))
operacao = input("Escolha a operação (+, -, *, /): ")

if operacao == '+':
    resultado = num1 + num2
elif operacao == '-':
    resultado = num1 - num2
elif operacao == '*':
    resultado = num1 * num2
elif operacao == '/':
    if num2 != 0: # Evitar divisão por zero
        resultado = num1 / num2
    else:
        resultado = "Erro: Divisão por zero."
else:
    resultado = "Operação inválida."

print(f"O resultado é: {resultado}")
```
