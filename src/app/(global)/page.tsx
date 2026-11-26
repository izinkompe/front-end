import { BuyerCategoryShowcaseSection } from '@/components/home/buyer-category-showcase-section'
import { BuyerDistributionSummarySection } from '@/components/home/buyer-distribution-summary-section'
import { BuyerExpiringOffersSection } from '@/components/home/buyer-expiring-offers-section'
import { BuyerHarvestHubsSection } from '@/components/home/buyer-harvest-hubs-section'
import { BuyerHeroSection } from '@/components/home/buyer-hero-section'
import { BuyerNeedsBoardSection } from '@/components/home/buyer-needs-board-section'

export default function Home() {
  return (
    <>
      <BuyerHeroSection />
      <BuyerExpiringOffersSection />
      <BuyerCategoryShowcaseSection />
      <BuyerHarvestHubsSection />
      <BuyerNeedsBoardSection />
      <BuyerDistributionSummarySection />
    </>
  )
}
