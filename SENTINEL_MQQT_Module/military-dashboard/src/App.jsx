import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { db } from "./firebase"

// FIXED IMPORTS (No curly braces for default exports)
import DashboardHeader from "./components/dashboard-header"
import AlertsSidebar from "./components/alerts-sidebar"
import LiveFeed from "./components/live-feed"
import StatusLog from "./components/status-log" 

export default function App() {
  const [intrusions, setIntrusions] = useState([])
  const [selectedId, setSelectedId] = useState(null)

  // 1. LISTEN TO FIREBASE
  useEffect(() => {
    const q = query(
      collection(db, "intrusions"), 
      orderBy("received_at", "desc"), 
      limit(50)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setIntrusions(data)
      // Auto-select the newest alert if none is selected
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id)
      }
    }, (error) => {
      console.error("Firebase Error:", error)
    })

    return () => unsubscribe()
  }, []) // Run once on mount

  // 2. FIND SELECTED ALERT
  const currentAlert = intrusions.find(alert => alert.id === selectedId)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background text-foreground font-sans">
      <DashboardHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Alerts List */}
        <div className="hidden lg:block border-r border-border">
          <AlertsSidebar 
            alerts={intrusions} 
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        
        {/* Center - Live Feed */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
           {/* Mobile Alert Toggle could go here later */}
          <LiveFeed currentAlert={currentAlert} />
        </main>
        
        {/* Right Sidebar - System Status */}
        <div className="hidden xl:block w-80 border-l border-border bg-card">
          <StatusLog alerts={intrusions} />
        </div>
      </div>
    </div>
  )
}