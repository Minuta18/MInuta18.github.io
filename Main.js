/* This code is partly copied from https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample3/webgl-demo.js */

const vertexShaderSource = document.getElementById('shader-vs').text;
const fragmentShaderSource = document.getElementById('shader-fs').text;

class WebGLRenderer {
    constructor(canvas) {
        console.info("[WebGLRenderer] Starting WebGL renderer");

        this.canvas = canvas;
        this.glapi = this.initWebGL(this.canvas);

        if (!this.glapi) {
            alert('Can not initialize WebGLRenderer.');
            console.error('[WebGLRenderer] Can not initialize WebGLRenderer: Failed to initialize WebGL');
            throw new Error('Can not initialize WebGLRenderer');
        }

        this.shader = this.loadShaders(vertexShaderSource, fragmentShaderSource);
        this.initBuffers();
        this.initUniforms();

        console.info('[WebGLRenderer] Successfully initialized')
    }

    initWebGL(canvas) {
        let gl = null;

        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch (e) {}

        if (!gl) {
            console.error('[WebGLRenderer] Failed to initialize WebGL. Is your browser support it?');
            alert("Unable to load WebGL. Your browser may not support it");
            gl = null;
        }

        return gl;
    }

    loadShaders(vertex, fragment) {
        let vertexShader = this.loadShader(vertex, this.glapi.VERTEX_SHADER);
        let fragmentShader = this.loadShader(fragment, this.glapi.FRAGMENT_SHADER);

        const shaderProgram = this.glapi.createProgram();
        this.glapi.attachShader(shaderProgram, vertexShader);
        this.glapi.attachShader(shaderProgram, fragmentShader);
        this.glapi.linkProgram(shaderProgram);

        if (!this.glapi.getProgramParameter(shaderProgram, this.glapi.LINK_STATUS)) {
            console.error(`[WebGLRenderer] Can't link shader program. Info log: ${ this.glapi.getProgramInfoLog(shaderProgram) }`);
            alert(`Unable to initialize the shader program: ${ this.glapi.getProgramInfoLog(shaderProgram) }`);
            return null;
        } else {
            console.info(`[WebGLRenderer] Shader linked successfully`)
        }

        this.glapi.useProgram(shaderProgram);
        
        return shaderProgram;
    }

    loadShader(source, type) {
        let type_string = (this.glapi.VERTEX_SHADER == type) ? 'vertex' : 'fragment';
        let shader = this.glapi.createShader(type);
        this.glapi.shaderSource(shader, source);
        this.glapi.compileShader(shader);

        if (!this.glapi.getShaderParameter(shader, this.glapi.COMPILE_STATUS)) {
            alert(`An error occurred compiling the shaders: ${ this.glapi.getShaderInfoLog(shader) }`);
            console.error(`[WebGLRenderer] Failed to compile ${ type_string } shader: ${ this.glapi.getShaderInfoLog(shader) }`);
            this.glapi.deleteShader(shader);
            return null;
        }

        console.info(`[WebGLRenderer] Compiled ${ type_string } shader`);

        return shader;
    }

    initBuffers() {
        this.vertex_buf = this.glapi.createBuffer(this.glapi.ARRAY_BUFFER);
        this.glapi.bindBuffer(this.glapi.ARRAY_BUFFER, this.vertex_buf);
        this.glapi.bufferData(this.glapi.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), this.glapi.STATIC_DRAW);    
        
        this.position_attr = this.glapi.getAttribLocation(this.shader, 'a_Position');
        this.glapi.enableVertexAttribArray(this.position_attr);
        this.glapi.vertexAttribPointer(this.position_attr, 2, this.glapi.FLOAT, false, 0, 0);
    }

    initUniforms() {
        this.max_iterations_uniform = this.glapi.getUniformLocation(this.shader, 'u_MaxIterations');
        this.zoom_center = this.glapi.getUniformLocation(this.shader, 'u_ZoomCenter');
        this.zoom = this.glapi.getUniformLocation(this.shader, 'u_Zoom');
        // console.log(this.zoom_center)
    }

    drawScene(zoom_center, zoom, iters) {
        this.glapi.uniform2f(this.zoom_center, zoom_center[0], zoom_center[1]);
        this.glapi.uniform1i(this.max_iterations_uniform, iters);
        this.glapi.uniform1f(this.zoom, zoom);

        this.glapi.clearColor(0.0, 0.0, 0.0, 1.0);
        this.glapi.clear(this.glapi.COLOR_BUFFER_BIT);
        this.glapi.drawArrays(this.glapi.TRIANGLES, 0, 3);
    }
}   

// let audio_tag = document.createElement('audio');
// let name_tag = document.getElementById("name");
// let tracks = [
//     ('Acediast - Accurst', document.getElementById('audio1').href),
//     ('Acediast - Hide', document.getElementById('audio2').href),
//     ('Acediast - Malformed Canticle Of Despondent Languor', document.getElementById('audio3').href),
//     ('Acediast - Omni', document.getElementById('audio4').href),
// ];
// let nowplays = -1;

// function next_track() {
//     nowplays += 1;
//     if (nowplays == 4) nowplays = 0;
//     name_tag.value = `Music: ${ tracks[nowplays][0] }`
//     audio_tag.src = tracks[0][1]; 
//     audio_tag.controls = true;

//     console.log('!');
// }

// next_track()

let canvas_element = document.getElementById('glcanvas');
let detail_input = document.getElementById('detail');

let zoom_center = [0.0, 0.0];
let target_zoom_center = [0.0, 0.0];
let zoom_size = 4.0;
let stop_zooming = true;
let zoom_factor = 1.0;
let zoom_acc = [0.0, 0.0];
let speed = 0.004;
let enable_zoom = false;

let max_iterations = 500;
let iterations = max_iterations;
let min_iterations = 200;
let iterations_step = 5;

let gl_renderer = new WebGLRenderer(canvas_element);

function renderFrame() {
    gl_renderer.drawScene(zoom_center, zoom_size, iterations);
    iterations = Number(detail_input.value);

    if (enable_zoom) {
        zoom_center[0] += zoom_acc[0]; zoom_center[1] += zoom_acc[1]; 
        zoom_size *= zoom_factor;

        // window.requestAnimationFrame(renderFrame);
    }
}

function start() {
    this.window.requestAnimationFrame(renderFrame);
    window.addEventListener('keydown', function (e) {
        if (e.key == 'ArrowUp') {
            zoom_acc = [0.0, speed * zoom_size];
        } else if (e.key == 'ArrowDown') {
            zoom_acc = [0.0, -(speed * zoom_size)];
        }
        if (e.key == 'ArrowLeft') {
            zoom_acc = [-(speed * zoom_size), 0.0];
        } else if (e.key == 'ArrowRight') {
            zoom_acc = [speed * zoom_size, 0.0];
        } 
        
        console.log(e.key);

        if (e.key == '-') {
            zoom_factor = 1.01;
        } else if (e.key == '=') {
            zoom_factor = 0.99;
        }

        console.log(zoom_center, zoom_acc);

        enable_zoom = true;
        window.requestAnimationFrame(renderFrame);
    })

    window.addEventListener('keyup', function (e) {
        zoom_acc = [0.0, 0.0];
        zoom_factor = 1.0;
        enable_zoom = false;
    });

    canvas_element.oncontextmenu = function (e) { return false; }
}
