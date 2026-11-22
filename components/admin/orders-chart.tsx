type DailyOrderCount = { label: string; count: number };

export function OrdersChart({ days }: { days: DailyOrderCount[] }) {
  const width = 620;
  const height = 190;
  const top = 18;
  const bottom = 36;
  const chartHeight = height - top - bottom;
  const max = Math.max(1, ...days.map((day) => day.count));
  const points = days.map((day, index) => {
    const x = days.length < 2 ? width / 2 : (index / (days.length - 1)) * width;
    const y = top + chartHeight - (day.count / max) * chartHeight;
    return { ...day, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${points[0]?.x ?? 0},${height - bottom} ${line} ${points.at(-1)?.x ?? width},${height - bottom}`;
  const visibleLabels = new Set([0, 3, 6, 9, 13]);

  return (
    <div className="chart-wrap">
      <svg
        className="chart-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="مخطط عدد الطلبات في آخر 14 يوماً"
      >
        <defs>
          <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#63806e" stopOpacity=".25" />
            <stop offset="100%" stopColor="#63806e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((lineIndex) => {
          const y = top + (chartHeight / 3) * lineIndex;
          return <line key={lineIndex} className="chart-gridline" x1="0" x2={width} y1={y} y2={y} />;
        })}
        <polygon className="chart-area" points={area} />
        <polyline className="chart-line" points={line} />
        {points.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle className="chart-dot" cx={point.x} cy={point.y} r="3.5">
              <title>{`${point.label}: ${point.count} طلب`}</title>
            </circle>
            {visibleLabels.has(index) && (
              <text className="chart-label" x={point.x} y={height - 10} textAnchor="middle">{point.label}</text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
