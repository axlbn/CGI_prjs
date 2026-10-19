#version 300 es

uniform vec2 u_position;

void main() {
    gl_Position = vec4(u_position, 0.0, 1.0);
    gl_PointSize = 5.0;
}
