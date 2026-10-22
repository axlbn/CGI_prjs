 #version 300 es


precision highp float;

const int MAX_SITES = 32;

uniform vec2  u_site_positions[MAX_SITES];
uniform vec3  u_site_colors[MAX_SITES];
uniform int   u_n_sites;      
uniform int   u_metric;       // 0 Euclidean, 1 Manhattan, 2 Chebyshev

uniform float u_zoom;
uniform vec2 u_camera;
uniform vec2 u_resolution;
uniform bool u_show_borders;

out vec4 fragColor;

vec2 get_worldPosition(){
    vec2 screenPosition = vec2(gl_FragCoord.x,u_resolution.y-gl_FragCoord.y);
    vec2 worldPosition = (screenPosition - u_camera)/u_zoom;
    return worldPosition;
}
float siteDistance(vec2 p,vec2 site){
    vec2 delta = abs(p-site);
    if(u_metric==1){
        return delta.x+delta.y;
    }
    if(u_metric == 2){
        return max(delta.x,delta.y);
    }
    return distance(p,site);
}
int manhattan(){
    vec2 worldPosition=get_worldPosition();
    float minDistance=1e20;
    int nearestSite =-1;
    for(int i=0;i<u_n_sites;i++){
        float d = abs(worldPosition.x-u_site_positions[i].x)+abs(worldPosition.y-u_site_positions[i].y);
        if(d<minDistance){
            minDistance=d;
            nearestSite=i;
        }
    }
    return nearestSite;
}

int chebyshev(){
        vec2 worldPosition=get_worldPosition();
        float minDistance=1e20;
        int nearestSite =-1;
        for(int i=0;i<u_n_sites;i++){
            float d = max(abs(worldPosition.x-u_site_positions[i].x),abs(worldPosition.y-u_site_positions[i].y));
            if(d<minDistance){
                minDistance=d;
                nearestSite=i;
            }
        }
        return nearestSite;
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
    vec2 worldPosition = get_worldPosition();
    float minDistance = 1e20;
    float secondDistance = 1e20;
    int nearestSite = -1;

    for (int i = 0; i < u_n_sites; i++) {
        float d = siteDistance(worldPosition, u_site_positions[i]);

        if (d < minDistance) {
            secondDistance = minDistance;
            minDistance = d;
            nearestSite = i;
        }
        else if (d < secondDistance) {
            secondDistance = d;
        }
    }

    if (nearestSite == -1) {
        fragColor = vec4(0.1, 0.1, 0.1, 1.0);
        return;
    }

    float difference = secondDistance - minDistance;

    if (u_show_borders && difference < 2.0  ) {
        fragColor = vec4(1.0f, 0.99f, 0.99f, 1.0f);
    } else {
        fragColor = vec4(u_site_colors[nearestSite], 1.0);
    }
}