import { useState } from 'react'

type ShareButtonsProps = {
  text: string
  url?: string
  onImageDownload?: () => void
}

export function ShareButtons({ text, url = 'https://clavis.netlify.app', onImageDownload }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(url)

  function handleCopy() {
    navigator.clipboard.writeText(`${text}\n${url}`).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-gray-600 text-center">結果をシェア</p>
      <div className="flex gap-2 justify-center flex-wrap">
        {/* Twitter/X */}
        <a
          href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-700 transition-colors no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </a>

        {/* LINE */}
        <a
          href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}&text=${encodedText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#06C755] text-white text-sm font-bold hover:bg-[#05b04c] transition-colors no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 5.83 2 10.5c0 4.08 3.42 7.5 8.05 8.28.31.07.74.21.85.48.1.25.06.63.03.88l-.14.84c-.04.25-.2.97.85.53s5.62-3.31 7.67-5.67C21.19 13.67 22 12.15 22 10.5 22 5.83 17.52 2 12 2zm-3.5 11.5h-2a.5.5 0 01-.5-.5v-4a.5.5 0 011 0v3.5h1.5a.5.5 0 010 1zm1.5-.5a.5.5 0 01-1 0v-4a.5.5 0 011 0v4zm4.5.5h-2a.5.5 0 01-.5-.5v-4a.5.5 0 011 0v2.5l2-2.83a.5.5 0 01.9.3v4a.5.5 0 01-1 0v-2.5l-2 2.83a.5.5 0 01-.4.2zm4-3h-1.5v-.5h1.5a.5.5 0 000-1h-2a.5.5 0 00-.5.5v4a.5.5 0 00.5.5h2a.5.5 0 000-1h-1.5v-.5h1.5a.5.5 0 000-1z" />
          </svg>
          LINE
        </a>

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors border border-gray-200"
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              コピー済み
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              コピー
            </>
          )}
        </button>

        {/* Image download */}
        {onImageDownload && (
          <button
            onClick={onImageDownload}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cl-primary-light text-cl-primary text-sm font-bold hover:bg-cl-primary-light/80 transition-colors border border-cl-primary-border"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            画像保存
          </button>
        )}
      </div>
    </div>
  )
}
