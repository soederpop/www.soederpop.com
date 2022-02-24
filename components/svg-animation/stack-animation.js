import * as gsap from 'gsap'

console.log('gsap', gsap)

/**
 * To load the Animation on a page, call SetupKiteAnimation with options.
 *
 * @param {Object} options
 * @param {Function} [options.onComplete] a function to run when the setup is completed.
 * @param {Number} [options.autoExpand] the number of a section you want to auto expand.
 * @param {Object} [options.scrollConfig] the css selector for the element which contains scrollable content with headings.
 * @param {String} [options.clickHandlers] the css selector for elements that when clicked will focus the animation
 * @param {Function} [options.Timeline=window.Timeline] the greensock Timeline library
 * @param {Function} [options.Tween=window.Tween] the greensock Tween library
 */
export default function SetupKiteAnimation(options = {}, global = window) {
  var DEFAULT_ANIMATION_OPTIONS = {
    duration: 2,
    sectionPrefix: 'section',
    spacer: 38,
    enableChildAnimations: false,
    ...options,
  }

  var KiteAnimation = {
    options: DEFAULT_ANIMATION_OPTIONS,
    sections: [],
    // Each timeline is played and reversed to simulate expand and collapse
    timelines: {},
    // Each section may have child animations that occur in the nested layers
    // in the svg.  This allows you to trigger any one of them with code
    // e.g section(2).trigger('highlightOne')
    childAnimations: {
      section1: {},
      section2: {
        highlightItem: highlightSectionTwoItem,
        engine: () => highlightSectionTwoItem(1),
        visibility: () => highlightSectionTwoItem(2),
        capacity: () => highlightSectionTwoItem(3),
      },
      section3: {
        highlightItem: highlightSectionThreeItem,
        facility: () => highlightSectionThreeItem(1),
        appointment: () => highlightSectionThreeItem(2),
      },
      section4: {
        highlightItem: highlightSectionFourItem,
        coverage: () => highlightSectionFourItem('coverage'),
        tl: () => highlightSectionFourItem('tl'),
        ltl: () => highlightSectionFourItem('ltl'),
        ocean: () => highlightSectionFourItem('ocean'),
        rail: () => highlightSectionFourItem('rail'),
        predictive: () => highlightSectionFourItem('predictive'),
        parcel: () => highlightSectionFourItem('parcel'),
      },
    },
    /**
     * Section config
     *
     * @typedef {Object} SectionConfig
     * @property {Number} start y coordinate in a collapsed state
     * @property {Number} expanded height dimension when expanded
     * @property {Number} collapsed height dimension when collapsed
     * @property {String} headingClass the html className that is added to an element in the DOM. This lets you find the section given any dom element that has that class name.
     * @property {Function} expand a function which returns a Timeline instance that has tweens added to it to expand the svg
     * @property {Function} collapse a function which reverses the expanded timeline tweens
     * @property {Object<String,RegExp>} [filters] named patterns which return a list of child ids that match the pattern
     * @property {Object<String,RegExp>} [triggers] named patterns which match against a DOM elements class string. Used to find child animations which correspond to a given dom element
     */
    config: {
      /** @type {SectionConfig} */
      section1: {
        start: 0,
        expanded: 545,
        collapsed: 58,
        headingClass: 'solutions',
        expand: expandSectionOne,
        collapse: (options = {}) => reverseTimeline(section(1), options),
        filters: {
          layers: /layer/,
        },
      },
      /** @type {SectionConfig} */
      section2: {
        start: 60,
        expanded: 595,
        collapsed: 58,
        headingClass: 'applications',
        triggers: {
          engine: /engine/,
          visibility: /visiblity/,
          capacity: /capacity/,
        },
        filters: {
          container: /s2-container/,
          layers: /s2-layer/,
          items: /s2-item/,
        },
        expand: expandSectionTwo,
        collapse: (options = {}) => reverseTimeline(section(2), options),
      },
      /** @type {SectionConfig} */
      section3: {
        start: 120,
        expanded: 500,
        collapsed: 58,
        headingClass: 'analytics',
        expand: expandSectionThree,
        collapse: (options = {}) => reverseTimeline(section(3), options),
        filters: {
          container: /container/,
          layers: /layer/,
          feature: /feature/,
        },
        triggers: {
          insight: /insight/,
          engine: /engine/,
        },
      },
      /** @type {SectionConfig} */
      section4: {
        start: 180,
        expanded: 605,
        collapsed: 58,
        headingClass: 'platform',
        expand: expandSectionFour,
        collapse: (options = {}) => reverseTimeline(section(4), options),
        filters: {
          container: /container2?$/,
          layers: /layer/,
          feature: /feature/,
        },
        triggers: {
          coverage: /coverage/,
          ltl: /platform\sltl/,
          tl: /platform\stl/,
          parcel: /parcel/,
          ocean: /ocean/,
          rail: /rail/,
          predictive: /predictive/,
        },
      },
      /** @type {SectionConfig} */
      section5: {
        start: 240,
        expanded: 470,
        collapsed: 36,
        headingClass: 'network',
        expand: expandSectionFive,
        collapse: (options = {}) => reverseTimeline(section(5), options),
        filters: {
          layers: /layer/,
          slices: /slice/,
        },
      },
    },
  }

  Object.assign(KiteAnimation, {
    auto,
    setup,
    section,
    getSectionNameFromEl,
    getHeadingNameFromEl,
    setupScrollBehavior,
    currentSection,
    findSectionByName,
    findSectionByHeading,
    focusOn,
    expandSectionOne,
    notify,
    get sectionNames() {
      return Object.values(KiteAnimation.config).map((v) => v.headingClass)
    },
    get contentContainer() {
      return document.querySelector('#diagram-content')
    },
    get headingElements() {
      return document.querySelectorAll('#diagram-content h3')
    },
    get clickableElements() {
      return [
        'div.w-tabs-section.solutions',
        'li.solutions.capacity',
        'li.solutions.visibility',
        'div.w-tabs-section.analytics',
        'li.analytics.insights',
        'li.analytics.engine',
        'div.w-tabs-section.applications',
        'li.applications.facility',
        'li.applications.appointment',
        'div.w-tabs-section.platform',
        'li.platform.coverage',
        'li.platform.predictive',
        'li.platform.science',
        'div.w-tabs-section.network',
      ].map((s) => document.querySelector(s))
    },
    collapseSectionOne: (options) => reverseTimeline(section(1), options),
    expandSectionTwo,
    collapseSectionTwo: (options) => reverseTimeline(section(2), options),
    expandSectionThree,
    collapseSectionThree: (options) => reverseTimeline(section(3), options),
    expandSectionFour,
    collapseSectionFour: (options) => reverseTimeline(section(4), options),
    expandSectionFive,
    collapseSectionFive: (options) => reverseTimeline(section(5), options),
  })

  /**
   * A convenience function for accessing the instance of DiagramSection
   * that corresponds to section1, section2, section3, section4, section5
   * of the svg.
   *
   * These are the top level sections should match up to the content outline
   * and hierarchy.
   *
   * @param {*} number
   * @returns {DiagramSection}
   */
  function section(number) {
    const index = parseInt(number, 10) - 1

    const { sectionPrefix } = DEFAULT_ANIMATION_OPTIONS

    return (KiteAnimation.sections[index] =
      KiteAnimation.sections[index] ||
      new DiagramSection({
        id: `#${sectionPrefix}${number}`,
        index,
      }))
  }

  /**
   * Returns the top level DiagramSection instance for a given name.
   *
   * Valid names are any values of headingClass found in KiteAnimation.config,
   * e.g. analytics, network, platform, solutions, applications
   *
   * @param {String} tabSectionHeader
   * @returns {DiagramSection}
   */
  function findSectionByName(tabSectionHeader) {
    const entry = Object.entries(KiteAnimation.config).find(
      ([id, settings]) => settings.headingClass === tabSectionHeader
    )
    const id = entry && entry[0]
    return KiteAnimation.sections.find((section) => section && section.id === `#${id}`)
  }

  /**
   * Accepts any dom element that can trigger a section expand / collapse,
   * and gives the matching DiagramSection instance.  Relies on the headingClass
   * config from KiteAnimation.config.
   *
   * Use this on an anchor tag click handler to get a section, or use this in
   * a scroll event listener to find a section for a given heading element in the scrollable
   * content area.
   *
   * @param {HTMLElement} sectionLink
   * @returns {DiagramSection}
   */
  function findSectionByHeading(sectionLink) {
    const sectionClasses = Object.values(KiteAnimation.config).map(
      (settings) => settings.headingClass
    )

    const parentSection = sectionLink.closest(sectionClasses.map((c) => `.${c}`).join(','))

    if (parentSection) {
      const matchingClass = sectionClasses.find(
        (className) => parentSection.className.indexOf(className) > -1
      )
      if (matchingClass) {
        return findSectionByName(matchingClass)
      }
    } else {
      const sectionName = getSectionNameFromEl(sectionLink)

      if (sectionName) {
        return findSectionByName(sectionName)
      }
    }
  }

  /**
   * Gets the currently expanded DiagramSection by searching KiteAnimation.sections
   * for the first one that is expanded.
   */
  function currentSection() {
    return KiteAnimation.sections.filter(Boolean).find((section) => section && section.isExpanded)
  }

  /**
   * Represents a section of the animation diagram.  Sections are the top level group elements
   * within the scene.  They should have an id like section1, section2, section3, etc.
   *
   * You can call expand(), collapse() on any section, as well as check if it is currently expanded or collapsed.
   *
   * You can also reference configuration from KiteAnimation.config, as well as find any child animations that occur
   * within that section when it is expanded.
   *
   * @class DiagramSection
   */
  class DiagramSection {
    constructor(options = {}) {
      options = {
        ...options,
        timeline: {
          ...(options.timeline || {}),
          paused: false,
          delay: 0,
        },
      }

      this.options = options
      this.id = options.id
      this.index = options.index

      if (!this.el) {
        throw new Error(`Could not find this section in the svg`)
      }
    }

    /** @type {Timeline} */
    get timeline() {
      const timelineId = this.id.replace('#', 'tl')

      return (KiteAnimation.timelines[timelineId] =
        KiteAnimation[timelineId] ||
        new Timeline({
          id: timelineId,
          paused: false,
          delay: 0,
          ...this.options.timeline,
        }))
    }

    /**
     * Expands this section.  If you add a new section, you'll need to write your own expand handler.
     *
     * Currently delegates to a specific function for expanding that section, as each section is unique and has
     * different expand behavior.  This reference is stored in KiteAnimation config for this section
     *
     * @param {Object} options
     * @param {Function} [options.onComplete] a function to call when the animation finishes.
     */
    expand(options = {}) {
      if (!this.isExpanded && options.autoCollapse !== false) {
        const current = currentSection()

        if (current && current.id !== this.id) {
          return current.collapse({ onComplete: () => this.expand(options) })
        }
      }

      if (this.isExpanded) {
        return this.previousTimeline
      } else if (this.isReversed) {
        this.previousTimeline.restart()
        return this.previousTimeline
      }

      const timeline = this.config.expand(options)
      this.previousTimeline = timeline
      this.previousAction = 'expand'

      return timeline
    }

    /**
     * Collapses this section.  If you add a new section, you'll need to write your own collapses handler.
     *
     * Currently delegates to a specific function for expanding that section, as each section is unique and has
     * different collapse behavior.
     *
     * @param {Object} options
     * @param {Function} [options.onComplete] a function to call when the animation finishes.
     */
    collapse(options = {}) {
      return this.config.collapse(options)
    }

    /**
     * Returns true while the section is animating.
     */
    get isAnimating() {
      return !!this.previousTimeline && this.previousTimeline.isActive()
    }

    get isReversed() {
      return !!this.previousTimeline && this.previousTimeline.reversed()
    }

    /**
     * Trigger a childAnimation by name.  Will look for KiteAnimation.childAnimations[name] to find a function.
     *
     * @param {String} childAnimation the name of the childAnimation you want to trigger.
     * @param {Object} options options to pass to the childAnimation trigger function.
     */
    trigger(childAnimation, options) {
      const fns = KiteAnimation.childAnimations[this.id.replace('#', '')]

      if (!this.isExpanded) {
        return this.expand({
          onComplete: () => {
            this.trigger(childAnimation, options)
            if (options.onComplete) {
              options.onComplete()
            }
          },
        })
      } else {
        return typeof fns[childAnimation] === 'function' && fns[childAnimation](options)
      }
    }

    /**
     * Returns true if the section is visually collapsed
     */
    get isCollapsed() {
      return !this.isExpanded
    }

    /**
     * Returns true if the section is visually expanded
     */
    get isExpanded() {
      return !!this._expanded
    }

    /**
     * When you expand a section, you need to set isExpanded = true on it.
     */
    set isExpanded(val) {
      this._expanded = !!val
    }

    /**
     * Returns the height, width, x, y, etc of the section's svg container element.
     */
    get boundingBox() {
      return this.el.getBBox()
    }

    /**
     * Returns the current height of the section's svg container element
     */
    get currentHeight() {
      return this.boundingBox.height
    }

    /**
     * Returns the current width of the section's svg container element
     */
    get currentWidth() {
      return this.boundingBox.width
    }

    /**
     * Returns any information about the Greensock Tweens applied to this section.  You can use this
     * to get the current top position, etc.
     */
    get state() {
      return this.el._gsTransform ? this.el._gsTransform : {}
    }

    get childState() {
      return this.children.reduce(
        (memo, child) => ({
          ...memo,
          [child.id]: child._gsTransform,
        }),
        {}
      )
    }

    /**
     * The current y coordinate of the top of this section.  You can use this in tweens.
     */
    get yPos() {
      return this.el._gsTransform ? this.el._gsTransform.y : this.boundingBox.y
    }

    /**
     * The current x coordinate of the left of this section.  You can use this in tweens.
     */
    get xPos() {
      return this.el._gsTransform ? this.el._gsTransform.x : this.boundingBox.x
    }

    /**
     * Top is the value of the position of this section when everything is collapsed.  Also,
     * when a section is expanded, its top coordinate will be the same as it was when it was collapsed.
     */
    get top() {
      return this.config.start
    }

    /**
     * Bottom is the value of the y coordinate of this section's bottom edge.  This is calculated
     * based on the configured expanded height and where the starting y coordinate will be when it is expanded.
     */
    get bottom() {
      return this.config.start + this.config.expanded
    }

    /**
     * Gets the configuration for this section.  Should contain headingClass and other properties,
     * such as the expanded height, the starting y position of that section, and anything else.
     *
     * @type {SectionConfig}
     */
    get config() {
      return KiteAnimation.config[this.id.replace('#', '')]
    }

    /**
     * When a section is expanded it can contain additional animations that run on the child nodes
     * of that section in the SVG.  These childanimations are declared in KiteAnimation.childAnimations.
     * We can use the name of the childAnimation in the HTML className of any elements which trigger
     * the child animation (e.g. on a click or scroll.)
     */
    get childAnimations() {
      return KiteAnimation.childAnimations[this.id.replace('#', '')]
    }

    get triggers() {
      return this.config.triggers || {}
    }

    /**
     * Given a DOM element, find any child animation trigger functions which match what is configured for this section.
     *
     * @returns {Array<String>}
     */
    findTriggers(sourceElement) {
      const all = Object.entries(this.triggers)
      const matches = all.filter(([triggerName, pattern]) => {
        return !!sourceElement.className.match(pattern)
      })

      const triggers = matches.map((e) => e[0]).filter((v) => v && v.length)

      if (triggers.length) {
        return triggers
      } else {
        return []
      }
    }

    /**
     * Pushed top is what the top position coordinate will be when the section above it is expanded
     */
    get pushedTop() {
      if (this.index === 0) {
        return 0
      } else {
        return this.above.top + this.above.expandedHeight
      }
    }

    /**
     * Each sections expandedHeight represents the height of the section when it is fully expanded.
     */
    get expandedHeight() {
      return this.config.expanded
    }

    /**
     * Each sections collapsed height represents the height of the section when it is fully expanded.
     */
    get collapsedHeight() {
      return this.config.collapsed
    }

    /**
     * Returns an SVGElement representing the g tag in the svg with this section's id.
     *
     * @type {SVGElement}
     */
    get el() {
      return document.querySelector(this.id)
    }

    /**
     * The section above this one.
     * @type {DiagramSection}
     */
    get above() {
      const { sections = [] } = KiteAnimation
      return sections[this.index - 1]
    }

    /**
     * The section below this one.
     * @type {DiagramSection}
     */
    get below() {
      const { sections = [] } = KiteAnimation
      return sections[this.index + 1]
    }

    /**
     * All DiagramSections which come before this one.
     */
    get previousSections() {
      const { sections = [] } = KiteAnimation
      return sections.filter((s) => s.index < this.index)
    }

    /**
     * All DiagramSections which come after this one.
     */
    get nextSections() {
      const { sections = [] } = KiteAnimation
      return sections.filter((s) => s.index > this.index)
    }

    /**
     * The IDs of the next sections.  Can be used in Tween.to(section(1).nextSectionIds) to apply an animation
     * to all of the sections.
     */
    get nextSectionsIds() {
      return this.nextSections.map((s) => s.id)
    }

    /**
     * The IDs of the previous sections.  Can be used in Tween.to(section(1).nextSectionIds) to apply an animation
     * to all of the sections.
     */
    get previousSectionsIds() {
      return this.previousSections.map((s) => s.id)
    }

    /**
     * Gets the second level groups within a section.
     */
    get children() {
      return Array.from(document.querySelectorAll(`${this.id} g`)).filter(
        (el) => el.id && el.id.length
      )
    }

    getChildIds(filterName) {
      const { childIds = [] } = this
      const { filters } = this.config

      if (filters && filters[filterName]) {
        return childIds.filter((id) => id.match(filters[filterName]))
      } else {
        return childIds
      }
    }

    /**
     * Gets the IDs of any nested groups.
     */
    get childIds() {
      return this.children
        .map((child) => child.id)
        .filter((v) => v && v.length)
        .map((id) => `#${id}`)
    }

    /**
     * Apply a Tween animation to the previous sections using Tween.to
     */
    tweenPreviousTo(...args) {
      return Tween.to(this.previousSectionsIds, ...args)
    }

    /**
     * Apply a Tween animation to the next sections using Tween.to
     */
    tweenNextTo(...args) {
      return Tween.to(this.nextSectionsIds, ...args)
    }

    /**
     * Apply a Tween animation to the previous sections using Tween.from
     */
    tweenPreviousFrom(...args) {
      return Tween.from(this.previousSectionsIds, ...args)
    }

    /**
     * Apply a Tween animation to the next sections using Tween.from
     */
    tweenNextFrom(...args) {
      return Tween.from(this.nextSectionsIds, ...args)
    }

    /**
     * Apply a Tween animation to this section using Tween.to
     */
    tweenTo(...args) {
      return Tween.to(this.id, ...args)
    }

    /**
     * Apply a Tween animation to this section using Tween.from
     */
    tweenFrom(...args) {
      return Tween.from(this.id, ...args)
    }
  }

  /**
   * @note We expect this function to be called once on page load.  Calling SetupKiteAnimation will do it for you.
   *
   * It will use Tween to set some initial values in the SVG without animating them over time.
   * This will ensure that our math values are sane throughout the rest of the code, regardless of what
   * happens to the SVG outside of the code (e.g it is edited in sketch and re-exported with transforms applied.)
   *
   * You can pass scrollElement which should be a css selector for a containing div that will scroll.  This div
   * should contain h2, h3, h4, h5, h6 elements which have classNames that correspond to the configured headingClass
   * values in KiteAnimation.config
   *
   * @param {Object} options
   * @param {Function} [options.onComplete] a function to run when the setup is completed.
   * @param {Number} [options.autoExpand] the number of a section you want to auto expand.
   * @param {Object} [options.scrollConfig] the css selector for the element which contains scrollable content with headings.
   * @param {String} [options.clickHandlers] the css selector for elements that when clicked will focus the animation
   */
  function setup(options = {}) {
    const s1 = section(1)
    const s2 = section(2)
    const s3 = section(3)
    const s4 = section(4)
    const s5 = section(5)

    const tl = new Timeline({ id: 'setup', paused: false, delay: 0 })

    return tl
      .set(s1.id, { y: s1.top })
      .set(s2.id, { y: s2.top })
      .set(s3.id, { y: s3.top })
      .set(s4.id, { y: s4.top })
      .set(s5.id, { y: s5.top })
      .addCallback(() => {
        if (options.scrollConfig) {
          setupScrollBehavior(options.scrollConfig)
        }

        if (options.clickHandlers) {
          DEFAULT_ANIMATION_OPTIONS.clickHandlers = options.clickHandlers
          setupClickBehavior(options.clickHandlers)
        }

        if (options.autoExpand) {
          section(options.autoExpand).expand({
            onComplete: options.onComplete,
          })
        } else if (options.onComplete) {
          options.onComplete()
        }
      })
  }

  /**
   * Given any DOM element, it will expand the relevant section.
   * If the DOM element matches one of the defined triggers, then
   * it will trigger a child animation within the expanded section.
   *
   * You can give it any DOM element, from a click handler, or from the
   * scroll event handler.
   */
  function focusOn(sourceElement, options = {}) {
    const section = findSectionByHeading(sourceElement)
    const { scrollToHeading = false, highlightNav = false } = options

    const currentlyAnimating = KiteAnimation.sections.filter((section) => section.isAnimating)

    if (!section) {
      console.error('Could not match element to animation section', sourceElement)
      return
    }

    const triggers = section.findTriggers(sourceElement)

    /**
     * This function could be cleaned up if the nav list markup was more straighforward
     */
    function reactToFocus() {
      //a click handler should scroll the heading
      if (scrollToHeading) {
        const diagramContent = document.querySelector('#diagram-content')
        console.log('Scrolling to heading', scrollToHeading)
        KiteAnimation.isScrolling = true
        const heading = document.querySelector(`h3.${scrollToHeading}`)

        if (heading) {
          smoothScroll(heading, {
            behavior: 'smooth',
          }).then(() => {
            console.log('Smooth Scroll Finished')
            KiteAnimation.isScrolling = false
            KiteAnimation.contentContainer.scrollTop =
              KiteAnimation.contentContainer.scrollTop - 100
          })
        }
      } else if (highlightNav) {
        // scroll handler should add the active class to the nav items
        console.log('Highlighting Nav', highlightNav)

        const sections = Array.from(document.querySelectorAll('.w-tabs-sections .active'))
        sections.forEach((el) => el.classList.remove('active'))

        // if a child trigger was found, then it is a subcategory item
        if (triggers && triggers.length && triggers[0] && triggers[0].length) {
          const navItem = document.querySelector(`.w-tabs-sections .w-tabs-section .${triggers[0]}`)

          if (navItem && navItem.classList) {
            navItem.classList.add('active')
          }
        } else {
          // it is just a top level nav
          document
            .querySelector(`.w-tabs-sections .w-tabs-section.${highlightNav}`)
            .classList.add('active')
        }
      }
    }

    // do this before the animation
    reactToFocus()

    if (KiteAnimation.isScrolling) {
      return false
    }

    if (section.isExpanded) {
      triggers &&
        triggers.forEach((triggerName) => {
          section.trigger(triggerName, options)
          KiteAnimation.notify('childAnimation', sourceElement, {
            triggerName,
            id: section.id,
            section,
          })
        })
    } else if (currentlyAnimating.length && section.previousTimeline) {
      // the last element to call focusOn claims the complete callback
      section.previousTimeline.eventCallback('onComplete', null)
      section.previousTimeline.eventCallback('onComplete', () => {
        section.expand({
          onComplete: () => {
            KiteAnimation.isReactingToFocus = false
            KiteAnimation.notify('sectionExpand', sourceElement, {
              id: section.id,
              section,
            })
          },
        })
      })
    } else {
      console.log('Reacting to focus event, not expanded or no previousTimeline', section.id)
      section.expand({
        onComplete: () => {
          KiteAnimation.isReactingToFocus = false
          KiteAnimation.notify('sectionExpand', sourceElement, {
            id: section.id,
            section,
            triggerName: 'expand',
          })
        },
      })
    }
  }

  /**
   * This will get called whenever something gets focusedOn, either through a click handler,
   * or the scroll handler.  The eventName will be either sectionExpand or childAnimation, the sourceElement
   * will be the element which triggered it, and sectionInfo will be information about the section that was focused on
   * or the child animation which was triggered
   */
  function notify(eventName, sourceElement, sectionInfo) {
    if (typeof KiteAnimation.onChange === 'function') {
      KiteAnimation.onChange(eventName, sourceElement, sectionInfo)
    }
  }

  /**
   * Auto-play the animation from top to bottom, for demo or testing purposes
   */
  function auto() {
    const current = currentSection()

    if (!current) {
      return
    }

    return current.below.expand()
  }

  /**
   * This will take any section which is expanded, and reverse the animation,
   * creating a collapse effect.
   */
  function reverseTimeline(s, options = {}) {
    if (s.isCollapsed) {
      return s.previousTimeline
    }

    if (s.isExpanded && s.previousTimeline) {
      s.previousTimeline.eventCallback('onReverseComplete', () => {
        s.previousTimeline.eventCallback('onReverseComplete', null)
        s.isExpanded = false
        s.previousTimeline.timeScale(1)

        if (options.onComplete) {
          options.onComplete()
        }
      })

      s.previousTimeline.timeScale(2)
      s.previousTimeline.reverse()

      return s.previousTimeline
    }
  }
  function setupClickBehavior(selector) {
    const targets = Array.from(document.querySelectorAll(selector))

    console.log('Setting up click handlers', selector)

    targets.forEach((target) => {
      const clickHandler = (e, ...args) => {
        console.log('Firing Click Handler', {
          target,
          e,
          args,
          sectionName: getSectionNameFromEl(target),
        })

        e.preventDefault()

        if (e.target && e.target.href && e.target.href.length) {
          window.location = e.target.href
          return
        }

        e.stopPropagation()

        focusOn(target, {
          scrollToHeading: getHeadingNameFromEl(target),
        })
      }

      if (target.clickHandler) {
        target.removeEventListener('click', target.clickHandler)
      }

      target.clickHandler = clickHandler
      target.addEventListener('click', clickHandler)
    })
  }

  function setupScrollBehavior({ throttle, scrollContainer, headingSelector }) {
    // The dom element that fires the scroll event, either body or something with overflow-y set to scroll
    const contentElement =
      typeof scrollContainer === 'string'
        ? document.querySelector(scrollContainer)
        : scrollContainer

    const headings = Array.from(document.querySelectorAll(headingSelector))

    if (KiteAnimation.scrollFn) {
      contentElement.removeEventListener('scroll', KiteAnimation.scrollFn)
    }

    const scrollFn = throttle ? debounce(handleScrollEvent, throttle) : handleScrollEvent

    KiteAnimation.scrollFn = scrollFn

    contentElement.addEventListener('scroll', scrollFn)

    function handleScrollEvent() {
      // Finds all the heading elements who are within 240 pixels from the top
      const nearTop = headings
        .map((heading) => {
          const rect = heading.getBoundingClientRect()
          return { rect, top: rect.top, el: heading }
        })
        .filter(({ top }) => top >= -25)

      const topMost = nearTop.length ? nearTop[0] : undefined

      if (topMost) {
        console.log('highlighting topmost', topMost.el, getSectionNameFromEl(topMost.el))
        focusOn(topMost.el, {
          highlightNav: getHeadingNameFromEl(topMost.el),
          timeScale: 2,
        })
      }
    }
  }

  function getHeadingNameFromEl(el) {
    const subsectionNames = Array.from(el.classList.values())
    return subsectionNames
      .filter((name) => name !== 'active' && name !== 'w-tabs-section' && name !== 'content-empty')
      .join('.')
  }

  function getSectionNameFromEl(el) {
    const sectionNames = Object.values(KiteAnimation.config).map((h) => h.headingClass)
    const classes = Array.from(el.classList.values()).filter(
      (className) => sectionNames.indexOf(className) > -1
    )

    return classes[0]
  }

  function debounce(func, wait, immediate) {
    var timeout
    return function () {
      var context = this,
        args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

  // => TOP LEVEL SECTION TRIGGERS
  /**
   * Expand / Collapse Functions for each section.
   *
   * Each section has its own unique animation behavior for expand / collapse, the DiagramSection class
   * delegates to these functions based on the section number.
   *
   * You shouldn't need to call these directly, instead use section(1).expand() section(1).collapse()
   */

  function expandSectionOne(options = {}) {
    const { duration = 0.75, stagger = 1.75 } = options
    const s = section(1)
    const tl = s.timeline

    const otherSections = section(1).nextSectionsIds

    return tl
      .addLabel('initialize-s1')
      .set(s.getChildIds('layers'), { y: s.top })
      .addLabel('move-s1-next-sections')
      .to(otherSections, 1, { y: `+=${s.config.expanded}` }, 0)
      .addLabel('expand-s1-layers')
      .staggerTo('#s1-layer4', duration, { y: 390 }, stagger, 'expand-s1-layers')
      .staggerTo('#s1-layer3', duration, { y: 360 }, stagger, 'expand-s1-layers')
      .staggerTo('#s1-layer2', duration, { y: 330 }, stagger, 'expand-s1-layers')
      .staggerTo('#s1-layer1', duration, { y: 300 }, stagger, 'expand-s1-layers')
      .addCallback(function sectionOneWasExpanded() {
        section(1).isExpanded = true
        options.onComplete && options.onComplete()
      })
  }

  function expandSectionTwo(options = {}) {
    const s = section(2)
    const { id, previousSections, nextSectionsIds, bottom, top, expandedHeight, timeline } = s

    const { duration = 0.75, stagger = 0 } = options

    const layerIds = s.getChildIds('layers').filter((i) => i !== '#s2-layer1')
    const itemIds = s.getChildIds('items')

    timeline
      .addLabel('position-s2')
      .set(itemIds, { opacity: 0 })
      .set(
        '#s2-item1 ellipse:first-child, #s2-item2 ellipse:first-child, #s2-item3 ellipse:first-child',
        {
          fill: 'rgba(87,87,87,1)',
        }
      )

      .set(
        '#s2-item1 ellipse:nth-child(2n), #s2-item2 ellipse:nth-child(2n), #s2-item3 ellipse:nth-child(2n)',
        {
          fill: 'rgba(148,148,148,1)',
        }
      )
      .to(id, duration, { y: top })
      .addLabel('position-s2-next-sections')

    previousSections.forEach((s) => {
      timeline.staggerTo(s, duration, { y: s.top }, stagger, 'position-s2-next-sections')
    })

    timeline
      .staggerTo(
        nextSectionsIds,
        duration,
        { y: `+=${expandedHeight}` },
        stagger,
        'position-s2-next-sections'
      )
      .addLabel('expand-s2-layers')

    // position the layers 40 from the bottom, 15px apart
    layerIds.forEach((layer, index) => {
      timeline.staggerTo(
        layer,
        duration,
        {
          y: bottom - 40 - index * 15,
        },
        stagger,
        'expand-s2-layers'
      )
    })

    // expand the red container at the same time
    timeline
      .staggerTo(
        '#s2-container',
        duration,
        { y: bottom - 260 },
        stagger + duration,
        'expand-s2-layers'
      )
      .addLabel('show-s2-items')

    // position the layers 40 from the bottom, 15px apart
    itemIds.forEach((item, index) => {
      timeline.staggerTo(
        item,
        duration,
        {
          y: top + 10 + index * 80,
          opacity: 1,
        },
        stagger,
        'show-s2-items'
      )
    })

    return timeline.addCallback(() => {
      s.isExpanded = true
      options.onComplete && options.onComplete()
    })
  }

  function expandSectionThree(options = {}) {
    const s = section(3)
    const { id, previousSections, nextSectionsIds, bottom, top, expandedHeight, timeline } = s
    const { stagger = 0, duration = 0.75 } = options

    const layerIds = s.getChildIds('layers').filter((i) => i !== '#s3-layer1')
    const container = s.getChildIds('container')
    const feature = s.getChildIds('feature')

    timeline
      .addLabel('setup-section-3')
      .set(['#s3-facility', '#s3-appointment'], { opacity: 1 })
      .to(id, duration, { y: top })
      .addLabel('position-s3-next-sections')

    previousSections.forEach((s) => {
      timeline.staggerTo(
        s.id,
        duration,
        {
          y: s.top,
        },
        stagger,
        'position-s3-next-sections'
      )
    })

    timeline
      .staggerTo(
        nextSectionsIds,
        duration,
        { y: `+=${expandedHeight}` },
        stagger,
        'position-s3-next-sections'
      )
      .addLabel('expand-s3-layers')

    layerIds.forEach((layer, index) => {
      timeline.staggerTo(
        layer,
        duration,
        {
          y: bottom - 120 - index * 15,
        },
        stagger,
        'expand-s3-layers'
      )
    })

    timeline.staggerTo(
      container,
      duration,
      {
        y: top + 200,
      },
      stagger,
      'expand-s3-layers'
    )

    return timeline.addCallback(() => {
      s.isExpanded = true
      options.onComplete && options.onComplete()
    })
  }

  function expandSectionFour(options = {}) {
    const s = section(4)
    const { previousSections, top, expandedHeight, nextSectionsIds, bottom, id, timeline } = s
    const { stagger = 0, duration = 0.75 } = options

    const layerIds = s.getChildIds('layers').filter((i) => i !== '#s4-layer4')
    const containers = s.getChildIds('container')

    timeline
      .addLabel('position-section-4')
      .staggerTo(id, duration, { y: top }, stagger, 'position-section-4')
      .staggerTo(
        nextSectionsIds,
        duration,
        {
          y: `+=${expandedHeight}`,
        },
        stagger,
        'position-section-4'
      )

    previousSections.forEach((s) => {
      timeline.staggerTo(
        s.id,
        duration,
        {
          y: s.top,
        },
        stagger,
        'position-section-4'
      )
    })

    timeline.addLabel('expand-s4-layers')

    layerIds.forEach((layer, index) => {
      timeline.staggerTo(
        layer,
        duration,
        {
          y: bottom - 150 - index * 20,
        },
        stagger,
        'expand-s4-layers'
      )
    })

    containers.reverse().forEach((layer, index) => {
      timeline.staggerTo(
        layer,
        duration,
        {
          y: top + 80 + index * 240,
        },
        stagger,
        'expand-s4-layers'
      )
    })

    return timeline.addCallback(() => {
      section(4).isExpanded = true
      options.onComplete && options.onComplete()
    })
  }

  function expandSectionFive(options = {}) {
    const s = section(5)

    const tl = new Timeline({ paused: false, delay: 0 })
    const { duration = 0.75, stagger = 0.25 } = options

    const layerIds = s.getChildIds('layers').reverse()
    const sliceIds = ['#s5-slice1', '#s5-slice2', '#s5-slice3']
    const layerTop = s.top + 40
    const sliceTop = layerTop + 60 + layerIds.length * 20

    tl.addLabel('position-section-5')
      .to('#section5', duration, { y: s.top })
      .addLabel('expand-s5-items')

    layerIds.forEach((id, index) => {
      tl.staggerTo(id, duration, { y: layerTop + index * 15 }, stagger, 'expand-s5-items')
    })

    sliceIds.forEach((id, index) => {
      tl.staggerTo(id, duration, { y: sliceTop + index * 30 }, stagger, 'expand-s5-items')
    })

    return tl.addCallback(() => {
      section(5).isExpanded = true
      options.onComplete && options.onComplete()
    })
  }

  // => CHILD ANIMATION TRIGGERS

  function highlightSectionTwoItem(number) {
    if (!DEFAULT_ANIMATION_OPTIONS.enableChildAnimations) {
      return
    }

    Tween.set(
      '#s2-item1 ellipse:first-child, #s2-item2 ellipse:first-child, #s2-item3 ellipse:first-child',
      {
        fill: 'rgba(87,87,87,1)',
      }
    )

    Tween.set(
      '#s2-item1 ellipse:nth-child(2n), #s2-item2 ellipse:nth-child(2n), #s2-item3 ellipse:nth-child(2n)',
      {
        fill: 'rgba(148,148,148,1)',
      }
    )

    Tween.set(`#s2-item${number} ellipse:first-child`, {
      fill: '#9E2C23',
    })
    Tween.set(`#s2-item${number} ellipse:nth-child(2n)`, {
      fill: '#FFFFFF',
    })
  }

  function highlightSectionThreeItem(itemNumber) {
    if (!DEFAULT_ANIMATION_OPTIONS.enableChildAnimations) {
      return
    }

    const s = section(3)

    if (itemNumber === 1) {
      Tween.set('#s3-facility', { opacity: 0.5 })
      Tween.set('#s3-appointment', { opacity: 1 })
    } else {
      Tween.set('#s3-appointment', { opacity: 0.5 })
      Tween.set('#s3-facility', { opacity: 1 })
    }
  }

  function highlightSectionFourItem(item) {
    if (!DEFAULT_ANIMATION_OPTIONS.enableChildAnimations) {
      return
    }
    const boxes = [
      '#Group_622',
      '#Group_623',
      '#Group_624',
      '#Group_625',
      '#Group_626',
      '#Group_627',
    ]

    const sections = ['#Group_612', '#Group_613', '#Group_614', '#Group_615']

    boxes.forEach((boxId) => Tween.set(boxId, { opacity: 1 }))
    sections.forEach((sectionId) => Tween.set(sectionId, { opacity: 1 }))

    if (item === 'coverage') {
      boxes.forEach((boxId) => Tween.set(boxId, { opacity: 0.5 }))
      Tween.set('#Group_622', { opacity: 1 })
    } else if (item === 'tl') {
      boxes.forEach((boxId) => Tween.set(boxId, { opacity: 0.5 }))
      Tween.set('#Group_623', { opacity: 1 })
      Tween.set('#Group_624', { opacity: 1 })
      Tween.set('#Group_625', { opacity: 1 })
    } else if (item === 'ltl') {
      Tween.set('#Group_626', { opacity: 1 })
      Tween.set('#Group_627', { opacity: 1 })
    } else if (item === 'ocean') {
      sections.forEach((sectionId) => Tween.set(sectionId, { opacity: 0.5 }))
      Tween.set('#Group_612', { opacity: 1 })
    } else if (item === 'rail') {
      sections.forEach((sectionId) => Tween.set(sectionId, { opacity: 0.5 }))
      Tween.set('#Group_613', { opacity: 1 })
    } else if (item === 'predictive') {
      sections.forEach((sectionId) => Tween.set(sectionId, { opacity: 0.5 }))
      Tween.set('#Group_614', { opacity: 1 })
    } else if (item === 'parcel') {
      sections.forEach((sectionId) => Tween.set(sectionId, { opacity: 0.5 }))
      Tween.set('#Group_615', { opacity: 1 })
    }
  }
  function smoothScroll(elem, options) {
    return new Promise((resolve) => {
      if (!(elem instanceof Element)) {
        throw new TypeError('Argument 1 must be an Element')
      }
      let same = 0 // a counter
      let lastPos = null // last known Y position
      // pass the user defined options along with our default
      const scrollOptions = Object.assign({ behavior: 'smooth' }, options)

      // let's begin
      elem.scrollIntoView(scrollOptions)
      requestAnimationFrame(check)

      // this function will be called every painting frame
      // for the duration of the smooth scroll operation
      function check() {
        // check our current position
        const newPos = elem.getBoundingClientRect().top

        if (newPos === lastPos) {
          // same as previous
          if (same++ > 2) {
            // if it's more than two frames
            return resolve() // we've come to an halt
          }
        } else {
          same = 0 // reset our counter
          lastPos = newPos // remember our current position
        }
        // check again next painting frame
        requestAnimationFrame(check)
      }
    })
  }
  // => BEGIN SETUP. This runs whenever SetupKiteAnimation is called.

  setup({
    throttle: 0,

    enableChildAnimations: false,

    // The outter most element which contains scrollable content with headings in there
    scrollConfig: {
      scrollContainer: '#diagram-content',
      headingSelector: '#diagram-content h3',
    },

    // Add a selector for every click handler
    clickHandlers: [
      'div.w-tabs-section.solutions',
      'li.solutions.capacity',
      'li.solutions.visibility',
      'div.w-tabs-section.analytics',
      'li.analytics.insights',
      'li.analytics.engine',
      'div.w-tabs-section.applications',
      'li.applications.facility',
      'li.applications.appointment',
      'div.w-tabs-section.platform',
      'li.platform.coverage',
      'li.platform.predictive',
      'li.platform.science',
      'div.w-tabs-section.network',
    ]
      .map((suffix) => `.w-tabs-sections ${suffix}`)
      .join(','),
    // auto expand the section
    autoExpand: 1,
  })

  global.KiteAnimation = global.Kite = KiteAnimation
  global.section = section

  // change this whenever you save the pen so we can see which version is running
  KiteAnimation.version = '2.0.0'

  return KiteAnimation
}
