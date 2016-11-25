var _canSticky = null;

export default class Can {

  static get sticky() {
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
  };

}
