import { useState } from 'react'
import './Header.css'

interface HeaderProps {
  onSearch?: (query: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [query, setQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(query)
  }

  return (
    <header className="header">
      <div className="header-logo">LUVAO</div>
      <form className="header-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="header-input"
        />
        <button type="submit" className="header-btn">🔍</button>
      </form>
    </header>
  )
}