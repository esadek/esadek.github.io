var body = document.querySelector("body");
var navbar = document.querySelector(".navbar");
var cards = document.querySelectorAll(".card");
var githubButtons = document.querySelectorAll(".github");
var toggle = document.querySelector("#toggle");

function toggleDarkMode() {
    if (body.classList.contains("bg-light")) {
        // Switch to dark mode
        body.classList.remove("bg-light");
        body.classList.add("bg-dark", "text-light");
        navbar.classList.remove("navbar-light", "bg-light");
        navbar.classList.add("navbar-dark", "bg-dark");
        cards.forEach(
            function(card) {
                card.classList.remove("bg-light");
                card.classList.add("bg-dark", "border-secondary");
            }
        );
        githubButtons.forEach(
            function(button) {
                button.classList.remove("btn-outline-dark")
                button.classList.add("btn-outline-light");
            }
        );
        toggle.innerHTML = "<i class=\"fas fa-sun\"></i>";
    } else {
        // Switch to light mode
        body.classList.remove("bg-dark", "text-light");
        body.classList.add("bg-light");
        navbar.classList.remove("navbar-dark", "bg-dark");
        navbar.classList.add("navbar-light", "bg-light");
        cards.forEach(
            function(card) {
                card.classList.remove("bg-dark", "border-secondary");
                card.classList.add("bg-light");
            }
        );
        githubButtons.forEach(
            function(button) {
                button.classList.remove("btn-outline-light")
                button.classList.add("btn-outline-dark");
            }
        );
        toggle.innerHTML = "<i class=\"fas fa-moon\"></i>";
    }
}