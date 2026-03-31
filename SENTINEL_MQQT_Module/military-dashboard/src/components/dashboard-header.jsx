import { useEffect, useState } from "react"
import { Shield, Radar, Bell, User, Settings, LayoutDashboard, Map as MapIcon } from "lucide-react"
import { Button } from "./ui/button" 

export default function DashboardHeader({ currentView = 'live', onViewChange }) {
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }))
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
    <header className="h-18 lg:h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 z-50 relative shrink-0">
      <div className="flex items-center gap-4">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-8 w-8 text-primary" />
            <Radar className="h-4 w-4 text-primary absolute -bottom-1 -right-1 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-foreground">SENTINEL</h1>
            <p className="hidden sm:block text-[10px] text-muted-foreground uppercase tracking-widest">
              Tactical Command System
            </p>
          </div>
        </div>
        
        {/* View Toggles (Risk vs Live) */}
        <div className="ml-4 lg:ml-8 flex bg-background/50 border border-border rounded-md p-1">
          <button
            onClick={() => onViewChange?.('live')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              currentView === 'live' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3 h-3" />
            <span className="hidden md:inline">Live Feed</span>
          </button>
          
          <button
            onClick={() => onViewChange?.('heatmap')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
              currentView === 'heatmap' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
            }`}
          >
            <MapIcon className="w-3 h-3" />
            <span className="hidden md:inline">Analytics Area</span>
          </button>
        </div>

      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        {/* System Status Badge */}
         <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded border border-border">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs font-semibold text-foreground uppercase tracking-widest">Online</span>
        </div>

        {/* Clock */}
        <div className="hidden sm:block text-right border-l border-border pl-4 lg:pl-6">
          <p className="text-lg lg:text-xl font-mono font-bold text-foreground tracking-wider">{currentTime}</p>
          <p className="text-[10px] text-muted-foreground tracking-wider">{currentDate}</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 lg:gap-2">
          <Button variant="ghost" size="icon" className="relative hidden md:flex">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="md:ml-2 border border-border/50 bg-secondary/30">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}