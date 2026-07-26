'use client';

export function NewsletterForm() {
  return (
    <form
      className="solar-loyalty-card__form"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Your email address"
        className="solar-loyalty-card__input"
        aria-label="Email address"
      />
      <button type="submit" className="solar-loyalty-card__btn">
        Subscribe
      </button>
    </form>
  );
}
