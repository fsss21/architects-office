import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './Biography.module.css'

import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import FullscreenIcon from '@mui/icons-material/Fullscreen'

const defaultImage = 'https://placehold.co/800x400/e8dfd0/8b7355?text=Portrait'
const CONTENT_URL = '/data/content.json'

function getItemImages(item) {
  if (!item) return [defaultImage]
  if (Array.isArray(item.images) && item.images.length > 0) return item.images
  if (Array.isArray(item.image) && item.image.length > 0) return item.image
  if (item.image) return [item.image]
  return [defaultImage]
}

function isWorkItem(item) {
  return Boolean(item?.id && item?.label)
}

const WORKS_PER_ROW = 3

function chunkWorks(items, size = WORKS_PER_ROW) {
  const rows = []
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size))
  }
  return rows
}

function Biography() {
  const { personId } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState(null)
  const [currentItemIndex, setCurrentItemIndex] = useState(0)
  const [selectedWorkId, setSelectedWorkId] = useState(null)
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

  const items = person?.items ?? []
  const hasItems = items.length > 0
  const isWorksMode = hasItems && items.every(isWorkItem)
  const workItems = isWorksMode ? items : []

  useEffect(() => {
    setCurrentItemIndex(0)
    setCurrentPhotoIndex(0)
    if (person?.items?.length && person.items.every(isWorkItem)) {
      setSelectedWorkId(person.items[0].id)
    } else {
      setSelectedWorkId(null)
    }
  }, [personId, person])

  useEffect(() => {
    setCurrentPhotoIndex(0)
  }, [currentItemIndex, selectedWorkId])

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

  const title = person.title || person.name
  const currentWork = isWorksMode
    ? workItems.find((item) => item.id === selectedWorkId) ?? workItems[0]
    : null

  const currentSlideItem = !isWorksMode && hasItems ? items[currentItemIndex] : null

  const photos = isWorksMode
    ? getItemImages(currentWork)
    : hasItems
      ? getItemImages(currentSlideItem)
      : getItemImages(person)

  const currentPhoto = photos[currentPhotoIndex] ?? defaultImage
  const navCount = photos.length
  const navIndex = currentPhotoIndex

  const handlePhotoPrev = () => {
    setCurrentPhotoIndex((i) => (i === 0 ? photos.length - 1 : i - 1))
  }

  const handlePhotoNext = () => {
    setCurrentPhotoIndex((i) => (i === photos.length - 1 ? 0 : i + 1))
  }

  const handleSlidePrev = () => {
    setCurrentItemIndex((i) => (i === 0 ? items.length - 1 : i - 1))
  }

  const handleSlideNext = () => {
    setCurrentItemIndex((i) => (i === items.length - 1 ? 0 : i + 1))
  }

  const handleWorkSelect = (workId) => {
    setSelectedWorkId(workId)
  }

  const displayText = isWorksMode
    ? (person.keyInfo || person.text || '')
    : hasItems && currentSlideItem
      ? currentSlideItem.text
      : (person.keyInfo || person.text || '')

  const slideNavCount = hasItems ? items.length : photos.length
  const slideNavIndex = hasItems ? currentItemIndex : currentPhotoIndex
  const canNavigatePhotos = navCount > 1
  const canNavigateSlides = slideNavCount > 1

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
            <p className={styles.personMainWorks}>
              <strong>Главные произведения:</strong> {person.mainWorks}
            </p>
          )}
        </div>

        {isWorksMode && (
          <div className={styles.mainWorksSection}>
            <h2 className={styles.mainWorksTitle}>Главные произведения</h2>
            <div className={styles.workButtons}>
              {chunkWorks(workItems).map((row, rowIndex) => (
                <div key={rowIndex} className={styles.workButtonsRow}>
                  {row.map((work) => (
                    <button
                      key={work.id}
                      type="button"
                      className={`${styles.workBtn} ${selectedWorkId === work.id ? styles.workBtnActive : ''}`}
                      onClick={() => handleWorkSelect(work.id)}
                    >
                      {work.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={isWorksMode ? styles.scrollWrap : styles.personPhotoWrap}>
          {isWorksMode && (
            <h3 className={styles.scrollTitle}>{currentWork?.title ?? ''}</h3>
          )}
          <div className={isWorksMode ? styles.scrollImageFrame : styles.personPhotoSlot}>
            <img
              key={currentPhoto}
              src={currentPhoto}
              alt={isWorksMode ? currentWork?.title ?? '' : ''}
              className={isWorksMode ? styles.scrollImage : styles.personPhoto}
            />
          </div>
        </div>
      </div>

      <div className={styles.photoNav}>
        <div className={styles.photoNavBtns}>
          {!isWorksMode && hasItems ? (
            <>
              <button
                type="button"
                className={styles.photoNavBtn}
                onClick={handleSlidePrev}
                disabled={!canNavigateSlides}
                aria-label="Предыдущий пункт"
              >
                <ArrowBackIosNewIcon fontSize="large" />
              </button>
              <span className={styles.photoNavCounter}>{slideNavIndex + 1} / {slideNavCount}</span>
              <button
                type="button"
                className={styles.photoNavBtn}
                onClick={handleSlideNext}
                disabled={!canNavigateSlides}
                aria-label="Следующий пункт"
              >
                <ArrowForwardIosIcon fontSize="large" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.photoNavBtn}
                onClick={handlePhotoPrev}
                disabled={!canNavigatePhotos}
                aria-label="Предыдущее фото"
              >
                <ArrowBackIosNewIcon fontSize="large" />
              </button>
              <span className={styles.photoNavCounter}>{navIndex + 1} / {navCount}</span>
              <button
                type="button"
                className={styles.photoNavBtn}
                onClick={handlePhotoNext}
                disabled={!canNavigatePhotos}
                aria-label="Следующее фото"
              >
                <ArrowForwardIosIcon fontSize="large" />
              </button>
            </>
          )}
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
