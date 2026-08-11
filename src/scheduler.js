// scheduler.js — tiny FastDOM-style measure/mutate batcher (mirrors flickity-mepto)
const qMeasure = []
const qMutate = []
let rafId = 0
const flush = () => {
  rafId = 0
  let fn
  while ((fn = qMeasure.shift())) try { fn() } catch {}
  while ((fn = qMutate.shift())) try { fn() } catch {}
}
const schedule = () => { if (!rafId) rafId = requestAnimationFrame(flush) }
export const measure = fn => { qMeasure.push(fn); schedule() }
export const mutate = fn => { qMutate.push(fn); schedule() }
export const flushSync = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = 0 } flush() }
