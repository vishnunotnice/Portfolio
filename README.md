# Vishnu Moguluri — Portfolio

A static 12-page website. No installation or build step is required.

## Open locally
Open `index.html` in your browser. All internal links and assets use relative paths.

## Customize
- Edit the text in each HTML file. All pages have their own content.
- Change colors and typography at the top of `styles.css`.
- Header/footer markup is copied into each HTML file: update all pages when changing navigation.
- Search for `[VERIFY_LINK]`, `[GITHUB_URL]`, `[DEMO_URL]`, `[LINKEDIN_URL]`, `[EMAIL]`, `[YOUTUBE_CHANNEL_URL]`, `[YOUTUBE_URL]`, `[VIDEO_TITLE]`, `[DATE]`, `[YEAR]`, `[ACHIEVEMENT_TITLE]`, and `[DESCRIPTION]`.
- Replace each placeholder span with a real `<a href="https://...">Label</a>` only when you have the correct URL. Use `mailto:your@email.com` for email. Placeholder controls are intentionally inactive.
- All illustrations are editable inline SVGs; no external images are used. Fonts use Google Fonts with local fallbacks.
- Built project capabilities and planned work are separate. Keep that distinction when editing.

## Contact form
The form checks required fields and email format, but sends nothing. Its confirmation clearly states this. To enable Formspree, create a form there, add its endpoint as `action`, and replace the preview submit handler in `main.js` with a real fetch request. Display a sent confirmation only after a successful response. For Netlify Forms, add `name="contact" method="POST" data-netlify="true"` and a hidden `form-name` input, then implement the submission flow. A working delivery service is required.

## Deploy free with GitHub Pages
1. Create a GitHub repository and upload the contents of this folder (put `index.html` at the root).
2. In Settings → Pages, choose Deploy from a branch, then your main branch and root folder.
3. Save and use the URL GitHub provides. Nested pages retain their relative links.
4. For a custom domain, follow the current GitHub Pages domain setup instructions and enable HTTPS when available.

## Deploy with Netlify
Upload this folder in Netlify's manual deploy interface, or connect the repository. No build command; publish the folder containing `index.html`. Free-tier availability is subject to the provider's current terms.

## Page map
- `/index.html`
- `/about/index.html`
- `/certifications/index.html`
- `/skills/index.html`
- `/projects/index.html`
- `/projects/lablink/index.html`
- `/projects/netscope/index.html`
- `/projects/mcon/index.html`
- `/youtube/index.html`
- `/qualifications/index.html`
- `/achievements/index.html`
- `/contact/index.html`

## Theme reference
Visual direction adapted from Jhanvi Shah’s Illustration Based Portfolio Website Template:
https://www.figma.com/community/file/1318529372146880502/illustration-based-portfolio-website-template
Reference inspected through the designer’s Behance presentation. This implementation retains its own content and original inline SVG artwork; it is not a pixel-for-pixel export of the Figma file.
