import { useEffect, useRef, useState } from "react"
import { Scroll, Activity, Database, Server } from "lucide-react"

export default function StatusLog({ alerts }) {
  const [logs, setLogs] = useState([
    { id: 1, text: "SYSTEM INITIALIZED...", type: "info", time: new Date() },
    { id: 2, text: "CONNECTED TO SENTINEL NETWORK", type: "success", time: new Date() },
  ])
  const bottomRef = useRef(null)

  // Auto-generate logs when alerts change
  useEffect(() => {
    if (alerts.length > 0) {
      const newLog = {
        id: Date.now(),
        text: `NEW SIGNATURE: ${alerts[0].intrusion_type || "UNKNOWN"} DETECTED`,
        type: "warning",
        time: new Date()
      }
      setLogs(prev => [...prev.slice(-20), newLog]) // Keep last 20 logs
    }
  }, [alerts])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Header */}
      <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-widest">System Logs</h3>
        </div>
        <div className="flex gap-2">
            <Database className="h-3 w-3 text-muted-foreground" />
            <Server className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* Scrolling Log Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-muted-foreground shrink-0">
              [{log.time.toLocaleTimeString([], {hour12: false})}]
            </span>
            <span className={
              log.type === 'warning' ? 'text-orange-400' :
              log.type === 'success' ? 'text-green-400' :
              'text-primary/70'
            }>
              {log.text}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer Status */}
      <div className="p-2 border-t border-border bg-card text-[10px] text-center text-muted-foreground uppercase tracking-widest">
        Encrypted Connection: TLS v1.3
      </div>
    </div>
  )
}