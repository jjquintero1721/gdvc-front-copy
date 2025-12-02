import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './LandingPage.css';

/**
 * 🐾 Landing Page Premium MEJORADA - Clínica Veterinaria
 *
 */
export default function LandingPage() {
  const { scrollYProgress } = useScroll();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [pawPrints, setPawPrints] = useState([]);
  const [typedText, setTypedText] = useState('');

  // Parallax effect
  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const blob2Y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // ==================== TYPING ANIMATION ====================
  const textToType = "Tu mascota merece amor, salud y cuidado profesional";

  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= textToType.length) {
        setTypedText(textToType.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50); // Velocidad de escritura

    return () => clearInterval(typingInterval);
  }, []);

  // ==================== PAW TRAIL CURSOR ====================
  useEffect(() => {
    let pawId = 0;
    let lastPawTime = 0;
    let lastX = 0;
    let lastY = 0;

    const handleMouseMove = (e) => {
      const currentTime = Date.now();
      const timeSinceLastPaw = currentTime - lastPawTime;

      // Calcular distancia desde la última huella
      const distance = Math.sqrt(
        Math.pow(e.clientX - lastX, 2) + Math.pow(e.clientY - lastY, 2)
      );

      // Solo crear huella si:
      // 1. Han pasado al menos 200ms desde la última huella
      // 2. El mouse se movió al menos 80px
      if (timeSinceLastPaw > 200 && distance > 80) {
        const newPaw = {
          id: pawId++,
          x: e.clientX,
          y: e.clientY,
        };

        setPawPrints((prev) => [...prev, newPaw]);

        // Actualizar referencias
        lastPawTime = currentTime;
        lastX = e.clientX;
        lastY = e.clientY;

        // Eliminar después de 800ms (un poco más de tiempo visible)
        setTimeout(() => {
          setPawPrints((prev) => prev.filter((paw) => paw.id !== newPaw.id));
        }, 800);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // ==================== DARK MODE TOGGLE ====================
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  // ==================== ANIMATION VARIANTS ====================

  // Scroll Reveal Cinematográfico con Blur
  const cinematicReveal = {
    initial: { opacity: 0, y: 40, filter: "blur(8px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5, ease: 'easeOut' }
  };

  // Pet Stories - Animaciones especiales para mascotas
  const petStoryHover = {
    scale: 1.05,
    rotate: [0, -2, 2, 0],
    transition: { duration: 0.3 }
  };

  return (
    <div className={`landing-page ${isDarkMode ? 'dark-mode' : ''}`}>

      {/* ==================== PAW TRAIL CURSOR ==================== */}
      <div className="paw-trail-container">
        {pawPrints.map((paw) => (
          <motion.div
            key={paw.id}
            className="paw-trail"
            initial={{ opacity: 0, scale: 0.5, x: paw.x, y: paw.y, rotate: Math.random() * 40 - 20 }}
            animate={{ opacity: 0.7, scale: 1, rotate: Math.random() * 20 - 10 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{ left: 0, top: 0 }}
          >
            🐾
          </motion.div>
        ))}
      </div>

      {/* ==================== DARK MODE TOGGLE ==================== */}
      <motion.button
        className="dark-mode-toggle"
        onClick={() => setIsDarkMode(!isDarkMode)}
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle Dark Mode"
      >
        <motion.span
          initial={false}
          animate={{ rotate: isDarkMode ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDarkMode ? '🐺' : '🐕'}
        </motion.span>
      </motion.button>

      {/* ==================== HERO SECTION ==================== */}
      <section className="hero">
        <motion.div className="hero__blob hero__blob--1" style={{ y: blob1Y }} />
        <motion.div className="hero__blob hero__blob--2" style={{ y: blob2Y }} />
        <div className="hero__blob hero__blob--3" />

        <div className="hero__paws">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="paw-print">🐾</div>
          ))}
        </div>

        <div className="hero__content">
          <motion.div
            className="hero__left"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div className="hero__badge" variants={scaleIn}>
              <span className="hero__badge-icon">🐾</span>
              <span>PawFlow</span>
            </motion.div>

            <motion.h1 className="hero__title" variants={cinematicReveal}>
              El Mejor Cuidado para{' '}
              <span className="hero__title-highlight">Tu Mascota</span>
            </motion.h1>

            {/* Typing Animation */}
            <motion.p
              className="hero__typing-text"
              variants={cinematicReveal}
            >
              {typedText}
              <span className="typing-cursor">|</span>
            </motion.p>

            <motion.p className="hero__subtitle" variants={cinematicReveal}>
              Cuida la salud de tu compañero peludo de forma moderna, rápida y
              segura. Agenda citas en línea, revisa historiales médicos completos
              y obtén atención personalizada de veterinarios expertos.
            </motion.p>

            <motion.div className="hero__cta" variants={cinematicReveal}>
              <Link to="/registro" className="btn btn--primary">
                Comenzar Ahora →
              </Link>
              <Link to="/login" className="btn btn--secondary">
                Iniciar Sesión
              </Link>
            </motion.div>

            <motion.div className="hero__stats" variants={cinematicReveal}>
              {[
                { value: '5000+', label: 'Mascotas Atendidas' },
                { value: '98%', label: 'Clientes Satisfechos' },
                { value: '15+', label: 'Años de Experiencia' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="hero__stat"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="hero__stat-value">{stat.value}</div>
                  <div className="hero__stat-label">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            className="hero__right"
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              className="hero__card"
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="hero__card-badge">
                <span>🟢</span>
                <span>Atención en Línea</span>
              </div>

              <div className="hero__card-pets">
                <motion.span
                  className="pet-emoji"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0 }}
                  whileHover={{ scale: 1.2, rotate: 15 }}
                >
                  🐶
                </motion.span>
                <motion.span
                  className="pet-emoji"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.3 }}
                  whileHover={{ scale: 1.2, rotate: -15 }}
                >
                  🐱
                </motion.span>
                <motion.span
                  className="pet-emoji"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.6 }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  🐰
                </motion.span>
              </div>

              <div className="hero__card-content">
                <h3>Agenda tu Cita Hoy</h3>
                <p>
                  Accede a atención veterinaria profesional las 24 horas del día.
                  Nuestro equipo está listo para cuidar de tu mascota.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== PET PATH SEPARATOR ==================== */}
      <PetPathSeparator />

      {/* ==================== FEATURES SECTION ==================== */}
      <section className="features">
        <motion.div
          className="section__header"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={cinematicReveal}
        >
          <span className="section__badge">Servicios</span>
          <h2 className="section__title">¿Por qué Elegirnos?</h2>
          <p className="section__subtitle">
            Ofrecemos atención veterinaria de clase mundial con tecnología moderna
            y un equipo apasionado por el bienestar animal.
          </p>
        </motion.div>

        <motion.div
          className="features__grid"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {[
            { icon: '💉', title: 'Atención Profesional', description: 'Veterinarios certificados con años de experiencia en el cuidado animal.' },
            { icon: '📅', title: 'Agenda Fácil', description: 'Reserva citas en segundos desde tu móvil o computadora, 24/7.' },
            { icon: '📘', title: 'Historial Digital', description: 'Toda la información médica de tu mascota en un solo lugar seguro.' },
            { icon: '🔐', title: 'Datos Seguros', description: 'Protección avanzada y privacidad garantizada para tu información.' },
            { icon: '🏥', title: 'Instalaciones Modernas', description: 'Equipamiento de última generación para diagnósticos precisos.' },
            { icon: '💚', title: 'Atención Personalizada', description: 'Cada mascota recibe un plan de cuidado único y adaptado.' }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              variants={cinematicReveal}
              whileHover={{ scale: 1.03, y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.div
                className="feature-card__icon"
                whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ==================== PET PATH SEPARATOR ==================== */}
      <PetPathSeparator reverse />

      {/* ==================== SERVICES SECTION (Pet Stories) ==================== */}
      <section className="services">
        <motion.div
          className="section__header"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={cinematicReveal}
        >
          <span className="section__badge">Nuestros Servicios</span>
          <h2 className="section__title">Cuidado Integral para Tu Mascota</h2>
          <p className="section__subtitle">
            Desde consultas preventivas hasta cirugías especializadas,
            cubrimos todas las necesidades de salud de tu compañero.
          </p>
        </motion.div>

        <motion.div
          className="services__grid"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {[
            { emoji: '🩺', title: 'Consultas Generales', description: 'Exámenes de rutina y chequeos preventivos para mantener a tu mascota saludable.', features: ['Examen físico completo', 'Vacunación', 'Desparasitación'] },
            { emoji: '🔬', title: 'Diagnóstico Avanzado', description: 'Tecnología de punta para diagnósticos precisos y tratamientos efectivos.', features: ['Análisis de laboratorio', 'Rayos X', 'Ecografías'] },
            { emoji: '⚕️', title: 'Cirugías', description: 'Procedimientos quirúrgicos realizados por especialistas certificados.', features: ['Esterilización', 'Cirugías menores', 'Cirugías complejas'] },
            { emoji: '🦷', title: 'Odontología Veterinaria', description: 'Cuidado dental especializado para prevenir problemas bucales.', features: ['Limpieza dental', 'Extracciones', 'Tratamientos periodontales'] },
            { emoji: '💊', title: 'Farmacia Veterinaria', description: 'Medicamentos y suplementos de calidad para el tratamiento de tu mascota.', features: ['Medicamentos recetados', 'Suplementos', 'Productos preventivos'] },
            { emoji: '🏨', title: 'Hospitalización', description: 'Cuidado intensivo 24/7 para mascotas que requieren atención especial.', features: ['Monitoreo constante', 'Atención personalizada', 'Instalaciones cómodas'] }
          ].map((service, index) => (
            <motion.div
              key={index}
              className="service-card"
              variants={cinematicReveal}
              whileHover={{ y: -8 }}
            >
              <div className="service-card__image">
                <motion.span
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, delay: index * 0.2 }}
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, -15, 15, -10, 10, 0],
                    transition: { duration: 0.6 }
                  }}
                >
                  {service.emoji}
                </motion.span>
              </div>
              <div className="service-card__content">
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">{service.description}</p>
                <ul className="service-card__features">
                  {service.features.map((feature, i) => (
                    <motion.li
                      key={i}
                      className="service-card__feature"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      {feature}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="how-it-works">
        <motion.div
          className="section__header"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={cinematicReveal}
        >
          <span className="section__badge">Sencillo y Rápido</span>
          <h2 className="section__title">¿Cómo Funciona?</h2>
          <p className="section__subtitle">
            En solo 3 pasos, puedes agendar una cita y recibir atención veterinaria profesional.
          </p>
        </motion.div>

        <motion.div
          className="steps"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          {[
            { number: 1, title: 'Regístrate', description: 'Crea tu cuenta gratis en menos de 1 minuto. Es rápido y seguro.' },
            { number: 2, title: 'Agenda tu Cita', description: 'Selecciona fecha, hora y el servicio que necesitas para tu mascota.' },
            { number: 3, title: 'Recibe Atención', description: 'Un veterinario profesional atenderá a tu mascota con dedicación.' }
          ].map((step, index) => (
            <motion.div
              key={index}
              className="step"
              variants={cinematicReveal}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="step__number"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {step.number}
              </motion.div>
              <h3 className="step__title">{step.title}</h3>
              <p className="step__description">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ==================== PET PATH SEPARATOR ==================== */}
      <PetPathSeparator />

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="testimonials">
        <motion.div
          className="section__header"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={cinematicReveal}
        >
          <span className="section__badge">Testimonios</span>
          <h2 className="section__title">Lo que Dicen Nuestros Clientes</h2>
          <p className="section__subtitle">
            Miles de familias confían en nosotros para el cuidado de sus mascotas.
          </p>
        </motion.div>

        <motion.div
          className="testimonials__grid"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {[
            { name: 'María González', role: 'Dueña de Max', content: 'Excelente servicio. Los veterinarios son súper profesionales y trataron a mi perro Max con mucho cariño. ¡Totalmente recomendado!', rating: 5, avatar: 'M' },
            { name: 'Carlos Rodríguez', role: 'Dueño de Luna y Milo', content: 'La plataforma es muy fácil de usar. Pude agendar la cita de mis gatos en minutos y el seguimiento del historial médico es fantástico.', rating: 5, avatar: 'C' },
            { name: 'Ana Martínez', role: 'Dueña de Coco', content: 'Mi conejo Coco tuvo una emergencia y me atendieron de inmediato. Estoy muy agradecida por la rapidez y profesionalismo del equipo.', rating: 5, avatar: 'A' }
          ].map((testimonial, index) => (
            <motion.div
              key={index}
              className="testimonial-card"
              variants={cinematicReveal}
              whileHover={{ scale: 1.02, y: -5 }}
            >
              <p className="testimonial-card__content">"{testimonial.content}"</p>
              <div className="testimonial-card__author">
                <motion.div
                  className="testimonial-card__avatar"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {testimonial.avatar}
                </motion.div>
                <div className="testimonial-card__info">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                  <div className="testimonial-card__rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                      >
                        ⭐
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ==================== PET PATH SEPARATOR ==================== */}
      <PetPathSeparator reverse />

      {/* ==================== TEAM SECTION ==================== */}
      <section className="team">
        <motion.div
          className="section__header"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={cinematicReveal}
        >
          <span className="section__badge">Nuestro Equipo</span>
          <h2 className="section__title">Veterinarios Expertos</h2>
          <p className="section__subtitle">
            Conoce a los profesionales dedicados al cuidado de tu mascota.
          </p>
        </motion.div>

        <motion.div
          className="team__grid"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          {[
            { name: 'Dra. Laura Pérez', role: 'Veterinaria General', bio: 'Especialista en medicina interna con 10 años de experiencia.', emoji: '👩‍⚕️' },
            { name: 'Dr. Juan Silva', role: 'Cirujano Veterinario', bio: 'Experto en cirugías complejas y procedimientos mínimamente invasivos.', emoji: '👨‍⚕️' },
            { name: 'Dra. Carmen López', role: 'Especialista en Felinos', bio: 'Certificada en comportamiento y salud de gatos.', emoji: '👩‍⚕️' },
            { name: 'Dr. Roberto Gómez', role: 'Odontólogo Veterinario', bio: 'Especializado en salud dental y tratamientos periodontales.', emoji: '👨‍⚕️' }
          ].map((member, index) => (
            <motion.div
              key={index}
              className="team-member"
              variants={cinematicReveal}
            >
              <motion.div
                className="team-member__avatar"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                {member.emoji}
              </motion.div>
              <h3 className="team-member__name">{member.name}</h3>
              <p className="team-member__role">{member.role}</p>
              <p className="team-member__bio">{member.bio}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ==================== CTA EMOCIONAL MEJORADO ==================== */}
      <section className="cta">
        <motion.div
          className="cta__content"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={cinematicReveal}
        >
          {/* Corazones Flotantes */}
          <div className="cta__hearts">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="cta__heart"
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  delay: i * 0.5
                }}
              >
                💚
              </motion.div>
            ))}
          </div>

          <motion.div
            className="cta__pet-image"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🐶
          </motion.div>

          <h2 className="cta__title">
            ¿Listo para Dar el Mejor Cuidado a Tu Mascota?
          </h2>

          <motion.div
            className="cta__badge"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🔔 Primera Cita GRATIS
          </motion.div>

          <p className="cta__subtitle">
            Únete a miles de familias que ya confían en nosotros.
            Regístrate hoy y agenda tu primera cita sin costo.
          </p>

          <div className="cta__buttons">
            <Link to="/registro" className="btn btn--white">
              Crear Cuenta Gratis →
            </Link>
            <Link to="/login" className="btn btn--outline">
              Iniciar Sesión
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="footer">
        <div className="footer__content">
          <div className="footer__main">
            <div className="footer__brand">
              <div className="footer__logo">
                <span>🐾</span>
                <span>PawFlow</span>
              </div>
              <p className="footer__tagline">
                PawFlow - Cuidando a tus mascotas con amor y profesionalismo desde 2010.
              </p>
            </div>

            <div className="footer__section">
              <h3>Navegación</h3>
              <ul className="footer__links">
                <li><Link to="/login">Iniciar Sesión</Link></li>
                <li><Link to="/registro">Registrarse</Link></li>
                <li><Link to="/servicios">Servicios</Link></li>
                <li><Link to="/equipo">Nuestro Equipo</Link></li>
              </ul>
            </div>

            <div className="footer__section">
              <h3>Servicios</h3>
              <ul className="footer__links">
                <li><a href="#consultas">Consultas</a></li>
                <li><a href="#vacunacion">Vacunación</a></li>
                <li><a href="#cirugia">Cirugías</a></li>
                <li><a href="#emergencias">Emergencias</a></li>
              </ul>
            </div>

            <div className="footer__section">
              <h3>Contacto</h3>
              <ul className="footer__links">
                <li><a href="mailto:info@gdcv.com">info@pawflow.com</a></li>
                <li><a href="tel:+123456789">+1 (234) 567-89</a></li>
                <li><a href="#ubicacion">Ubicación</a></li>
                <li><a href="#horarios">Horarios</a></li>
              </ul>
            </div>
          </div>

          <div className="footer__bottom">
            <p className="footer__copyright">
              © {new Date().getFullYear()} PawFlow - Gestión de Clínica Veterinaria. Todos los derechos reservados.
            </p>
            <div className="footer__social">
              <a href="#facebook" aria-label="Facebook">f</a>
              <a href="#instagram" aria-label="Instagram">📷</a>
              <a href="#twitter" aria-label="Twitter">🐦</a>
              <a href="#linkedin" aria-label="LinkedIn">in</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== PET PATH SEPARATOR COMPONENT ====================
function PetPathSeparator({ reverse = false }) {
  return (
    <div className={`pet-path-separator ${reverse ? 'pet-path-separator--reverse' : ''}`}>
      <svg className="pet-path-separator__svg" viewBox="0 0 1200 100" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M0,50 Q300,10 600,50 T1200,50"
          stroke="var(--primary)"
          strokeWidth="3"
          fill="none"
          strokeDasharray="10 5"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.3 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>

      <div className="pet-path-separator__paws">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="pet-path-separator__paw"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: [0, 1, 1, 0], x: i * 240 }}
            viewport={{ once: true }}
            transition={{
              duration: 3,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          >
            🐾
          </motion.div>
        ))}
      </div>
    </div>
  );
}