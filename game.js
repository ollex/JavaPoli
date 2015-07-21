(function(Javapoli){
Javapoli = Javapoli || {};
var	self = this,
	currentCallback = "initPlayerNum",
	can_move = true,
	stepped = false,
	oldT = 10000;
	//q.Javapoli = {},
	Javapoli.fields = Javapoli.fields || [];
	Javapoli.html = "";
	Javapoli.players = Javapoli.players || [],
	Javapoli.dmoney = Javapoli.dmoney || 150000,
	Javapoli.currentPlayer = 0,
	Javapoli.allowed_funcs = Javapoli.allowed_funcs || [];
	Javapoli.allowed_funcs.push("step");
	Javapoli.allowed_funcs.push("go");
	Javapoli.allowed_funcs.push("exit");
	Javapoli.allowed_funcs.push("buy");
	Javapoli.allowed_funcs.push("sell");
	Javapoli.allowed_funcs.push("money");
	Javapoli.allowed_funcs.push("streets");
	Javapoli.allowed_funcs.push("credit");
	Javapoli.allowed_funcs.push("commands");
	Javapoli.funcDesc = Javapoli.funcDesc || {
		step: 		"step lets you roll the dice and advance the respecive street fields.",
		go:			"go is an alias for step.",
		exit: 		"exit starts a new Javapoli",
		buy:		"buy:street,vendor,price  lets you buy a street of another player.",
		sell:		"sell:street,buyer,price  lets you sell a street to another player",
		money:		"money shows the respective earned or remaining Javapoli currency of each player",
		streets:	"streets:own  lets you see street posessions of each player (no : plus parameter) or your own (: plus own)",
		credit:		"credit:street lets you turn the chosen street into money. You cannot get paid for landings on this street though while credited."
	},
	Javapoli.isAllowedStreetCallback = Javapoli.isAllowedStreetCallback || function() {
		return true;
	};
	Javapoli.initPlayerNum = function(input) {
		if(	isNaN(parseInt(input)) ) {
			return this.updateHtml( "<li>"+input + "</li><li>Please type an integer number...!</li>" );
		}
		for(var i = 0; i < input; i++) {
			this.addPlayer();		
		}
		currentCallback = "setPlayerNames";
		return this.updateHtml( input + "<li>Please add the Player Names ("+input+" names), comma-separated.</li>" );
	},
	Javapoli.commands = function() {
		for (var key in this.Javapoli.funcDesc) {
			this.updateHtml("<li>"+this.Javapoli.funcDesc[key]+"</li>");
		}
		this.checkIfMore();
	},
	Javapoli.credit = function(arguments) {
		var street;
		if( arguments.length ) {
			street = arguments[0];
			if(isNaN(parseInt(street))) {
				street = this.getStreetIndexFromName(street);
				if(street === false) return this.updateHtml("<li>The street does not exists, please try again!</li>");
			}		
			if(street < 0 || street > this.fields.length -1) return this.updateHtml("<li>The street index you typed is not existing</li>");
			if(this.fields[street].getPlayer() != this.currentPlayer) return this.updateHtml("<li>You do not own this street... no credit on it. Ty another!</li>");
			if(this.fields[street].getStatus() == "credit") return this.updateHtml("<li>The street is already credited. Please choose another!</li>");
			this.players[this.Javapoli.currentPlayer].money += this.Javapoli.fields[street].getCredit();
			this.fields[street].setStatus("credit");
			this.updateHtml("<li>The bank has provided you "+this.fields[street].getCredit()+"€ for "+this.fields[street].getName()+"</li>");
			this.checkIfMore();
		} else {
			this.updateHtml("<li>Please use the credit function with the syntax credit:[street], where street is either the name or index of the field you want to turn into credit.</li>")
		}
	},
	Javapoli.sell = function(arguments) {
		var street, buyer, price, street_validated = true, buyer_validated = true, price_validated = true, errors = [];
		if ( arguments.length > 0 ) {
			var street = arguments[0];
		}
		if (arguments.length >= 1) {
			buyer = arguments[1];
		}
		if (arguments.length >= 2) {
			price = arguments[2];
		}
		if(street === undefined || buyer === undefined || price === undefined)
		return this.updateHtml("<li>Please check if you typed sell:[street][buyer][price] with street and buyer as their indizes or names as the command can't be properly parsed.</li>");
		
		if(isNaN(parseInt(price))) {
			errors.push("The price must be a positive integer number.");
			price_validated = false;
		} else {
			price = parseInt(price);
			if(price < 1) {
				errors.push("The price must be > 0");
				price_validated = false;
			}
		}
		
		if(isNaN(parseInt(street))) {
			street = this.getStreetIndexFromName(street);
			if(street === false) errors.push("The street does not exists, please check your input!");
			street_validated = false;
		} else {
			street = parseInt(street);
			if(street < 0 || street > this.fields.length - 1) {
				errors.push("The street index you typed is not exisiting.");
				street_validated = false;
			}
		}
		
		if ( street_validated && this.fields[street].getPlayer() != this.currentPlayer ) {
			errors.push("You don't own this field.");
		}
		
		if(isNaN(parseInt(buyer))) {
			buyer = this.getPlayerIndexFromName(buyer);
			if(buyer === false) errors.push("The buyer does not exist, please check your input!");
			buyer_validated = false;
		} else {
			buyer = parseInt(buyer);
			if(buyer < 0 || buyer > this.players.length - 1) {
				buyer_validated = false;
				errors.push("The buyer index you typed does not exists.");
			}
		}
		if ( buyer_validated && this.players[buyer] == this.players[this.currentPlayer] ) {
			errors.push("You can't sell to your own.");
		}
		
		if(errors.length)  {
			this.updateHtml("<li>Cannot meaningfully parse your input:</li>");
			this.updateHtml("<li>"+errors.join(',')+"</li>");
		 } else {
			if( confirm(this.players[buyer].name + ", do you really want to buy "+this.fields[street].getName()+" for " +price+"?"))
			{
				this.players[buyer].money -= price;
				this.players[this.currentPlayer].money += price;
				this.fields[street].setPlayer(buyer);
				if (this.checkMoney(buyer)) {
					this.updateHtml("<li>Sold! "+this.players[buyer].name+" has €"+this.players[buyer].money+" left"
					+" and "+this.players[this.currentPlayer].name+" has €"+this.players[this.currentPlayer].money+" left.</li>");
					this.checkIfMore();
				}
			} else {
				this.updateHtml("<li>OK - not sold.</li>");
				this.checkIfMore();
			}					
		 }
	},
	Javapoli.getStreetIndexFromName = function(name) {
		var exists = false;
		for (var k = 0; k < this.fields.length; k++) {
			if(this.fields[k].getName() == name) {
				exists = true;
				break;
			}
		}
		if(exists) return k;
		return false;
	},
	Javapoli.getPlayerIndexFromName = function(name) {
		var exists = false;
		for (var k = 0; k < this.players.length; k++) {
			if(this.players[k].name == name) {
				exists = true;
				break;
			}
		}
		if(exists) return k;
		return false;
	},
	Javapoli.setPlayerNames = function(names) {
		var sep_names = names.split(",");
		if ( sep_names.length != this.players.length) {
			this.updateHtml("You need " + this.players.length + " Names, but provided " + sep_names.length + "!");
		} else {
			for(var i = 0; i < sep_names.length; i++) {
				this.setPlayerName(i, sep_names[i]);
			}
			currentCallback = "parseCommand";
			this.step();
		}
	},
	Javapoli.step = function(){
		if(can_move) {
			var eyes = this.rollDice();
			stepped = true;
			this.updateHtml("<li> player "+ this.players[this.currentPlayer].name + " advances " + eyes + " fields</li>");
			var pos = this.players[this.currentPlayer].position + eyes;
			if (pos > this.fields.length - 1){
				pos = pos - this.fields.length;		
				if (pos > 0) {
					this.players[this.currentPlayer].money += 2000000;
					this.updateHtml("<li>you just earned 2000000 € due to passing the start field.</li>")
				}
			}
			if(pos === 0) {
				this.players[this.currentPlayer].money += 4000000;
				this.updateHtml("<li>you just earned 4000000 € due to landing on the start field.</li>")
			}
			this.updateHtml("<li> he lands on "+this.fields[pos].getName());
			this.players[this.currentPlayer].position = pos;
			var callback = this.fields[pos].getCallback();
			this[callback]();
		} else {
			this.updateHtml("<li>You are not allowed to move twice...</li>");
			this.checkIfMore();
		}
	},
	Javapoli.addPlayer = function() {
		this.players.push({ name: "default", money: this.dmoney, position: 0 });
	},
	Javapoli.money = function() {
		for(var i = 0 ; i < this.players.length ; i++){
			this.updateHtml("<li>"+this.players[i].name+" has "+this.players[i].money+" € </li>");
		};
		this.checkIfMore();
	},
	Javapoli.go = function() {
		this.step()
	},
	Javapoli.streets = function() {		
		if(arguments.length && arguments[0] == "own") {
			var str_eets = [], owns = false;
			for (var k = 0; k < this.fields.length; k++) {
				if(this.fields[k].getPlayer() == this.currentPlayer) {
					owns = true;
					str_eets.push( this.fields[k].getName() + " ("+k+" - "+this.fields[k].getStatus()+")");
				}
			}
		this.updateHtml("<li>You own: " + ( owns ? str_eets.join(" + ") : " nothing" ) + "</li>")			
		} else {
			for(var i = 0; i < this.players.length; i++) {
			var str_eets = [], owns = false;
				for(var k = 0; k < this.fields.length; k++) {
					if(this.fields[k].getPlayer() == i) {
						owns = true;
						str_eets.push( this.fields[k].getName() + " ("+k+" "+this.fields[k].getStatus()+")" );
					}
				}
			this.updateHtml("<li>" + this.players[i].name + " owns: " + ( owns ? str_eets.join(" + ") : " nothing" ) + "</li>");
			}	
		}			
		this.checkIfMore();
	},
	Javapoli.setPlayerName = function(index, name) {
		this.players[index].name = name;
		this.updateHtml("<li>Player "+index+" set to "+name+"</li>");
	},
	Javapoli.getNumPlayers = function() {
		return this.players.length;
	},
	Javapoli.rollDice = function() {		
		return ( Math.floor(Math.random() * 6) + 1 ) + ( Math.floor(Math.random() * 6) + 1 );
	},
	Javapoli.getGroupFactor = function(index) {
		var l = this.fields.length,
			group = this.fields[index].getGroup(),
			is_grouped = true,
			ownerIndex = this.fields[index].getPlayer();
		for (var i = 0; i < l; i++) {
			if(this.fields[i].getGroup() == group) {
				if( this.fields[i].player != ownerIndex ) 				
				{
					is_grouped = false;
					break;
				}							
			}
		}
		if(!is_grouped) return 1;
		return this.fields[index].getGroupFactor();
	},
	Javapoli._streetFieldLanding = function() {
		var index = this.players[this.currentPlayer].position;
		var field = this.fields[index];
		// pay rent ? +++++++++++++++++++++++++++++++++++++++++++++++++++
		if (index > 0 && field.getPlayer() !== null) { // 0 is the start field which can't be purchased
			if (this.currentPlayer != field.getPlayer()) {
				if (field.getStatus() != "credit") {
					var gFactor = this.getGroupFactor(index);
					var rent =  field.getRent();
					this.updateHtml("<li>"+this.players[this.currentPlayer].name +" pays "+this.players[field.player].name +" "+ rent +" €</li>");
					if(gFactor > 1) this.updateHtml("<li>"+this.players[field.player].name+" has all streets of this group, so the rent was raised by the factor "+gFactor+"</li>");
					this.currentPlayer.money -= rent;
					this.players[field.player].money += rent;
					if(this.checkMoney()) {
						this.checkIfMore();
					}
				} else {
					this.updateHtml("<li>The field is currently used for a credit. No fees apply for landing here.</li>");
					this.checkIfMore();
				}
			} else {
				this.checkIfMore();
			}			
		} 
		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		// buy ? +++++++++++++++++++++++++++++++++++++++++++++++++
		else{
			if(index > 0) {
				currentCallback = "buyStreet";
				this.updateHtml("<li> would you like to buy "+field.getName()+" for "+field.getPrice()+" € ?</li>");
			} else {
				this.checkIfMore();
			}		
		}
		// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++
		
	},
	Javapoli.checkIfMore = function() {
		if(stepped) can_move = false;
		this.updateHtml("<li>Do you want to take more actions?</li>");
		currentCallback = "wantMore";
	},
	Javapoli.buyStreet=function(input){
		if(input == "y" || input == "yes"){
			var field = this.fields[ this.players[ this.currentPlayer ].position ];
			this.players[this.currentPlayer].money -= field.getPrice();
			field.setPlayer( this.currentPlayer );
			this.updateHtml("<li>Purchased! You have "+this.players[this.currentPlayer].money+" € left </li>");
		} else {
			this.updateHtml("<li>Not purchased!</li>");
		}
		if (this.checkMoney()) {
			this.checkIfMore();
			currentCallback = "wantMore";
		}		
	},
	Javapoli.wantMore = function(input) {
		currentCallback = "parseCommand";
		if(input == "n" || input == "no") {
			stepped = false;
			this.nextPlayer();
			can_move = true;
			this.updateHtml("<li>OK - " + this.players[this.currentPlayer].name + " is now playing his next step!'</li>");
		} else if(this.is_allowed(input.split(":")[0])) {
			if(stepped) can_move = false;
			this.parseCommand(input);
		} else {
			if(stepped) can_move = false, cmd = input.split(":")[0];
			if(cmd == "y" || cmd == "yes" ) {
				this.updateHtml("<li>OK, waiting for your next command!</li>");
			}
			 else {
				this.updateHtml("<li>Hm - treating this "+cmd+" as a yes, waiting for your next command!</li>");
			 }
		}
	},
	Javapoli.checkMoney = function() {
	if(arguments.length) {
		index = arguments[0];
	} else {
		index = this.currentPlayer;
	}	
		if(this.players[index].money < 0) {
			this.updateHtml("<li>"+this.players[index].name+" lost!</li>");			
			currentCallback="restart";
			this.updateHtml("<li> press any key to restart the this.Javapoli </li>");
			return false;
		}
		return true;
	},
	Javapoli.restart=function(input){
			location.reload()
	},
	Javapoli.nextPlayer = function() {
		
			if(this.currentPlayer < this.players.length - 1) {
				this.currentPlayer ++;
			} else {
				this.currentPlayer = 0;
			}
		
	},
	Javapoli.is_allowed = function(cmd) {
		if(this.allowed_funcs.indexOf(cmd) !== -1) {
			return true;
		} 
		return false;
	},
	Javapoli.parseCommand = function(input) {
		if(input != "") {		
			input = input.trim();
			var x = input.split(":");
			var cmd = x[0];
			if(x[1] !== undefined) {
				var arguments = x[1].trim();
				arguments = arguments.split(",");
				console.log(arguments);
			} else {
				var arguments = null;
			}
				if( this.is_allowed(cmd)) {
					this[cmd](arguments);
				} else {
				this.updateHtml("<li>Command does not exist!</li>");
				}
			}	
	},
	Javapoli.init = function() {
	var self = this, j = JavapoliImportedStreets;
	for(var i = 0; i< j.length; i++) {
		// here next step is to add name of Street Object, parse it and add it "by name", so Streets are completely fexible
		this.fields.push(new this.streetDefs[j[i].type](self, j[i]));
	}
		this.updateHtml( "<li>Welcome to Javapoli!<br/>If you get stuck type 'commands' without quotation marks to get instructions.</li><li>How many of you are there?</li>" );
		document.getElementById("body").addEventListener("keypress", function(ev){
			if (ev.keyCode === 13)
			self._parseInput(document.getElementById("cmd").value);
		});
		document.getElementById('cmd').addEventListener("blur", function(ev) {
			ev.preventDefault();
			this.focus();
		});
		document.getElementById('cmd').focus();
		//var s = new JavapoliStreet(this.Javapoli, "Teststreet", 50000, "_streetFieldLanding", null, 40000, {plain: 10000, a1: 50000, a2: 100000, a3: 500000, a4: 1000000, h: 5000000}, "plain", 4, 4);
	},
	Javapoli._parseInput = function(input) {
		// mach was mit dem Input
			if(input != "") {	
			document.getElementById("cmd").value = "";
			input = input.trim();
			this[currentCallback](input);
		}		
	},
	Javapoli.scrollIt = function(){
		var self = this;
		var el = document.getElementById('gametext');
		var curT = new Date().getTime();
		var d = curT - oldT;
		var hd = el.scrollHeight - el.offsetHeight, 
		dhd = hd - el.scrollTop; 
			if (dhd > 0) {
				el.scrollTop += 1;
				el.scrollTop += Math.floor( dhd / 20 );
				oldT = curT;
				setTimeout(function() { self.scrollIt(); }, 10 - (d < 10 ? d : 0));
//maybe a setInterval / clearInterval can do the trick with less overhead - try it out!				
			} 
	},
	Javapoli.updateHtml = function(text) {
		this.html += text;
		var el = document.getElementById("gametext");
		el.innerHTML = this.html;
		this.scrollIt();	
	};
return Javapoli;
})(Javapoli);
