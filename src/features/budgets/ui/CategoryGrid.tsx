import type { CategorySummary } from '../domain/categorySummary'
import { CategoryCard } from './CategoryCard'

export function CategoryGrid({ summaries, label }: { summaries: CategorySummary[]; label: string }) {
  return (
    <section aria-label={label} className="grid gap-4 sm:grid-cols-2">
      {summaries.map((summary) => (
        <CategoryCard key={summary.categoryId} summary={summary} />
      ))}
    </section>
  )
}
