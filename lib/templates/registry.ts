import type { TemplateCategory } from './schema'

export interface TemplateManifestEntry {
  id: string
  name: string
  category: TemplateCategory
  thumbnail: string
  description: string
  tags: string[]
}

export const templateManifest: TemplateManifestEntry[] = [
  {
    id: 'adventure-pack',
    name: 'Adventure Pack',
    category: 'adventure',
    thumbnail: '/thumbnails/adventure-pack.svg',
    description: 'Lush environments and epic exploration — perfect for open-world packs.',
    tags: ['adventure', 'nature', 'exploration', 'forest'],
  },
  {
    id: 'pvp-arena',
    name: 'PvP Arena',
    category: 'pvp',
    thumbnail: '/thumbnails/pvp-arena.svg',
    description: 'Intense battle-ready design with fiery aesthetics for combat packs.',
    tags: ['pvp', 'combat', 'battle', 'fire'],
  },
  {
    id: 'survival-world',
    name: 'Survival World',
    category: 'survival',
    thumbnail: '/thumbnails/survival-world.svg',
    description: 'Classic earthy tones and rugged style for survival gameplay packs.',
    tags: ['survival', 'earth', 'classic', 'crafting'],
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    category: 'creative',
    thumbnail: '/thumbnails/creative-studio.svg',
    description: 'Vibrant and colorful layout for creative building packs.',
    tags: ['creative', 'building', 'colorful', 'design'],
  },
  {
    id: 'minigame-hub',
    name: 'Minigame Hub',
    category: 'minigame',
    thumbnail: '/thumbnails/minigame-hub.svg',
    description: 'Fun and energetic design for minigame collections.',
    tags: ['minigame', 'fun', 'multiplayer', 'hub'],
  },
  {
    id: 'horror-escape',
    name: 'Horror Escape',
    category: 'horror',
    thumbnail: '/thumbnails/horror-escape.svg',
    description: 'Dark and atmospheric design for horror and escape room packs.',
    tags: ['horror', 'dark', 'escape', 'thriller'],
  },
]
