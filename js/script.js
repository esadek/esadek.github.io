var body = document.querySelector("body")
var navbar = document.querySelector(".navbar")
var cards = document.querySelectorAll(".card")
var githubButtons = document.querySelectorAll(".github")
var toggle = document.querySelector("#toggle")

function toggleDarkMode() {
    if (body.classList.contains("bg-light")) {
        // Switch to dark mode
        body.className = "bg-dark text-light"
        navbar.className = "navbar navbar-expand-lg navbar-dark bg-dark"
        cards.forEach(
            function(card) {
                card.classList.add("bg-dark", "border-secondary")
            }
        );
        githubButtons.forEach(
            function(button) {
                button.classList.remove("btn-outline-dark")
                button.classList.add("btn-outline-light")
            }
        );
        toggle.innerHTML = "<i class=\"fas fa-sun\"></i>"
    } else {
        // Switch to light mode
        body.className = "bg-light"
        navbar.className = "navbar navbar-expand-lg navbar-light bg-light"
        cards.forEach(
            function(card) {
                card.classList.remove("bg-dark", "border-secondary")
            }
        );
        githubButtons.forEach(
            function(button) {
                button.classList.remove("btn-outline-light")
                button.classList.add("btn-outline-dark")
            }
        );
        toggle.innerHTML = "<i class=\"fas fa-moon\"></i>"
    }
}