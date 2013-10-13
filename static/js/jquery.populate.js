(function($) {
	var _regex = /\{([\w\.]*)\}/g;
	$.fn.populate = function(data) {
		return this.html().replace(_regex, function (str, key) {
			var keys = key.split('.'), value = data[keys.shift()];
			$.each(keys, function() { value = value[this]; });
			return (value === null || value === undefined) ? '' : value;
		});
	};
}(jQuery));
