import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from "../../libs/utils.js";
import { vec2, vec4, flatten } from "../../libs/MV.js";

/** @type {WebGL2RenderingContext} */
var gl;
var program;
var vao;
/** @type {HTMLCanvasElement} */
var canvas;
var posBuffer, colorBuffer;
var u_center, u_scale, u_world_half_width;

// The buffers are sized for this many triangles, once, in setup(): see the
// "fixed-size buffer" alternative at the end of ex12. Reached the limit and
// add_vertex() simply stops accepting new vertices.
const MAX_TRIANGLES = 200;

const positions = [];
const colors = [];
var pending = [];

// The scene lives in its own coordinate system, unrelated to both pixels
// and clip space: an arbitrary choice of units, fixed for the life of the
// application. WORLD_HALF_WIDTH says how much of it is visible across the
// canvas at the default zoom -- from -10 to 10 rather than the -1 to 1 of
// clip space, precisely so the two are never confused with one another.
const WORLD_HALF_WIDTH = 10.0;

// Where the view currently is, in world units, and how zoomed in it is.
// scale is unused until ex15 adds the wheel handler that changes it, but it
// already belongs in the formulas below so that ex15 needs to add nothing
// to them.
var center = [0.0, 0.0];
var scale = 1.0;

// Pixels, the only units the mouse speaks, into world coordinates: undo
// the view (pan and zoom) to find the world position a screen pixel
// currently shows.
function to_world(x, y) {
    const nx = (x / canvas.width) * 2 - 1;
    const ny = 1 - (y / canvas.height) * 2;
    return vec2(
        nx * WORLD_HALF_WIDTH * scale + center[0],
        ny * WORLD_HALF_WIDTH * scale + center[1]
    );
}

function random_color() {
    return vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

function add_vertex(x, y) {
    if (positions.length >= MAX_TRIANGLES * 3) return;

    pending.push(to_world(x, y));
    if (pending.length == 3) {
        positions.push(...pending);
        colors.push(random_color(), random_color(), random_color());
        pending = [];
        update_buffers();
    }
}

// Only the triangle just completed - the last three vertices - is new; it
// is written at the byte offset where it starts, leaving the rest of the
// buffer, already holding every earlier triangle, untouched.
function update_buffers() {
    const posOffset = (positions.length - 3) * 2 * 4;
    const colorOffset = (colors.length - 3) * 4 * 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, posOffset, flatten(positions.slice(-3)));
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset, flatten(colors.slice(-3)));
}

// Move the view by (dx, dy) screen pixels. However zoomed in the view is,
// dragging must feel the same: the content under the pointer at the start
// of the drag should still be under the pointer at the end of it. The
// width of the world currently visible is 2 * WORLD_HALF_WIDTH * scale,
// spread over canvas.width pixels, so that ratio is how many world units
// one screen pixel is worth right now.
function pan(dx, dy) {
    const world_units_per_pixel = (2 * WORLD_HALF_WIDTH * scale) / canvas.width;
    center[0] -= dx * world_units_per_pixel;
    center[1] += dy * world_units_per_pixel;
}

function setup_mouse() {
    let down = null, last = null, moved = false;

    canvas.addEventListener("mousedown", (event) => {
        down = [event.offsetX, event.offsetY];
        last = down;
        moved = false;
    });

    canvas.addEventListener("mousemove", (event) => {
        if (down === null) return;
        const here = [event.offsetX, event.offsetY];

        // Below this distance, treat it as a click that has not happened
        // yet rather than a drag -- but do not lose the movement: once the
        // threshold is crossed, pan by the distance from the *original*
        // mousedown, not just since the last event, so nothing travelled
        // before the decision was made goes missing.
        if (!moved && Math.hypot(here[0] - down[0], here[1] - down[1]) <= 4) return;

        moved = true;
        pan(here[0] - last[0], here[1] - last[1]);
        last = here;
    });

    canvas.addEventListener("mouseup", (event) => {
        if (!moved) add_vertex(event.offsetX, event.offsetY);
        down = null;
    });
}

function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);

    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);
    u_center = gl.getUniformLocation(program, "u_center");
    u_scale = gl.getUniformLocation(program, "u_scale");
    u_world_half_width = gl.getUniformLocation(program, "u_world_half_width");

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

    setup_mouse();

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

function animate() {
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniform2fv(u_center, center);
    gl.uniform1f(u_scale, scale);
    gl.uniform1f(u_world_half_width, WORLD_HALF_WIDTH);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, positions.length);
    gl.bindVertexArray(null);
}

loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => setup(shaders));
