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
} from '../../utils/chartDataFormatters'

const COLORS = ['#3b82f6', '#22d3ee', '#fbbf24', '#fb7185']

const Card = ({ title, children }) => (
  <div className="
    rounded-2xl
    bg-card
    border border-border
    shadow-xl shadow-black/40
    backdrop-blur
    p-6
    transition-all
    hover:shadow-2xl
  ">
    <h4 className="mb-4 text-lg font-bold text-foreground">
      {title}
    </h4>
    {children}
  </div>
)

const AnalyticsDashboard = ({ intrusions }) => {
  if (!intrusions || intrusions.length === 0) {
    return (
      <div className="rounded-xl border border-border p-6 text-muted-foreground">
        No analytics data available
      </div>
    )
  }

  const pieData = formatPieData(intrusions)
  const barData = formatBarData(intrusions)
  const lineData = formatLineData(intrusions)

  return (
    <div className="space-y-16 mt-10">

      {/* ================= PIE CHARTS ================= */}
      <section>
        <h3 className="mb-6 text-2xl font-extrabold">
          Intrusion Distribution
        </h3>

        <div className="grid grid-cols-12 gap-8">

          {/* PIE 1 */}
          <div className="col-span-12 lg:col-span-6">
            <Card title="Intrusion Types">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* PIE 2 (optional second pie later) */}
          <div className="col-span-12 lg:col-span-6">
            <Card title="Zone Risk Share">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[(i + 1) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* PIE 3 CENTER */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-4">
            <Card title="Overall Intrusion Mix">
              <ResponsiveContainer width="100%" height={340}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={130}
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>

        </div>
      </section>

{/* ================= BAR CHART ================= */}
<section>
  <h3 className="mb-6 text-2xl font-extrabold text-foreground">
    Top 10 Camera Risk Zones
  </h3>

  <div className="grid grid-cols-12">
    <div className="col-span-12 lg:col-span-8 lg:col-start-3">

      <Card title="Top 10 Risk Cameras (ZONE IDs)">

        <p className="text-sm text-muted-foreground mb-6">
          Intrusion frequency aggregated by camera deployment zones
        </p>

        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={barData}>

            {/* GRID */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />

            {/* X AXIS → ZONE IDs */}
            <XAxis
              dataKey="zone"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              label={{
                value: "Camera / Zone ID",
                position: "insideBottom",
                offset: -5,
                fill: "hsl(var(--muted-foreground))"
              }}
            />

            {/* Y AXIS → Intrusion Count */}
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              label={{
                value: "Intrusion Count",
                angle: -90,
                position: "insideLeft",
                fill: "hsl(var(--muted-foreground))"
              }}
            />

            {/* TOOLTIP */}
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px"
              }}
            />

            {/* BAR */}
            <Bar
              dataKey="count"
              fill="url(#cyanGradient)"
              radius={[6, 6, 0, 0]}
            />

            {/* GRADIENT */}
            <defs>
              <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.15} />
              </linearGradient>
            </defs>

          </BarChart>
        </ResponsiveContainer>

      </Card>
    </div>
  </div>
</section>


      {/* ================= LINE CHARTS ================= */}
      <section>
        <h3 className="mb-6 text-2xl font-extrabold">
          Intrusion Trends
        </h3>

        <div className="grid grid-cols-12 gap-8">

          {/* LINE 1 */}
          <div className="col-span-12 lg:col-span-6">
            <Card title="Hourly Intrusions">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="intrusions"
                    stroke="#22d3ee"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* LINE 2 */}
          <div className="col-span-12 lg:col-span-6">
            <Card title="Threat Escalation Trend">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="intrusions"
                    stroke="#fb7185"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* LINE 3 CENTER */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-4">
            <Card title="Peak Intrusion Window">
              <ResponsiveContainer width="100%" height={340}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="intrusions"
                    stroke="#fbbf24"
                    strokeWidth={4}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

        </div>
      </section>

    </div>
  )
}

export default AnalyticsDashboard
