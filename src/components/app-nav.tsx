"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, Calendar, Gift, Image, Heart, Moon,
  CheckSquare, FileText, Stars, Settings
} from "lucide-react"

const navItems = [
  { href: "/app/dashboard", label: "Главная", icon: Home },
  { href: "/app/calendar", label: "Календарь", icon: Calendar },
  { href: "/app/wishlist", label: "Вишлисты", icon: Gift },
  { href: "/app/memories", label: "Воспоминания", icon: Image },
  { href: "/app/intimacy", label: "Близость", icon: Heart },
  { href: "/app/cycle", label: "Цикл", icon: Moon },
  { href: "/app/checkin", label: "Check-in", icon: CheckSquare },
  { href: "/app/agreements", label: "Договорённости", icon: FileText },
  { href: "/app/dates", label: "Идеи свиданий", icon: Stars },
  { href: "/app/settings", label: "Настройки", icon: Settings },
]

const mobileItems = [
  { href: "/app/dashboard", label: "Главная", icon: Home },
  { href: "/app/calendar", label: "Календарь", icon: Calendar },
  { href: "/app/wishlist", label: "Вишлисты", icon: Gift },
  { href: "/app/memories", label: "Фото", icon: Image },
  { href: "/app/settings", label: "Ещё", icon: Settings },
]

export default function AppNav({ variant }: { variant: "sidebar" | "bottom" }) {
  const pathname = usePathname()

  if (variant === "sidebar") {
    return (
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? "bg-rose-50 text-rose-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="flex justify-around items-center px-2 py-2">
      {mobileItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors ${
              active ? "text-rose-600" : "text-gray-400"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
