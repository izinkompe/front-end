'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FarmerAuthShell } from '@/components/auth/farmer/farmer-auth-shell'
import {
  ONBOARDING_TOTAL_STEPS,
  normalizeBankName,
} from '@/components/auth/farmer/farmer-form-helpers'
import { StepAccountInfo } from '@/components/auth/farmer/step-account-info'
import { StepBankAccount } from '@/components/auth/farmer/step-bank-account'
import { StepCommodities } from '@/components/auth/farmer/step-commodities'
import { StepFarmLocation } from '@/components/auth/farmer/step-farm-location'
import { StepFarmProfile } from '@/components/auth/farmer/step-farm-profile'
import {
  StepVerification,
  type StepVerificationState,
} from '@/components/auth/farmer/step-verification'
import { StepWelcome } from '@/components/auth/farmer/step-welcome'
import { useRegisterFarmer } from '@/hooks/api/use-auth'
import { defaultLocation, provinceGroups } from '@/lib/data/regions'
import { useFarmerOnboardingStore } from '@/stores/use-farmer-onboarding-store'
import {
  FarmerStep1Schema,
  FarmerStep2Schema,
  FarmerStep3Schema,
  FarmerStep4Schema,
  FarmerStep5Schema,
  FarmerStep6Schema,
  type FarmerStep1Values,
  type FarmerStep2Values,
  type FarmerStep3Values,
  type FarmerStep4Values,
  type FarmerStep5Values,
} from '@/types/api/auth'

const stepLabels: Record<number, string> = {
  1: 'Usaha Tani',
  2: 'Kategori Hasil Panen',
  3: 'Data Akun',
  4: 'Lokasi Pengambilan',
  5: 'Rekening Bank',
  6: 'Verifikasi Identitas',
}

const initialRegion = provinceGroups[0].regions[0]

const defaultStep1: FarmerStep1Values = {
  farmerType: 'individual',
  farmName: '',
}

const defaultStep2: FarmerStep2Values = {
  primaryCommodities: [],
  customCommodity: '',
}

const defaultStep3: FarmerStep3Values = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

const defaultStep4: FarmerStep4Values = {
  provinceId: defaultLocation.provinceId,
  areaName: initialRegion.name,
  fullAddress: '',
  latitude: initialRegion.lat,
  longitude: initialRegion.lng,
  pickupNotes: '',
}

const defaultStep5: FarmerStep5Values = {
  bankName: '',
  accountNumber: '',
  accountHolderName: '',
}

const defaultStep6: StepVerificationState = {
  idCardNumber: '',
  identityDocument: null,
  farmDocument: null,
  agreedToTerms: false,
}

function collectZodErrors<T extends object>(
  issues: Array<{ path: PropertyKey[]; message: string }>
): Partial<Record<keyof T, string>> {
  const result: Partial<Record<keyof T, string>> = {}
  for (const issue of issues) {
    const field = issue.path[0]
    if (typeof field === 'string' && !result[field as keyof T]) {
      result[field as keyof T] = issue.message
    }
  }
  return result
}

export function FarmerOnboardingFlow({ resumeNotice = false }: { resumeNotice?: boolean }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [highestCompletedStep, setHighestCompletedStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [draftLoaded, setDraftLoaded] = useState(false)

  const [step1, setStep1] = useState<FarmerStep1Values>(defaultStep1)
  const [step2, setStep2] = useState<FarmerStep2Values>(defaultStep2)
  const [step3, setStep3] = useState<FarmerStep3Values>(defaultStep3)
  const [step4, setStep4] = useState<FarmerStep4Values>(defaultStep4)
  const [step5, setStep5] = useState<FarmerStep5Values>(defaultStep5)
  const [step6, setStep6] = useState<StepVerificationState>(defaultStep6)

  const [step1Errors, setStep1Errors] = useState<Partial<Record<keyof FarmerStep1Values, string>>>(
    {}
  )
  const [step2Errors, setStep2Errors] = useState<Partial<Record<keyof FarmerStep2Values, string>>>(
    {}
  )
  const [step3Errors, setStep3Errors] = useState<Partial<Record<keyof FarmerStep3Values, string>>>(
    {}
  )
  const [step4Errors, setStep4Errors] = useState<Partial<Record<keyof FarmerStep4Values, string>>>(
    {}
  )
  const [step5Errors, setStep5Errors] = useState<Partial<Record<keyof FarmerStep5Values, string>>>(
    {}
  )
  const [step6Errors, setStep6Errors] = useState<
    Partial<Record<keyof StepVerificationState, string>>
  >({})

  const registerMutation = useRegisterFarmer()
  const updateDraft = useFarmerOnboardingStore((state) => state.updateDraft)
  const resetDraft = useFarmerOnboardingStore((state) => state.resetDraft)

  useEffect(() => {
    const applyDraft = () => {
      const persisted = useFarmerOnboardingStore.getState().draft
      setStep1((prev) => ({
        ...prev,
        farmerType: persisted.farmerType ?? prev.farmerType,
        farmName: persisted.farmName ?? prev.farmName,
      }))
      setStep2((prev) => ({
        ...prev,
        primaryCommodities: persisted.primaryCommodities ?? prev.primaryCommodities,
        customCommodity: persisted.customCommodity ?? prev.customCommodity,
      }))
      setStep3((prev) => ({
        ...prev,
        name: persisted.name ?? prev.name,
        email: persisted.email ?? prev.email,
        phone: persisted.phone ?? prev.phone,
      }))
      setStep4((prev) => ({
        ...prev,
        provinceId: persisted.provinceId ?? prev.provinceId,
        areaName: persisted.areaName ?? prev.areaName,
        fullAddress: persisted.fullAddress ?? prev.fullAddress,
        latitude: persisted.latitude ?? prev.latitude,
        longitude: persisted.longitude ?? prev.longitude,
        pickupNotes: persisted.pickupNotes ?? prev.pickupNotes,
      }))
      setStep5((prev) => ({
        ...prev,
        bankName: persisted.bankName ?? prev.bankName,
        accountHolderName: persisted.accountHolderName ?? prev.accountHolderName,
      }))
      const safeHighest = Math.max(0, Math.min(persisted.highestCompletedStep ?? 0, 5))
      setHighestCompletedStep(safeHighest)
      const requestedStep = typeof persisted.step === 'number' ? persisted.step : safeHighest + 1
      setCurrentStep(Math.max(1, Math.min(requestedStep, safeHighest + 1, 3)))
      setDraftLoaded(true)
    }

    if (useFarmerOnboardingStore.persist.hasHydrated()) {
      applyDraft()
      return
    }
    const unsub = useFarmerOnboardingStore.persist.onFinishHydration(() => {
      applyDraft()
    })
    return () => {
      unsub()
    }
  }, [])

  useEffect(() => {
    if (!draftLoaded || completed) return
    updateDraft({
      step: currentStep,
      highestCompletedStep,
      farmerType: step1.farmerType,
      farmName: step1.farmName,
      primaryCommodities: step2.primaryCommodities,
      customCommodity: step2.customCommodity,
      name: step3.name,
      email: step3.email,
      phone: step3.phone,
      provinceId: step4.provinceId,
      areaName: step4.areaName,
      fullAddress: step4.fullAddress,
      latitude: step4.latitude,
      longitude: step4.longitude,
      pickupNotes: step4.pickupNotes,
      bankName: step5.bankName,
      accountHolderName: step5.accountHolderName,
    })
  }, [
    completed,
    draftLoaded,
    currentStep,
    highestCompletedStep,
    step1,
    step2,
    step3.email,
    step3.name,
    step3.phone,
    step4,
    step5.accountHolderName,
    step5.bankName,
    updateDraft,
  ])

  function advanceToStep(nextStep: number, completedStep: number) {
    const nextHighest = Math.max(highestCompletedStep, completedStep)
    setHighestCompletedStep(nextHighest)
    setCurrentStep(Math.min(nextStep, nextHighest + 1, ONBOARDING_TOTAL_STEPS))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleStep1Next() {
    const parsed = FarmerStep1Schema.safeParse(step1)
    if (!parsed.success) {
      setStep1Errors(collectZodErrors<FarmerStep1Values>(parsed.error.issues))
      return
    }
    setStep1Errors({})
    advanceToStep(2, 1)
  }

  function handleStep2Next() {
    const parsed = FarmerStep2Schema.safeParse(step2)
    if (!parsed.success) {
      setStep2Errors(collectZodErrors<FarmerStep2Values>(parsed.error.issues))
      return
    }
    setStep2Errors({})
    advanceToStep(3, 2)
  }

  function handleStep3Next() {
    const parsed = FarmerStep3Schema.safeParse(step3)
    if (!parsed.success) {
      setStep3Errors(collectZodErrors<FarmerStep3Values>(parsed.error.issues))
      return
    }
    setStep3Errors({})
    if (!step5.accountHolderName.trim()) {
      setStep5((prev) => ({ ...prev, accountHolderName: step3.name.trim() }))
    }
    advanceToStep(4, 3)
  }

  function handleStep4Next() {
    const parsed = FarmerStep4Schema.safeParse(step4)
    if (!parsed.success) {
      setStep4Errors(collectZodErrors<FarmerStep4Values>(parsed.error.issues))
      return
    }
    setStep4Errors({})
    advanceToStep(5, 4)
  }

  function handleStep5Next() {
    const parsed = FarmerStep5Schema.safeParse(step5)
    if (!parsed.success) {
      setStep5Errors(collectZodErrors<FarmerStep5Values>(parsed.error.issues))
      return
    }
    setStep5Errors({})
    advanceToStep(6, 5)
  }

  async function handleFinalSubmit() {
    const parsed = FarmerStep6Schema.safeParse(step6)
    if (!parsed.success) {
      setStep6Errors(collectZodErrors<StepVerificationState>(parsed.error.issues))
      return
    }
    setStep6Errors({})

    try {
      await registerMutation.mutateAsync({
        farmerType: step1.farmerType,
        farmName: step1.farmName.trim(),
        primaryCommodities: step2.primaryCommodities,
        customCommodity: step2.primaryCommodities.includes('lainnya')
          ? step2.customCommodity?.trim()
          : undefined,
        name: step3.name.trim(),
        email: step3.email.trim(),
        phone: step3.phone.trim(),
        password: step3.password,
        provinceId: step4.provinceId,
        areaName: step4.areaName.trim(),
        fullAddress: step4.fullAddress.trim(),
        latitude: step4.latitude,
        longitude: step4.longitude,
        pickupNotes: step4.pickupNotes.trim(),
        bankAccount: {
          bankName: normalizeBankName(step5.bankName),
          accountNumber: step5.accountNumber.trim(),
          accountHolderName: step5.accountHolderName.trim(),
        },
        idCardNumber: parsed.data.idCardNumber,
        identityDocument: parsed.data.identityDocument,
        farmDocument: parsed.data.farmDocument,
        agreedToTerms: parsed.data.agreedToTerms,
      })
    } catch {
      return
    }

    resetDraft()
    setCompleted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (completed) {
    return (
      <FarmerAuthShell width='narrow'>
        <StepWelcome farmerName={step3.name.trim()} farmName={step1.farmName.trim()} />
      </FarmerAuthShell>
    )
  }

  return (
    <FarmerAuthShell
      step={currentStep}
      totalSteps={ONBOARDING_TOTAL_STEPS}
      stepLabel={stepLabels[currentStep]}
      width={currentStep === 1 || currentStep === 2 ? 'wide' : 'narrow'}
    >
      {resumeNotice && (
        <Alert>
          <AlertCircle />
          <AlertDescription>
            Pendaftaran akun petani Anda belum selesai. Lengkapi seluruh 6 langkah berikut terlebih
            dahulu sebelum masuk ke Dasbor Petani.
          </AlertDescription>
        </Alert>
      )}

      {currentStep === 1 && (
        <StepFarmProfile
          values={step1}
          errors={step1Errors}
          onChange={(next) => {
            setStep1((prev) => ({ ...prev, ...next }))
            setStep1Errors({})
          }}
          onNext={handleStep1Next}
        />
      )}

      {currentStep === 2 && (
        <StepCommodities
          values={step2}
          errors={step2Errors}
          onChange={(next) => {
            setStep2((prev) => ({ ...prev, ...next }))
            setStep2Errors({})
          }}
          onBack={() => setCurrentStep(1)}
          onNext={handleStep2Next}
        />
      )}

      {currentStep === 3 && (
        <StepAccountInfo
          values={step3}
          errors={step3Errors}
          onChange={(next) => {
            setStep3((prev) => ({ ...prev, ...next }))
            setStep3Errors({})
          }}
          onBack={() => setCurrentStep(2)}
          onNext={handleStep3Next}
        />
      )}

      {currentStep === 4 && (
        <StepFarmLocation
          values={step4}
          errors={step4Errors}
          onChange={(next) => {
            setStep4((prev) => ({ ...prev, ...next }))
            setStep4Errors({})
          }}
          onBack={() => setCurrentStep(3)}
          onNext={handleStep4Next}
        />
      )}

      {currentStep === 5 && (
        <StepBankAccount
          values={step5}
          errors={step5Errors}
          onChange={(next) => {
            setStep5((prev) => ({ ...prev, ...next }))
            setStep5Errors({})
          }}
          onBack={() => setCurrentStep(4)}
          onNext={handleStep5Next}
        />
      )}

      {currentStep === 6 && (
        <StepVerification
          values={step6}
          errors={step6Errors}
          submitError={registerMutation.isError ? registerMutation.error.message : undefined}
          isSubmitting={registerMutation.isPending}
          summary={{
            farmName: step1.farmName,
            name: step3.name,
            areaName: step4.areaName,
            bankName: step5.bankName,
            accountNumber: step5.accountNumber,
          }}
          onChange={(next) => {
            setStep6((prev) => ({ ...prev, ...next }))
            setStep6Errors({})
          }}
          onBack={() => setCurrentStep(5)}
          onSubmit={() => {
            void handleFinalSubmit()
          }}
        />
      )}

      <div className='mx-auto flex w-full max-w-md flex-col gap-4 pt-4'>
        <p className='text-center text-base text-muted-foreground'>
          Sudah pernah mendaftar sebagai petani?{' '}
          <Link
            href='/masuk-petani'
            className='inline-flex min-h-10 items-center rounded-sm px-1 font-medium text-primary underline underline-offset-4 transition-opacity pointer-coarse:min-h-11 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </FarmerAuthShell>
  )
}
