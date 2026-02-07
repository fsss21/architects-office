import { useState, useEffect } from 'react'
import styles from './Principles.module.css'

const CONTENT_URL = '/data/content.json'

function Principles() {
  const [data, setData] = useState({ russianAdaptations: '', palladianAdaptations: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(CONTENT_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка загрузки')
        return res.json()
      })
      .then((content) => {
        const principles = content.principles ?? {}
        setData({
          russianAdaptations: principles.russianAdaptations ?? '',
          palladianAdaptations: principles.palladianAdaptations ?? '',
        })
      })
      .catch(() => setData({ russianAdaptations: '', palladianAdaptations: '' }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className={styles.principlesView}>
        <p className={styles.principlesLoading}>Загрузка...</p>
      </div>
    )
  }

  return (
    <div className={styles.principlesView}>
      <h1 className={styles.principlesTitle}>Архитектурные принципы <br /> и сравнения</h1>
      <div className={styles.principlesBlock}>
        <div className={styles.principlesColumn}>
          <h2 className={styles.principlesColumnTitle}>Русские адаптации</h2>
          <p className={styles.principlesText}>{data.russianAdaptations}</p>
        </div>
        <div className={styles.principlesDivider} aria-hidden="true" />
        <div className={styles.principlesColumn}>
          <h2 className={styles.principlesColumnTitle}>Палладианские принципы</h2>
          <p className={styles.principlesText}>{data.palladianAdaptations}</p>
        </div>
      </div>
    </div>
  )
}

export default Principles
