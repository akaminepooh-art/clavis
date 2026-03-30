export function Footer() {
  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500 space-y-3">
        <div className="flex justify-center gap-6">
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
        <p>&copy; {new Date().getFullYear()} PORTAKEY. All rights reserved.</p>
      </div>
    </footer>
  )
}
