(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  const setupLocalCleanUrlFallback = () => {
    const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
    if (!localHosts.has(window.location.hostname)) return;

    const routes = new Set([
      "/",
      "/quem-somos",
      "/o-que-fazemos",
      "/ped",
      "/esg",
      "/certificacoes",
      "/fornecedores",
      "/contato",
      "/carreiras",
      "/en/",
      "/en/quem-somos",
      "/en/o-que-fazemos",
      "/en/ped",
      "/en/esg",
      "/en/certificacoes",
      "/en/fornecedores",
      "/en/contato",
      "/en/carreiras",
    ]);

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || !routes.has(url.pathname)) {
        return;
      }

      event.preventDefault();
      const filePath =
        url.pathname === "/"
          ? "/index.html"
          : url.pathname === "/en/"
            ? "/en/index.html"
            : `${url.pathname}.html`;
      window.location.assign(`${filePath}${url.search}${url.hash}`);
    });
  };

  const syncHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 18);
  };

  const setupHeader = () => {
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (!toggle || !nav) return;

    const isEnglish = document.documentElement.lang === "en";
    const labels = isEnglish
      ? { open: "Open menu", close: "Close menu" }
      : { open: "Abrir menu", close: "Fechar menu" };

    const setMenuState = (isOpen) => {
      nav.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? labels.close : labels.open);
      document.body.classList.toggle("menu-open", isOpen);
    };

    const closeMenu = () => setMenuState(false);

    setMenuState(false);

    toggle.addEventListener("click", () => {
      setMenuState(!nav.classList.contains("open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (
        nav.classList.contains("open") &&
        !nav.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        closeMenu();
        toggle.focus();
      }
    });

    // Ao voltar para o layout desktop, garante que o menu mobile não fique aberto.
    window.matchMedia("(min-width: 901px)").addEventListener("change", (e) => {
      if (e.matches) closeMenu();
    });
  };

  const setupRevealAnimations = () => {
    const revealObserver =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add("visible");
                  revealObserver.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.12 },
          )
        : null;

    document.querySelectorAll(".reveal").forEach((element) => {
      if (revealObserver) {
        revealObserver.observe(element);
      } else {
        element.classList.add("visible");
      }
    });
  };

  const getFieldLabel = (form, fieldName) => {
    const field = form.elements.namedItem(fieldName);
    const labelElement = field?.id
      ? form.querySelector(`label[for="${field.id}"]`)
      : null;

    return (labelElement?.textContent || fieldName.replaceAll("_", " "))
      .replace(/\s*\*+\s*$/, "")
      .trim();
  };

  const buildMailtoUrl = (form, data) => {
    const recipient = form.dataset.recipient;
    const label = form.dataset.formLabel || "Contato pelo site";
    const lines = [];

    for (const [name, rawValue] of data.entries()) {
      if (/consent/i.test(name)) continue;

      const value = String(rawValue).trim();
      if (!value) continue;

      const readable = getFieldLabel(form, name);
      lines.push(`${readable}: ${value}`);
    }

    const sender =
      data.get("nome") || data.get("empresa") || data.get("name") || "";
    const subject = `${label}${sender ? " — " + sender : ""}`;
    const footer =
      document.documentElement.lang === "en"
        ? "Sent from the Boreal Plating website."
        : "Enviado pelo site da Boreal Plating.";

    return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n") + "\n\n" + footer)}`;
  };

  const setupForms = () => {
    document.querySelectorAll("form[data-recipient]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        // Campos obrigatórios (incluindo o consentimento LGPD) usam a validação nativa.
        if (!form.reportValidity()) {
          return;
        }

        const data = new FormData(form);
        window.location.href = buildMailtoUrl(form, data);
      });
    });
  };

  setupLocalCleanUrlFallback();
  setupHeader();
  setupRevealAnimations();
  setupForms();
})();
