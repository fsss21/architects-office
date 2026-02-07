import styles from './StartScreen.module.css'

import startScreenImg from '../assets/start_screen_img.png'

function StartScreen({ onContinue }) {
  const handleClick = () => onContinue?.()

  return (
    <div
      className={styles.screen}
      style={{ backgroundImage: `url(${startScreenImg})` }}
      onClick={handleClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), handleClick())}
      role="button"
      tabIndex={0}
      aria-label="Нажмите для продолжения"
    >
    </div>
  )
}

export default StartScreen
