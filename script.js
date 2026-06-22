const RSVP_ENDPOINT = "https://script.google.com/macros/s/AKfycbzNAhYqU9w5kDTGzXMez8fgmLSvyoGPO_XgTmxkgzIcl-xLFC0DAH-GweEYPLN5ZVerNA/exec";

const ATTENDANCE_LABELS = {
    yes: "Sim",
    no: "Não"
};

const DIET_LABELS = {
    none: "Sem restrições",
    vegetarian: "Vegetariano",
    vegan: "Vegan"
};

const FORM_COPY = {
    pt: {
        attendance: "Conta-nos se vais poder estar presente.",
        mainName: "Escreve o nome do contacto principal.",
        guestName: number => `Escreve o nome do convidado ${number}.`,
        success: "Resposta submetida com sucesso. Obrigado!",
        sendError: "Não foi possível enviar a confirmação. Tenta novamente."
    },
    en: {
        attendance: "Let us know if you will be able to attend.",
        mainName: "Enter the main contact's name.",
        guestName: number => `Enter the name of guest ${number}.`,
        success: "RSVP confirmed.",
        sendError: "We could not send your RSVP. Please try again."
    }
};

function getActiveLanguage() {
    return document.querySelector(".lang-btn.active")?.dataset.lang || "pt";
}

async function openForm(event) {
    event.preventDefault();

    const formEl = document.getElementById("rsvpForm");
    const guestCards = document.querySelectorAll("#guestsContainer > .guest-card");
    const attendanceEl = document.querySelector('input[name="attendance"]:checked');
    const guestCountEl = document.getElementById("guestCount");
    const messageEl = formEl ? formEl.querySelector('textarea[name="message"]') : null;
    const submitButton = formEl ? formEl.querySelector('button[type="submit"]') : null;

    if (!formEl) return;

    const copy = FORM_COPY[getActiveLanguage()];

    clearFormErrors(formEl);
    clearFormStatus(formEl);

    if (!attendanceEl) {
        showFormError(
            formEl.querySelector('fieldset'),
            copy.attendance,
            formEl.querySelector('input[name="attendance"]')
        );
        return;
    }

    const guests = [];

    guestCards.forEach((card, index) => {
        const guestNumber = index + 1;

        const nameEl = card.querySelector(`input[name="name_${guestNumber}"]`);
        const dietEl = card.querySelector(`input[name="diet_${guestNumber}"]:checked`);
        const allergiesEl = card.querySelector(`input[name="allergies_${guestNumber}"]`);

        guests.push({
            guestNumber,
            name: nameEl ? nameEl.value.trim() : "",
            restrictions: dietEl ? DIET_LABELS[dietEl.value] : "",
            allergies: allergiesEl ? allergiesEl.value.trim() : ""
        });
    });

    const mainGuest = guests[0];

    if (!mainGuest || !mainGuest.name) {
        const firstNameInput = guestCards[0].querySelector('input[type="text"]');
        showFormError(
            firstNameInput,
            copy.mainName,
            firstNameInput
        );
        return;
    }

    const invalidGuestIndex = guests.findIndex(guest => !guest.name);

    if (invalidGuestIndex !== -1) {
        const invalidNameInput = guestCards[invalidGuestIndex].querySelector('input[type="text"]');
        showFormError(
            invalidNameInput,
            copy.guestName(invalidGuestIndex + 1),
            invalidNameInput
        );
        return;
    }

    const attendance = ATTENDANCE_LABELS[attendanceEl.value];
    const nrguests = Number(guestCountEl.textContent);
    const message = messageEl ? messageEl.value.trim() : "";

    const data = {
        rows: guests.map(guest => ({
            attendance,
            name: guest.name,
            nrguests,
            restrictions: guest.restrictions,
            allergies: guest.allergies,
            message,
            mainname: mainGuest.name
        }))
    };

    if (submitButton) submitButton.disabled = true;

    try {
        const response = await fetch(RSVP_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erro no envio: ${response.status}`);
        }

        const result = await response.json();

        if (result.result !== "success") {
            throw new Error("Resposta inesperada do servidor");
        }

        formEl.reset();
        showFormStatus(formEl, copy.success, "success");
    } catch (error) {
        console.error("Erro ao enviar:", error);
        showFormStatus(formEl, copy.sendError, "error");
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

function clearFormErrors(formEl) {
    formEl.querySelectorAll(".form-error").forEach(error => error.remove());
    formEl.querySelectorAll(".has-error").forEach(element => {
        element.classList.remove("has-error");
        element.removeAttribute("aria-invalid");
    });
}

function clearFormStatus(formEl) {
    formEl.querySelectorAll(".form-status").forEach(status => status.remove());
}

function showFormStatus(formEl, message, type) {
    clearFormStatus(formEl);

    const statusEl = document.createElement("p");
    statusEl.className = `form-status form-status--${type}`;
    statusEl.setAttribute("role", "status");
    statusEl.textContent = message;
    formEl.appendChild(statusEl);
    statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function showFormError(anchorEl, message, focusEl) {
    if (!anchorEl) return;

    const errorEl = document.createElement("p");
    errorEl.className = "form-error";
    errorEl.textContent = message;

    anchorEl.classList.add("has-error");
    anchorEl.setAttribute("aria-invalid", "true");
    anchorEl.insertAdjacentElement("afterend", errorEl);

    if (focusEl) focusEl.focus({ preventScroll: true });
    anchorEl.scrollIntoView({ behavior: "smooth", block: "center" });
}



document.addEventListener("DOMContentLoaded", () => {
    const rsvpForm = document.getElementById("rsvpForm");
    if (rsvpForm) {
        rsvpForm.addEventListener("submit", openForm);
        rsvpForm.addEventListener("input", event => {
            if (!event.target.matches("input, textarea")) return;
            clearFormErrors(rsvpForm);
            clearFormStatus(rsvpForm);
        });
    }

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

        // Texto normal
        document.querySelectorAll("[data-pt]").forEach(el => {
            if (el.dataset[lang]) {
                el.textContent = el.dataset[lang];
            }
        });

        // Placeholders (INPUTS)
        document.querySelectorAll("[data-pt-placeholder]").forEach(el => {
            const key = `${lang}Placeholder`;
            if (el.dataset[key]) {
                el.placeholder = el.dataset[key];
            }
        });
    }

    function updateCountdown() {
        const weddingDate = new Date("2027-07-29T14:30:00+01:00");
        const remainingTime = Math.max(0, weddingDate.getTime() - Date.now());
        const totalSeconds = Math.floor(remainingTime / 1000);

        const values = {
            days: Math.floor(totalSeconds / 86400),
            hours: Math.floor((totalSeconds % 86400) / 3600),
            minutes: Math.floor((totalSeconds % 3600) / 60),
            seconds: totalSeconds % 60
        };

        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = String(value).padStart(2, "0");
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

    function getCurrentLang() {
        const activeBtn = document.querySelector(".lang-btn.active");
        return activeBtn ? activeBtn.dataset.lang : "pt";
    }

    function applyLanguage(lang) {
        document.querySelectorAll("[data-pt][data-en]").forEach(el => {
            if (el.dataset[lang]) {
                el.textContent = el.dataset[lang];
            }
        });

        document.querySelectorAll("[data-pt-placeholder][data-en-placeholder]").forEach(el => {
            const key = `${lang}Placeholder`;
            if (el.dataset[key]) {
                el.placeholder = el.dataset[key];
            }
        });
    }

    function createGuest(index) {
        return `
            <div class="guest-card">
                <p class="guest-title"
                   data-pt="Convidado ${index}${index === 1 ? " (contacto principal)" : ""}"
                   data-en="Guest ${index}${index === 1 ? " (main contact)" : ""}">
                    Convidado ${index}${index === 1 ? " (contacto principal)" : ""}
                </p>

                <input type="text"
                       name="name_${index}"
                       placeholder="O teu nome"
                       data-pt-placeholder="O teu nome"
                       data-en-placeholder="Full name"
                       required>

                <div class="diet-group">
                    <p class="small-label"
                       data-pt="Preferência alimentar"
                       data-en="Dietary preference">
                        Preferência alimentar
                    </p>

                    <div class="diet-options">
                        <label class="diet-option">
                            <input type="radio" name="diet_${index}" value="none" checked>
                            <span data-pt="Sem restrições" data-en="No restrictions">Sem restrições</span>
                        </label>

                        <label class="diet-option">
                            <input type="radio" name="diet_${index}" value="vegetarian">
                            <span data-pt="Vegetariano" data-en="Vegetarian">Vegetariano</span>
                        </label>

                        <label class="diet-option">
                            <input type="radio" name="diet_${index}" value="vegan">
                            <span data-pt="Vegan" data-en="Vegan">Vegan</span>
                        </label>
                    </div>

                    <input type="text"
                           name="allergies_${index}"
                           class="diet-input"
                           placeholder="Alergias ou intolerâncias (se aplicável)"
                           data-pt-placeholder="Alergias ou intolerâncias (se aplicável)"
                           data-en-placeholder="Allergies or intolerances (if applicable)">
                </div>
            </div>
        `;
    }

    function renderGuests() {
        const lang = getCurrentLang();

        guestCountEl.textContent = guestCount;
        guestsContainer.innerHTML = "";

        for (let i = 1; i <= guestCount; i++) {
            guestsContainer.innerHTML += createGuest(i);
        }

        minusBtn.disabled = guestCount === 1;
        plusBtn.disabled = guestCount === 5;

        applyLanguage(lang);
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

    const rsvpForm = document.getElementById("rsvpForm");
    if (rsvpForm) {
        rsvpForm.addEventListener("reset", () => {
            guestCount = 1;
            setTimeout(renderGuests, 0);
        });
    }

    renderGuests();
});
