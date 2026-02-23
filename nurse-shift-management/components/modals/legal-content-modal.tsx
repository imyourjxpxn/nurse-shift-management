'use client'

import { useRef, useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LegalContentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onAccept: () => void
  children: React.ReactNode
}

export function LegalContentModal({
  open,
  onOpenChange,
  title,
  onAccept,
  children,
}: LegalContentModalProps) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    // Allow a small threshold for rounding
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8
    if (atBottom) {
      setHasScrolledToEnd(true)
    }
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      // Reset scroll state when closing without accepting
      setHasScrolledToEnd(false)
    }
    onOpenChange(nextOpen)
  }

  const handleAccept = () => {
    onAccept()
    setHasScrolledToEnd(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-lg" showCloseButton={false}>
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-lg font-bold text-foreground">{title}</DialogTitle>
        </DialogHeader>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-6 py-4"
        >
          <div className="prose prose-sm max-w-none text-sm leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!hasScrolledToEnd}
            className="flex-1 bg-sky-500 text-white hover:bg-sky-600 disabled:bg-sky-300 disabled:opacity-70"
          >
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
