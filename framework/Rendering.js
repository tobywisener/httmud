/* RENDERING COMPONENT */
_HTTMUD.Rendering = {
    
    // Return Rendering functionality for a specified Game Object
    GameObject: function(object) {
        if(typeof _HTTMUD.Objects[object] !== "object") {
            return null;
        }
        var element = $(_HTTMUD.Settings.canvasSelector+" .object#"+object);
        if(!element.length) {
            return null;
        };
        
        this.Element = function() {
            return element;
        };
        
        this.Render = function() {
            element.show();
        };
        
        return this;
    },
    
    // Return a JQuery wrapped element for a given User Interface
    UI: function(interface) {
        if(typeof _HTTMUD.Interfaces[interface] === "string") {
            return $(_HTTMUD.Settings.canvasSelector+" "+_HTTMUD.Interfaces[interface]);
        }

        return null; // Interface not found
    },

    // Function to Scroll the viewport, giving the player the best possible viewpoint
    scrollViewport: function(playerX, playerY) {
        var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
            viewportHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight,
            playerWidth = $("#" + _HTTMUD.playerId).width(), playerHeight = $("#" + _HTTMUD.playerId).height(),
            maxScrollToX = _HTTMUD.Settings.gameWidth - viewportWidth, maxScrollToY = _HTTMUD.Settings.gameHeight - viewportHeight;

        var scrollToX = playerX - ((viewportWidth - playerWidth) / 2),
            scrollToY = playerY - ((viewportHeight - playerHeight) / 2);

        scrollToX = scrollToX > 0 ? scrollToX : 0;
        scrollToY = scrollToY > 0 ? scrollToY : 0;
        scrollToX = scrollToX < maxScrollToX ? scrollToX : maxScrollToX;
        scrollToY = scrollToY < maxScrollToY ? scrollToY : maxScrollToY;

        // Scrolling needed
        $("body").animate({ scrollTop:  scrollToY, scrollLeft: scrollToX,}, "fast", "linear");
    },
    
    // Function to highlight a Player
    highlightPlayer: function(player, type) {
        switch (type) {
            case 0: // Unhighlight
                $("#" + player + " #highlight").hide();
                $("#" + player + " #ui").hide();
                _HTTMUD.selectedPlayer = null;
                break;

            case 1: // Normal Highlight
                if(_HTTMUD.selectedPlayer !== null) {				
                    $("#" + _HTTMUD.selectedPlayer + " #highlight").hide();
                }
                $("#" + player + " #highlight").css('background-position', '-112px 0').show();
                $("#" + player + " #ui").show();
                _HTTMUD.selectedPlayer = player;
                break;

            case 2: // Opponent Highlight
                $("#" + player + " #highlight").css('background-position', '0 0').show();
                break;
	    }
    },
    
    // Function to get the vertical scroll position
    scrollTop: function() {
        return document.body.scrollTop || document.documentElement.scrollTop;
    },

    // Function to get the horizontal scroll position
    scrollLeft: function() {
        return document.body.scrollLeft || document.documentElement.scrollLeft;
    }
    
};
/* END OF RENDERING COMPONENT */
