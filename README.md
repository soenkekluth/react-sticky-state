# react-sticky-state
The React Sticky[State] Component makes native position:sticky statefull and polyfills the missing sticky browser feature. 

Its the React version of https://github.com/soenkekluth/sticky-state

todays browser do not all support the position:sticky feature (which by the way is beeing used (polyfilled) on pretty much every site you visit) - moreover the native supported feature itself comes without a readable state. something like a:hover => div:sticky to add different styles to the element in its sticky state - or to read the state if needed in javacript. 

unlike almost all polyfills you can find in the wild StickyState is high perfomant. the calculations are reduced to a minimum by persisting several attributes.

# Warning concerning Chromes implementation of native position:sticky
it looks like chromes implementaton of position:sticky is different to all other implementations out there. don't know if thats a bug - but bottom is currently not recognized by chrome. there will be a fix for this soon in sticky-state 

### Browser support
IE >= 9, *

### demo
https://rawgit.com/soenkekluth/react-sticky-state/master/examples/index.html

### install
```
npm install react-sticky-state
```

### css
your css should contain the following lines: 
(you can specify the classNames in js)
```css
.sticky {
  position: -webkit-sticky;
  position: sticky;
}

.sticky.sticky-fixed.is-sticky {
  margin-top: 0;
  margin-bottom: 0;
  position: fixed;
  -webkit-backface-visibility: hidden;
          -moz-backface-visibility: hidden;
       backface-visibility: hidden;
}

.sticky.sticky-fixed.is-sticky:not([style*="margin-top"]) {
  margin-top: 0 !important;
}
.sticky.sticky-fixed.is-sticky:not([style*="margin-bottom"]) {
  margin-bottom: 0 !important;
}


.sticky.sticky-fixed.is-absolute{
  position: absolute;
}

```

### js
```javascript

import Sticky from 'react-sticky-state';


<Sticky>
  ........
</Sticky>

```

Sticky as `children` takes either:

- its' only child and adds the behavior and classes to it, or
- wraps all children inside an element if there are more than one. (The `tagName` can be defined by props.)
- a function, which will receive `{ absolute: bool, sticky: bool, disabled: bool }` object as a first argument and should return a child or children. (Example usage: `<Sticky>{({ sticky }) => <Menu isCollapsed={sticky} />}</Sticky>`.)

### possible props

```javascript
static propTypes = {
    initialize: PropTypes.bool,
    wrapperClass: PropTypes.string,
    stickyClass: PropTypes.string,
    fixedClass: PropTypes.string,
    stateClass: PropTypes.string,
    disabledClass: PropTypes.string,
    absoluteClass: PropTypes.string,
    disabled: PropTypes.bool,
    debug: PropTypes.bool,
    wrapFixedSticky: PropTypes.bool,
    tagName: PropTypes.string,
    scrollClass: PropTypes.shape({
      down : PropTypes.string,
      up : PropTypes.string,
      none : PropTypes.string,
      persist : PropTypes.bool,
      active : PropTypes.bool
    }),
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.func])
  };

  static defaultProps = {
    initialize: true,
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
```
