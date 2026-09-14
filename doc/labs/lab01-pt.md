# Aula prática 1 - Configuração do Ambiente de Desenvolvimento e exemplos introdutórios

Nas aulas de Computação Gráfica e Interfaces iremos usar a API WebGL para o desenvolvimento dos nossos programas e projetos. Embora as nossas aplicações, por serem executadas num browser, não necessitem de grande ajuda em termos de IDE - por exemplo não é necessário compilar os nossos programas - a utilização dum IDE tem outras vantagens.

O IDE escolhido é o Microsoft Visual Studio Code, o qual tem versões para MacOS, Windows e Linux. Este IDE é extensível, sendo possível instalar uma série de extensões atendendo às mais diversas necessidades. No nosso caso iremos, para já, necessitar das seguintes extensões:

- Live server - um servidor web com suporte para live reload de páginas estáticas e dinâmicas
- WebGL GLSL Editor - suporte para syntax highliting nos shaders
  
Para abrir o painel das extensões podemos fazer **CTRL**+**SHIFT**+**X** (Windows e Linux) ou  **CMD**+**Shift**+**X** (Mac), procurar a extensão digitando o seu nome e escolher a opção "Install".

**Hint**: Shortcuts do Visual Studio Code para [Mac](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-macos.pdf), [Linux](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-linux.pdf) e [Windows](https://code.visualstudio.com/shortcuts/keyboard-shortcuts-windows.pdf).

## Repositório para CGI

Durante o semestre iremos adoptar uma estrutura rígida para as nossas pastas. A estrutura adoptada está exemplificada de seguida:

```
.
├── doc
│   ├── labs
│   │   └── lab01.md
│   └── prjs
├── README.md
└── src
    ├── labs
    │   └── ex01
    │       ├── app.js
    │       ├── index.html
    │       └── shaders
    │           ├── shader.frag
    │           └── shader.vert
    ├── libs
    │   ├── dat.gui.min.js
    │   ├── dat.gui.module.js
    │   ├── dat.gui.module.js.map
    │   ├── MV.js
    │   ├── objects
    │   │   ├── ...
    │   │   └── ...
    │   ├── stack.js
    │   ├── three.module.js
    │   └── utils.js
    └── prjs
        ├── prj1
        └── prj2
```

Desta estrutura destaca-se o seguinte:

- Uma pasta [doc](../../doc/) onde estarão todos os guiões das aulas práticas e enunciados de projetos.
- Uma pasta [src](/src/) onde ficará todo o código fonte.

Dentro da pasta [src](../../src/) a estrutura é a seguinte: 
- Uma pasta [libs](../../src/libs/) onde ficam guardados os ficheiros correspondentes às bibliotecas usadas.
- Uma pasta [labs](../../src/labs/) para guardar as pastas com o código relacionado com os exercícios a resolver em aula prática.
- Uma pasta por exercício, tal como [ex01](../../src/labs/ex01/), dentro da pasta [labs](../../src/labs/), por cada exercício proposto. Esta pasta irá ter todos os ficheiros necessários para a resolução do respetivo exercício, excepto as bibliotecas referidas anteriormente. **O conteúdo destas pastas não deverá ser editado pelos alunos**, pois irá sendo atualizado no repositório pela equipa docente (por exemplo para disponibilizar as soluções).
- Uma pasta com a sua proposta de solução para um dadao exercício, tal como, por exemplo, [my-ex01](../../src/labs/my-ex01/) que deverá ser inicializada com uma cópia integral da pasta [ex01](../../src/labs/ex01/), caso exista no repositório, para iniciar a resolução do exercício. Será nesta pasta que cada aluno/grupo deverá escrever o seu código.
- Uma pasta [prjs](../../src/prjs/) para guardar as soluções dos projetos para avaliação.

Para cada exercício iremos ainda seguir a seguinte convenção para arrumarmos os ficheiros respetivos (ver [ex01](/src/labs/ex01/) acima):

- Um ficheiro [index.html](../../src/labs/ex01/index.html) com o código HTML correspondente à estrutura da nossa aplicação
Um ficheiro [app.js](../../src/labs/ex01/app.js) com o código principal da aplicação
- Uma pasta [shaders](../../src/labs/ex01/shaders/) para guardar todos os shaders usados pela aplicação (as extensões para estes shaders serão ```.vert``` e ```.frag``` para os vertex e fragment shaders, respectivamente.
- Caso existam mais ficheiros javascript necessários, que não os da biblioteca, estes poderão ficar ao mesmo nível do ficheiro principal, ou arrumados dentro duma pasta de nome ```js```.

## Testar o ambiente

Antes de prosseguirmos para os exercícios vamos testar se o ambiente de trabalho está bem configurado. Para tal, no Visual Studio Code, selecionar o ficheiro [labs/ex01/index.html](../../src/labs/ex01/index.html) e, com o botão direito do rato, escolher a opção **Open With Live Server**.

Se tudo estiver ok irá aparecer uma página no seu browser com o seguinte aspeto:

![Conteúdo mostrado pelo primeiro exemplo](./assets/lab01/image-01.png)


Se não tiver obtido este resultado reveja os passos anteriores. O erro mais frequente é a pasta que foi aberta no Visual Studio Code não ter acesso a todos os ficheiros, sendo apenas a pasta relativa ao exemplo que está a tentar executar.

Se tudo estiver ok, então repita o processo para o ficheiro [labs/ex02/index.html](../../src/labs/ex02/index.html). 

O resultado será exatamente o mesmo, embora a aplicação seja completamente diferente. Contraste o conteúdo dos ficheiros ```app.js``` de cada um dos exemplos. No primeiro caso estamos a usar diretamente a API WebGL (de mais baixo nível), enquanto no segundo estamos a usar uma API de mais alto nível - o [threejs](https://threejs.org).

## Estrutura da página da aplicação

Nesta secção vamos analisar a estrutura da página da nossa aplicação de exemplo. O ficheiro com a estrutura da página tem o nome [index.html](/src/labs/ex01/index.html) e está colocado na raíz da pasta [ex01](/src/labs/ex01/).

O conteúdo desse ficheiro é bastante simples, consistindo numa página que carrega o script ([app.js](../../src/labs/ex01/app.js)) com o código principal da nossa aplicação, através da utilização do elemento ```<script>``` bem como um elemento do tipo ```<canvas>```, o qual é usado para criar uma área na página onde poderemos desenhar o nosso triângulo em WebGL. Ei-lo:

```html
<!DOCTYPE html>
<html>
    <head>
        <title>Exemplo 01</title>
    </head>
    <body>
        <script type="module" src="./app.js"></script>
        <canvas id="gl-canvas" width="512" height="512"></canvas>
    </body>    
</html>
```

De notar que o elemento ```<canvas>``` tem as dimensões especificadas usando os atributos ```width``` e ```height``` e possui, ainda, um atributo identificador (```id```) que serve para lhe conseguirmos aceder de forma fácil a partir do nosso código javascript.

## Código principal da aplicação

### Esqueleto

O conteúdo do ficheiro [app.js](../../src/labs/ex01/app.js) é bastante mais elaborado. O esqueleto do nosso programa é o seguinte:

```js
// import required libraries and additional scripts
// ...

// Global variables declaration
// ...

function setup(...)
{
    // Setup
    
    // Get the canvas object and create the webgl context

    // Build a GLSL program (vertex + fragment shader)

    // Create required data buffers and send them to the GPU

    // Setup the viewport

    // Setup the background color
    
    // Call animate for the first time
    window.requestAnimationFrame(animate);
}

function animate()
{
    // Ask browser to call animate again on next refresh cycle
    window.requestAnimationFrame(animate);

    // Drawing code
}

// load the shader sources and pass them to the setup function
// Code execution starts here...
setup()
```

Se repararmos no código acima, o ponto de entrada do programa está na última linha, fora de todas as funções declaradas. Por opção nossa, a função ```setup()``` necessitará que lhe seja entregue o código fonte de todos os shaders usados pelo programa. Por isso, o primeiro passo será carregar esses mesmos shaders.

### Carregamento dos shaders

Relativamente ao carregamento dos shaders, na biblioteca [utils.js](../../src/libs/utils.js) podemos encontrar duas funções que nos vão ajudar:

- ```loadShadersFromURLS()``` - Carrega os shaders **assincronamente**, a partir dos seus URLs. Esta função recebe como argumento um array de strings, com o nome de cada shader, e um prefixo que será a parte inicial do URL, comum aos diferentes shaders. Por omissão, o prefixo vale "shaders".
- ```loadShadersFromScripts()``` - Carrega os shaders **sincronamente**, a partir dos ids dos scripts respectivos, embebidos no ficheiro html.
Neste exemplo vamos carregar os shaders assincronamente e aguardar que estejam todos carregados antes de deixarmos o programa prosseguir para dentro a função setup(). A linha final é então:

```js
loadShadersFromURLS(["shader.vert", "shader.frag"])
   .then(shaders => setup(shaders));
```

Repare-se que se omitiu o prefixo, e portanto teremos que arrumar os dois shaders dentro duma pasta de nome [shaders](../../src/labs/ex01/shaders/). A função ```loadShadersFromURLS()``` retorna de imediato, embora não o resultado que pretendemos (o código fonte dos shaders). A utilização de ```.then(result => ...)``` permite aguardar pelo fim das tarefas assíncronas que são executadas dentro daquela função e usar depois o resultado. Neste caso, o resultado foi denominado de ```shaders``` e usado para se chamar a função ```setup()```.

O resultado da função ```loadShadersFromURLS()``` é um objeto que funciona como um dicionário, traduzindo o nome dum shader (uma string) no seu respetivo código fonte (outra string).

### Criação do contexto WebGL e dos programas GLSL
Vejamos agora o que vai dentro da função``` setup()```. Em primeiro lugar temos que obter uma referência para o objeto ```<canvas>``` do nosso documento.

```js
// Global variables declaration

/** @type {WebGL2RenderingContext} */
var gl;
/** @type {WebGLProgram} */
var program;
/** @type {WebGLVertexArrayObject} */
var vao;


function setup(shaders)
{
    // ...
    
    // Get the canvas object and create the webgl context
    const canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);
    
    // ...
}
```
O processo consiste em pedir ao objeto global document para devolver uma referência para o objecto que possui um determinado identificador - neste caso ```gl-canvas```. De seguida usamos a função ```setupWebGL()```, da biblioteca [utils.js](../../src/libs/utils.js) que trata da criação dum contexto WebGL, ficando este associado ao canvas. O contexto WebGL não é mais do que um objeto que nos permite aceder à API do WebGL.

Neste momento já podemos então chamar funções da API do WebGL e vamos tratar de compilar os shaders para formarmos um programa GLSL que se poderá vir a usar em tarefas de desenho de elementos gráficos (primitivas gráficas) no canvas. Usaremos para a formação do programa GLSL a função ```buildProgramFromSources()```, da biblioteca [utils.js](../../src/libs/utils.js):
```js
    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);
```
A função recebe 3 argumentos:

- o contexto WebGL
- uma string com o código fonte do vertex shader
- uma string com o código fonte do fragment shader

Note-se que obtemos o código fonte de cada shader usando o dicionário que é passado como argumento da função ```setup()```. Aconselha-se a leitura do código fonte da função ```buildProgramFromSources()``` para se perceberem as chamadas da API que lá são feitas. Falta ainda acrescentar as necessárias declarações para importarmos as funções usadas da biblioteca [utils.js](../../src/libs/utils.js):

```js
import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from "../../libs/utils.js";
```

### Passar a geometria para o GPU
Para podermos desenhar primitivas usando o GPU temos que executar os seguintes passos:

- Criar buffers que irão conter os atributos associados a cada vértice
- Preencher os buffers com os dados de cada vértice
- Enviar os buffers com os dados para o GPU
- Ensinar o GPU a consumir os dados presentes nos buffers, associando-os aos atributos do vertex shader usado pelo programa GLSL que vai ser usado.
  
O nosso objetivo é desenhar apenas um triângulo simples, de cor vermelha. Assim, os únicos dados que variam de vértice para vértice serão as suas coordenadas. Declaremos então uma variável local que contém os vértices do nosso triângulo:

```js
    const vertices = [ vec2(-0.5, -0.5), vec2(0.5, -0.5), vec2(0, 0.5) ];
```

Neste caso trata-se dum array de arrays a duas dimensões. O tipo ```vec2``` está declarado na biblioteca [MV.js](../../src/libs/MV.js), mas trataremos da sua importação mais tarde. As seguintes linhas de código criam um buffer, preenchem-no com as coordenadas dos vértices e enviam-no para o GPU:

```js
const aBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
```

A linha 3, acima é a chamada que preenche efectivamente o buffer, ficando este com a dimensão dos dados que lá são colocados. Repare-se que na criação do buffer, na linha 1, nada é dito relativamente à sua dimensão. A chamada da função [bufferData()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferData) também tem a particularidade de não indicar, nos seus argumentos, que buffer será preenchido. Imagine-se um programa que entretanto tenha criado vários buffers, como será que a API sabe em que buffer deverão ser colocados os dados? 

É precisamente para isso que lá está a linha 2. Nessa linha, o buffer criado na linha 1 fica ativo para operações cujo alvo (target) seja um buffer do tipo (```ARRAY_BUFFER```). Esse mesmo alvo é indicado na linha 3, no primeiro argumento da chamada. O nosso array declarado atrás,  com as coordenadas dos 3 vértices do triângulo não pode ser passado diretamente, pois o 2º argumento da chamada de bufferData() necessitar ser um array do tipo ```Float32Array``` (um array javascript que usa números de vírgula flutuante nativos, em vez do tipo ```Number```, o tipo de dados do javascript para lidar com números). Felizmente a biblioteca [MV.js](../../src/libs/MV.js) disponibiliza a função ```flatten()``` que trata de arrumar o nosso array de arrays do tipo ```vec2()``` num array unidimensional com os dados convertidos para o formato nativo. 

O passo seguinte consiste, então, em ensinar o WebGL a interpretar os dados presentes no buffer:

```js
    // Create a vertex array object to tell the GPU how to fetch vertex
    // data from the buffers, and make it current
    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Get the attribute location for "a_position" attribute
    const a_position = gl.getAttribLocation(program, "a_position");

    // Describe layout of the attribute in the buffer
    // In this case, two floats tightly packed (no empty space between
    // consecutive vertices and no offset from the start of the buffer)
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    // Enable attribute fetching from the array
    gl.enableVertexAttribArray(a_position);

    // By now the vertex array has all the information to be used later
    // during rendering
    gl.bindVertexArray(null);
```


Os atributos de cada vértice são referidos por nome dentro do vertex shader. No entanto, cada atributo acaba por estar associado internamente a um índice único. Para explicarmos à API como se encontram organizados no buffer correntemente activo (aquele usado na operação [bindBufer()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bindBuffer)), precisamos primeiro saber qual o índice do atributo no programa GLSL, que é como quem diz no vertex shader (os atributos só dizem respeito ao vertex shader, pois são valores associados a vértices). A chamada da função [getattriblocation()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getAttribLocation), obtém o índice do atributo ```a_position``` referido no vertex shader que foi usado para criar o programa GLSL de nome program.

A chamada de [vertexAttribPointer()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer) permite explicar à API como interpretar o conteúdo do buffer, no que diz respeito a este atributo. Note-se que um buffer pode conter os valores dum conjunto arbitrário de atributos, desde que dispostos de forma regular. O primeiro argumento é o índice do atributo que queremos especificar. O segundo argumento diz respeito ao número de elementos de dados associados a esse atributo. Neste caso será 2, pois os nossos dados consistem em 2 elementos, do tipo float. O terceiro argumento indica então o tipo de cada elemento (FLOAT). O quarto argumento será sempre false. Por fim, o 5º e o 6º argumentos são, respetivamente o *stride* e o *offset*. O valor de *stride* indica o número de bytes que separam o primeiro byte do primeiro elemento do atributo para o vértice i, do 1º byte do primeiro elemento do mesmo atributo para o vértice i+1. O valor de *offset* indica o número de bytes que devemos saltar, desde o início do buffer, para chegarmos ao primeiro byte que contém o valor do atributo para o primeiro vértice. Isto permite podermos agrupar vários atributos dos nossos vértices num mesmo buffer por zonas, de forma entremeada (interleaved) ou partindo o buffer em zonas com diferentes arrumações.

Finalmente, ativamos o uso do referido atributo usando a função [enableVertexAttribArray()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/enableVertexAttribArray). Esta linha de código pode parecer estranha, mas há situações em que queremos desativar os atributos que constam do buffer e usar um valor igual para todos os vértices. Nesse caso, o atributo necessitará ser desativado com [disableVertexAttribArray()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/disableVertexAttribArray) e devermos usar uma das funções [vertexAttrib[1234]f[v]()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttrib) para especificar o valor por omissão que será atribuído a todos os vértices.

Todas estas operações ficam registadas num objeto vao do tipo [WebGLVertexArrayObject](https://developer.mozilla.org/en-US/docs/Web/API/WebGLVertexArrayObject). Daí as instruções iniciais que criam esse objecto e o tornam activo. No final desativa-se o vao.


### Especificação do visor e da cor do fundo
O visor (viewport) consiste numa área rectangular dentro do nosso canvas. Na chamada abaixo:

```js
gl.viewport(0, 0, canvas.width, canvas.height);
```

O visor terá o canto inferior esquerdo no ponto (0,0) e a sua largura e altura idênticas às do canvas, ocupando assim toda a sua área. O referencial aqui está situado no canto inferior esquerdo do canvas e as unidades são píxeis.

A cor do fundo, quando se limpa o framebuffer, é guardada numa variável de estado da API WebGL. Essa variável de estado é modificada com a chamada:

```js
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
```

Neste caso estamos a definir a cor R,G,B,A correspondente a preto, totalmente opaco.

### O ciclo de animação
Por fim, o ciclo de animação é executado com auxílio do browser. A chamada de [requestAnimationFrame()](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) informa o browser para invocar a função passada como argumento no próximo ciclo de refrescamento. Faz-se uma vez no final de setup() para desencadear a primeira chamada e depois, a cada passagem da função escolhida. No nosso caso a função chama-se animate(). Dentro desta função vamos finalmente desenhar o nosso triângulo, limpando primeiro o que quer que estivesse no framebuffer:

```js
function animate() {
    // Trigger another call for the next frame update
    window.requestAnimationFrame(animate);

    // Drawing code

    // Clear the framebuffer with the background color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use the WebGL program created before
    gl.useProgram(program);

    // Make the vertex array object active (records how to fetch vertex data
    // from buffer)
    gl.bindVertexArray(vao);
    // Draw triangles using 3 vertices (one triangle)
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // Deactivate the vertex array object since drawing is complete
    gl.bindVertexArray(null);
}
```

De início, limpa-se o framebuffer usando a função [clear()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/clear), depois coloca-se o nosso programa GLSL no pipeline, passando o GPU a executar os correspondentes vertex e fragment shaders quando enviamos pedidos de desenho de primitivas.

Antes de se desenharem as primitivas, activa-se o Vertex Array Object (vao) para que a API saiba em que buffers se encontram os atributos e como se encontram dispostos em memória. A função [drawArrays()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays) permite desenhar primitivas directamente, consumindo dados dos buffers. Em alternativa pode também usar-se a função [drawElements()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements), que usa uma indirecção mas que permite reutilizar os dados de vértices, usando índices para um array de vértices.

## Shaders

Para terminar, falta referir os nossos shaders, dentro da pasta shaders. O conteúdo do vertex shader shader.vert será:

```c
#version 300 es

in vec4 a_position;

void main() {
    gl_Position = a_position;
}
```

As variáveis declaradas com o qualificador ```in``` no vertex shader são atributos dos vértices. Neste caso apenas temos um atributo (```a_position```).

A variável pré-definida ```gl_Position``` representa as coordenadas finais do vértice após quaisquer transformações que o vertex shader tenha aplicado aos dados iniciais. Neste exemplo não há qualquer transformação a ser aplicada, sendo atribuído o valor do atributo (de entrada) que correspondia ao vértice. 

O fragment shader shader.frag tem este conteúdo:

```c
#version 300 es

precision mediump float;

out vec4 color;

void main() {
    color = vec4(1.0f, 0.0f, 0.0f, 1.0f);
}
```

A variável de saída do fragment shader pode ter um nome arbitrário, decidido pelo programador, e representa a cor final a atribuir ao pixel.

## ex03 - Mudar a cor do triângulo

Mude a cor do preenchimento do triângulo para verde, por exemplo e a cor do fundo para amarelo. Não se esqueça de fazer uma cópia da pasta [ex01](../../src/labs/ex01/) para uma nova pasta de nome my-ex03, de modo a não interferir com as pastas do repositório.

Dica: a solução não está em app.js...

## ex04 - Desenhar um quadrado

Volte a copiar o conteúdo da pasta [ex01](../../src/labs/ex01/) para uma nova pasta my-ex04. 

Altere a aplicação para que esta desenhe um quadrado. Como em WebGL não há primitivas do tipo quadrilátero (ou qualquer polígono que não seja um triângulo), deverá recorrer ao uso de dois triângulos.


## ex05 - Pintar o interior e o rebordo do triângulo

Volte a copiar o conteúdo da pasta ex01 para uma nova pasta my-ex05.

Altere a aplicação para que esta, para além de pintar o interior do triângulo, também desenhe o seu rebordo com outra cor.

Dica: Vai ter que usar dois fragment shaders diferentes para conseguir o efeito de duas cores distintas. Isto implica ter que criar dois programas GLSL. Tente partilhar o vertex shader entre os dois programas.

## ex06 - Desenhar milhares de triângulos

Copie o conteúdo da pasta ex01 para uma nova pasta my-ex06.

Desenhe 10.000 pequenos triângulos, dispostos aleatoriamente no canvas, usando apenas uma chamada da função [drawArrays()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays).

## Problemas para estudo autónomo

Os problemas seguintes são facultativos e não são resolvidos durante a aula.
Apoiam-se apenas na matéria desta sessão, pelo que nenhum deles necessita de
conteúdos das aulas seguintes, e são todos estritamente bidimensionais: sem
matrizes, sem projecções, sem profundidade.

Tal como nos exercícios, trabalhe sobre uma cópia. Crie uma pasta por problema,
com os nomes `my-prob01`, `my-prob02` e assim sucessivamente, partindo da pasta
[ex01](../../src/labs/ex01/) salvo indicação em contrário no enunciado.

Repare que, neste momento, não tem forma de enviar valores da aplicação para os
shaders enquanto o programa está a correr. Essa limitação é propositada. A
sessão 02 levanta-a e, em particular, o `prob03` existe para lhe dar vontade
disso.

### prob01 - Do quadrado à circunferência

No `ex04` construiu um quadrado a partir de dois triângulos. Construa agora um
polígono regular com um número arbitrário de lados.

Gere os vértices em JavaScript com um ciclo sobre o ângulo, colocando cada um
em `vec2(raio * cos(angulo), raio * sin(angulo))`, e desenhe-os com uma única
chamada da função [drawArrays()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays),
usando o modo `gl.TRIANGLE_FAN` em vez de `gl.TRIANGLES`. Experimente com 3, 5,
12 e 100 lados. A partir de que ponto o polígono deixa de parecer um polígono?

De seguida, abra o `index.html` e mude o canvas de 512 por 512 para 800 por 400
pixels. A sua circunferência passa a elipse. Registe porquê, em termos das
coordenadas que o vertex shader escreve em `gl_Position` e dos pixels que elas
acabam por cobrir: a sessão 02 dá-lhe o que falta para a corrigir.

**Dica:** um leque de triângulos espera o centro do polígono como primeiro
vértice, seguido dos vértices do contorno. Para fechar a figura, o primeiro
vértice do contorno tem de voltar a aparecer no fim.

### prob02 - Pontos redondos a partir de pontos quadrados

Em vez de triângulos, desenhe um pequeno conjunto de vértices com o modo
`gl.POINTS`. Cada vértice passa a ser rasterizado como um quadrado, cujo tamanho
em pixels escolhe atribuindo um valor à variável predefinida `gl_PointSize`, no
vertex shader.

Raramente é um quadrado o que queremos. Transforme-os em discos: dentro do
fragment shader, a variável predefinida
[gl_PointCoord](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Data)
indica-lhe onde se encontra o fragmento actual dentro do ponto que está a ser
desenhado, variando entre 0 e 1 em cada eixo. Meça a que distância essa posição
está do centro do ponto e, quando cair fora de um raio de 0.5, deite o fragmento
fora com a instrução `discard`.

**Dica:** o centro do ponto é `vec2(0.5, 0.5)` e a função
[distance()](https://thebookofshaders.com/glossary/?search=distance) dá-lhe
directamente a distância entre dois pontos.

Este é o primeiro fragment shader que escreve que faz algo diferente para cada
pixel, em vez de devolver uma cor constante.

### prob03 - Animação pelo caminho difícil

Faça o triângulo do [ex01](../../src/labs/ex01/) rodar lentamente em torno da
origem.

Ainda não dispõe de variáveis uniform, pelo que não é possível dizer aos shaders
quanto devem rodar. A rotação tem portanto de acontecer na aplicação: em cada
passagem pela função `animate()`, calcule em JavaScript as novas coordenadas dos
três vértices e volte a enviá-las para o buffer, usando a função
[bufferSubData()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/bufferSubData)
para substituir o conteúdo que lá colocou durante o `setup()`.

**Dica:** rodar um ponto de um ângulo *a* em torno da origem dá
`x' = x cos(a) - y sin(a)` e `y' = x sin(a) + y cos(a)`. Não são precisas
matrizes para isto.

Quando estiver a funcionar, responda a duas perguntas. Quantos bytes viajam da
aplicação para o GPU em cada frame? E o que aconteceria a esse número com os
10.000 triângulos do `ex06`?

Guarde esta solução. Na sessão 02 vai voltar a animar um triângulo, e a
comparação entre as duas abordagens é o objectivo do exercício.

### prob04 - O seu primeiro padrão procedimental

Até aqui foi a geometria que desenhou a figura. Desta vez, deixe a geometria
cobrir tudo e deixe o fragment shader decidir o que se vê.

Usando dois triângulos como no `ex04`, construa um rectângulo que cubra a
totalidade do canvas: os seus cantos estão em `(-1,-1)`, `(1,-1)`, `(1,1)` e
`(-1,1)`. Todos os pixels do canvas passam agora a executar o seu fragment
shader.

Nesse shader, a variável predefinida
[gl_FragCoord](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Data)
contém as coordenadas do pixel que está a ser pintado, medidas em pixels a
partir do canto inferior esquerdo do canvas. Use-a para pintar um tabuleiro de
xadrez com quadrados de 50 por 50 pixels. Depois altere o padrão para riscas
verticais e, por fim, para anéis concêntricos centrados no meio do canvas.

**Dica:** `mod(floor(gl_FragCoord.x / 50.0) + floor(gl_FragCoord.y / 50.0), 2.0)`
vale 0 num conjunto de quadrados e 1 no outro. As funções
[mod](https://thebookofshaders.com/glossary/?search=mod) e
[step](https://thebookofshaders.com/glossary/?search=step) estão descritas no
glossário do [The Book of Shaders](https://thebookofshaders.com/).

Um rectângulo a cobrir o canvas, com todo o trabalho feito no fragment shader, é
a forma habitual de escrever este tipo de programas. Vai voltar a ele na sessão
02.
