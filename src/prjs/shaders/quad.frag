 #version 300 es


precision highp float;

const int MAX_SITES = 32;

uniform vec2  u_site_positions[MAX_SITES];
uniform vec3  u_site_colors[MAX_SITES];
uniform int   u_n_sites;      // how many of MAX_SITES are actually in use
uniform int   u_metric;       // 0 Euclidean, 1 Manhattan, 2 Chebyshev

uniform float u_zoom;
uniform vec2 u_camera;
uniform vec2 u_resolution;

out vec4 fragColor;

vec2 get_worldPosition(){
    vec2 screenPosition = vec2(gl_FragCoord.x,u_resolution.y-gl_FragCoord.y);
    vec2 worldPosition = (screenPosition - u_camera)/u_zoom;
    return worldPosition;
}
int euclid(){
        vec2 worldPosition=get_worldPosition();
        float minDistance=1e20;
        int nearestSite =-1;
        for(int i=0;i<u_n_sites;i++){
            float d = distance(worldPosition,u_site_positions[i]);
            if(d<minDistance){
                minDistance=d;
                nearestSite=i;
            }
        }
        return nearestSite;
}

void main() {
    int nearestSite = euclid();

    if (nearestSite >= 0) {
        fragColor = vec4(u_site_colors[nearestSite], 1.0);
    } else {
        fragColor = vec4(0.1, 0.1, 0.1, 1.0);
    }
}