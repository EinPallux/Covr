import type { TemplateManifestEntry } from '@/lib/templates/registry'
import TemplateCard from './TemplateCard'

interface Props {
  templates: TemplateManifestEntry[]
}

export default function GalleryGrid({ templates }: Props) {
  if (templates.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-zinc-800">
        <p className="text-sm text-zinc-600">No templates in this category yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}
