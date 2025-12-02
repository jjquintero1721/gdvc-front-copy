import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './TeamPage.css'

export default function TeamPage() {
  const { scrollYProgress } = useScroll()
  const [pawPrints, setPawPrints] = useState([])

  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -150])

  useEffect(() => {
    let pawId = 0
    let lastPawTime = 0
    let lastX = 0
    let lastY = 0

    const handleMouseMove = (e) => {
      const currentTime = Date.now()
      const timeSinceLastPaw = currentTime - lastPawTime
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2)
      )

      if (timeSinceLastPaw > 200 && distance > 80) {
        const newPaw = {
          id: pawId++,
          x: e.clientX,
          y: e.clientY,
        }

        setPawPrints((prev) => [...prev, newPaw])
        lastPawTime = currentTime
        lastX = e.clientX
        lastY = e.clientY

        setTimeout(() => {
          setPawPrints((prev) => prev.filter((paw) => paw.id !== newPaw.id))
        }, 800)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const cinematicReveal = {
    initial: { opacity: 0, y: 40, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, ease: "easeOut" }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  }

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: 'easeOut' }
  }

  const cardHover = {
    scale: 1.05,
    y: -10,
    transition: { duration: 0.3, ease: 'easeOut' }
  }

  const teamMembers = [
    {
      name: 'Juan Jose Quintero Velasquez',
      role: 'Full Stack Developer',
      bio: 'Arquitecto principal del sistema, especializado en React y FastAPI.',
      emoji: '👨‍💻',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      skills: ['React', 'Python', 'PostgreSQL']
    },
    {
      name: 'Susana Eguis Muñoz',
      role: 'Lider de Proyecto',
      bio: 'Gestora de proyectos con enfoque en metodologías ágiles.',
      emoji: '👩‍💻',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      skills: ['Agile', 'Scrum', 'Communication']
    },
    {
      name: 'Maria Victoria Giraldo',
      role: 'Backend Developer',
      bio: 'Especialista en arquitectura de software y bases de datos.',
      emoji: '👩‍💻',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      skills: ['FastAPI', 'PostgreSQL', 'Docker']
    },
    {
      name: 'Isabella Arias Lemus',
      role: 'Software Tester',
      bio: 'Aseguramiento de calidad y pruebas automatizadas.',
      emoji: '👩‍💻',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      skills: ['PyTest', 'Selenium', 'Jest']
    }
  ]

  return (
    <div className="pf-team">
      {/* Cursor prints */}
      <div className="pf-team__paw-trail-container">
        {pawPrints.map((paw) => (
          <motion.div
            key={paw.id}
            className="pf-team__paw"
            initial={{ opacity: 0, scale: 0.5, x: paw.x, y: paw.y }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3 }}
            style={{ left: 0, top: 0 }}
          >
            🐾
          </motion.div>
        ))}
      </div>

      {/* Blobs */}
      <motion.div className="pf-team__blob pf-team__blob--1" style={{ y: blob1Y }} />
      <motion.div className="pf-team__blob pf-team__blob--2" style={{ y: blob2Y }} />
      <div className="pf-team__blob pf-team__blob--3" />

      {/* Header */}
      <section className="pf-team__header">
        <div className="pf-team__header-content">

          <motion.div
            className="pf-team__back"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/" className="pf-team__back-link">
              ← Volver al Inicio
            </Link>
          </motion.div>

          <motion.div
            className="pf-team__badge"
            initial="initial"
            animate="animate"
            variants={scaleIn}
          >
            👥 Nuestro Equipo
          </motion.div>

          <motion.h1
            className="pf-team__title"
            initial="initial"
            animate="animate"
            variants={cinematicReveal}
          >
            Conoce al Equipo de <span>Desarrollo</span>
          </motion.h1>

          <motion.p
            className="pf-team__subtitle"
            initial="initial"
            animate="animate"
            variants={cinematicReveal}
          >
            Los profesionales que construyen y mantienen PawFlow día a día.
          </motion.p>
        </div>
      </section>

      {/* Separator */}
      <PetSeparator />

      {/* Team Grid */}
      <section className="pf-team__section">
        <motion.div
          className="pf-team__grid"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="pf-team__card"
              variants={cinematicReveal}
              whileHover={cardHover}
            >
              <div
                className="pf-team__card-bg"
                style={{ background: member.gradient }}
              />

              <motion.div
                className="pf-team__avatar"
                whileHover={{ scale: 1.1 }}
              >
                <span>{member.emoji}</span>
              </motion.div>

              <div className="pf-team__content">
                <h3>{member.name}</h3>
                <p className="pf-team__role">{member.role}</p>
                <p className="pf-team__bio">{member.bio}</p>

                <div className="pf-team__skills">
                  {member.skills.map((skill, i) => (
                    <motion.span
                      key={i}
                      className="pf-team__skill"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Separator */}
      <PetSeparator reverse />

      {/* CTA */}
      <section className="pf-team__cta">
        <motion.div
          className="pf-team__cta-content"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={cinematicReveal}
        >
          <motion.div
            className="pf-team__cta-icon"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
          >
            💚
          </motion.div>

          <h2>¿Quieres Unirte al Equipo?</h2>

          <p>
            Siempre buscamos personas apasionadas por la tecnología y los animales.
          </p>

          <div className="pf-team__cta-buttons">
            <a href="mailto:careers@pawflow.com" className="pf-team__btn pf-team__btn--primary">
              Enviar CV →
            </a>

            <Link to="/" className="pf-team__btn pf-team__btn--secondary">
              Volver al Inicio
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="pf-team__footer">
        <p>🐾 PawFlow — {new Date().getFullYear()}</p>
      </footer>
    </div>
  )
}

function PetSeparator({ reverse = false }) {
  return (
    <div className={`pf-team__separator ${reverse ? "reverse" : ""}`}>
      <svg viewBox="0 0 1200 100">
        <motion.path
          d="M0,50 Q300,10 600,50 T1200,50"
          stroke="var(--primary)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 2 }}
        />
      </svg>
    </div>
  )
}
