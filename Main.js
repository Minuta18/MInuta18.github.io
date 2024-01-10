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

        this.drawScene();
        console.info('[WebGLRenderer] Successfully initialized')
    }

    initWebGL(canvas) {
        gl = null;

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

    drawScene() {
        this.glapi.clearColor(0.0, 0.0, 0.0, 1.0);
        this.glapi.clear(this.glapi.COLOR_BUFFER_BIT | this.glapi.DEPTH_BUFFER_BIT);
        // console.log(`[WebGLRenderer] Shader link status: ${ this.glapi.getProgramParameter(this.shader, this.glapi.LINK_STATUS) } `);
        this.glapi.drawArrays(this.glapi.TRIANGLES, 0, 3);

        // window.requestAnimationFrame(WebGLRenderer.drawScene);
    }
}   

gl = null;

function start() {
    gl = new WebGLRenderer(document.getElementById("glcanvas"));
}
