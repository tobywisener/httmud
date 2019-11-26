/* INPUT COMPONENT */

var toX, toY, longTimeout;

$(document).bind('touchstart mousedown', function(e) {
    var target = $(e.target), parent = target.parent();

    // Process pre-defined longpress events
    Object.keys(_HTTMUD.Input.longPressEvents).forEach(function(key,index) {
        var event = _HTTMUD.Input.longPressEvents[key]; 
        if(target.is(key)) {
            longTimeout = setTimeout(event.action, event.delay * 1000, target);
        } else if (typeof event.triggerParent === "boolean" && event.triggerParent && parent.is(key)) {
            longTimeout = setTimeout(event.action, event.delay * 1000, parent);
        }
    });

    //Prevent Ghost Click
    e.preventDefault(); 
});

$(document).bind('touchend mouseup', function(e) {
    if(!online) return false;
    var target = $(e.target), parent = target.parent();

    // Clear the long press timeout
    if(longTimeout !== null) {
        window.clearTimeout(longTimeout);
    }

    // Player click
    var clickedPlayer = null;
    if(target.is(_HTTMUD.Settings.playerSelector)) {
        clickedPlayer = target.attr('id');
    } else if(parent.is(_HTTMUD.Settings.playerSelector)) {
        clickedPlayer = parent.attr('id');
    }
    if(clickedPlayer !== null) {
        _HTTMUD.Logic.playerClicked(clickedPlayer, clickedPlayer == _HTTMUD.playerId);
    }

    // Walking
    var clickThrottle = false
    if(target.is('#canvas')) {
        if (!clickThrottle) {
            clickThrottle = true;
            setTimeout(function() { clickThrottle = false; }, 400);
            if(e.type == "mouseup") {
                toX = _HTTMUD.Rendering.scrollLeft() + Math.round(e.clientX);
                toY = _HTTMUD.Rendering.scrollTop() + Math.round(e.clientY);
            } else {
                var touch = e.originalEvent.changedTouches[event.changedTouches.length-1];
                toX = _HTTMUD.Rendering.scrollLeft() + Math.round(touch.clientX);
                toY = _HTTMUD.Rendering.scrollTop() + Math.round(touch.clientY);
            }
            
            _HTTMUD.Transform.Player(toX, toY);
        }
    }

    // Process pre-defined click/touch events	 
    Object.keys(_HTTMUD.Input.touchClickEvents).forEach(function(key,index) {
        if(target.is(key)) {
            _HTTMUD.Input.touchClickEvents[key](target);
        }
    });

    // Prevent 'Ghost Click' from firing event twice on mobile devices
    e.preventDefault(); 
});

$(document).bind('touchmove', function(e) {
        e.preventDefault(); // Prevent panning/zooming on touch devices
});

$("#chat #form #inputter").keypress(function (e) {
    if (e.keyCode == 13) {
        var usrname = name;
        var text = $('#chat #form #inputter').val();
        chatListRef.push({name:usrname, text:text, ref: _HTTMUD.playerId});
        $('#chat #form #inputter').val('');
    }
}); 

/* END OF INPUT COMPONENT */
