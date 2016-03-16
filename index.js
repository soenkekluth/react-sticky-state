import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import FastScroll from 'fastscroll';
import assign from 'object-assign';

var _globals = {
  featureTested: false
};


export function stickyNative() {
  if (_globals.featureTested) {
    return _globals.canSticky;
  }
  if (typeof window !== 'undefined') {
    _globals.featureTested = true;

    if(window.Modernizr && window.Modernizr.hasOwnProperty('csspositionsticky')) {
      return  _globals.canSticky = window.Modernizr.csspositionsticky;
    }

    _globals.canSticky = false;
    var testEl = document.createElement('div');
    document.documentElement.appendChild(testEl);
    var prefixedSticky = ['sticky', '-webkit-sticky'];

    for(var i = 0; i < prefixedSticky.length; i++) {
      testEl.style.position = prefixedSticky[i];
      _globals.canSticky = !!window.getComputedStyle(testEl).position.match('sticky');
      if(_globals.canSticky){
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

function getAbsolutBoundingRect(el) {
  var rect = el.getBoundingClientRect();
  var top = rect.top + getSrollPosition();
  return {
    top: top,
    bottom: top + rect.height,
    height: rect.height,
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
    tagName : React.PropTypes.string
  };

  static defaultProps = {
    stickyClass: 'sticky',
    fixedClass: 'sticky-fixed',
    stateClass: 'is-sticky',
    disabled: false,
    tagName: 'div'
  };

  constructor(props, context) {
    super(props, context);

    this.silent = true;
    this.updatingState = false;

    this.state = {
      sticky: false,
      fixedOffset:{
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
  }


  get canSticky(){
    return stickyNative();
  }

  getBoundingClientRect() {
    return this.refs.el.getBoundingClientRect();
  }

  getBounds(noCache){

    if(noCache !== true && this.state.bounds.height !== null) {
      if (this.getBoundingClientRect().height === this.state.bounds.height) {
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
      rect = getAbsolutBoundingRect(child);
      if (this.hasOwnScrollTarget) {
        var parentRect = getAbsolutBoundingRect(this.scrollTarget);

        fixedOffset.top = parentRect.top;
        fixedOffset.bottom = parentRect.bottom;

        rect = addBounds(rect, parentRect);
        restrict = assign({},rect);
      }
    }else {
      var elem = getPreviousElementSibling(child);
      var offset = 0;

      if (elem) {
        offset = parseInt(window.getComputedStyle(elem)['margin-bottom']);
        offset = offset || 0;
        rect = getAbsolutBoundingRect(elem);
        if (this.hasOwnScrollTarget) {
          rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
        }

        rect.top  = rect.bottom + offset;

      }else {
        elem = child.parentNode;
        offset = parseInt(window.getComputedStyle(elem)['padding-top']);
        offset = offset || 0;
        rect = getAbsolutBoundingRect(elem);
        if (this.hasOwnScrollTarget) {
          rect = addBounds(rect, getAbsolutBoundingRect(this.scrollTarget));
        }
        rect.top =  rect.top +  offset;
      }

      rect.height = this.refs.el.clientHeight;
      rect.width = this.refs.el.clientWidth;
      rect.bottom = rect.top + rect.height;

    }
    restrict = restrict || getAbsolutBoundingRect(child.parentNode);

    return {
      fixedOffset:fixedOffset,
      style: style,
      bounds: rect,
      restrict:restrict
    };

  }

  updateBounds(cb){
    this.setState(this.getBounds(true), cb);
  }


  getStickyState() {

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


  updateStickyState(silent) {
    if(this.updatingState){
      return;
    }
    const sticky = this.getStickyState();

    if(sticky !== this.state.sticky) {
      this.updatingState = true;
      silent = silent === true;
      var state = this.getBounds();
      state.sticky = sticky;
      this.setState(state, ()=> this.updatingState = false);
    }

    if(this.state.sticky !== sticky){
      let newState;
      const height = this.getBoundingClientRect().height;
      if(height !== this.state.bounds.height){
        newState = this.getBounds();
        newState.sticky = sticky;
      }else{
        newState = {sticky:sticky};
      }
      this.setState(newState, ()=> this.updatingState = false);
      // this.setState(newState);
    }
  }



  addSrollHandler() {
    if (!this.scrollHandler) {
      var hasScrollTarget = FastScroll.hasScrollTarget(this.scrollTarget);
      this.fastScroll = new FastScroll(this.scrollTarget, {animationFrame:true});
      this.scrollHandler = this.updateStickyState.bind(this);

      this.fastScroll.on('scroll:start', this.scrollHandler);
      this.fastScroll.on('scroll:progress', this.scrollHandler);
      this.fastScroll.on('scroll:stop', this.scrollHandler);

      if(hasScrollTarget && this.fastScroll.scrollY > 0){
        this.fastScroll.trigger('scroll:progress');
      }
    }
  }

  removeSrollHandler() {
    if (this.fastScroll) {
      this.fastScroll.off('scroll:start', this.scrollHandler);
      this.fastScroll.off('scroll:progress', this.scrollHandler);
      this.fastScroll.off('scroll:stop', this.scrollHandler);
      this.fastScroll.destroy();
      this.scrollHandler = null;
      this.fastScroll = null;
    }
  }

  addResizeHandler() {
    if (!this.resizeHandler) {
      this.resizeHandler = this.onResize.bind(this);
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

  onResize(e) {
    // this.silent = true;
    // this.updateBounds(()=>{
    //   this.silent = false;
    //   this.updateStickyState();
    // });
  }


  shouldComponentUpdate( newProps, newState ) {
      return !this.silent;
  }


  componentWillReceiveProps(props){
    if(props.disabled !== this.state.disabled){
      this.setState({
        disabled: props.disabled
      });
    }
  }

  componentDidMount() {

    setTimeout(()=> {
      this.scrollTarget = stickyNative() ? (window.getComputedStyle(this.refs.el.parentNode).overflow !== 'auto' ? window : this.refs.el.parentNode) : window;
      this.hasOwnScrollTarget = this.scrollTarget !== window;

      this.addSrollHandler();
      this.addResizeHandler();

      this.silent = true;
      this.updateBounds(()=>{
        this.silent = false;
        this.updateStickyState();
      });
    }, 1);

  }

  componentWillUnmount(){
    this.removeSrollHandler();
    this.removeResizeHandler();
  }

  render() {

   let element = React.Children.only(this.props.children);

   const refName = 'el';
   const className = classNames({'sticky' : !this.state.disabled, 'sticky-disabled' : this.state.disabled }, {'sticky-fixed': !this.canSticky}, {'is-sticky' : this.state.sticky && !this.state.disabled});

   if(element){
     element = React.cloneElement(element , {ref:refName, className: classNames(element.props.className, className) });
   }else{
    const Comp = this.props.tagName;
    element = <Comp ref={refName} className={className}>{this.props.children}</Comp>
   }

   if(this.canSticky) {
     return element;
   }

   const  height = (this.state.disabled || (!this.state.sticky || this.state.bounds.height === null)) ? 'auto' :this.state.bounds.height+ 'px';

   return (
     <div ref="wrapper" className="sticky-wrap" style={{height:height}}>
       {element}
     </div>
   );
  }
}
