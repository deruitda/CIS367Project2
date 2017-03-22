/**
 * Created by dannyd1221 on 3/6/2017.
 */
class House {
    constructor(gl){
        var coneX = 1.22;
        var coneY = .55;
        var coneZ = 0;
        var size = .9;
        var subDiv =20;
        var size = .9;
        var subDiv =20;
        var coneheight = .6;
        var coneRad = .5;
        var coneDiv = 4;
        var coneStax = 1000;
        var cubeX = 1.7;
        var cubeY = 0.5;
        var cubeZ = 0;

        var grey1 = vec3.fromValues(0.329412, 0.329412, 0.45);
        var grey2 = vec3.fromValues(0.329412, 0.329412, 0.329412);
        this.cone = new Cone(gl, coneRad,coneheight, coneDiv, coneStax, grey1, grey2);
        this.coneTrans = mat4.create();
        mat4.scale(this.coneTrans, this.coneTrans, vec3.fromValues(1.25, 1, 1.35));
        mat4.translate(this.coneTrans, this.coneTrans, vec3.fromValues(coneX, coneY, coneZ));
        mat4.rotateX(this.coneTrans, this.coneTrans, -(Math.PI/2));
        mat4.rotateZ(this.coneTrans, this.coneTrans, -(Math.PI/4));

        var cream1 = vec3.fromValues(0.623529, 0.623529, 0.372549);
        var cream2 = vec3.fromValues(0.68, 0.623529, 0.372549);
        this.cube = new Cube(gl,size, subDiv, cream1, cream2);
        this.cubeScale = mat4.create();
        mat4.scale(this.cubeScale, this.cubeScale, vec3.fromValues(0.9, 0.6, 1));
        mat4.translate(this.cubeScale, this.cubeScale, vec3.fromValues(cubeX, cubeY, cubeZ))
        this.tmp = mat4.create();
    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame){
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.cubeScale);
        this.cube.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.coneTrans);
        this.cone.draw(vertexAttr, colorAttr, modelUniform, this.tmp);


    }
}