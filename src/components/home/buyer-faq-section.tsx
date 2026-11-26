'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { buyerFaqItems } from '@/lib/data/faq'

export function BuyerFaqSection() {
  return (
    <section className='w-full bg-background text-foreground' aria-labelledby='buyer-faq-heading'>
      <div className='mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:px-8'>
        <div className='lg:col-span-4'>
          <h2
            id='buyer-faq-heading'
            className='text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] leading-tight font-bold text-foreground'
          >
            Pertanyaan umum
          </h2>
        </div>

        <div className='lg:col-span-8'>
          <Accordion multiple hiddenUntilFound className='border-t border-border'>
            {buyerFaqItems.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className='min-h-14 py-4 sm:min-h-16 sm:py-5'>
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className='pb-5 text-base leading-relaxed text-muted-foreground [&_p:not(:last-child)]:mb-0'>
                  <p className='w-full max-w-none'>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
