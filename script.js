// 1) Tungi rejim: sahifa chizilishidan oldin darhol yoqiladi.
//    Avval saqlangan tanlov, bo'lmasa kompyuter sozlamasi (tungi/kunduzgi) olinadi.
(function () {
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));

  // Animatsiyalar faqat JavaScript ishlasa va foydalanuvchi "harakatni kamaytirish"ni yoqmagan bo'lsa yoqiladi.
  // Aks holda hamma narsa odatdagidek darhol ko'rinadi.
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) document.documentElement.classList.add("anim");
})();

// 2) Sahifa yuklangandan keyin ishlaydigan qismlar
document.addEventListener("DOMContentLoaded", function () {
  // Tungi / kunduzgi rejim tugmasi
  document.getElementById("themeToggle").addEventListener("click", function () {
    var root = document.documentElement;
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // Telefondagi menyu: "☰" bosilganda ochiladi, havola bosilganda yopiladi
  var nav = document.querySelector(".nav");
  var menuBtn = document.getElementById("menuToggle");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));
  function setMenu(open) {
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
  links.forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  // Menyuda hozir ekranda turgan bo'limni yashil qilib belgilash
  function markActive() {
    var current = null;
    links.forEach(function (a) {
      var target = document.querySelector(a.getAttribute("href"));
      if (target && target.getBoundingClientRect().top <= 120) current = a;
    });
    // Sahifa oxiriga yetganda oxirgi havola belgilanadi
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = links[links.length - 1];
    }
    links.forEach(function (a) { a.classList.toggle("active", a === current); });
  }
  window.addEventListener("scroll", markActive, { passive: true });
  markActive();

  // Scroll qilganda bo'limlar pastdan yumshoq ko'tarilib chiqadi (har biri bir marta)
  if (document.documentElement.classList.contains("anim")) {
    var revealItems = document.querySelectorAll(
      ".section-title h2, .service-inner, .projects h2, .project, " +
      ".reviews h2, .review, .faq h2, .faq-list, footer > *"
    );
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("visible");
        revealObserver.unobserve(el);
        // Animatsiya tugagach yordamchi klasslar olib tashlanadi, karta o'zining hover effektiga qaytadi
        el.addEventListener("transitionend", function done(e) {
          if (e.target !== el || e.propertyName !== "opacity") return;
          el.classList.remove("reveal", "visible");
          el.style.removeProperty("--d");
          el.removeEventListener("transitionend", done);
        });
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    revealItems.forEach(function (el) {
      // Bir qatordagi kartalar ketma-ket chiqadi: har biri 0.08 soniya keyin
      if (el.matches(".project, .review")) {
        var index = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.setProperty("--d", (index * 0.08) + "s");
      }
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
  }

  // Savol-javob akkordeon: javob silliq ochiladi/yopiladi, bir vaqtda faqat bittasi ochiq
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq details"));
  var smoothFaq = document.documentElement.classList.contains("anim");
  // Animatsiya paytida ham to'g'ri ishlashi uchun "ochiq bo'lishi kerakmi" alohida saqlanadi
  function isOpen(item) { return item._want === undefined ? item.open : item._want; }
  function setFaq(item, open) {
    var answer = item.querySelector("p");
    item._want = open;
    item.classList.toggle("closing", !open); // o'q va chegara darhol "yopiq" holatga o'tadi
    if (item._anim) { item._anim.cancel(); item._anim = null; }
    if (!smoothFaq || !answer.animate) { item.open = open; item.classList.remove("closing"); return; }
    item.open = true; // o'lchash uchun javob ko'rinib turishi kerak
    var shut = { height: "0px", paddingBottom: "0px", opacity: 0 };
    var full = { height: answer.offsetHeight + "px", paddingBottom: getComputedStyle(answer).paddingBottom, opacity: 1 };
    var anim = answer.animate(open ? [shut, full] : [full, shut], { duration: 250, easing: "ease-out" });
    item._anim = anim;
    anim.onfinish = function () {
      item._anim = null;
      if (!open) { item.open = false; item.classList.remove("closing"); }
    };
  }
  faqItems.forEach(function (item) {
    item.querySelector("summary").addEventListener("click", function (e) {
      e.preventDefault();
      var open = !isOpen(item);
      if (open) {
        // Yangi savol ochilganda boshqa ochiq javoblar yopiladi
        faqItems.forEach(function (other) {
          if (other !== item && isOpen(other)) setFaq(other, false);
        });
      }
      setFaq(item, open);
    });
  });

  // Hero rasmi: fayl topilmasa, rasm yashiriladi va "SB" ko'rinadi
  var photo = document.getElementById("heroPhoto");
  function hidePhoto() { photo.style.display = "none"; }
  photo.addEventListener("error", hidePhoto);
  if (photo.complete && photo.naturalWidth === 0) hidePhoto();

  // Ishlarim kartalaridagi rasm topilmasa, rasm yashiriladi va ikonka ko'rinadi
  document.querySelectorAll(".project-cover img").forEach(function (img) {
    function hide() { img.style.display = "none"; }
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });

  // Pastdagi © yili
  document.getElementById("year").textContent = new Date().getFullYear();
});
