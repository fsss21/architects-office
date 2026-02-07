import { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import styles from './AppLayout.module.css'

const NAVIGATION_URL = '/data/navigation.json'
const PERSON_IDS = ['lvov', 'palladio', 'quarenghi']

function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [topCategories, setTopCategories] = useState([])
  const [sidebarItems, setSidebarItems] = useState([])
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
    if (PERSON_IDS.includes(item.id)) {
      const match = location.pathname.match(/^\/biography\/(\w+)$/)
      return match && match[1] === item.id
    }
    return false
  }

  const handleBack = () => {
    if (location.pathname.startsWith('/biography') || location.pathname === '/principles') {
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
              <div className={styles.sidebarGroup}>
                {sidebarItems
                  .filter((item) => PERSON_IDS.includes(item.id))
                  .map((item) => (
                    <Link
                      key={item.id}
                      to={`/biography/${item.id}`}
                      reloadDocument={false}
                      className={`${styles.sidebarBtn} ${isSidebarActive(item) ? styles.sidebarBtnActive : ''}`}
                      dangerouslySetInnerHTML={{ __html: item.label }}
                    >
                    </Link>
                  ))}
              </div>
              <div className={styles.sidebarGroup}>
                {sidebarItems
                  .filter((item) => item.id === 'principles')
                  .map((item) => (
                    <Link
                      key={item.id}
                      to="/principles"
                      reloadDocument={false}
                      className={`${styles.sidebarBtn} ${isSidebarActive(item) ? styles.sidebarBtnActive : ''}`}
                      dangerouslySetInnerHTML={{ __html: item.label }}
                    >
                    </Link>
                  ))}
              </div>
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
