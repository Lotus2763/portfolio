document.addEventListener("DOMContentLoaded", function () {
  const contentDiv = document.getElementById("content");

  function loadSection(section) {
    fetch(`sections/${section}.html`)
      .then((response) => response.text())
      .then((html) => {
        contentDiv.innerHTML = html;
        window.history.pushState(null, null, `#${section}`);

        setupExperienceBlocks();
        setupBlogContent();
        setupContactFormReset();
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

    blocks.forEach((block) => {
      block.addEventListener("click", function () {
        block.classList.toggle("expanded");
      });
    });
  }

  function setupBlogContent() {
    const datesContainer = document.getElementById("blog-dates");
    const contentContainer = document.getElementById("blog-content");

    if (!datesContainer || !contentContainer) return;

    fetch("blogs.json")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          loadDates(data);
          loadContent(data[0]); // Load first blog content by default
        } else {
          contentContainer.innerHTML = "<p>Error: Invalid blog data.</p>";
        }
      })
      .catch(() => {
        contentContainer.innerHTML =
          "<p>Error loading blog data. Please try again later.</p>";
      });

    function loadDates(blogs) {
      datesContainer.innerHTML = "";
      blogs.forEach((blog, index) => {
        const li = document.createElement("li");
        li.textContent = blog.date;
        li.addEventListener("click", () => loadContent(blog));
        datesContainer.appendChild(li);

        if (index === 0) {
          li.classList.add("active-date");
        }
      });
    }

    function loadContent(blog) {
      contentContainer.innerHTML = `<h2>${blog.title}</h2>${blog.content}`;
      document
        .querySelectorAll("#blog-dates li")
        .forEach((li) => li.classList.remove("active-date"));
      [...datesContainer.children]
        .find((li) => li.textContent === blog.date)
        ?.classList.add("active-date");
    }
  }

  /**
   * Function to handle reset button in the contact form
   */
  function setupContactFormReset() {
    const resetButton = document.querySelector(".contact-reset-button");
    const form = document.querySelector(".contact-content-container form");

    if (!resetButton || !form) return;

    resetButton.addEventListener("click", function (event) {
      event.preventDefault();
      form.reset();
    });
  }
});
