import { interest } from '../utils/interest'

export function Footer() {
  const handleReset = () => {
    if (window.confirm('閲覧履歴（おすすめ表示用データ）をリセットしますか？')) {
      interest.reset()
      window.location.reload()
    }
  }

  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500 space-y-3">
        <div className="flex justify-center gap-6 flex-wrap">
          <a
            href="https://aperis.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pk-primary hover:underline"
          >
            データ分析・投資分析はAPERISへ &rarr;
          </a>
        </div>

        <p className="text-xs text-gray-400">
          おすすめ表示はこの端末内の閲覧履歴のみを使用しています。外部への送信は一切行いません。
        </p>

        <p className="text-xs text-gray-400">
          気象情報：<a href="https://www.jma.go.jp/" target="_blank" rel="noopener noreferrer" className="underline">気象庁</a>
        </p>

        <div>
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors"
          >
            履歴をリセット
          </button>
        </div>

        <p>&copy; {new Date().getFullYear()} PORTAKEY. All rights reserved.</p>
      </div>
    </footer>
  )
}
