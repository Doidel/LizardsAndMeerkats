Sidebar.Geometry.HeightfieldGeometry = function ( signals, object ) {

	var container = new UI.Panel();

	var geometry = object.geometry;

	// heightfield

	var materialMapRow = new UI.Panel();
	var materialMap = new UI.Texture().setColor( '#444' ).onChange( function() {
		var texture = materialMap.getValue();
		
		var getImageData = function(image){
			var canvas = document.createElement( 'canvas' );
			canvas.width = image.width;
			canvas.height = image.height;

			var context = canvas.getContext( '2d' );
			context.drawImage( image, 0, 0 );

			return context.getImageData( 0, 0, image.width, image.height );
		};
		
		var getPixel = function(imagedata, x, y){
			var position = ( x + imagedata.width * y ) * 4;
			var data = imagedata.data;
			//return {r: data[ position ], g: data[ position + 1 ], b: data[ position + 2 ], a: data[ position + 3 ]};
			return (data[position] * 256 + data[position + 1]) / 256 / 256 * scale;
		}
		
		var imagedata = getImageData(texture.image);
		console.log(texture);
		
		var vAmountX = vAmountY = Math.sqrt( geometry.vertices.length );
		var multX = texture.image.width / vAmountX;
		var multY = texture.image.height / vAmountY;
		var scale = 50;
		var shape = geometry;
		
		console.log( (vAmountX - 1) * multX, vAmountX, multX);
		
		//shape.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
		for (var i = 0; i < vAmountY; ++i) {
			for (var j = 0; j < vAmountX; ++j) {
				var color = getPixel( imagedata, parseInt(j*multX), parseInt(i*multY) );
				shape.vertices[i*vAmountX + j].z = color;
			}
		}
		
		var vectorCA = new THREE.Vector3(),
			vectorCB = new THREE.Vector3(),
			vectorCD = new THREE.Vector3(),
			vectorCE = new THREE.Vector3(),
			normalACB = new THREE.Vector3(),
			normalBCE = new THREE.Vector3(),
			normalECD = new THREE.Vector3(),
			normalDCA = new THREE.Vector3(),
			averageNormal = new THREE.Vector3();
			
			// according to http://www.uniqsoft.co.uk/directx/html/tut5/tut5.htm
		/*var calcNormals = function(pVectorA, pVectorB, pVectorC, pVectorD, pVectorE) {
		
			// Subtract two 3-D vectors ie. v3 = v1 - v2.
			vectorCA.subVectors( pVectorA, pVectorC );
			vectorCB.subVectors( pVectorB, pVectorC );
			vectorCD.subVectors( pVectorD, pVectorC );
			vectorCE.subVectors( pVectorE, pVectorC );
		
			normalACB.crossVectors( vectorCA, vectorCB ).normalize();
			normalBCE.crossVectors( vectorCB, vectorCE ).normalize();
			normalECD.crossVectors( vectorCE, vectorCD ).normalize();
			normalDCA.crossVectors( vectorCD, vectorCA ).normalize();
		
			averageNormal.x = (normalACB.x + normalBCE.x + normalECD.x + normalDCA.x) / 4.0;
			averageNormal.y = (normalACB.y + normalBCE.y + normalECD.y + normalDCA.y) / 4.0;
			averageNormal.z = (normalACB.z + normalBCE.z + normalECD.z + normalDCA.z) / 4.0;
		
			averageNormal.normalize();
			
		}*/
		
		var va = new THREE.Vector3(0, 1, 9);
		var vb = new THREE.Vector3(1, 0, 9);
		var vc = new THREE.Vector3(0, -1, 9);
		var vd = new THREE.Vector3(-1, 0, 9);
		var calcNormals2 = function(h_A, h_B, h_C, h_D, h_N) {
			va.z = h_A - h_N;
			vb.z = h_B - h_N;
			vc.z = h_C - h_N;
			vd.z = h_D - h_N;
			
			normalACB.crossVectors( va, vb );
			normalBCE.crossVectors( vb, vc );
			normalECD.crossVectors( vc, vd );
			normalDCA.crossVectors( vd, va );
			
			averageNormal.set(0,0,0);
			averageNormal.add( normalACB );
			averageNormal.add( normalBCE );
			averageNormal.add( normalECD );
			averageNormal.add( normalDCA );
			averageNormal.divideScalar( -4 );
			averageNormal.normalize();
		}
		
		
		//fix normals
		var normals = shape.attributes.normal.array;
		var defaultNormal = new THREE.Vector3(0, 0, 1);
		var maxAmount = (vAmountY - 1) * (vAmountX - 1);
		
		for (var i = 0; i < vAmountY; ++i) {
			for (var j = 0; j < vAmountX; ++j) {
			
				var currentPos = i * vAmountX + j;
				
				var color = getPixel( imagedata, parseInt(j*multX), parseInt(i*multY) );
				shape.vertices[ currentPos ].z = color;
				
				//get the 8 heights around and interpolate
				
				/*calcNormals( currentPos - vAmountX >= 0 ? shape.vertices[ currentPos - vAmountX ] : defaultNormal,
							 currentPos - 1 >= 0 ? shape.vertices[ currentPos - 1 ] : defaultNormal,
							 shape.vertices[ currentPos ],
							 currentPos + 1 <= maxAmount ? shape.vertices[ currentPos + 1 ] : defaultNormal,
							 currentPos + vAmountX <= maxAmount ? shape.vertices[ currentPos + vAmountX ] : defaultNormal );*/
							 
				calcNormals2( currentPos - vAmountX >= 0 ? shape.vertices[ currentPos - vAmountX ].z : defaultNormal.z,
							  currentPos + 1 <= maxAmount ? shape.vertices[ currentPos + 1 ].z : defaultNormal.z,
							  currentPos + vAmountX <= maxAmount ? shape.vertices[ currentPos + vAmountX ].z : defaultNormal.z,
							  currentPos - 1 >= 0 ? shape.vertices[ currentPos - 1 ].z : defaultNormal.z,
							  shape.vertices[ currentPos ].y );
				
				normals[ currentPos * 3 ] = averageNormal.x;
				normals[ currentPos * 3 + 1 ] = averageNormal.y;
				normals[ currentPos * 3 + 2 ] = averageNormal.z;
			}
		}

		//shape.computeOffsets();
		//shape.computeVertexNormals(); //needs offsets which are currently calculated wrongly
		//shape.computeFaceNormals();
		shape.verticesNeedUpdate = true;
		shape.normalsNeedUpdate = true;
		sh = shape;
	}.bind(this) );

	materialMapRow.add( new UI.Text( 'Heightfield' ).setWidth( '90px' ) );
	materialMapRow.add( materialMap );

	container.add( materialMapRow );
	
	// width

	var widthRow = new UI.Panel();
	var width = new UI.Number( geometry.parameters.width ).onChange( update );

	widthRow.add( new UI.Text( 'Width' ).setWidth( '90px' ) );
	widthRow.add( width );

	container.add( widthRow );

	// height

	var heightRow = new UI.Panel();
	var height = new UI.Number( geometry.parameters.height ).onChange( update );

	heightRow.add( new UI.Text( 'Height' ).setWidth( '90px' ) );
	heightRow.add( height );

	container.add( heightRow );

	//

	function update() {

		if (!object.geometry) {
			delete object.__webglInit; // TODO: Remove hack (WebGLRenderer refactoring)

			object.geometry.dispose();

			object.geometry = new THREE.PlaneGeometry(
				width.getValue(),
				height.getValue(),
				widthSegments.getValue(),
				heightSegments.getValue()
			);

			object.geometry.computeBoundingSphere();
		} else {
			
		}

		signals.objectChanged.dispatch( object );

	}

	return container;

}

/*

DRAW NORMALS

THREE.VertexNormalsHelper = function ( object, size, hex, linewidth ) {

	var color = ( hex !== undefined ) ? hex : 0x0000ff;

	var width = ( linewidth !== undefined ) ? linewidth : 1;

	var geometry = new THREE.Geometry();

	var vertices = object.geometry.attributes.position.array;
	var normals = object.geometry.attributes.normal.array;

	for ( var i = 0, l = vertices.length; i < l; i += 3 ) {

			geometry.vertices.push( new THREE.Vector3(vertices[i], vertices[i+1], vertices[i+2]) );
			geometry.vertices.push( new THREE.Vector3(vertices[i] + normals[i], vertices[i+1] + normals[i+1], vertices[i+2] + normals[i+2]) );

	}
	
	geometry.applyMatrix(object.matrixWorld);

	editor.scene.add( new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: color, linewidth: width } ), THREE.LinePieces ) );
	
} 

new THREE.VertexNormalsHelper(editor.scene.children[2]);


*/
