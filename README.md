# react-sticky-state
The React Sticky[State] Component makes native position:sticky statefull and polyfills the missing sticky browser feature. 

Its the React version of https://github.com/soenkekluth/sticky-state

todays browser do not all support the position:sticky feature (which by the way is beeing used (polyfilled) on pretty much every site you visit) - moreover the native supported feature itself comes without a readable state. something like a:hover => div:sticky to add different styles to the element in its sticky state - or to read the state if needed in javacript. 

unlike almost all polyfills you can find in the wild StickyState is high perfomant. the calculations are reduced to a minimum by persisting several attributes.


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
  position: sticky;
}

.sticky.sticky-fixed.is-sticky {
  position: fixed;
  backface-visibility: hidden;
}

.sticky.sticky-fixed.is-absolute {
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

Sticky either takes its only child and adds the behavior and classes to it or wrappes all children inside an element if there are more than one. the tagname can be defined by props.

### possible props 

```javascript
static propTypes = {
    stickyWrapperClass: React.PropTypes.string,
    stickyClass: React.PropTypes.string,
    fixedClass: React.PropTypes.string,
    stateClass:  React.PropTypes.string,
    disabledClass:  React.PropTypes.string,
    absoluteClass:  React.PropTypes.string,
    disabled: React.PropTypes.bool,
    debug: React.PropTypes.bool,
    tagName: React.PropTypes.string
  };

  static defaultProps = {
    stickyWrapperClass: 'sticky-wrap',
    stickyClass: 'sticky',
    fixedClass: 'sticky-fixed',
    stateClass: 'is-sticky',
    disabledClass: 'sticky-disabled',
    absoluteClass: 'is-absolute',
    debug: false,
    disabled: false,
    tagName: 'div'
  };
```
