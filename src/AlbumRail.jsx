import { createContext, useContext } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

export const AlbumRailContext = createContext(null)

export default function AlbumRail() {
  const { tracks, track, playing, select, previous, next } = useContext(AlbumRailContext)
  const index = tracks.findIndex(item => item.id === track.id)

  function at(offset) {
    return tracks[(index + offset + tracks.length) % tracks.length]
  }

  return (
    <div className="album-rail" aria-label="Leque de capas de discos">
      <div className="rail-art">
        {[-3, -2, -1, 3, 2, 1].map(offset => {
          const item = at(offset)
          return (
            <button className="rail-sleeve" key={offset} data-offset={offset} onClick={() => select(item)}
              title={item.album} aria-label={`Ouvir ${item.title}`}>
              <img src={item.cover} alt="" loading="lazy" />
            </button>
          )
        })}
        <div className={`rail-record record ${playing ? 'spinning' : ''}`} aria-hidden="true">
          <div className="record-center"><img src={track.cover} alt="" /><i /></div>
        </div>
        <button className="rail-front" onClick={() => select(track)} aria-label={playing ? 'Pausar trecho' : 'Tocar trecho'}>
          <img src={track.cover} alt={`Capa de ${track.album}`} />
          <span><Play size={26} fill="currentColor" /></span>
        </button>
      </div>
      <div className="rail-nav">
        <button className="icon-button" onClick={previous} aria-label="Faixa anterior"><ChevronLeft size={19} /></button>
        <div className="rail-ticks" aria-hidden="true">{tracks.map(item => <i key={item.id} className={item.id === track.id ? 'selected' : ''} />)}</div>
        <button className="icon-button" onClick={next} aria-label="Próxima faixa"><ChevronRight size={19} /></button>
      </div>
    </div>
  )
}
