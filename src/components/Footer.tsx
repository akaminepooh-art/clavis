export function Footer() {
  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-sm text-gray-500 space-y-3">
        <div className="flex justify-center gap-6">
          <a
            href="https://factum.netlify.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cl-primary hover:underline"
          >
            データ分析・投資分析はFACTUMへ &rarr;
          </a>
        </div>
        <p>&copy; {new Date().getFullYear()} CLAVIS. All rights reserved.</p>
      </div>
    </footer>
  )
}
