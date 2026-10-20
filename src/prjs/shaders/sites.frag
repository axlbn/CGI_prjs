#version 300 es
precision highp float;

flat in vec3 v_color;

out vec4 fragColor;

void main() {
    float d = distance(gl_PointCoord, vec2(0.5f));

    if(d > 0.5f) {
        discard;
    }
    if(d > 0.38f) {
        fragColor = vec4(1.0f, 1.0f, 1.0f, 1.0f);
    } else {
        fragColor = vec4(v_color, 1.0f);
    }
}
