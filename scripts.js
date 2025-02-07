document.addEventListener("DOMContentLoaded", function () {
  const contentDiv = document.getElementById("content");

  function loadSection(section) {
    fetch(`sections/${section}.html`)
      .then((response) => response.text())
      .then((html) => {
        contentDiv.innerHTML = html;
        window.history.pushState(null, null, `#${section}`);
      })
      .catch(() => {
        contentDiv.innerHTML = "<p>Loading failed, please try again later.</p>";
      });
  }

  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const section = this.getAttribute("href").substring(1);
      loadSection(section);
    });
  });

  const initialSection = location.hash.substring(1) || "home";
  loadSection(initialSection);
});
