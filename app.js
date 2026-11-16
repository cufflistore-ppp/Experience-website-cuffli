function toggleMenu() {
  const nav = document.getElementById("navLinks");
  if (nav) nav.classList.toggle("open");
}

// Close menu when clicking outside on mobile
document.addEventListener("click", function(e) {
  const nav = document.getElementById("navLinks");
  const toggle = document.querySelector(".menu-toggle");
  if (nav && toggle && !nav.contains(e.target) && !toggle.contains(e.target)) {
    nav.classList.remove("open");
  }
});

// Simple active link highlight based on current page
document.addEventListener("DOMContentLoaded", function() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
});