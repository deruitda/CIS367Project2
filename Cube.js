class Cube extends GeometricObject {
    constructor(gl, size, div, col1, col2) {
        super(gl);
        this.temp = mat4.create();
        this.coordFrame = mat4.create();
        this.NORMAL_SCALE = 0.2;
        this.normalCount = 0;


        /* if colors are undefined, generate random colors */
        if (typeof col1 === "undefined") col1 = vec4.fromValues(Math.random(), Math.random(), Math.random(), 1);
        if (typeof col2 === "undefined") col2 = vec4.fromValues(Math.random(), Math.random(), Math.random(), 1);
        let transparency = col1[3] || 1;

        let primitive1 = gl.TRIANGLE_STRIP;

        //let randColor = vec3.create();
        let randColor = vec3.fromValues(1, 1, 1);
        let vertices = [];
        let normalLines = [];

        this.vbuff = gl.createBuffer();

        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */

        let halfSize = size / 2;
        let vertsPerFace = (div + 1) * (div + 1);
        let segmentLength = size / div;

        let faceTable = [];

        // Generate 3D points for the first face
        let firstFaceVertices = [];
        let faceVertices = [];
        for (let j = 0; j <= div; j++) {
            for (let k = 0; k <= div; k++) {
                let x = (segmentLength * k) - halfSize;
                let y = (segmentLength * (div - j)) - halfSize;

                let point = vec3.fromValues(x, y, halfSize);
                firstFaceVertices.push(point);
            }
        }


        // Now create the other 5 faces with these dimensions,
        // rotated to their correct face position

        let origin = vec3.create();
        let normalVector = vec3.fromValues(0, 0, 1);

        // Rotate around the Y axis for the 3 latitudinal sides
        for (let i = 0; i < 4; i++) {
            firstFaceVertices.forEach((vertex) => {
                let p = vec3.rotateY(vec3.create(), vertex, origin, i * (Math.PI / 2));
                faceVertices.push(p[0], p[1], p[2]);

                faceVertices.push(normalVector[0], normalVector[1], normalVector[2]);

                normalLines.push(p[0], p[1], p[2], 1, 1, 1);
                /* (x,y,z)   (r,g,b) */
                normalLines.push(
                    p[0] + this.NORMAL_SCALE * normalVector[0],
                    p[1] + this.NORMAL_SCALE * normalVector[1],
                    p[2] + this.NORMAL_SCALE * normalVector[2], 1, 1, 1);

                this.normalCount += 1;

            });
            vec3.rotateY(normalVector, normalVector, origin, Math.PI / 2);
        }

        normalVector = vec3.fromValues(0, -1, 0);
        // Rotate around the X axis for the remaining 2 longitudinal sides
        for (let i = 0; i < 2; i++) {
            firstFaceVertices.forEach((vertex) => {
                let negativeModifier = i % 2 == 0 ? 1 : -1;
                let p = vec3.rotateX(vec3.create(), vertex, origin, negativeModifier * (Math.PI / 2));
                faceVertices.push(p[0], p[1], p[2]);

                faceVertices.push(normalVector[0], normalVector[1], normalVector[2]);

                normalLines.push(p[0], p[1], p[2], 1, 1, 1);
                /* (x,y,z)   (r,g,b) */
                normalLines.push(
                    p[0] + this.NORMAL_SCALE * normalVector[0],
                    p[1] + this.NORMAL_SCALE * normalVector[1],
                    p[2] + this.NORMAL_SCALE * normalVector[2], 1, 1, 1);

                this.normalCount += 1;

            });
            vec3.rotateX(normalVector, normalVector, origin, Math.PI);
        }

        // Copy the (x,y,z,r,g,b) sixtuplet into GPU buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(faceVertices), gl.STATIC_DRAW);

        // Copy normal vectors into a buffer
        this.nbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(normalLines), gl.STATIC_DRAW);


        this.indices = [];

        // Push the points to build each face with
        // triangle strip

        for (let i = 0; i < 6; i++) {
            let startIndex = Math.pow(div + 1, 2) * i;

            for (let j = 0; j < div; j++) {
                let rowOffset = (j * div) + (1 * j);
                for (let k = 0; k < div; k++) {
                    let index = startIndex + rowOffset + k;
                    let nextRowIndex = index + div + 1;

                    let faceSquareIndex = [];

                    faceSquareIndex.push(index);
                    faceSquareIndex.push(nextRowIndex);
                    faceSquareIndex.push(index + 1);
                    faceSquareIndex.push(nextRowIndex + 1);

                    let faceIdxBuff = gl.createBuffer();
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, faceIdxBuff);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(faceSquareIndex), gl.STATIC_DRAW);

                    this.indices.push({
                        "primitive": primitive1,
                        "buffer": faceIdxBuff,
                        "numPoints": faceSquareIndex.length
                    });
                }
            }
        }


    }
}