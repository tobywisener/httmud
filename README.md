# httmud
2D Browser Based Framework for Multi User Dungeon Games

![Players in Combat](https://github.com/tobywisener/httmud/blob/master/Screenshots/Screenshot_4.png?raw=true)

A very basic browser-based game framework depending on AngularJS, JQuery, Firebase (for Networking component)

-Players can Set nicknames, Move, Attack, Level Up, Pick up items, Chat
-Players can save/load progress by Authenticating with Facebook
-Leaderboard support with online/offline status
-Works on Mobile, Tablet & Desktop with responsive UI's for each

Get Started:
```
	<!-- JQuery, AngularJS, Firebase & AngularFire -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.9.0/jquery.min.js"></script>
	<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.min.js"></script>
	<script src="https://cdn.firebase.com/js/client/2.2.9/firebase.js"></script>
	<script src="https://cdn.firebase.com/libs/angularfire/1.1.3/angularfire.min.js"></script>
		
	<!-- Include the Development version of HTTMUD: -->
	<script src="./framework/Logic.js"></script>
	<script src="./framework/Transform.js"></script>
	<script src="./framework/Networking.js"></script>
	<script src="./framework/Rendering.js"></script>
	<script src="./framework/Input.js"></script>
	<!-- OR include a production (compiled/minified) version: 
	<script src="./_httmud.js"></script>
	-->
	<script>
	
	// Initialise HTTMUD
  	_HTTMUD.init({
		
		// General HTTMUD settings
		Settings: {
			firebaseUrl: 'https://rsps.firebaseio.com',
			resources: './_httmud/Resources',
			canvasSelector: '#canvas',
			playerSelector: '.s2d_user',
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
		}, // End of Settings component
		
		// Game Objects
		Objects: {
			/**/
			"tree": { width: 465, height: 415, top: 500, left: 400, sprite: "tree.png", abovePlayer: true, render: true } 
			
		} // End of Game Objects
		
	});

	</script>
  ```
  
 Example game board (SlashWars):
   ```
 <div id="canvas" onselectstart="return false;">
		<div ng-repeat="player in players" 
				 ng-if="player.status!=0"
				 class="s2d_user" id="{{player.$id}}"
				 style="top: {{::player.top}}px; left: {{::player.left}}px">
			<div id="equipment" 
					 class="{{equipment.armour[player.class][getPlayer(player.$id).equipment[player.class]].css}}"
					 style="left: {{equipment.armour[player.class][getPlayer(player.$id).equipment[player.class]].display.left}}px; 
									top: {{equipment.armour[player.class][getPlayer(player.$id).equipment[player.class]].display.top}}px"></div>
			 <div id="hits"></div>
			 <div id="highlight"></div>
			<div id="ui"><div id="atk"></div></div>
			<div class="health"><div class="hp" style="width: {{player.health/100*30}}px"></div></div>
		</div>
		<div id="debug"></div>
		<div id="option"></div>
		<div id="chat-button"></div>
		<div id="heal-button"></div>
		<div id="coins-icon"><span>{{ thisPlayer().coins }}</span></div>
		<div id="chat">
			<div id="messages"></div>
			<div id="form" style="left: 51px; top: 27px"><input id="inputter" type="text"/></div>
		</div>
		<div id="equip-button"></div>
		<div id="equip">
			<div class="split">
			<table>
  			<tbody>
					<tr>
						<td colspan="2">Warrior Equipment</td>
					</tr>
  				<tr>
						<td><div id="equipment" class="eqWarrior {{ equipment.armour[1][players.$getRecord(playerId).equipment[1]].css }}"></div></td>
						<td>
							{{equipment.armour[1][thisPlayer().equipment[1]].name}}<br/>
							Level {{ thisPlayer().equipment[1] }}<br/>
							Atk +{{equipment.armour[1][thisPlayer().equipment[1]].bonus}}<br/>
							<button id="upgWarrior"
											ng-disabled="thisPlayer().equipment[1] == 2">Upgrade: {{ equipment.armour[1][thisPlayer().equipment[1]+1].value || 'N/A' }}</button><br>
						</td>
					</tr>
				</tbody>
			</table>
			<table>
  			<tbody>
					<tr>
						<td colspan="2">Wizard Equipment</td>
					</tr>
  				<tr>
						<td><div id="equipment" class="eqWizard {{ equipment.armour[2][players.$getRecord(playerId).equipment[2]].css }}"></div></td>
						<td>
							{{equipment.armour[2][thisPlayer().equipment[2]].name}}<br/>
							Level {{ thisPlayer().equipment[2] }}<br/>
							Atk +{{equipment.armour[2][thisPlayer().equipment[2]].bonus}}<br/>
							<button id="upgWizard"
											ng-disabled="thisPlayer().equipment[2] == 2">Upgrade: {{ equipment.armour[2][thisPlayer().equipment[2]+1].value || 'N/A' }}</button><br>
						</td>
					</tr>
				</tbody>
			</table>
			<table>
  			<tbody>
					<tr>
						<td colspan="2">Rogue Equipment</td>
					</tr>
  				<tr>
						<td><div id="equipment" class="eqRogue {{ equipment.armour[3][players.$getRecord(playerId).equipment[3]].css }}"></div></td>
						<td>
							{{equipment.armour[3][thisPlayer().equipment[3]].name}}<br/>
							Level {{ thisPlayer().equipment[3] }}<br/>
							Atk +{{equipment.armour[3][thisPlayer().equipment[3]].bonus}}<br/>
							<button id="upgRogue"
											ng-disabled="thisPlayer().equipment[3] == 2">Upgrade: {{ equipment.armour[3][thisPlayer().equipment[3]+1].value || 'N/A' }}</button><br>
						</td>
					</tr>
				</tbody>
			</table>
			</div>
			<div class="split">
				<table>
					<tr><td><button id="healPlayer">Heal: 5</button></td></tr>
					<tr><td><button id="saveGame">Save Game</button></td></tr>
					<tr><td><button id="loadGame">Load Game</button></td></tr>
				</table>
			</div>
		</div>
	</div>
  ```
  
  ![Example Screen Layouts](https://github.com/tobywisener/httmud/blob/master/Screenshots/Screenshot_5.png?raw=true)
  
  ![Stress Test](https://github.com/tobywisener/httmud/blob/master/Screenshots/Screenshot_6.png?raw=true)
