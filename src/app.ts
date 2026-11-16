// 3D Tracking — a standalone rebuild of the UI8 Forge tracking-overlay fragment.
//
// The drawing (src/tracking.ts) is the original canvas code, unchanged in spirit.
// This file is the harness: the canvases, the orbit camera, the clock, the panel
// and the URL state.

import { draw } from './tracking.ts'
import { STORY, PUBLISHED } from './story.ts'

const host = document.getElementById('stage') as HTMLDivElement
const canvas = document.getElementById('view') as HTMLCanvasElement
const glow = document.getElementById('glow') as HTMLCanvasElement
const halo = document.getElementById('halo') as HTMLCanvasElement
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

const REDUCED = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

const VIEW = { yaw: -0.42, pitch: 0.24, zoom: 1 }
const DEFAULTS: Record<string, unknown> = {
  polarity: 'dark',
  tracks: 22, churn: 0.5, fps: 25,
  labels: true, ascii: true, follow: true,
  depth: 1, autoRotate: 0.06, stage: true, gridOpacity: 0.08,
  bloom: 0.6, bloomRadius: 10,
  connectors: true, bend: 1, bendSpread: 1, linkWeight: 1, linkOpacity: 0.4, arrows: true,
  asciiColor: '#ffffff', accent: '#ffffff',
}
const INITIAL: Record<string, unknown> = { ...DEFAULTS, ...PUBLISHED }
const params: Record<string, unknown> = { ...INITIAL }

const PALETTES: Record<string, { void: string; ink: string; signal: string; bg: string }> = {
  dark: { void: '#000000', ink: '#ffffff', signal: '#ff2416', bg: '#000000' },
  light: { void: '#f4f3ee', ink: '#0d0d10', signal: '#ff2416', bg: '#f4f3ee' },
}

let orbit = { ...VIEW }
let pointer: { x: number; y: number } | null = null
let size = { w: 0, h: 0, dpr: 1 }
// The original runs at a fixed `fps` and, under reduced motion, holds one frame.
let t = REDUCED ? 2.4 : 0
let last = performance.now()
let raf = 0

// ── shareable state ──────────────────────────────────────────────────────
const b64encode = (s: string) =>
  btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const b64decode = (s: string) =>
  decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))))

function snapshot() {
  const d: Record<string, unknown> = {}
  for (const k of Object.keys(params)) {
    if (JSON.stringify(params[k]) !== JSON.stringify(INITIAL[k])) d[k] = params[k]
  }
  return d
}
let hashTimer = 0
function saveHash() {
  const d = snapshot()
  window.clearTimeout(hashTimer)
  hashTimer = window.setTimeout(() => {
    const h = Object.keys(d).length ? '#p=' + b64encode(JSON.stringify(d)) : ''
    history.replaceState(null, '', location.pathname + location.search + h)
  }, 250)
}
function loadHash() {
  const m = location.hash.match(/#p=([A-Za-z0-9_-]+)/)
  if (!m) return
  try {
    const d = JSON.parse(b64decode(m[1]))
    for (const k of Object.keys(d)) if (k in DEFAULTS) params[k] = d[k]
  } catch { /* ignore a mangled hash */ }
}
loadHash()

// ── sizing ────────────────────────────────────────────────────────────────
function resize() {
  const r = host.getBoundingClientRect()
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  size = { w: r.width, h: r.height, dpr }
  canvas.width = Math.round(r.width * dpr)
  canvas.height = Math.round(r.height * dpr)
  canvas.style.width = r.width + 'px'
  canvas.style.height = r.height + 'px'
  drawFrame(t)
}
new ResizeObserver(resize).observe(host)

// ── the clock ─────────────────────────────────────────────────────────────
function drawFrame(now: number) {
  const p = PALETTES[String(params.polarity)] || PALETTES.dark
  const fps = Math.max(1, Number(params.fps))
  const snapped = Math.floor(now * fps) / fps
  const cam = {
    yaw: orbit.yaw + snapped * Number(params.autoRotate),
    pitch: orbit.pitch,
    zoom: orbit.zoom,
  }
  const o = {
    tracks: Math.max(0, Math.min(40, Math.round(Number(params.tracks)))),
    churn: Math.max(0, Math.min(1, Number(params.churn))),
    connectors: Boolean(params.connectors),
    curve: {
      bend: Math.max(0, Number(params.bend)),
      spread: Math.max(0, Math.min(1, Number(params.bendSpread))),
      weight: Math.max(0.25, Number(params.linkWeight)),
      opacity: Math.max(0, Math.min(1, Number(params.linkOpacity))),
      arrows: Boolean(params.arrows),
    },
    labels: Boolean(params.labels),
    ascii: Boolean(params.ascii),
    depth: Math.max(0, Number(params.depth)),
    stage: Boolean(params.stage),
    gridOpacity: Math.max(0, Math.min(1, Number(params.gridOpacity))),
    pointer: params.follow ? pointer : null,
    ink: String(params.polarity === 'light' ? p.ink : params.accent === '#ffffff' ? p.ink : params.accent),
    asciiInk: String(params.asciiColor || p.ink),
    void: p.void,
    signal: p.signal,
    dim: `rgba(${params.polarity === 'light' ? '13,13,16' : '255,255,255'},0.4)`,
    font: '400 11px Archivo, system-ui, sans-serif',
    mono: 'ui-monospace, Menlo, Consolas, monospace',
  }
  ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0)
  draw(ctx, size.w, size.h, size.dpr, snapped, Math.floor(now * fps), cam, o)

  // bloom: two half-resolution copies, blurred by CSS and screened over the frame
  for (const b of [glow, halo]) {
    if (Number(params.bloom) <= 0) { b.width = 1; b.height = 1; continue }
    const bw = Math.max(1, Math.round(size.w / 2))
    const bh = Math.max(1, Math.round(size.h / 2))
    if (b.width !== bw || b.height !== bh) { b.width = bw; b.height = bh }
    const bc = b.getContext('2d')!
    bc.clearRect(0, 0, bw, bh)
    bc.drawImage(canvas, 0, 0, bw, bh)
  }
}

function loop(now: number) {
  raf = requestAnimationFrame(loop)
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
  last = now
  if (!REDUCED) t += dt
  drawFrame(t)
}

// ── orbit ─────────────────────────────────────────────────────────────────
function onDown(e: PointerEvent) {
  if (e.button !== 0) return
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  ;(e.currentTarget as HTMLElement).style.cursor = 'grabbing'
  pointer = null
  host.dataset.drag = '1'
  host.dataset.sx = String(e.clientX)
  host.dataset.sy = String(e.clientY)
}
function onMove(e: PointerEvent) {
  const r = host.getBoundingClientRect()
  if (host.dataset.drag === '1') {
    const startX = Number(host.dataset.sx)
    const startY = Number(host.dataset.sy)
    orbit.yaw -= (e.clientX - startX) * 0.006
    orbit.pitch = Math.max(-1.35, Math.min(1.35, orbit.pitch + (e.clientY - startY) * 0.006))
    host.dataset.sx = String(e.clientX)
    host.dataset.sy = String(e.clientY)
    return
  }
  pointer = { x: e.clientX - r.left, y: e.clientY - r.top }
}
function onUp(e: PointerEvent) {
  host.dataset.drag = ''
  host.style.cursor = 'grab'
  try { host.releasePointerCapture(e.pointerId) } catch { /* already released */ }
}
function onLeave() { pointer = null }
function onWheel(e: WheelEvent) {
  e.preventDefault()
  orbit.zoom = Math.max(0.45, Math.min(2.5, orbit.zoom * Math.exp(e.deltaY * 0.001)))
}
function resetOrbit() { orbit = { ...VIEW } }

// ── panel ─────────────────────────────────────────────────────────────────
const widgets: { row: HTMLElement; show: () => boolean }[] = []

function refreshVisibility() {
  for (const w of widgets) w.row.style.display = w.show() ? '' : 'none'
}
function apply(next: Record<string, unknown>) {
  Object.assign(params, next)
  paintBody()
  drawFrame(t)
  saveHash()
  refreshVisibility()
}
function paintBody() {
  const p = PALETTES[String(params.polarity)] || PALETTES.dark
  document.body.style.background = p.bg
  document.body.classList.toggle('light', params.polarity === 'light')
}

function buildPanel() {
  const body = document.getElementById('panel-body') as HTMLDivElement
  body.innerHTML = ''
  widgets.length = 0
  STORY.forEach((section) => {
    if (section.title) {
      const h = document.createElement('h3')
      h.textContent = section.title
      body.appendChild(h)
    }
    section.controls.forEach((c) => body.appendChild(buildControl(c)))
  })
  refreshVisibility()
}

function buildControl(c: any): HTMLElement {
  const row = document.createElement('div')
  row.className = 'row'
  if (c.label) {
    const label = document.createElement('label')
    label.className = 'label'
    label.htmlFor = `c-${c.prop}`
    label.textContent = c.label
    row.appendChild(label)
  }
  const show = () => !c.visibleWhen || params[c.visibleWhen.prop] === c.visibleWhen.equals
  widgets.push({ row, show })
  const current = params[c.prop]

  if (c.control === 'switch') {
    const input = document.createElement('input')
    input.type = 'checkbox'; input.id = `c-${c.prop}`; input.checked = Boolean(current)
    input.addEventListener('change', () => apply({ [c.prop]: input.checked }))
    row.appendChild(input)
  } else if (c.control === 'slider') {
    const val = document.createElement('span'); val.className = 'val'
    const input = document.createElement('input')
    input.type = 'range'; input.id = `c-${c.prop}`
    input.min = String(c.min); input.max = String(c.max); input.step = String(c.step)
    input.value = String(current)
    val.textContent = String(current)
    input.addEventListener('input', () => { val.textContent = input.value; apply({ [c.prop]: Number(input.value) }) })
    row.appendChild(input); row.appendChild(val)
  } else if (c.control === 'segmented') {
    const group = document.createElement('div'); group.className = 'seg'
    c.options.forEach((opt: string) => {
      const b = document.createElement('button')
      b.type = 'button'; b.textContent = opt
      b.className = opt === current ? 'on' : ''
      b.addEventListener('click', () => {
        group.querySelectorAll('button').forEach((x) => x.classList.remove('on'))
        b.classList.add('on')
        apply({ [c.prop]: opt })
      })
      group.appendChild(b)
    })
    row.appendChild(group)
  } else if (c.control === 'color') {
    const input = document.createElement('input')
    input.type = 'color'; input.id = `c-${c.prop}`; input.value = String(current)
    input.addEventListener('input', () => apply({ [c.prop]: input.value }))
    row.appendChild(input)
  }
  return row
}

// ── top bar ───────────────────────────────────────────────────────────────
function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen?.()
  else document.documentElement.requestFullscreen?.()
}
function paintFullscreen() {
  const b = document.getElementById('fs') as HTMLButtonElement
  if (b) b.textContent = document.fullscreenElement ? 'Exit' : 'Full'
}
function resetLook() {
  Object.assign(params, INITIAL)
  orbit = { ...VIEW }
  t = REDUCED ? 2.4 : 0
  buildPanel(); paintBody(); drawFrame(t); saveHash()
}

window.addEventListener('keydown', (e) => {
  const el = e.target as HTMLElement | null
  if (el && (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(el.tagName) || el.isContentEditable)) return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (e.code === 'KeyF') { e.preventDefault(); toggleFullscreen() }
  else if (e.code === 'KeyR') { e.preventDefault(); resetLook() }
  else if (e.code === 'KeyH') { e.preventDefault(); document.body.classList.toggle('panel-open') }
})

function start() {
  buildPanel()
  paintBody()
  resize()

  host.addEventListener('pointerdown', onDown)
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerup', onUp)
  host.addEventListener('pointercancel', onUp)
  host.addEventListener('pointerleave', onLeave)
  host.addEventListener('wheel', onWheel, { passive: false })
  host.addEventListener('dblclick', resetOrbit)

  const toggle = document.getElementById('panel-toggle') as HTMLButtonElement
  toggle.addEventListener('click', () => document.body.classList.toggle('panel-open'))
  const close = document.getElementById('panel-close') as HTMLButtonElement
  close.addEventListener('click', () => document.body.classList.remove('panel-open'))
  const resetBtn = document.getElementById('reset') as HTMLButtonElement
  resetBtn.addEventListener('click', resetLook)
  const fs = document.getElementById('fs') as HTMLButtonElement
  fs.addEventListener('click', toggleFullscreen)
  document.addEventListener('fullscreenchange', paintFullscreen)
  paintFullscreen()

  if (!REDUCED) raf = requestAnimationFrame(loop)
  else { drawFrame(t); document.getElementById('boot')?.classList.add('gone') }

  if (!REDUCED) {
    const boot = () => document.getElementById('boot')?.classList.add('gone')
    requestAnimationFrame(() => requestAnimationFrame(boot))
  }
}

start()

;(window as any).__track = {
  get t() { return t },
  get size() { return size },
  get params() { return params },
  stats() {
    const c = canvas
    const d = c.getContext('2d')!.getImageData(0, 0, Math.min(c.width, 80), Math.min(c.height, 80)).data
    const seen = new Set<number>()
    for (let i = 0; i < d.length; i += 4) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])
    return { w: c.width, h: c.height, unique: seen.size }
  },
}
