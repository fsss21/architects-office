import styles from './About.module.css'

function About() {
  return (
    <div className={styles.about}>
      <h1>О проекте</h1>
      <div className={styles.aboutContent}>
        <section>
          <h2>О Кабинете Архитектора</h2>
          <p>
            Это современное React приложение, демонстрирующее использование
            React Router для навигации между страницами.
          </p>
        </section>
        <section>
          <h2>Технологии</h2>
          <ul>
            <li>⚛️ React 18</li>
            <li>🧭 React Router DOM v6</li>
            <li>⚡ Vite</li>
            <li>📝 JSX</li>
            <li>🎨 CSS Modules</li>
          </ul>
        </section>
        <section>
          <h2>Возможности</h2>
          <p>
            Проект включает базовую настройку роутинга, современный UI и
            адаптивный дизайн. Вы можете легко расширить его, добавив новые
            маршруты и компоненты.
          </p>
        </section>
      </div>
    </div>
  )
}

export default About
