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

var log = function log() {};

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

function getDocumentHeight() {
  return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
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

    _this._updatingBounds = false;
    _this._shouldComponentUpdate = false;

    _this._updatingState = false;
    _this._key = 'sticky_' + Math.round(Math.random() * 1000);

    if (props.debug) {
      log = console.log.bind(console);
    }

    _this.state = {
      sticky: false,
      fixedOffset: '',
      absolute: false,
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
      var offsetHeight = getDocumentHeight();

      if (noCache !== true && this.state.bounds.height !== null) {
        if (clientRect.height === this.state.bounds.height && this.state.offsetHeight === offsetHeight) {
          log('getBounds:: return cached values');
          return {
            offsetHeight: offsetHeight,
            style: this.state.style,
            bounds: this.state.bounds,
            restrict: this.state.restrict
          };
        }
      }

      log('getBounds:: (re)calculate values');

      var style = getPositionStyle(this.refs.el);
      var child = this.refs.wrapper || this.refs.el;
      var rect;
      var restrict;
      var offset = 0;

      if (!this.canSticky) {
        rect = getAbsolutBoundingRect(child, clientRect.height);
        if (this.hasOwnScrollTarget) {
          var parentRect = getAbsolutBoundingRect(this.scrollTarget);
          offset = this.fastScroll.scrollY;
          rect = addBounds(rect, parentRect);
          restrict = parentRect;
          restrict.top = 0;
          restrict.height = this.scrollTarget.scrollHeight || restrict.height;
          restrict.bottom = restrict.height;
        }
      } else {
        var elem = getPreviousElementSibling(child);
        offset = 0;

        if (elem) {
          offset = parseInt(window.getComputedStyle(elem)['margin-bottom']);
          offset = offset || 0;
          rect = getAbsolutBoundingRect(elem);
          if (this.hasOwnScrollTarget) {
            rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
            offset += this.fastScroll.scrollY;
          }
          rect.top = rect.bottom + offset;
        } else {
          elem = child.parentNode;
          offset = parseInt(window.getComputedStyle(elem)['padding-top']);
          offset = offset || 0;
          rect = getAbsolutBoundingRect(elem);
          if (this.hasOwnScrollTarget) {
            rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
            offset += this.fastScroll.scrollY;
          }
          rect.top = rect.top + offset;
        }
        if (this.hasOwnScrollTarget) {
          restrict = getAbsolutBoundingRect(this.scrollTarget);
          restrict.top = 0;
          restrict.height = this.scrollTarget.scrollHeight || restrict.height;
          restrict.bottom = restrict.height;
        }

        rect.height = child.clientHeight;
        rect.width = child.clientWidth;
        rect.bottom = rect.top + rect.height;
      }

      restrict = restrict || getAbsolutBoundingRect(child.parentNode);

      return {
        offsetHeight: offsetHeight,
        style: style,
        bounds: rect,
        restrict: restrict
      };
    }
  }, {
    key: 'updateBounds',
    value: function updateBounds() {
      var noCache = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var _this2 = this;

      var shouldComponentUpdate = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
      var cb = arguments[2];

      this._shouldComponentUpdate = shouldComponentUpdate;
      this.setState(this.getBounds(noCache), function () {
        _this2._shouldComponentUpdate = true;
        if (cb) {
          cb();
        }
      });
    }
  }, {
    key: 'getStickyState',
    value: function getStickyState() {

      if (this.state.disabled) {
        return { sticky: false, absolute: false };
      }

      var scrollY = this.fastScroll.scrollY;
      var top = this.state.style.top;
      var bottom = this.state.style.bottom;
      var sticky = this.state.sticky;
      var absolute = this.state.absolute;

      if (top !== null) {
        var offsetBottom = this.state.restrict.bottom - this.state.bounds.height - top;
        top = this.state.bounds.top - top;
        if ( /*this.state.sticky === false &&*/scrollY >= top && scrollY <= offsetBottom) {
          sticky = true;
          absolute = false;
        } else if ( /*this.state.sticky &&*/scrollY < top || scrollY > offsetBottom) {
          sticky = false;
          absolute = scrollY > offsetBottom;
        }
      } else if (bottom !== null) {

        scrollY += window.innerHeight;
        var offsetTop = this.state.restrict.top + this.state.bounds.height - bottom;
        bottom = this.state.bounds.bottom + bottom;

        if ( /*this.state.sticky === false &&*/scrollY <= bottom && scrollY >= offsetTop) {
          sticky = true;
          absolute = false;
        } else if ( /*this.state.sticky &&*/scrollY > bottom || scrollY < offsetTop) {
          sticky = false;
          absolute = scrollY < offsetTop;
        }
      }
      return { sticky: sticky, absolute: this.canSticky ? false : absolute };
    }
  }, {
    key: 'updateStickyState',
    value: function updateStickyState() {
      var _this3 = this;

      var bounds = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];
      var cb = arguments[1];

      if (this._updatingState) {
        return;
      }
      var values = this.getStickyState();

      if (values.sticky !== this.state.sticky || values.absolute !== this.state.absolute) {
        this._updatingState = true;
        if (bounds) {
          values = (0, _objectAssign2.default)(values, this.getBounds());
        }
        this.setState(values, function () {
          _this3._updatingState = false;
          if (typeof cb === 'function') {
            cb();
          }
        });
        return true;
      } else if (typeof cb === 'function') {
        cb();
      }
      return false;
    }
  }, {
    key: 'updateFixedOffset',
    value: function updateFixedOffset() {
      if (this.hasOwnScrollTarget && !this.canSticky) {

        if (this.state.sticky) {
          this.setState({ fixedOffset: this.scrollTarget.getBoundingClientRect().top + 'px' });
          if (!this.hasWindowScrollListener) {
            this.hasWindowScrollListener = true;
            _fastscroll2.default.getInstance(window).on('scroll:progress', this.updateFixedOffset);
          }
        } else {
          this.setState({ fixedOffset: '' });
          if (this.hasWindowScrollListener) {
            this.hasWindowScrollListener = false;
            _fastscroll2.default.getInstance(window).off('scroll:progress', this.updateFixedOffset);
          }
        }
      }
    }
  }, {
    key: 'update',
    value: function update() {
      var _this4 = this;

      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];


      if (!this._updatingBounds) {
        log('update():: force:' + force);
        this._updatingBounds = true;
        this.updateBounds(true, true, function () {
          _this4.fastScroll.updateScrollPosition();
          _this4.updateBounds(force, true, function () {
            _this4.fastScroll.updateScrollPosition();
            var updateSticky = _this4.updateStickyState(false, function () {
              if (force && !updateSticky) {
                _this4.forceUpdate();
              }
            });
            _this4._updatingBounds = false;
          });
        });
      }
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      this.scrollTarget = window.getComputedStyle(this.refs.el.parentNode).overflow !== 'auto' ? window : this.refs.el.parentNode;
      this.hasOwnScrollTarget = this.scrollTarget !== window;
      if (this.hasOwnScrollTarget) {
        this.updateFixedOffset = this.updateFixedOffset.bind(this);
      }

      this.addSrollHandler();
      this.addResizeHandler();
      this.update();
    }
  }, {
    key: 'addSrollHandler',
    value: function addSrollHandler() {
      if (!this.fastScroll) {
        this.fastScroll = _fastscroll2.default.getInstance(this.scrollTarget);
        this.onScroll = this.onScroll.bind(this);
        this.fastScroll.on('scroll:start', this.onScroll);
        this.fastScroll.on('scroll:progress', this.onScroll);
        this.fastScroll.on('scroll:stop', this.onScroll);
      }
    }
  }, {
    key: 'removeSrollHandler',
    value: function removeSrollHandler() {
      if (this.fastScroll) {
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
    key: 'onScroll',
    value: function onScroll(e) {
      this.updateStickyState();
      this.updateFixedOffset();
    }
  }, {
    key: 'onResize',
    value: function onResize(e) {
      this.update();
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
        // this.onScroll = null;
      }
      this.fastScroll = null;
      this.scrollTarget = null;
    }
  }, {
    key: 'render',
    value: function render() {

      var element = _react2.default.Children.only(this.props.children);

      var style;
      var refName = 'el';
      var className = (0, _classnames2.default)({ 'sticky': !this.state.disabled, 'sticky-disabled': this.state.disabled }, { 'sticky-fixed': !this.canSticky }, { 'is-sticky': this.state.sticky && !this.state.disabled }, { 'is-absolute': this.state.absolute });

      if (!this.canSticky) {
        if (this.state.absolute) {

          style = {
            marginTop: this.state.style.top !== null ? this.state.restrict.height - (this.state.bounds.height + this.state.style.top) + (this.state.restrict.top - this.state.bounds.top) + 'px' : '',
            marginBottom: this.state.style.bottom !== null ? this.state.restrict.height - (this.state.bounds.height + this.state.style.bottom) + (this.state.restrict.bottom - this.state.bounds.bottom) + 'px' : ''
          };
        } else if (this.hasOwnScrollTarget && this.state.fixedOffset !== '') {
          style = {
            marginTop: this.state.fixedOffset
          };
        }
      }

      if (element) {
        element = _react2.default.cloneElement(element, { ref: refName, key: this._key, style: style, className: (0, _classnames2.default)(element.props.className, className) });
      } else {
        var Comp = this.props.tagName;
        element = _react2.default.createElement(
          Comp,
          { ref: refName, key: this._key, style: style, className: className },
          this.props.children
        );
      }

      if (this.canSticky) {
        return element;
      }

      var height = this.state.disabled || this.state.bounds.height === null || !this.state.sticky && !this.state.absolute ? 'auto' : this.state.bounds.height + 'px';
      style = {
        height: height
      };
      if (this.state.absolute) {
        style.position = 'relative';
      }
      return _react2.default.createElement(
        'div',
        { ref: 'wrapper', className: 'sticky-wrap', style: style },
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
  debug: _react2.default.PropTypes.bool,
  tagName: _react2.default.PropTypes.string
};
Sticky.defaultProps = {
  stickyClass: 'sticky',
  fixedClass: 'sticky-fixed',
  stateClass: 'is-sticky',
  debug: false,
  disabled: false,
  tagName: 'div'
};
exports.default = Sticky;
