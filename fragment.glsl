/* This code is partly copied from https://gpfault.net/posts/mandelbrot-webgl.txt.html */
precision highp float;

uniform vec2 u_ZoomCenter;
uniform float u_Zoom;
uniform int u_MaxIterations;

vec2 f(vec2 x, vec2 c) {
	return mat2(x,-x.y,x.x)*x + c;
}

vec3 palette(int iters) {
    float r = float(iters) / float(u_MaxIterations);
    return vec3((1.0 - r) * (1.0 - r) * (1.0 - r) * (1.0 - r));
}

void main() {
  vec2 uv = gl_FragCoord.xy / vec2(800.0, 800.0);
  vec2 c = u_ZoomCenter + (uv * 4.0 - vec2(2.0)) * (u_Zoom / 4.0);
  vec2 x = vec2(0.0);
  bool escaped = false;
  int iterations = 0;    
  for (int i = 0; i < 10000; i++) {
    if (i > u_MaxIterations) break;
    iterations = i;
    x = f(x, c);
    if (length(x) > 2.0) {
      escaped = true;
      break;
    }
  }
  gl_FragColor = escaped ? vec4(palette(iterations), 1.0) : vec4(0.0, 0.0, 0.0, 1.0);
}