#version 300 es

// The object libraries put positions at location 0 and normals at 1.
layout(location = 0) in vec4 a_position;
layout(location = 1) in vec3 a_normal;

uniform mat4 u_ctm;

out vec3 v_normal;

void main() {
    gl_Position = u_ctm * a_position;
    v_normal = a_normal;
}
