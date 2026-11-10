import { readFile, writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'

const dist = resolve('dist')
const output = resolve(process.argv[2] || 'previa.html')
const html = await readFile(resolve(dist, 'index.html'), 'utf8')

const cssPattern = /<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g
const scriptPattern = /<script\b[^>]*type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g

async function replaceAsync(source, pattern, replacement) {
  const matches = [...source.matchAll(pattern)]
  const replacements = await Promise.all(matches.map(match => replacement(...match)))
  let index = 0
  return source.replace(pattern, () => replacements[index++])
}

async function dataUri(path, type) {
  return `data:${type};base64,${(await readFile(path)).toString('base64')}`
}

const styled = await replaceAsync(html, cssPattern, async (_, path) => {
  const cssPath = resolve(dist, path)
  const css = await readFile(cssPath, 'utf8')
  const inlined = await replaceAsync(css, /url\((\.[^()]+\.woff2)\)/g, async (_, font) => {
    return `url(${await dataUri(resolve(dirname(cssPath), font), 'font/woff2')})`
  })
  return `<style>\n${inlined}\n</style>`
})

const preview = await replaceAsync(styled, scriptPattern, async (_, path) => {
  const script = await readFile(resolve(dist, path), 'utf8')
  const inlined = await replaceAsync(script, /"(?<path>\.\/media\/[\w-]+\.jpg)"/g, async (_, artwork) => {
    return JSON.stringify(await dataUri(resolve(dist, artwork), 'image/jpeg'))
  })
  return `<script type="module">\n${inlined.replace(/<\/script/gi, '<\\/script')}\n</script>`
})

const notices = await Promise.all(['React-Bits.md', 'DM-Sans.txt', 'Space-Grotesk.txt'].map(name => (
  readFile(resolve('licenses', name), 'utf8')
)))
const noticeBlock = '<script type="text/plain" id="third-party-notices">\n' + notices.join('\n\n') + '\n</script>\n'
await writeFile(output, preview.replace('</body>', () => noticeBlock + '</body>'))
console.log(`Prévia salva em ${output}`)
