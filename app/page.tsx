import { templateManifest } from '@/lib/templates/registry'
import GalleryPageContent from '@/components/gallery/GalleryPageContent'

export default function HomePage() {
  return <GalleryPageContent templates={templateManifest} />
}
