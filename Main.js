/* This code is partly copied from https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample3/webgl-demo.js */

const vertexShaderSource = `
#version 330 core
layout (location = 0) in vec3 aPos; // the position variable has attribute position 0
  
out vec4 vertexColor; // specify a color output to the fragment shader

void main() {
    gl_Position = vec4(aPos, 1.0); // see how we directly give a vec3 to vec4's constructor
    vertexColor = vec4(0.5, 0.0, 0.0, 1.0); // set the output variable to a dark-red color
}
`;

const fragmentShaderSource = `
void main(void) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

function createProjectionMatrix(canvas) {
    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100;
    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix,  fieldOfView, aspect, zNear, zFar);
    return projectionMatrix;
}

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

        this.glapi.clearColor(0.0, 0.0, 0.0, 1.0);
        this.glapi.clear(gl.COLOR_BUFFER_BIT);

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

        if (!this.glapi.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error(`[WebGLRenderer] Can't link shader program. Info log: ${ this.glapi.getProgramInfoLog(shaderProgram) }`);
            alert(`Unable to initialize the shader program: ${ this.glapi.getProgramInfoLog(shaderProgram) }`);
            return null;
        }
        
        return shaderProgram;
    }

    loadShader(source, type) {
        let type_string = (this.glapi.VERTEX_SHADER == type) ? 'vertex' : 'fragment';
        let shader = this.glapi.createShader(type);
        this.glapi.shaderSource(shader, source);
        this.glapi.compileShader(shader);

        if (!this.glapi.getShaderParameter(shader, this.glapi.COMPILE_STATUS)) {
            alert(`An error occurred compiling the shaders: ${ this.glapi.getShaderInfoLog(shader) }`);
            console.error(`[WebGLRenderer] failed to compile ${ type_string } shader: ${ this.glapi.getShaderInfoLog(shader) }`);
            this.glapi.deleteShader(shader);
            return null;
        }

        console.info(`[WebGLRenderer] Compiled ${ type_string } shader`);

        return shader;
    }

    initBuffers() {
        // var vertices = [
        //     0.0, 0.0, 0.0, -1.0, 
        //     1.0, 1.0, 1.0, 1.0,
        // ];
        // var colors = [
        //     1.0,  1.0,  1.0,  1.0,
        //     1.0,  0.0,  0.0,  1.0,
        //     0.0,  1.0,  0.0,  1.0,
        //     0.0,  0.0,  1.0,  1.0,
        // ];

        this.aVertexColorBuffer = this.createArrayBuffer('aVertexColor', 4, this.glapi.FLOAT);
        this.aVertexPositionBuffer = this.createArrayBuffer('aVertexPosition', 4, this.glapi.FLOAT);
        
    }

    createArrayBuffer(attribute, array_size, type) {
        let buffer = this.glapi.createBuffer();
        this.glapi.bindBuffer(this.glapi.ARRAY_BUFFER, buffer);
        this.glapi.vertexAttribPointer(this.glapi.getAttribLocation(this.shader, attribute), array_size, type, false, 0, 0);
        this.glapi.enableVertexAttribArray(this.glapi.getAttribLocation(this.shader, attribute));
        console.log(`[WebGLRenderer] ${ attribute } ${ this.glapi.getAttribLocation(this.shader, attribute) }`)
        return buffer;
    }

    drawScene() {
        this.glapi.clearColor(0.0, 0.0, 0.0, 1.0);
        this.glapi.clearDepth(1.0);
        this.glapi.enable(this.glapi.DEPTH_TEST);
        this.glapi.depthFunc(this.glapi.LEQUAL);
        this.glapi.clear(this.glapi.COLOR_BUFFER_BIT | this.glapi.DEPTH_BUFFER_BIT);

        let projectionMat = createProjectionMatrix(this.canvas);
        let viewMat = mat4.create();
        mat4.translate(viewMat, viewMat, [0.0, 0.0, -6.0]);
       
        this.glapi.uniformMatrix4fv(this.glapi.getUniformLocation(this.shader, 'uProjectionMatrix'), false, projectionMat);
        this.glapi.uniformMatrix4fv(this.glapi.getUniformLocation(this.shader, 'uModelViewMatrix'), false, viewMat); 
       
        this.glapi.useProgram(this.shader);
        
        {
            const offset = 0;
            const vertexCount = 4;
            this.glapi.drawArrays(this.glapi.TRIANGLE_STRIP, offset, vertexCount);
        }
    }
}   

gl = null;

function start() {
    gl = new WebGLRenderer(document.getElementById("glcanvas"));
}
