/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class UniSphere {
    /**
     * Create a 3D sphere with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl      the current WebGL context
     * @param {Number} radius  radius of the sphere
     * @param {Number} subDiv number of recursive subdivisions
     * @param {vec3}   [col1]    color #1 to use
     * @param {vec3}   [col2]    color #2 to use
     */
    constructor (gl, RADIUS, subDiv, col1, col2) {

        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();

        this.RADIUS = RADIUS;
        this.vex = [];
        let seedA = vec3.fromValues(1, 1, 1);   // top: 0
        vec3.normalize(seedA, seedA);
        vec3.scale (seedA, seedA, RADIUS);
        let seedB = vec3.fromValues(-1, -1, 1);  // a:1
        vec3.normalize(seedB, seedB);
        vec3.scale (seedB, seedB, RADIUS);
        let seedC = vec3.fromValues(-1, 1, -1);  // b:2
        vec3.normalize(seedC, seedC);
        vec3.scale (seedC, seedC, RADIUS);
        let seedD = vec3.fromValues(1, -1, -1);  // c:3
        vec3.normalize(seedD, seedD);
        vec3.scale (seedD, seedD, RADIUS);

        this.vex.push(seedA, seedB, seedC, seedD);
        this.index = [];

        this.triang (subDiv, 0, 1, 3);
        this.triang (subDiv, 0, 3, 2);
        this.triang (subDiv, 0, 2, 1);
        this.triang (subDiv, 1, 2, 3);
        let vertices = [];
        for (let k = 0; k < this.vex.length; k++)
        {
            vertices.push(this.vex[k][0], this.vex[k][1], this.vex[k][2]);
            vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
            vertices.push(randColor[0], randColor[1], randColor[2]);
        }
        this.vbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        let ibuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(this.index), gl.STATIC_DRAW)
        this.indices = [{primitive: gl.TRIANGLES, buffer: ibuff, numPoints: this.index.length}];
    }

    triang (N, a, b, c) {
        if (N > 0) {
            let mid_ab = vec3.lerp(vec3.create(), this.vex[a], this.vex[b], 0.5);
            vec3.normalize(mid_ab, mid_ab);
            vec3.scale (mid_ab, mid_ab, this.RADIUS);
            let mid_ac = vec3.lerp(vec3.create(), this.vex[a], this.vex[c], 0.5);
            vec3.normalize(mid_ac, mid_ac);
            vec3.scale (mid_ac, mid_ac, this.RADIUS);
            let mid_bc = vec3.lerp(vec3.create(), this.vex[b], this.vex[c], 0.5);
            vec3.normalize(mid_bc, mid_bc);
            vec3.scale (mid_bc, mid_bc, this.RADIUS);
            this.vex.push(mid_ab);
            let n_ab = this.vex.length - 1;
            this.vex.push(mid_bc);
            let n_bc = this.vex.length - 1;
            this.vex.push(mid_ac);
            let n_ac = this.vex.length - 1;
            this.triang (N - 1, a, n_ab, n_ac);
            this.triang (N - 1, n_ab, b, n_bc);
            this.triang (N - 1, n_ac, n_bc, c);
            this.triang (N - 1, n_ab, n_bc, n_ac);
        } else {
            /* stop recursion */
            this.index.push(a, b, c);
        }
    }
    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
        /* copy the coordinate frame matrix to the uniform memory in shader */
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        /* binder the (vertex+color) buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);

        /* with the "packed layout"  (x,y,z,r,g,b),
         the stride distance between one group to the next is 24 bytes */
        gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
        gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */

        for (let k = 0; k < this.indices.length; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
        }
    }
}