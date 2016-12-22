'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _canSticky = null;

var Can = function () {
  function Can() {
    (0, _classCallCheck3.default)(this, Can);
  }

  (0, _createClass3.default)(Can, null, [{
    key: 'sticky',
    get: function get() {
      if (_canSticky !== null) {
        return _canSticky;
      }

      if (typeof window !== 'undefined') {

        if (window.Modernizr && window.Modernizr.hasOwnProperty('csspositionsticky')) {
          return _canSticky = window.Modernizr.csspositionsticky;
        }

        var documentFragment = document.documentElement;
        var testEl = document.createElement('div');
        documentFragment.appendChild(testEl);
        var prefixedSticky = ['sticky', '-webkit-sticky'];

        _canSticky = false;

        for (var i = 0; i < prefixedSticky.length; i++) {
          testEl.style.position = prefixedSticky[i];
          _canSticky = !!window.getComputedStyle(testEl).position.match('sticky');
          if (_canSticky) {
            break;
          }
        }
        documentFragment.removeChild(testEl);
      }
      return _canSticky;
    }
  }]);
  return Can;
}();

exports.default = Can;
module.exports = exports['default'];