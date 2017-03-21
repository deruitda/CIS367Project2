/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class Cone extends GeometricObject {
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl         the current WebGL context
     * @param {Number} radius     radius of the cone base
     * @param {Number} height     height of the cone
     * @param {Number} div        number of radial division of the cone base
     * @param {Number} stacks     number of vertical stacks the cone has
     * @param {vec3}   col1       color #1 to use
     * @param {vec3}   col2       color #2 to use
     */
    constructor (gl, radius, height, div, stacks, col1, col2) {
        super(gl);
        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        if (typeof col2 === "undefined") col2 = vec3.fromValues(Math.random(), Math.random(), Math.random());
        let randColor = vec3.create();
        this.vertices = [];
        var normalLines = [];
        var n1 = vec3.create();
        var n2 = vec3.create();
        var norm = vec3.create();

        this.vbuff = gl.createBuffer();

        this.vertices.push(0,0,height); /* tip of cone */
        vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        this.vertices.push(randColor[0], randColor[1], randColor[2]);


        // Generate each stack's circle
        for(let i = 1; i <= stacks; i++) {
            let curRadius = radius * (i/stacks);
            let stackHeight = height * ((stacks - i) / stacks);

            for (let k = 0; k < div; k++) {
                let angle = k * 2 * Math.PI / div;
                let x = curRadius * Math.cos (angle);
                let y = curRadius * Math.sin (angle);

                /* the first three floats are 3D (x,y,z) position */
                this.vertices.push (x, y, stackHeight); /* perimeter of base */

                vec3.set(n1, -Math.sin(angle), Math.cos(angle), 0);
                vec3.set(n2, -Math.sin(angle) * Math.cos(angle), -Math.sin(angle) * Math.sin(angle), Math.cos(angle));

                vec3.cross (norm, n1, n2);
                vec3.normalize(norm, norm);

                this.vertices.push (norm[0], norm[1], norm[2]);

                /* Use normalLines for rendering the normal vectors using LINES (useful for debugging) */
                normalLines.push(x, y, stackHeight, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
                normalLines.push (
                    x + this.NORMAL_SCALE * norm[0],
                    y + this.NORMAL_SCALE * norm[1],
                    stackHeight + this.NORMAL_SCALE * norm[2], 1, 1, 1);

                vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
                /* the next three floats are RGB */
                //this.vertices.push(randColor[0], randColor[1], randColor[2]);
            }
        }
        this.normalCount = 2 * div;

        this.nbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(normalLines), gl.STATIC_DRAW);

        this.vertices.push (0,0,0); /* center of base */
        vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        this.vertices.push(randColor[0], randColor[1], randColor[2]);

        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.vertices), gl.STATIC_DRAW);

        // Generate index order for bottom of cone
        let botIndex = [];
        let start = div * stacks;
        let end = start - (div) + 1;
        let centerPoint = start + 1;

        botIndex.push(centerPoint);

        for (let k = start; k >= end; k--) {
            botIndex.push(k);
        }

        botIndex.push(start);


        this.botIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.botIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(botIndex), gl.STATIC_DRAW);

        // Generate index order for top of cone
        let topIndex = [];
        topIndex.push(0);
        for (let k = 1; k <= div; k++)
            topIndex.push(k);
        topIndex.push(1);
        this.topIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(topIndex), gl.STATIC_DRAW);

        // Generate index order for each stack
        this.stacks = {};

        for(let i = 0; i < stacks - 1; i++) {
            let indexArray = [];
            let start = (div * i) + 1;
            let end = start + div;

            for (let k = start; k < end; k++) {
                indexArray.push(k);
                indexArray.push(div + k);
            }

            indexArray.push(start);
            indexArray.push(end);

            let buff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(indexArray), gl.STATIC_DRAW);

            this.stacks[i] = {
                "primitive": gl.LINE_STRIP,
                "buffer": buff,
                "numPoints": indexArray.length
            };
        }

        /* Put the indices as an array of objects. Each object has three attributes:
         primitive, buffer, and numPoints */

        this.indices = [
            {"primitive": gl.TRIANGLE_FAN, "buffer": this.topIdxBuff, "numPoints": topIndex.length},
            {"primitive": gl.TRIANGLE_FAN, "buffer": this.botIdxBuff, "numPoints": botIndex.length}
        ];

        Object.keys(this.stacks).forEach((k) => {
            this.indices.push(this.stacks[k]);
        });
    }

    /**
     * Draw the object
     * @param {Number} vertexAttr a handle to a vec3 attribute in the vertex shader for vertex xyz-position
     * @param {Number} colorAttr  a handle to a vec3 attribute in the vertex shader for vertex rgb-color
     * @param {Number} modelUniform a handle to a mat4 uniform in the shader for the coordinate frame of the model
     * @param {mat4} coordFrame a JS mat4 variable that holds the actual coordinate frame of the object
     */
    // draw(vertexAttr, colorAttr, modelUniform, coordFrame) {
    //     /* copy the coordinate frame matrix to the uniform memory in shader */
    //     gl.uniformMatrix4fv(modelUniform, false, coordFrame);
    //
    //     /* binder the (vertex+color) buffer */
    //     gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
    //
    //     /* with the "packed layout"  (x,y,z,r,g,b),
    //      the stride distance between one group to the next is 24 bytes */
    //     gl.vertexAttribPointer(vertexAttr, 3, gl.FLOAT, false, 24, 0); /* (x,y,z) begins at offset 0 */
    //     gl.vertexAttribPointer(colorAttr, 3, gl.FLOAT, false, 24, 12); /* (r,g,b) begins at offset 12 */
    //
    //     for (let k = 0; k < this.indices.length; k++) {
    //         let obj = this.indices[k];
    //         gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffer);
    //         gl.drawElements(obj.primitive, obj.numPoints, gl.UNSIGNED_SHORT, 0);
    //     }
    // }
}