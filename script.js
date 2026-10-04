const loader = document.getElementById("loader");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const topButton = document.getElementById("topButton");

window.addEventListener("load", () => {
  setTimeout(() => loader.classList.add("hidden"), 1500);
});

menuToggle?.addEventListener("click", () => {
  nav.classList.toggle("open");
});

document.querySelectorAll(".nav a").forEach(link => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

window.addEventListener("scroll", () => {
  topButton.classList.toggle("show", window.scrollY > 600);
});

topButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const heroSlides = Array.from(document.querySelectorAll("[data-hero-slide]"));
const heroControls = document.querySelector(".hero-carousel-controls");

if (heroSlides.length && heroControls) {
  const heroDots = Array.from(heroControls.querySelectorAll("[data-hero-index]"));
  const heroStatus = heroControls.querySelector("[data-hero-status]");
  const pauseButton = heroControls.querySelector("[data-hero-pause]");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeHeroIndex = 0;
  let autoplayPaused = reducedMotionQuery.matches;
  let autoplayTimer;

  function updateHeroPauseControl() {
    pauseButton.querySelector("use").setAttribute("href", autoplayPaused ? "#icon-play" : "#icon-pause");
    pauseButton.setAttribute("aria-label", autoplayPaused ? "Reanudar carrusel" : "Pausar carrusel");
    pauseButton.setAttribute("aria-pressed", String(autoplayPaused));
  }

  function startHeroAutoplay() {
    window.clearInterval(autoplayTimer);
    if (autoplayPaused || heroSlides.length < 2) return;
    autoplayTimer = window.setInterval(() => showHeroSlide(activeHeroIndex + 1), 6500);
  }

  function showHeroSlide(index) {
    activeHeroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeHeroIndex);
    });
    heroDots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeHeroIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
    heroStatus.textContent = `Imagen ${activeHeroIndex + 1} de ${heroSlides.length}`;
    startHeroAutoplay();
  }

  heroControls.querySelector("[data-hero-prev]").addEventListener("click", () => showHeroSlide(activeHeroIndex - 1));
  heroControls.querySelector("[data-hero-next]").addEventListener("click", () => showHeroSlide(activeHeroIndex + 1));
  heroDots.forEach(dot => {
    dot.addEventListener("click", () => showHeroSlide(Number(dot.dataset.heroIndex)));
  });
  pauseButton.addEventListener("click", () => {
    autoplayPaused = !autoplayPaused;
    updateHeroPauseControl();
    startHeroAutoplay();
  });

  const handleMotionPreference = event => {
    if (event.matches) autoplayPaused = true;
    updateHeroPauseControl();
    startHeroAutoplay();
  };
  if (reducedMotionQuery.addEventListener) {
    reducedMotionQuery.addEventListener("change", handleMotionPreference);
  } else {
    reducedMotionQuery.addListener(handleMotionPreference);
  }

  updateHeroPauseControl();
  startHeroAutoplay();
}

const liveStatus = document.querySelector("[data-live-status]");
const liveLabel = document.querySelector("[data-live-label]");

if (liveStatus && liveLabel) {
  const cdmxClock = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  });
  const weekdayFormatter = new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    weekday: "long"
  });
  const cdmxWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    weekday: "short"
  });
  const weekdayNumbers = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const streamCtaLabel = document.querySelector("[data-stream-cta-label]");

  function updateLiveStatus() {
    const parts = cdmxClock.formatToParts(new Date());
    const partValue = type => Number(parts.find(part => part.type === type).value);
    const hour = partValue("hour");
    const minute = partValue("minute");
    const localMinutes = hour * 60 + minute;
    const weekdayName = cdmxWeekdayFormatter.format(new Date());
    const weekdayNumber = weekdayNumbers[weekdayName];
    const isWeekday = weekdayNumber >= 1 && weekdayNumber <= 5;
    const isScheduledLive = isWeekday && localMinutes >= 18 * 60 && localMinutes < 21 * 60;

    liveStatus.classList.toggle("is-live", isScheduledLive);
    if (isScheduledLive) {
      liveLabel.textContent = "EN VIVO AHORA";
      if (streamCtaLabel) streamCtaLabel.textContent = "ENTRAR AL DIRECTO";
      liveStatus.setAttribute("aria-label", "En horario de directo anunciado, lunes a viernes de 6 a 9 p. m. hora CDMX");
      return;
    }

    const year = partValue("year");
    const month = partValue("month");
    const day = partValue("day");
    const startsToday = isWeekday && localMinutes < 18 * 60;
    let daysUntilNextStream;
    if (startsToday) {
      daysUntilNextStream = 0;
    } else if (weekdayNumber === 5) {
      daysUntilNextStream = 3;
    } else if (weekdayNumber === 6) {
      daysUntilNextStream = 2;
    } else if (weekdayNumber === 7) {
      daysUntilNextStream = 1;
    } else {
      daysUntilNextStream = 1;
    }
    const nextStreamDate = new Date(Date.UTC(year, month - 1, day + daysUntilNextStream, 12));
    const weekday = weekdayFormatter.format(nextStreamDate).toLocaleUpperCase("es-MX");
    liveLabel.textContent = startsToday
      ? `OFFLINE AHORA · PRÓXIMO DIRECTO: HOY, ${weekday} · 6:00 P. M.`
      : `OFFLINE AHORA · PRÓXIMO DIRECTO: ${weekday} · 6:00 P. M.`;
    if (streamCtaLabel) streamCtaLabel.textContent = "VER CANAL EN TWITCH";
    liveStatus.setAttribute("aria-label", liveLabel.textContent);
  }

  updateLiveStatus();
  window.setInterval(updateLiveStatus, 30000);
}

const creatorCarousel = document.querySelector("[data-creator-carousel]");
if (creatorCarousel) {
  const creatorWindow = creatorCarousel.querySelector(".creator-carousel-window");
  const creatorTrack = creatorCarousel.querySelector("[data-creator-track]");
  const previousButton = creatorCarousel.querySelector("[data-creator-prev]");
  const nextButton = creatorCarousel.querySelector("[data-creator-next]");

  function updateCreatorControls() {
    const maxScroll = creatorWindow.scrollWidth - creatorWindow.clientWidth;
    creatorCarousel.classList.toggle("has-overflow", maxScroll > 1);
    previousButton.disabled = creatorWindow.scrollLeft <= 1;
    nextButton.disabled = creatorWindow.scrollLeft >= maxScroll - 1;
  }

  function scrollCreatorHighlights(direction) {
    const firstCard = creatorTrack.querySelector(".creator-video-card");
    const gap = Number.parseFloat(getComputedStyle(creatorTrack).columnGap) || 0;
    const distance = firstCard ? firstCard.getBoundingClientRect().width + gap : creatorWindow.clientWidth;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    creatorWindow.scrollBy({ left: direction * distance, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  previousButton.addEventListener("click", () => scrollCreatorHighlights(-1));
  nextButton.addEventListener("click", () => scrollCreatorHighlights(1));
  creatorWindow.addEventListener("scroll", updateCreatorControls, { passive: true });
  window.addEventListener("resize", updateCreatorControls);
  updateCreatorControls();
}

document.querySelectorAll(".player-photo img").forEach(image => {
  const markImageAsLoaded = () => image.parentElement.classList.add("has-image");
  if (image.complete && image.naturalWidth > 0) {
    markImageAsLoaded();
  } else {
    image.addEventListener("load", markImageAsLoaded, { once: true });
  }
});

const joinMessages = [
  "¿Estás seguro? La última persona que entró sigue buscando el botón de silenciar.",
  "No creo que estés pensando correctamente... ¿ya hablaste con tu sentido común?",
  "El equipo revisó tu solicitud. El equipo se quedó dormido.",
  "¡Solicitud recibida! (Mentira, solo queríamos ver si hacías clic.)",
  "Tu valentía está aprobada. Tu puntería sigue en evaluación.",
  "Un momento, estamos consultando al comité de malas decisiones.",
  "Podrías entrar... pero ya tenemos a alguien encargado de perder.",
  "¿Tienes habilidades? Qué incómodo, aquí nos organizamos por intuición."
];
let previousJoinMessage = -1;

document.querySelectorAll(".join-prank").forEach(button => {
  button.addEventListener("click", () => {
    let messageIndex = Math.floor(Math.random() * joinMessages.length);
    if (joinMessages.length > 1) {
      while (messageIndex === previousJoinMessage) {
        messageIndex = Math.floor(Math.random() * joinMessages.length);
      }
    }
    previousJoinMessage = messageIndex;

    if (window.Swal) {
      window.Swal.fire({
        title: "¿TE QUIERES UNIR?",
        text: joinMessages[messageIndex],
        confirmButtonText: "SEGUIR SOÑANDO",
        showCloseButton: true,
        buttonsStyling: false,
        background: "#0c0d18",
        color: "#f5f2f7",
        backdrop: "rgba(3, 4, 12, .82)",
        customClass: {
          popup: "carnada-swal-popup",
          title: "carnada-swal-title",
          htmlContainer: "carnada-swal-text",
          confirmButton: "carnada-swal-confirm"
        }
      });
    } else {
      window.alert(joinMessages[messageIndex]);
    }
  });
});

document.querySelectorAll(".player-card").forEach(card => {
  const front = card.querySelector(".player-front");
  const back = card.querySelector(".player-back");

  card.querySelectorAll(".player-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const isFlipped = card.classList.toggle("is-flipped");

      if (isFlipped) {
        document.querySelectorAll(".player-card.is-flipped").forEach(openCard => {
          if (openCard === card) return;
          openCard.classList.remove("is-flipped");
          const openFront = openCard.querySelector(".player-front");
          const openBack = openCard.querySelector(".player-back");
          openFront.inert = false;
          openFront.setAttribute("aria-hidden", "false");
          openBack.inert = true;
          openBack.setAttribute("aria-hidden", "true");
          openCard.querySelectorAll(".player-toggle").forEach(toggle => {
            toggle.setAttribute("aria-expanded", "false");
          });
        });
      }

      front.inert = isFlipped;
      front.setAttribute("aria-hidden", String(isFlipped));
      back.inert = !isFlipped;
      back.setAttribute("aria-hidden", String(!isFlipped));
      card.querySelectorAll(".player-toggle").forEach(toggle => {
        toggle.setAttribute("aria-expanded", String(isFlipped));
      });
      (isFlipped ? back : front).querySelector(".player-toggle").focus();
    });
  });
});

// Simple fake countdown for the mockup.
// Replace the target date below with the date of your next real match.
const target = new Date("2026-05-25T21:00:00").getTime();
const countdownEls = document.querySelectorAll(".countdown strong");

function updateCountdown() {
  if (!countdownEls.length) return;

  let distance = target - Date.now();

  // If the mock match has passed, loop it every 7 days so the mockup
  // continues to look alive while you develop the site.
  if (distance < 0) {
    distance = (7 * 24 * 60 * 60 * 1000) + distance;
  }

  const days = Math.floor(distance / 86400000);
  const hours = Math.floor((distance % 86400000) / 3600000);
  const minutes = Math.floor((distance % 3600000) / 60000);
  const seconds = Math.floor((distance % 60000) / 1000);

  [days, hours, minutes, seconds].forEach((value, i) => {
    countdownEls[i].textContent = String(value).padStart(2, "0");
  });
}

updateCountdown();
setInterval(updateCountdown, 1000);

// Reveal-on-scroll effect.
const revealItems = document.querySelectorAll(
  ".player-card, .achievement-grid article, .moment-card, .timeline > div, .stats-grid div"
);

const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.style.opacity = "1";
    entry.target.style.transform = "translateY(0)";
    obs.unobserve(entry.target);
  });
}, { threshold: 0.12 });

revealItems.forEach(item => {
  item.style.opacity = "0";
  item.style.transform = "translateY(18px)";
  item.style.transition = "opacity .55s ease, transform .55s ease";
  observer.observe(item);
});

const sectionsToReveal = document.querySelectorAll("main > section:not(.hero)");
if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

  sectionsToReveal.forEach(section => {
    section.classList.add("section-reveal");
    sectionObserver.observe(section);
  });
} else {
  sectionsToReveal.forEach(section => section.classList.add("is-visible"));
}

// Easter egg: type CARNADA anywhere on the page.
let secret = "";
const secretWord = "carnada";

document.addEventListener("keydown", e => {
  secret += e.key.toLowerCase();
  if (secret.length > secretWord.length) {
    secret = secret.slice(-secretWord.length);
  }

  if (secret === secretWord) {
    document.body.classList.toggle("chaos-mode");
    secret = "";
  }
});
