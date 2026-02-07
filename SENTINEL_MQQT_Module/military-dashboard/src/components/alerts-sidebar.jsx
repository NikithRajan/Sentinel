import { AlertTriangle, Shield, Radio, Crosshair } from "lucide-react"
import { cn } from "../libs/utils" // <--- FIXED: Relative path

// 1. CONFIG: Colors for different statuses
const statusConfig = {
  pending: { color: "text-red-500", bg: "bg-red-500/20", icon: AlertTriangle, label: "CRITICAL" },
  verified: { color: "text-orange-500", bg: "bg-orange-500/20", icon: Crosshair, label: "VERIFIED" },
  false_alarm: { color: "text-green-500", bg: "bg-green-500/20", icon: Shield, label: "SAFE" },
  default: { color: "text-blue-500", bg: "bg-blue-500/20", icon: Radio, label: "UNKNOWN" }
}

// 2. COMPONENT: Accepts 'alerts' and 'onSelect' from App.jsx
export default function AlertsSidebar({ alerts = [], selectedId, onSelect }) {
  
  return (
    <aside className="w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-sidebar">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
            DETECTED THREATS
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {alerts.length} active signatures
        </p>
      </div>
      
      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {alerts.map((alert) => {
          // Determine style based on status
          const config = statusConfig[alert.status] || statusConfig.default
          const Icon = config.icon
          const isSelected = selectedId === alert.id

          // Format the timestamp safely
          const timeString = alert.received_at?.seconds 
            ? new Date(alert.received_at.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})
            : "LIVE"

          return (
            <div
              key={alert.id}
              onClick={() => onSelect && onSelect(alert.id)}
              className={cn(
                "p-3 rounded-md border cursor-pointer transition-all",
                isSelected 
                  ? "bg-accent border-primary ring-1 ring-primary" 
                  : "bg-card border-border hover:bg-accent/50 hover:border-accent"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon Box */}
                <div className={cn("p-2 rounded shrink-0", config.bg)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>

                {/* Text Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                      config.bg, config.color
                    )}>
                      {config.label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {timeString}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-semibold text-foreground truncate uppercase">
                    {alert.intrusion_type || "Unknown Object"}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-1">
                     <p className="text-xs text-muted-foreground font-mono">
                      CAM-{alert.id.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {alerts.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm">
            No active threats detected.
            <br />
            Scanning sector...
          </div>
        )}
      </div>
    </aside>
  )
}