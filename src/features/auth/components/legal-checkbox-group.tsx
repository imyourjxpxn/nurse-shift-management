interface LegalCheckboxGroupProps {
  acceptedTerms: boolean
  acceptedPrivacy: boolean
  onOpenTerms: () => void
  onOpenPrivacy: () => void
}

export function LegalCheckboxGroup({
  acceptedTerms,
  acceptedPrivacy,
  onOpenTerms,
  onOpenPrivacy,
}: LegalCheckboxGroupProps) {
  return (
    <div className="space-y-3">
      {/* Terms Checkbox */}
      <button
        type="button"
        onClick={onOpenTerms}
        className="flex w-full items-center gap-3 rounded-lg border border-transparent px-1 py-1 text-left transition-colors hover:bg-muted/40"
      >
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            acceptedTerms
              ? 'border-sky-500 bg-sky-500'
              : 'border-muted-foreground/50 bg-background'
          }`}
          aria-hidden="true"
        >
          {acceptedTerms && (
            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className="text-sm text-muted-foreground">
          {'ฉันยอมรับ '}
          <span className="text-sky-600 underline">เงื่อนไขการใช้งาน</span>
          {acceptedTerms
            ? <span className="ml-1 text-xs text-green-600 font-medium">(ยอมรับแล้ว)</span>
            : <span className="ml-1 text-xs text-destructive font-medium">(กรุณากดยอมรับ)</span>
          }
        </span>
      </button>

      {/* Privacy Checkbox */}
      <button
        type="button"
        onClick={onOpenPrivacy}
        className="flex w-full items-center gap-3 rounded-lg border border-transparent px-1 py-1 text-left transition-colors hover:bg-muted/40"
      >
        <span
          className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            acceptedPrivacy
              ? 'border-sky-500 bg-sky-500'
              : 'border-muted-foreground/50 bg-background'
          }`}
          aria-hidden="true"
        >
          {acceptedPrivacy && (
            <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </span>
        <span className="text-sm text-muted-foreground">
          {'ฉันยอมรับ '}
          <span className="text-sky-600 underline">นโยบายความเป็นส่วนตัว (PDPA)</span>
          {acceptedPrivacy
            ? <span className="ml-1 text-xs text-green-600 font-medium">(ยอมรับแล้ว)</span>
            : <span className="ml-1 text-xs text-destructive font-medium">(กรุณากดยอมรับ)</span>
          }
        </span>
      </button>
    </div>
  )
}