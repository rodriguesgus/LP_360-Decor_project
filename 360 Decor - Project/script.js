(() => {
    "use strict";

    /* ---------- NAVBAR: fundo ao rolar ---------- */
    const navbar = document.getElementById("navbar");
    const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- MENU MOBILE ---------- */
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");

    const setMenu = (open) => {
        links.classList.toggle("open", open);
        toggle.classList.toggle("open", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    };

    toggle.addEventListener("click", () =>
        setMenu(!links.classList.contains("open"))
    );

    links.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => setMenu(false))
    );

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setMenu(false);
    });

    /* ---------- REVEAL AO ROLAR ---------- */
    const revealEls = document.querySelectorAll(".reveal");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || !("IntersectionObserver" in window)) {
        revealEls.forEach((el) => el.classList.add("is-visible"));
    } else {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
        );
        revealEls.forEach((el) => observer.observe(el));
    }

    /* ---------- VÍDEO DO HERO (fallback se o arquivo não existir) ---------- */
    const heroVideoWrap = document.querySelector(".hero-video");
    if (heroVideoWrap) {
        const video = heroVideoWrap.querySelector("video");
        const hide = () => heroVideoWrap.classList.add("is-missing");
        video.addEventListener("error", hide, true);
        video.querySelector("source").addEventListener("error", hide);
        if (video.readyState === 0 && !video.currentSrc) {
            setTimeout(() => {
                if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) hide();
            }, 1500);
        }
    }

    /* ---------- CARROSSÉIS DO PORTFÓLIO ---------- */
    document.querySelectorAll("[data-carousel]").forEach((carousel) => {
        const track = carousel.querySelector(".carousel-track");
        const total = track.children.length;
        let index = 0;

        const go = (i) => {
            index = (i + total) % total;
            track.style.transform = `translateX(-${index * 100}%)`;
        };

        carousel.querySelector(".prev").addEventListener("click", () => go(index - 1));
        carousel.querySelector(".next").addEventListener("click", () => go(index + 1));

        carousel.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") go(index - 1);
            if (e.key === "ArrowRight") go(index + 1);
        });

        /* swipe em telas de toque */
        let startX = 0;
        carousel.addEventListener("touchstart", (e) => {
            startX = e.touches[0].clientX;
        }, { passive: true });
        carousel.addEventListener("touchend", (e) => {
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }, { passive: true });
    });

    /* ---------- ANO NO FOOTER ---------- */
    document.getElementById("year").textContent = new Date().getFullYear();

    /* ---------- FORMULÁRIO DE CONTATO → PIPEFY ---------- */
    const form = document.getElementById("contactForm");
    if (form) {
        const submitBtn = document.getElementById("submitBtn");
        const status = document.getElementById("formStatus");

        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const data = {
                nome: form.nome.value.trim(),
                telefone: form.telefone.value.trim(),
                metragem: form.metragem.value.trim(),
                finalidade: form.finalidade.value,
                predio: form.predio.value.trim(),
                mensagem: form.mensagem.value.trim()
            };

            if (!data.nome || !data.telefone || !data.metragem || !data.finalidade || !data.predio) {
                status.textContent = "Preencha todos os campos obrigatórios.";
                status.className = "form-status error";
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = "Enviando...";
            status.textContent = "";
            status.className = "form-status";

            try {
                const res = await fetch("/api/contato", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                });

                const json = await res.json();

                if (!res.ok || !json.ok) {
                    throw new Error(json.error || "Erro ao enviar.");
                }

                status.textContent = "Mensagem enviada com sucesso! Em breve entraremos em contato.";
                status.className = "form-status success";
                form.reset();
            } catch (err) {
                status.textContent = "Não foi possível enviar. Tente novamente ou fale pelo WhatsApp.";
                status.className = "form-status error";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Enviar Mensagem";
            }
        });
    }
})();
