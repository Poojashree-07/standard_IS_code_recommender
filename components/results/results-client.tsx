'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  FileQuestion,
  AlertTriangle,
  Loader2,
  SearchX,
  CheckCircle2,
  CircleAlert,
  HelpCircle,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Disclaimer } from '@/components/disclaimer'
import { EmptyState } from '@/components/empty-state'
import { StandardCard } from '@/components/results/standard-card'
import { ResultsSummary } from '@/components/results/results-summary'
import {
  ResultsControls,
  ALL,
  type ResultFilters,
  type SortKey,
} from '@/components/results/results-controls'
import { fetchRecommendations, RecommendationError } from '@/lib/api'

import { getStandardById } from '@/lib/mock-data'
import {
  CATEGORIES,
  MATERIALS,
  APPLICATIONS,
  STANDARD_TYPES,
} from '@/lib/mock-data'
import type { Recommendation } from '@/lib/types'

type Status = 'idle' | 'loading' | 'ready' | 'error' | 'no-query'

function RequirementGap({
  recommendation,
}: {
  recommendation: Recommendation
}) {
  const gap = recommendation.requirementGap

  if (!gap) {
    return null
  }

  const verified = gap.verified ?? []
  const unavailable = gap.unavailable ?? []
  const needsVerification = gap.needsVerification ?? []
  const items = gap.items ?? []

  const hasVerified = verified.length > 0
  const hasUnavailable = unavailable.length > 0
  const hasVerification = needsVerification.length > 0
  const hasItems = items.length > 0

  if (!hasVerified && !hasUnavailable && !hasVerification && !hasItems) {
    return null
  }

  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold">
          Requirement Gap Analysis
        </h3>

        <p className="mt-1 text-xs text-muted-foreground">
          Comparison between your procurement requirement and information
          currently represented in the available standard dataset.
        </p>
      </div>

      {hasVerified && (
        <div className="mb-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-600" />

            <h4 className="text-sm font-semibold">
              Verified / Available
            </h4>
          </div>

          <ul className="mt-3 space-y-2">
            {verified.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="text-sm text-muted-foreground"
              >
                ✓ {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasVerification && (
        <div className="mb-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-yellow-600" />

            <h4 className="text-sm font-semibold">
              Needs Verification
            </h4>
          </div>

          <ul className="mt-3 space-y-2">
            {needsVerification.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="text-sm text-muted-foreground"
              >
                ? {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasUnavailable && (
        <div className="mb-4 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <CircleAlert className="size-5 text-destructive" />

            <h4 className="text-sm font-semibold">
              Not Available in Dataset
            </h4>
          </div>

          <ul className="mt-3 space-y-2">
            {unavailable.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="text-sm text-muted-foreground"
              >
                • {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasItems && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            Requirement Details
          </h4>

          {items.map((item, index) => (
            <div
              key={`${item.field}-${index}`}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">
                  {item.field}
                </p>

                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    item.status === 'available' &&
                      'bg-green-100 text-green-700',
                    item.status === 'unavailable' &&
                      'bg-red-100 text-red-700',
                    item.status === 'needs-verification' &&
                      'bg-yellow-100 text-yellow-700',
                  )}
                >
                  {item.status === 'available'
                    ? 'Available'
                    : item.status === 'unavailable'
                      ? 'Unavailable'
                      : 'Needs verification'}
                </span>
              </div>

              {item.requestedValue && (
                <p className="mt-2 text-sm">
                  <span className="font-medium">
                    Requested:
                  </span>{' '}
                  {item.requestedValue}
                </p>
              )}

              {item.explanation && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Note: This analysis compares available information only. It does
        not determine product compliance or certification.
      </p>
    </div>
  )
}

export function ResultsClient() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')?.trim() ?? ''

  const [status, setStatus] = useState<Status>('idle')
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  const [filters, setFilters] = useState<ResultFilters>({
    category: ALL,
    material: ALL,
    application: ALL,
    type: ALL,
  })

  const [sort, setSort] = useState<SortKey>('relevant')

  useEffect(() => {
    if (!query) {
      setStatus('no-query')
      return
    }

    setStatus('loading')

    const controller = new AbortController()

    fetchRecommendations(query, controller.signal)
      .then((res) => {
        setRecommendations(res.recommendations)
        setStatus('ready')
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }

        setErrorMessage(
          err instanceof RecommendationError
            ? err.message
            : 'Something went wrong while fetching recommendations.',
        )

        setStatus('error')
      })

    return () => controller.abort()
  }, [query])

  const visible = useMemo(() => {
    const filtered = recommendations.filter((rec) => {
      const std = getStandardById(rec.standardId)

      if (!std) return true

      if (
        filters.category !== ALL &&
        std.category !== filters.category
      ) {
        return false
      }

      if (
        filters.material !== ALL &&
        std.material !== filters.material
      ) {
        return false
      }

      if (
        filters.application !== ALL &&
        std.application !== filters.application
      ) {
        return false
      }

      if (
        filters.type !== ALL &&
        std.type !== filters.type
      ) {
        return false
      }

      return true
    })

    const sorted = [...filtered]

    if (sort === 'alphabetical') {
      sorted.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      sorted.sort(
        (a, b) => b.relevanceScore - a.relevanceScore,
      )
    }

    return sorted
  }, [recommendations, filters, sort])

  if (status === 'no-query') {
    return (
      <EmptyState
        icon={<FileQuestion className="size-6" />}
        title="No requirement provided"
        description="Start by describing what you need to procure. We'll identify potentially relevant Indian Standards."
        action={
          <Link
            href="/recommend"
            className={cn(buttonVariants())}
          >
            Describe a requirement
          </Link>
        }
      />
    )
  }

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center">
        <Loader2 className="size-6 animate-spin text-primary" />

        <p className="mt-4 text-sm font-medium">
          Retrieving recommendations…
        </p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <EmptyState
        icon={
          <AlertTriangle className="size-6 text-warning-foreground" />
        }
        title="Could not load recommendations"
        description={errorMessage}
        action={
          <Link
            href="/recommend"
            className={cn(buttonVariants())}
          >
            Try again
          </Link>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <ResultsSummary
          query={query}
          count={visible.length}
        />

        <Link
          href="/recommend"
          className={cn(
            buttonVariants({ variant: 'outline' }),
          )}
        >
          Search Again
        </Link>
      </div>

      <Disclaimer />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <ResultsControls
            filters={filters}
            onFilterChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            categories={CATEGORIES}
            materials={MATERIALS}
            applications={APPLICATIONS}
            types={STANDARD_TYPES}
          />
        </aside>

        <div className="min-w-0 space-y-4">
          {visible.length === 0 ? (
            <EmptyState
              icon={<SearchX className="size-6" />}
              title="No relevant standards found"
              description="Try adding more details about the product, application, material, dimensions, or performance requirements — or relax the active filters."
              action={
                <Link
                  href="/recommend"
                  className={cn(
                    buttonVariants({
                      variant: 'outline',
                    }),
                  )}
                >
                  Refine requirement
                </Link>
              }
            />
          ) : (
            visible.map((rec, i) => (
              <div key={rec.standardId}>
                <StandardCard
                  recommendation={rec}
                  rank={i + 1}
                />

                <RequirementGap recommendation={rec} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}