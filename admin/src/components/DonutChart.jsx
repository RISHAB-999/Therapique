import React, { useState, useMemo } from 'react'

/**
 * Generates an SVG Annular Sector Path (Donut Slice)
 *
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} rIn - Inner radius
 * @param {number} rOut - Outer radius
 * @param {number} startAngleDeg - Start angle in degrees (0 = 12 o'clock, clockwise)
 * @param {number} endAngleDeg - End angle in degrees
 * @returns {string} SVG path data string
 */
const getAnnularSectorPath = (cx, cy, rIn, rOut, startAngleDeg, endAngleDeg) => {
  const delta = endAngleDeg - startAngleDeg
  if (delta <= 0.01) return ''

  // Complete 360 degree ring
  if (delta >= 359.9) {
    return `M ${cx} ${cy - rOut} A ${rOut} ${rOut} 0 1 1 ${cx} ${cy + rOut} A ${rOut} ${rOut} 0 1 1 ${cx} ${cy - rOut} M ${cx} ${cy - rIn} A ${rIn} ${rIn} 0 1 0 ${cx} ${cy + rIn} A ${rIn} ${rIn} 0 1 0 ${cx} ${cy - rIn} Z`
  }

  const toRad = (deg) => (deg - 90) * (Math.PI / 180)
  const a1 = toRad(startAngleDeg)
  const a2 = toRad(endAngleDeg)
  const largeArcFlag = delta > 180 ? 1 : 0

  const x1Out = Number((cx + rOut * Math.cos(a1)).toFixed(2))
  const y1Out = Number((cy + rOut * Math.sin(a1)).toFixed(2))
  const x2Out = Number((cx + rOut * Math.cos(a2)).toFixed(2))
  const y2Out = Number((cy + rOut * Math.sin(a2)).toFixed(2))

  const x2In = Number((cx + rIn * Math.cos(a2)).toFixed(2))
  const y2In = Number((cy + rIn * Math.sin(a2)).toFixed(2))
  const x1In = Number((cx + rIn * Math.cos(a1)).toFixed(2))
  const y1In = Number((cy + rIn * Math.sin(a1)).toFixed(2))

  return `M ${x1Out} ${y1Out} A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2Out} ${y2Out} L ${x2In} ${y2In} A ${rIn} ${rIn} 0 ${largeArcFlag} 0 ${x1In} ${y1In} Z`
}

/**
 * Modern Animated Gradient Donut Chart with Exact Annular Sector Hit Testing
 */
const DonutChart = ({
  title,
  subtitle,
  total = 0,
  totalLabel = 'Total',
  data = [],
  idPrefix = 'donut',
  layout = 'horizontal',
  className = '',
}) => {
  const [activeSegment, setActiveSegment] = useState(null)

  // Calculate actual total from data or prop
  const computedTotal = useMemo(() => {
    const sum = data.reduce((acc, item) => acc + (Number(item.value) || 0), 0)
    return sum > 0 ? sum : Number(total) || 0
  }, [data, total])

  // Active hover data for center display & tooltip
  const activeItem = activeSegment !== null ? data[activeSegment] : null
  const targetCount = activeItem ? activeItem.value : computedTotal

  // Derive concise center label that never overflows the inner circle
  const centerLabel = activeItem
    ? (activeItem.shortLabel || activeItem.label.split(' / ')[0].replace(/ Sessions| Bookings/i, ''))
    : totalLabel

  // Geometry: spacious inner hole with generous safe area
  const size = 210
  const center = size / 2
  const baseRIn = 67
  const baseROut = 87
  const activeRIn = 64
  const activeROut = 90

  // Count items with values > 0
  const nonZeroCount = data.filter((d) => Number(d.value) > 0).length
  const gapAngle = nonZeroCount > 1 ? 2.5 : 0 // degrees gap between segments
  const totalGapAngle = nonZeroCount > 1 ? nonZeroCount * gapAngle : 0
  const availableAngle = 360 - totalGapAngle

  // Compute segment arcs & exact start/end angles
  let currentAngle = 0 // 0 = 12 o'clock

  const segments = data.map((item, index) => {
    const val = Number(item.value) || 0
    const percentage = computedTotal > 0 ? (val / computedTotal) * 100 : 0
    const segmentAngle = computedTotal > 0 ? (val / computedTotal) * availableAngle : 0
    const startAngle = currentAngle
    const endAngle = startAngle + segmentAngle

    const seg = {
      ...item,
      index,
      value: val,
      percentage: percentage.toFixed(1),
      startAngle,
      endAngle,
      gradientId: `${idPrefix}-grad-${index}`,
    }

    if (val > 0) {
      currentAngle = endAngle + gapAngle
    }

    return seg
  })

  const isVertical = layout === 'vertical'

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow duration-300 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-sm text-gray-800 tracking-tight uppercase flex items-center gap-2">
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
          Live Analytics
        </span>
      </div>

      {/* Chart & Stats Body */}
      <div
        className={`flex items-center justify-center gap-6 py-5 ${
          isVertical ? 'flex-col' : 'flex-col sm:flex-row'
        }`}
      >
        {/* SVG Donut Visual */}
        <div className="relative w-48 h-48 shrink-0 flex items-center justify-center select-none">
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full transform transition-transform duration-300 overflow-visible"
          >
            <defs>
              {segments.map((seg) => (
                <linearGradient
                  key={seg.gradientId}
                  id={seg.gradientId}
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={seg.gradient?.[0] || seg.color || '#8B5CF6'} />
                  <stop offset="100%" stopColor={seg.gradient?.[1] || seg.color || '#6D28D9'} />
                </linearGradient>
              ))}
              {/* Drop Shadow Filter for Active Hover Slice */}
              <filter id={`${idPrefix}-hover-shadow`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Subtle Translucent Background Track Circle */}
            <circle
              cx={center}
              cy={center}
              r={(baseRIn + baseROut) / 2}
              fill="none"
              stroke="rgba(140, 149, 159, 0.15)"
              strokeWidth={baseROut - baseRIn}
            />

            {/* Full True Annular Sector Paths - Rendered Immediately Without Truncation */}
            {computedTotal > 0 &&
              segments.map((seg) => {
                if (seg.value <= 0) return null
                const isActive = activeSegment === seg.index

                const pathData = getAnnularSectorPath(
                  center,
                  center,
                  isActive ? activeRIn : baseRIn,
                  isActive ? activeROut : baseROut,
                  seg.startAngle,
                  seg.endAngle
                )

                return (
                  <path
                    key={seg.label}
                    d={pathData}
                    fill={`url(#${seg.gradientId})`}
                    filter={isActive ? `url(#${idPrefix}-hover-shadow)` : undefined}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      opacity: activeSegment !== null && !isActive ? 0.35 : 1,
                      transformOrigin: `${center}px ${center}px`,
                      pointerEvents: 'painted',
                    }}
                    onMouseEnter={() => setActiveSegment(seg.index)}
                    onMouseOver={() => setActiveSegment(seg.index)}
                    onMouseLeave={() => setActiveSegment(null)}
                  />
                )
              })}
          </svg>

          {/* Central Donut Text / Number - Strictly Inscribed Inside Hole */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <div className="w-[96px] h-[96px] flex flex-col items-center justify-center text-center p-1 overflow-hidden">
              <span
                className="text-2xl font-black tracking-tight leading-none transition-colors duration-200 text-gray-900"
                style={{
                  color: activeItem ? activeItem.color : undefined,
                }}
              >
                {targetCount}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight truncate max-w-[86px] mt-1 leading-tight">
                {centerLabel}
              </span>
              {activeItem && (
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full mt-1 leading-none shadow-2xs"
                  style={{
                    color: activeItem.color,
                    backgroundColor: `${activeItem.color}1c`,
                  }}
                >
                  {activeItem.percentage}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Breakdown Legend */}
        <div
          className={`w-full space-y-2.5 ${
            isVertical ? 'pt-4 border-t border-slate-100' : 'flex-1 sm:max-w-[280px]'
          }`}
        >
          {segments.map((item) => {
            const isHovered = activeSegment === item.index
            return (
              <div
                key={item.label}
                onMouseEnter={() => setActiveSegment(item.index)}
                onMouseOver={() => setActiveSegment(item.index)}
                onMouseLeave={() => setActiveSegment(null)}
                className={`flex items-center justify-between p-2.5 px-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'bg-purple-50/70 border-purple-200 shadow-2xs scale-[1.02]'
                    : 'bg-slate-50/60 border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Left: Color dot & Label */}
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span
                    className="w-3 h-3 rounded-md shrink-0 shadow-2xs"
                    style={{
                      background: `linear-gradient(135deg, ${item.gradient?.[0] || item.color}, ${
                        item.gradient?.[1] || item.color
                      })`,
                    }}
                  />
                  <span
                    className={`text-xs truncate transition-colors ${
                      isHovered ? 'font-black text-purple-950' : 'font-bold text-gray-700'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Right: Value Badge & Percentage */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-black text-gray-900 bg-white px-2 py-0.5 rounded-md border border-slate-200/80 shadow-2xs">
                    {item.value}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400 min-w-[36px] text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Subtle Footer Caption */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-gray-400 font-medium">
        <span>Updated in real-time</span>
        <span className="text-purple-600 font-bold hover:underline cursor-pointer">
          {computedTotal} Total recorded
        </span>
      </div>
    </div>
  )
}

export default DonutChart
