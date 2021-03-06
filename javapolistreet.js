(function(Javapoli) {
	Javapoli = Javapoli || {};
	Javapoli.streetDefs = Javapoli.streetDefs || {};
var JavapoliStreet = function(game, obj) {
	this.game = game; // OK - later on we should have some kind of check going on if we really get a game delivered
	JavapoliStreet.prototype.setName.call(this, obj.name);
	JavapoliStreet.prototype.setPrice.call(this, obj.price);
	JavapoliStreet.prototype.setCallback.call(this, obj.callback);
	JavapoliStreet.prototype.setPlayer.call(this, obj.player);
	JavapoliStreet.prototype.setCredit.call(this, obj.credit);
	JavapoliStreet.prototype.setRent.call(this, obj.rent);
	JavapoliStreet.prototype.setStatus.call(this, obj.status);
	JavapoliStreet.prototype.setGroup.call(this, obj.group);
	JavapoliStreet.prototype.setGroupFactor.call(this, obj.group_factor);
};
JavapoliStreet.prototype.getName = function() {
	return this.name;
};
JavapoliStreet.prototype.setName = function(name) {
	if(name) {
		this.name = name;
		return true;
	}	
	return false;
};
JavapoliStreet.prototype.getPrice = function() {
	return this.price;
};
JavapoliStreet.prototype.setPrice = function(price) {
	if(price) {
		if(!isNaN(price)) {
			this.price = price;
			return true;
		}
	}
	return false;
};
JavapoliStreet.prototype.getCallback = function() {
	return this.callback;
};	
JavapoliStreet.prototype.setCallback = function(callback) {
	if(callback && this.game.isAllowedStreetCallback(callback)) {
		this.callback = callback;
		return true;
	}
	return false;
};
JavapoliStreet.prototype.setPlayer = function(player) {
	console.log("setting Player to " + player);
	if(this.game.players.length > player && player >= 0 ) {
		this.player = player;
		console.log(this.player);
		return true
	} else {
		this.player = this.player || null;
		console.log(this.player);
		return false;
	}	
};
JavapoliStreet.prototype.getPlayer = function() {
	return this.player;
};
JavapoliStreet.prototype.setPosition = function(pos) {
	if(!isNaN(pos) && pos >= 0 && pos < this.game.fields.length) {
		this.position = pos;
		return true;
	}
	return false;
};
JavapoliStreet.prototype.getPosition = function() {
	return this.position;
};
JavapoliStreet.prototype.setCredit = function(credit) {
	if(!isNaN(parseInt(credit))) {
		this.credit = parseInt(credit);
	} else {
		this.credit = 0;
	}
};
JavapoliStreet.prototype.getCredit = function() {
	if(this.status != "credit") {
		return this.credit;
	} else {
		return 0;
	}
};
JavapoliStreet.prototype.setRent = function(rent) {
	this.rent = rent; 
};
JavapoliStreet.prototype.getRent = function() {
	var state = this.status;
	if(this.getStatus() == "credit") return 0;
	return this.rent[state];
};
JavapoliStreet.prototype.setStatus = function(status) {
	if(status) {
		if( this instanceof JavapoliStreet ) {
			// when instantiated we can check if the status is related to a rent at all
			if(this.rent[status]) {
				this.status = status;
				return true;
			} else {
				this.status = "plain"; // fallback plan
				return false;
			}				
		} else {
			// when not yet instantiated we set the status to always begin with plain
			this.status = "plain";
		}		
	}
	else{
		this.status = "plain";
	}
};
JavapoliStreet.prototype.getStatus = function() {
	return this.status;
};
JavapoliStreet.prototype.setGroup = function(group) {
	if(group) {
		this.group = group;
	} else {
		this.group = null;
	}
};
JavapoliStreet.prototype.getGroup = function() {
	return this.group;
};
JavapoliStreet.prototype.setGroupFactor = function(groupfactor) {
	if(!isNaN(parseInt(groupfactor))) {
		this.group_factor = groupfactor;
	}
};
JavapoliStreet.prototype.getGroupFactor = function() {
	return this.group_factor;
};
Javapoli.streetDefs.JavapoliStreet = JavapoliStreet;

var JavapoliCommunityCard = function(game, obj) {
	this.game = game; 
	JavapoliCommunityCard.prototype.setName.call(this, obj.name);
	JavapoliCommunityCard.prototype.setText.call(this, obj.text);
	JavapoliCommunityCard.prototype.setCallback.call(this, obj.callback);
	JavapoliCommunityCard.prototype.setPlayer.call(this, obj.player);
	JavapoliCommunityCard.prototype.setStatus.call(this, obj.status);
	JavapoliCommunityCard.prototype.setCallbacks.call(this, obj.callbacks);
};
JavapoliCommunityCard.prototype.setCallbacks = function(callbacks) {
	this.callbacks = callbacks;
};
JavapoliCommunityCard.prototype.getRandomCallback = function() {
	var l = this.callbacks.length;
	var rnd = Math.floor(Math.random() * l);
	console.log(this.callbacks[rnd]);
	return this.callbacks[rnd];
};
JavapoliCommunityCard.prototype.setName = function(name) {
	this.name = name;
};
JavapoliCommunityCard.prototype.getName = function() {
	return this.name;
};
JavapoliCommunityCard.prototype.setText = function(text) {
	this.text = text;
};
JavapoliCommunityCard.prototype.getText = function() {
	return this.text;
};
JavapoliCommunityCard.prototype.setCallback = function(callback) {
	this.callback = callback; // OK checks later as with all these..
};
JavapoliCommunityCard.prototype.getCallback = function() {
	return this.callback;
};
JavapoliCommunityCard.prototype.setPlayer = function(player) {
	player = player || null;
	this.player = player;
};
JavapoliCommunityCard.prototype.getPlayer = function() {
	return this.player;
};
JavapoliCommunityCard.prototype.setStatus = function() {
	this.status = status;
};
JavapoliCommunityCard.prototype.getStatus = function() {
	return this.status;
};

Javapoli.streetDefs.JavapoliCommunityCard = JavapoliCommunityCard;

return Javapoli;
})(Javapoli);
