/**
 * Created by dannyd1221 on 3/11/2017.
 */
class LightPost {
    constructor(gl){
        var cylX = -0.7;
        var cylY = -0.7;
        var cylZ = 0;
        var radiusBottom = 0.2;
        var radiusTop = 0.2;
        var height = 0.5;
        var div = 50;
        var stacks = 200;

        this.truncone = new TruncCone(gl, .1, .1, 1, div, stacks);
        this.cylTrans = mat4.create();
        mat4.translate(this.cylTrans, this.cylTrans, vec3.fromValues(0.8, -0.5, 0));
        mat4.scale(this.cylTrans, this.cylTrans, vec3.fromValues(0.25, 0.25, .6));

        this.base = new TruncCone(gl, .3, .1, .2, div, stacks);
        this.baseTrans = mat4.create();
        mat4.translate(this.baseTrans, this.baseTrans, vec3.fromValues(0.8, -0.5, 0));
        mat4.scale(this.baseTrans, this.baseTrans, vec3.fromValues(0.25, 0.25, .6));
        //mat4.rotateX(this.cone2Trans, this.cone2Trans, -(Math.PI/2));

        this.top = new TruncCone(gl, .3, .1, .2, div, stacks);
        this.topTrans = mat4.create();
        mat4.translate(this.topTrans, this.topTrans, vec3.fromValues(0.8, -0.5, .75));
        mat4.scale(this.topTrans, this.topTrans, vec3.fromValues(0.25, 0.25, .6));
        //mat4.rotateX(this.cone2Trans, this.cone2Trans, -(Math.PI/2));

        this.bottom = new TruncCone(gl, .3, .1, .2, div, stacks);
        this.botTrans = mat4.create();
        mat4.translate(this.botTrans, this.botTrans, vec3.fromValues(0.8, -0.5, .65));
        mat4.scale(this.botTrans, this.botTrans, vec3.fromValues(0.25, 0.25, .6));
        mat4.rotateX(this.botTrans, this.botTrans, -Math.PI);

        let yellow = vec3.fromValues(1.0, 1.0, 0.0);
        this.pointLight = new UniSphere(gl, .09, 7, yellow, yellow);
        this.lightTrans = mat4.create();
        mat4.translate(this.lightTrans, this.lightTrans, vec3.fromValues(0.8, -0.5, .7));

        this.tmp = mat4.create();

    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame){
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.cylTrans);
        gl.uniform3fv(objTintUnif, vec3.fromValues((75/256), (75/256), (75/256)));
        this.truncone.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.baseTrans);
        gl.uniform3fv(objTintUnif, vec3.fromValues((75/256), (75/256), (75/256)));
        this.base.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.topTrans);
        gl.uniform3fv(objTintUnif, vec3.fromValues((75/256), (75/256), (75/256)));
        this.top.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.botTrans);
        gl.uniform3fv(objTintUnif, vec3.fromValues((75/256), (75/256), (75/256)));
        this.bottom.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.lightTrans);
        gl.uniform3fv(objTintUnif, vec3.fromValues((255/256), (255/256), (51/256)));
        this.pointLight.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}