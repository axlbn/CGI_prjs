import { loadShadersFromURLS, setupWebGL, buildProgramFromSources } from '../../libs/utils.js';
import { mat4, vec3, flatten, lookAt, ortho, mult } from '../../libs/MV.js';

import * as SPHERE from '../../libs/objects/sphere.js';
import * as CUBE from '../../libs/objects/cube.js';

/** @type {WebGLRenderingContext} */
let gl;

let program;

/** View and Projection matrices */
let mView;
let mProjection;

const edge = 2.0;

/** Draw the objects filled (gl.TRIANGLES) or as wireframes (gl.LINES) */
let mode;

let instances = [];



function render(time) {
    window.requestAnimationFrame(render);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    const u_ctm = gl.getUniformLocation(program, "u_ctm");
    gl.uniformMatrix4fv(u_ctm, false, flatten(mult(mProjection, mult(mView, mat4()))));

    CUBE.draw(gl, program, mode);
}



function setup(shaders) {
    const canvas = document.getElementById('gl-canvas');

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = window.innerHeight;

    gl = setupWebGL(canvas);
    program = buildProgramFromSources(gl, shaders['shader.vert'], shaders['shader.frag']);

    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // The Z-buffer: keep, for each pixel, only the fragment nearest to the
    // camera. Without it, solid objects would show whichever triangles were
    // drawn last, even those behind others.
    gl.enable(gl.DEPTH_TEST);

    // The browser may keep the checkbox ticked across a reload, so the mode
    // is read from it rather than assumed.
    const solid = document.getElementById('solid');
    mode = solid.checked ? gl.TRIANGLES : gl.LINES;
    solid.addEventListener("change", function () {
        mode = this.checked ? gl.TRIANGLES : gl.LINES;
    });

    mView = lookAt(vec3(0, 0, 0), vec3(-1, -1, -2), vec3(0, 1, 0));
    setupProjection();

    SPHERE.init(gl);
    CUBE.init(gl);

    function setupProjection() {
        if (canvas.width < canvas.height) {
            const yLim = edge * canvas.height / canvas.width;
            mProjection = ortho(-edge, edge, -yLim, yLim, -10, 10);
        }
        else {
            const xLim = edge * canvas.width / canvas.height;
            mProjection = ortho(-xLim, xLim, -edge, edge, -10, 10);
        }

    }
    window.addEventListener("resize", function () {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = window.innerHeight;

        setupProjection();

        gl.viewport(0, 0, canvas.width, canvas.height);
    });


    window.requestAnimationFrame(render);
}

const shaderUrls = ['shader.vert', 'shader.frag'];

loadShadersFromURLS(shaderUrls).then(shaders => setup(shaders));
