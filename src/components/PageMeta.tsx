import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'PORTAKEY'
const SITE_URL = 'https://portakey.netlify.app'
const DEFAULT_DESC = '診断・占い・健康・ペットケアを束ねるライフナビゲーション'
const DEFAULT_OGP = `${SITE_URL}/ogp.svg`

type Props = {
  title?: string
  description?: string
  ogImage?: string
  path?: string
}

export function PageMeta({ title, description, ogImage, path }: Props) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - 人生の扉を開く鍵`
  const desc = description ?? DEFAULT_DESC
  const image = ogImage ?? DEFAULT_OGP
  const url = path ? `${SITE_URL}${path}` : SITE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  )
}
