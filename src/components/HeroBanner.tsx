import heroBannerImage from '../assets/home-hero-banner.png'
import styles from './HeroBanner.module.css'

function HeroBanner() {
  return (
    <section className={styles.banner}>
      <img
        className={styles.image}
        src={heroBannerImage}
        alt="智慧视听操作系统协同创新平台宣传横幅"
      />
    </section>
  )
}

export default HeroBanner
