function start() {
    const vertexShaderSource = `
attribute vec4 aVertexColor;
attribute vec4 aVertexPosition;

// uniform mat4 uModelViewMatrix;
// uniform mat4 uProjectionMatrix;

// varying lowp vec4 vColor;

void main(void) {
    gl_Position = aVertexPosition * aVertexColor;
}
`;
    
    const fragmentShaderSource = `
void main(void) {
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;
    
    let canvas = document.getElementById('glcanvas');
    let gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Can not initialize GL');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
    }

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader));
    }

    let shader = gl.createProgram();
    gl.attachShader(shader, vertexShader);
    gl.attachShader(shader, fragmentShader);
    gl.linkProgram(shader);

    if (!gl.getProgramParameter(shader, gl.LINK_STATUS)) {
        alert(gl.getProgramInfoLog(shader));
    }

    let aVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aVertexColorBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shader, 'aVertexColor'), 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(shader, 'aVertexColor'));

    let aVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aVertexPositionBuffer);
    gl.vertexAttribPointer(gl.getAttribLocation(shader, 'aVertexPosition'), 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(gl.getAttribLocation(shader, 'aVertexPosition'));

    console.log(gl.getAttribLocation(shader, 'aVertexPosition'), gl.getAttribLocation(shader, 'aVertexColor'));

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shader);
    // gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'uProjectMatrix'). false, mat4.create());
    // gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'uModelViewMatrix'). false, mat4.create());

    {
        const offset = 0;
        const vertexCount = 4;
        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
}