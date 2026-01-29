interface TagPillProps {
  tag: string
  onClick?: () => void
  selected?: boolean
}

export default function TagPill({ tag, onClick, selected = false }: TagPillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-sm font-mono rounded border-2 transition-all duration-300 ${
        selected
          ? 'bg-silver-main border-silver-main text-deep-black shadow-[0_0_15px_rgba(192,192,192,0.8)]'
          : 'bg-transparent border-silver-main/50 text-silver-light hover:border-silver-main hover:bg-silver-main/10 hover:shadow-[0_0_10px_rgba(192,192,192,0.5)]'
      }`}
    >
      #{tag}
    </button>
  )
}
