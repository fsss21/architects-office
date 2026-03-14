import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './Biography.module.css'

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import FullscreenIcon from '@mui/icons-material/Fullscreen'

const defaultImage = 'https://placehold.co/800x400/e8dfd0/8b7355?text=Portrait'
const CONTENT_URL = '/data/content.json'

function Biography() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    fetch(CONTENT_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка загрузки')
        return res.json()
      })
      .then((data) => {
        const persons = data.persons ?? {}
        const id = personId && persons[personId] ? personId : 'lvov'
        setPerson(persons[id] ?? null)
        if (personId && !persons[personId]) navigate(`/biography/lvov`, { replace: true })
      })
      .catch(() => setPerson(null))
  }, [personId, navigate])

  useEffect(() => {
    setCurrentItemIndex(0)
    setCurrentPhotoIndex(0)
  }, [personId])

  useEffect(() => {
    setCurrentPhotoIndex(0)
  }, [currentItemIndex])

  useEffect(() => {
    if (!isFullscreen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isFullscreen])

  if (!person) {
    return <div className={styles.personView}>Загрузка...</div>
  }

  const hasItems = Array.isArray(person.items) && person.items.length > 0
  const items = person.items ?? []
  const currentItem = hasItems ? items[currentItemIndex] : null
  const photos = hasItems && currentItem
    ? (Array.isArray(currentItem.image) ? currentItem.image : (currentItem.image ? [currentItem.image] : [defaultImage]))
    : (person.image ? (Array.isArray(person.image) ? person.image : [person.image]) : [defaultImage])
  const currentPhoto = hasItems && currentItem
    ? (Array.isArray(currentItem.image) ? currentItem.image[currentPhotoIndex] : currentItem.image)
    : photos[currentPhotoIndex]

  const navCount = hasItems ? items.length : photos.length
  const navIndex = hasItems ? currentItemIndex : currentPhotoIndex
  const handlePrev = hasItems
    ? () => setCurrentItemIndex((i) => (i === 0 ? items.length - 1 : i - 1))
    : () => setCurrentPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
  const handleNext = hasItems
    ? () => setCurrentItemIndex((i) => (i === items.length - 1 ? 0 : i + 1))
    : () => setCurrentPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1))

  const title = person.title || person.name
  const displayText = hasItems && currentItem ? currentItem.text : (person.keyInfo || person.text || '')

  return (
    <div className={styles.personView}>
      <div className={styles.personTitleBlock}>
        <h1 className={styles.personTitle}>{title}</h1>
        {person.years && <p className={styles.personYears}>{person.years}</p>}
      </div>
      <div className={styles.personContainer}>
        <div className={styles.personTextBlock}>
          {displayText && <p className={styles.personText}>{displayText}</p>}
          {person.mainWorks && !hasItems && (
            <p className={styles.personMainWorks}><strong>Главные произведения:</strong> {person.mainWorks}</p>
          )}
        </div>
        <div className={styles.personPhotoWrap}>
          <img src={currentPhoto} alt="" className={styles.personPhoto} />
        </div>
      </div>

      <div className={styles.photoNav}>
        <div className={styles.photoNavBtns}>
          <button type="button" className={styles.photoNavBtn} onClick={handlePrev} aria-label={hasItems ? 'Предыдущий пункт' : 'Предыдущее фото'}>
            <ArrowBackIosNewIcon fontSize="large" />
          </button>
          <span className={styles.photoNavCounter}>{navIndex + 1} / {navCount}</span>
          <button type="button" className={styles.photoNavBtn} onClick={handleNext} aria-label={hasItems ? 'Следующий пункт' : 'Следующее фото'}>
            <ArrowForwardIosIcon fontSize="large" />
          </button>
        </div>
        <button type="button" className={styles.photoNavFull} onClick={() => setIsFullscreen(true)} aria-label="Полноэкранный просмотр">
          <FullscreenIcon fontSize="large" />
        </button>
      </div>
      {isFullscreen && (
        <div
          className={styles.fullscreenOverlay}
          onClick={() => setIsFullscreen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsFullscreen(false)
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsFullscreen(false) }
          }}
          role="button"
          tabIndex={0}
          aria-label="Закрыть"
        >
          <img src={currentPhoto} alt="" className={styles.fullscreenImage} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

export default Biography
