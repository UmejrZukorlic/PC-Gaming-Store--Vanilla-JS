export function bindNewsletterForm() {
  document.querySelector(".newsletter-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = event.target.querySelector(".newsletter-input");
    if (input) input.value = "";
    alert("Thanks for subscribing!");
  });
}

