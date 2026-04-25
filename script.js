const targetDate = new Date("2027-07-29T15:00:00").getTime();

function updateCountdown() {
    const now = Date.now();
    const distance = targetDate - now;

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    if (distance <= 0) {
        daysEl.innerText = "0";
        hoursEl.innerText = "0";
        minutesEl.innerText = "0";
        secondsEl.innerText = "0";
        return;
    }

    daysEl.innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
    hoursEl.innerText = Math.floor((distance / (1000 * 60 * 60)) % 24);
    minutesEl.innerText = Math.floor((distance / (1000 * 60)) % 60);
    secondsEl.innerText = Math.floor((distance / 1000) % 60);
}

function openForm() {
    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const guestsEl = document.getElementById("guests");
    const messageEl = document.getElementById("message");
    const formEl = document.getElementById("rsvpForm");
    const attendanceEl = document.querySelector('input[name="attendance"]:checked');

    const name = nameEl ? nameEl.value.trim() : "";
    const email = emailEl ? emailEl.value.trim() : "";
    const guests = guestsEl ? guestsEl.value : "";
    const message = messageEl ? messageEl.value.trim() : "";

    if (!name || !attendanceEl) {
        alert("Preenche pelo menos o nome e a presença.");
        return;
    }

    const data = {
        name,
        email,
        attendance: attendanceEl.value,
        guests,
        message
    };

    fetch("https://script.google.com/macros/s/AKfycbzNAhYqU9w5kDTGzXMez8fgmLSvyoGPO_XgTmxkgzIcl-xLFC0DAH-GweEYPLN5ZVerNA/exec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) throw new Error("Erro no envio");
            return response.text();
        })
        .then(() => {
            alert("Presença confirmada com sucesso 💛");
            if (formEl) formEl.reset();
        })
        .catch(error => {
            console.error("Erro ao enviar:", error);
            alert("Erro ao enviar. Tenta novamente.");
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const introOverlay = document.getElementById("introOverlay");
    const introVideo = document.getElementById("introVideo");
    const music = document.getElementById("music");
    const soundToggle = document.getElementById("sound-toggle");
    const langSwitch = document.querySelector(".lang-switch");
    const buttons = document.querySelectorAll(".lang-btn");

    let introStarted = false;
    let fadeInterval = null;

    function updateSoundButton() {
        if (!soundToggle || !music) return;

        if (music.paused) {
            soundToggle.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 5L6 9H3v6h3l5 4V5Z"></path>
                <path d="M15 9C16.5 10.5 16.5 13.5 15 15"></path>
                <path d="M17.5 7C20 9.5 20 14.5 17.5 17"></path>
                <path d="M3 3L21 21"></path>
            </svg>
        `;
        } else {
            soundToggle.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 5L6 9H3v6h3l5 4V5Z"></path>
                <path d="M15 9C16.5 10.5 16.5 13.5 15 15"></path>
                <path d="M17.5 7C20 9.5 20 14.5 17.5 17"></path>
            </svg>
        `;
        }
    }

    function fadeMusicIn() {
        if (!music) return;

        if (fadeInterval) {
            clearInterval(fadeInterval);
        }

        let volume = music.volume;

        if (volume >= 0.15) {
            music.volume = 0.15;
            return;
        }

        fadeInterval = setInterval(() => {
            volume += 0.02;

            if (volume >= 0.15) {
                music.volume = 0.15;
                clearInterval(fadeInterval);
                fadeInterval = null;
            } else {
                music.volume = volume;
            }
        }, 120);
    }

    async function playMusic() {
        if (!music) return;

        try {
            if (music.paused) {
                if (music.currentTime === 0) {
                    music.volume = 0;
                }

                await music.play();
                fadeMusicIn();
            }
        } catch (error) {
            console.error("Erro ao reproduzir música:", error);
        }

        updateSoundButton();
    }

    async function handleIntroClick() {
        if (!introOverlay || !introVideo || introStarted) return;

        introStarted = true;

        try {
            introOverlay.classList.add("is-playing");
            document.body.style.overflow = "hidden";

            await playMusic();
            await introVideo.play();
        } catch (error) {
            console.error("Erro ao iniciar o vídeo:", error);
            introOverlay.classList.add("is-hidden");
            document.body.style.overflow = "";

            if (soundToggle) {
                soundToggle.style.display = "flex";
            }

            if (langSwitch) {
                langSwitch.style.display = "flex";
            }
        }
    }

    function handleIntroEnd() {
        if (!introOverlay) return;

        introOverlay.classList.add("is-fading");

        if (soundToggle) {
            soundToggle.style.display = "flex";
        }

        if (langSwitch) {
            langSwitch.style.display = "flex";
        }

        setTimeout(() => {
            introOverlay.classList.add("is-hidden");
            document.body.style.overflow = "";
        }, 1200);
    }

    function handleSoundToggle() {
        if (!music) return;

        if (music.paused) {
            music.play()
                .then(() => {
                    if (music.volume < 0.15) {
                        fadeMusicIn();
                    }
                    updateSoundButton();
                })
                .catch(error => {
                    console.error("Erro ao alternar música:", error);
                });
        } else {
            music.pause();
            updateSoundButton();
        }
    }

    function handleLanguageSwitch(event) {
        const btn = event.currentTarget;
        const lang = btn.dataset.lang;

        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        document.querySelectorAll("[data-pt]").forEach(el => {
            if (el.dataset[lang]) {
                el.textContent = el.dataset[lang];
            }
        });
    }

    if (introVideo) {
        introVideo.pause();
        introVideo.currentTime = 0;
    }

    if (music) {
        music.pause();
        music.currentTime = 0;
        music.volume = 0;
    }

    if (soundToggle) {
        soundToggle.style.display = "none";
    }

    if (langSwitch) {
        langSwitch.style.display = "none";
    }

    if (introOverlay && introVideo) {
        introOverlay.addEventListener("click", handleIntroClick);
        introVideo.addEventListener("ended", handleIntroEnd);
    } else {
        if (soundToggle) {
            soundToggle.style.display = "flex";
        }

        if (langSwitch) {
            langSwitch.style.display = "flex";
        }
    }

    if (soundToggle && music) {
        soundToggle.addEventListener("click", handleSoundToggle);
    }

    if (buttons.length) {
        buttons.forEach(btn => {
            btn.addEventListener("click", handleLanguageSwitch);
        });
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
    updateSoundButton();
});

document.addEventListener("DOMContentLoaded", () => {
    const track = document.getElementById("welcomeTrack");
    const dotsContainer = document.getElementById("welcomeDots");
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");

    if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

    const slides = Array.from(track.querySelectorAll(".welcome-photo"));
    let currentIndex = 0;
    let autoSlide;

    function updateCarousel() {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        const dots = dotsContainer.querySelectorAll(".carousel-dot");
        dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
        });
    }

    function goToSlide(index) {
        currentIndex = (index + slides.length) % slides.length;
        updateCarousel();
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoSlide() {
        stopAutoSlide();
        autoSlide = setInterval(nextSlide, 4000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlide);
    }

    slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.className = "carousel-dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Ir para imagem ${index + 1}`);
        dot.addEventListener("click", () => {
            goToSlide(index);
            startAutoSlide();
        });
        dotsContainer.appendChild(dot);
    });

    nextBtn.addEventListener("click", () => {
        nextSlide();
        startAutoSlide();
    });

    prevBtn.addEventListener("click", () => {
        prevSlide();
        startAutoSlide();
    });

    let startX = 0;
    let endX = 0;

    track.addEventListener("touchstart", (e) => {
        startX = e.changedTouches[0].clientX;
    });

    track.addEventListener("touchend", (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 40) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            startAutoSlide();
        }
    });

    updateCarousel();
    startAutoSlide();
});

document.addEventListener("DOMContentLoaded", () => {
    const minusBtn = document.querySelector(".counter-btn.minus");
    const plusBtn = document.querySelector(".counter-btn.plus");
    const guestCountEl = document.getElementById("guestCount");
    const guestsContainer = document.getElementById("guestsContainer");

    if (!minusBtn || !plusBtn || !guestCountEl || !guestsContainer) {
        console.warn("Contador: elementos não encontrados");
        return;
    }

    let guestCount = Number(guestCountEl.textContent) || 1;

    function createGuest(index) {
        return `
            <div class="guest-card">
                <p class="guest-title">
                    Convidado ${index}${index === 1 ? " (contacto principal)" : ""}
                </p>

                <input type="text"
                       name="name_${index}"
                       placeholder="O teu nome"
                       required>

                <div class="diet-group">
                    <p class="small-label">Restrições alimentares</p>

                    <div class="diet-options">
                        <label class="diet-option">
                            <input type="radio" name="diet_${index}" value="none" checked>
                            <span>Sem restrições</span>
                        </label>

                        <label class="diet-option">
                            <input type="radio" name="diet_${index}" value="vegetarian">
                            <span>Vegetariano</span>
                        </label>

                        <label class="diet-option">
                            <input type="radio" name="diet_${index}" value="vegan">
                            <span>Vegan</span>
                        </label>
                    </div>

                    <input type="text"
                           name="allergies_${index}"
                           class="diet-input"
                           placeholder="Ex.: alergia a frutos secos, marisco...">
                </div>
            </div>
        `;
    }

    function renderGuests() {
        guestCountEl.textContent = guestCount;
        guestsContainer.innerHTML = "";

        for (let i = 1; i <= guestCount; i++) {
            guestsContainer.innerHTML += createGuest(i);
        }

        minusBtn.disabled = guestCount === 1;
        plusBtn.disabled = guestCount === 5;
    }

    minusBtn.addEventListener("click", () => {
        if (guestCount > 1) {
            guestCount--;
            renderGuests();
        }
    });

    plusBtn.addEventListener("click", () => {
        if (guestCount < 5) {
            guestCount++;
            renderGuests();
        }
    });

    renderGuests();
});
