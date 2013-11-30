// Create a plane
var Levels = {
    level1: function() {
        if (ige.isServer) {
            /*var groundShape = new CANNON.Plane();
            var groundBody = new CANNON.RigidBody(0,groundShape,ige.cannon._slipperyMaterial);
            groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);

            ige.cannon._world.add(groundBody);*/

            var groundmat = Physijs.createMaterial(
                new THREE.MeshBasicMaterial(),
                0, // high friction
                .4 // low restitution
            );

            var geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
            geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

           var ground = new Physijs.PlaneMesh(
                geometry,
                groundmat,
                0
            );
            ground.position.set(0,0,0);
            ige.server.scene1._threeObj.add(ground);
            /*
             var ground_material = Physijs.createMaterial(
             new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('images/wood.jpg'), side: 2}),
             .8, // high friction
             .4 // low restitution
             );
             ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping;
             ground_material.map.repeat.set(2.5, 2.5);

             ground = new Physijs.HeightfieldMesh(
             geometry,
             new THREE.MeshLambertMaterial({color: '#ff0000'}),
             0
             );
             */
        } else {
            // FLOOR

            var grass = THREE.ImageUtils.loadTexture( './assets/textures/grass1.jpg' );
            grass.wrapS = grass.wrapT = THREE.RepeatWrapping;
            grass.repeat.set( 32, 32 );

            /*var mapHeight = THREE.ImageUtils.loadTexture("./assets/textures/heightmap.png");
            //mapHeight.anisotropy = 8;

            var uniforms = THREE.UniformsUtils.clone(THREE.ShaderLib['phong'].uniforms);

            uniforms['map'].value = grass;
            uniforms['offsetRepeat'].value = new THREE.Vector4( 0, 0, 8, 8 ); //offsetx, offsety, repeatx, repeaty
            uniforms['u_height0'] = {type: "t", value: mapHeight};

            var material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                vertexShader: document.getElementById('vertexShaderHeight').textContent, //THREE.ShaderLib['phong'].vertexShader,
                fragmentShader: THREE.ShaderLib['phong'].fragmentShader,
                lights: true
            });

            material.map = true;*/

            var material = new THREE.MeshPhongMaterial({
                map: grass
            });

            // three floor
            var geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
            geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

            var ambient = new THREE.AmbientLight( 0x999999 );
            ige.client.scene1._threeObj.add( ambient );


            var mesh = new THREE.Mesh(geometry, material);
            mesh.receiveShadow = true;
            mesh.position = new THREE.Vector3(0,0,0);
            ige.client.scene1._threeObj.add(mesh);

            //Plants
            new Plant1(new THREE.Vector3(10, 0.001, 5));
        }

        new Rock1(new THREE.Vector3(28, -3, 0), 3);
        new Rock1(new THREE.Vector3(22.2, -0.5, 1.2), 0.5);
        new Rock1(new THREE.Vector3(22.0, -0.25, -0.5), 0.25);

        new RockGold1(new THREE.Vector3(5.0, -2, -4.5), 2);
    }
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Levels; }