document.addEventListener("DOMContentLoaded", function () {
  const contentDiv = document.getElementById("content");
  const nameLogo = document.getElementById("h1-logo");
  const menuBtn = document.getElementById("menu-btn");
  const navMenu = document.getElementById("nav-menu");
  const menuBackdrop = document.getElementById("menu-backdrop");

  function loadSection(section) {
    fetch(`sections/${section}.html`)
      .then((response) => response.text())
      .then((html) => {
        contentDiv.innerHTML = html;
        window.history.pushState(null, null, `#${section}`);

        setupExperienceBlocks();
        setupBlogContent();
        setupContactFormReset();

        // only setup the contact form submission if the section is contact
        if (section === "contact") {
          setupContactFormSubmission();
        }
        // only setup the photography photo grid if the section is photography
        if (section === "photography") {
          setupPhotographyPhotoGrid();
        }

        //Mobile: Automatically close the menu after clicking on the menu item
        if (window.innerWidth <= 768) {
          navMenu.classList.remove("show-menu");
        }
      })
      .catch(() => {
        contentDiv.innerHTML = "<p>Loading failed, please try again later.</p>";
      });
  }

  /* Handle name logo to jump back to home page */
  function jumpBackToHome() {
    loadSection("home");
  }
  if (nameLogo) {
    nameLogo.addEventListener("click", jumpBackToHome);
  }

  // Handle menu button click
  if (menuBtn) {
    menuBtn.addEventListener("click", function (event) {
      event.stopPropagation();
      navMenu.classList.toggle("show-menu");
    });
  }

  // Mobile: Automatically closes the menu after clicking on the menu item
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const section = this.getAttribute("href").substring(1);
      loadSection(section);

      if (window.innerWidth <= 768) {
        navMenu.classList.remove("show-menu");
      }
    });
  });

  // Mobile: Automatically closes the menu after clicking out of the menu item
  document.addEventListener("click", function (event) {
    const isClickInsideMenu = navMenu.contains(event.target);
    const isClickOnMenuBtn = menuBtn.contains(event.target);

    if (!isClickInsideMenu && !isClickOnMenuBtn) {
      navMenu.classList.remove("show-menu");
    }
  });

  // Load the initial section
  const initialSection = location.hash.substring(1) || "home";
  loadSection(initialSection);
});

/**
 * Experience blocks
 */
function setupExperienceBlocks() {
  const blocks = document.querySelectorAll(".experience-block");
  if (blocks.length === 0) return;

  blocks.forEach((block) => {
    block.addEventListener("click", function () {
      block.classList.toggle("expanded");
    });
  });
}

/**
 * Function to fetch Blog content from blogs.json
 */
function setupBlogContent() {
  const datesContainer = document.getElementById("blog-dates");
  const contentContainer = document.getElementById("blog-content");
  const blogRightContent = document.querySelector(".blog-right-content");
  const scrollTopBtn = document.getElementById("blog-scroll-top-btn");

  if (!datesContainer || !contentContainer) return;
  if (!blogRightContent || !scrollTopBtn) return;

  fetch("data/blogs.json")
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
      li.addEventListener("click", function () {
        loadContent(blog);

        // Remove active class from all list items
        document.querySelectorAll(".blog-left-content li").forEach((item) => {
          item.classList.remove("active");
        });

        // Add active class to the clicked item
        this.classList.add("active");
      });

      datesContainer.appendChild(li);

      if (index === 0) {
        li.classList.add("active");
      }
    });
  }

  function loadContent(blog) {
    contentContainer.innerHTML = `<h2>${blog.title}</h2>${blog.content}`;
  }

  /* Handle scroll to top button */
  blogRightContent.addEventListener("scroll", function () {
    if (blogRightContent.scrollTop > 200) {
      scrollTopBtn.classList.add("show");
    } else {
      scrollTopBtn.classList.remove("show");
    }
  });

  scrollTopBtn.addEventListener("click", function () {
    blogRightContent.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
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

/*
 * Function to handle submit message to formspree
 */
function setupContactFormSubmission() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const submitButton = form.querySelector(".contact-submit-button");
    submitButton.textContent = "Submitting...";

    try {
      const response = await fetch("https://formspree.io/f/xnnjzkqq", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        alert("Message sent successfully! ✅");
        form.reset();
      } else {
        alert("Oops! Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again later.");
    } finally {
      submitButton.textContent = "Submit";
    }
  });
}

/**
 * Photography grid and lightbox with lazy loading
 */
function setupPhotographyPhotoGrid() {
  const lightbox = document.getElementById("photography-lightbox");
  const lightboxImg = document.getElementById("photography-lightbox-img");
  const closeBtn = document.querySelector(".photography-close");

  // Get the spinner and finishedBanner elements
  const spinner = document.getElementById("loading-spinner");
  const finishedBanner = document.getElementById("finished-banner");

  if (!lightbox || !lightboxImg || !closeBtn) {
    console.error("Lightbox elements not found!");
    return;
  }

  fetch("data/images.json")
    .then((response) => response.json())
    .then((data) => {
      const athleticsData = data.athletics || [];
      const eventsData = data.events || [];

      let athleticsIndex = 0;
      let eventsIndex = 0;

      const athleticsGrid = document.getElementById("athletics-grid");
      const eventsGrid = document.getElementById("events-grid");
      if (!athleticsGrid || !eventsGrid) {
        console.error("Photography grids not found!");
        return;
      }

      const BATCH_SIZE = 6;

      // Initial load
      loadMoreAthletics();
      loadMoreEvents();

      const mainElement = document.querySelector("main");
      if (!mainElement) {
        console.error("Main element not found");
        return;
      }

      // Scroll listener
      mainElement.addEventListener("scroll", () => {
        console.log("Scrolling inside main...");

        if (
          mainElement.scrollTop + mainElement.clientHeight >=
          mainElement.scrollHeight - 50
        ) {
          console.log("检测到触底了");
          loadMoreAthletics();
          loadMoreEvents();
        }
      });

      // Load athletics images
      function loadMoreAthletics() {
        // If already all loaded, do nothing
        if (athleticsIndex >= athleticsData.length) {
          checkAllLoaded();
          return;
        }

        // Show spinner before starting load
        showSpinner();

        const endIndex = athleticsIndex + BATCH_SIZE;
        const slice = athleticsData.slice(athleticsIndex, endIndex);

        // Simulate async load (optional)
        // If you want to see the spinner, you can wrap this in a setTimeout:
        // setTimeout(() => { ... }, 1000);

        slice.forEach((item) => {
          const img = document.createElement("img");
          img.src = item.src;
          img.alt = item.alt;
          img.className = "thumbnail";

          // If load fails
          img.onerror = function () {
            console.warn("Image failed to load:", this.src);
            this.style.display = "none";
          };

          // Lightbox
          img.addEventListener("click", function () {
            lightbox.style.display = "flex";
            lightboxImg.src = this.src;
          });

          athleticsGrid.appendChild(img);
        });

        // Update index
        athleticsIndex = endIndex;

        // Hide spinner after finishing insertion
        hideSpinner();

        checkAllLoaded();
      }

      // Load events images
      function loadMoreEvents() {
        if (eventsIndex >= eventsData.length) {
          checkAllLoaded();
          return;
        }

        showSpinner();

        const endIndex = eventsIndex + BATCH_SIZE;
        const slice = eventsData.slice(eventsIndex, endIndex);
        slice.forEach((item) => {
          const img = document.createElement("img");
          img.src = item.src;
          img.alt = item.alt;
          img.className = "thumbnail";

          img.onerror = function () {
            console.warn("Image failed to load:", this.src);
            this.style.display = "none";
          };

          img.addEventListener("click", function () {
            lightbox.style.display = "flex";
            lightboxImg.src = this.src;
          });

          eventsGrid.appendChild(img);
        });

        eventsIndex = endIndex;

        hideSpinner();

        checkAllLoaded();
      }

      // Spinner control
      function showSpinner() {
        if (spinner) {
          spinner.style.display = "block";
        }
      }

      function hideSpinner() {
        if (spinner) {
          spinner.style.display = "none";
        }
      }

      // Check if all images have been loaded
      function checkAllLoaded() {
        // If both categories have reached the end, show "finished" banner
        const allAthleticsLoaded = athleticsIndex >= athleticsData.length;
        const allEventsLoaded = eventsIndex >= eventsData.length;
        if (allAthleticsLoaded && allEventsLoaded) {
          showFinishedBanner();
        }
      }

      // Show a banner for a few seconds to indicate everything is loaded
      function showFinishedBanner() {
        if (finishedBanner) {
          finishedBanner.style.display = "block";
          // Hide after 3 seconds (for example)
          setTimeout(() => {
            finishedBanner.style.display = "none";
          }, 3000);
        }
      }

      // Lightbox close
      closeBtn.addEventListener("click", function () {
        lightbox.style.display = "none";
      });
      lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) {
          lightbox.style.display = "none";
        }
      });
    })
    .catch((error) => {
      console.error("Failed to load images.json", error);
    });
}
