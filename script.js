// 1) Tungi rejim: sahifa chizilishidan oldin darhol yoqiladi.
//    Avval saqlangan tanlov, bo'lmasa kompyuter sozlamasi (tungi/kunduzgi) olinadi.
(function () {
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.setAttribute("data-theme", saved || (prefersDark ? "dark" : "light"));
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
