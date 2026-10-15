#version 300 es

precision mediump float;

in vec3 v_normal;

out vec4 color;

void main() {
    // No lighting yet: the normal, mapped from [-1, 1] to [0, 1], is used
    // as a colour, just so that the faces of a solid object can be told apart.
    color = vec4(0.5f * normalize(v_normal) + 0.5f, 1.0f);
}
