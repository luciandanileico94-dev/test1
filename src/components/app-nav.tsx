"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/app/dashboard",  label: "Главная",         icon: "home" },
  { href: "/app/calendar",   label: "Календарь",        icon: "calendar" },
  { href: "/app/wishlist",   label: "Вишлисты",         icon: "gift" },
  { href: "/app/memories",   label: "Воспоминания",     icon: "image" },
  { href: "/app/intimacy",   label: "Близость",         icon: "heart" },
  { href: "/app/cycle",      label: "Цикл",             icon: "moon" },
  { href: "/app/checkin",    label: "Check-in",         icon: "check-square" },
  { href: "/app/agreements", label: "Договорённости",   icon: "file-text" },
  { href: "/app/dates",      label: "Свидания",         icon: "star" },
  { href: "/app/settings",   label: "Настройки",        icon: "settings" },
]

const mobileItems = [
  { href: "/app/dashboard", label: "Главная",   icon: "home" },
  { href: "/app/calendar",  label: "Календарь", icon: "calendar" },
  { href: "/app/wishlist",  label: "Вишлисты",  icon: "gift" },
  { href: "/app/memories",  label: "Фото",      icon: "image" },
  { href: "/app/settings",  label: "Ещё",       icon: "settings" },
]

const iconPaths: Record<string, string> = {
  "home":         "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  "calendar":     "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z",
  "gift":         "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z",
  "image":        "M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2z M8.5 11a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M21 15l-5-5L5 21",
  "heart":        "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  "moon":         "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  "check-square": "M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  "file-text":    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  "star":         "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  "settings":     "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
}

function NavIcon({ name, size = 16 }: { name: string; size?: number }) {
  const d = iconPaths[name] || ""
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {d.split(" M").map((seg, i) => (
        <path key={i} d={i === 0 ? seg : "M" + seg} />
      ))}
    </svg>
  )
}

export default function AppNav({ variant }: { variant: "sidebar" | "bottom" }) {
  const pathname = usePathname()

  if (variant === "sidebar") {
    return (
      <nav style={{ flex: 1, padding: "12px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 12,
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                textDecoration: "none",
                transition: "all .15s",
                position: "relative",
                background: active ? "hsl(340,100%,97%)" : "transparent",
                color: active ? "hsl(340,75%,45%)" : "#888",
              }}
            >
              <NavIcon name={icon} size={16} />
              <span>{label}</span>
              {active && (
                <span style={{
                  marginLeft: "auto",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "hsl(340,75%,55%)",
                  flexShrink: 0,
                }} />
              )}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav style={{ display: "flex", justifyContent: "space-around", alignItems: "center", padding: "4px 8px 8px" }}>
      {mobileItems.map(({ href, label, icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              padding: "4px 8px",
              borderRadius: 12,
              textDecoration: "none",
              color: active ? "hsl(340,75%,50%)" : "#aaa",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <div style={{
              padding: 5,
              borderRadius: 10,
              background: active ? "hsl(340,100%,97%)" : "transparent",
            }}>
              <NavIcon name={icon} size={20} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 500 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
