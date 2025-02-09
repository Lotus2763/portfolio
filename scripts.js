document.addEventListener("DOMContentLoaded", function () {
  const contentDiv = document.getElementById("content");

  /**
   * Function to load a section dynamically
   */
  function loadSection(section) {
    fetch(`sections/${section}.html`)
      .then((response) => response.text())
      .then((html) => {
        contentDiv.innerHTML = html;
        window.history.pushState(null, null, `#${section}`);

        // Setup Experience Page Interactions
        setupExperienceBlocks();

        // If the blog section is loaded, fetch and display blog content
        if (section === "blog") {
          setupBlogContent();
        }
      })
      .catch(() => {
        contentDiv.innerHTML = "<p>Loading failed, please try again later.</p>";
      });
  }

  /**
   * Event listener for navigation links
   */
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const section = this.getAttribute("href").substring(1);
      loadSection(section);
    });
  });

  // Load the initial section based on URL hash or default to "home"
  const initialSection = location.hash.substring(1) || "home";
  loadSection(initialSection);

  /**
   * Function to handle experience block interactions
   */
  function setupExperienceBlocks() {
    const blocks = document.querySelectorAll(".experience-block");

    if (blocks.length === 0) return;

    blocks.forEach(block => {
      block.addEventListener("click", function () {
        block.classList.toggle("expanded");
      });
    });
  }

  /**
   * Function to fetch and display blog content
   */
  function setupBlogContent() {
    const datesContainer = document.getElementById("blog-dates");
    const contentContainer = document.getElementById("blog-content");

    if (!datesContainer || !contentContainer) return;

    fetch("blogs.json")
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          loadDates(data);
          loadContent(data[0]); // Load the first blog content by default
        } else {
          contentContainer.innerHTML = "<p>Error: Invalid blog data.</p>";
        }
      })
      .catch(() => {
        contentContainer.innerHTML = "<p>Error loading blog data. Please try again later.</p>";
      });

    /**
     * Function to load blog dates in the sidebar
     */
    function loadDates(blogs) {
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

    /**
     * Function to load blog content when a date is clicked
     */
    function loadContent(blog) {
      contentContainer.innerHTML = `<h2>${blog.title}</h2><p>${blog.content}</p>`;

      document.querySelectorAll("#blog-dates li").forEach(li => li.classList.remove("active-date"));
      [...datesContainer.children].find(li => li.textContent === blog.date)?.classList.add("active-date");
    }
  }
});
