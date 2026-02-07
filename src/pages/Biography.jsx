import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import styles from './Biography.module.css'

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import FullscreenIcon from '@mui/icons-material/Fullscreen';


const defaultImage = 'https://placehold.co/800x400/e8dfd0/8b7355?text=Portrait'

const CONTENT_URL = '/data/content.json'
const VALID_IDS = ['lvov', 'palladio', 'quarenghi']

function Biography() {
  const { personId } = useParams()
  const id = VALID_IDS.includes(personId) ? personId : 'lvov'
  const [person, setPerson] = useState(null)
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
        setPerson(persons[id] ?? null)
      })
      .catch(() => setPerson(null))
  }, [id])

  useEffect(() => {
    setCurrentPhotoIndex(0)
  }, [id])

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

  const photos = person.images?.length
    ? person.images
    : (person.image ? [person.image] : [defaultImage])
  const currentPhoto = photos[currentPhotoIndex]

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
  }

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1))
  }

  const handleFullscreen = () => {
    setIsFullscreen(true)
  }

  const handleCloseFullscreen = () => {
    setIsFullscreen(false)
  }

  return (
    <div className={styles.personView}>
      <h1 className={styles.personTitle}>{person.title}</h1>
      <div className={styles.personContainer}>
        <p className={styles.personText}>{person.text}</p>
        <div className={styles.personPhotoWrap}>
          <img src={currentPhoto} alt="" className={styles.personPhoto} />
        </div>
      </div>
      <div className={styles.photoNav}>
        <div className={styles.photoNavBtns}>
          <button
            type="button"
            className={styles.photoNavBtn}
            onClick={handlePrevPhoto}
            aria-label="Предыдущее фото"
          >
            <ArrowBackIosNewIcon fontSize="large" />
          </button>
          <span className={styles.photoNavCounter}>
            {currentPhotoIndex + 1} / {photos.length}
          </span>
          <button
            type="button"
            className={styles.photoNavBtn}
            onClick={handleNextPhoto}
            aria-label="Следующее фото"
          >
            <ArrowForwardIosIcon fontSize="large" />
          </button>
        </div>
        <button
          type="button"
          className={styles.photoNavFull}
          onClick={handleFullscreen}
          aria-label="Полноэкранный просмотр"
        >
          <FullscreenIcon fontSize="large" />
        </button>
      </div>
      {isFullscreen && (
        <div
          className={styles.fullscreenOverlay}
          onClick={handleCloseFullscreen}
          onKeyDown={(e) => {
            if (e.key === 'Escape') handleCloseFullscreen()
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleCloseFullscreen()
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Закрыть (клик или Escape)"
        >
          <img
            src={currentPhoto}
            alt=""
            className={styles.fullscreenImage}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default Biography
