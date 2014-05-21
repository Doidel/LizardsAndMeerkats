Sidebar.Physics = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setDisplay( 'none' );
	//container.dom.classList.add( 'Material' );

	container.add( new UI.Text( 'PHYSICS' ) );
	container.add( new UI.Break(), new UI.Break() );

	// friction

	var physicsFrictionRow = new UI.Panel();
	var physicsFriction = new UI.Number( 0.5 ).onChange( update );

	physicsFrictionRow.add( new UI.Text( 'Friction' ).setWidth( '90px' ) );
	physicsFrictionRow.add( physicsFriction );

	container.add( physicsFrictionRow );

	// restitution

	var physicsRestitutionRow = new UI.Panel();
	var physicsRestitution = new UI.Number( 0.5 ).onChange( update );

	physicsRestitutionRow.add( new UI.Text( 'Restitution' ).setWidth( '90px' ) );
	physicsRestitutionRow.add( physicsRestitution );

	container.add( physicsRestitutionRow );

	// mass modifier

	var physicsMassmodifierRow = new UI.Panel();
	var physicsMassmodifier = new UI.Number( 1.0 ).onChange( update );

	physicsMassmodifierRow.add( new UI.Text( 'Mass modifier' ).setWidth( '90px' ) );
	physicsMassmodifierRow.add( physicsMassmodifier );

	container.add( physicsMassmodifierRow );

	//

	function update() {

		var physics = editor.selected.material._physijs;

		if ( physics ) {
		
			physics.friction = physicsFriction.getValue();

			physics.restitution = physicsRestitution.getValue();

			physics.massmodifier = physicsMassmodifier.getValue();

			updateRows();

		}

	};

	function updateRows() {

		/*var properties = {
			'friction': physicsFriction,
			'restitution': physicsRestitution,
			'massmodifier': physicsMassmodifier
		};

		var physics = editor.selected.material._physijs;
		console.log(editor.selected);

		for ( var property in properties ) {
		
			//properties[ property ].setDisplay( physics[ property ] !== undefined ? '' : 'none' );

		}*/

	};

	// events

	signals.objectSelected.add( function ( object ) {

		if ( object && object._physijs ) {

			container.setDisplay( '' );

			var physics = object.material._physijs;
			
			if ( physics.friction !== undefined ) {
			
				physicsFriction.setValue( physics.friction );
			
			}
			
			if ( physics.restitution !== undefined ) {
			
				physicsRestitution.setValue( physics.restitution );
			
			}
			
			if ( physics.massmodifier !== undefined ) {
			
				physicsMassmodifier.setValue( physics.massmodifier );
			
			}

			updateRows();

		} else {

			container.setDisplay( 'none' );

		}

	} );

	return container;

}
