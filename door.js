/**
 * Created by dannyd1221 on 3/6/2017.
 */
class Door {
    constructor(gl){

        var white = vec3.fromValues(.8, .8, .8);

        this.cube = new Cube(gl,.5, 20, white, white);
        this.cubeScale = mat4.create();
        mat4.scale(this.cubeScale, this.cubeScale, vec3.fromValues(0.1, 0.8, .35));

        var grey1 = vec3.fromValues(0.329412, 0.329412, 0.45);
        this.sphere = new Sphere(gl, .1, 100, 100, grey1, grey1);
        this.sphereTrans = mat4.create();
        mat4.scale(this.sphereTrans, this.sphereTrans, vec3.fromValues(.15, .15, .15));
        mat4.translate(this.sphereTrans, this.sphereTrans, vec3.fromValues(-.2, 0, .4))


        this.tmp = mat4.create();
    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame){
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.cubeScale);
        gl.uniform3fv(objTintUnif, vec3.fromValues((255/256), (77/256), (77/256)));
        this.cube.draw(vertexAttr, colorAttr, modelUniform, this.tmp);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.sphereTrans);
        gl.uniform3fv(objTintUnif, vec3.fromValues(1, 1, 1));
        this.sphere.draw(vertexAttr, colorAttr, modelUniform, this.tmp);


    }
}