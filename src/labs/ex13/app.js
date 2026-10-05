import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from "../../libs/utils.js";
import { vec2, vec4, flatten } from "../../libs/MV.js";

/** @type {WebGL2RenderingContext} */
var gl;
var program;
var vao;
/** @type {HTMLCanvasElement} */
var canvas;
var posBuffer, colorBuffer;

// The buffers are sized for this many triangles, once, in setup(): see the
// "fixed-size buffer" alternative at the end of ex12. Reached the limit and
// add_vertex() simply stops accepting new vertices.
const MAX_TRIANGLES = 200;

// Every vertex of every completed triangle, in clip space, three at a time
const positions = [];
const colors = [];

// Vertices of the triangle currently being placed, not yet completed
var pending = [];

function to_clip_space(x, y) {
    return vec2(
        (x / canvas.width) * 2 - 1,
        1 - (y / canvas.height) * 2
    );
}

function random_color() {
    return vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

function add_vertex(x, y) {
    if (positions.length >= MAX_TRIANGLES * 3) return;

    pending.push(to_clip_space(x, y));

    // Three vertices complete a triangle: commit it and start the next one
    if (pending.length == 3) {
        positions.push(...pending);
        colors.push(random_color(), random_color(), random_color());
        pending = [];
        update_buffers();
    }
}

// Only the triangle just completed - the last three vertices - is new;
// everything before it is already sitting in the buffer from an earlier
// call, so only that much is written, at the byte offset it starts at.
function update_buffers() {
    const posOffset = (positions.length - 3) * 2 * 4;
    const colorOffset = (colors.length - 3) * 4 * 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, posOffset, flatten(positions.slice(-3)));
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset, flatten(colors.slice(-3)));
}

function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);

    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    posBuffer = gl.createBuffer();
    colorBuffer = gl.createBuffer();

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_TRIANGLES * 3 * 2 * 4, gl.DYNAMIC_DRAW);
    const a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, MAX_TRIANGLES * 3 * 4 * 4, gl.DYNAMIC_DRAW);
    const a_color = gl.getAttribLocation(program, "a_color");
    gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_color);

    gl.bindVertexArray(null);

    canvas.addEventListener("click", (event) => add_vertex(event.offsetX, event.offsetY));

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

function animate() {
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
    gl.bindVertexArray(null);
}

loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => setup(shaders));
