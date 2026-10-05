import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from "../../libs/utils.js";
import { vec2, flatten } from "../../libs/MV.js";

/** @type {WebGL2RenderingContext} */
var gl;
var program;
var vao;
/** @type {HTMLCanvasElement} */
var canvas;

// Every point placed so far, in clip space
const points = [];

// A mouse position, in pixels from the top-left corner of the canvas, into
// clip space: both axes from -1 to 1, origin at the centre, y pointing up.
// The y axis is flipped because pixels grow downward and clip space grows
// upward.
function to_clip_space(x, y) {
    return vec2(
        (x / canvas.width) * 2 - 1,
        1 - (y / canvas.height) * 2
    );
}

function update_buffer(buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
}

function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);

    program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    const aBuffer = gl.createBuffer();

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    const a_position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);

    gl.bindVertexArray(null);

    canvas.addEventListener("click", (event) => {
        points.push(to_clip_space(event.offsetX, event.offsetY));
        update_buffer(aBuffer);
    });

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}

function animate() {
    window.requestAnimationFrame(animate);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.POINTS, 0, points.length);
    gl.bindVertexArray(null);
}

loadShadersFromURLS(["shader.vert", "shader.frag"]).then(shaders => setup(shaders));
