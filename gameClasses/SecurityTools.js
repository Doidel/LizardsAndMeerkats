var SecurityTools = IgeClass.extend({
    classId: 'SecurityTools',

    init: function () {
        this._minimalizeInputRegex = /^[0-9a-zA-Z ]+/;
    },

    minimalizeInputString: function(string) {
        if (string) {
            var matches = string.match(this._minimalizeInputRegex);
            if (matches) {
                return matches[0];
            }
        }
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = SecurityTools; }