let body = document.querySelector("body");
let navbar = document.querySelector(".navbar");
let cards = document.querySelectorAll(".card");
let githubButtons = document.querySelectorAll(".github");
let toggle = document.querySelector("#toggle");

toggle.onclick = function toggleDarkMode() {
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
    }
}