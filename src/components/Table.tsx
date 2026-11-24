import type { ReactNode } from 'react'
import { Button } from './Button'

interface Column<T> { title: string; render: (item: T) => ReactNode }
interface TableProps<T extends {id: string}> {
  columns: Column<T>[]
  data: T[]
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  disabled?: boolean
}
export function Table<T extends {id: string}>({columns,data,onEdit,onDelete,disabled}: TableProps<T>) {
  return <div className="table-responsive"><table className="table align-middle">
    <thead><tr>{columns.map(c => <th key={c.title} scope="col">{c.title}</th>)}<th scope="col">Ações</th></tr></thead>
    <tbody>{data.map(item => <tr key={item.id}>
      {columns.map(c => <td key={c.title}>{c.render(item)}</td>)}
      <td><div className="d-flex flex-wrap gap-2">
        <Button label="Editar" variant="secondary" disabled={disabled} onClick={() => onEdit(item)} />
        <Button label="Excluir" variant="danger" disabled={disabled} onClick={() => onDelete(item)} />
      </div></td>
    </tr>)}</tbody>
  </table></div>
}
