import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type React from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseLinks(content: string): React.ReactNode[] {
  const linkRegex = /\[\[([^\]]+)\]\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(content)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }

    // Add the link
    const linkText = match[1]
    const linkId = linkText.toLowerCase().replace(/\s+/g, "-")
    parts.push(
      <a
        key={`${match.index}-${linkText}`}
        href={`/note/${linkId}`}
        className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
      >
        {linkText}
      </a>,
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts
}
