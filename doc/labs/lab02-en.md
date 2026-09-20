# Practical Lesson 2 - Uniform, Varying, Buffer layouts

## Uniforms

In [Session 01](../../doc/labs/lab01-en.md), to solve [ex05](../../src/labs/ex05), we pointed out the need to use two fragment shaders to paint both the interior and the border of a triangle with different colors. Because of this, it became necessary to use two GLSL programs, and the code became more verbose and complicated. Ideally, we would be able to send the color we want to paint the polygon with to the GLSL program from our JavaScript application. Fortunately, this is possible...

In our shaders, we can define data entries with the qualifier `uniform`, representing values that are constant during the execution of a primitive drawing request ([drawArrays()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays) or [drawElements()] (https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawElements)). These variables, unlike attributes (declared with the qualifier ```in```), which are only available in vertex shaders, are available in both shaders and represent the same entity in both shaders of a GLSL program. For example, a vertex shader that declares a variable of type uniform will only be compatible with a fragment shader that declares it in exactly the same way or omits it (because it does not need to access its value).

Provided that the GLSL program is not changed, the JavaScript application can assign values to these uniform variables at point A in the code, which will remain in effect until they are changed at another point B in the same script. Between these two locations in the application, all shader executions triggered by the drawing of primitives will use the current values assigned by the program at point A.

From the shaders' point of view, these variables behave as if they were constants defined externally by the application.

## ex07 - Using parameters in shaders

Take the contents of the [ex01](/src/labs/ex01) folder and copy them to a new folder named [my-ex07](../../src/labs/my-ex07). Modify the code so that the fragment shader accepts a ```uniform vec4``` variable named ```u_color```:

```c
uniform vec4 u_color;
```

Don't forget that the shader should make good use of this value it now receives...

The changes to the application code ([app.js](../../src/labs/my-ex07)) are as follows:

- Obtain the location of the uniform variable using the [getUniformLocation()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getUniformLocation) function
- Adapting the ```animate()``` function to paint the interior of the triangle and draw its border, using two separate calls to the [drawArrays()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/drawArrays) function
- Use the [uniform4fv()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform) function to send the color that the fragment shader will use to the GLSL program.

## ex08 - Animating the triangle

Let's take [ex01](../../src/labs/ex01/) again and animate the triangle, making it move horizontally around its initial position. Start by copying the code from ex01 to a new folder named [my-ex08](../../src/labs/my-ex08).

The idea is for the JavaScript program to modify a numeric variable that contains the horizontal displacement to be applied to the triangle. Since the displacement will be applied to the coordinates of each vertex, we will need to modify our vertex shader, including a `uniform` variable in it:

```js
uniform float u_dx;
in vec4 a_position;

void main()
{
    gl_Position = a_position + vec4(u_dx, 0.0, 0.0, 0.0);
}
```

The code above applies the displacement to the value of the attribute `a_position` when assigning the output variable `gl_Position`.

Now we need to declare a variable in the app.js script that changes its value each time it passes through the animate() function, and pass that variable to the GLSL program before drawing.

## Varyings

In addition to the qualifiers ```in``` and ```uniform```, there are two more:

- ```const``` - to declare, locally to the shader, a constant defined there
- ```out``` - to declare outputs from the vertex shader or fragment shader.
  
In most cases, there will only be one variable declared with ```out``` in the fragment shader, which will represent the color with which the pixel will be painted. But the story is completely different when it comes to the vertex shader and the variables declared there with ```out```.

To make the usefulness of variables declared as out in the vertex shader clear, let's imagine that we want to paint a triangle with a color that results from a gradual transition from the colors assigned to each of its vertices—the closer a point is to a vertex, the closer to the color of that vertex that point will be painted:

![Triangle with color gradient](./assets/lab02/shaded_triangle.jpeg)

We can now associate two attributes with each vertex of the triangle: position (```a_position```), and color (```a_color```). The vertex shader will affect the output variable ```gl_Position``` with an expression that depends on the value of the position attribute. Regarding the color attribute, in order for it to be interpolated during the discretization of the triangle, we will have to declare an additional output from our vertex shader, using the modifier ```out```. This output will correspond to a variable of type ```vec4```, to store the R, G, B, and Alpha (opacity) components. We will follow the convention of referring to these variables as *varyings*, using the prefix `v_` to name them. In this case, it would be declared as follows in the vertex shader:

```c
out vec4 v_color;
```

And as follows in the fragment shader:

```c
in vec4 v_color;
```

This pairing is very important and tells us that the values that a vertex shader assigns to a variable declared as ```out``` in its code will be interpolated within the primitive, for example within a triangle or along a line, and those values will appear in the fragment shader as input (```in```).

In this example, the fragment shader should assign to its output variable color the value that entered that varying.

**Note**: In version 1 of WebGL, varying variables (vertex shader outputs / fragment shader inputs) were declared with the modifier varying, instead of in / out.

## ex09 - 1 buffer for each attribute

Create a new folder [my-ex09](../../src/labs/my-ex09). You can use the code from [ex01](../../src/labs/ex01/) to get started. Use 1 buffer to store the vertex coordinates:

| Coordinates |
| ----------- |
| $x_0$       |
| $y_0$       |
| $x_1$       |
| $y_1$       |
| ...         |
| $x_n$       |
| $y_n$       |

and one buffer to store the colors of those same vertices:

| Colors |
| ------ |
| $r_0$  |
| $g_0$  |
| $b_0$  |
| $r_1$  |
| $g_1$  |
| $b_1$  |
| ...    |
| $r_n$  |
| $g_n$  |
| $b_n$  |

in order to draw the triangle shown.

## ex10 - 1 shared buffer for both attributes

Copy the folder with your solution from [ex09](../../src/labs/my-ex09) to two new folders  [my-ex10a](../../src/labs/my-ex10a) and [my-ex10b](../../src/labs/my-ex10b).

Adapt the code to use only one buffer. Try two different approaches:

- [my-ex10a](../../src/labs/my-ex10a) - First saving the data related to the coordinates of all vertices in the buffer, followed by the data related to the colors of those same vertices $(x1, y1, x2, y2, x3, y3, r1, g1, b1, r2, g2, b2, r3, g3, b3)$ 
- [my-ex10b](../../src/labs/my-ex10b) - Storing the information for each vertex in contiguous memory locations in the buffer, alternating the position information with the color information for each vertex $(x1, y1, r1, g1, b1, x2, y2, r2, g2, b2, x3, y3, r3, g3, b3)$

As an exercise, try variants where the position of the vertices in the JavaScript program consists of 2D points $(x,y)$ vs. 3D points $(x,y,0)$. Do the same for color, but now with 3D (RGB) and 4D (RGBA) coordinates. Coordinate A represents the opacity of the color, where a value of 1 means the color is completely opaque and 0 means it is completely transparent, and therefore invisible.

## ex11 - Morphing

Create a new folder [my-ex11](../../src/labs/my-ex11). Write a program that morphs one polygon into another with the same number of vertices. 

**Help**: you need to associate two positions with each vertex: the initial and final positions, and mix them in the shader with the [mix()](https://thebookofshaders.com/glossary/?search=mix) function.



## Challenges for autonomous study

The problems below are optional and are not solved during the session. They rely
only on material from this lesson and the previous one, and they remain strictly
two-dimensional: no matrices, no projections, no depth.

Work on a copy, as usual. Create one folder per problem, named `my-prob05`,
`my-prob06` and so on. The numbering continues from the problems of Session 01.

What changes here is that you can finally send values from the application to
the shaders while the program is running, and let the rasteriser interpolate
values between vertices. Both of these open up far more than the exercises had
room to show.

### prob05 - A shader playground

In `prob04` of Session 01 you covered the canvas with two triangles and painted
a checkerboard from `gl_FragCoord`, with the size of the canvas written into the
shader as a constant. Start from that program and replace the constant with a
`uniform vec2 u_resolution`, set from the application with
[uniform2f()](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform).

Then add a `uniform float u_time`, holding the number of seconds since the
program started, and use it to move the pattern.

Once `u_resolution` is there, compute normalised coordinates as
`gl_FragCoord.xy / u_resolution`, which run from 0 to 1 across the canvas
whatever its size. Multiplying the horizontal one by
`u_resolution.x / u_resolution.y` compensates for a canvas that is not square:
this is the correction that `prob01` asked you to find.

**Help:** `performance.now()` returns milliseconds. Almost everything on
[The Book of Shaders](https://thebookofshaders.com/) is written for exactly this
arrangement of a full-canvas rectangle with `u_resolution` and `u_time`, so it
becomes readable to you from here on.

### prob06 - Where interpolation shows its seams

Draw a square out of two triangles, as in `ex04`, and give each of its four
corners a different colour, passing the colour as a second attribute and
interpolating it with a varying, as in [ex09](../../src/labs/ex09).

Look carefully at the diagonal where the two triangles meet. The colours are
continuous across it, but the way they change is not. Explain why: what exactly
is the rasteriser interpolating, and over what?

Now fix it. Instead of interpolating the colour itself, pass a varying
`vec2 v_uv` that runs from 0 to 1 across the square, and compute the colour in
the fragment shader from the four corner colours with three calls to
[mix()](https://thebookofshaders.com/glossary/?search=mix): two to mix along one
edge and along the opposite one, and a third to mix between those two results.
Compare the two images.

**Help:** the varying for the corner coordinates is just another attribute in a
buffer, holding `(0,0)`, `(0,1)`, `(1,0)` and `(1,1)`. Their order has to match
the order of the vertices, since the value paired with each vertex is the corner
of the square that vertex occupies.

### prob07 - Morphing, improved

Start from your solution to `ex11` and extend it in three steps.

First, morph the colour as well as the shape: give each vertex an initial and a
final colour and mix them with the same factor used for the positions.

Second, make the movement continuous, going from one shape to the other and back
again, instead of stopping when it arrives.

Third, replace the factor by
[smoothstep()](https://thebookofshaders.com/glossary/?search=smoothstep) applied
to it, and describe the difference in how the movement feels.

**Help:** for the return journey, `abs(fract(t * 0.5) * 2.0 - 1.0)` turns a value
that grows without limit into one that travels between 0 and 1 and back.

### prob08 - Drawing with the mouse

Take the full-canvas rectangle of `prob05` and add a `uniform vec2 u_mouse`,
holding the position of the pointer over the canvas in pixels.

In the fragment shader, paint a disc centred on that position, computing its
outline from the distance between the fragment and the mouse. Give the edge a
soft transition with `smoothstep()` rather than a hard cut, and make the colour
of the disc depend on the distance to its centre. Finally, make the radius pulse
with `u_time`.

**Help:** listen to the `mousemove` event on the canvas and convert the position
of the pointer to canvas pixels with
[getBoundingClientRect()](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
Be careful with the vertical axis: it grows downwards in mouse events and
upwards in `gl_FragCoord`, so one of the two has to be inverted.
