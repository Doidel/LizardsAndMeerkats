var Plant1 = IgeObject.extend({
    classId: 'Plant1',

    init: function (position) {
        IgeObject.prototype.init.call(this);

        if (!ige.isServer) {
            
            this._threeObj = new THREE.Object3D();
            
            var mat = new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture( './assets/textures/plant1.png' ),
                transparent: true,
                side: THREE.DoubleSide,
                depthWrite: false,
                depthTest: true
            });

            var geom = new THREE.PlaneGeometry(1, 1, 2, 3);
            geom.vertices[0].z = -0.5;
            geom.vertices[1].z = -0.5;
            geom.vertices[2].z = -0.5;
            geom.vertices[3].z = -0.2;
            geom.vertices[4].z = -0.2;
            geom.vertices[5].z = -0.2;

            //move the centerpoint
            geom.applyMatrix( new THREE.Matrix4().makeTranslation(0, 0.5, 0));

            //create the plant meshes

            //lower leaves
            var p1 = new THREE.Mesh(
                geom,
                mat
            );
            p1.eulerOrder = 'YXZ';
            p1.rotation.x = -0.7;
            p1.castShadow = true;
            p1.receiveShadow = true;

            var p2 = new THREE.Mesh(
                geom,
                mat
            );
            p2.eulerOrder = 'YXZ';
            p2.rotation.y = 1.5;
            p2.rotation.x = -0.7;
            p2.position.x = -0.2;

            var p3 = new THREE.Mesh(
                geom,
                mat
            );
            p3.eulerOrder = 'YZX';
            p3.rotation.y = 2.7;
            p3.rotation.x = -0.7;

            var p4 = new THREE.Mesh(
                geom,
                mat
            );
            p4.eulerOrder = 'YZX';
            p4.rotation.y = 4.5;
            p4.rotation.x = -0.7;
            p4.position.z = 0.1;



            //upper leaves
            var p5 = new THREE.Mesh(
                geom,
                mat
            );
            p5.eulerOrder = 'YXZ';
            p5.rotation.y = 0.5;
            p5.rotation.x = -0.3;

            var p6 = new THREE.Mesh(
                geom,
                mat
            );
            p6.eulerOrder = 'YXZ';
            p6.rotation.y = 2.0;
            p6.rotation.x = -0.3;
            p6.position.x = -0.2;

            var p7 = new THREE.Mesh(
                geom,
                mat
            );
            p7.eulerOrder = 'YZX';
            p7.rotation.y = 3.2;
            p7.rotation.x = -0.3;

            var p8 = new THREE.Mesh(
                geom,
                mat
            );
            p8.eulerOrder = 'YZX';
            p8.rotation.y = 5.0;
            p8.rotation.x = -0.3;
            p8.position.z = 0.1;


            this._threeObj.add(p1);
            this._threeObj.add(p2);
            this._threeObj.add(p3);
            this._threeObj.add(p4);
            this._threeObj.add(p5);
            this._threeObj.add(p6);
            this._threeObj.add(p7);
            this._threeObj.add(p8);

            this._threeObj.position = position;

            ige.client.scene1._threeObj.add(this._threeObj);
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Plant1; }