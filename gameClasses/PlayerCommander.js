var PlayerCommander = Player.extend({
    classId: 'PlayerCommander',

    //Ask SavXR Natsu for balances

    init: function (id) {
        Player.prototype.init.call(this, id);

        var self = this;

        if (id) {
            this.id(id);
        }

        // add hat
        var hatGeometry = new THREE.CubeGeometry(0.25,0.25,0.25);
        var hatMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('#FF0000')});
        var hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.y = 1.0;

        this._threeObj.add(hat);

        // initialize object to perform world/screen calculations
        this.projector = new THREE.Projector();
        // if he is in the building mode
        this.isInBuildingMode = false;
        this.buildingObject;
    },
    // place command building
    placeBuilding: function(event){

        if(!ige.isServer){
            this.isInBuildingMode = false;
        }
    },
    /**
     * Called every frame by the engine when this entity is mounted to the
     * scenegraph.
     * @param ctx The canvas context to render to.
     */
    tick: function (ctx) {
        var self = this;

        Player.prototype.tick.call(this, ctx);

        if(ige.isServer){

        } else if(!ige.isServer){

            // if he is in the building mode
            if (this.controls.build || this.isInBuildingMode) {

                if(!this.isInBuildingMode){
                    this.isInBuildingMode = true;
                    var hatGeometry = new THREE.CubeGeometry(0.25,0.25,0.25);
                    var hatMaterial = new THREE.MeshLambertMaterial({color: new THREE.Color('#FF0000')});

                    this.buildingObject = new THREE.Mesh(hatGeometry, hatMaterial);
                    ige.client.scene1._threeObj.add(this.buildingObject);
                }
                // update the mouse variable
                var currentMousePos = { x: -1, y: -1 };
                var mouseX = window.innerWidth / 2;
                var mouseY = -window.innerHeight / 2;

                // find intersections

                // create a Ray with origin at the mouse position
                //   and direction into the scene (camera direction)
                var vector = new THREE.Vector3( mouseX, mouseY, 1 );

                var position = new THREE.Vector3();
                position.x = this._threeObj.position.x + ige.client.vp1.camera._threeObj.position.x;
                position.y = this._threeObj.position.y + ige.client.vp1.camera._threeObj.position.y;
                position.z = this._threeObj.position.z + ige.client.vp1.camera._threeObj.position.z;

                this.projector.unprojectVector( vector, ige.client.vp1.camera._threeObj );

                vector.sub( this._threeObj.position ).normalize();
                //vector.sub( position ).normalize();
                console.log(vector);

                var axis = new THREE.Vector3( 0, 1, 0 );
                var angle = Math.PI / 2;
                var matrix = new THREE.Matrix4().makeRotationAxis( axis, angle );
                vector.applyMatrix4( matrix );

                var ray = new THREE.Raycaster( this._threeObj.position, vector );
                //var ray = new THREE.Raycaster( position, vector );
                //var ray = new THREE.Raycaster( ige.client.vp1.camera._threeObj.position, vector.sub(ige.client.vp1.camera._threeObj.position).normalize() );

                var count = 0;
                var found = false;
                var intersect;
                while(!found && count < ige.client.scene1._threeObj.children.length){
                    if(ige.client.scene1._threeObj.children[count].name == "level"){
                        // create an array containing all objects in the scene with which the ray intersects
                        intersect = ray.intersectObject( ige.client.scene1._threeObj.children[count] );
                        found = true;
                    }
                    ++count;
                }

                if(intersect[0]){
                    this.buildingObject.position = intersect[0].point;
                    //console.log(ige.client.vp1.camera._threeObj.position, position);
                    //this.buildingObject.needsUpdate();
                }
            }
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = PlayerCommander; }