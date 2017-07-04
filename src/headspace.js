function Headspace (element, opts = {}) {
  if (!(this instanceof Headspace)) {
    console.log('inside of if statement')
    return new Headspace(...arguments)
  }

  this.element = element
  this.startOffset = optionOrDefault(opts.startOffset, element && element.offsetHeight)
  this.tolerance = optionOrDefault(opts.tolerance, 8)
  this.showAtBottom = optionOrDefault(opts.showAtBottom, true)
  this.classNames = opts.classNames || {
    base: 'headspace',
    fixed: 'headspace--fixed',
    hidden: 'headspace--hidden'
  }

  this._scrollLast = 0
  if (typeof window !== 'undefined') {
    this.init()
  }
}

Headspace.prototype = {
  init () {
    this.addClass(this.classNames.base)
    window.addEventListener('scroll', () => this.debounce(() => handleScroll(this)))
  },
  reset () {
    const classNames = this.classNames
    this.removeClass(classNames.fixed, classNames.hidden)
  },
  // imperatively show your header
  fix () {
    const classNames = this.classNames
    this.addClass(classNames.fixed)
    this.removeClass(classNames.hidden)
  },
  // imperatively hide your header
  hide () {
    this.addClass(this.classNames.hidden)
  },

  // Accessible for shimming
  addClass () {
    this.element.classList.add(...arguments)
  },
  removeClass () {
    this.element.classList.remove(...arguments)
  },
  // the intended usage of `requestAnimationFrame` is for debouncing animations
  // https://stackoverflow.com/questions/29359177/is-it-a-good-idea-to-use-requestanimationframe-within-a-debounce-function
  debounce (callback) {
    window.requestAnimationFrame(callback)
  }
}

Headspace.isSupported = function () {
  return !!(typeof window !== 'undefined' && window.requestAnimationFrame && 'classList' in document.documentElement)
}

/*
 * Return the first argument if it is not undefined.
 * Otherwise, return the second argument.
 */
function optionOrDefault (opt, def) {
  return typeof opt !== 'undefined' ? opt : def
}

function handleScroll (instance) {
  const scrollCurrent = window.pageYOffset // number of pixels that document is scrolled vertically
  const scrollLast = instance._scrollLast // previous pageYOffset

  if (scrollCurrent <= 0) {
    // remove "fixed" and "hidden" class when at top of page
    instance.reset()
  } else if (instance.showAtBottom && (window.innerHeight + scrollCurrent) >= document.body.offsetHeight) {
    // when option.showAtBottom is true
    // window.innerHeight = the height of the browser viewport
    // when you are at the bottom of the document.body, window.innerHeight + window.pageYOffset === document.body.offsetHeight
    // document.body.offsetHeight = the height of the document.body
    // add "fixed" class when at bottom of page
    instance.fix()
  } else if (scrollCurrent > instance.startOffset && Math.abs(scrollCurrent - scrollLast) >= instance.tolerance) {
    // if scrolled past the Header element...
    // ...and the amount of the scroll is greater than the scroll tolerance that we set
    // This is an interesting feature. It means that we will only show/hide the header when the user scrolls "fast"
    instance[scrollCurrent > scrollLast ? 'hide' : 'fix']()
  }

  instance._scrollLast = scrollCurrent
}

export default Headspace
