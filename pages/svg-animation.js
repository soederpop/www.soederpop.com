import React, { useEffect } from 'react'
import SvgContainer from '@/components/svg-animation/SvgContainer'
import { demo, createScene } from '@/components/svg-animation/animation'
import Notes from '@/components/svg-animation/notes.mdx'
import { MdxComponents } from '@/components/MDXComponents'
import { MDXProvider } from '@mdx-js/react'

export default function SvgAnimationPage(props = {}) {
  useEffect(() => {
    createScene()
    setTimeout(() => {
      demo()
    }, 5000)
  }, [])

  return (
    <div className="flex">
      <div className="width-1/2" style={{ display: 'block', height: '100vh' }}>
        <SvgContainer />
      </div>
      <div className="width-1/2">
        <MDXProvider components={MdxComponents}>
          <Notes components={MdxComponents} />
        </MDXProvider>
      </div>
    </div>
  )
}
