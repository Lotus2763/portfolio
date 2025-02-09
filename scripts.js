document.addEventListener("DOMContentLoaded", function () {
  const contentDiv = document.getElementById("content");

  function loadSection(section) {
    fetch(`sections/${section}.html`)
      .then((response) => response.text())
      .then((html) => {
        contentDiv.innerHTML = html;
        window.history.pushState(null, null, `#${section}`);

        setupExperienceBlocks();
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

  function setupExperienceBlocks() {
    const blocks = document.querySelectorAll(".experience-block");

    if (blocks.length === 0) return;

    blocks.forEach(block => {
      block.addEventListener("click", function () {
        block.classList.toggle("expanded");
      });
    });
  }
});
