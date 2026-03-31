import React from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from 'recharts'

import {
  formatPieData,
  formatBarData,
  formatLineData
} from '../../libs/heatmap-utils'
import RiskMap from './RiskMap'

const COLORS = ['#3b82f6', '#22d3ee', '#fbbf24', '#fb7185']

const Card = ({ title, children, className = "" }) => (
  <div className={`
    rounded-xl
    bg-card
    border border-border/50
    shadow-lg
    p-5
    flex flex-col
    ${className}
  `}>
    <h4 className="mb-4 text-sm tracking-wider font-bold text-muted-foreground uppercase">
      {title}
    </h4>
    {children}
  </div>
)

const AnalyticsDashboard = ({ intrusions }) => {
  if (!intrusions || intrusions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[400px]">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <h3 className="text-xl font-bold tracking-widest text-foreground uppercase mb-2">No Historical Data Found</h3>
        <p className="text-sm text-muted-foreground font-mono text-center max-w-md">
          Risk heatmaps require historical telemetry. Awaiting sensor inputs from the Firebase database...
        </p>
      </div>
    )
  }

  const pieData = formatPieData(intrusions)
  const barData = formatBarData(intrusions)
  const lineData = formatLineData(intrusions)

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 min-w-0">
      
      {/* HEADER */}
      <div className="mb-8">
          <h2 className="text-2xl font-black text-foreground uppercase tracking-widest border-b border-border/50 pb-2">
              Risk & Threat Analytics
          </h2>
          <p className="text-xs font-mono text-muted-foreground mt-2">
              Processing {intrusions.length} data points across registered domains.
          </p>
      </div>

      {/* HEATMAP ROW (Spans full width) */}
      <section className="h-[400px] mb-8">
          <Card title="Live Geographical Heatmap (Density)" className="h-full">
               <RiskMap intrusions={intrusions} />
          </Card>
      </section>

      {/* CHARTS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* PIE 1 */}
          <Card title="Signature Classification">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#000", borderColor: "#333" }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* BAR CHART */}
          <Card title="Top Sector Risk Instances" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="zone" stroke="#666" tick={{ fontSize: 10, fill: "#888" }} />
                <YAxis stroke="#666" tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip 
                    cursor={{ fill: "rgba(255,255,255,0.05)" }} 
                    contentStyle={{ backgroundColor: "#000", borderColor: "#333", borderRadius: "8px" }}
                />
                <Bar dataKey="count" fill="url(#cyanGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.2} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* LINE CHART 1 */}
          <Card title="Hourly Signature Trend" className="lg:col-span-3">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="time" stroke="#666" tick={{ fontSize: 10 }} />
                <YAxis stroke="#666" tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: "#000", borderColor: "#333", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="intrusions" stroke="#fb7185" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

      </section>
    </div>
  )
}

export default AnalyticsDashboard
