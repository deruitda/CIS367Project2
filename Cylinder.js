/**
 * Created by Hans Dulimarta on 2/1/17.
 */
// Create a cylinder whose Z-axis as its axis of symmetry, base at Z=-h/2, top at Z=+h/2
class Cylinder extends GeometricObject {
    /* subDiv: number of subdivisions for the circle/cone base */
    constructor (gl, topRadius, botRadius, height, subDiv, col1, col2) {
        super(gl);
        if (typeof col1 === "undefined") col1 = vec3.fromValues(0xff/255, 0x59/255, 0x59/255);
        if (typeof col2 === "undefined") col2 = vec3.fromValues(0xFF/255, 0xC5/255, 0x6C/255);
        this.vertices = [];
        var normalLines = [];
        var n1 = vec3.create();
        var n2 = vec3.create();
        var norm = vec3.create();

        let randColor = vec3.create();
        this.vbuff = gl.createBuffer();

        /* create the top points */
        this.vertices.push(0,0,height/2);
        vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        this.vertices.push(randColor[0], randColor[1], randColor[2]);
        for (let k = 0; k < subDiv; k++) {
            let angle = k * 2 * Math.PI / subDiv;
            let x = topRadius * Math.cos (angle);
            let y = topRadius * Math.sin (angle);
            this.vertices.push (x, y, height/2); /* perimeter */

            vec3.set(n1, -Math.sin(angle), Math.cos(angle), 0);
            vec3.set(n2, -Math.sin(angle) * Math.cos(angle), -Math.sin(angle) * Math.sin(angle), Math.cos(angle));

            vec3.cross (norm, n1, n2);
            vec3.normalize(norm, norm);

            this.vertices.push (norm[0], norm[1], norm[2]);
            normalLines.push(x, y, height, 1, 1, 1);  /* (x,y,z)   (r,g,b) */
            normalLines.push (
                x + this.NORMAL_SCALE * norm[0],
                y + this.NORMAL_SCALE * norm[1],
                height + this.NORMAL_SCALE * norm[2], 1, 1, 1);
            //vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
            //this.vertices.push(randColor[0], randColor[1], randColor[2]);
        }

        this.normalCount = 2 * subDiv;
        /* create the bottom points */
        this.vertices.push(0,0, -height/2);
        vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
        this.vertices.push(randColor[0], randColor[1], randColor[2]);
        for (let k = 0; k < subDiv; k++) {
            let angle = k * 2 * Math.PI / subDiv;
            let x = botRadius * Math.cos (angle);
            let y = botRadius * Math.sin (angle);
            this.vertices.push (x, y, -height/2); /* perimeter */
            vec3.lerp (randColor, col1, col2, Math.random()); /* linear interpolation between two colors */
            this.vertices.push(randColor[0], randColor[1], randColor[2]);
        }

        this.nbuff = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.nbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(normalLines), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbuff);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(this.vertices), gl.STATIC_DRAW);

        // Generate index for top circle
        let topIndex = [];
        topIndex.push(0);
        for (let k = 1; k <= subDiv; k++)
            topIndex.push(k);
        topIndex.push(1);
        let topIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, topIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(topIndex), gl.STATIC_DRAW);

        // Generate index for bottom of cone
        let botIndex = [];
        botIndex.push(subDiv + 1);
        for (let k = 2*subDiv - 1; k >= subDiv + 2; k--)
            botIndex.push(k);
        botIndex.push(2*subDiv - 1);
        let botIdxBuff = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, botIdxBuff);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(botIndex), gl.STATIC_DRAW);

        // Generate index for the side
        let sideIndex = [];
        for (let k = 1; k <= subDiv; k++) {
            sideIndex.push (k, k + subDiv + 1);
        }
        sideIndex.push (1, subDiv + 2);
        let sideIdxBuf = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sideIdxBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, Uint16Array.from(sideIndex), gl.STATIC_DRAW);

        /* Put the indices as an array of objects */
        this.indices = [
            {"primitive": gl.TRIANGLE_FAN, "buffer": topIdxBuff, "numPoints": topIndex.length},
            {"primitive": gl.TRIANGLE_FAN, "buffer": botIdxBuff, "numPoints": botIndex.length},
            {"primitive": gl.TRIANGLE_STRIP, "buffer": sideIdxBuf, "numPoints": sideIndex.length}
        ];
    }

    // getData() {
    //   return {"vertex" : this.vbuff,
    //           "index"  : this.indices};   /* this field is actually an array */
    // }
}