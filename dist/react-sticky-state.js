'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _scrollEvents = require('scroll-events');

var _scrollEvents2 = _interopRequireDefault(_scrollEvents);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = function log() {};

var getAbsolutBoundingRect = function getAbsolutBoundingRect(el, fixedHeight) {
  var rect = el.getBoundingClientRect();
  var top = rect.top + _scrollEvents2.default.windowScrollY;
  var height = fixedHeight || rect.height;
  return {
    top: top,
    bottom: top + height,
    height: height,
    width: rect.width,
    left: rect.left,
    right: rect.right
  };
};

var addBounds = function addBounds(rect1, rect2) {
  var rect = (0, _objectAssign2.default)({}, rect1);
  rect.top -= rect2.top;
  rect.left -= rect2.left;
  rect.right = rect.left + rect1.width;
  rect.bottom = rect.top + rect1.height;
  return rect;
};

var getPositionStyle = function getPositionStyle(el) {

  var result = {};
  var style = window.getComputedStyle(el, null);

  for (var key in initialState.style) {
    var value = parseInt(style.getPropertyValue(key));
    value = isNaN(value) ? null : value;
    result[key] = value;
  }

  return result;
};

var getPreviousElementSibling = function getPreviousElementSibling(el) {
  var prev = el.previousElementSibling;
  if (prev && prev.tagName.toLocaleLowerCase() === 'script') {
    prev = getPreviousElementSibling(prev);
  }
  return prev;
};

var initialState = {
  sticky: false,
  absolute: false,
  fixedOffset: '',
  offsetHeight: 0,
  bounds: {
    top: null,
    left: null,
    right: null,
    bottom: null,
    height: null,
    width: null
  },
  restrict: {
    top: null,
    left: null,
    right: null,
    bottom: null,
    height: null,
    width: null
  },
  scrollClass: null,
  initialStyle: null,
  style: {
    top: null,
    bottom: null,
    left: null,
    right: null,
    'margin-top': 0,
    'margin-bottom': 0,
    'margin-left': 0,
    'margin-right': 0
  },
  disabled: false
};

var ReactStickyState = function (_Component) {
  _inherits(ReactStickyState, _Component);

  function ReactStickyState(props, context) {
    _classCallCheck(this, ReactStickyState);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ReactStickyState).call(this, props, context));

    _this._updatingBounds = false;
    _this._shouldComponentUpdate = false;

    _this._updatingState = false;
    _this._key = 'sticky_' + Math.round(Math.random() * 1000);

    if (props.debug === true) {
      log = console.log.bind(console);
    }

    _this.state = initialState;
    return _this;
  }

  _createClass(ReactStickyState, [{
    key: 'getBoundingClientRect',
    value: function getBoundingClientRect() {
      return this.refs.el.getBoundingClientRect();
    }
  }, {
    key: 'getBounds',
    value: function getBounds(noCache) {

      var clientRect = this.getBoundingClientRect();
      var offsetHeight = _scrollEvents2.default.documentHeight;
      noCache = noCache === true;

      if (noCache !== true && this.state.bounds.height !== null) {
        if (this.state.offsetHeight === offsetHeight && clientRect.height === this.state.bounds.height) {
          return {
            offsetHeight: offsetHeight,
            style: this.state.style,
            bounds: this.state.bounds,
            restrict: this.state.restrict
          };
        }
      }

      // var style = noCache ? this.state.style : getPositionStyle(this.refs.el);
      var initialStyle = this.state.initialStyle;
      if (!initialStyle) {
        initialStyle = getPositionStyle(this.refs.el);
      }

      var style = initialStyle;
      var child = this.refs.wrapper || this.refs.el;
      var rect;
      var restrict;
      var offsetY = 0;
      var offsetX = 0;

      if (!Can.sticky) {
        rect = getAbsolutBoundingRect(child, clientRect.height);
        if (this.hasOwnScrollTarget) {
          var parentRect = getAbsolutBoundingRect(this.scrollTarget);
          offsetY = this.scroll.y;
          rect = addBounds(rect, parentRect);
          restrict = parentRect;
          restrict.top = 0;
          restrict.height = this.scroll.scrollHeight || restrict.height;
          restrict.bottom = restrict.height;
        }
      } else {
        var elem = getPreviousElementSibling(child);
        offsetY = 0;

        if (elem) {
          offsetY = parseInt(window.getComputedStyle(elem)['margin-bottom']);
          offsetY = offsetY || 0;
          rect = getAbsolutBoundingRect(elem);
          if (this.hasOwnScrollTarget) {
            rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
            offsetY += this.scroll.y;
          }
          rect.top = rect.bottom + offsetY;
        } else {
          elem = child.parentNode;
          offsetY = parseInt(window.getComputedStyle(elem)['padding-top']);
          offsetY = offsetY || 0;
          rect = getAbsolutBoundingRect(elem);
          if (this.hasOwnScrollTarget) {
            rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
            offsetY += this.scroll.y;
          }
          rect.top = rect.top + offsetY;
        }
        if (this.hasOwnScrollTarget) {
          restrict = getAbsolutBoundingRect(this.scrollTarget);
          restrict.top = 0;
          restrict.height = this.scroll.scrollHeight || restrict.height;
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
        initialStyle: initialStyle,
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

      var scrollY = this.scroll.y;
      var scrollX = this.scroll.x;
      var top = this.state.style.top;
      var bottom = this.state.style.bottom;
      var left = this.state.style.left;
      var right = this.state.style.right;
      var sticky = this.state.sticky;
      var absolute = this.state.absolute;

      if (top !== null) {
        var offsetBottom = this.state.restrict.bottom - this.state.bounds.height - top;
        top = this.state.bounds.top - top;

        if (this.state.sticky === false && (scrollY >= top && scrollY <= offsetBottom || top <= 0 && scrollY < top)) {
          sticky = true;
          absolute = false;
        } else if (this.state.sticky && (top > 0 && scrollY < top || scrollY > offsetBottom)) {
          sticky = false;
          absolute = scrollY > offsetBottom;
        }
      } else if (bottom !== null) {

        scrollY += window.innerHeight;
        var offsetTop = this.state.restrict.top + this.state.bounds.height - bottom;
        bottom = this.state.bounds.bottom + bottom;

        if (this.state.sticky === false && scrollY <= bottom && scrollY >= offsetTop) {
          sticky = true;
          absolute = false;
        } else if (this.state.sticky && (scrollY > bottom || scrollY < offsetTop)) {
          sticky = false;
          absolute = scrollY <= offsetTop;
        }
      }
      return { sticky: sticky, absolute: absolute };
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
          values = (0, _objectAssign2.default)(values, this.getBounds(), { scrollClass: this.getScrollClass() });
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
      if (this.hasOwnScrollTarget && !Can.sticky) {

        if (this.state.sticky) {
          this.setState({ fixedOffset: this.scrollTarget.getBoundingClientRect().top + 'px' });
          if (!this.hasWindowScrollListener) {
            this.hasWindowScrollListener = true;
            _scrollEvents2.default.getInstance(window).on('scroll:progress', this.updateFixedOffset);
          }
        } else {
          this.setState({ fixedOffset: '' });
          if (this.hasWindowScrollListener) {
            this.hasWindowScrollListener = false;
            _scrollEvents2.default.getInstance(window).off('scroll:progress', this.updateFixedOffset);
          }
        }
      }
    }

    /*
    update() {
      this.scroll.updateScrollPosition();
      this.updateBounds(true, true);
      this.updateStickyState(false);
    }
     */

  }, {
    key: 'update',
    value: function update() {
      var _this4 = this;

      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];


      if (!this._updatingBounds) {
        log('update():: force:' + force);
        this._updatingBounds = true;
        this.updateBounds(true, true, function () {
          _this4.scroll.updateScrollPosition();
          _this4.updateBounds(force, true, function () {
            _this4.scroll.updateScrollPosition();
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
      var child = this.refs.wrapper || this.refs.el;
      this.scrollTarget = _scrollEvents2.default.getScrollParent(child);
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
      if (!this.scroll) {
        this.scroll = _scrollEvents2.default.getInstance(this.scrollTarget);
        this.onScroll = this.onScroll.bind(this);
        this.onScrollDirection = this.onScrollDirection.bind(this);
        this.scroll.on('scroll:start', this.onScroll);
        this.scroll.on('scroll:progress', this.onScroll);
        this.scroll.on('scroll:stop', this.onScroll);
        if (this.props.scrollClass.up || this.props.scrollClass.down) {
          this.scroll.on('scroll:up', this.onScrollDirection);
          this.scroll.on('scroll:down', this.onScrollDirection);
          if (!this.props.scrollClass.persist) {
            this.scroll.on('scroll:stop', this.onScrollDirection);
          }
        }
      }
    }
  }, {
    key: 'removeSrollHandler',
    value: function removeSrollHandler() {
      if (this.scroll) {
        this.scroll.off('scroll:start', this.onScroll);
        this.scroll.off('scroll:progress', this.onScroll);
        this.scroll.off('scroll:stop', this.onScroll);
        this.scroll.off('scroll:up', this.onScrollDirection);
        this.scroll.off('scroll:down', this.onScrollDirection);
        this.scroll.off('scroll:stop', this.onScrollDirection);
        this.scroll.destroy();
        this.scroll = null;
      }
    }
  }, {
    key: 'addResizeHandler',
    value: function addResizeHandler() {
      if (!this.resizeHandler) {
        this.resizeHandler = this.onResize.bind(this);
        window.addEventListener('sticky:update', this.resizeHandler, false);
        window.addEventListener('resize', this.resizeHandler, false);
        window.addEventListener('orientationchange', this.resizeHandler, false);
      }
    }
  }, {
    key: 'removeResizeHandler',
    value: function removeResizeHandler() {
      if (this.resizeHandler) {
        window.removeEventListener('sticky:update', this.resizeHandler);
        window.removeEventListener('resize', this.resizeHandler);
        window.removeEventListener('orientationchange', this.resizeHandler);
        this.resizeHandler = null;
      }
    }
  }, {
    key: 'getScrollClass',
    value: function getScrollClass() {
      if (this.props.scrollClass.up || this.props.scrollClass.down) {

        var direction = this.scroll.y <= 0 || this.scroll.y + this.scroll.clientHeight >= this.scroll.scrollHeight ? 0 : this.scroll.directionY;
        var scrollClass = direction < 0 ? this.props.scrollClass.up : this.props.scrollClass.down;
        scrollClass = direction === 0 ? null : scrollClass;
        return scrollClass;
      }
      return null;
    }
  }, {
    key: 'onScrollDirection',
    value: function onScrollDirection(e) {

      if (this.state.sticky || e && e.type === _scrollEvents2.default.EVENT_SCROLL_STOP) {
        this.setState({
          scrollClass: this.getScrollClass()
        });
        // this.refs.el.className = classNames(this.refs.el.className, this.getScrollClassObj());
      }
    }
  }, {
    key: 'onScroll',
    value: function onScroll(e) {
      this.updateStickyState();
      if (this.hasOwnScrollTarget && !Can.sticky) {
        this.updateFixedOffset();
        if (this.state.sticky && !this.hasWindowScrollListener) {
          this.hasWindowScrollListener = true;
          _scrollEvents2.default.getInstance(window).on('scroll:progress', this.updateFixedOffset);
        } else if (!this.state.sticky && this.hasWindowScrollListener) {
          this.hasWindowScrollListener = false;
          _scrollEvents2.default.getInstance(window).off('scroll:progress', this.updateFixedOffset);
        }
      }
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

    // componentWillUpdate(nextProps, nextState){

    // }

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
      if (this.scroll && this.scroll.dispatcher && !this.scroll.dispatcher.hasListeners()) {
        this.scroll.destroy();
        // this.onScroll = null;
      }
      this.scroll = null;
      this.scrollTarget = null;
    }
  }, {
    key: 'render',
    value: function render() {
      var _classNames;

      var element = _react2.default.Children.only(this.props.children);

      var _props = this.props;
      var stickyWrapperClass = _props.stickyWrapperClass;
      var stickyClass = _props.stickyClass;
      var fixedClass = _props.fixedClass;
      var stateClass = _props.stateClass;
      var disabledClass = _props.disabledClass;
      var absoluteClass = _props.absoluteClass;
      var disabled = _props.disabled;
      var debug = _props.debug;
      var tagName = _props.tagName;

      var props = _objectWithoutProperties(_props, ['stickyWrapperClass', 'stickyClass', 'fixedClass', 'stateClass', 'disabledClass', 'absoluteClass', 'disabled', 'debug', 'tagName']);

      var style;
      var refName = 'el';
      var className = (0, _classnames2.default)((_classNames = {}, _defineProperty(_classNames, stickyClass, !this.state.disabled), _defineProperty(_classNames, disabledClass, this.state.disabled), _classNames), _defineProperty({}, fixedClass, !Can.sticky), _defineProperty({}, stateClass, this.state.sticky && !this.state.disabled), _defineProperty({}, absoluteClass, this.state.absolute), this.state.scrollClass);

      if (!Can.sticky) {
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
          _extends({ ref: refName,
            key: this._key,
            style: style,
            className: className }, props),
          this.props.children
        );
      }

      if (Can.sticky) {
        return element;
      }

      var height = this.state.disabled || this.state.bounds.height === null || !this.state.sticky && !this.state.absolute ? 'auto' : this.state.bounds.height + 'px';
      var marginTop = height === 'auto' ? '' : this.state.style['margin-top'] ? this.state.style['margin-top'] + 'px' : '';
      var marginBottom = height === 'auto' ? '' : this.state.style['margin-bottom'] ? this.state.style['margin-bottom'] + 'px' : '';

      style = {
        height: height,
        marginTop: marginTop,
        marginBottom: marginBottom
      };
      if (this.state.absolute) {
        style.position = 'relative';
      }
      return _react2.default.createElement(
        'div',
        { ref: 'wrapper',
          className: stickyWrapperClass,
          style: style },
        ' ',
        element,
        ' '
      );
    }
  }]);

  return ReactStickyState;
}(_react.Component);

ReactStickyState.propTypes = {
  stickyWrapperClass: _react.PropTypes.string,
  stickyClass: _react.PropTypes.string,
  fixedClass: _react.PropTypes.string,
  stateClass: _react.PropTypes.string,
  disabledClass: _react.PropTypes.string,
  absoluteClass: _react.PropTypes.string,
  disabled: _react.PropTypes.bool,
  debug: _react.PropTypes.bool,
  tagName: _react.PropTypes.string,
  scrollClass: _react.PropTypes.object
};
ReactStickyState.defaultProps = {
  stickyWrapperClass: 'sticky-wrap',
  stickyClass: 'sticky',
  fixedClass: 'sticky-fixed',
  stateClass: 'is-sticky',
  disabledClass: 'sticky-disabled',
  absoluteClass: 'is-absolute',
  debug: false,
  disabled: false,
  tagName: 'div',
  scrollClass: {
    down: null,
    up: null,
    none: null,
    persist: false
  }
};
exports.default = ReactStickyState;


var _canSticky = null;

var Can = function () {
  function Can() {
    _classCallCheck(this, Can);
  }

  _createClass(Can, null, [{
    key: 'sticky',
    get: function get() {
      if (_canSticky !== null) {
        return _canSticky;
      }
      if (typeof window !== 'undefined') {

        if (window.Modernizr && window.Modernizr.hasOwnProperty('csspositionsticky')) {
          return _globals.canSticky = window.Modernizr.csspositionsticky;
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

module.exports = exports['default'];