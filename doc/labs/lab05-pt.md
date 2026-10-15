# Aula Prática 5 - Instanciação de Primitivas

## Introdução

Nesta sessão vamos desenvolver uma pequena aplicação que permite visualizar uma cena definida por instanciação de objetos primitivos, aos quais estará associada uma transformação de instanciação própria.

O utilizador pode adicionar à cena, cuja estrutura é linear (uma lista simples de objetos) um objecto escolhido de entre um conjunto de objetos primitivos disponíveis.

O esqueleto da aplicação é fornecido e pode ser obtido no [repositório](https://gitlab.com/CGI-Code/cgi-26-27) que temos vindo a utilizar.

Se reparar, quando a aplicação é lançada apenas visualizamos um cubo, o qual não sofre qualquer alteração pois a interface da aplicação não está, de momento, a fazer nada de útil.

Leia o código da aplicação [app.js](../../src/labs/ex17-step0/app.js) e identifique o local onde o objeto é desenhado. Vai reparar que a função usada para desenhar o objeto primitivo faz parte dum dos módulos javascript fornecidos com o exemplo. Dê uma vista de olhos no ficheiro [libs/objects/cube.js](../../src/libs/objects/cube.js) e [libs/objects/sphere.js](../../src/libs/objects/sphere.js). Repare nas funções que são exportadas pelos módulos, o que elas fazem, e onde estão a ser invocadas no script [app.js](../../src/labs/ex17-step0/app.js).

O lado direito da interface está organizado da seguinte forma:

- Topo: uma lista que conterá o nome de cada um dos objetos que constituem a cena visualizada no lado esquerdo da janela
- Uma secção, com botões, onde se podem acrescentar novos objetos primitivos ou apagar um objeto da cena
- Uma caixa "Solid", que alterna entre desenhar os objetos em arame e desenhá-los preenchidos
- Uma secção onde se mostram as propriedades do objeto selecionado (activo)

No modo preenchido, como ainda não há iluminação, cada fragmento é colorido pelo seu vector normal, convertido de [-1, 1] para [0, 1], de modo a distinguir as faces de um objeto. Para que os objetos preenchidos escondam o que está atrás deles, a aplicação já activa o buffer de profundidade (Z-buffer): `gl.enable(gl.DEPTH_TEST)` em `setup()`, e `gl.DEPTH_BUFFER_BIT` no `gl.clear()` de cada frame. Este guarda, para cada pixel, apenas o fragmento mais próximo da câmara. A visibilidade será estudada em detalhe mais tarde; por agora, basta manter estas duas linhas em todos os exercícios.

![interface](./assets/lab05/primitive_instancing_0.png)

## ex17 - Adicionar objectos à cena

Modifique a aplicação dada de modo a podermos acrescentar um cubo ou uma esfera à lista de objetos em cena premindo o botão apropriado. O nome do objeto a colocar na lista pode ser gerado automaticamente, mas convém ser distinto para cada instância. Consulte a documentação dos objetos do tipo HTMLSelectElement, com especial atenção ao método add().

Para tal terá que realizar as seguintes alterações:

- Programe os event handlers dos botões "Add Cube" e "Add Sphere". Em cada um destes botões deverá registar na sua aplicação (usando um ou mais vetores) que possui mais uma instância dum objeto primitivo. Para já bastará registar qual das primitivas foi criada, mas mais tarde isto terá que ser alterado.
- Modifique a função que redesenha o canvas para percorrer a informação que se encontra armazenada no vetor das instâncias e desenhe o objeto correspondente. Repare que para desenhar um objeto, o vertex shader fornecido espera que lhe seja fornecida uma matriz de 4x4 (u_ctm) que representa a matriz de transformação corrente dessa instância. Esta matriz corresponde ao produto de 3 matrizes:

    `mProjection * mView * mModel`. 

    As duas primeiras matrizes já se encontram inicializadas e não necessita alterar os seus valores. A última matriz é a que corresponde à transformação de modelação da instância que está a ser desenhada. Para começar pode assumir que é, para já, a matriz identidade. No exercício seguinte isto irá ser modificado.

## ex18 - Edição da transformação do último objeto inserido

No exercício ex17 chegámos a um ponto onde podemos acrescentar cubos e esferas à nossa cena, mas apenas conseguimos distinguir no máximo 2 objetos - um cubo e uma esfera - mesmo que se tenham criados vários de cada tipo.

O que se passa é que os diversos cubos que possam ter sido criados não se conseguem distinguir uns dos outros, o mesmo sucedendo às várias esferas que possam ter sido criadas.

Para resolver este problema vamos associar a cada instância uma transformação geométrica de instanciação que nos permitirá escalar, orientar e posicionar os objetos em cena e assim distinguir as diversas instâncias.

Para já vamos apenas fazer com que a interface disponibilizada afete apenas a última instância criada. Assim, caso a cena esteja vazia, os respetivos elementos da interface deverão estar inactivos. Quando se adicionar uma instância, qualquer alteração nesses elementos da interface deverão produzir uma alteração na transformação mModel específica dessa instância, de modo a que, ao desenhar-se a cena, possamos ver o objecto com a respetiva transformação aplicada.

A matriz mModel da instância que está a ser manipulada corresponde à seguinte composição:

    mModel = T(px, py, pz) Rz(rz) Ry(ry) Rx(rx) S(sx, sy, sz)

Os valores dos parâmetros destas transformações são os presentes na interface.

Para resolver este exercício deverá:

- Programar os eventos "change" dos elementos da interface e atualizar a matriz mModel da última instância.
- Acrescentar ao vetor das instâncias a transformação mModel respectiva

## ex19 - Remoção de instâncias

Programe o evento do botão "Remove" que deverá remover a instância que se encontra selecionada na lista. Ao apagar essa instância, a anterior deverá passar a estar selecionada.

## ex20 - Edição da transformação de qualquer objeto da cena

Modifique a aplicação por forma a poder selecionar qualquer instância da lista e passar assim a poder editar a transformação de modelação dessa instância.

Para poder executar esta tarefa precisa num primeiro passo de recuperar os parâmetros que a colocar nas caixas da interface. Isto é impossível se apenas tiver guardado a matriz mModel de cada instância. Pense numa solução e implemente-a.

## ex21 - Ordem de aplicação das transformações
Experimente alterar a ordem de aplicação das transformações, testando as seguintes (por esta ordem de aplicação):

- 1º Rotações, 2º Escala, 3º Translação
- 1º Rotação, 2º Translação, 3º Escala
- 1º Translação, 2º Escala, 3º Rotações
- 1º Translação, 2º Rotações, 3º Escala

## ex22 - Primitivas adicionais

Acrescente as seguintes primitivas à sua aplicação:

- cilindro
- torus
- pirâmide

Não se esqueça de acrescentar os respetivos botões.



## Problemas para estudo autónomo

Os problemas seguintes são facultativos e não são resolvidos durante a aula.
Constroem-se sobre o ex20, a versão em que qualquer instância pode ser
seleccionada e editada, e mantêm a cena linear: nenhuma instância é ainda
colocada relativamente a outra.

Trabalhe numa cópia, como habitualmente. Crie uma pasta por problema, com os
nomes `my-prob13`, `my-prob14` e assim por diante. A numeração continua a dos
problemas da Aula 03.

### prob13 - Cor, destaque e duplicados

Dê a cada instância a sua própria cor, escolhida com um
[`<input type="color">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/color)
na secção de propriedades e passada ao fragment shader como um
`uniform vec4 u_color`. Desenhe a instância seleccionada com o brilho total e
todas as outras escurecidas, para que seja sempre claro qual delas a interface
está a editar.

Acrescente depois um botão "Duplicate" que cria uma nova instância da mesma
primitiva, com a mesma cor e os mesmos parâmetros de transformação da
seleccionada, mas ligeiramente deslocada segundo x, e a selecciona. Edite a
cópia e verifique que o original não se move com ela.

**Ajuda:** o valor do input de cor é uma string `"#rrggbb"`;
`parseInt(hex.slice(1, 3), 16) / 255` dá a componente vermelha em [0, 1]. Se
editar a cópia também alterar o original, veja o que é, de facto, o vector de
parâmetros da cópia.

### prob14 - Eixos locais

Desenhe os eixos do referencial próprio da instância seleccionada: três
segmentos unitários a partir da sua origem, segundo os seus x, y e z locais, a
vermelho, verde e azul, desenhados com a transformação da instância. Desenhe
também os eixos do mundo na origem, com cores mais escuras, para comparação.

Faça depois com que as teclas `a`/`d`, `w`/`s` e `q`/`e` desloquem a instância
seleccionada um pequeno passo segundo x, y e z, e que outra tecla alterne entre
deslocar segundo os eixos do mundo e segundo os eixos próprios da instância. Em
ambos os casos o resultado tem de aparecer nas caixas de posição da interface.

**Ajuda:** os eixos locais da instância, escritos em coordenadas do mundo, são
as imagens de (1,0,0), (0,1,0) e (0,0,1) pela sua rotação - ou seja, as colunas
da matriz de rotação. Ignore as teclas cujo alvo é um `<input>`, senão escrever
numa caixa numérica move o objecto; e lembre-se de que um `<select>` com o foco
salta para a opção que começa pela letra premida.

### prob15 - Rodar com o teclado

Faça com que seis teclas rodem a instância seleccionada alguns graus de cada vez
em torno de x, y e z, e que outra tecla escolha se esses são os eixos do mundo
ou os eixos próprios da instância (desenhe os seus eixos locais como no
`prob14`, para ver a diferença). Em ambos os casos o objecto roda em torno do
seu próprio centro, e não da origem do mundo.

As caixas de rotação da interface têm de continuar a mostrar a orientação
actual. Como a instância é descrita pelos ângulos `rx`, `ry`, `rz` de
`Rz(rz) Ry(ry) Rx(rx)`, após cada tecla é preciso encontrar os ângulos que
produzem a nova matriz de rotação.

1. Multiplique `Rz Ry Rx` e descubra que entradas do resultado dão `ry`, e quais
   dão `rx` e `rz` uma vez conhecido `ry`. Implemente essa decomposição.
2. Implemente as teclas como uma pequena rotação composta com a rotação actual
   da instância, seguida da decomposição. De que lado fica a pequena rotação
   para os eixos do mundo, e de que lado para os eixos locais? Porquê?
3. Na interface, ponha `ry` a 90 e altere `rx` e `rz`. O que acontece? O que faz
   aí a sua decomposição, e porque não pode fazer melhor?

**Ajuda:** use [Math.atan2()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2),
e não `Math.atan()`, para que todos os quadrantes saiam certos. Manter os
ângulos como único estado, e reconstruir a matriz a partir deles de cada vez,
evita também o lento desvio que produtos de matrizes repetidos acumulam.

### prob16 - Anéis e hélices

Acrescente um botão "Make ring" que preenche uma circunferência em torno do
eixo y do mundo com `n` cópias da instância seleccionada: a cópia `k` é o
original rodado `k * 360 / n` graus em torno desse eixo, de modo que as cópias
não ficam apenas dispostas ao longo da circunferência, mas também orientadas ao
longo dela, como ficaria um cubo num prato giratório.

Cada cópia tem de ser uma instância normal, editável pela interface como
qualquer outra, o que significa que a sua transformação tem de voltar a ser
expressa pelos nove parâmetros. Descubra quais são os seus parâmetros de
posição, rotação e escala.

Estenda-o depois com mais dois valores: uma subida por cópia, que eleva a cópia
`k` em `k` vezes esse valor, para transformar o anel numa hélice, e um factor
de escala por cópia, que escala a cópia `k` por esse factor elevado a `k` em
relação à origem, para o transformar numa espiral.

Por fim, pense em duas variantes, sem ter necessariamente de as implementar: o
que obtém se a rotação for composta do outro lado da transformação da
instância? E como centraria o anel num ponto que não a origem?

**Ajuda:** para qualquer transformação linear `A` (uma rotação ou uma escala),
`A T(p) = T(A p) A`. A parte de rotação de uma cópia é um produto de duas
matrizes de rotação, que o `prob15` já sabe converter de volta em ângulos.
