'use strict';

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import FastScroll from 'fastscroll';
import assign from 'object-assign';

var log = function(){};


var _globals = {
  featureTested: false
};

export function stickyNative() {
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
  return (window.scrollY || window.pageYOffset || 0);
}

function getDocumentHeight() {
  return Math.max( document.body.scrollHeight, document.body.offsetHeight,  document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
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
  var rect = assign({}, rect1);
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

export default class Sticky extends Component {

  static propTypes = {
    stickyClass: React.PropTypes.string,
    fixedClass: React.PropTypes.string,
    stateClass:  React.PropTypes.string,
    disabled: React.PropTypes.bool,
    debug: React.PropTypes.bool,
    tagName: React.PropTypes.string
  };

  static defaultProps = {
    stickyClass: 'sticky',
    fixedClass: 'sticky-fixed',
    stateClass: 'is-sticky',
    debug: false,
    disabled: false,
    tagName: 'div'
  };

  constructor(props, context) {
    super(props, context);

    this._updatingBounds = false;
    this._shouldComponentUpdate = false;

    this._updatingState = false;
    this._key = 'sticky_' + Math.round(Math.random() * 1000);

    if(props.debug) {
      log = console.log.bind(console);
    }


    this.state = {
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
  }

  get canSticky() {
    return stickyNative();
  }

  getBoundingClientRect() {
    return this.refs.el.getBoundingClientRect();
  }

  getBounds(noCache) {

    const clientRect  = this.getBoundingClientRect();
    const offsetHeight = getDocumentHeight();

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

  updateBounds(noCache = true, shouldComponentUpdate = true, cb) {
    this._shouldComponentUpdate = shouldComponentUpdate;
    this.setState(this.getBounds(noCache), ()=>{
      this._shouldComponentUpdate = true;
      if(cb){
        cb();
      }
    });
  }

  getStickyState() {

    if (this.state.disabled) {
      return {sticky: false, absolute: false};
    }

    var scrollY = this.fastScroll.scrollY;
    var top = this.state.style.top;
    var bottom = this.state.style.bottom;
    var sticky = this.state.sticky;
    var absolute = this.state.absolute;

    if (top !== null) {
      var offsetBottom = this.state.restrict.bottom - this.state.bounds.height - top;
      top = this.state.bounds.top - top;
      if (/*this.state.sticky === false &&*/ scrollY >= top && scrollY <= offsetBottom) {
        sticky = true;
        absolute = false;
      } else if (/*this.state.sticky &&*/ (scrollY < top || scrollY > offsetBottom)) {
        sticky = false;
        absolute =  scrollY > offsetBottom;
      }
    } else if (bottom !== null) {

      scrollY += window.innerHeight;
      var offsetTop = this.state.restrict.top + this.state.bounds.height - bottom;
      bottom = this.state.bounds.bottom + bottom;

      if (/*this.state.sticky === false &&*/ scrollY <= bottom && scrollY >= offsetTop) {
        sticky = true;
        absolute = false;
      } else if (/*this.state.sticky &&*/ (scrollY > bottom || scrollY < offsetTop)) {
        sticky = false;
        absolute =  scrollY < offsetTop;
      }
    }
    return {sticky: sticky, absolute: (this.canSticky ? false : absolute) };
  }

  updateStickyState(bounds = true, cb) {
    if(this._updatingState) {
        return;
    }
    var values = this.getStickyState();

    if (values.sticky !== this.state.sticky || values.absolute !== this.state.absolute) {
      this._updatingState = true;
      if(bounds){
        values = assign(values, this.getBounds());
      }
      this.setState(values, ()=> {
        this._updatingState = false;
        if(typeof cb === 'function'){
          cb();
        }
      });
      return true;
    }else if(typeof cb === 'function'){
      cb();
    }
    return false;
  }

  updateFixedOffset() {
    if (this.hasOwnScrollTarget && !this.canSticky) {

      if (this.state.sticky) {
        this.setState({fixedOffset: this.scrollTarget.getBoundingClientRect().top + 'px'});
        if (!this.hasWindowScrollListener) {
          this.hasWindowScrollListener = true;
          FastScroll.getInstance(window).on('scroll:progress', this.updateFixedOffset);
        }
      } else {
        this.setState({fixedOffset: ''});
        if(this.hasWindowScrollListener) {
          this.hasWindowScrollListener = false;
          FastScroll.getInstance(window).off('scroll:progress', this.updateFixedOffset);
        }
      }
    }
  }

  update(force = false) {

    if(!this._updatingBounds){
      log('update():: force:' + force);
      this._updatingBounds = true;
      this.updateBounds(true, true, ()=>{
        this.fastScroll.updateScrollPosition();
        this.updateBounds(force, true, ()=>{
          this.fastScroll.updateScrollPosition();
          var updateSticky = this.updateStickyState(false, ()=>{
            if(force && !updateSticky){
              this.forceUpdate();
            }
          });
          this._updatingBounds = false;
        });
      });
    }
  }

  initialize() {
    this.scrollTarget = (window.getComputedStyle(this.refs.el.parentNode).overflow !== 'auto' ? window : this.refs.el.parentNode);
    this.hasOwnScrollTarget = this.scrollTarget !== window;
    if (this.hasOwnScrollTarget) {
      this.updateFixedOffset = ::this.updateFixedOffset;
    }

    this.addSrollHandler();
    this.addResizeHandler();
    this.update();
  }

  addSrollHandler() {
    if (!this.fastScroll) {
      this.fastScroll = FastScroll.getInstance(this.scrollTarget);
      this.onScroll = ::this.onScroll;
      this.fastScroll.on('scroll:start', this.onScroll);
      this.fastScroll.on('scroll:progress', this.onScroll);
      this.fastScroll.on('scroll:stop', this.onScroll);
    }
  }

  removeSrollHandler() {
    if (this.fastScroll) {
      this.fastScroll.off('scroll:start', this.onScroll);
      this.fastScroll.off('scroll:progress', this.onScroll);
      this.fastScroll.off('scroll:stop', this.onScroll);
    }
  }

  addResizeHandler() {
    if (!this.resizeHandler) {
      this.resizeHandler = ::this.onResize;
      window.addEventListener('resize', this.resizeHandler, false);
      window.addEventListener('orientationchange', this.resizeHandler, false);
    }
  }

  removeResizeHandler() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      window.removeEventListener('orientationchange', this.resizeHandler);
      this.resizeHandler = null;
    }
  }


  onScroll(e) {
    this.updateStickyState();
    this.updateFixedOffset();
  }

  onResize(e) {
    this.update();
  }

  shouldComponentUpdate(newProps, newState) {
    return this._shouldComponentUpdate;
  }

  componentWillReceiveProps(props) {
    if (props.disabled !== this.state.disabled) {
      this.setState({
        disabled: props.disabled
      });
    }
  }

  componentDidMount() {
    setTimeout(()=>  this.initialize(), 1);
  }

  componentWillUnmount() {
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

  render() {

    let element = React.Children.only(this.props.children);

    var style;
    const refName = 'el';
    const className = classNames({'sticky': !this.state.disabled, 'sticky-disabled': this.state.disabled}, {'sticky-fixed': !this.canSticky}, {'is-sticky': this.state.sticky && !this.state.disabled}, {'is-absolute': this.state.absolute});

    if(!this.canSticky){
      if(this.state.absolute){

        style = {
          marginTop: this.state.style.top !== null ? ( this.state.restrict.height - (this.state.bounds.height + this.state.style.top) + (this.state.restrict.top - this.state.bounds.top)) + 'px' : '',
          marginBottom: this.state.style.bottom !== null ? (this.state.restrict.height - (this.state.bounds.height + this.state.style.bottom) + (this.state.restrict.bottom - this.state.bounds.bottom)) + 'px' : ''
        };
      }else if (this.hasOwnScrollTarget && this.state.fixedOffset !== '') {
        style = {
          marginTop: this.state.fixedOffset
        };
      }
    }

    if (element) {
      element = React.cloneElement(element, {ref: refName, key: this._key, style:style, className: classNames(element.props.className, className)});
    }else {
      const Comp = this.props.tagName;
      element = <Comp ref={refName} key={this._key} style={style} className={className}>{this.props.children}</Comp>;
    }

    if (this.canSticky) {
      return element;
    }

    const height = (this.state.disabled || this.state.bounds.height === null ||  (!this.state.sticky && !this.state.absolute)) ? 'auto' : this.state.bounds.height + 'px';
    style = {
      height: height
    };
    if(this.state.absolute){
      style.position = 'relative';
    }
    return (
      <div ref='wrapper' className='sticky-wrap' style={style}>
           {element}
       </div>
    );
  }
}
