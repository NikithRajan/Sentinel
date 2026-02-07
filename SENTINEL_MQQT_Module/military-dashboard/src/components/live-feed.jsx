import { useState, useEffect } from "react"
import { Map, Maximize2, Volume2, Radio, Target, Shield, AlertTriangle } from "lucide-react"
import { Button } from "./ui/button" // Relative path fix
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card" // Relative path fix

export default function LiveFeed({ currentAlert }) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [actionTaken, setActionTaken] = useState(null)
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString())

  // Update clock for the HUD
  useEffect(() => {
    const timer = setInterval(() => setTimestamp(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleVerifyThreat = () => {
    setIsVerifying(true)
    // In a real app, you would call a Firebase function here
    setTimeout(() => {
      setIsVerifying(false)
      setActionTaken("THREAT VERIFIED - ESCALATING TO COMMAND")
      setTimeout(() => setActionTaken(null), 3000)
    }, 1500)
  }

  const handleFalseAlarm = () => {
    setIsVerifying(true)
    setTimeout(() => {
      setIsVerifying(false)
      setActionTaken("MARKED AS FALSE ALARM - LOGGING")
      setTimeout(() => setActionTaken(null), 3000)
    }, 1500)
  }

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 min-w-0 h-full">
      {/* Status Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-foreground">
              Live Feed
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block">
            ID: {currentAlert ? `CAM-${currentAlert.id.slice(-4)}` : "SCANNING..."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent text-xs">
            <Volume2 className="h-3 w-3" />
            <span className="hidden sm:inline">Audio</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-2 bg-transparent text-xs">
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline">Expand</span>
          </Button>
        </div>
      </div>

      {/* Map/Feed Card */}
      <Card className="flex-1 relative overflow-hidden border-primary/20 bg-black/40">
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
                <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-primary border border-primary/30">
                    REC: ON <br/> 
                    {timestamp}
                </div>
                <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-destructive border border-destructive/30 animate-pulse">
                    LIVE CONNECTION
                </div>
            </div>
            
            {/* Center Crosshair */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 border border-primary/30 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-primary rounded-full"></div>
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-0.5 h-2 bg-primary/50"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-4 w-0.5 h-2 bg-primary/50"></div>
                <div className="absolute left-0 top-1/2 -translate-x-4 -translate-y-1/2 w-2 h-0.5 bg-primary/50"></div>
                <div className="absolute right-0 top-1/2 translate-x-4 -translate-y-1/2 w-2 h-0.5 bg-primary/50"></div>
            </div>

            <div className="flex justify-between items-end">
                <div className="text-[10px] font-mono text-muted-foreground">
                    LAT: 38.8977° N <br/> LONG: 77.0365° W
                </div>
                <div className="flex gap-1">
                    <div className="w-8 h-1 bg-primary/20"></div>
                    <div className="w-8 h-1 bg-primary/40"></div>
                    <div className="w-8 h-1 bg-primary/60"></div>
                    <div className="w-8 h-1 bg-primary/80"></div>
                </div>
            </div>
        </div>

        {/* The "Video Feed" (Placeholder) */}
        <div className="w-full h-full bg-secondary/20 relative grid place-items-center">
             {/* Grid Background */}
             <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, var(--primary) 1px, transparent 1px),
                  linear-gradient(to bottom, var(--primary) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
              }}
            />
            
            {currentAlert ? (
                <div className="text-center z-0">
                    <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-2 animate-bounce" />
                    <h3 className="text-xl font-bold text-destructive tracking-widest uppercase">
                        {currentAlert.intrusion_type || "OBJECT"} DETECTED
                    </h3>
                    <p className="text-sm font-mono text-muted-foreground">
                        Confidence: {(currentAlert.confidence * 100).toFixed(1)}%
                    </p>
                </div>
            ) : (
                <div className="text-center z-0">
                    <Radio className="h-12 w-12 text-primary/20 mx-auto mb-2 animate-pulse" />
                    <h3 className="text-lg font-bold text-primary/40 tracking-widest uppercase">
                        SECTOR SECURE
                    </h3>
                    <p className="text-xs font-mono text-muted-foreground/50">
                        Scanning for thermal signatures...
                    </p>
                </div>
            )}
        </div>
      </Card>

      {/* Action Feedback Overlay */}
      {actionTaken && (
        <div className="bg-background/80 border border-primary/50 rounded p-2 text-center absolute top-20 left-1/2 -translate-x-1/2 z-50 px-8 py-4 backdrop-blur-md shadow-2xl">
          <p className="text-sm font-bold font-mono text-primary animate-pulse">{actionTaken}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4 h-16">
        <Button
          variant="destructive"
          className="h-full text-base font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all"
          disabled={!currentAlert || isVerifying}
          onClick={handleVerifyThreat}
        >
          <Target className="h-5 w-5 mr-2" />
          ENGAGE / VERIFY
        </Button>
        <Button
          variant="secondary"
          className="h-full text-base font-bold uppercase tracking-wider bg-emerald-900/50 text-emerald-400 hover:bg-emerald-900/80 border border-emerald-500/30"
          disabled={!currentAlert || isVerifying}
          onClick={handleFalseAlarm}
        >
          <Shield className="h-5 w-5 mr-2" />
          FALSE ALARM
        </Button>
      </div>
    </div>
  )
}