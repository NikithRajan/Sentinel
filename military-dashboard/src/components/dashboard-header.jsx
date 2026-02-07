import { useEffect, useState } from "react"
import { Shield, Radar, Bell, User, Settings } from "lucide-react"
import { Button } from "./ui/button" // Fixed relative path

export default function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // Use standard browser locale for time
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }))
      // Use standard browser locale for date
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }).toUpperCase())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 z-50 relative">
      <div className="flex items-center gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <Radar className="h-4 w-4 text-primary absolute -bottom-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-foreground">SENTINEL</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Tactical Command System
            </p>
          </div>
        </div>
        
        {/* System Status Badge */}
        <div className="hidden md:flex items-center gap-2 ml-8 px-3 py-1.5 bg-secondary/50 rounded border border-border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs font-semibold text-foreground uppercase">System Online</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Clock */}
        <div className="hidden sm:block text-right">
          <p className="text-xl font-mono font-bold text-foreground tracking-wider">{currentTime}</p>
          <p className="text-[10px] text-muted-foreground tracking-wider">{currentDate}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="ml-2">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}