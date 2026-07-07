import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import styles from './MainMenu.module.css'

import defaultScrollImage from '../assets/main_menu_biography.png'
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

const CONTENT_URL = '/data/content.json'
const PHOTO_ASSET_MAP = {
    'main_menu_biography.png': defaultScrollImage,
}

function MainMenu() {
    const { selectedHeaderId } = useOutletContext()
    const [headerContent, setHeaderContent] = useState({})
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
    const [isPhotoFullscreen, setIsPhotoFullscreen] = useState(false)
    const [contentPage, setContentPage] = useState(1)

    useEffect(() => {
        fetch(CONTENT_URL)
            .then((res) => {
                if (!res.ok) throw new Error('Ошибка загрузки')
                return res.json()
            })
            .then((data) => setHeaderContent(data.headerContent ?? {}))
            .catch(() => setHeaderContent({}))
    }, [])

    const pageData = headerContent[selectedHeaderId] ?? {}
    const { title, paragraphs = [], pagination = {}, scrollLabel = 'Изображение / свиток', images: imagesFromData = [] } = pageData
    const contentTotalPages = Math.max(1, paragraphs.length || pagination.totalPages || 1)
    const safeContentPage = Math.min(contentPage, contentTotalPages)
    const currentParagraph = paragraphs[safeContentPage - 1]

    const photoList = imagesFromData.length
        ? imagesFromData.map((path) => PHOTO_ASSET_MAP[path] ?? (path.startsWith('http') || path.startsWith('/') ? path : `/${path}`))
        : [defaultScrollImage]
    const currentPhotoSrc = photoList[currentPhotoIndex] ?? photoList[0]

    useEffect(() => {
        setCurrentPhotoIndex(0)
        setContentPage(1)
    }, [selectedHeaderId])

    useEffect(() => {
        if (contentPage > contentTotalPages) {
            setContentPage(contentTotalPages)
        }
    }, [contentPage, contentTotalPages])

    const handlePagePrev = () => setContentPage((p) => Math.max(1, p - 1))
    const handlePageNext = () => setContentPage((p) => Math.min(contentTotalPages, p + 1))

    const handlePhotoPrev = () => {
        setCurrentPhotoIndex((i) => Math.max(0, i - 1))
    }
    const handlePhotoNext = () => {
        setCurrentPhotoIndex((i) => Math.min(photoList.length - 1, i + 1))
    }
    const handlePhotoFullscreen = () => {
        setIsPhotoFullscreen(true)
    }
    const handlePhotoFullscreenClose = () => {
        setIsPhotoFullscreen(false)
    }
    const handleFullscreenKeyDown = (e) => {
        if (e.key === 'Escape') handlePhotoFullscreenClose()
    }
    useEffect(() => {
        if (!isPhotoFullscreen) return
        document.addEventListener('keydown', handleFullscreenKeyDown)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleFullscreenKeyDown)
            document.body.style.overflow = ''
        }
    }, [isPhotoFullscreen])

    return (
        <div className={styles.content}>
            <div className={styles.columns}>
                <div className={styles.textColumn}>
                    <h1 className={styles.title}>{title}</h1>
                    <div className={styles.blockText}>
                        {currentParagraph && <p>{currentParagraph}</p>}
                    </div>
                    <div className={styles.scrollNavText}>
                        <span>{safeContentPage}/{contentTotalPages}</span>
                        <div className={styles.buttonsNav}>
                            <button type="button" aria-label="Назад" onClick={handlePagePrev} disabled={safeContentPage <= 1}><ArrowBackIosNewIcon fontSize='large' /></button>
                            <button type="button" aria-label="Вперёд" onClick={handlePageNext} disabled={safeContentPage >= contentTotalPages}><ArrowForwardIosIcon fontSize='large' /></button>
                        </div>
                    </div>
                </div>
                <div className={styles.scrollColumn}>
                    <div className={styles.photoContainer}>
                        <div className={styles.photoImageFrame}>
                            <img
                                src={currentPhotoSrc}
                                alt={scrollLabel}
                                className={styles.photoImage}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.scrollNav}>
                <div className={styles.scrollNavBtn}>
                    <button type="button" aria-label="Предыдущее фото" onClick={handlePhotoPrev} disabled={currentPhotoIndex <= 0 || photoList.length <= 1}><ArrowBackIosNewIcon fontSize='large' /></button>
                    <span>{currentPhotoIndex + 1}/{photoList.length}</span>
                    <button type="button" aria-label="Следующее фото" onClick={handlePhotoNext} disabled={currentPhotoIndex >= photoList.length - 1 || photoList.length <= 1}><ArrowForwardIosIcon fontSize='large' /></button>
                </div>
                <button
                    type="button"
                    className={styles.fullscreenIcon}
                    aria-label="Полный экран"
                    onClick={handlePhotoFullscreen}
                >
                    <FullscreenIcon fontSize='large' />
                </button>
            </div>

            {isPhotoFullscreen && (
                <div
                    className={styles.photoFullscreenOverlay}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Полноэкранный просмотр фото"
                >
                    <button
                        type="button"
                        className={styles.photoFullscreenClose}
                        aria-label="Закрыть"
                        onClick={handlePhotoFullscreenClose}
                    >
                        ×
                    </button>
                    <div className={styles.photoFullscreenContent}>
                        <img
                            src={currentPhotoSrc}
                            alt={scrollLabel}
                            className={styles.photoFullscreenImage}
                        />
                        {photoList.length > 1 && (
                            <div className={styles.photoFullscreenNav}>
                                <button
                                    type="button"
                                    aria-label="Предыдущее фото"
                                    onClick={handlePhotoPrev}
                                    disabled={currentPhotoIndex <= 0}
                                >
                                    <ArrowBackIosNewIcon fontSize='large' />
                                </button>
                                <span>{currentPhotoIndex + 1} / {photoList.length}</span>
                                <button
                                    type="button"
                                    aria-label="Следующее фото"
                                    onClick={handlePhotoNext}
                                    disabled={currentPhotoIndex >= photoList.length - 1}
                                >
                                    <ArrowForwardIosIcon fontSize='large' />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MainMenu