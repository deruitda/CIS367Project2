/**
 * Created by dannyd1221 on 3/11/2017.
 */
class Tree {
    constructor(gl, treeX, treeY, treeZ){
        var cylX = -0.7;
        var cylY = -0.7;
        var cylZ = 0;
        var radiusBottom = 0.2;
        var radiusTop = 0.2;
        var height = 0.5;
        var div = 50;
        var stacks = 200;

        var brown1 = vec3.fromValues(0.35, 0.164706, 0.164706);
        var brown2 = vec3.fromValues(0.5, 0.164706, 0.164706);
        this.truncone = new TruncCone(gl, radiusBottom, radiusTop, height, div, stacks, brown1, brown2);
        this.cylTrans = mat4.create();
        mat4.translate(this.cylTrans, this.cylTrans, vec3.fromValues(treeX, treeY, treeZ));
        mat4.scale(this.cylTrans, this.cylTrans, vec3.fromValues(0.25, 0.25, .6));

        var green1 = vec3.fromValues(0.184314, 0.309804, 0.184314);
        var green2 = vec3.fromValues(0.184314, 0.54, 0.184314);
        this.cone1 = new Cone(gl, 0.3, 0.5, 100, stacks, green1, green2);
        this.cone1Trans = mat4.create();
        mat4.translate(this.cone1Trans, this.cone1Trans, vec3.fromValues(treeX, treeY, treeZ+.2));
        mat4.scale(this.cone1Trans, this.cone1Trans, vec3.fromValues(0.9, .9, 1));
        //mat4.rotateX(this.cone1Trans, this.cone1Trans, -(Math.PI/2));

        this.cone2 = new Cone(gl, 0.3, 0.5, 100, stacks, green1, green2);
        this.cone2Trans = mat4.create();
        mat4.translate(this.cone2Trans, this.cone2Trans, vec3.fromValues(treeX, treeY, treeZ+.4));
        mat4.scale(this.cone2Trans, this.cone2Trans, vec3.fromValues(0.8, .8, 1));
        //mat4.rotateX(this.cone2Trans, this.cone2Trans, -(Math.PI/2));
        this.tmp = mat4.create();

    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame){
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.cylTrans);
        gl.uniform3fv(objTintUnif, vec3.fromValues((102/256), (51/256), (0/256)));
        this.truncone.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.cone1Trans);
        gl.uniform3fv(objTintUnif, vec3.fromValues((4/256), (100/256), (0/256)));
        this.cone1.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.cone2Trans);
        gl.uniform3fv(objTintUnif, vec3.fromValues((4/256), (143/256), (0/256)));
        this.cone2.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}