/* NETWORKING COMPONENT */

(function(angular) {

	_HTTMUD.Angular.controller('PlayerCtrl', function($scope, $controller, $firebaseArray) {
    
    var ref = new Firebase(_HTTMUD.Settings.firebaseUrl+"/players");
		$scope.players = $firebaseArray(ref);
    
    	// Listens for changes to the Players list
		$scope.$watch("players", function(newValue, oldValue) {	
			// start timer

			if(newValue.length > oldValue.length) { // Player has joined
				var previousPlayers = {};
				oldValue.forEach(function(obj){ previousPlayers[obj.$id] = obj; });
				var joinedPlayers = newValue.filter(function(obj){ 
					return !(obj.$id in previousPlayers) && obj.status === 1;
				});	
				joinedPlayers.forEach(function(player) {
					var me = player.$id === _HTTMUD.playerId;
					if(me) {
						_HTTMUD.scrollViewport(player.left, player.top);
					}
					
					_HTTMUD.Logic.playerJoined(player, me);
				});
				
			} else if(newValue.length < oldValue.length) { // Player has left
				var currentPlayers = {}
				newValue.forEach(function(obj){
						currentPlayers[obj.$id] = obj;
				});
				var removedPlayers = oldValue.filter(function(obj){
						return !(obj.$id in currentPlayers);
				});	
				removedPlayers.forEach(_HTTMUD.Logic.playerDeleted);
				
			} else if(newValue.length == oldValue.length) { // Player has changed
				for(var i = 0; i < newValue.length; i++) {
					if(_HTTMUD.hasPlayerChanged(oldValue[i], newValue[i])) {
						var me = newValue[i].$id === _HTTMUD.playerId,
							element = $("#"+newValue[i].$id);
						
						// Player has went offline
						if(oldValue[i].status == 1 && newValue[i].status == 0) {
							_HTTMUD.Logic.playerLeft(newValue[i]);
							return;
						}
						
						// Transform the player's avatar after moving
						_HTTMUD.Transform.Object(element, newValue[i].left, newValue[i].top, function() {
							if(me) {
								_HTTMUD.canWalk = true;
							}
						});
						
						if(me) { // This player
							// Player is in combat
							if(newValue[i].inCombat != "") {
								_HTTMUD.Rendering.highlightPlayer(newValue[i].inCombat, 2);	
							}

							// Player has died
							if(oldValue[i].health > 0 && newValue[i].health <= 0) {
								_HTTMUD.Logic.iDied();
							}

							_HTTMUD.Rendering.scrollViewport(newValue[i].left, newValue[i].top);
						}					
						
						_HTTMUD.Logic.playerChanged(oldValue[i], newValue[i], me);
					}
				}
			}
		}, true);
		

		// Function to handle Player login
		$scope.login = function(ref) {
			$scope.playerId = ref.key();
			_HTTMUD.playerId = ref.key();
			_HTTMUD.playerRef = ref;
			
			// Set the onDisconnect function
			ref.onDisconnect().update(_HTTMUD.Settings.onDisconnect);
		};
		
		// Start a new character by default
		$scope.players.$add(_HTTMUD.Settings.defaultPlayer).then($scope.login);
    		
		// Function to retreive the current player record
		$scope.thisPlayer = function() {
			return $scope.players.$getRecord(_HTTMUD.playerId);
		}
		
		// Function to retreive a player record
		$scope.getPlayer = function(playerId) {
			return $scope.players.$getRecord(playerId);
		}
		
		// Function to perform a transactional update on a player
		$scope.atomicUpdate = function (childProperty, transaction, complete, playerId) {
			playerId = (typeof playerId === 'undefined') ? _HTTMUD.playerId : playerId;
			
			var ref = new Firebase(_HTTMUD.Settings.firebaseUrl+'/players/'+playerId+'/');
			ref.child(childProperty).transaction(transaction, complete);
		};
		
		// Function to upgrade a player's given class of armour
		$scope.upgrade = function(upgradeClass) {
			var thisPlayer = $scope.players.$getRecord(_HTTMUD.playerId);
			
			var currentEquipment = thisPlayer.equipment[upgradeClass];
			if(currentEquipment === 2) {
				_HTTMUD.warning("You already have the highest armour available for this class.");
				return;
			}
			
			var upgradeCost = $scope.equipment.armour[upgradeClass][currentEquipment+1].value;
			if(thisPlayer.coins < upgradeCost) {
				_HTTMUD.warning("You do not have enough for this upgrade. This upgrade costs "+upgradeCost);
				return;
			}
			
			// Perform the upgrade
			var playerIndex = $scope.players.$indexFor(_HTTMUD.playerId);
			$scope.players[playerIndex].coins -= upgradeCost;
			$scope.players[playerIndex].equipment[upgradeClass]++;
			
			// Persist the changes to the player
			$scope.players.$save(playerIndex);
		};
		
		// A function to update the current player
		$scope.updatePlayer = function(dataContract, callback, playerId) {
			// Make the third parameter optional, updating the current player by default
			playerId = (typeof playerId === 'undefined') ? _HTTMUD.playerId : playerId;

			var playerIndex = $scope.players.$indexFor(playerId);
			for (var property in dataContract) {
				$scope.players[playerIndex][property] = dataContract[property];
			}
			
			// Persist the player
			$scope.players.$save(playerIndex).then(callback);
		};
		
		// Functions to Save the Player's Game
		$scope.saveGame = function() {
			_HTTMUD.authenticate(ref, function(authData) {
				if(authData.savedGame !== null) { // User has saved before
					alert("You have already saved a previous game.");
				} else { // User hasnt saved before
					authData.savedRef.set({ player: _HTTMUD.playerId });
					$scope.updatePlayer({ auth: authData.token, name: authData.facebook.displayName });
				}
			});
		};
		
		// Function to Load the Player's Game
		$scope.loadGame = function() {
			_HTTMUD.authenticate(ref, function(authData) {
				if(authData.savedGame !== null) {
					if(authData.savedGame.player === _HTTMUD.playerId) {
						alert("Your saved game is already loaded.");
						return;
					}
					var loadedPlayerRef = ref.child(authData.savedGame.player),
							oldPlayer = _HTTMUD.playerId;
					$scope.login(loadedPlayerRef); // Login as the loaded player
					$scope.updatePlayer(_HTTMUD.Settings.onConnect, function(ref) {
						$scope.players.$remove($scope.players.$indexFor(oldPlayer)).then(function(ref) {
							alert("Game loaded");
						});
						
					});
				} else {
					alert("No player found for this Facebook Account.");
				}
			});
		};
    
		// Create a list of Players for the leaderboard
		var leaderboardQuery = ref.orderByChild("kills").limitToLast(25);
		$scope.leaderboard = $firebaseArray(leaderboardQuery);		
    
    	// Include the methods from EquipCtrl
		angular.extend(this, $controller('EquipCtrl', {$scope: $scope}));
		
		// Create a reference to $scope to be used outside Angular
		_HTTMUD.Networking = $scope;
	});
    
})(angular);

(function(angular) {

	_HTTMUD.Angular.controller('EquipCtrl', function($scope) {
    
    	// Function to switch the Player's equipment
		$scope.equip = function(equipClass) {
			var playerIndex = $scope.players.$indexFor(_HTTMUD.playerId);
		
			$scope.players[playerIndex].class = equipClass;
			
			// Persist the player
			$scope.players.$save(playerIndex);
		}
		
    	// Put equipment on $scope for the View to access
		$scope.equipment = {
			armour: _HTTMUD.Equipment,
			weapons: {}
		};
    
	});
	
})(angular);

/* END OF NETWORKING COMPONENT */
