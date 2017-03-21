/**
 * Created by Isaac Smith on 2/12/2017.
 */
class Sphere {
    /**
     * Create a 3D Sphere with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl             the current WebGL context
     * @param {Number} radius         radius of the circle
     * @param {Number} LatLines       Number of latitude lines to be drawn
     * @param {Number} LongLines      Number of longitude lines to be drawn
     * @param {vec3}   col1           color #1 to use
     * @param {vec3}   col2           color #2 to use
     */
    constructor (gl, radius, latLines = 30, longLines = 30, col1, col2) {
        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        let vertices = [];
        this.vbuff = gl.createBuffer();


        for(let i = 0; i <= latLines; i ++) {
            let theta = i * Math.PI / latLines;
            let sinTheta = Math.sin(theta);
            let cosTheta = Math.cos(theta);

            for (let k = 0; k <= longLines; k++) {
                let phi = k * 2 * Math.PI / longLines;
                let sinPhi = Math.sin(phi);
                let cosPhi = Math.cos(phi);


                let x = cosPhi * sinTheta;
                let y = cosTheta;
                let z = sinPhi * sinTheta;

                vertices.push (radius * x, radius * y, radius * z);
                vec3.lerp (randColor, col1, col2, Math.random());
                vertices.push(randColor[0], randColor[1], randColor[2]);
            }
        }

        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

        this.indices = [];

        let index = [];
        //generate side of stacks
        for(let i = 0; i < latLines; i ++) {
            for(let j = 0; j < longLines; j++) {
                let first = (i * (longLines + 1)) + j;
                let second = first + longLines + 1;
                index.push(first, second, first + 1);
                index.push(second, second + 1, first + 1);
            }
        }

        this.idxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.idxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(index), gl.STATIC_DRAW);
        this.indices.push({"primitive": gl.LINE_STRIP, "buffer": this.idxBuff, "numPoints": index.length});
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