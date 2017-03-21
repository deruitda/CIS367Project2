/**
 * Created by dannyd1221 on 3/11/2017.
 */
class Sun {
    constructor(gl){
        var sphereRad = 0.5;
        var latlines = 200;
        var longlines = 200;
        var sphereX = -0.7;
        var sphereY = 0.7;
        var sphereZ = 0;

        var yellow = vec3.fromValues(1.0, 1.0, 0.0);
        var orange = vec3.fromValues(1.0, 0.8, 0.0);
        this.sphere = new Sphere(gl, sphereRad, latlines, longlines, yellow, orange);
        this.sphereTrans = mat4.create();
        mat4.translate(this.sphereTrans, this.sphereTrans, vec3.fromValues(sphereX, sphereY, sphereZ));
        mat4.scale(this.sphereTrans, this.sphereTrans, vec3.fromValues(0.4, 0.4, .4));
        this.tmp = mat4.create();

    }

    draw(vertexAttr, colorAttr, modelUniform, coordFrame){
        gl.uniformMatrix4fv(modelUniform, false, coordFrame);

        this.tmp = mat4.create();
        mat4.mul(this.tmp, coordFrame, this.sphereTrans);
        this.sphere.draw(vertexAttr, colorAttr, modelUniform, this.tmp);
    }
}