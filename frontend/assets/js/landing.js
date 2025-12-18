document.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
        const answer = btn.nextElementSibling;
        const isOpen = answer.style.display === "block";

        // cierra todos
        document.querySelectorAll(".faq-a").forEach(a => a.style.display = "none");

        // abre el actual si estaba cerrado
        answer.style.display = isOpen ? "none" : "block";
    });
});