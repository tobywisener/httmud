/* TRANSFORM COMPONENT */
_HTTMUD.Transform = {
	
	// Function to persist a Player Transformation within the game world (Server-side)
	Player: function(x, y) {
      if(x < 0 || y < 0 || x > _HTTMUD.Settings.canvasWidth || y > _HTTMUD.Settings.canvasHeight)
		    return;
      
      _HTTMUD.canWalk = false;
      _HTTMUD.Networking.updatePlayer({ top: y, left: x });
    },
	
	// Function to physcally transform a specified Game Object (Client-side)
	Object: function(element, left, top, calback) {
		element.animate({left: left+"px", top: top+"px"}, "fast", "linear", function() {
			if(typeof callback === "function") {
				callback();
			}
		});
	}
	
}
/* END OF TRANSFORM COMPONENT */	
