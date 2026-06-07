import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import styles from './AppLayout.module.css'

const NAVIGATION_URL = '/data/navigation.json'
const SIDEBAR_PAGE_SIZE = 4

function AppLayout({ onBackToStart }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [topCategories, setTopCategories] = useState([])
  const [sidebarItems, setSidebarItems] = useState([])
  const [sidebarPage, setSidebarPage] = useState(0)
  const [selectedHeaderId, setSelectedHeaderId] = useState('personalities')

  useEffect(() => {
    fetch(NAVIGATION_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка загрузки')
        return res.json()
      })
      .then((data) => {
        setTopCategories(data.topCategories ?? [])
        setSidebarItems(data.sidebarItems ?? [])
      })
      .catch(() => {
        setTopCategories([])
        setSidebarItems([])
      })
  }, [])

  const showHeader = location.pathname === '/'
  const isHeaderActive = (id) => selectedHeaderId === id

  const isSidebarActive = (item) => {
    if (item.id === 'principles') return location.pathname === '/principles'
    const match = location.pathname.match(/^\/biography\/([\w-]+)$/)
    return match ? match[1] === item.id : false
  }

  const principlesItem = sidebarItems.find((item) => item.id === 'principles')
  const biographyItems = sidebarItems.filter((item) => item.id !== 'principles')
  const sidebarPages = Math.max(1, Math.ceil((biographyItems.length || 0) / SIDEBAR_PAGE_SIZE))
  const visibleSidebarItems = biographyItems.slice(
    sidebarPage * SIDEBAR_PAGE_SIZE,
    sidebarPage * SIDEBAR_PAGE_SIZE + SIDEBAR_PAGE_SIZE
  )
  const canSidebarPrev = sidebarPage > 0
  const canSidebarNext = sidebarPage < sidebarPages - 1

  const handleBack = () => {
    if (location.pathname === '/') {
      onBackToStart?.()
    } else if (location.pathname.startsWith('/biography') || location.pathname === '/principles') {
      navigate('/')
    } else if (location.pathname !== '/') {
      window.history.back()
    }
  }

  const isBiography = location.pathname.startsWith('/biography')
  const isPrinciples = location.pathname === '/principles'

  return (
    <div
      className={`${styles.layout} ${isBiography ? styles.layoutBiography : ''} ${isPrinciples ? styles.layoutPrinciples : ''}`}
    >
      {showHeader && (
        <header className={styles.header}>
          <nav className={styles.headerNav}>
            {topCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.headerBtn} ${isHeaderActive(cat.id) ? styles.headerBtnActive : ''}`}
                onClick={() => setSelectedHeaderId(cat.id)}
                dangerouslySetInnerHTML={{ __html: cat.label }}
              />
            ))}
          </nav>
        </header>
      )}

      <div className={styles.body}>
        {!isPrinciples && (
          <aside className={styles.sidebar}>
            <div className={styles.sidebarInner}>
              {sidebarPages > 1 && (
                <button
                  type="button"
                  className={styles.sidebarNavBtn}
                  onClick={() => setSidebarPage((p) => Math.max(0, p - 1))}
                  disabled={!canSidebarPrev}
                  aria-label="Предыдущие пункты"
                >
                  ‹
                </button>
              )}
              <div className={styles.sidebarGroup}>
                {visibleSidebarItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/biography/${item.id}`}
                    reloadDocument={false}
                    className={`${styles.sidebarBtn} ${isSidebarActive(item) ? styles.sidebarBtnActive : ''}`}
                    dangerouslySetInnerHTML={{ __html: item.label }}
                  />
                ))}
              </div>
              {sidebarPages > 1 && (
                <button
                  type="button"
                  className={styles.sidebarNavBtn}
                  onClick={() => setSidebarPage((p) => Math.min(sidebarPages - 1, p + 1))}
                  disabled={!canSidebarNext}
                  aria-label="Следующие пункты"
                >
                  ›
                </button>
              )}
              {principlesItem && (
                <Link
                  to="/principles"
                  reloadDocument={false}
                  className={`${styles.sidebarBtn} ${styles.sidebarPrinciplesBtn} ${isSidebarActive(principlesItem) ? styles.sidebarBtnActive : ''}`}
                  dangerouslySetInnerHTML={{ __html: principlesItem.label }}
                />
              )}
            </div>
          </aside>
        )}

        <main className={styles.mainContent}>
          <Outlet key={location.pathname} context={{ selectedHeaderId, setSelectedHeaderId }} />
        </main>
      </div>
      <button
        type="button"
        className={`${styles.backBtn} ${isBiography ? styles.backBtnBiography : ''} ${isPrinciples ? styles.backBtnPrinciples : ''}`}
        onClick={handleBack}
        aria-label="Назад"
      >
        НАЗАД
      </button>
    </div>
  )
}

export default AppLayout
