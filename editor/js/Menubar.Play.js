Menubar.Play = function ( editor ) {

	var playing = false;

	// event handlers

	function onPlaySceneOptionClick () {
		
		if ( !playing ) {
		
			viewport.maximize();
			editor.signals.play.dispatch();
			playing = true;
			
		}
		else
		{
			viewport.windowed();
			editor.signals.stop.dispatch();
			playing = false;
			
		}
	}

	// configure menu contents

	var createOption = UI.MenubarHelper.createOption;
	var createDivider = UI.MenubarHelper.createDivider;

	var menuConfig = [
		createOption( 'Play', onPlaySceneOptionClick )
	];

	var optionsPanel = UI.MenubarHelper.createOptionsPanel( menuConfig );

	return UI.MenubarHelper.createMenuContainer( 'Play', optionsPanel );
}
