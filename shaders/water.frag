uniform vec3      iResolution;     // viewport resolution (in pixels)
uniform float     iGlobalTime;     // shader playback time (in seconds)
uniform float     iChannelTime[4]; // channel playback time (in seconds)
uniform vec4      iMouse;          // mouse pixel coords. xy: current (if MLB down), zw: click
uniform samplerXX iChannel0..3;    // input channel. XX = 2D/Cube
uniform vec4      iDate;           // (year, month, day, time in seconds)

// Simple Water shader. (c) Victor Korsun, bitekas@gmail.com; 2012.
//
// Attribution-ShareAlike CC License.

#ifdef GL_ES
precision highp float;
#endif

const float PI = 3.1415926535897932;

// play with these parameters to custimize the effect
// ===================================================

//speed
const float speed = 0.2;
const float speed_x = 0.3;
const float speed_y = 0.3;

// refraction
const float emboss = 0.47;
const float intensity = 4.4;
const int steps = 8;
const float frequency = 6.0;
const int angle = 7; // better when a prime

// reflection
const float delta = 60.;
const float intence = 700.;

const float reflectionCutOff = 0.012;
const float reflectionIntence = 200000.;

// ===================================================

float time = iGlobalTime;

  float col(vec2 coord)
  {
    float delta_theta = 2.0 * PI / float(angle);
    float col = 0.0;
    float theta = 0.0;
    for (int i = 0; i < steps; i++)
    {
      vec2 adjc = coord;
      theta = delta_theta*float(i);
      adjc.x += cos(theta)*time*speed + time * speed_x;
      adjc.y -= sin(theta)*time*speed - time * speed_y;
      col = col + cos( (adjc.x*cos(theta) - adjc.y*sin(theta))*frequency)*intensity;
    }

    return cos(col);
  }

//---------- main

void main(void)
{
vec2 p = (gl_FragCoord.xy) / iResolution.xy, c1 = p, c2 = p;
float cc1 = col(c1);

c2.x += iResolution.x/delta;
float dx = emboss*(cc1-col(c2))/delta;

c2.x = p.x;
c2.y += iResolution.y/delta;
float dy = emboss*(cc1-col(c2))/delta;

c1.x += dx*2.;
c1.y = -(c1.y+dy*2.);

float alpha = 1.+dot(dx,dy)*intence;

float ddx = dx - reflectionCutOff;
float ddy = dy - reflectionCutOff;
if (ddx > 0. && ddy > 0.)
	alpha = pow(alpha, ddx*ddy*reflectionIntence);

vec4 col = texture2D(iChannel0,c1)*(alpha);
gl_FragColor = col;
}