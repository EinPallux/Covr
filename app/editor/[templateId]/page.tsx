import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { loadTemplate } from '@/lib/templates/loader'
import { templateManifest } from '@/lib/templates/registry'
import EditorShell from '@/components/editor/EditorShell'

interface Props {
  params: Promise<{ templateId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { templateId } = await params
  const entry = templateManifest.find((t) => t.id === templateId)
  return {
    title: entry ? `Edit: ${entry.name}` : 'Editor',
  }
}

export function generateStaticParams() {
  return templateManifest.map((t) => ({ templateId: t.id }))
}

export default async function EditorPage({ params }: Props) {
  const { templateId } = await params
  const template = loadTemplate(templateId)
  if (!template) notFound()

  return <EditorShell template={template} />
}
