/**
 * The Beauty Room Experience — GSAP motion system
 */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  // —— Header glass ——
  const header = document.getElementById('header');
  const glass = header?.querySelector('.glass-nav');
  const onScroll = () => {
    if (!glass) return;
    if (window.scrollY > 40) {
      glass.style.background = 'rgba(30, 14, 20, 0.28)';
      glass.style.borderColor = 'rgba(255, 255, 255, 0.22)';
    } else {
      glass.style.background = 'rgba(255, 245, 242, 0.08)';
      glass.style.borderColor = 'rgba(255, 255, 255, 0.28)';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // —— Pink frost particles (below eye hero only) ——
  const canvas = document.getElementById('particles-canvas');
  const heroEye = document.getElementById('hero');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 36 : 70;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
    resizeCanvas();

    function heroClipTop() {
      if (!heroEye) return 0;
      const bottom = heroEye.getBoundingClientRect().bottom;
      return Math.max(0, Math.min(canvas.height, bottom));
    }

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 60;
        this.size = Math.random() * 2.8 + 0.9;
        this.speedX = Math.random() * 0.35 - 0.175;
        this.speedY = Math.random() * -0.55 - 0.12;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.pulseSpeed = Math.random() * 0.015 + 0.005;
        this.pulseDir = Math.random() > 0.5 ? 1 : -1;
        this.sparkle = Math.random() > 0.78;
        const tones = [
          [255, 105, 150],
          [196, 116, 108],
          [212, 160, 154],
          [240, 90, 140],
          [255, 150, 185],
        ];
        this.rgb = tones[Math.floor(Math.random() * tones.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < -12) this.reset(false);
        if (this.x < -12 || this.x > canvas.width + 12) {
          this.x = Math.random() * canvas.width;
        }
        this.opacity += this.pulseSpeed * this.pulseDir;
        if (this.opacity > 0.7 || this.opacity < 0.18) this.pulseDir *= -1;
      }

      draw() {
        const [r, g, b] = this.rgb;
        const a = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.22})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.fill();
        if (this.sparkle) {
          ctx.beginPath();
          ctx.arc(this.x, this.y, Math.max(0.5, this.size * 0.25), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 220, 230, ${a})`;
          ctx.fill();
        }
      }
    }

    function initParticles() {
      particles = [];
      for (let i = 0; i < particleCount; i++) particles.push(new Particle());
    }
    initParticles();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const clipY = heroClipTop();
      if (clipY < canvas.height) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, clipY, canvas.width, canvas.height - clipY);
        ctx.clip();
        particles.forEach((p) => {
          p.update();
          p.draw();
        });
        ctx.restore();
      } else {
        particles.forEach((p) => p.update());
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  if (!hasGsap || reduceMotion) return;

  gsap.registerPlugin(ScrollTrigger);

  // —— Split helpers ——
  function splitChars(el) {
    if (!el || el.dataset.split === 'chars') return el?.querySelectorAll('.char') || [];
    const raw = el.textContent.trim();
    el.setAttribute('aria-label', raw);
    el.innerHTML = raw
      .split('')
      .map((ch) => {
        const glyph = ch === ' ' ? '&nbsp;' : ch;
        return `<span class="char-mask"><span class="char">${glyph}</span></span>`;
      })
      .join('');
    el.dataset.split = 'chars';
    return el.querySelectorAll('.char');
  }

  function splitWords(el) {
    if (!el || el.dataset.split === 'words') return el?.querySelectorAll('.word') || [];
    const raw = el.textContent.trim();
    el.setAttribute('aria-label', raw);
    el.innerHTML = raw
      .split(/(\s+)/)
      .map((token) => {
        if (/^\s+$/.test(token)) return token;
        return `<span class="word-mask"><span class="word">${token}</span></span>`;
      })
      .join('');
    el.dataset.split = 'words';
    return el.querySelectorAll('.word');
  }

  const mm = gsap.matchMedia();

  mm.add(
    {
      isDesktop: '(min-width: 768px)',
      isMobile: '(max-width: 767px)',
    },
    (context) => {
      const { isDesktop } = context.conditions;
      const dur = isDesktop ? 1.15 : 0.9;
      const staggerChar = isDesktop ? 0.055 : 0.04;
      const staggerWord = isDesktop ? 0.08 : 0.06;

      // —— Nav entrance ——
      gsap.from('.glass-nav .logo', {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        delay: 0.1,
      });
      if (isDesktop) {
        gsap.from('.glass-nav .nav a', {
          opacity: 0,
          duration: 0.5,
          stagger: 0.04,
          ease: 'power2.out',
          delay: 0.15,
        });
      }
      gsap.from('.glass-nav .header-cta', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out',
        delay: 0.2,
      });

      // —— Hero beauty ——
      const beautyTitle = document.querySelector('.hero-eye-title');
      const heroImg = document.querySelector('.hero-eye-img');
      if (beautyTitle) {
        const chars = splitChars(beautyTitle);
        gsap.set(chars, { yPercent: 120, opacity: 0, scale: 0.94 });
        const heroTl = gsap.timeline({ delay: 0.2 });
        heroTl.to(chars, {
          yPercent: 0,
          opacity: 1,
          scale: 1,
          duration: dur,
          stagger: staggerChar,
          ease: 'power3.out',
        });
        heroTl.to(
          beautyTitle,
          {
            y: isDesktop ? -8 : -4,
            duration: 3.2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          },
          '+=0.35'
        );
      }

      if (heroImg) {
        gsap.fromTo(
          heroImg,
          { scale: 1.08 },
          {
            scale: 1,
            duration: 2.2,
            ease: 'power2.out',
          }
        );
        gsap.to(heroImg, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // —— Section h2 word reveals ——
      gsap.utils.toArray('.section h2').forEach((h2) => {
        const words = splitWords(h2);
        gsap.set(words, { yPercent: 110, opacity: 0 });
        gsap.to(words, {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          stagger: staggerWord,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: h2,
            start: 'top 85%',
            once: true,
          },
        });
      });

      // —— Display word "room" ——
      const roomWord = document.querySelector('.display-word');
      if (roomWord) {
        const chars = splitChars(roomWord);
        gsap.set(chars, { yPercent: 110, opacity: 0, filter: 'blur(8px)' });
        gsap.to(chars, {
          yPercent: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 1,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#concepto',
            start: 'top 75%',
            once: true,
          },
        });
      }

      // —— Experiencia ——
      const exp = document.querySelector('#experiencia');
      if (exp) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: exp,
            start: 'top 70%',
            once: true,
          },
        });
        tl.from('.experience-intro > *:not(.experience-actions)', {
          y: 36,
          opacity: 0,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
        });
        tl.from(
          '.experience-actions',
          {
            opacity: 0,
            duration: 0.45,
            ease: 'power2.out',
          },
          '-=0.35'
        );
        tl.from(
          '.experience-media',
          {
            scale: 1.08,
            opacity: 0,
            duration: 1,
            ease: 'power3.out',
          },
          '-=0.55'
        );
      }

      // —— Por qué ——
      gsap.from('#por-que .why-list li', {
        x: -28,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#por-que',
          start: 'top 70%',
          once: true,
        },
      });

      // —— Módulos ——
      gsap.from('#aprenderas .module-rail article', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#aprenderas .module-rail',
          start: 'top 80%',
          once: true,
        },
      });
      gsap.from('#aprenderas .module-tags li', {
        y: 16,
        opacity: 0,
        duration: 0.5,
        stagger: 0.06,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#aprenderas .module-tags',
          start: 'top 90%',
          once: true,
        },
      });

      // —— Incluye ——
      gsap.from('#incluye .include-list li', {
        y: 24,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#incluye',
          start: 'top 75%',
          once: true,
        },
      });

      // —— Cronograma ——
      gsap.from('#cronograma .timeline li', {
        x: 30,
        opacity: 0,
        duration: 0.55,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#cronograma .timeline',
          start: 'top 80%',
          once: true,
        },
      });
      gsap.from('#cronograma .dress', {
        y: 24,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#cronograma .dress',
          start: 'top 90%',
          once: true,
        },
      });

      // —— Precio ——
      const amount = document.querySelector('.amount');
      if (amount) {
        gsap.from(amount, {
          scale: 0.7,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#edicion',
            start: 'top 75%',
            once: true,
          },
        });
      }
      gsap.from('#edicion .pricing-body > *:not(.amount)', {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#edicion',
          start: 'top 75%',
          once: true,
        },
      });

      // —— Instructora ——
      gsap.from('#instructora .instructor-frame', {
        x: isDesktop ? -40 : 0,
        y: isDesktop ? 0 : 30,
        opacity: 0,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#instructora',
          start: 'top 75%',
          once: true,
        },
      });
      gsap.from('#instructora .instructor-grid > div', {
        x: isDesktop ? 40 : 0,
        y: isDesktop ? 0 : 24,
        opacity: 0,
        duration: 0.95,
        delay: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#instructora',
          start: 'top 75%',
          once: true,
        },
      });

      // —— Reserva ——
      gsap.from('#reserva .reserve-box > *:not(.btn-pill)', {
        y: 28,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: '#reserva',
          start: 'top 75%',
          once: true,
        },
      });
      gsap.from('#reserva .btn-pill', {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#reserva',
          start: 'top 75%',
          once: true,
        },
      });

      // —— Concepto body ——
      gsap.from('#concepto .concept-body > *', {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#concepto .concept-body',
          start: 'top 80%',
          once: true,
        },
      });

      // —— Footer ——
      gsap.from('.site-footer .footer-inner > *', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.site-footer',
          start: 'top 95%',
          once: true,
        },
      });
    }
  );
});
