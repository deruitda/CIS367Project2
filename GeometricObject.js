/**
 * Created by Hans Dulimarta on 2/24/17.
 */
class GeometricObject {
    constructor(gl) {
        this.NORMAL_SCALE = 0.3;
    }

    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    draw (vertexAttr, colorAttr, modelUniform, coordFrame) {
        /* copy the coordinate frame matrix to the uniform memory in shader */
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        /* binder the (vertex+color) buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);

        /* with the "packed layout"  (x,y,z,r,g,b),
         the stride distance between one group to the next is 24 bytes */
        gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12);

        for (let k = 0; k < this.indices.length; k++) {
            let obj = this.indices[k];
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
            gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
        }
    }

    drawNormal (vertexAttr, colorAttr, modelUniform, coordFrame) {
        if (this.normalCount > 0) {
            gl.uniformMatrix4fv(modelUniform, false, coordFrame);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
            gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12);
            gl.drawArrays(gl.LINES, 0, this.normalCount/2);
        }
    }

    /**
     * Draw vectors for each vertex point to a target point specified in the world coordinate frame
     *
     * @param gl
     * @param target the target point specified in the world coordinate frame
     * @param vertexAttr
     * @param colorAttr
     * @param modelUniform
     * @param coordFrame
     */
    drawVectorsTo (gl, target, vertexAttr, colorAttr, modelUniform, coordFrame) {
        let N = this.vertices.length / 6;
        let vtx = [];
        var tmp = vec3.create();
        /* Turn endPoint into homogeneous coordinate */
        let endPoint = vec4.fromValues(target[0], target[1], target[2], 1);
        /* Need to use the inverse matrix to calculate to endPoint with respect to coordFrame */
        let inverseCF = mat4.invert (mat4.create(), coordFrame);
        /* thisEndPoint is coordinate of target w.r.t coordFrame */
        let thisEndPoint = vec4.transformMat4 (vec4.create(), endPoint, inverseCF);
        for (let k = 0; k < N; k++) {
            let thisPoint = vec3.fromValues(this.vertices[6*k], this.vertices[6*k+1], this.vertices[6*k+2]);
            vtx.push (thisPoint[0], thisPoint[1], thisPoint[2]);
            vtx.push (1, 1, 0); /* yellow */
            vec3.subtract (tmp, thisEndPoint, thisPoint);    // tmp = endPoint - thisPoint
            vec3.normalize (tmp, tmp);
            vec3.scaleAndAdd(tmp, thisPoint, tmp, this.NORMAL_SCALE); // tmp = thisPoint + s * tmp
            vtx.push(tmp[0], tmp[1], tmp[2]);
            vtx.push(1, 1, 0);
        }
        let buff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vtx), gl.STATIC_DRAW);

        gl.uniformMatrix4fv(modelUniform, false, coordFrame);
        gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12);
        gl.drawArrays(gl.LINES, 0, 2*N);
        gl.deleteBuffer(buff);
    }
}