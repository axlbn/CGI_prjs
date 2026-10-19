 #version 300 es

// precision highp float;

// uniform vec2 u_resolution;

// out vec4 color;

// void decide_color() {
//     float gap = 0.02;

//     vec2 coord = (gl_FragCoord.xy / u_resolution) * 2.0 - 1.0;

//     vec2 a = vec2(-0.5, 0.5);
//     vec2 b = vec2( 0.5, 0.5);

//     float dxa = coord.x - a.x;
//     float dya = coord.y - a.y;
//     float dxb = coord.x - b.x;
//     float dyb = coord.y - b.y;

//     float dist_a = sqrt(dxa * dxa + dya * dya);
//     float dist_b = sqrt(dxb * dxb + dyb * dyb);

//     if (abs(dist_a - dist_b) < gap) {
//         color = vec4(0.98, 0.96, 0.96, 1.0);
//     } else if (dist_a < dist_b) {
//         color = vec4(0.2, 0.4, 0.6, 1.0);
//     } else {
//         color = vec4(0.6, 0.0, 0.6, 1.0);
//     }
// }

// void main() {
//     decide_color();
// }

precision highp float;

out vec4 color;

void main() {
    color = vec4(0.2f, 0.4f, 0.6f, 1.0f);
}
