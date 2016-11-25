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

var _scrollfeatures = require('scrollfeatures');

var _scrollfeatures2 = _interopRequireDefault(_scrollfeatures);

var _objectAssign = require('object-assign');

var _objectAssign2 = _interopRequireDefault(_objectAssign);

var _featureDetect = require('./featureDetect');

var _featureDetect2 = _interopRequireDefault(_featureDetect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var log = function log() {};

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
  wrapperStyle: null,
  elementStyle: null,
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

var getAbsolutBoundingRect = function getAbsolutBoundingRect(el, fixedHeight) {
  var rect = el.getBoundingClientRect();
  var top = rect.top + _scrollfeatures2.default.windowY;
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

var ReactStickyState = function (_Component) {
  _inherits(ReactStickyState, _Component);

  function ReactStickyState(props, context) {
    _classCallCheck(this, ReactStickyState);

    var _this = _possibleConstructorReturn(this, (ReactStickyState.__proto__ || Object.getPrototypeOf(ReactStickyState)).call(this, props, context));

    _this._updatingBounds = false;
    _this._shouldComponentUpdate = false;
    _this._updatingState = false;
    _this._key = 'sticky_' + Math.round(Math.random() * 1000);

    _this.state = (0, _objectAssign2.default)({}, initialState);

    if (props.debug === true) {
      log = console.log.bind(console);
    }

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
      var offsetHeight = _scrollfeatures2.default.documentHeight;
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

      // var style = noCache ? this.state.style : getPositionStyle(this.el);
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

      if (!_featureDetect2.default.sticky) {
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
    value: function updateBounds(silent, noCache, cb) {
      var _this2 = this;

      noCache = noCache === true;
      this._shouldComponentUpdate = silent !== true;

      this.setState(this.getBounds(noCache), function () {
        _this2._shouldComponentUpdate = true;
        if (cb) {
          cb();
        }
      });
    }

    // updateFixedOffset() {
    //   if (this.hasOwnScrollTarget && !Can.sticky) {

    //     if (this.state.sticky) {
    //       this.setState({ fixedOffset: this.scrollTarget.getBoundingClientRect().top + 'px' });
    //       if (!this.hasWindowScrollListener) {
    //         this.hasWindowScrollListener = true;
    //         ScrollFeatures.getInstance(window).on('scroll:progress', this.updateFixedOffset);
    //       }
    //     } else {
    //       this.setState({ fixedOffset: '' });
    //       if (this.hasWindowScrollListener) {
    //         this.hasWindowScrollListener = false;
    //         ScrollFeatures.getInstance(window).off('scroll:progress', this.updateFixedOffset);
    //       }
    //     }
    //   }
    // }


  }, {
    key: 'updateFixedOffset',
    value: function updateFixedOffset() {
      var fixedOffset = this.state.fixedOffset;
      if (this.state.sticky) {
        this.setState({ fixedOffset: this.scrollTarget.getBoundingClientRect().top + 'px;' });
      } else {
        this.setState({ fixedOffset: '' });
      }
      // if (fixedOffset !== this.state.fixedOffset) {
      //   this.render();
      // }
    }
  }, {
    key: 'addSrollHandler',
    value: function addSrollHandler() {
      if (!this.scroll) {
        var hasScrollTarget = _scrollfeatures2.default.hasInstance(this.scrollTarget);
        this.scroll = _scrollfeatures2.default.getInstance(this.scrollTarget);
        this.onScroll = this.onScroll.bind(this);
        this.scroll.on('scroll:start', this.onScroll);
        this.scroll.on('scroll:progress', this.onScroll);
        this.scroll.on('scroll:stop', this.onScroll);

        if (this.props.scrollClass.active) {
          this.onScrollDirection = this.onScrollDirection.bind(this);
          this.scroll.on('scroll:up', this.onScrollDirection);
          this.scroll.on('scroll:down', this.onScrollDirection);
          if (!this.props.scrollClass.persist) {
            this.scroll.on('scroll:stop', this.onScrollDirection);
          }
        }
        if (hasScrollTarget && this.scroll.scrollY > 0) {
          this.scroll.trigger('scroll:progress');
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
        if (this.props.scrollClass.active) {
          this.scroll.off('scroll:up', this.onScrollDirection);
          this.scroll.off('scroll:down', this.onScrollDirection);
          this.scroll.off('scroll:stop', this.onScrollDirection);
        }
        if (!this.scroll.hasListeners()) {
          this.scroll.destroy();
        }
        this.onScroll = null;
        this.onScrollDirection = null;
        this.scroll = null;
      }
    }
  }, {
    key: 'addResizeHandler',
    value: function addResizeHandler() {
      if (!this.onResize) {
        this.onResize = this.update.bind(this);
        window.addEventListener('sticky:update', this.onResize, false);
        window.addEventListener('resize', this.onResize, false);
        window.addEventListener('orientationchange', this.onResize, false);
      }
    }
  }, {
    key: 'removeResizeHandler',
    value: function removeResizeHandler() {
      if (this.onResize) {
        window.removeEventListener('sticky:update', this.onResize);
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('orientationchange', this.onResize);
        this.onResize = null;
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._updatingBounds = false;
      this._shouldComponentUpdate = false;
      this._updatingState = false;
      this.removeSrollHandler();
      this.removeResizeHandler();
      this.scrollTarget = null;
    }
  }, {
    key: 'getScrollClasses',
    value: function getScrollClasses(obj) {
      if (this.options.scrollClass.active) {
        obj = obj || {};
        var direction = this.scroll.y <= 0 || this.scroll.y + this.scroll.clientHeight >= this.scroll.scrollHeight ? 0 : this.scroll.directionY;
        obj[this.options.scrollClass.up] = direction < 0;
        obj[this.options.scrollClass.down] = direction > 0;
      }
      return obj;
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
      if (this.state.sticky || e && e.type === _scrollfeatures2.default.events.SCROLL_STOP) {
        this.setState({
          scrollClass: this.getScrollClass()
        });
      }
    }
  }, {
    key: 'onScroll',
    value: function onScroll(e) {
      this.updateStickyState(false);
      if (this.hasOwnScrollTarget && !_featureDetect2.default.sticky) {
        this.updateFixedOffset();
        if (this.state.sticky && !this.hasWindowScrollListener) {
          this.hasWindowScrollListener = true;
          _scrollfeatures2.default.getInstance(window).on('scroll:progress', this.updateFixedOffset);
        } else if (!this.state.sticky && this.hasWindowScrollListener) {
          this.hasWindowScrollListener = false;
          _scrollfeatures2.default.getInstance(window).off('scroll:progress', this.updateFixedOffset);
        }
      }
    }
  }, {
    key: 'update',
    value: function update() {
      var _this3 = this;

      this.scroll.updateScrollPosition();
      this.updateBounds(true, true, function () {
        _this3.updateStickyState(false);
      });
    }

    // update(force = false) {

    //   if (!this._updatingBounds) {
    //     log('update() force:' + force);
    //     this._updatingBounds = true;
    //     this.scroll.updateScrollPosition();
    //     this.updateBounds(true, true, () => {
    //       this.updateBounds(force, true, () => {
    //         this.scroll.updateScrollPosition();
    //         var updateSticky = this.updateStickyState(false, () => {
    //           if (force && !updateSticky) {
    //             this.forceUpdate();
    //           }
    //         });
    //         this._updatingBounds = false;
    //       });
    //     });
    //   }
    // }


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
      // var left = this.state.style.left;
      // var right = this.state.style.right;
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
    value: function updateStickyState(silent) {
      var _this4 = this;

      var values = this.getStickyState();

      if (values.sticky !== this.state.sticky || values.absolute !== this.state.absolute) {
        this._shouldComponentUpdate = silent !== true;
        values = (0, _objectAssign2.default)(values, this.getBounds());
        this._updatingState = true;
        this.setState(values, function () {
          _this4._shouldComponentUpdate = true;
          _this4._updatingState = false;
        });
      }
    }

    // updateStickyState(bounds = true, cb) {
    //   if (this._updatingState) {
    //     return;
    //   }
    //   var values = this.getStickyState();

    //   if (values.sticky !== this.state.sticky || values.absolute !== this.state.absolute) {
    //     this._updatingState = true;
    //     if (bounds) {
    //       values = assign(values, this.getBounds(), { scrollClass: this.getScrollClass() });
    //     }
    //     this.setState(values, () => {
    //       this._updatingState = false;
    //       if (typeof cb === 'function') {
    //         cb();
    //       }
    //     });
    //     return true;
    //   } else if (typeof cb === 'function') {
    //     cb();
    //   }
    //   return false;
    // }


  }, {
    key: 'initialize',
    value: function initialize() {
      var child = this.refs.wrapper || this.refs.el;
      this.scrollTarget = _scrollfeatures2.default.getScrollParent(child);
      this.hasOwnScrollTarget = this.scrollTarget !== window;
      if (this.hasOwnScrollTarget) {
        this.updateFixedOffset = this.updateFixedOffset.bind(this);
      }

      this.addSrollHandler();
      this.addResizeHandler();
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

      // console.log('huaa');
      setTimeout(function () {
        return _this5.initialize();
      }, 1);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.destroy();
    }
  }, {
    key: 'render',
    value: function render() {
      var _classNames;

      var element = _react2.default.Children.only(this.props.children);

      var _props = this.props,
          wrapperClass = _props.wrapperClass,
          stickyClass = _props.stickyClass,
          fixedClass = _props.fixedClass,
          stateClass = _props.stateClass,
          disabledClass = _props.disabledClass,
          absoluteClass = _props.absoluteClass,
          disabled = _props.disabled,
          debug = _props.debug,
          tagName = _props.tagName,
          props = _objectWithoutProperties(_props, ['wrapperClass', 'stickyClass', 'fixedClass', 'stateClass', 'disabledClass', 'absoluteClass', 'disabled', 'debug', 'tagName']);

      var style;
      var refName = 'el';
      var className = (0, _classnames2.default)((_classNames = {}, _defineProperty(_classNames, stickyClass, !this.state.disabled), _defineProperty(_classNames, disabledClass, this.state.disabled), _classNames), _defineProperty({}, fixedClass, !_featureDetect2.default.sticky), _defineProperty({}, stateClass, this.state.sticky && !this.state.disabled), _defineProperty({}, absoluteClass, this.state.absolute), this.state.scrollClass);

      if (!_featureDetect2.default.sticky) {
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
          ' ',
          this.props.children,
          ' '
        );
      }

      if (_featureDetect2.default.sticky) {
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
        { ref: 'wrapper', className: wrapperClass, style: style },
        element
      );
    }
  }]);

  return ReactStickyState;
}(_react.Component);

ReactStickyState.propTypes = {
  wrapperClass: _react.PropTypes.string,
  stickyClass: _react.PropTypes.string,
  fixedClass: _react.PropTypes.string,
  stateClass: _react.PropTypes.string,
  disabledClass: _react.PropTypes.string,
  absoluteClass: _react.PropTypes.string,
  disabled: _react.PropTypes.bool,
  debug: _react.PropTypes.bool,
  wrapFixedSticky: _react.PropTypes.bool,
  tagName: _react.PropTypes.string,
  scrollClass: _react.PropTypes.shape({
    down: _react.PropTypes.string,
    up: _react.PropTypes.string,
    none: _react.PropTypes.string,
    persist: _react.PropTypes.bool,
    active: _react.PropTypes.bool
  })
};
ReactStickyState.defaultProps = {
  wrapperClass: 'sticky-wrap',
  stickyClass: 'sticky',
  fixedClass: 'sticky-fixed',
  stateClass: 'is-sticky',
  disabledClass: 'sticky-disabled',
  absoluteClass: 'is-absolute',
  wrapFixedSticky: true,
  debug: false,
  disabled: false,
  tagName: 'div',
  scrollClass: {
    down: null,
    up: null,
    none: null,
    persist: false,
    active: false
  }
};
exports.default = ReactStickyState;
module.exports = exports['default'];