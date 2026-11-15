// AI-assisted (Claude), reviewed by team Logos
// GLSL of the 3D scene, written for this project (no third-party shader code). The Sun sits at the world origin, so the
// light direction at any point is simply -position. Colours are computed in linear HDR and tone mapped by three.js (ACES).
//   Sun     : moving granulation (cells and dark lanes), limb darkening with a redder edge.
//   Glow    : camera-facing quad around the Sun (inner halo, wide glow, faint streamers): a cheap stand-in for bloom.
//   Earth   : day map lit by the Sun, soft terminator, city lights on the night side (NASA Black Marble), clouds
//             (NASA Blue Marble), sun glint on water only, blue limb haze turning orange at the terminator.
//   Rocky   : Moon and Mars, lit by the Sun, relief from LOLA / MOLA normal maps, Lommel–Seeliger reflectance
//             (the full Moon is evenly bright up to its edge), thin dusty haze on Mars.
//   Atmo    : additive shell outside the limb, bright on the sunlit side only.
//   Stars   : a static, seeded field of points (decoration, not a star catalogue).

const TONE = "#include <tonemapping_fragment>\n#include <colorspace_fragment>";

export const SUN_VERT = /* glsl */ `
varying vec3 vObj; varying vec3 vN; varying vec3 vW;
void main() {
  vObj = position;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const NOISE = /* glsl */ `
float hash3(vec3 p) { p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
vec3 hash33(vec3 p) { return vec3(hash3(p), hash3(p + 19.19), hash3(p + 47.47)); }
float vnoise(vec3 p) {
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1, 0, 0)), f.x), mix(hash3(i + vec3(0, 1, 0)), hash3(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0, 0, 1)), hash3(i + vec3(1, 0, 1)), f.x), mix(hash3(i + vec3(0, 1, 1)), hash3(i + vec3(1, 1, 1)), f.x), f.y), f.z);
}
float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }
// distance to the nearest cell border (0 on the dark lanes between granules); cells drift slowly with time
float cells(vec3 p, float t) {
  vec3 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 g = vec3(float(x), float(y), float(z)), o = hash33(i + g);
    o = 0.5 + 0.42 * sin(t * 0.5 + 6.2831 * o);
    vec3 r = g + o - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) { d2 = d; }
  }
  return sqrt(d2) - sqrt(d1);
}`;

export const SUN_FRAG = /* glsl */ `
uniform float uTime; uniform float uOpacity;
varying vec3 vObj; varying vec3 vN; varying vec3 vW;
${NOISE}
void main() {
  vec3 p = normalize(vObj), N = normalize(vN), V = normalize(cameraPosition - vW);
  float mu = clamp(dot(N, V), 0.0, 1.0);
  float gran = smoothstep(0.0, 0.3, cells(p * 13.0, uTime)) * 0.65 + smoothstep(0.0, 0.3, cells(p * 29.0 + 3.1, uTime * 1.3)) * 0.35; // granules and dark lanes
  float big = fbm(p * 3.2 + vec3(0.0, uTime * 0.015, 0.0));         // larger, slower brightness patches
  float ld = 1.0 - 0.62 * (1.0 - mu) - 0.22 * (1.0 - mu) * (1.0 - mu); // limb darkening (quadratic law)
  vec3 col = mix(vec3(0.75, 0.13, 0.01), vec3(1.0, 0.62, 0.2), pow(mu, 0.5));
  float I = ld * (0.62 + 0.38 * gran) * (0.82 + 0.36 * big);
  gl_FragColor = vec4(1.0 - exp(-col * I * 2.0), uOpacity);        // own soft curve (keeps the golden colour that ACES would bleach)
  #include <colorspace_fragment>
}`;

export const GLOW_VERT = /* glsl */ `
varying vec2 vQ;
void main() { vQ = uv * 2.0 - 1.0; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;

export const GLOW_FRAG = /* glsl */ `
uniform float uTime; uniform float uOpacity; uniform float uRs;
varying vec2 vQ;
${NOISE}
void main() {
  float r = length(vQ), x = max(r / uRs, 1.0);                       // distance in Sun radii
  float a = atan(vQ.y, vQ.x);
  float streak = 0.8 + 0.2 * vnoise(vec3(cos(a) * 3.0, sin(a) * 3.0, uTime * 0.04)) + 0.12 * vnoise(vec3(cos(a) * 9.0, sin(a) * 9.0, 4.0));
  float halo = exp(-(x - 1.0) * 5.0);                                // tight, bright ring at the limb
  float wide = 0.2 * pow(x, -2.6) * streak;                          // wide glow with faint streamers
  float fade = smoothstep(1.0, 0.5, r);
  vec3 c = vec3(1.0, 0.72, 0.42) * halo * 0.75 + vec3(1.0, 0.55, 0.25) * wide;
  gl_FragColor = vec4(c * fade * uOpacity, 1.0);
  #include <colorspace_fragment>
}`;

export const GLOBE_VERT = /* glsl */ `
varying vec2 vUv; varying vec3 vW; varying vec3 vNg; varying vec3 vE; varying vec3 vNo;
void main() {
  vUv = uv;
  vec3 p = normalize(position);
  vec3 e = cross(vec3(0.0, 1.0, 0.0), p); float el = length(e); e = el > 1e-5 ? e / el : vec3(1.0, 0.0, 0.0);
  vec3 n = cross(p, e);                                              // local east, north and up of the sphere
  mat3 m = mat3(modelMatrix);
  vNg = normalize(m * p); vE = normalize(m * e); vNo = normalize(m * n);
  vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

export const EARTH_FRAG = /* glsl */ `
uniform sampler2D uDay; uniform sampler2D uNight; uniform sampler2D uClouds; uniform sampler2D uOcean;
uniform float uExtra; uniform float uCloudShift; uniform float uOpacity;
varying vec2 vUv; varying vec3 vW; varying vec3 vNg; varying vec3 vE; varying vec3 vNo;
void main() {
  vec3 N = normalize(vNg), L = normalize(-vW), V = normalize(cameraPosition - vW);
  float NdL = dot(N, L), diff = max(NdL, 0.0), mu = max(dot(N, V), 0.0);
  vec3 day = texture2D(uDay, vUv).rgb;
  float clouds = uExtra * smoothstep(0.1, 0.92, texture2D(uClouds, vec2(vUv.x + uCloudShift, vUv.y)).r) * 0.88;
  float water = uExtra * texture2D(uOcean, vUv).r;
  float lights = uExtra * texture2D(uNight, vUv).r;
  vec3 sun = vec3(1.0, 0.97, 0.92) * 2.3;
  vec3 col = day * sun * diff;
  vec3 H = normalize(L + V);
  col += vec3(1.0, 0.88, 0.7) * pow(max(dot(N, H), 0.0), 110.0) * water * (1.0 - clouds) * smoothstep(0.0, 0.25, NdL) * 1.1; // sun glint on water
  col = mix(col, sun * (diff * 0.94 + 0.015), clouds);
  float night = 1.0 - smoothstep(-0.2, 0.05, NdL);
  col += vec3(1.0, 0.7, 0.36) * pow(lights, 1.15) * night * (1.0 - 0.7 * clouds) * 1.8;  // city lights
  float fres = pow(1.0 - mu, 2.4);
  vec3 sky = mix(vec3(0.85, 0.45, 0.28), vec3(0.32, 0.6, 1.0), smoothstep(0.0, 0.25, NdL));
  col = mix(col, sky * 1.2 * smoothstep(-0.1, 0.55, NdL), fres * 0.55);
  col += day * 0.01;
  gl_FragColor = vec4(col, uOpacity);
  ${TONE}
}`;

export const ROCKY_FRAG = /* glsl */ `
uniform sampler2D uMap; uniform sampler2D uNormal;
uniform float uHasNormal; uniform float uNormalScale; uniform float uLS; uniform float uGain; uniform float uOpacity; uniform vec3 uHaze;
varying vec2 vUv; varying vec3 vW; varying vec3 vNg; varying vec3 vE; varying vec3 vNo;
void main() {
  vec3 Ng = normalize(vNg), E = normalize(vE), No = normalize(vNo);
  vec3 tn = texture2D(uNormal, vUv).xyz * 2.0 - 1.0;
  vec3 Nb = normalize((tn.x * E + tn.y * No) * uNormalScale + max(tn.z, 0.05) * Ng);
  vec3 N = normalize(mix(Ng, Nb, uHasNormal));
  vec3 L = normalize(-vW), V = normalize(cameraPosition - vW);
  float mu0 = max(dot(N, L), 0.0), mu = max(dot(Ng, V), 0.0);
  float ls = 2.0 * mu0 / (mu0 + mu + 1e-4);                          // Lommel–Seeliger
  float shade = mix(mu0, ls, uLS) * smoothstep(-0.03, 0.07, dot(Ng, L));
  vec3 col = texture2D(uMap, vUv).rgb * shade * uGain;
  col += uHaze * pow(1.0 - mu, 3.0) * smoothstep(-0.15, 0.5, dot(Ng, L));
  gl_FragColor = vec4(col, uOpacity);
  ${TONE}
}`;

export const ATMO_VERT = /* glsl */ `
varying vec3 vN; varying vec3 vW;
void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal); gl_Position = projectionMatrix * viewMatrix * wp; }`;

export const ATMO_FRAG = /* glsl */ `
uniform vec3 uColor; uniform vec3 uTwilight; uniform float uK; uniform float uEdge;
varying vec3 vN; varying vec3 vW;
void main() {
  vec3 N = normalize(vN), V = normalize(cameraPosition - vW), L = normalize(-vW);
  float t = clamp(-dot(N, V) / uEdge, 0.0, 1.0);                     // 0 at the outer edge of the shell, 1 at the limb
  float NdL = dot(N, L);
  vec3 c = mix(uTwilight, uColor, smoothstep(0.0, 0.3, NdL));
  gl_FragColor = vec4(c * pow(t, 1.7) * smoothstep(-0.12, 0.4, NdL) * uK, 1.0);
  #include <colorspace_fragment>
}`;

export const STAR_VERT = /* glsl */ `
attribute float aSize; attribute float aGain;
uniform float uDpr; varying float vGain; varying vec3 vCol;
void main() { vGain = aGain; vCol = color; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uDpr; }`;

export const STAR_FRAG = /* glsl */ `
varying float vGain; varying vec3 vCol;
void main() { float r = length(gl_PointCoord - 0.5); gl_FragColor = vec4(vCol * vGain * smoothstep(0.5, 0.05, r), 1.0); }`;
