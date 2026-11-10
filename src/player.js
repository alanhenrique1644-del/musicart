import { useEffect, useRef, useState } from 'react'

const INITIAL_VOLUME = 0.65
const message = 'O trecho está indisponível. Abra a faixa no Apple Music para ouvir.'

export function usePlayer(catalog) {
  const element = useRef(null)
  const current = useRef(catalog[0])
  const [track, setTrack] = useState(catalog[0])
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(INITIAL_VOLUME)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)
  const [issue, setIssue] = useState('')
  const queue = useRef(catalog)

  useEffect(() => { element.current.volume = INITIAL_VOLUME }, [])

  function start() {
    const audio = element.current
    const src = audio.src
    audio.play()?.catch(error => {
      if (error.name !== 'AbortError' && audio.src === src) setIssue(message)
    })
  }

  function load(item, play = true) {
    if (current.current.id !== item.id) {
      current.current = item
      setTrack(item)
      setTime(0)
      setDuration(0)
      setIssue('')
      element.current.src = item.preview
      if (!play) element.current.load()
    }
    if (play) start()
  }

  function toggle() {
    if (element.current.paused) {
      setIssue('')
      start()
    } else element.current.pause()
  }

  function select(item, list) {
    if (list?.length) queue.current = list
    if (item.id === current.current.id) toggle()
    else load(item)
  }

  function step(direction, play = true) {
    const items = queue.current
    const index = items.findIndex(item => item.id === current.current.id)
    if (direction < 0 && element.current.currentTime > 3) {
      element.current.currentTime = 0
      return
    }
    const others = items.filter(item => item.id !== current.current.id)
    const next = shuffle && others.length
      ? others[Math.floor(Math.random() * others.length)]
      : items[(index + direction + items.length) % items.length]
    if (next.id === current.current.id) element.current.currentTime = 0
    load(next, play)
  }

  function seek(value) {
    if (!Number.isFinite(element.current.duration)) return
    element.current.currentTime = value
    setTime(value)
  }

  function changeVolume(value) {
    element.current.volume = value
    setVolume(value)
  }

  const audioProps = {
    ref: element,
    preload: 'none',
    src: catalog[0].preview,
    onPlay: () => setPlaying(true),
    onPause: () => setPlaying(false),
    onTimeUpdate: event => setTime(event.currentTarget.currentTime),
    onLoadedMetadata: event => setDuration(event.currentTarget.duration || 0),
    onEnded: () => {
      setPlaying(false)
      if (repeat) {
        element.current.currentTime = 0
        start()
      } else if (queue.current.length > 1) step(1)
    },
    onError: () => setIssue(message),
  }

  return { track, playing, time, duration, volume, shuffle, repeat, issue, audioProps, select, step, toggle, seek, changeVolume, setShuffle, setRepeat }
}
