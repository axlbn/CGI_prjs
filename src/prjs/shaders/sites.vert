#version 300 es

uniform vec2 u_positions[32];
uniform vec3 u_colors[32];

flat out vec3 v_color;

void main() {
    int i = gl_VertexID;

    vec2 position = u_positions[i];
    v_color = u_colors[i];

    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 5.0;
}
