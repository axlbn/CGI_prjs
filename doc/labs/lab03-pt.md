# Aula Prática 3 - Interacção: Colocar, Deslocar e Aproximar

## Introdução

Até agora, todas as aplicações desenhavam algo decidido antecipadamente:
um triângulo, um quadrado, um padrão fixo. Nesta sessão, é o rato que
decide. Vai construir uma pequena aplicação de desenho, clicando para
colocar pontos e triângulos no canvas, e depois vai estendê-la para que
toda a vista possa ser deslocada e ampliada, mantendo as formas
exactamente onde as colocou.

Nada disto precisa de mais do que já sabe - buffers, atributos, varyings
- mas introduz algo que ainda não apareceu: converter a posição do rato,
dada em pixels a partir do canto do canvas, nas coordenadas de espaço de
recorte que o seu vertex shader entende. Acerte essa conversão uma vez e
tudo o resto nesta aula constrói-se directamente sobre ela.

## ex12 - Colocar pontos com o rato

Copie a pasta [ex01](../../src/labs/ex01/) para uma nova pasta my-ex12.
Remova o triângulo: vamos construir a cena a partir do nada.

Um clique do rato dentro do canvas dispara um evento `click`, e
`event.offsetX` / `event.offsetY` dão a posição do ponteiro, em pixels,
medida a partir do **canto superior esquerdo** do canvas. O seu vertex
shader, por outro lado, espera coordenadas de espaço de recorte: os dois
eixos a variar entre -1 e 1, com a origem no **centro** do canvas e o eixo
dos y a apontar para **cima**. Converter uma coisa na outra são dois
cálculos curtos:

```js
function to_clip_space(x, y) {
    return vec2(
        (x / canvas.width) * 2 - 1,
        1 - (y / canvas.height) * 2   // invertido: os pixels crescem para baixo, o espaço de recorte cresce para cima
    );
}
```

Mantenha um array de JavaScript comum com os pontos colocados até ao
momento. Sempre que o canvas receber um evento `click`, converta as
coordenadas do evento e acrescente o resultado a esse array:

```js
const points = [];

canvas.addEventListener("click", (event) => {
    points.push(to_clip_space(event.offsetX, event.offsetY));
    update_buffer();
});
```

`update_buffer()` deve fazer exactamente o que `setup()` já faz uma vez
para o triângulo fixo em [ex01](../../src/labs/ex01/): associar o buffer e
chamar `gl.bufferData()` com o array achatado. Não há problema em reenviar
o array inteiro a cada clique - são uns quantos pontos, acrescentados um a
um por uma pessoa, não milhares deles a cada frame.

Desenhe os pontos com `gl.drawArrays(gl.POINTS, 0, points.length)` em vez
de `gl.TRIANGLES`. Vai também precisar de definir a variável predefinida
`gl_PointSize` no vertex shader - experimente 8.0 - ou os seus pontos
terão um único pixel cada e serão difíceis de ver. Dê ao fragment shader
uma cor fixa por agora; todos os pontos com a mesma cor está bem aqui.

Clique algumas vezes no canvas e confirme que aparece um ponto exactamente
sob o ponteiro, sem desvio nem espelhamento - se isso acontecer, o
suspeito mais provável é uma inversão do eixo dos y em falta ou trocada em
`to_clip_space`.

## ex13 - Triângulos com cores interpoladas

Copie a sua solução do ex12 para uma nova pasta chamada my-ex13. Em vez de
confirmar um ponto a cada clique, acumule os cliques em grupos de três: os
dois primeiros cliques de um grupo são memorizados mas ainda não
desenhados, e o terceiro completa um triângulo, que é acrescentado à lista
de triângulos a desenhar, após o qual o clique seguinte inicia um novo
grupo.

Dê a cada um dos três vértices de um triângulo a sua própria cor, escolhida
aleatoriamente no momento em que o vértice é colocado:

```js
function random_color() {
    return vec3(Math.random(), Math.random(), Math.random());
}
```

Passe a posição e a cor como dois atributos, tal como fez no
[ex09](../../src/labs/ex09/), e declare um varying no vertex shader para
que o fragment shader receba uma cor interpolada ao longo do triângulo,
exactamente como nesse exercício - só que agora os três vértices chegam um
clique de rato de cada vez, em vez de todos de uma vez a partir de um
array fixo.

Coloque dois ou três triângulos e confirme que cada um mostra um
gradiente suave entre as suas três cores dos cantos, e que iniciar um novo
triângulo não perturba os que já estão desenhados.

## ex14 - Deslocar a vista

Copie a sua solução do ex13 para uma nova pasta chamada my-ex14. Queremos
que arrastar o rato sobre canvas vazio desloque toda a vista - todos os
triângulos desenhados até ao momento - sem acrescentar um novo vértice no
sítio onde o arrasto começou.

**Um sistema de coordenadas próprio.** Até agora, `to_clip_space()`
produzia valores que iam directamente para `a_position` e directamente
para `gl_Position` - as posições que guardava *eram* coordenadas de espaço
de recorte, porque nada separava "onde está um vértice" de "onde está
actualmente desenhado". Deslocar a vista é exactamente o que separa essas
duas coisas: um vértice colocado antes de um arrasto tem de manter a mesma
posição guardada e ainda assim acabar noutro sítio no écran. A partir
daqui, `a_position` guarda **coordenadas do mundo** - uma unidade à sua
escolha, fixa durante toda a vida da aplicação e sem relação nem com
pixels nem com o espaço de recorte - e a tarefa do vertex shader cresce
mais um passo: converter coordenadas do mundo em espaço de recorte,
usando a vista actual.

Escolha uma constante `WORLD_HALF_WIDTH` - 10.0 é uma escolha razoável -
indicando quanto do mundo é visível ao longo do canvas quando a vista não
está nem deslocada nem ampliada. Renomeie `to_clip_space()` para
`to_world()`: continua a começar pelo mesmo cálculo de pixels para
`[-1,1]` de antes, mas agora multiplica isso por `WORLD_HALF_WIDTH` (e,
assim que existir um deslocamento de vista, soma-o) para chegar a
unidades do mundo em vez de unidades de recorte. O vertex shader faz o
inverso: dado `u_center` (a posição da vista, em unidades do mundo) e
`u_world_half_width`, calcula

```c
gl_Position = vec4((a_position.xy - u_center) / u_world_half_width, 0.0, 1.0);
```

**Distinguir um clique de um arrasto.** Um `mousedown` no canvas já não
pode confirmar imediatamente "acrescentar um vértice aqui": pode ser o
início de um arrasto. A forma habitual de distinguir os dois é esperar
para ver o que acontece a seguir, decidindo só quando o botão do rato
volta a subir - avançando apenas quando o ponteiro tiver percorrido mais
do que uma pequena tolerância, digamos 4 pixels, desde o ponto onde o
botão foi premido.

Há aqui uma armadilha que vale a pena conhecer antecipadamente. Se
deslocar a vista apenas pelo pequeno passo de cada evento mousemove depois
de a tolerância ser ultrapassada, os primeiros pixels do arrasto - os
gastos a decidir se *era* um arrasto - nunca chegam a ser aplicados, e
todo o arrasto fica sempre um pouco aquém do rato. A correcção é lembrar
não só onde o arrasto começou, mas qual foi o último ponto processado: o
primeiro deslocamento que aplicar, no momento em que a tolerância é
ultrapassada, deve cobrir toda a distância desde o `mousedown` original,
não apenas o último passo minúsculo. Depois disso, os passos normais de
cada evento já bastam, porque não há mais nada por recuperar.

`pan()` não deve tocar nas coordenadas já guardadas para nenhum vértice -
só `u_center` muda. Converta a distância em pixels arrastada para
unidades do mundo antes de a somar a `center`: um pixel do écran vale
`(2 * WORLD_HALF_WIDTH) / canvas.width` unidades do mundo, à ampliação
por omissão. (O ex15 vai precisar que este factor dependa também da
ampliação actual, por isso mantenha-o como uma grandeza com nome próprio
em vez de o embutir directamente na conta.)

Verifique duas coisas quando terminar: um triângulo desenhado antes de
começar a deslocar a vista acaba exactamente na posição para onde o
arrastou, seja qual for a direcção e o número de pixels que moveu o rato -
um arrasto lento e cuidadoso e um rápido e irregular, cobrindo a mesma
distância total, devem deixá-lo no mesmo sítio - e clicar (sem arrastar)
continua a colocar um novo vértice exactamente sob o ponteiro, em
coordenadas do mundo, tendo em conta o deslocamento actual.

## ex15 - Ampliar a vista

Copie a sua solução do ex14 para uma nova pasta chamada my-ex15.
Acrescente uma variável `scale` e um uniform `u_scale` correspondente, e
altere `scale` em resposta à roda do rato:

```js
let scale = 1.0;

window.addEventListener("wheel", (event) => {
    scale = Math.min(4.0, Math.max(0.2, scale * (1 + event.deltaY / 1000)));
});
```

O limite evita que a vista cresça tanto que tudo desapareça fora do écran,
ou encolha até desaparecer. `scale` multiplica quanto do mundo está
visível: a conversão do vertex shader do ex14 ganha um factor,

```c
gl_Position = vec4((a_position.xy - u_center) / (u_scale * u_world_half_width), 0.0, 1.0);
```

e `to_world()` precisa do mesmo factor, pela mesma razão de sempre: um
clique, depois de ampliar, deve continuar a cair exactamente sob o
ponteiro, em coordenadas do mundo - não onde quer que o cálculo simples de
pixels para `[-1,1]` o colocasse antes de ter em conta a ampliação.

Há um segundo sítio onde `scale` tem de aparecer, fácil de esquecer porque
nada parecerá obviamente errado se o saltar: `pan()`. Seja qual for a
ampliação da vista, arrastar deve continuar a parecer igual - o ponto sob
o ponteiro no início de um arrasto deve continuar sob ele no fim. Afastado,
um pixel do écran corresponde a *mais* distância do mundo do que à
ampliação por omissão; aproximado, a menos. A grandeza "unidades do mundo
por pixel do écran" do ex14 precisa de ser multiplicada por `scale` para
se manter correcta em qualquer nível de ampliação, não apenas naquele em
que a testou.

## ex16 - Modos de desenho

Copie a sua solução do ex15 para uma nova pasta chamada my-ex16. Até
agora, um clique significa sempre um vértice de um triângulo. Generalize
isso: um modo, escolhido pelas teclas **'1'**, **'2'** e **'3'** e que se
mantém em vigor até o utilizador premir outra das três, decide quantos
vértices compõem uma forma e com que primitiva é desenhada:

| Modo | Tecla | Vértices por forma | Primitiva |
|---|---|---|---|
| Pontos | `1` | 1 | `gl.POINTS` |
| Segmentos de recta | `2` | 2 | `gl.LINES` |
| Triângulos | `3` | 3 | `gl.TRIANGLES` |

A lógica de acumular-até-ter-vértices-suficientes do ex13 quase não muda -
só precisa de perguntar ao modo actual quantos vértices uma forma precisa,
em vez de assumir sempre três. Dê aos segmentos de recta, tal como aos
triângulos, uma cor aleatória em cada extremidade e deixe-a interpolar ao
longo do segmento.

O deslocamento e a ampliação têm de continuar a funcionar, sem alterações,
em qualquer modo. Mudar de modo a meio de um arrasto, ou com uma forma por
completar a meio de ser clicada, não é algo que precise de tratar com
elegância - terminar ou descartar a forma pendente antes de mudar de modo
é uma simplificação razoável.

## Problemas para estudo autónomo

Os problemas seguintes são facultativos e não são resolvidos durante a
aula. Constroem-se directamente sobre o ex16.

### prob09 - Rectângulos em elástico

Acrescente um quarto modo que desenha rectângulos alinhados com os eixos:
prima e arraste de um canto para o canto oposto, com o rectângulo a
actualizar-se ao vivo, do canto até à posição actual do ponteiro, enquanto
o botão do rato está premido, e confirmado ao soltar.

### prob10 - Desfazer

Uma tecla remove a forma completada mais recentemente, seja qual for o
modo em que foi desenhada. Manter as formas numa única lista ordenada,
identificadas com o modo que as produziu, basta para tornar isto um
acrescento pequeno.

### prob11 - Mover uma forma

Deixe o utilizador arrastar uma forma existente clicando em qualquer ponto
dentro dela - dentro da sua caixa envolvente é uma aproximação razoável
para linhas e pontos, e não precisa de ser exacta para triângulos também -
movendo todos os seus vértices em conjunto, mantendo fixas as suas
posições relativas e cores.

### prob12 - Polígonos em aberto

Deixe um clique acrescentar um vértice a um polígono que permanece aberto
- desenhado como um leque a partir do seu primeiro vértice - até uma tecla
escolhida o fechar, momento em que é confirmado com o leque preenchido e
as cores dos seus vértices interpoladas ao longo dele, e um novo polígono,
vazio, fica pronto para começar.
