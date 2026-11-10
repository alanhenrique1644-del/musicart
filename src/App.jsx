import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, AudioLines, ChevronDown, ChevronRight,
  Disc3, Headphones, Heart, LibraryBig, ListMusic, ListPlus, Music2, Pause, Pencil, Play,
  Plus, Repeat2, Search, Shuffle, SkipBack, SkipForward, Sparkles, Volume2, VolumeX, X,
} from 'lucide-react'
import BlurText from './components/BlurText/BlurText'
import GridMotion from './components/GridMotion/GridMotion'
import DriftWall from './components/DriftWall/DriftWall'
import CircularCarousel from './components/CircularCarousel/CircularCarousel'
import OptionWheel from './components/OptionWheel/OptionWheel'
import BounceCards from './components/BounceCards/BounceCards'
import AlbumRail, { AlbumRailContext } from './AlbumRail'
import PigmentTrail from './PigmentTrail'
import { usePlayer } from './player'
import catalog from './catalog.json'

const byId = new Map(catalog.map(track => [track.id, track]))
const artists = [...new Map([...catalog].reverse().map(track => [track.artistId, track])).values()].reverse()
const featured = catalog.slice(0, 4)
const gridCovers = Array.from({ length: 28 }, (_, index) => catalog[(index * 5 + Math.floor(index / 7)) % catalog.length].cover)
const genres = ['Todos os gêneros', 'Rock nacional', 'MPB', 'Hip-hop', 'Indie']
const initialLists = [
  { id: 'noite', name: 'Noite em cores', color: 'violet', tracks: ['see-you-again', 'lovers-rock', 'blue-hair'] },
  { id: 'tintas', name: 'Entre tintas', color: 'coral', tracks: ['lanca-perfume', 'trevo', 'so-os-loucos'] },
]

function useStored(key, initial) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial }
    catch { return initial }
  })
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) }
    catch { /* Storage can be blocked in private previews. */ }
  }, [key, value])
  return [value, setValue]
}

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function recordTime(value) {
  const seconds = Math.max(0, Math.floor(value || 0))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="MusicArt, início">
      <span className="brand-mark"><Disc3 size={24} strokeWidth={1.75} /></span>
      <span>Music<span>Art</span></span>
    </a>
  )
}

function IconButton({ label, children, className = '', ...props }) {
  return <button type="button" className={`icon-button ${className}`} aria-label={label} title={label} {...props}>{children}</button>
}

function Modal({ children, title, onClose, className = '' }) {
  const dialog = useRef(null)
  useEffect(() => { dialog.current.showModal() }, [])
  return (
    <dialog className={`modal ${className}`} aria-label={title} ref={dialog} onCancel={event => { event.preventDefault(); onClose() }}
      onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div className="modal-body">
        <div className="modal-heading"><h2>{title}</h2><IconButton label="Fechar" onClick={onClose}><X size={20} /></IconButton></div>
        {children}
      </div>
    </dialog>
  )
}

function TrackCard({ track, playing, onPlay }) {
  return (
    <button type="button" className="track-card" onClick={onPlay} aria-label={`${playing ? 'Pausar' : 'Ouvir'} ${track.title} — ${track.artist}`}>
      <span className="track-cover">
        <img src={track.cover} alt={`Capa de ${track.album}`} loading="lazy" />
        <span className={`card-play ${playing ? 'is-playing' : ''}`}>{playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}</span>
      </span>
      <span className="track-title">{track.title}</span>
      <span className="track-artist">{track.artist}</span>
    </button>
  )
}

function SectionHeading({ number, tag, title, children }) {
  return (
    <div className="section-heading">
      <div><p className="eyebrow"><span>{number}</span> / {tag}</p><h2>{title}</h2></div>
      {children}
    </div>
  )
}

function Hero({ player }) {
  const track = featured[0]
  const playing = player.playing && player.track.id === track.id
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero-grid" aria-hidden="true">
        <GridMotion items={gridCovers} rows={4} angle={-15} aspectRatio={1} gap={9} radius={3} speed={11} fade={0.26} dim={0.43} />
      </div>
      <div className="hero-wash" aria-hidden="true" />
      <div className="hero-grain" aria-hidden="true" />
      <div className="hero-copy">
        <p className="hero-kicker"><span /><span>GALERIA SONORA</span><i /> VOL. 01</p>
        <div className="hero-title" id="hero-title" role="heading" aria-level="1" aria-label="A arte de ouvir.">
          <div aria-hidden="true"><BlurText text="A arte de" delay={90} distance={20} stepDuration={0.28} trigger="mount" /></div>
          <div className="hero-accent" aria-hidden="true"><BlurText text="ouvir." delay={140} distance={20} stepDuration={0.34} trigger="mount" /></div>
        </div>
        <p className="hero-intro">Explore músicas do seu jeito, entre cores, capas e sons que merecem ser descobertos.</p>
        <div className="hero-actions">
          <a className="button button-primary" href="#explorar">Explorar músicas <ArrowUpRight size={17} /></a>
          <a className="hero-player-link" href="#tocando"><Headphones size={16} /> Ir para o player</a>
        </div>
      </div>
      <div className="hero-display">
        <span className="hero-display-index" aria-hidden="true">MA–001</span>
        <div className="hero-back-cover" aria-hidden="true"><img src={featured[3].cover} alt="" /></div>
        <div className={`hero-record record ${playing ? 'spinning' : ''}`} aria-hidden="true">
          <div className="record-center"><img src={track.cover} alt="" /><i /></div>
        </div>
        <button type="button" className="hero-cover" onClick={() => player.select(track, catalog)}
          aria-label={`${playing ? 'Pausar' : 'Ouvir'} ${track.title}`}>
          <img src={track.cover} alt="Capa do álbum Flower Boy" />
          <span className="hero-cover-play">{playing ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}</span>
        </button>
        <div className="hero-stamp" aria-hidden="true"><Sparkles size={17} /><span>SOM EM<br />EXPOSIÇÃO</span></div>
        <div className="hero-art-caption" aria-hidden="true"><span /> FLOWER BOY / TYLER, THE CREATOR</div>
      </div>
      <div className="hero-bottom-note" aria-hidden="true"><span>01</span> / UMA GALERIA PARA OS OUVIDOS</div>
    </section>
  )
}

function Progress({ player, suffix }) {
  const progress = player.duration ? (player.time / player.duration) * 100 : 0
  return (
    <div className="progress">
      <span>{recordTime(player.time)}</span>
      <input type="range" min="0" max={player.duration || 1} step="0.1" value={Math.min(player.time, player.duration)}
        className="range" style={{ '--fill': `${progress}%` }} aria-label={`Posição da faixa ${suffix}`}
        disabled={!player.duration} onChange={event => player.seek(Number(event.target.value))} />
      <span>{recordTime(player.duration)}</span>
    </div>
  )
}

function Transport({ player, secondary = false }) {
  const { playing, shuffle, repeat } = player
  return (
    <div className="transport">
      <IconButton className={shuffle ? 'enabled' : ''} label="Modo aleatório" aria-pressed={shuffle} onClick={() => player.setShuffle(!shuffle)}><Shuffle size={17} /></IconButton>
      <IconButton label="Faixa anterior" onClick={() => player.step(-1)}><SkipBack size={19} fill="currentColor" /></IconButton>
      <IconButton className="transport-play" label={playing ? 'Pausar trecho' : 'Tocar trecho'} onClick={player.toggle}>
        {playing ? <Pause size={secondary ? 16 : 22} fill="currentColor" /> : <Play size={secondary ? 16 : 22} fill="currentColor" />}
      </IconButton>
      <IconButton label="Próxima faixa" onClick={() => player.step(1)}><SkipForward size={19} fill="currentColor" /></IconButton>
      <IconButton className={repeat ? 'enabled' : ''} label="Repetir faixa" aria-pressed={repeat} onClick={() => player.setRepeat(!repeat)}><Repeat2 size={18} /></IconButton>
    </div>
  )
}

function AppleLink({ track }) {
  return <a className="apple-link" href={track.url} target="_blank" rel="noreferrer">Ouvir no Apple Music <ArrowUpRight size={14} /></a>
}

function NowPlaying({ player, favorite, onFavorite, onAdd }) {
  const { track, playing } = player
  return (
    <section className="section now-section" id="tocando">
      <SectionHeading number="05" tag="SALA DE ESCUTA" title="No toca-discos">
        <span className="section-chip"><AudioLines size={15} /> {playing ? 'Em reprodução' : 'Player de trechos'}</span>
      </SectionHeading>
      <div className="listening-room" style={{ '--art-color': track.color }}>
        <AlbumRailContext.Provider value={{ tracks: catalog, track, playing, select: item => player.select(item, catalog), previous: () => player.step(-1), next: () => player.step(1) }}>
          <AlbumRail />
        </AlbumRailContext.Provider>
        <div className="player-info">
          <p className="eyebrow">{track.genre} <span> / </span> {track.year}</p>
          <h3>{track.title}</h3>
          <p>{track.artist}{normalize(track.artist) !== normalize(track.album) && <> <span>·</span> {track.album}</>}</p>
        </div>
        <div className="full-transport"><Progress player={player} suffix="no toca-discos" /><Transport player={player} /></div>
        <div className="player-links">
          <IconButton label={favorite ? 'Remover dos favoritos' : 'Favoritar faixa'} aria-pressed={favorite} onClick={onFavorite}><Heart size={19} fill={favorite ? 'currentColor' : 'none'} /></IconButton>
          <AppleLink track={track} />
          <IconButton label="Adicionar a uma playlist" onClick={onAdd}><ListPlus size={20} /></IconButton>
        </div>
        <p className="preview-credit">Prévia fornecida pelo Apple Music</p>
      </div>
    </section>
  )
}

function MiniPlayer({ player, favorite, onFavorite, onAdd }) {
  const { track, volume, issue } = player
  return (
    <div className="mini-player">
      {issue && <div className="player-error" role="status">{issue} <AppleLink track={track} /></div>}
      <div className="mini-track">
        <a href="#tocando" className="mini-art" aria-label="Abrir toca-discos"><img src={track.cover} alt="" /></a>
        <a href="#tocando" className="mini-title"><strong>{track.title}</strong><span>{track.artist}</span></a>
        <IconButton label={favorite ? 'Remover dos favoritos' : 'Favoritar faixa'} aria-pressed={favorite} onClick={onFavorite}><Heart size={17} fill={favorite ? 'currentColor' : 'none'} /></IconButton>
      </div>
      <div className="mini-controls"><Transport player={player} secondary /><Progress player={player} suffix="no mini player" /></div>
      <div className="mini-actions">
        <IconButton className="mini-add" label="Adicionar a uma playlist" onClick={onAdd}><ListPlus size={19} /></IconButton>
        <IconButton className="volume-button" label={volume ? 'Silenciar' : 'Ativar som'} onClick={() => player.changeVolume(volume ? 0 : 0.65)}>
          {volume ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </IconButton>
        <input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={volume} className="range volume-slider"
          style={{ '--fill': `${volume * 100}%` }} onChange={event => player.changeVolume(Number(event.target.value))} />
      </div>
    </div>
  )
}

function Library({ name, lists, favorites, onSelect, onNew, onProfile, mobileOpen, onClose }) {
  const [expanded, setExpanded] = useState('')
  const rows = [{ id: 'favorites', name: 'Favoritas', color: 'lime', tracks: favorites }, ...lists]
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()

  return (
    <aside className={`library ${mobileOpen ? 'library-open' : ''}`} aria-label="Perfil e playlists pessoais">
      <div className="library-caption"><span><LibraryBig size={17} /> MEU ESPAÇO</span><IconButton className="library-close" label="Fechar biblioteca" onClick={onClose}><X size={18} /></IconButton><span className="library-dot" /></div>
      <div className="profile-card">
        <div className="profile-art" aria-hidden="true"><i /><i /><i /></div>
        <div className="profile-details">
          <button type="button" onClick={onProfile} className="profile-avatar" aria-label="Editar perfil">{initials}</button>
          <div><h2>{name}</h2><p>Perfil local</p></div>
          <IconButton label="Editar nome do perfil" onClick={onProfile}><Pencil size={14} /></IconButton>
        </div>
      </div>
      <div className="library-section">
        <div className="library-title"><div><p className="eyebrow">SUA COLEÇÃO</p><h2>Playlists</h2></div>
          <IconButton label="Nova playlist" className="library-plus" onClick={onNew}><Plus size={20} /></IconButton>
        </div>
        <div className="library-lists">
          {rows.map(row => {
            const tracks = row.tracks.map(id => byId.get(id)).filter(Boolean)
            const isOpen = expanded === row.id
            return (
              <div className={`playlist-item ${isOpen ? 'playlist-open' : ''}`} key={row.id}>
                <button type="button" className="playlist-row" aria-expanded={isOpen} onClick={() => setExpanded(isOpen ? '' : row.id)}>
                  <span className={`playlist-art ${row.color}`}>{row.id === 'favorites' ? <Heart size={18} /> : <ListMusic size={19} />}</span>
                  <span className="playlist-name"><strong>{row.name}</strong><small>{tracks.length} {tracks.length === 1 ? 'faixa' : 'faixas'}</small></span>
                  {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {isOpen && (
                  <div className="playlist-tracks">
                    {tracks.length ? tracks.map(track => (
                      <button type="button" key={track.id} onClick={() => { onSelect(track, tracks); onClose() }}><Play size={13} /><span>{track.title}</span></button>
                    )) : <p>{row.id === 'favorites' ? 'Marque o coração no player para guardar suas faixas.' : 'Adicione músicas pelo botão de playlist no player.'}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button type="button" className="new-playlist" onClick={onNew}><Plus size={16} /> Criar playlist</button>
      </div>
      <div className="library-foot"><Disc3 size={17} /><span>SALVO NESTE DISPOSITIVO</span></div>
    </aside>
  )
}

function SearchDialog({ onClose, onTrack, onArtist }) {
  const [query, setQuery] = useState('')
  const term = normalize(query.trim())
  const matches = value => normalize(value).includes(term)
  const matchedArtists = term ? artists.filter(track => matches(track.artist)) : []
  const matchedTracks = term ? catalog.filter(track => matches(`${track.title} ${track.artist} ${track.album}`)) : featured

  return (
    <Modal title="Buscar na galeria" onClose={onClose} className="search-modal">
      <label className="modal-search"><Search size={19} /><input autoFocus placeholder="Música, artista ou álbum" value={query} onChange={event => setQuery(event.target.value)} aria-label="Música, artista ou álbum" /></label>
      <div className="search-results">
        {matchedArtists.length > 0 && <p className="eyebrow">ARTISTAS</p>}
        {matchedArtists.map(artist => (
          <button type="button" className="search-result" key={artist.artistId} onClick={() => onArtist(artist.artistId)}>
            <img src={artist.cover} alt="" /><span><strong>{artist.artist}</strong><small>Artista · {artist.genre}</small></span><ArrowUpRight size={17} />
          </button>
        ))}
        {matchedTracks.length > 0 && <p className="eyebrow">{term ? 'FAIXAS' : 'EM DESTAQUE'}</p>}
        {matchedTracks.map(track => (
          <button type="button" className="search-result" key={track.id} onClick={() => onTrack(track)}>
            <img src={track.cover} alt="" /><span><strong>{track.title}</strong><small>{track.artist} · {track.album}</small></span><Play size={17} />
          </button>
        ))}
        {!matchedArtists.length && !matchedTracks.length && <p className="empty-copy">Nenhum resultado para “{query.trim()}”.</p>}
      </div>
    </Modal>
  )
}

function ArtistDiscovery({ artistId, setArtist, play }) {
  const wallItems = useMemo(() => artists.map(item => ({
    image: item.cover,
    title: item.artist,
    onSelect: () => setArtist(item.artistId),
  })), [setArtist])
  const artist = artists.find(item => item.artistId === artistId)
  const tracks = artist ? catalog.filter(track => track.artistId === artistId) : []
  const albums = [...new Map(tracks.map(track => [track.album, track])).values()].map(track => ({
    src: track.cover,
    alt: `Capa de ${track.album}`,
    title: track.album,
    subtitle: String(track.year),
    album: track.album,
  }))

  return (
    <section className="section artist-section" id="artistas">
      <SectionHeading number="02" tag="ARTISTAS" title={artist ? artist.artist : 'Quem dá cor ao som'}>
        {artist && <button type="button" className="text-link" onClick={() => setArtist('')}><ArrowLeft size={16} /> Ver todos</button>}
      </SectionHeading>
      <div className="artist-tabs" aria-label="Escolher artista">
        {artists.map(item => <button type="button" key={item.artistId} aria-pressed={artistId === item.artistId} onClick={() => setArtist(item.artistId)}>{item.artist}</button>)}
      </div>
      {artist ? (
        <div className="artist-selected">
          <p className="eyebrow">ÁLBUNS NA GALERIA <span> / </span> {albums.length}</p>
          <div className="artist-carousel" key={artistId}>
            <CircularCarousel items={albums} preset="cylinder" cardWidth={204} gap={32} autoplay="off" captions
              focusOnClick={false} fadeColor="#18131e" onItemClick={item => {
                const albumTracks = tracks.filter(track => track.album === item.album)
                play(albumTracks[0], albumTracks)
              }} />
          </div>
          <div className="artist-tracks">
            {tracks.map(track => (
              <button type="button" key={track.id} onClick={() => play(track, tracks)}>
                <img src={track.cover} alt="" /><span><strong>{track.title}</strong><small>{track.album}</small></span><Play size={16} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="artist-wall">
          <DriftWall items={wallItems} columns={4} tileWidth={164} tileHeight={150} gap={13} tilt={8} turn={-9}
            radius={6} speed={14} dim={0.24} fade={0.3} overlayColor="#18131e" pauseOnHover />
        </div>
      )}
    </section>
  )
}

function GenreDiscovery({ player }) {
  const [genre, setGenre] = useState(genres[0])
  const tracks = genre === genres[0] ? featured : catalog.filter(track => track.genre === genre)
  return (
    <section className="section" id="generos">
      <SectionHeading number="03" tag="GÊNEROS" title="Uma paleta de sons" />
      <div className="genre-panel">
        <div className="genre-picker">
          <p className="eyebrow">GIRE PARA EXPLORAR <ArrowDown size={14} /></p>
          <OptionWheel items={genres} defaultSelected={0} onChange={(_, item) => setGenre(item)} fontSize={1.35}
            spacing={1.38} inset={24} blur={0.65} activeColor="#eafa79" textColor="#c3b5c9" />
        </div>
        <div className="genre-tracks">
          <h3>{genre}</h3>
          {tracks.map(track => (
            <button type="button" className="genre-track" key={track.id} onClick={() => player.select(track, tracks)}>
              <img src={track.cover} alt="" /><span><strong>{track.title}</strong><small>{track.artist}</small></span>
              {player.playing && player.track.id === track.id ? <Pause size={16} /> : <Play size={16} />}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrackDiscovery({ player }) {
  const [stackIndex, setStackIndex] = useState(0)
  const groups = [catalog.slice(0, 4), catalog.slice(4, 8), catalog.slice(8, 12)]
  const stack = groups[stackIndex]
  return (
    <section className="section" id="faixas">
      <SectionHeading number="04" tag="FAIXAS" title="Garimpe uma faixa">
        <div className="stack-nav">
          <IconButton label="Pilha anterior" onClick={() => setStackIndex((stackIndex + groups.length - 1) % groups.length)}><ArrowLeft size={17} /></IconButton>
          <span>0{stackIndex + 1} / 0{groups.length}</span>
          <IconButton label="Próxima pilha" onClick={() => setStackIndex((stackIndex + 1) % groups.length)}><ArrowRight size={17} /></IconButton>
        </div>
      </SectionHeading>
      <div className="stack-panel">
        <div className="stack-art">
          <BounceCards key={stackIndex} images={stack.map(track => ({ src: track.cover, alt: track.title }))}
            containerWidth={350} containerHeight={252} cardSize={155} spread={62} rotation={12} arc={12}
            pushDistance={33} borderWidth={2} borderColor="#f2ebdc" radius={6} animationDelay={0.12}
            onCardClick={(index) => { if (stack[index]) player.select(stack[index], stack) }} />
        </div>
        <div className="stack-info">
          <span className="eyebrow"><Sparkles size={14} /> ESCOLHA UMA CAPA</span>
          {stack.map(track => (
            <button className="stack-track" type="button" key={track.id} onClick={() => player.select(track, stack)}>
              <span><strong>{track.title}</strong><small>{track.artist}</small></span><Play size={14} />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function NameDialog({ kind, name, onSave, onClose }) {
  const profile = kind === 'profile'
  const [value, setValue] = useState(profile ? name : '')
  return (
    <Modal title={profile ? 'Editar perfil' : 'Criar playlist'} onClose={onClose}>
      <form className="name-form" onSubmit={event => { event.preventDefault(); if (value.trim()) onSave(value.trim()) }}>
        <label>{profile ? 'Seu nome' : 'Nome da playlist'}
          <input autoFocus maxLength={36} required value={value} onChange={event => setValue(event.target.value)} placeholder={profile ? 'Seu nome' : 'Ex.: Tarde em lilás'} />
        </label>
        <button type="submit" className="button button-primary" disabled={!value.trim()}>{profile ? 'Salvar nome' : 'Criar playlist'} <ArrowRight size={16} /></button>
      </form>
    </Modal>
  )
}

function App() {
  const player = usePlayer(catalog)
  const [name, setName] = useStored('musicart:profile', 'Alan Freitas')
  const [favorites, setFavorites] = useStored('musicart:favorites', [])
  const [lists, setLists] = useStored('musicart:playlists', initialLists)
  const [artist, setArtist] = useState('')
  const [dialog, setDialog] = useState('')
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [section, setSection] = useState(() => location.hash.slice(1))
  const [toast, setToast] = useState('')
  const favorite = favorites.includes(player.track.id)

  useEffect(() => {
    function handleKey(event) {
      const tag = event.target.tagName
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !['INPUT', 'TEXTAREA'].includes(tag) && !event.target.isContentEditable && !document.querySelector('dialog[open]')) {
        event.preventDefault()
        setDialog('search')
      }
    }
    function readHash() { setSection(location.hash.slice(1)) }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('hashchange', readHash)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('hashchange', readHash)
    }
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  function toggleFavorite() {
    const id = player.track.id
    setFavorites(ids => ids.includes(id) ? ids.filter(item => item !== id) : [...ids, id])
    setToast(favorite ? 'Faixa removida das favoritas.' : 'Faixa guardada nas favoritas.')
  }

  function closeDialog() { setDialog('') }

  function openArtist(id) {
    setArtist(id)
    closeDialog()
    location.hash = 'artistas'
    document.getElementById('artistas')?.scrollIntoView()
  }

  function saveName(value) {
    if (dialog === 'profile') setName(value)
    else {
      const id = globalThis.crypto?.randomUUID?.() || String(Date.now())
      const tracks = dialog === 'new-with-track' ? [player.track.id] : []
      setLists(previous => [...previous, { id, name: value, color: 'violet', tracks }])
      setToast(tracks.length ? 'Playlist criada com esta faixa.' : 'Playlist criada.')
    }
    closeDialog()
  }

  function addTrack(list) {
    const id = player.track.id
    if (list.tracks.includes(id)) return
    setLists(previous => previous.map(item => item.id === list.id ? { ...item, tracks: [...item.tracks, id] } : item))
    setToast(`Faixa adicionada a ${list.name}.`)
    closeDialog()
  }

  return (
    <>
      <PigmentTrail />
      <audio {...player.audioProps} />
      <div className="app-main">
        <header className="topbar">
          <Brand />
          <nav className="primary-nav" aria-label="Navegação principal">
            <a className={!section || section === 'inicio' ? 'current' : ''} href="#inicio">Início</a>
            <a className={['explorar', 'artistas', 'generos', 'faixas'].includes(section) ? 'current' : ''} href="#explorar">Explorar</a>
            <a className={section === 'tocando' ? 'current' : ''} href="#tocando">Tocando</a>
          </nav>
          <button type="button" className="top-search" aria-label="Buscar músicas, artistas ou álbuns" onClick={() => setDialog('search')}>
            <Search size={18} /><span>Buscar na galeria</span><kbd>/</kbd>
          </button>
          <IconButton className="mobile-library-button" label="Abrir biblioteca" onClick={() => setLibraryOpen(true)}><LibraryBig size={20} /></IconButton>
        </header>
        <main className="main-content">
          <Hero player={player} />
          <section className="section featured-section" id="explorar">
            <SectionHeading number="01" tag="CURADORIA" title="Faixas em rotação">
              <a className="text-link" href="#faixas">Ver todas <ArrowUpRight size={16} /></a>
            </SectionHeading>
            <div className="featured-grid">
              {featured.map(track => <TrackCard key={track.id} track={track} playing={player.playing && player.track.id === track.id} onPlay={() => player.select(track, featured)} />)}
            </div>
          </section>
          <ArtistDiscovery artistId={artist} setArtist={setArtist} play={player.select} />
          <GenreDiscovery player={player} />
          <TrackDiscovery player={player} />
          <NowPlaying player={player} favorite={favorite} onFavorite={toggleFavorite} onAdd={() => setDialog('add')} />
          <footer className="site-footer"><span><Disc3 size={17} /> MusicArt</span><span>GALERIA SONORA · VOL. 01</span></footer>
        </main>
      </div>
      {libraryOpen && <button className="library-overlay" type="button" onClick={() => setLibraryOpen(false)} aria-label="Fechar biblioteca" />}
      <Library name={name} lists={lists} favorites={favorites} onSelect={player.select} onNew={() => setDialog('new')}
        onProfile={() => setDialog('profile')} mobileOpen={libraryOpen} onClose={() => setLibraryOpen(false)} />
      <MiniPlayer player={player} favorite={favorite} onFavorite={toggleFavorite} onAdd={() => setDialog('add')} />
      {dialog === 'search' && <SearchDialog onClose={closeDialog} onArtist={openArtist} onTrack={track => { player.select(track, catalog); closeDialog() }} />}
      {['profile', 'new', 'new-with-track'].includes(dialog) && <NameDialog key={dialog} kind={dialog} name={name} onSave={saveName} onClose={closeDialog} />}
      {dialog === 'add' && (
        <Modal title="Adicionar à playlist" onClose={closeDialog}>
          <p className="empty-copy">{player.track.title} · {player.track.artist}</p>
          <div className="add-list">
            {lists.map(list => (
              <button type="button" key={list.id} onClick={() => addTrack(list)} disabled={list.tracks.includes(player.track.id)}>
                <ListMusic size={17} /><span>{list.name}</span><small>{list.tracks.includes(player.track.id) ? 'Já adicionada' : 'Adicionar'}</small>
              </button>
            ))}
            <button type="button" onClick={() => setDialog('new-with-track')}><Plus size={17} /> Criar nova playlist</button>
          </div>
        </Modal>
      )}
      {toast && <div className="toast" role="status"><Music2 size={17} /> {toast}</div>}
    </>
  )
}

export default App
