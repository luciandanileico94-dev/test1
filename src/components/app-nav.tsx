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
  { href: "/app/dates", label: "Свидания", icon: Stars },
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
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-rose-50 text-rose-600 font-semibold shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Icon size={17} className={active ? "text-rose-500" : ""} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="flex justify-around items-center px-2 py-1.5">
      {mobileItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
              active ? "text-rose-500" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-rose-50" : ""}`}>
              <Icon size={20} />
            </div>
            <span className={`text-[10px] font-medium ${active ? "text-rose-500" : ""}`}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
