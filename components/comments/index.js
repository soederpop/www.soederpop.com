import siteMetadata from '@/data/siteMetadata'
import dynamic from 'next/dynamic'

const UtterancesComponent = dynamic(
  () => {
    return import('@/components/comments/Utterances')
  },
  { ssr: false }
)
const GiscusComponent = dynamic(
  () => {
    return import('@/components/comments/Giscus')
  },
  { ssr: false }
)
const DisqusComponent = dynamic(
  () => {
    return import('@/components/comments/Disqus')
  },
  { ssr: false }
)

const Comments = ({ frontMatter }) => {
  return null
}

export default Comments
