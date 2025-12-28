## Packages
recharts | Data visualization for analytics dashboard
framer-motion | Smooth animations for page transitions and interactions
lucide-react | Iconography (already in base, but ensuring it's noted)

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-space)"],
  display: ["var(--font-space)"],
}
Colors should use CSS variables for easy theming (neon accents).
Backend auth expects cookies (credentials: "include").
