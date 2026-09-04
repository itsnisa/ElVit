import { useEffect, useRef, useState } from 'react'
import type { GapResult } from '../../types'

interface GapResultsProps {
  gap: GapResult
}

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let frame = 0
    const total = 40
    const step = target / total
    const timer = setInterval(() => {
      frame++
      setCurrent(Math.min(Math.round(frame * step), target))
      if (frame >= total) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [target])

  return <>{current}{suffix}</>
}

export default function GapResults({ gap }: GapResultsProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const matchScore = Math.round(gap.match_score)
  const gapScore = Math.round(gap.gap_score)
  const maxProb = Math.max(...gap.matched.map((m) => m.prob), 1)

  const jobLabel = gap.target_job
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  useEffect(() => {
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [])

  return (
    <div className="results-section fade-in" ref={sectionRef}>
      <div className="result-header">
        <div>
          <div className="eyebrow" style={{ marginBottom: 10 }}>HASIL ANALISIS KESENJANGAN KOMPETENSI</div>
          <h2>Gap Analysis — {jobLabel}</h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>
            {gap.matched.length} skill matched · {gap.gap.length} skill gap · prediksi model untuk {gap.benchmark_count} skill
          </p>
        </div>
        <div className="match-badge">KESESUAIAN {matchScore}%</div>
      </div>

      {/* Score Overview */}
      <div className="score-overview">
        <div>
          <div className="score-ring-wrap">
            <div className="sr-num">
              <AnimatedNumber target={matchScore} /><span>%</span>
            </div>
            <div className="sr-label">KESESUAIAN DENGAN BENCHMARK INDUSTRI</div>
          </div>
          <div className="score-grid">
            <div className="score-cell match">
              <div className="sc-val">{matchScore}%</div>
              <div className="sc-label">SKILL MATCHED</div>
            </div>
            <div className="score-cell">
              <div className="sc-val">{gapScore}%</div>
              <div className="sc-label">GAP / DELTA</div>
            </div>
          </div>
        </div>

        <div className="radar-wrap" style={{ padding: '16px 24px' }}>
          <div className="radar-legend">
            <div className="lg"><span className="sw sw-industri" />Benchmark Industri</div>
            <div className="lg"><span className="sw sw-kamu" />Skill dari CV</div>
          </div>
          <GapRadarSvg gap={gap} />
        </div>
      </div>
      <div className="radar-caption">
        Perbandingan skill teratas · Hijau = skill CV kamu · Abu = benchmark industri
      </div>

      {/* Matched vs Gap columns */}
      <div className="result-cols">
        <div className="result-col">
          <h4>✓ Skill yang Dimiliki (Matched)</h4>
          {gap.matched.length === 0 ? (
            <div className="skill-result-row" style={{ color: 'var(--muted)', fontSize: 13, justifyContent: 'center' }}>
              Tidak ada skill yang cocok
            </div>
          ) : (
            gap.matched.map((m) => (
              <div className="skill-result-row" key={m.skill}>
                <span>{m.skill}</span>
                <div className="bar-wrap">
                  <div className="bar-fill" style={{ width: `${Math.round((m.prob / maxProb) * 100)}%` }} />
                </div>
                <span className="freq">{Math.round(m.prob * 100)}%</span>
              </div>
            ))
          )}
        </div>
        <div className="result-col">
          <h4>⚠ Skill yang Kurang (Gap)</h4>
          {gap.gap.length === 0 ? (
            <div className="gap-result-row" style={{ color: 'var(--accent)', fontSize: 13, justifyContent: 'center' }}>
              Tidak ada gap ditemukan!
            </div>
          ) : (
            gap.gap.map((g, i) => (
              <div
                className={`gap-result-row${i < 3 ? ' priority-1' : i < 6 ? ' priority-2' : ''}`}
                key={g.skill}
              >
                <span>{g.skill}</span>
                <span className="freq">{Math.round(g.prob * 100)}%</span>
                <span className="priority-badge">P{i + 1}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function GapRadarSvg({ gap }: { gap: GapResult }) {
  const allSkills = [
    ...gap.matched.slice(0, 3).map((m) => m.skill),
    ...gap.gap.slice(0, 3).map((g) => g.skill),
  ].slice(0, 6)

  if (allSkills.length < 3) return <p style={{ color: 'var(--muted)', fontSize: 12 }}>Data tidak cukup.</p>

  const cx = 240, cy = 205, R = 155, n = allSkills.length
  const LABEL_GAP = 26

  const maxBench = Math.max(...gap.matched.map((m) => m.prob), ...gap.gap.map((g) => g.prob), 1)

  function poly(vals: number[], scale: number) {
    return vals.map((v, i) => {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2
      const r = scale * v
      return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`
    }).join(' ')
  }

  const benchVals = allSkills.map((l) => {
    const m = gap.matched.find((x) => x.skill === l)
    const g = gap.gap.find((x) => x.skill === l)
    return ((m || g)?.prob || 0) / maxBench
  })
  const userVals = allSkills.map((l) => {
    const m = gap.matched.find((x) => x.skill === l)
    return m ? (m.prob / maxBench) : 0
  })

  const rings = [0.25, 0.5, 0.75, 1.0]
  const gridPts = rings.map((r) =>
    Array.from({ length: n }, (_, i) => {
      const angle = (Math.PI * 2 * i / n) - Math.PI / 2
      return `${(cx + R * r * Math.cos(angle)).toFixed(1)},${(cy + R * r * Math.sin(angle)).toFixed(1)}`
    }).join(' ')
  )

  const axisLines = allSkills.map((_, i) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2
    return {
      x2: (cx + R * Math.cos(angle)).toFixed(1),
      y2: (cy + R * Math.sin(angle)).toFixed(1),
    }
  })

  function splitLabel(raw: string): string[] {
    const s = raw.trim()
    if (s.length <= 2) return [s.toUpperCase() + ' (lang)']
    if (s.length <= 13) return [s]
    const words = s.split(' ')
    if (words.length > 1) {
      let best = 1, bestDiff = Infinity
      for (let j = 1; j < words.length; j++) {
        const a = words.slice(0, j).join(' ')
        const b = words.slice(j).join(' ')
        const diff = Math.abs(a.length - b.length)
        if (diff < bestDiff) { bestDiff = diff; best = j }
      }
      const a = words.slice(0, best).join(' ')
      const b = words.slice(best).join(' ')
      return [
        a.length > 14 ? a.slice(0, 13) + '…' : a,
        b.length > 14 ? b.slice(0, 13) + '…' : b,
      ]
    }
    return [s.slice(0, 13) + '…']
  }

  const LINE_H = 14 

  const labels = allSkills.map((label, i) => {
    const angle = (Math.PI * 2 * i / n) - Math.PI / 2
    const lx = cx + (R + LABEL_GAP) * Math.cos(angle)
    const ly = cy + (R + LABEL_GAP) * Math.sin(angle)
    const cosA = Math.cos(angle)
    const anchor: 'start' | 'end' | 'middle' =
      cosA > 0.15 ? 'start' : cosA < -0.15 ? 'end' : 'middle'
    const lines = splitLabel(label)
    const blockH = (lines.length - 1) * LINE_H
    const baseY = ly + 4 - blockH / 2
    return { lx: lx.toFixed(1), baseY, anchor, lines }
  })

  return (
    <svg viewBox="0 0 480 430" width="100%" height="auto" style={{ display: 'block', overflow: 'visible' }}>
      {gridPts.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#E2E0D6" strokeWidth="1" />
      ))}
      {axisLines.map((line, i) => (
        <line key={i} x1={cx} y1={cy} x2={line.x2} y2={line.y2} stroke="#E2E0D6" />
      ))}
      <polygon points={poly(benchVals, R)} fill="none" stroke="#17170F" strokeWidth="1.3" strokeOpacity="0.35" />
      <polygon points={poly(userVals, R)} fill="rgba(47,111,78,0.14)" stroke="#2F6F4E" strokeWidth="1.8" />
      <g style={{ fontFamily: 'var(--mono)', fontSize: '11px', fill: 'var(--muted)' }}>
        {labels.map((l, i) => (
          <text key={i} textAnchor={l.anchor}>
            {l.lines.map((line, j) => (
              <tspan key={j} x={l.lx} y={(l.baseY + j * LINE_H).toFixed(1)}>
                {line}
              </tspan>
            ))}
          </text>
        ))}
      </g>
    </svg>
  )
}
