import { useTheme } from "@/components/theme-provider"
import { Switch } from "./ui/switch"

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const isDarkMode = theme === "dark";

  const onCheckedChange = (toggled: boolean) => {
    if (toggled) {
      setTheme("dark")
    } else {
      setTheme("light")
    }
  }

  return (
    <div className="flex gap-2 items-center space-between">
      <span className="flex-1">Dark Mode</span>
      <Switch checked={isDarkMode} onCheckedChange={onCheckedChange} />
    </div>
  )
}
