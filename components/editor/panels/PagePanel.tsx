'use client'

import { Copy, FilePlus2, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/lib/store/editorStore'
import { makePage } from '@/lib/projects/presets'
import IconButton from '@/components/ui/IconButton'
import { cn } from '@/lib/utils/cn'

export default function PagePanel() {
  const { project, activePageId, setActivePage, addPage, duplicateActivePage, removeActivePage, renamePage } = useEditorStore()
  if (!project) return null
  const active = project.pages.find((page) => page.id === activePageId) ?? project.pages[0]

  return (
    <section className="border-b border-zinc-800 bg-zinc-900">
      <div className="flex h-10 items-center justify-between px-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">Pages</span>
        <div className="flex items-center gap-0.5">
          <IconButton icon={FilePlus2} size="xs" tooltip="New page" onClick={() => addPage(makePage(`Page ${project.pages.length + 1}`, active.width, active.height))} />
          <IconButton icon={Copy} size="xs" tooltip="Duplicate page" onClick={duplicateActivePage} />
          <IconButton icon={Trash2} size="xs" tooltip="Delete page" danger disabled={project.pages.length <= 1} onClick={removeActivePage} />
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto px-2 pb-2">
        {project.pages.map((page, index) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            onDoubleClick={() => {
              const name = window.prompt('Page name', page.name)
              if (name?.trim()) renamePage(page.id, name.trim())
            }}
            className={cn(
              'min-w-20 rounded border px-2 py-1.5 text-left transition-colors',
              page.id === activePageId
                ? 'border-emerald-600 bg-emerald-950/40 text-emerald-300'
                : 'border-zinc-800 bg-zinc-950/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300',
            )}
          >
            <span className="block truncate text-[11px]">{index + 1}. {page.name}</span>
            <span className="block text-[9px] text-zinc-600">{page.width} × {page.height}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
