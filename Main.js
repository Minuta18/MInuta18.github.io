/* This code is partly copied from https://github.com/mdn/dom-examples/blob/main/webgl-examples/tutorial/sample3/webgl-demo.js */

const vertexShaderSource = `
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vColor = aVertexColor;
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
        this.canvas = canvas;
        this.glapi = this.initWebGL(this.canvas);

        if (!this.glapi) {
            alert('Can not initialize WebGLRenderer.')
            throw new Error('Can not initialize WebGLRenderer');
        }

        this.glapi.clearColor(0.0, 0.0, 0.0, 1.0);
        this.glapi.clear(gl.COLOR_BUFFER_BIT);

        this.shader = this.loadShaders(vertexShaderSource, fragmentShaderSource);

        this.programInfo = {
            program: this.shader,
            attribLocations: {
                vertexPosition: this.glapi.getAttribLocation(this.shader, "aVertexPosition"),
                vertexColor: this.glapi.getAttribLocation(this.shader, "aVertexColor"),
            },
            uniformLocations: {
                projectionMatrix: this.glapi.getUniformLocation(
                  this.shader,
                  "uProjectionMatrix"
                ),
                viewMatrix: this.glapi.getUniformLocation(this.shader, "uModelViewMatrix"),
            }
        };

        this.initBuffers();
        this.drawScene();
    }

    initWebGL(canvas) {
        gl = null;

        try {
            gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        } catch (e) {}

        if (!gl) {
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
            alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
            return null;
        }
        
        return shaderProgram;
    }

    loadShader(source, type) {
        let shader = this.glapi.createShader(type);
        this.glapi.shaderSource(shader, source);
        this.glapi.compileShader(shader);

        if (!this.glapi.getShaderParameter(shader, this.glapi.COMPILE_STATUS)) {
            alert(`An error occurred compiling the shaders: ${ this.glapi.getShaderInfoLog(shader) }`);
            this.glapi.deleteShader(shader);
            return null;
        }

        return shader;
    }

    initBuffers() {
        var vertices = [
            0.0, 0.0, 0.0, -1.0, 
            1.0, 1.0, 1.0, 1.0,
        ];
        var colors = [
            1.0,  1.0,  1.0,  1.0,
            1.0,  0.0,  0.0,  1.0,
            0.0,  1.0,  0.0,  1.0,
            0.0,  0.0,  1.0,  1.0,
        ];

        this.positionBuffer = this.glapi.createBuffer();
        this.glapi.bindBuffer(this.glapi.ARRAY_BUFFER, this.positionBuffer);
        this.glapi.bufferData(this.glapi.ARRAY_BUFFER, new Float32Array(vertices), this.glapi.STATIC_DRAW);
        
        this.colorBuffer = this.glapi.createBuffer();
        this.glapi.bindBuffer(this.glapi.ARRAY_BUFFER, this.colorBuffer);
        this.glapi.bufferData(this.glapi.ARRAY_BUFFER, new Float32Array(colors), this.glapi.STATIC_DRAW);
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

        this.setPositionAttribute(this.programInfo);
        this.setColorAttribute(this.programInfo);

        this.glapi.useProgram(this.shader);

        this.glapi.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMat);
        this.glapi.uniformMatrix4fv(this.programInfo.uniformLocations.viewMatrix, false, viewMat); 
        
        {
            const offset = 0;
            const vertexCount = 4;
            this.glapi.drawArrays(this.glapi.TRIANGLE_STRIP, offset, vertexCount);
        }
    }

    setColorAttribute() {
        this.glapi.bindBuffer(this.glapi.ARRAY_BUFFER, this.colorBuffer);
        this.glapi.vertexAttribPointer(this.programInfo.attribLocations.vertexColor, 4, this.glapi.FLOAT, false, 0, 0);
        this.glapi.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);
    }

    setPositionAttribute() {
        this.glapi.bindBuffer(this.glapi.ARRAY_BUFFER, this.positionBuffer);
        this.glapi.vertexAttribPointer(this.programInfo.attribLocations.vertexPosition, 2, this.glapi.FLOAT, false, 0, 0);
        this.glapi.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    }
}   

gl = null;

function start() {
    gl = new WebGLRenderer(document.getElementById("glcanvas"));
}
