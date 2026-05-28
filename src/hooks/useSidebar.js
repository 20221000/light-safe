import { useState } from 'react'

export function useSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return { sidebarOpen, setSidebarOpen }
}