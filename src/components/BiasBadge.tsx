import type { BiasCategory } from "../types/issue"
import { BIAS_COLORS } from "../types/issue"

type Props = {
  bias: BiasCategory
  size?: "sm" | "md"
}

export default function BiasBadge({ bias, size = "md" }: Props) {
  const color = BIAS_COLORS[bias]
  
  const colorMap = {
    red: {
      bg: "bg-red-900/30",
      border: "border-red-500/50",
      text: "text-red-300",
      dot: "bg-red-500",
    },
    yellow: {
      bg: "bg-yellow-900/30",
      border: "border-yellow-500/50",
      text: "text-yellow-300",
      dot: "bg-yellow-500",
    },
    blue: {
      bg: "bg-blue-900/30",
      border: "border-blue-500/50",
      text: "text-blue-300",
      dot: "bg-blue-500",
    },
    purple: {
      bg: "bg-purple-900/30",
      border: "border-purple-500/50",
      text: "text-purple-300",
      dot: "bg-purple-500",
    },
    orange: {
      bg: "bg-orange-900/30",
      border: "border-orange-500/50",
      text: "text-orange-300",
      dot: "bg-orange-500",
    },
    green: {
      bg: "bg-green-900/30",
      border: "border-green-500/50",
      text: "text-green-300",
      dot: "bg-green-500",
    },
    pink: {
      bg: "bg-pink-900/30",
      border: "border-pink-500/50",
      text: "text-pink-300",
      dot: "bg-pink-500",
    },
  }

  const styles = colorMap[color]
  const sizeClass = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"

  return (
    <div className={`flex items-center gap-2 ${sizeClass} rounded border ${styles.bg} ${styles.border}`}>
      <div className={`w-2 h-2 rounded-full ${styles.dot}`} />
      <span className={`font-medium ${styles.text}`}>{bias}</span>
    </div>
  )
}
