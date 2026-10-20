import { loadShadersFromURLS, buildProgramFromSources, setupWebGL } from "../libs/utils.js";

/** @type {HTMLCanvasElement} */
let canvas;
/** @type {WebGL2RenderingContext} */
let gl;

let quad_program;
let quad_vao;       // the quad covering the whole viewport


let sites_program;
let sites_vao;
let sites_positions_location;
let sites = []; // array of {x:x,y:y} 
let sites_colors_location;

let quad_positions_location;
let quad_colors_location;
let quad_zoom_location;
let quad_camera_location;
let quad_n_sites_location;
let quad_resolution_location;

let draggingSite = -1;
let mouseDown = false;
let starting_x=0;
let starting_y=0;
let moved = false;

let cameraX = 0;
let cameraY = 0;
let startCameraX=0;
let startCameraY=0;

let zoom = 1.0;

let mouseX=0;
let mouseY=0;
// ---------------------------------------------------------------------------
// Input. The event listeners are already set up in setup_input(); fill in
// these functions. Mouse positions are in canvas pixels, with (0, 0) at the
// top-left corner and y growing downwards.
// ---------------------------------------------------------------------------

function generate_random_color(){
    return [
        Math.random(),
        Math.random(),
        Math.random()
    ]
}

function find_nearest_site(x, y) {
    let nearest = -1;
    let min_distance = 10;
    for (let i = 0; i < sites.length; i++) {
        const dx = x - (sites[i].x * zoom + cameraX);
        const dy = y - (sites[i].y * zoom + cameraY);

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < min_distance) {
            nearest = i;
            min_distance = distance;
        }
    }
    return nearest;
}


function on_mouse_down(x, y) {
    startCameraX=cameraX;
    startCameraY=cameraY;
    starting_x=x;
    starting_y=y;
    mouseDown=true;
    moved=false;
    draggingSite = find_nearest_site(x,y);
}


function on_mouse_move(x, y) {
    mouseX=x;
    mouseY=y;
    if(!mouseDown)return;
    if(Math.hypot(x-starting_x,y-starting_y)>5){
        moved = true;
    }
    if(draggingSite!==-1){
        sites[draggingSite].x = (x-cameraX)/zoom;
        sites[draggingSite].y = (y-cameraY)/zoom;
    }
    else if (moved){
        cameraX = startCameraX+(x-starting_x);
        cameraY = startCameraY+(y-starting_y);
    }
}

function on_mouse_up(x, y) {
    if(!mouseDown) return;
    if(draggingSite === -1 && !moved && sites.length<32){
        sites.push(
            {
                x:(x-cameraX)/zoom,
                y:(y-cameraY)/zoom,
                color: generate_random_color()
            }
        );
    }
    mouseDown=false;
    draggingSite=-1;
}

// dy > 0 when the wheel is scrolled down (towards the user)
function on_wheel(x, y, dy) {
    const worldX = (x-cameraX)/zoom;
    const worldY = (y-cameraY)/zoom;
    const factor = Math.exp(-dy * 0.001);
    zoom = Math.max(0.1,Math.min(10,zoom *factor));//
    cameraX = x - worldX * zoom;
    cameraY = y - worldY * zoom;
}

function remove_site() {
    let removingSite = find_nearest_site(mouseX, mouseY);

    if (removingSite !== -1) {
        sites.splice(removingSite, 1);
    }
}
function on_key(key) {
    switch (key) {
        case '1':       // Euclidean distance
            break;
        case '2':       // Manhattan distance
            break;
        case '3':       // Chebyshev distance
            break;
        case 'b':       // toggle cell borders
            break;
        case 'x':       // remove the site under the pointer
            remove_site();
            break;
        case 'm':       // switch rendering technique / split view
            break;
    }
}


// ---------------------------------------------------------------------------

function resize() {
    // Match the canvas's drawing buffer to the size it is shown at, and
    // draw over all of it
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function setup_input() {
    canvas.addEventListener("mousedown", (event) => on_mouse_down(event.offsetX, event.offsetY));
    canvas.addEventListener("mousemove", (event) => on_mouse_move(event.offsetX, event.offsetY));
    window.addEventListener("mouseup", (event) => on_mouse_up(event.offsetX, event.offsetY));
    canvas.addEventListener("wheel", (event) => {
        on_wheel(event.offsetX, event.offsetY, event.deltaY);
        event.preventDefault();     // don't let the page scroll as well
    });
    window.addEventListener("keydown", (event) => on_key(event.key));
}

function setup(shaders) {
    canvas = document.getElementById("gl-canvas");
    gl = setupWebGL(canvas);

    quad_program = buildProgramFromSources(gl, shaders["quad.vert"], shaders["quad.frag"]);
    sites_program = buildProgramFromSources(gl, shaders["sites.vert"], shaders["sites.frag"]);
    sites_vao = gl.createVertexArray();
    sites_positions_location = gl.getUniformLocation(
        sites_program,
        "u_positions[0]"
    );
    sites_colors_location = gl.getUniformLocation(
        sites_program,
        "u_colors[0]"
    );

    // --- quad uniform ---
    quad_positions_location = gl.getUniformLocation(
        quad_program,
        "u_site_positions[0]"
    )
    quad_colors_location = gl.getUniformLocation(
        quad_program,
        "u_site_colors[0]"
    )
    quad_zoom_location = gl.getUniformLocation(
        quad_program,
        "u_zoom"
    )
    quad_camera_location = gl.getUniformLocation(
        quad_program,
        "u_camera"
    )
    quad_n_sites_location = gl.getUniformLocation(
        quad_program,
        "u_n_sites"
    )
    quad_resolution_location = gl.getUniformLocation(
        quad_program,
        "u_resolution"
    )
    
    // A quad covering the whole viewport, as two triangles: its corners are
    // the corners of clip space, from (-1, -1) to (1, 1)
    const corners = new Float32Array([
        -1, -1, 1, -1, 1, 1,       // first triangle
        -1, -1, 1, 1, -1, 1,       // second triangle
    ]);
    
    quad_vao = gl.createVertexArray();
    gl.bindVertexArray(quad_vao);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(quad_program, "a_position");
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    resize();
    window.addEventListener("resize", resize);
    setup_input();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    window.requestAnimationFrame(animate);
}


function animate(timestamp) {
    window.requestAnimationFrame(animate);

    // Pulisce il canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    // --- QUAD ---
    const colors = new Float32Array(sites.length *3);

    const worldPositions = new Float32Array(sites.length * 2);

    for (let i = 0; i < sites.length; i++) {
        worldPositions[i * 2] = sites[i].x;
        worldPositions[i * 2 + 1] = sites[i].y;

        colors[i * 3] = sites[i].color[0];
        colors[i * 3 + 1] = sites[i].color[1];
        colors[i * 3 + 2] = sites[i].color[2];
    }

    gl.useProgram(quad_program);

    gl.uniform2f(
        quad_resolution_location,
        canvas.width,
        canvas.height
    );
    gl.uniform2f(
        quad_camera_location,
        cameraX,
        cameraY
    )
    gl.uniform1i(quad_n_sites_location,
        sites.length
    )
    gl.uniform1f(quad_zoom_location, zoom);
    if (sites.length > 0) {
        gl.uniform2fv(
            quad_positions_location,
            worldPositions
        );

        gl.uniform3fv(
            quad_colors_location,
            colors
        );
    }

    gl.bindVertexArray(quad_vao);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // --- SITES ---
   

    const screen_positions = new Float32Array(sites.length * 2);

    
    for( let i =0;i<sites.length;i++){
        const site = sites[i];
        //world -> screens
        const screenX= site.x *zoom+cameraX;
        const screenY= site.y *zoom+cameraY;
        // screen -> webGL
        const xGL = 2 * screenX / canvas.width - 1;
        const yGL = 1 - 2 * screenY / canvas.height;

        screen_positions[i*2]=xGL;
        screen_positions[i*2+1]=yGL;

        
    }
    gl.useProgram(sites_program);
    gl.bindVertexArray(sites_vao);
    
    if(sites.length>0){
        gl.uniform2fv(sites_positions_location, screen_positions);
        gl.uniform3fv(sites_colors_location, colors);

        // Disegna tutti i siti in una chiamata
        gl.drawArrays(gl.POINTS, 0, sites.length);
    }


    // Ripristina lo stato
    gl.bindVertexArray(null);
    gl.useProgram(null);
}


loadShadersFromURLS(["quad.vert", "quad.frag","sites.vert","sites.frag"]).then(shaders => setup(shaders));
