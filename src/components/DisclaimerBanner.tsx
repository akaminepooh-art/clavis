const DISCLAIMER = '本コンテンツは娯楽目的です。科学的根拠を持つものではありません。'

export function DisclaimerBanner() {
  return (
    <div className="bg-cl-lavender border border-cl-lavender-mid/30 rounded-xl px-4 py-3 text-sm text-cl-lavender-mid">
      <span className="mr-1">&#9888;&#65039;</span>
      {DISCLAIMER}
    </div>
  )
}
