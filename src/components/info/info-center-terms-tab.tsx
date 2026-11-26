import { TERMS_TOC_ITEMS } from './terms-of-use-data'
import { TermsIntroAndUsageSections } from './terms-of-use-sections-primary'
import { TermsLegalAndGeneralSections } from './terms-of-use-sections-secondary'

export function InfoCenterTermsTab() {
  return (
    <div className='flex flex-col gap-8'>
      <nav
        aria-label='Daftar isi syarat dan ketentuan'
        className='rounded-xl border border-border bg-muted/30 p-5 sm:p-6'
      >
        <h2 className='mb-4 text-base font-bold text-foreground'>Daftar Isi</h2>
        <ul className='flex flex-col gap-2 text-sm'>
          {TERMS_TOC_ITEMS.map((item) => (
            <li key={item.id} className='flex flex-col gap-1.5'>
              <a
                href={`#${item.id}`}
                className='inline-flex min-h-9 items-center font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary'
              >
                {item.label}
              </a>
              {item.children && (
                <ul className='flex flex-col gap-1 pl-5'>
                  {item.children.map((sub) => (
                    <li key={sub.id}>
                      <a
                        href={`#${sub.id}`}
                        className='inline-flex min-h-8 items-center text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary hover:decoration-primary'
                      >
                        {sub.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className='flex flex-col gap-8 text-base leading-relaxed text-foreground'>
        <TermsIntroAndUsageSections />
        <TermsLegalAndGeneralSections />
      </div>
    </div>
  )
}
