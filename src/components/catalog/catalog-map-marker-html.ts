import { escapeHtmlText, formatCompactMarkerPrice } from '@/lib/data/catalog-map-helpers'

export function buildReferencePinHtml(locationLabel: string): string {
  const safeLabel = escapeHtmlText(locationLabel)
  return `<div title="Lokasi acuan: ${safeLabel}" class="flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary shadow-md"><span class="size-2 rounded-full bg-white"></span></div>`
}

export function buildSingleMapPillHtml(params: {
  pricePerKg: number
  isSelected: boolean
  isHovered: boolean
  isExpired: boolean
}): string {
  const priceText = escapeHtmlText(formatCompactMarkerPrice(params.pricePerKg))

  const pillClass = params.isSelected
    ? 'inline-flex items-center justify-center rounded-full border border-primary bg-primary px-2.5 py-1 text-xs font-bold whitespace-nowrap text-primary-foreground shadow-md ring-2 ring-background'
    : params.isHovered
      ? 'inline-flex scale-105 items-center justify-center rounded-full border border-primary bg-card px-2.5 py-1 text-xs font-bold whitespace-nowrap text-primary shadow-md'
      : params.isExpired
        ? 'inline-flex items-center justify-center rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-muted-foreground opacity-85 shadow-xs'
        : 'inline-flex items-center justify-center rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold whitespace-nowrap text-foreground shadow-sm hover:border-primary hover:text-primary'

  return `<div style="transform: translate(-50%, calc(-100% - 10px));" class="w-max pointer-events-auto"><div class="${pillClass}">${priceText}</div></div>`
}

export function buildClusterMapPillHtml(params: {
  count: number
  minPricePerKg: number
  isSelected: boolean
  isHovered: boolean
  isOpen: boolean
  allExpired: boolean
}): string {
  const priceText = escapeHtmlText(formatCompactMarkerPrice(params.minPricePerKg))

  const clusterClass =
    params.isSelected || params.isOpen
      ? 'inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary py-1 pr-2.5 pl-1 text-xs font-bold whitespace-nowrap text-primary-foreground shadow-md ring-2 ring-background'
      : params.isHovered
        ? 'inline-flex scale-105 items-center gap-1.5 rounded-full border border-primary bg-card py-1 pr-2.5 pl-1 text-xs font-bold whitespace-nowrap text-primary shadow-md'
        : params.allExpired
          ? 'inline-flex items-center gap-1.5 rounded-full border border-border bg-muted py-1 pr-2.5 pl-1 text-xs font-semibold whitespace-nowrap text-muted-foreground opacity-90 shadow-sm'
          : 'inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-card py-1 pr-2.5 pl-1 text-xs font-bold whitespace-nowrap text-foreground shadow-md hover:border-primary'

  const badgeClass =
    params.isSelected || params.isOpen
      ? 'inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-xs font-bold text-primary'
      : 'inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground'

  return `<div style="transform: translate(-50%, calc(-100% - 10px));" class="w-max pointer-events-auto"><div class="${clusterClass}"><span class="${badgeClass}">${params.count}</span><span>${priceText}+</span></div></div>`
}
