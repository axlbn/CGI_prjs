#version 300 es

// a_position is in world coordinates: an application-defined unit, wholly
// unrelated to pixels or to clip space. Converting it to clip space -
// dividing by how much of the world is visible, then shifting by where the
// view currently is - is the vertex shader's job, every frame, for every
// vertex, whether the view has moved since that vertex was placed or not.
in vec4 a_position;
in vec4 a_color;

uniform vec2 u_center;
uniform float u_scale;
uniform float u_world_half_width;

out vec4 v_color;

void main() {
    gl_Position = vec4((a_position.xy - u_center) / (u_scale * u_world_half_width), 0.0, 1.0);
    gl_PointSize = 8.0;   // only takes effect when drawing with gl.POINTS
    v_color = a_color;
}
