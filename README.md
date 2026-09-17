# Lakshaa's 24th · Casino Royale

Invite site for the party. It opens on a live 3D roulette wheel that spins and lands on 24. Below that are the invite video, the event details as tilting playing cards, and an RSVP table where guests flip a casino chip.

Built with Vite, React 19, TypeScript, Tailwind CSS v4, and three.js via react-three-fiber.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build locally
```

## Before sending the link

Every guest-facing detail lives in `src/config.ts`:

| Field | What to put there |
| --- | --- |
| `date`, `time`, `dressCode` | Shown in the hero and on the playing cards |
| `locationTeaser` | Shown to everyone |
| `locationFull` | Only revealed after someone RSVPs "All in" |
| `videoEmbedUrl` | Embed URL of an unlisted Vimeo, Mux or Cloudflare Stream video. Leave it empty and the player shows "Transmission incoming" |
| `rsvpEndpoint` | A Google Apps Script web app URL bound to the guest-list sheet. Each RSVP (timestamp, name, All in/Fold, contact) is appended as a row, and if `contact` looks like an email, the script emails the party details to it |

Test one RSVP yourself after deploying and check the row lands in the sheet — the request is sent `no-cors`, so the site can't confirm the write itself.

### Apps Script (paste into Extensions → Apps Script on the sheet)

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = JSON.parse(e.postData.contents);
  const contact = data.contact || '';
  sheet.appendRow([new Date(), data.name, data.attending, contact]);

  if (data.attending === 'All in' && contact.indexOf('@') !== -1 && data.details) {
    MailApp.sendEmail({
      to: contact,
      subject: "Lakshaa's 24th — Casino Royale",
      body: data.details,
    });
  }

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Redeploy (Deploy → Manage deployments → edit → New version) after pasting this in, so the live URL picks up the change. Apps Script's free `MailApp` quota is 100 emails/day on a personal Gmail account — plenty for a guest list, but worth knowing if this URL is ever reused for something bigger. A phone number in `contact` is stored in the sheet for your reference but nothing is sent to it — see the project notes if you want to add real SMS/WhatsApp sending later, which needs a paid third-party account (e.g. Twilio).

## Deploy

**Vercel or Netlify (easiest):** push to GitHub, import the repo, and keep the defaults (build `npm run build`, output `dist`).

**GitHub Pages:** run `npm run build` and publish `dist/`, for example with the `peaceiris/actions-gh-pages` action. Asset paths are relative (`base: './'`), so a `/repo-name/` sub-path works as is.

## Project layout

```
src/
  config.ts                 party details, video + RSVP endpoints
  App.tsx                   page order
  index.css                 Tailwind theme, gold/felt styles, chip + card 3D CSS
  components/
    Hero.tsx                headline over the 3D scene; loads it lazily, pauses it off-screen
    CasinoScene.tsx         roulette wheel, ball, floating chips and cards (three.js)
    SceneBoundary.tsx       falls back to the gradient if WebGL is unavailable
    VideoInvite.tsx         gold-framed video player
    Details.tsx             pointer-tilt playing cards
    RsvpTable.tsx           felt table with flipping 3D chips, posts to a Google Apps Script endpoint
    Reveal.tsx              scroll-triggered fade-in wrapper used across sections
```

## Notes

- The ball always lands on `WINNING_NUMBER` (24) in `CasinoScene.tsx`. The spin length is `SPIN_SECONDS`.
- three.js loads in its own chunk after the text paints, so the headline appears instantly on slow connections.
- Visitors with "reduce motion" turned on see the wheel already settled, with no floating or flipping animations.
