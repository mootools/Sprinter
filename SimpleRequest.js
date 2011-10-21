var SimpleRequest = (function(){

	var SimpleRequest = function(){
		this.xhr = this.createXHR();
	};

	SimpleRequest.prototype = {

		createXHR: function(){
			return ('XMLHttpRequest' in window) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		},

		stateChange: function(fn){
			if(this.xhr.readyState == 4 && this.xhr.status == 200){
				fn.call(this, this.xhr.responseText);
			}
		},

		send: function(url, fn){
			var self = this;
			this.xhr.onreadystatechange = function(){ self.stateChange(fn); };
			this.xhr.open('get', url + '?n=' + (new Date()).getTime(), true);
			this.xhr.send(null);
		}

	};

	return SimpleRequest;
})();
