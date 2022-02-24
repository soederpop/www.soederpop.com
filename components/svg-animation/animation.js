import { TimelineMax, TweenMax } from 'gsap'

export const DEFAULT_ANIMATION_OPTIONS = {
  duration: 2,
  sectionPrefix: 'section',
  spacer: 38,
}

export const KiteAnimation = {
  options: DEFAULT_ANIMATION_OPTIONS,
  sections: [],
}

export function createScene(options = {}) {
  options = { ...KiteAnimation.options, ...options }

  KiteAnimation.sections = [section(1), section(2), section(3), section(4), section(5)]

  const { 0: s1, 1: s2, 2: s3, 3: s4, 4: s5 } = KiteAnimation.sections

  const tl = new TimelineMax({
    paused: false,
    delay: 0,
  })

  const { gap = 80, spacer } = options

  // This sets the blocks evenly apart
  return tl
    .staggerTo(s1.children, 0, { y: 0 })
    .staggerTo(s2.children, 0, { y: 0 + gap + spacer * 1 }, 0)
    .staggerTo(s3.children, 0, { y: 0 + gap + spacer * 2 }, 0)
    .staggerTo(s4.children, 0, { y: 0 + gap + spacer * 3 }, 0)
    .staggerTo(s5.children, 0, { y: 0 + gap + spacer * 4 }, 0)
}

export function section(number) {
  const index = parseInt(number, 10) - 1

  const { sectionPrefix } = DEFAULT_ANIMATION_OPTIONS

  return (KiteAnimation.sections[index] =
    KiteAnimation.sections[index] ||
    new AnimationSection({
      id: `#${sectionPrefix}${number}`,
      index,
    }))
}

export class AnimationSection {
  constructor(options = {}) {
    this.id = options.id
    this.index = options.index
  }

  get top() {
    return this.index * KiteAnimation.options.spacer
  }

  get el() {
    return document.querySelector(this.id)
  }

  get previousSections() {
    const { sections = [] } = KiteAnimation

    return sections.filter((s) => s.index < this.index)
  }

  get nextSections() {
    const { sections = [] } = KiteAnimation
    return sections.filter((s) => s.index > this.index)
  }

  get children() {
    return Array.from(document.querySelectorAll(`${this.id}`))
  }
}

export function demo() {
  console.log('Firing Demo!')
  const tl = new TimelineMax({ paused: false, delay: 0 })

  tl.to('#section2, #section3, #section4, #section5', 1, { y: '+=500' })
    .staggerTo('#s1-layer4', 1, { y: 390 }, 2, 1)
    .staggerTo('#s1-layer3', 1, { y: 360 }, 2, 1)
    .staggerTo('#s1-layer2', 1, { y: 330 }, 2, 1)
    .staggerTo('#s1-layer1', 1, { y: 300 }, 2, 1, () => {
      expandSectionTwo()
    })
}

export function expandSectionOne() {
  const tl = new TimelineMax({ paused: false, delay: 0, repeat: Infinity, yoyo: true })

  return tl
    .to('#section2, #section3, #section4, #section5', 1, { y: '+=500' })
    .staggerTo('#s1-layer4', 1, { y: 390 }, 2, 0)
    .staggerTo('#s1-layer3', 1, { y: 360 }, 2, 0)
    .staggerTo('#s1-layer2', 1, { y: 330 }, 2, 0)
    .staggerTo('#s1-layer1', 1, { y: 300 }, 2, 0)
}

export function collapseSectionOne() {
  const tl = new TimelineMax({ paused: false, delay: 0 })

  return tl.to('#s1-layer1,#s1-layer2,#s1-layer3,#s1-layer4', 1, { y: section(1).top })
}

export function expandSectionTwo() {
  const tl = collapseSectionOne()

  const expandedTop = section(2).top + 15

  tl.to('#s2-items > g', 0, { opacity: 0 })
    .staggerTo('#section2', 1, { y: expandedTop }, 1, 0)
    .staggerTo('#s2-container', 1, { y: expandedTop + 250 }, 2, 0)
    .staggerTo('#s2-layer2', 1, { y: expandedTop + 350 }, 2, 0)
    .staggerTo('#s2-layer3', 1, { y: expandedTop + 370 }, 2, 0)
    .staggerTo('#s2-layer4', 1, { y: expandedTop + 390 }, 2, 0)
    .staggerTo('#s2-items', 0.5, { opacity: 1 }, 2, 0, () => {
      expandSectionThree()
    })
}

export function collapseSectionTwo() {
  const tl = new TimelineMax({ paused: false, delay: 0 })

  const sectionTwoTop = section(2).top - 30

  return tl
    .to('#s2-items > g', 0.5, { opacity: 0 })
    .to('#s2-layer1, #s2-layer2, #s2-layer3, #s2-layer4, #s2-container', 1, { y: sectionTwoTop })
}

export function expandSectionThree() {
  const tl = collapseSectionTwo()

  const top = section(3).top + 65

  const components = ['#s3-layer1', '#s3-layer2', '#s3-layer3', '#s3-container', '#s3-layer4']

  tl.staggerTo('#s3-feature, #Path_900, #Path_902', 0, { opacity: 0 }, 0, 0).staggerTo(
    '#section3',
    0.5,
    { y: top },
    0.25,
    1
  )

  components.forEach((component, index) => {
    const space = component === '#s3-container' || component === '#s3-layer4' ? 80 : 20

    tl.staggerTo(component, 1, { y: top + index * space }, 0.5, 2)
  })

  tl.staggerFrom('#s3-feature', 0.25, { opacity: 1, y: '+=55' }, 2).to('#s3-feature', 0, {
    opacity: 0,
    onComplete: expandSectionFour,
  })

  return tl
}

export function collapseSectionThree() {
  const tl = new TimelineMax({ paused: false, delay: 0 })

  const sectionThreeTop = section(3).top - 15

  return tl
    .to('#s3-feature', 0, { opacity: 0 })
    .staggerTo('#section3 > g', 1, { y: sectionThreeTop }, 0, 0)
    .staggerTo('#section3', 1, { y: sectionThreeTop }, 0.25, 0)
}

export function expandSectionFour() {
  const tl = collapseSectionThree()

  const top = section(4).top + 80
  const bottom = section(5).top

  const components = ['#s4-layer1', '#s4-layer2', '#s4-layer3']

  tl.staggerTo('#section4', 1, { y: top }, 0, 1)

  components.forEach((component, index) => {
    tl.staggerTo(component, 1, { y: bottom + 260 + index * 15 }, 0.5, 2)
  })

  return tl
    .staggerTo('#s4-container2', 1, { y: bottom + 190 }, 0.5, 3)
    .staggerTo('#s4-container', 1, { y: bottom + 10 }, 1.5, 3)
    .staggerTo('#s4-container', 0, { y: bottom + 9, onComplete: expandSectionFive }, 0.5, 4)
}

export function collapseSectionFour() {
  const tl = new TimelineMax({ paused: false, delay: 0 })

  const sectionFourTop = section(4).top + 20

  return tl
    .staggerTo('#section4', 1, { y: sectionFourTop }, 0, 1)
    .staggerTo('#s4-layer1', 1, { y: sectionFourTop }, 0, 1)
    .staggerTo('#s4-layer2', 1, { y: sectionFourTop }, 0, 1)
    .staggerTo('#s4-layer3', 1, { y: sectionFourTop }, 0, 1)
    .staggerTo('#s4-container', 1, { y: sectionFourTop }, 0, 1)
    .staggerTo('#s4-container2', 1, { y: sectionFourTop }, 0, 1)
    .staggerTo('#s4-layer4', 1, { y: sectionFourTop }, 0, 1)
    .staggerTo('#section4', 1, { y: sectionFourTop - 90 }, 0, 2)
}

export function expandSectionFive() {
  const top = section(4).top + 120
  const tl = collapseSectionFour().to('#section5', 1, { y: top })

  const layers = [
    '#s5-layer1',
    '#s5-layer2',
    '#s5-layer3',
    '#s5-layer4',
    '#s5-slice1',
    '#s5-slice2',
    '#s5-slice3',
  ]

  const expandedTop = top - 80
  layers.forEach((layer, index) => {
    const sliceBuffer = layer.match(/slice/) ? 90 : 0
    const spacer = layer.match(/slice/) ? 35 : 15
    tl.staggerTo(layer, 1, { y: sliceBuffer + expandedTop + 15 + index * spacer }, 0, 5)
  })

  return tl
}

export function collapseSectionFive() {
  const tl = new TimelineMax({ paused: false, delay: 0 })

  return tl
}
