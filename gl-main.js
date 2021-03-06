/**
 * Created by Hans Dulimarta on 1/31/17.
 */

let gl;
let glCanvas;
let orthoProjMat, persProjMat, viewMat, viewMatInverse, topViewMat,topViewMatInverse, normalMat;
let ringCF, lightCF, eyePos, treeCF, treeCF2, houseCF, lightpostCF;
let axisBuff, tmpMat;

/* Vertex shader attribute letiables */
let posAttr, colAttr, normalAttr;

/* Shader uniform letiables */
let projUnif, viewUnif, modelUnif, lightPosUnif;
let objAmbientUnif, objTintUnif, normalUnif, isEnabledUnif;
let ambCoeffUnif, diffCoeffUnif, specCoeffUnif, shininessUnif;
let lightPos, useLightingUnif;
const IDENTITY = mat4.create();
let timestamp;
let lineBuff, normBuff, pointLight;
let tree, tree2, house, lightpost, grass;
let isChopped;
let isMoving;
let houseneedrot = true;
let angular_speed_tree = 15;
let tranSpeed = .05;
let shaderProg, redrawNeeded, showNormal, showLightVectors;
let lightingComponentEnabled = [true, true, true];
let chosenObj;

function main() {

    chosenObj =  document.getElementById("objects");
    chosenObj = chosenObj.options[chosenObj.selectedIndex].value;
    glCanvas = document.getElementById("gl-canvas");
    document.onkeydown = checkKey;
    isMoving = false;

    let ambientCheckBox = document.getElementById("enableAmbient");
    ambientCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[0] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let diffuseCheckBox = document.getElementById("enableDiffuse");
    diffuseCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[1] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let specularCheckBox = document.getElementById("enableSpecular");
    specularCheckBox.addEventListener('change', ev => {
        lightingComponentEnabled[2] = ev.target.checked;
        gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
        redrawNeeded = true;
    }, false);
    let ambCoeffSlider = document.getElementById("amb-coeff");
    ambCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(ambCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    ambCoeffSlider.value = Math.random() * 0.2;
    let diffCoeffSlider = document.getElementById("diff-coeff");
    diffCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(diffCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    diffCoeffSlider.value = 0.5 + 0.5 * Math.random();  // random in [0.5, 1.0]
    let specCoeffSlider = document.getElementById("spec-coeff");
    specCoeffSlider.addEventListener('input', ev => {
        gl.uniform1f(specCoeffUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    specCoeffSlider.value = Math.random();
    let shinySlider = document.getElementById("spec-shiny");
    shinySlider.addEventListener('input', ev => {
        gl.uniform1f(shininessUnif, ev.target.value);
        redrawNeeded = true;
    }, false);
    shinySlider.value = Math.floor(1 + Math.random() * shinySlider.max);

    let lightxslider = document.getElementById("lightx");
    let lightyslider = document.getElementById("lighty");
    let lightzslider = document.getElementById("lightz");
    lightxslider.addEventListener('input', lightPosChanged, false);
    lightyslider.addEventListener('input', lightPosChanged, false);
    lightzslider.addEventListener('input', lightPosChanged, false);

    let eyexslider = document.getElementById("eyex");
    let eyeyslider = document.getElementById("eyey");
    let eyezslider = document.getElementById("eyez");
    eyexslider.addEventListener('input', eyePosChanged, false);
    eyeyslider.addEventListener('input', eyePosChanged, false);
    eyezslider.addEventListener('input', eyePosChanged, false);

    gl = WebGLUtils.setupWebGL(glCanvas, null);
    window.addEventListener("resize", resizeHandler, false);
    ShaderUtils.loadFromFile(gl, "vshader.glsl", "fshader.glsl")
        .then (prog => {
            shaderProg = prog;
            gl.useProgram(prog);
            gl.clearColor((109/256), (159/256), (242/256), 1);
            gl.enable(gl.DEPTH_TEST);    /* enable hidden surface removal */
            gl.enable(gl.CULL_FACE);     /* cull back facing polygons */
            gl.cullFace(gl.BACK);
            axisBuff = gl.createBuffer();
            lineBuff = gl.createBuffer();
            normBuff = gl.createBuffer();
            posAttr = gl.getAttribLocation(prog, "vertexPos");
            colAttr = gl.getAttribLocation(prog, "vertexCol");
            normalAttr = gl.getAttribLocation(prog, "vertexNormal");
            lightPosUnif = gl.getUniformLocation(prog, "lightPosWorld");
            projUnif = gl.getUniformLocation(prog, "projection");
            viewUnif = gl.getUniformLocation(prog, "view");
            modelUnif = gl.getUniformLocation(prog, "modelCF");
            normalUnif = gl.getUniformLocation(prog, "normalMat");
            useLightingUnif = gl.getUniformLocation (prog, "useLighting");
            objTintUnif = gl.getUniformLocation(prog, "objectTint");
            ambCoeffUnif = gl.getUniformLocation(prog, "ambientCoeff");
            diffCoeffUnif = gl.getUniformLocation(prog, "diffuseCoeff");
            specCoeffUnif = gl.getUniformLocation(prog, "specularCoeff");
            shininessUnif = gl.getUniformLocation(prog, "shininess");
            isEnabledUnif = gl.getUniformLocation(prog, "isEnabled");
            /* Enable only posAttr here. In drawScene() we will selectively switch
             * between colorAttr and normalAttr, so we don't want to enable them now */
            gl.enableVertexAttribArray(posAttr);
            // gl.enableVertexAttribArray(colAttr);
            // gl.enableVertexAttribArray(normalAttr);

            orthoProjMat = mat4.create();
            persProjMat = mat4.create();
            viewMat = mat4.create();
            viewMatInverse = mat4.create();
            topViewMat = mat4.create();
            topViewMatInverse = mat4.create();
            ringCF = mat4.create();
            treeCF = mat4.create();
            treeCF2 = mat4.create();
            houseCF = mat4.create();
            grassCF = mat4.create();
            lightpostCF = mat4.create();
            normalMat = mat3.create();
            lightCF = mat4.create();
            tmpMat = mat4.create();
            eyePos = vec3.fromValues(-2.6, 2.5, 2.3);
            mat4.lookAt(viewMat,
                eyePos,
                vec3.fromValues(0, 0, 0), /* focal point */
                vec3.fromValues(0, 0, 1)); /* up */
            mat4.invert (viewMatInverse, viewMat);
            mat4.lookAt(topViewMat,
                vec3.fromValues(0,0,2),
                vec3.fromValues(0,0,0),
                vec3.fromValues(0,1,0)
            );
            mat4.invert (topViewMatInverse, topViewMat);
            gl.uniformMatrix4fv(modelUnif, false, IDENTITY);

            lightPos = vec3.fromValues(0, 2, 2);
            eyexslider.value = lightPos[0];
            eyeyslider.value = lightPos[1];
            eyezslider.value = lightPos[2];
            mat4.fromTranslation(lightCF, lightPos);
            lightx.value = lightPos[0];
            lighty.value = lightPos[1];
            lightz.value = lightPos[2];
            gl.uniform3fv (lightPosUnif, lightPos);
            let vertices = [0, 0, 0, 1, 1, 1,
                lightPos[0], 0, 0, 1, 1, 1,
                lightPos[0], lightPos[1], 0, 1, 1, 1,
                lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
            gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
            gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);

            gl.uniform1f(ambCoeffUnif, ambCoeffSlider.value);
            gl.uniform1f(diffCoeffUnif, diffCoeffSlider.value);
            gl.uniform1f(specCoeffUnif, specCoeffSlider.value);
            gl.uniform1f(shininessUnif, shinySlider.value);

            gl.uniform3iv (isEnabledUnif, lightingComponentEnabled);
            tree = new Tree(gl, 0, 0, 0);
            tree2 = new Tree(gl, 0.5, 1, 0);
            house = new House(gl);
            lightpost = new LightPost(gl);
            grass = new Cube(gl, .9, 5);
            mat4.scale(grassCF, grassCF, vec3.fromValues(4.5, 4.5, .1));
            mat4.translate(grassCF, grassCF, vec3.fromValues(0, 0, -.4));

            let yellow = vec3.fromValues(1.0, 1.0, 0.0);
            let orange = vec3.fromValues(1.0, 0.8, 0.0);
            pointLight = new UniSphere(gl, .4, 7, yellow, orange);
            redrawNeeded = true;
            timestamp = Date.now();
            resizeHandler();
            render();
        });
}

function resizeHandler() {
    glCanvas.width = window.innerWidth;
    glCanvas.height = 0.75 * window.innerHeight;
    if (glCanvas.width > glCanvas.height) { /* landscape */
        let ratio = 2 * glCanvas.height / glCanvas.width;
        mat4.ortho(orthoProjMat, -3, 3, -3 * ratio, 3 * ratio, -5, 5);
        mat4.perspective(persProjMat,
            Math.PI/3,  /* 60 degrees vertical field of view */
            1/ratio,    /* must be width/height ratio */
            1,          /* near grass at Z=1 */
            20);        /* far grass at Z=20 */
        redrawNeeded = true;
    } else {
        alert ("Window is too narrow!");
    }

}

function ambColorChanged(ev) {
    switch (ev.target.id) {
        case 'r-amb-slider':
            objAmbient[0] = ev.target.value;
            break;
        case 'g-amb-slider':
            objAmbient[1] = ev.target.value;
            break;
        case 'b-amb-slider':
            objAmbient[2] = ev.target.value;
            break;
    }
    gl.uniform3fv(objAmbientUnif, objAmbient);
    redrawNeeded = true;
}

function colorChanged(ev) {
    switch (ev.target.id) {
        case 'redslider':
            objTint[0] = ev.target.value;
            break;
        case 'greenslider':
            objTint[1] = ev.target.value;
            break;
        case 'blueslider':
            objTint[2] = ev.target.value;
            break;
    }
    gl.uniform3fv(objTintUnif, objTint);
    redrawNeeded = true;
}

function lightPosChanged(ev) {
    switch (ev.target.id) {
        case 'lightx':
            lightPos[0] = ev.target.value;
            break;
        case 'lighty':
            lightPos[1] = ev.target.value;
            break;
        case 'lightz':
            lightPos[2] = ev.target.value;
            break;
    }
    mat4.fromTranslation(lightCF, lightPos);
    gl.uniform3fv (lightPosUnif, lightPos);
    let vertices = [
        0, 0, 0, 1, 1, 1,
        lightPos[0], 0, 0, 1, 1, 1,
        lightPos[0], lightPos[1], 0, 1, 1, 1,
        lightPos[0], lightPos[1], lightPos[2], 1, 1, 1];
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(vertices), gl.STATIC_DRAW);
    redrawNeeded = true;
}


function objPosChanged(ev) {
    switch (ev.target.id) {
        case 'objx':
            treeCF[12] = ev.target.value;
            break;
        case 'objy':
            treeCF[13] = ev.target.value;
            break;
        case 'objz':
            treeCF[14] = ev.target.value;
            break;
    }
    redrawNeeded = true;
}

function eyePosChanged(ev) {
    switch (ev.target.id) {
        case 'eyex':
            eyePos[0] = ev.target.value;
            break;
        case 'eyey':
            eyePos[1] = ev.target.value;
            break;
        case 'eyez':
            eyePos[2] = ev.target.value;
            break;
    }
    mat4.lookAt(viewMat,
        eyePos,
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */
    mat4.invert (viewMatInverse, viewMat);
    redrawNeeded = true;
}

function render() {
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        draw3D();
        //drawTopView();
        /* looking at the XY grass, Z-axis points towards the viewer */
        // coneSpinAngle += 1;  /* add 1 degree */
    if(isChopped && isMoving){
        let now = Date.now();
        let elapse = (now - timestamp)/1000;
        timestamp = now;
        let treespin = elapse * (angular_speed_tree / 60) * Math.PI * 2;
        treeCF[13] -= tranSpeed;
        mat4.rotateZ(treeCF, treeCF, treespin);

    }
    requestAnimationFrame(render);
}

function drawScene() {
    gl.uniform1i (useLightingUnif, false);
    gl.disableVertexAttribArray(normalAttr);
    gl.enableVertexAttribArray(colAttr);

    /* Use LINE_STRIP to mark light position */
    gl.uniformMatrix4fv(modelUnif, false, IDENTITY);
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuff);
    gl.vertexAttribPointer(posAttr, 3, gl.FLOAT, false, 24, 0);
    gl.vertexAttribPointer(colAttr, 3, gl.FLOAT, false, 24, 12);
    gl.drawArrays(gl.LINE_STRIP, 0, 4);

    /* Draw the light source (a sphere) using its own coordinate frame */
    pointLight.draw(posAttr, colAttr, modelUnif, lightCF);

    if (typeof tree !== 'undefined') {
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        tree.draw(posAttr, normalAttr, modelUnif, treeCF);
    }

    if (typeof tree2 !== 'undefined') {
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        tree2.draw(posAttr, normalAttr, modelUnif, treeCF2);
    }

    if (typeof house !== 'undefined') {
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
       // objTint = vec3.fromValues(0.184314, 0.309804, 0.184314);
        //gl.uniform3fv(objTintUnif, objTint);
        house.draw(posAttr, normalAttr, modelUnif, houseCF);
        if(houseneedrot){
            mat4.rotateX(houseCF, houseCF, Math.PI/2);
            houseneedrot = false;
        }
    }

    if (typeof lightpost !== 'undefined') {
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        lightpost.draw(posAttr, normalAttr, modelUnif, lightpostCF);
    }

    if (typeof grass !== 'undefined') {
        /* calculate normal matrix from ringCF */
        gl.uniform1i (useLightingUnif, true);
        gl.disableVertexAttribArray(colAttr);
        gl.enableVertexAttribArray(normalAttr);
        gl.uniform3fv(objTintUnif, vec3.fromValues((65/256), (168/256), (47/256)));
        grass.draw(posAttr, normalAttr, modelUnif, grassCF);
    }

}

function draw3D() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, persProjMat);
    gl.uniformMatrix4fv(viewUnif, false, viewMat);
    mat4.mul (tmpMat, viewMat, ringCF);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(0, 0, glCanvas.width/2, glCanvas.height);
    drawScene();

}

function drawTopView() {
    /* We must update the projection and view matrices in the shader */
    gl.uniformMatrix4fv(projUnif, false, orthoProjMat);
    gl.uniformMatrix4fv(viewUnif, false, topViewMat);
    mat4.mul (tmpMat, topViewMat, ringCF);
    mat3.normalFromMat4 (normalMat, tmpMat);
    gl.uniformMatrix3fv (normalUnif, false, normalMat);
    gl.viewport(glCanvas.width/2, 0, glCanvas.width/2, glCanvas.height);
    drawScene();
}

function checkKey(e){
    chosenObj =  document.getElementById("objects");
    chosenObj = chosenObj.options[chosenObj.selectedIndex].value;
    e = e || window.event;
    let obj;
    switch (chosenObj) {
        case 'Tree1':
            obj = treeCF;
            break;
        case 'Tree2':
            obj = treeCF2;
            break;
        case 'House':
            obj = houseCF;
            break;
        case 'Lamp':
            obj = lightpostCF;
            break;
    }

    //w Y+
    switch (e.keyCode){
        //W Y+
        case 87:
            obj[14] += .1;
            break;
        //s Y-
        case 83:
            obj[14] -= .1;
            break;
        //a X+
        case 65:
            obj[13] += .1;
            break;
        //d X-
        case 68:
            obj[13] -= .1;
            break;
        //Q Z+
        case 81:
            obj[12] += .1;
            break;
        //E Z-
        case 69:
            obj[12] -= .1;
            break;
        //Eye X+
        case 37:
            eyePos[0] -= .1;
            break;
        //Eye X-
        case 39:
            eyePos[0] += .1;
            break;
        //Eye Y+
        case 38:
            eyePos[1] += .1;
            break;
        //Eye Y-
        case 40:
            eyePos[1] -= .1;
            break;
        //Eye Z+
        case 49:
            eyePos[2] += .1;
            break;
        //Eye Z-
        case 50:
            eyePos[2] -= .1;
            break;
        //RotSp+
        case 72:
            angular_speed_tree += 1;
            break;
        //RotSp-
        case 71:
            angular_speed_tree -= 1;
            break;
        //TranSp+
        case 89:
            tranSpeed += .01;
            break;
        //TranSp-
        case 84:
            tranSpeed -= .01;
            break;
        //Pause
        case 80:
            isMoving = !isMoving;
            break;
    }

    mat4.lookAt(viewMat,
        eyePos,
        vec3.fromValues(0, 0, 0), /* focal point */
        vec3.fromValues(0, 0, 1)); /* up */
    mat4.invert (viewMatInverse, viewMat);
    redrawNeeded = true;

}

function timber() {
    /* We must update the projection and view matrices in the shader */
    if(isChopped)
        return;
    mat4.rotateY(treeCF, treeCF, (Math.PI/2));
    isChopped = true;
}


