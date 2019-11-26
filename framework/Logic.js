/* 
* This file is used to hold all helper methods and generic functionality
* behind the _HTTMUD game framework.
*
* Author: Tobias Wisener
*
*/

// The default Game (SlashWars) is loaded where the user does not override properties
var _HTTMUD = {
		
	// General HTTMUD settings
	Settings: {
		canvasSelector: '#canvas',
		playerSelector: '.s2d_user',
		firebaseUrl: 'https://rsps.firebaseio.com',
		resources: './_httmud/Resources',
		gameWidth: 1000,
		gameHeight: 1000,
		attackDistance: 280,
		defaultPlayer: { 
			name: 'player1', 
			status: 1,
			map: 0, 
			health: 100, 
			left: 20, 
			top: 20, 
			coins: 100, 
			inCombat: "", 
			kills: 0,
			deaths: 0,
			auth: "",
			class: 0,
			equipment: [	0 /* Unequipped */,	0, /* Warrior */ 0, /* Wizard */ 0  /* Rogue */	]
		},
		onDisconnect: { status: 0 },
		onConnect: { status: 1 }
	},
	
	Objects: {},

	Equipment: [
			[], /* Unequipped */

			[ /* Warrior */
				/* Level 1 */ { name: "Corrupted Melee", bonus: 1, css: "corruptedmelee", value: 150, display: { top: -2, left: 0 } },
				/* Level 2 */ { name: "Crystal Teal", bonus: 2, css: "teal", value: 500, display: { top: -12, left: -2 } },
				/* Level 3 */ { name: "Black Elite", bonus: 3, css: "elite", value: 1000, display: { top: 0, left: 0 } }
			],

			[ /* Wizard */
				/* Level 1 */ { name: "Corrupted Mage", bonus: 1, css: "corruptedmage", value: 150, display: { top: -21, left: 0 } },
				/* Level 2 */ { name: "Blue Wizard", bonus: 2, css: "bluerobes", value: 500, display: { top: -19, left: 0 } },
				/* Level 3 */ { name: "Slasher", bonus: 3, css: "slasher", value: 1000, display: { top: 0, left: -3 } }
			],

			[ /* Rogue */
				/* Level 1 */ { name: "Corrupted Rogue", bonus: 1, css: "corruptedrogue", value: 150, display: { top: -11, left: -3 } },
				/* Level 2 */ { name: "Scout", bonus: 2, css: "scout", value: 500, display: { top: -3, left: 0 } },
				/* Level 3 */ { name: "Archer", bonus: 3, css: "archer", value: 1000, display: { top: 0, left: 0 } }
			]

	],

	Logic: {

		playerJoined: function (player, me) {},

		playerLeft: function(player) {
			var element = $("#"+player.$id);
			element.remove();

			// Reset the Player's opponent
			if(player.inCombat != "") {
				_HTTMUD.Networking.updatePlayer({ inCombat: "" }, null, player.inCombat);
			}
		},

		playerChanged: function(oldPlayer, newPlayer, me) {
			var element = $("#"+newPlayer.$id);

			// Health has decreased, show hitpoints
			if(oldPlayer.health > newPlayer.health) {
				var damage = oldPlayer.health - newPlayer.health;
				var hit = $("<div/>")
				.attr("class", (damage > 0 ? "hit" : "hit0"))
				.text(damage);

				$("#" + newPlayer.$id + " #hits").append(hit);
				hit.fadeOut('slow', this.remove);
			}

		},

		playerDeleted: function(player) {},

		playerClicked: function(playerId, me) {
			if(!me) {
				if(playerId === _HTTMUD.selectedPlayer) {
					_HTTMUD.Rendering.highlightPlayer(playerId, 0);
				} else {
					_HTTMUD.Rendering.highlightPlayer(playerId, 1);
				}
			}
		},
		
		iDied: function() {
					// A function to handle functionality for a dying user
			var thisPlayer = _HTTMUD.Networking.thisPlayer();
			if(thisPlayer.inCombat) { // Player is still in combat
				var killer = _HTTMUD.Networking.getPlayer(thisPlayer.inCombat);
				_HTTMUD.Networking.updatePlayer({ inCombat: "", coins: killer.coins + _HTTMUD.random(25, 100), kills: killer.kills + 1  }, null, thisPlayer.inCombat);
			}

			_HTTMUD.Networking.updatePlayer({ top: _HTTMUD.Settings.defaultPlayer.top, left: _HTTMUD.Settings.defaultPlayer.left, health: _HTTMUD.Settings.defaultPlayer.health, inCombat: "", deaths: thisPlayer.deaths + 1 });	
		}

	},

	Input: {

		// Centrally handle Touch/Click events
		touchClickEvents: {
			"#atk": function (target) {
				attackRef = target.parent().parent().attr('id');
				combat(attackRef);
			},
			"#chat-button": function (target) {
				_HTTMUD.Rendering.UI("Equipment").hide();
				_HTTMUD.Rendering.UI("Chat").toggle();
			},
			"#equip-button": function (target) {
				_HTTMUD.Rendering.UI("Chat").hide();
				_HTTMUD.Rendering.UI("Equipment").toggle();
			},
			"#upgWarrior": function(target) {
				_HTTMUD.Networking.upgrade(1);
			},
			"#upgWizard": function(target) {
				_HTTMUD.Networking.upgrade(2);
			},
			"#upgRogue": function(target) {
				_HTTMUD.Networking.upgrade(3);
			},
			".eqWarrior": function(target) {
				_HTTMUD.Networking.equip(1);
			},
			".eqWizard": function(target) {
				_HTTMUD.Networking.equip(2);
			},
			".eqRogue": function(target) {
				_HTTMUD.Networking.equip(3);
			},
			"#saveGame": function(target) {
				_HTTMUD.Networking.saveGame(); 
			},
			"#loadGame": function(target) {
				_HTTMUD.Networking.loadGame(); 
			},
			"#heal-button": function(target) {
				var thisPlayer = _HTTMUD.Networking.thisPlayer();
				if(thisPlayer.health == 100) {
					_HTTMUD.warning("You already have full health.");
					return;
				}
				if(thisPlayer.coins < 5) {
					_HTTMUD.warning("You do not have enough to heal yourself.");
					return;
				}
			
				_HTTMUD.Networking.updatePlayer({ coins: thisPlayer.coins - 5, health: 100 });
			}
		},

		// Centrally handle Long Press events
		longPressEvents: {
			".s2d_user": { triggerParent: true, delay: 2, action: function(target) {
				alert('Player healed');
			}}
		}

	},

	Interfaces: {
		Equipment: '#equip',
		Chat: '#chat'
	}

};

_HTTMUD.Angular = angular.module("SlashWars", ["firebase"]); // Reference to the AngularJS module
_HTTMUD.playerId = null; // Used to store the current Player's ID
_HTTMUD.playerRef = null;
_HTTMUD.canWalk = true; // Used to determine whether the Player can walk
_HTTMUD.selectedPlayer = null; // Used to identify the selected Player

// Initialise HTTMUD
_HTTMUD.init = function(_httmud) {
	if(typeof _httmud === "undefined") {
		return;
	}

	var overridableComponents = ["Settings", "Equipment", "Objects", "Input", "Logic", "Interfaces"];
	for(var i = 0; i < overridableComponents.length; i++) {
		if(typeof _httmud[overridableComponents[i]] === "object") {
			_HTTMUD[overridableComponents[i]] = _httmud[overridableComponents[i]];
		}
	}
	
	// Add Game Objects to the Document Object Model
	Object.keys(_HTTMUD.Objects).forEach(function(key,index) {
		var object = _httmud.Objects[key];

		// Append object to the canvas, hidden
		var element = $("<div/>").attr('id', key)
			.css({ 
				'position': 'absolute', 
				'top': object.top+'px', 
				'left': object.left+'px',
				'z-index': object.abovePlayer === true ? 5 : 0
				 })
			.css('width', object.width+'px').css('height', object.height+'px')
			.css('background', 'transparent url("'+_HTTMUD.Settings.resources+'/'+object.sprite+'") no-repeat')
			.css('background-size', object.width+'px '+object.height+'px')
			.addClass("object").hide();
		if(!element.clickable) {
			element.css('pointer-events', 'none');
		}
		$(_HTTMUD.Settings.canvasSelector).append(element);

		// Render the object isntantly
		if(object.render === true) {
			_HTTMUD.Rendering.GameObject(key).Render();
		}
	});
}

// Get a reference to the presence data in Firebase.
var chatListRef = new Firebase("https://rsps.firebaseio.com/chat");

var connectedRef = new Firebase("https://rsps.firebaseio.com/.info/connected");
connectedRef.on("value", function(snap) {
	online = (snap.val() === true);
});

var chatListQuery = chatListRef.limit(10);
chatListQuery.on('child_added', function (snapshot) {
	var message = snapshot.val();
	$('<div/>').text(message.text)
		.prepend($('<em/>')
		.text(message.name+': '))
		.appendTo($('#canvas #chat #messages'));
	$('#canvas #chat #messages')[0].scrollTop = $('#canvas #chat #messages')[0].scrollHeight;
});

// Function to handle all Facebook authentication
_HTTMUD.authenticate = function(ref, callback) {
ref.authWithOAuthPopup("facebook", function(error, authData) {
		if (error) {
			console.log("Login Failed!", error);
		} else {
			// Carry out an existence check as mandatory
			authData.savedRef = new Firebase(_HTTMUD.Settings.firebaseUrl + "/saved/" + authData.uid);
			authData.savedRef.once('value', function(snapshot) {
				authData.savedGame = snapshot.val();
				callback(authData);
			});
		}
	});
};

// Function to compare two Player objects to detect differences
_HTTMUD.hasPlayerChanged = function(oldPlayer, newPlayer) {
	for (var key in _HTTMUD.Settings.defaultPlayer) {
		if(typeof oldPlayer[key] === "object") {
			if(_HTTMUD.hasPlayerChanged(oldPlayer[key], newPlayer[key])) {
				return true;
			}
		} else if(oldPlayer[key] !== newPlayer[key]) {
			return true;
		}
	}
};

// Function to detect whether a user is within a certain range
_HTTMUD.isInRange = function(userX, userY, dist) {
	var minX = userX - dist, minY = userY - dist, maxX = userX + dist, maxY = userY + dist;
	var me = _HTTMUD.Networking.thisPlayer(), absX = me.left, absY = me.top;
	if((absX >= minX && absX <= maxX) && (absY >= minY && absY <= maxY)) {
		return true;
	}
	
	return false;
};

// Function to send the user a warning message
_HTTMUD.warning = function(message) {
	$('<div/>').css("color", "#B06868").text(message).prepend($('<em/>')).appendTo($('#canvas #chat #messages'));
	$('#canvas #chat #messages')[0].scrollTop = $('#canvas #chat #messages')[0].scrollHeight;
}

// Function to return a random integer between two values
_HTTMUD.random = function(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

// Function to escape any CSS identifiers in JQuery selection
_HTTMUD.escapeId = function(id) {
	return "#" + id.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
}

var atkRef = null, atkUsr = null, myUsr = null, combatId = null, 
	atkUsrName = null, myUsrName = null, atkDmgAmount = null, 
	myDmgAmount = null, attackRef = null;
function combat(opponentId) {
	var enemyCombatInit = false, selfCombatInit = false;
	atkUsr = _HTTMUD.Networking.getPlayer(opponentId);
	thisUsr = _HTTMUD.Networking.thisPlayer();
	if(opponentId == _HTTMUD.playerId || !opponentId || !atkUsr) {
		return; // Can't attack yourself
	}
	
	if(!_HTTMUD.isInRange(atkUsr.left, atkUsr.top, _HTTMUD.Settings.attackDistance)) {
		_HTTMUD.warning("You are not close enough to attack "+atkUsr.name);
		return;
	}
	
	// Set the opponent as in combat with this player
	_HTTMUD.Networking.atomicUpdate('inCombat', function(currentValue) {
		if(!currentValue && !thisUsr.inCombat) { // Empty or null
			_HTTMUD.Networking.updatePlayer({ inCombat: opponentId });
			return _HTTMUD.playerId;
		}
		
		_HTTMUD.warning("Either you or your opponent are already in combat.");
	}, function(error, committed, snapshot) {
		if(committed) {
			// No need to update our opponent atomically
			attack(opponentId);
		}
	}, opponentId);
}
	
function attack(opponentId) {
	
	var atkUsr = _HTTMUD.Networking.getPlayer(opponentId);
	var thisUsr = _HTTMUD.Networking.thisPlayer();
	
	if(atkUsr.inCombat !== _HTTMUD.playerId) {
		clearTimeout(combatId);
		_HTTMUD.Networking.updatePlayer({ inCombat: "" });
		_HTTMUD.warning(atkUsr.name+" is no longer in combat with you");
	}
	
	if(thisUsr.inCombat !== opponentId) {
		clearTimeout(combatId);
		_HTTMUD.Networking.updatePlayer({ inCombat: "" }, null, opponentId);
		_HTTMUD.warning(atkUsr.name+" is no longer in combat with you");
	}
	
	if(!_HTTMUD.isInRange(atkUsr.left, atkUsr.top, _HTTMUD.Settings.attackDistance)) {
		clearTimeout(combatId);
		_HTTMUD.Networking.updatePlayer({ inCombat: "" }, null, opponentId);
		_HTTMUD.Networking.updatePlayer({ inCombat: "" });
		_HTTMUD.warning("You are no longer in range with "+atkUsr.name);
		return;
	}
	
	if(atkUsr.health <= 0 || thisUsr.health <= 0) {
		clearTimeout(combatId);
		_HTTMUD.warning("Either you or your opponent have died");
		return;
	}
	
	atkDmgAmount = Math.floor(Math.random()*40);
	myDmgAmount = Math.floor(Math.random()*40);
	_HTTMUD.Networking.updatePlayer({ health: atkUsr.health-atkDmgAmount }, null, opponentId);
	_HTTMUD.Networking.updatePlayer({ health: thisUsr.health-myDmgAmount });

	// Setup the delay for the next attack
	combatId = setTimeout(attack, 2000, opponentId);
}
	
function hideOption() {
	$('#option').hide();
}

function combatLevel(attack, defence) {
	return (attack+defence)*2;
}
