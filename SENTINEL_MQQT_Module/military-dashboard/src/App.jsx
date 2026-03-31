import { useEffect, useState } from "react"
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore"
import { db } from "./firebase"

import DashboardHeader from "./components/dashboard-header"
import AlertsSidebar from "./components/alerts-sidebar"
import LiveFeed from "./components/live-feed"
import StatusLog from "./components/status-log" 
import AnalyticsDashboard from "./components/heatmap/AnalyticsDashboard"

export default function App() {
  const [intrusions, setIntrusions] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [currentView, setCurrentView] = useState("live") // 'live' | 'heatmap'

  // 1. LISTEN TO FIREBASE
  useEffect(() => {
    // Increased limit to 500 to support dense heatmap Analytics
    const q = query(
      collection(db, "intrusions"), 
      orderBy("received_at", "desc"), 
      limit(500)
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
      <DashboardHeader currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Alerts List (only visible in Live view or fixed?) */}
        <div className={`hidden lg:block border-r border-border transition-all ${currentView === 'live' ? 'w-80' : 'w-64'}`}>
          <AlertsSidebar 
            alerts={intrusions} 
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        
        {/* Center Main Pnane */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
           {currentView === 'live' ? (
             <LiveFeed currentAlert={currentAlert} />
           ) : (
             <AnalyticsDashboard intrusions={intrusions} />
           )}
        </main>
        
        {/* Right Sidebar - System Status (hide in Heatmap view) */}
        {currentView === 'live' && (
          <div className="hidden xl:block w-80 border-l border-border bg-card">
            <StatusLog alerts={intrusions} />
          </div>
        )}
      </div>
    </div>
  )
}