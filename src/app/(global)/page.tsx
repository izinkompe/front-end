import type { Metadata } from 'next'
import { BuyerCategoryShowcaseSection } from '@/components/home/buyer-category-showcase-section'
import { BuyerDistributionSummarySection } from '@/components/home/buyer-distribution-summary-section'
import { BuyerExpiringOffersSection } from '@/components/home/buyer-expiring-offers-section'
import { BuyerFaqSection } from '@/components/home/buyer-faq-section'
import { BuyerHarvestHubsSection } from '@/components/home/buyer-harvest-hubs-section'
import { BuyerHeroSection } from '@/components/home/buyer-hero-section'
import { BuyerNeedsBoardSection } from '@/components/home/buyer-needs-board-section'
import { JsonLd } from '@/components/seo/json-ld'
import { buyerFaqItems } from '@/lib/data/faq'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  buildPublicMetadata,
  buildWebSiteJsonLd,
} from '@/lib/seo'

export const metadata: Metadata = buildPublicMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  absoluteTitle: true,
})

export default function Home() {
  return (
    <>
      <JsonLd data={buildOrganizationJsonLd()} />
      <JsonLd data={buildWebSiteJsonLd()} />
      <JsonLd data={buildFaqJsonLd(buyerFaqItems)} />
      <BuyerHeroSection />
      <BuyerExpiringOffersSection />
      <BuyerCategoryShowcaseSection />
      <BuyerHarvestHubsSection />
      <BuyerNeedsBoardSection />
      <BuyerDistributionSummarySection />
      <BuyerFaqSection />
    </>
  )
}
