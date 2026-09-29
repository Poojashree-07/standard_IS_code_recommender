'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  ChevronDown,
  FileSearch,
  GitCompareArrows,
  BookOpen,
  Calendar,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { RelevanceScore } from '@/components/relevance-score'
import { TechnicalRequirements } from '@/components/technical-requirements'
import { EvidencePanel } from '@/components/evidence-panel'
import { StatusBadge } from '@/components/status-badge'
import { getStandardById } from '@/lib/mock-data'
import type { Recommendation } from '@/lib/types'

export function StandardCard({
  recommendation,
  rank,
}: {
  recommendation: Recommendation
  rank: number
}) {
  const [showEvidence, setShowEvidence] = useState(false)
  const router = useRouter()
  const standard = getStandardById(recommendation.standardId)

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:gap-8">
        {/* Main column */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-[11px]">
              #{rank} candidate
            </Badge>
           <span className="rounded-md bg-primary/10 px-2 py-0.5 font-mono text-sm font-semibold text-primary">
  {recommendation.code}
</span>
            {standard && <StatusBadge status={standard.status} />}
            
          </div>

          <h3 className="mt-3 text-lg font-semibold leading-snug text-balance">
            {recommendation.title}
          </h3>

          {/* Why recommended */}
          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Why recommended
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">
              {recommendation.whyRecommended}
            </p>
          </div>

          {/* Relevant requirements */}
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Relevant requirements
            </p>
            <div className="mt-2.5">
              <TechnicalRequirements
                requirements={recommendation.technicalRequirements}
              />
            </div>
          </div>

          {/* Source / traceability */}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-3.5" />
             
            </span>
            {standard && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {standard.version} · {standard.date}
              </span>
            )}
            {recommendation.relevantSections[0] && (
              <span className="inline-flex items-center gap-1.5">
                <Hash className="size-3.5" />
                {recommendation.relevantSections[0].title}
              </span>
            )}
            <Badge variant="success">Evidence available</Badge>
          </div>
        </div>

        {/* Score rail */}
        <div className="lg:w-52 lg:border-l lg:border-border lg:pl-6">
          <RelevanceScore score={recommendation.relevanceScore} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/30 px-5 py-3 sm:px-6">
        <Link
         href={`/standards/${recommendation.standardId}?q=${encodeURIComponent(new URLSearchParams(window.location.search).get('q') ?? '')}`}
          className={cn(buttonVariants({ size: 'sm' }))}
        >
          View Details
          <ArrowUpRight />
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEvidence((v) => !v)}
          aria-expanded={showEvidence}
        >
          <FileSearch />
          {showEvidence ? 'Hide Evidence' : 'View Evidence'}
          <ChevronDown
            className={cn(
              'transition-transform',
              showEvidence && 'rotate-180',
            )}
          />
        </Button>

        <Button
  variant="ghost"
  size="sm"
  onClick={() => {
    const existing = sessionStorage.getItem('compareStandards')
    const ids: string[] = existing ? JSON.parse(existing) : []

    if (!ids.includes(recommendation.standardId)) {
      ids.push(recommendation.standardId)
    }

    sessionStorage.setItem('compareStandards', JSON.stringify(ids))

    const currentQuery =
      new URLSearchParams(window.location.search).get('q') ?? ''

    router.push(
      `/compare?ids=${ids.join(',')}&q=${encodeURIComponent(currentQuery)}`,
    )
  }}
>
  <GitCompareArrows />
  Compare
</Button>

        {/* Web verification link */}
<a
  href={`https://www.google.com/search?q=${encodeURIComponent(
    `${recommendation.code} ${recommendation.title}`,
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className={cn(
    buttonVariants({ variant: 'outline', size: 'sm' }),
  )}
>
  Search Web
  <ArrowUpRight />
</a>
      </div>

      {showEvidence && (
        <div className="border-t border-border p-5 sm:p-6">
          <EvidencePanel trace={recommendation.evidence} />
        </div>
      )}
    </Card>
  )
}