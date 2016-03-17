'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.stickyNative = stickyNative;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _fastscroll = require('fastscroll');

var _fastscroll2 = _interopRequireDefault(_fastscroll);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _globals = {
  featureTested: false
};

function stickyNative() {
  if (_globals.featureTested) {
    return _globals.canSticky;
  }
  if (typeof window !== 'undefined') {
    _globals.featureTested = true;

    if (window.Modernizr && window.Modernizr.hasOwnProperty('csspositionsticky')) {
      return _globals.canSticky = window.Modernizr.csspositionsticky;
    }

    _globals.canSticky = false;
    var testEl = document.createElement('div');
    document.documentElement.appendChild(testEl);
    var prefixedSticky = ['sticky', '-webkit-sticky'];

    for (var i = 0; i < prefixedSticky.length; i++) {
      testEl.style.position = prefixedSticky[i];
      _globals.canSticky = !!window.getComputedStyle(testEl).position.match('sticky');
      if (_globals.canSticky) {
        break;
      }
    }
    document.documentElement.removeChild(testEl);
  }
  return _globals.canSticky;
};

function getSrollPosition() {
  return window.scrollY || window.pageYOffset || 0;
}

function getAbsolutBoundingRect(el, fixedHeight) {
  var rect = el.getBoundingClientRect();
  var top = rect.top + getSrollPosition();
  var height = fixedHeight || rect.height;
  return {
    top: top,
    bottom: top + height,
    height: height,
    width: rect.width
  };
}

function addBounds(rect1, rect2) {
  var rect = (0, _objectAssign2.default)({}, rect1);
  rect.top -= rect2.top;
  rect.bottom = rect.top + rect1.height;
  return rect;
}

function getPositionStyle(el) {
  var obj = {
    top: null,
    bottom: null
  };

  for (var key in obj) {
    var value = parseInt(window.getComputedStyle(el)[key]);
    value = isNaN(value) ? null : value;
    obj[key] = value;
  }

  return obj;
}

function getPreviousElementSibling(el) {
  var prev = el.previousElementSibling;
  if (prev && prev.tagName.toLocaleLowerCase() === 'script') {
    prev = getPreviousElementSibling(prev);
  }
  return prev;
}

var Sticky = function (_Component) {
  _inherits(Sticky, _Component);

  function Sticky(props, context) {
    _classCallCheck(this, Sticky);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Sticky).call(this, props, context));

    _this._shouldComponentUpdate = false;
    _this._updatingState = false;
    _this._key = 'sticky_' + Math.round(Math.random() * 1000);

    _this.state = {
      sticky: false,
      fixedOffset: {
        top: 0,
        bottom: 0
      },
      bounds: {
        top: null,
        bottom: null,
        height: null,
        width: null
      },
      restrict: {
        top: null,
        bottom: null,
        height: null,
        width: null
      },
      style: {
        top: null,
        bottom: null
      },
      disabled: props.disabled
    };
    return _this;
  }

  _createClass(Sticky, [{
    key: 'getBoundingClientRect',
    value: function getBoundingClientRect() {
      return this.refs.el.getBoundingClientRect();
    }
  }, {
    key: 'getBounds',
    value: function getBounds(noCache) {

      var clientRect = this.getBoundingClientRect();

      if (noCache !== true && this.state.bounds.height !== null) {

        if (clientRect.height === this.state.bounds.height) {
          return {
            bounds: this.state.bounds,
            restrict: this.state.restrict
          };
        }
      }

      var style = getPositionStyle(this.refs.el);
      var child = this.refs.wrapper || this.refs.el;
      var rect;
      var restrict;

      var fixedOffset = {
        top: 0,
        bottom: 0
      };

      if (!this.canSticky) {
        rect = getAbsolutBoundingRect(this.refs.wrapper, clientRect.height);
        if (this.hasOwnScrollTarget) {
          var parentRect = getAbsolutBoundingRect(this.scrollTarget);

          fixedOffset.top = parentRect.top;
          fixedOffset.bottom = parentRect.bottom;

          rect = addBounds(rect, parentRect);
          restrict = (0, _objectAssign2.default)({}, rect);
        }
      } else {
        var elem = getPreviousElementSibling(child);
        var offset = 0;

        if (elem) {
          offset = parseInt(window.getComputedStyle(elem)['margin-bottom']);
          offset = offset || 0;
          rect = getAbsolutBoundingRect(elem);
          if (this.hasOwnScrollTarget) {
            rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
          }

          rect.top = rect.bottom + offset;
        } else {
          elem = child.parentNode;
          offset = parseInt(window.getComputedStyle(elem)['padding-top']);
          offset = offset || 0;
          rect = getAbsolutBoundingRect(elem);
          if (this.hasOwnScrollTarget) {
            rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
          }
          rect.top = rect.top + offset;
        }

        rect.height = this.refs.el.clientHeight;
        rect.width = this.refs.el.clientWidth;
        rect.bottom = rect.top + rect.height;
      }
      restrict = restrict || getAbsolutBoundingRect(child.parentNode);

      return {
        fixedOffset: fixedOffset,
        style: style,
        bounds: rect,
        restrict: restrict
      };
    }
  }, {
    key: 'updateBounds',
    value: function updateBounds(cb) {
      this.setState(this.getBounds(true), cb);
    }
  }, {
    key: 'getStickyState',
    value: function getStickyState() {

      if (this.state.disabled) {
        return false;
      }

      var scrollY = this.fastScroll.scrollY;
      var top = this.state.style.top;
      var sticky = this.state.sticky;
      var offsetBottom;

      if (top !== null) {
        offsetBottom = this.state.restrict.bottom - this.state.bounds.height - top;
        top = this.state.bounds.top - top;

        if (this.state.sticky === false && scrollY >= top && scrollY <= offsetBottom) {
          sticky = true;
        } else if (this.state.sticky && (scrollY < top || scrollY > offsetBottom)) {
          sticky = false;
        }
        return sticky;
      }

      scrollY += window.innerHeight;
      var bottom = this.state.style.bottom;
      if (bottom !== null) {
        offsetBottom = this.state.restrict.top + this.state.bounds.height - bottom;
        bottom = this.state.bounds.bottom + bottom;

        if (this.state.sticky === false && scrollY <= bottom && scrollY >= offsetBottom) {
          sticky = true;
        } else if (this.state.sticky && (scrollY > bottom || scrollY < offsetBottom)) {
          sticky = false;
        }
      }
      return sticky;
    }
  }, {
    key: 'updateStickyState',
    value: function updateStickyState() {
      var _this2 = this;

      if (this._updatingState) {
        return;
      }
      var sticky = this.getStickyState();

      if (sticky !== this.state.sticky) {
        this._updatingState = true;
        var state = this.getBounds();
        state.sticky = sticky;
        this.setState(state, function () {
          return _this2._updatingState = false;
        });
      }
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this3 = this;

      this.scrollTarget = stickyNative() ? window.getComputedStyle(this.refs.el.parentNode).overflow !== 'auto' ? window : this.refs.el.parentNode : window;
      this.hasOwnScrollTarget = this.scrollTarget !== window;

      this.addSrollHandler();
      this.addResizeHandler();

      this._shouldComponentUpdate = false;
      this.updateBounds(function () {
        _this3._shouldComponentUpdate = true;
        _this3.updateStickyState();
      });
    }
  }, {
    key: 'addSrollHandler',
    value: function addSrollHandler() {
      if (!this.onScroll) {
        this.fastScroll = _fastscroll2.default.getInstance(this.scrollTarget);
        this.onScroll = this.updateStickyState.bind(this);
        this.fastScroll.on('scroll:start', this.onScroll);
        this.fastScroll.on('scroll:progress', this.onScroll);
        this.fastScroll.on('scroll:stop', this.onScroll);
      }
    }
  }, {
    key: 'removeSrollHandler',
    value: function removeSrollHandler() {
      if (this.onScroll) {
        this.fastScroll.off('scroll:start', this.onScroll);
        this.fastScroll.off('scroll:progress', this.onScroll);
        this.fastScroll.off('scroll:stop', this.onScroll);
      }
    }
  }, {
    key: 'addResizeHandler',
    value: function addResizeHandler() {
      if (!this.resizeHandler) {
        this.resizeHandler = this.onResize.bind(this);
        window.addEventListener('resize', this.resizeHandler, false);
        window.addEventListener('orientationchange', this.resizeHandler, false);
      }
    }
  }, {
    key: 'removeResizeHandler',
    value: function removeResizeHandler() {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('orientationchange', this.resizeHandler);
        this.resizeHandler = null;
      }
    }
  }, {
    key: 'onResize',
    value: function onResize(e) {
      var _this4 = this;

      this._shouldComponentUpdate = false;
      this.updateBounds(function () {
        _this4._shouldComponentUpdate = true;
        _this4.updateStickyState();
      });
    }
  }, {
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(newProps, newState) {
      return this._shouldComponentUpdate;
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      if (props.disabled !== this.state.disabled) {
        this.setState({
          disabled: props.disabled
        });
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this5 = this;

      setTimeout(function () {
        return _this5.initialize();
      }, 1);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._shouldComponentUpdate = false;
      this.removeSrollHandler();
      this.removeResizeHandler();

      //TODO optimize
      if (!this.fastScroll.dispatcher.hasListeners()) {
        this.fastScroll.destroy();
        this.onScroll = null;
        this.fastScroll = null;
      }
      this.scrollTarget = null;
    }
  }, {
    key: 'render',
    value: function render() {

      var element = _react2.default.Children.only(this.props.children);

      var refName = 'el';
      var className = (0, _classnames2.default)({ 'sticky': !this.state.disabled, 'sticky-disabled': this.state.disabled }, { 'sticky-fixed': !this.canSticky }, { 'is-sticky': this.state.sticky && !this.state.disabled });

      if (element) {
        element = _react2.default.cloneElement(element, { ref: refName, key: this._key, className: (0, _classnames2.default)(element.props.className, className) });
      } else {
        var Comp = this.props.tagName;
        element = _react2.default.createElement(
          Comp,
          { ref: refName, key: this._key, className: className },
          this.props.children
        );
      }

      if (this.canSticky) {
        return element;
      }

      var height = this.state.disabled || !this.state.sticky || this.state.bounds.height === null ? 'auto' : this.state.bounds.height + 'px';
      // const  height = (this.state.disabled || this.state.bounds.height === null) ? 'auto' : this.state.bounds.height + 'px';
      return _react2.default.createElement(
        'div',
        { ref: 'wrapper', className: 'sticky-wrap', style: { height: height } },
        element
      );
    }
  }, {
    key: 'canSticky',
    get: function get() {
      return stickyNative();
    }
  }]);

  return Sticky;
}(_react.Component);

Sticky.propTypes = {
  stickyClass: _react2.default.PropTypes.string,
  fixedClass: _react2.default.PropTypes.string,
  stateClass: _react2.default.PropTypes.string,
  disabled: _react2.default.PropTypes.bool,
  tagName: _react2.default.PropTypes.string
};
Sticky.defaultProps = {
  stickyClass: 'sticky',
  fixedClass: 'sticky-fixed',
  stateClass: 'is-sticky',
  disabled: false,
  tagName: 'div'
};
exports.default = Sticky;
