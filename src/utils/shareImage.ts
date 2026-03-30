export type ShareImageParams = {
  title: string
  scores: { label: string; value: number }[]
  message?: string
  siteUrl?: string
}

export async function generateShareImage(params: ShareImageParams): Promise<Blob> {
  const { title, scores, message, siteUrl = 'portakey.netlify.app' } = params
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = 630
  const ctx = canvas.getContext('2d')!

  // Background gradient (teal → white → lavender)
  const grad = ctx.createLinearGradient(0, 0, 1200, 630)
  grad.addColorStop(0, '#E1F5EE')
  grad.addColorStop(0.5, '#FFFFFF')
  grad.addColorStop(1, '#EEEDFE')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 1200, 630)

  // Accent bar at top
  ctx.fillStyle = '#0F6E56'
  ctx.fillRect(0, 0, 1200, 6)

  // PORTAKEY logo text (top left)
  ctx.font = 'bold 28px "Hiragino Sans", "Noto Sans JP", sans-serif'
  ctx.fillStyle = '#0F6E56'
  ctx.fillText('🔑 PORTAKEY', 50, 55)

  // Title
  ctx.font = 'bold 42px "Hiragino Sans", "Noto Sans JP", sans-serif'
  ctx.fillStyle = '#1a1a1a'
  ctx.textAlign = 'center'
  ctx.fillText(title, 600, 130)

  // Score bars
  const barStartY = 180
  const barHeight = 32
  const barGap = 50
  const barMaxWidth = 500
  const barX = 350

  scores.forEach((score, i) => {
    const y = barStartY + i * barGap

    // Label
    ctx.font = '22px "Hiragino Sans", "Noto Sans JP", sans-serif'
    ctx.fillStyle = '#666'
    ctx.textAlign = 'right'
    ctx.fillText(score.label, barX - 20, y + 23)

    // Bar background
    ctx.fillStyle = '#E5E7EB'
    ctx.beginPath()
    ctx.roundRect(barX, y, barMaxWidth, barHeight, 16)
    ctx.fill()

    // Bar fill
    const fillWidth = (score.value / 100) * barMaxWidth
    const barGrad = ctx.createLinearGradient(barX, 0, barX + fillWidth, 0)
    barGrad.addColorStop(0, '#0F6E56')
    barGrad.addColorStop(1, '#1D9E75')
    ctx.fillStyle = barGrad
    ctx.beginPath()
    ctx.roundRect(barX, y, fillWidth, barHeight, 16)
    ctx.fill()

    // Score number
    ctx.font = 'bold 22px "Hiragino Sans", "Noto Sans JP", sans-serif'
    ctx.fillStyle = '#0F6E56'
    ctx.textAlign = 'left'
    ctx.fillText(`${score.value}`, barX + barMaxWidth + 15, y + 24)
  })

  // Message
  if (message) {
    ctx.font = '20px "Hiragino Sans", "Noto Sans JP", sans-serif'
    ctx.fillStyle = '#555'
    ctx.textAlign = 'center'
    ctx.fillText(message, 600, 470)
  }

  // Disclaimer
  ctx.font = '14px "Hiragino Sans", "Noto Sans JP", sans-serif'
  ctx.fillStyle = '#999'
  ctx.textAlign = 'center'
  ctx.fillText('※ 本コンテンツは娯楽目的です。科学的根拠を持つものではありません。', 600, 560)

  // URL (bottom right)
  ctx.font = '18px "Hiragino Sans", "Noto Sans JP", sans-serif'
  ctx.fillStyle = '#0F6E56'
  ctx.textAlign = 'right'
  ctx.fillText(siteUrl, 1150, 600)

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })
}

export async function shareResult(params: ShareImageParams & { shareText: string }): Promise<void> {
  const { shareText, ...imageParams } = params

  try {
    const blob = await generateShareImage(imageParams)
    const file = new File([blob], 'portakey-result.png', { type: 'image/png' })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        text: shareText,
        files: [file],
      })
      return
    }
  } catch {
    // Web Share API not available or user cancelled
  }

  // Fallback: download image
  const blob = await generateShareImage(imageParams)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'portakey-result.png'
  a.click()
  URL.revokeObjectURL(url)
}
