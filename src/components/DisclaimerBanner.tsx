const DISCLAIMER = '※占い・診断コンテンツは娯楽目的です'

export function DisclaimerBanner() {
  return (
    <div className="rounded-lg px-3 py-2 text-xs" style={{ background: '#F5F4FE', color: '#7F77DD', border: '1px solid #CECBF6' }}>
      <span className="mr-1">⚠️</span>
      {DISCLAIMER}
    </div>
  )
}
