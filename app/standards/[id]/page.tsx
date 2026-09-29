import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FlaskConical,
  Tag,
  Layers,
  Link2,
  MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import { Disclaimer } from '@/components/disclaimer'
import { TechnicalRequirements } from '@/components/technical-requirements'
import { EvidencePanel } from '@/components/evidence-panel'
import { SectionHeading } from '@/components/section-heading'
import { getStandardById } from '@/lib/recommend-engine'
export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const standard = getStandardById(id)
  if (!standard) return { title: 'Standard not found' }
  return {
    title: `${standard.code} — ${standard.title}`,
    description: standard.scope,
  }
}

export default async function StandardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string }>
}) {
  const { id } = await params
  const { q } = await searchParams
  const standard = getStandardById(id)
  if (!standard) notFound()

  const related = standard.relatedStandardIds
    .map((rid) => getStandardById(rid))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link
  href={q ? `/results?q=${encodeURIComponent(q)}` : '/standards'}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Explorer
      </Link>

      {/* Header */}
      <header className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-primary/10 px-2.5 py-1 font-mono text-xl font-semibold text-primary">
            {standard.code}
          </span>
          <StatusBadge status={standard.status} />
          <Badge variant="outline">{standard.type}</Badge>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl text-balance">
          {standard.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Layers className="size-4" />
            {standard.category}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-4" />
            {standard.version} · {standard.date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            
        
          </span>
        </div>
      </header>

      <div className="mt-6">
        <Disclaimer variant="default" />
      </div>

      {/* Scope */}
      <section className="mt-8">
        <SectionHeading eyebrow="Overview" title="Scope" />
        <Card className="mt-4 p-5">
          <p className="text-sm leading-relaxed">{standard.scope}</p>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
            {standard.applicableAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs text-muted-foreground"
              >
                <MapPin className="size-3" />
                {area}
              </span>
            ))}
          </div>
        </Card>
      </section>

      {/* Why recommended — relationship trace */}
      <section className="mt-10">
        <SectionHeading
          eyebrow="Traceability"
          title="Why This Standard Was Recommended"
          description="The recommendation is grounded in retrieved evidence: the user requirement is linked to matched concepts, the standard's scope, supporting sections, and the specific requirements extracted from them."
        />
        <div className="mt-4">
          <EvidencePanel trace={standard.evidenceTrace} />
        </div>
      </section>

      {/* Technical requirements */}
      <section className="mt-10">
        <SectionHeading eyebrow="Specification" title="Technical Requirements" />
        <div className="mt-4">
          <TechnicalRequirements requirements={standard.technicalRequirements} columns={3} />
        </div>
      </section>

      {/* Sections */}
      <section className="mt-10">
        <SectionHeading eyebrow="Structure" title="Relevant Sections" />
        <div className="mt-4 space-y-3">
          {standard.sections.map((section) => (
            <Card key={section.title} className="p-5">
              <h3 className="font-mono text-sm font-semibold">{section.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {section.content}
              </p>
              <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Supporting evidence
                </p>
                <p className="mt-1 text-sm leading-relaxed">{section.evidence}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Testing & marking */}
      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FlaskConical className="size-4 text-brand" />
            Testing Requirements
          </h3>
          <ul className="mt-3 space-y-2">
            {standard.testingRequirements.map((t) => (
              <li key={t} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                {t}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Tag className="size-4 text-brand" />
            Marking Requirements
          </h3>
          <ul className="mt-3 space-y-2">
            {standard.markingRequirements.map((m) => (
              <li key={m} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                {m}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      {/* Related standards */}
      {related.length > 0 && (
        <section id="compare" className="mt-10 scroll-mt-24">
          <SectionHeading eyebrow="Connections" title="Related Standards" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((r) => (
              <Link key={r.id} href={`/standards/${r.id}`} className="group block">
                <Card className="h-full p-4 transition-colors group-hover:border-ring">
                  <div className="flex items-center gap-2">
                    <Link2 className="size-4 text-muted-foreground" />
                    <span className="font-mono text-xs font-semibold text-primary">{r.code}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-snug">{r.title}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer CTA */}
      <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-6">
        <Link href="/recommend" className={cn(buttonVariants())}>
          Find standards for a requirement
        </Link>
        <Link href="/standards" className={cn(buttonVariants({ variant: 'outline' }))}>
          Browse all standards
        </Link>
      </div>
    </main>
  )
}
