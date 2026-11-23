import type { ReactNode } from 'react'
interface CardProps { title: string; children: ReactNode }
export function Card({title, children}: CardProps) {
  return <article className="fleet-card h-100"><h3>{title}</h3>{children}</article>
}
