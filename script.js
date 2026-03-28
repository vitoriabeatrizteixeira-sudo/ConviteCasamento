const targetDate = new Date("July 29, 2027 15:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    document.getElementById("days").innerText = days;
    document.getElementById("hours").innerText = hours;
    document.getElementById("minutes").innerText = minutes;
    document.getElementById("seconds").innerText = seconds;
}

setInterval(updateCountdown, 1000);
updateCountdown();

function openForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const guests = document.getElementById("guests").value;
    const message = document.getElementById("message").value.trim();

    const attendance = document.querySelector('input[name="attendance"]:checked');

    if (!name || !attendance) {
        alert("Preenche pelo menos o nome e a presença.");
        return;
    }

    const data = {
        name: name,
        email: email,
        attendance: attendance.value,
        guests: guests,
        message: message
    };

    fetch("https://script.google.com/macros/s/AKfycbzNAhYqU9w5kDTGzXMez8fgmLSvyoGPO_XgTmxkgzIcl-xLFC0DAH-GweEYPLN5ZVerNA/exec", {
        method: "POST",
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(() => {
            alert("Presença confirmada com sucesso ??");
            document.getElementById("rsvpForm").reset();
        })
        .catch(() => {
            alert("Erro ao enviar. Tenta novamente.");
        });
}
