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

  // Hero rasmi: fayl topilmasa, rasm yashiriladi va "SB" ko'rinadi
  var photo = document.getElementById("heroPhoto");
  function hidePhoto() { photo.style.display = "none"; }
  photo.addEventListener("error", hidePhoto);
  if (photo.complete && photo.naturalWidth === 0) hidePhoto();

  // Pastdagi © yili
  document.getElementById("year").textContent = new Date().getFullYear();
});
