import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from "../../libs/utils.js";
import { vec2, vec4, flatten } from "../../libs/MV.js";

/** @type {WebGL2RenderingContext} */
var gl;
var program;
var u_center, u_scale, u_world_half_width;

/** @type {HTMLCanvasElement} */
var canvas;

// The scene's own coordinate system - see ex14 - unrelated to pixels or to
// clip space.
const WORLD_HALF_WIDTH = 10.0;
var center = [0.0, 0.0];
var scale = 1.0;

const MODES = {
    "1": { primitive: "POINTS", verts_per_shape: 1 },
    "2": { primitive: "LINES", verts_per_shape: 2 },
    "3": { primitive: "TRIANGLES", verts_per_shape: 3 },
};
var mode = "1";

// Each mode's buffers are sized for this many shapes of its own, once, in
// setup(): see the "fixed-size buffer" alternative at the end of ex12.

const state = {};
for (const key in MODES) {
    state[key] = { positions: [], colors: [], pending: [], vao: null, posBuffer: null, colorBuffer: null };
}

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

const MAX_SHAPES = 300;

function add_vertex(x, y) {
    const s = state[mode];
    const verts = MODES[mode].verts_per_shape;
    if (s.positions.length >= MAX_SHAPES * verts) return;

    s.pending.push(to_world(x, y));

    if (s.pending.length == verts) {
        s.positions.push(...s.pending);
        s.pending.forEach(() => s.colors.push(random_color()));
        s.pending = [];
        update_buffers(mode);
    }
}

// Only the shape just completed is new - the last verts_per_shape vertices
// for this mode - and only that much is written, at the byte offset it
// starts at, leaving every earlier shape in this mode's buffer untouched.
function update_buffers(key) {
    const s = state[key];
    const verts = MODES[key].verts_per_shape;
    const posOffset = (s.positions.length - verts) * 2 * 4;
    const colorOffset = (s.colors.length - verts) * 4 * 4;

    gl.bindBuffer(gl.ARRAY_BUFFER, s.posBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, posOffset, flatten(s.positions.slice(-verts)));
    gl.bindBuffer(gl.ARRAY_BUFFER, s.colorBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, colorOffset, flatten(s.colors.slice(-verts)));
}

function pan(dx, dy) {
    const world_units_per_pixel = (2 * WORLD_HALF_WIDTH * scale) / canvas.width;
    center[0] -= dx * world_units_per_pixel;
    center[1] += dy * world_units_per_pixel;
}

function setup_keys() {
    window.addEventListener("keydown", (event) => {
        // hasOwn, not "in": MODES is a plain object, and "in" would also
        // match inherited names like "constructor" or "toString"
        if (Object.hasOwn(MODES, event.key)) {
            state[mode].pending = [];   // discard the shape being left half-finished
            mode = event.key;
        }
    });
}

function setup_zoom() {
    // On the canvas, not the window: the wheel gesture must not also
    // scroll the page. { passive: false } is required for preventDefault()
    // to have any effect on a wheel listener -- browsers assume wheel
    // listeners are passive (cannot cancel the default scroll) unless told
    // otherwise.
    canvas.addEventListener("wheel", (event) => {
        event.preventDefault();
        scale = Math.min(4.0, Math.max(0.2, scale * (1 + event.deltaY / 1000)));
    }, { passive: false });
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

    const a_position = gl.getAttribLocation(program, "a_position");
    const a_color = gl.getAttribLocation(program, "a_color");

    for (const key in state) {
        const s = state[key];
        s.posBuffer = gl.createBuffer();
        s.colorBuffer = gl.createBuffer();

        s.vao = gl.createVertexArray();
        gl.bindVertexArray(s.vao);

        const verts = MODES[key].verts_per_shape;

        gl.bindBuffer(gl.ARRAY_BUFFER, s.posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, MAX_SHAPES * verts * 2 * 4, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_position);

        gl.bindBuffer(gl.ARRAY_BUFFER, s.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, MAX_SHAPES * verts * 4 * 4, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(a_color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_color);

        gl.bindVertexArray(null);
    }

    setup_keys();
    setup_zoom();
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

    for (const key in MODES) {
        const s = state[key];
        if (s.positions.length == 0) continue;
        gl.bindVertexArray(s.vao);
        gl.drawArrays(gl[MODES[key].primitive], 0, s.positions.length);
    }
    gl.bindVertexArray(null);
}

loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => setup(shaders));
