/**
 * Created by Hans Dulimarta on 2/1/17.
 */
class TruncCone extends GeometricObject{
    /**
     * Create a 3D cone with tip at the Z+ axis and base on the XY plane
     * @param {Object} gl             the current WebGL context
     * @param {Number} radiusBottom   radius of the cone base
     * @param {Number} radiusTop      radius of the cone top
     * @param {Number} height         height of the cone
     * @param {Number} div         number of radial division of the cone base
     * @param {vec3}   col1           color #1 to use
     * @param {vec3}   col2           color #2 to use
     */
    constructor (gl, radiusBottom, radiusTop, height, div, stacks = 1, col1, col2) {
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

        /* Instead of allocating two separate JS arrays (one for position and one for color),
         in the following loop we pack both position and color
         so each tuple (x,y,z,r,g,b) describes the properties of a vertex
         */
        for(let i = 0; i <= stacks; i ++) {
            let stackHeight = height * (i/stacks);
            let stackRadius = radiusBottom - (i * ((radiusBottom - radiusTop) / stacks));
            if(i === 0 || i === stacks) {
                this.vertices.push(0, 0, stackHeight);
                //vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
                //this.vertices.push(randColor[0], randColor[1], randColor[2]);
            }

            for (let k = 0; k < div; k++) {
                let angle = k * 2 * Math.PI / div;
                let x = stackRadius * Math.cos (angle);
                let y = stackRadius * Math.sin (angle);

                /* the first three floats are 3D (x,y,z) position */
                this.vertices.push (x, y, stackHeight);

                vec3.set(n1, -Math.sin(angle), Math.cos(angle), 0);
                vec3.set(n2, -Math.sin(angle) * Math.cos(angle), -Math.sin(angle) * Math.sin(angle), Math.cos(angle));

                vec3.cross (norm, n1, n2);
                vec3.normalize(norm, norm);

                //this.vertices.push (norm[0], norm[1], norm[2]);

                normalLines.push(x, y, stackHeight, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
                normalLines.push (
                    x + this.NORMAL_SCALE * norm[0],
                    y + this.NORMAL_SCALE * norm[1],
                    stackHeight + this.NORMAL_SCALE * norm[2], 1, 1, 1);

                //vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
                /* the next three floats are RGB */
                //this.vertices.push(randColor[0], randColor[1], randColor[2]);
            }
        }

        this.normalCount = 2 * div;

        this.nbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(normalLines), gl.STATIC_DRAW);

        /* copy the (x,y,z,r,g,b) sixtuplet into GPU buffer */
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.vertices), gl.STATIC_DRAW);

        this.indices = [];

        let bottomIndex = [];
        bottomIndex.push(0);
        //generate bottom of stack
        for(let j = div; j >= 1; j--) {
            bottomIndex.push(j);
        }
        bottomIndex.push(div);

        this.bottomIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bottomIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(bottomIndex), gl.STATIC_DRAW);

        this.indices.push({"primitive": gl.TRIANGLE_FAN, "buffer": this.bottomIdxBuff, "numPoints": bottomIndex.length});

        //generate top of stack
        let topIndex = [];
        topIndex.push((stacks * div) + 1);
        for(let j = 2; j < div + 2; j++) {
            topIndex.push(j + (stacks * div));
        }
        topIndex.push((stacks * div) + 2);

        this.topIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.topIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(topIndex), gl.STATIC_DRAW);

        //generate side of stacks
        for(let i = 0; i < stacks; i++) {
            let sideIndex = [];
            for(let j = 1; j <= div; j++) {
                let nextLevel = ((i  + 1) * div) + j;
                let currentLevel = (i * div) + j;

                if(i === stacks - 1) {
                    nextLevel++;
                }
                sideIndex.push(nextLevel, currentLevel);
            }

            let nextLevelLast = ((i  + 1) * div) + 1;
            let currentLevelLast = (i * div) + 1;

            if(i === stacks - 1) {
                nextLevelLast++;
            }

            sideIndex.push(nextLevelLast, currentLevelLast);

            this.sideIdxBuff = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sideIdxBuff);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(sideIndex), gl.STATIC_DRAW);
            this.indices.push({"primitive": gl.LINE_STRIP, "buffer": this.sideIdxBuff, "numPoints": sideIndex.length});
        }

        this.indices.push({"primitive": gl.TRIANGLE_FAN, "buffer": this.topIdxBuff, "numPoints": topIndex.length});
    }

}