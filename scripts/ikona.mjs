// Tworzy public/icon.png (1024×1024) z obrazka public/kot-rycerz.png:
// usuwa białe tło (wypełnienie od krawędzi) i kładzie kotka na różowym tle z kołem jak w PDF.
// Uruchom: node scripts/ikona.mjs && npm run icons
import sharp from 'sharp'

const ZRODLO = 'public/kot-rycerz.png'
const CEL = 'public/icon.png'
const ROZMIAR = 1024
const PROG = 238 // piksel „biały”, jeśli wszystkie kanały >= PROG

const { data, info } = await sharp(ZRODLO).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h } = info
const bialy = (i) => data[i] >= PROG && data[i + 1] >= PROG && data[i + 2] >= PROG

// Wypełnienie od krawędzi: tylko białe piksele połączone z brzegiem stają się przezroczyste.
const tlo = new Uint8Array(w * h)
const stos = []
for (let x = 0; x < w; x++) stos.push(x, (h - 1) * w + x)
for (let y = 0; y < h; y++) stos.push(y * w, y * w + w - 1)
while (stos.length) {
  const p = stos.pop()
  if (tlo[p] || !bialy(p * 4)) continue
  tlo[p] = 1
  const x = p % w
  const y = (p - x) / w
  if (x > 0) stos.push(p - 1)
  if (x < w - 1) stos.push(p + 1)
  if (y > 0) stos.push(p - w)
  if (y < h - 1) stos.push(p + w)
}

// Miękka krawędź: piksele obok tła dostają alfę zależną od „białości”.
for (let p = 0; p < w * h; p++) {
  const i = p * 4
  if (tlo[p]) {
    data[i + 3] = 0
    continue
  }
  const x = p % w
  const obokTla = (x > 0 && tlo[p - 1]) || (x < w - 1 && tlo[p + 1]) || tlo[p - w] || tlo[p + w]
  if (obokTla) {
    const jasnosc = Math.min(data[i], data[i + 1], data[i + 2])
    data[i + 3] = Math.round(255 * Math.min(1, Math.max(0.35, (255 - jasnosc) / (255 - 200))))
  }
}

const wyciety = await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().trim().toBuffer()
const wys = Math.round(ROZMIAR * 0.84)
const kot = await sharp(wyciety).resize({ height: wys, fit: 'inside' }).toBuffer()
const { width: kw } = await sharp(kot).metadata()

const tloSvg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${ROZMIAR}" height="${ROZMIAR}">
  <rect width="100%" height="100%" fill="#F5DFE2"/>
  <circle cx="${ROZMIAR * 0.5}" cy="${ROZMIAR * 0.47}" r="${ROZMIAR * 0.4}" fill="#ECC5CB" fill-opacity="0.75"/>
</svg>`)

await sharp(tloSvg)
  .composite([{ input: kot, left: Math.round((ROZMIAR - kw) / 2), top: Math.round(ROZMIAR * 0.09) }])
  .png()
  .toFile(CEL)
console.log('Zapisano', CEL)
