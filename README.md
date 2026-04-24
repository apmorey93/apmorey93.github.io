# Aditya Morey Portfolio

Static personal portfolio for Aditya Morey, focused on AI hardware, DFX/DFT, silicon debug, post-silicon validation, and product-minded platform engineering.

## Preview

Open `index.html` directly in a browser, or run a tiny local server from this folder:

```powershell
python -m http.server 5173
```

Then visit `http://localhost:5173`.

## Future Updates With AI

For future edits, point Codex, Claude Code, Gemini, or another coding assistant at this repo and ask it to read `AGENTS.md` first.

Example prompt:

```text
You are editing my static portfolio website.
First read `AGENTS.md` and `README.md`.
Make this change: <your change>.
Keep the site mobile friendly and GitHub Pages compatible.
Do not edit files outside this repo.
```

## GitHub Pages Deploy

Recommended personal-site option:

1. Create a new GitHub repo named `<your-github-username>.github.io`.
2. Push this folder's contents to that repo's `main` branch.
3. GitHub Pages will serve it at `https://<your-github-username>.github.io/`.

Project-site option:

1. Create a repo with any name, for example `portfolio`.
2. Push this folder's contents to the repo.
3. In GitHub, go to `Settings > Pages`.
4. Set source to `Deploy from a branch`, branch `main`, folder `/root`.
5. The site will be available at `https://<your-github-username>.github.io/<repo>/`.

## Other Static Hosts

Netlify: publish this folder.

Vercel: framework preset `Other`; output directory is this folder.
