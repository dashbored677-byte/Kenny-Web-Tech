# Life in Akwa Ibom — playable browser prototype

A mobile-friendly life-simulation game prototype built with HTML, CSS and vanilla JavaScript.

## Run it

1. Download and extract the project folder.
2. Open `index.html` in a modern browser. No build step is required.
3. Create a character and play.

If your browser restricts local file features, run a simple local server from this folder, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Included features

- Character name and avatar selection
- Virtual wallet, energy, happiness, reputation, XP and levels
- Job shifts with energy costs and virtual payments
- City exploration with first-visit rewards
- Businesses that can be purchased and manually collect game income
- Virtual housing progression
- Daily missions and reward claiming
- Local browser save, character editing and JSON save export
- Responsive desktop and mobile layouts

## Prototype limitations

- Progress is stored locally in the current browser/device; there are no user accounts or cloud saves.
- There is no real multiplayer, live chat, payments, real-money economy, or server-side anti-cheat.
- The locations and economy are fictionalized game representations, not official government services, real property listings, or real job offers.
- The city illustration uses CSS shapes and emoji; original custom art and a true navigable map can be added in later versions.
- Google Fonts are loaded online; system fonts will be used if unavailable.

## Suggested next production steps

1. User authentication and cloud saves using a secure backend.
2. Server-side game state and validation before introducing competitive play.
3. Original character art, animations, sound design, and richer map environments.
4. Accessibility and cross-device QA, analytics with appropriate consent, privacy policy, terms, and moderation design before a public launch.
