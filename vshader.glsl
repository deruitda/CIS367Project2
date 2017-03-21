attribute vec3 vertexPos;
attribute vec3 vertexCol;
attribute vec3 vertexNormal;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 modelCF;
uniform mat3 normalMat;

uniform vec3 lightPosWorld;
uniform float diffuseCoeff;
uniform float ambientCoeff;
uniform float specularCoeff;
uniform float shininess;
uniform vec3 objectTint;
uniform bool useLighting;
uniform bvec3 isEnabled; // isEnabled: {ambient, diffuse, specular}

/* varying variables are passed from vertex shader to fragment shader */
varying vec4 varColor;

void main() {
    gl_PointSize = 4.0;

    /* calculate vertex position and light position w.r.t eye/camera
     * coordindate frame */
    vec4 vertexPosInEye = view * modelCF * vec4(vertexPos, 1);
    vec4 lightPosInEye = view * vec4 (lightPosWorld, 1);
    gl_Position = projection * vertexPosInEye;
    if (useLighting) {
        /* the vector to light source must be calculated from
         * the transformed position, because vertexPos is specified
         * in the object coordinate frame */
        vec3 color = vec3 (0, 0, 0);
        vec3 lightVecInEye = normalize(vec3(lightPosInEye - vertexPosInEye));
        vec3 normalInEye = normalize(normalMat * vertexNormal);
        if (isEnabled[0])
           color += ambientCoeff * objectTint;
        if (isEnabled[1]) { /* calculate diffuse component */
          /* calculate diffuse reflection */
          float diffuse = clamp (dot(lightVecInEye, normalInEye), 0.0, 1.0);
          color += diffuse * diffuseCoeff * objectTint;
        }
        if (isEnabled[2]) { /* calculate specular component */
          // Using eye-based calculation, the viewer is now at (0, 0, 0)
          vec3 viewVec = normalize(-vertexPosInEye.xyz);
          /* The first arg to GLSL reflect() is the INCIDENT vector
             (i.e. from light to surface point), but our lightVec is
             from surface point to light */
          vec3 reflectVec = reflect (-lightVecInEye, normalInEye);
          float specular = clamp (dot(viewVec, reflectVec), 0.0, 1.0);

          /* assume white specular highlight */
          color += pow(specular, shininess) * specularCoeff * vec3 (1,1,1);
        }
        varColor = vec4(color, 1);
    } else {
        varColor = vec4 (vertexCol, 1);
    }
}