/* Everything guest-facing lives here. */
export const CONFIG = {
  date: 'Saturday 26 September 2026',
  time: '6pm onwards',
  // ISO UTC start used to build the "Add to calendar" file — keep in sync with date/time above.
  // 6pm on 26 Sept 2026 is BST (UTC+1), so 17:00 UTC.
  eventStartUTC: '2026-09-26T17:00:00Z',
  eventDurationHours: 6,
  locationTeaser: 'The Secret Lounge',
  locationFull: '8 Ivanhoe Drive, Harrow, Kenton, HA3 8QP', // only shown after someone RSVPs "All in"
  // Shown alongside locationFull, once revealed. `connection` is either a walk
  // time from that station, or the bus that gets you from there to the house.
  transport: [
    { station: 'Harrow & Wealdstone', line: 'Bakerloo line, London Overground & mainline', connection: '15 min walk' },
    { station: 'Kenton', line: 'Bakerloo line & London Overground', connection: 'H19 bus to Kenton Lane, 2 min walk from there' },
    { station: 'Northwick Park', line: 'Metropolitan line', connection: 'H19 bus to Kenton Lane, 2 min walk from there' },
    { station: 'Stanmore', line: 'Jubilee line', connection: '324 bus to Crowshott Avenue, 10 min walk from there' },
    { station: 'Edgware', line: 'Northern line', connection: '186 bus to Belmont Circle, 7 min walk from there' },
    { station: 'Canons Park', line: 'Jubilee line', connection: '186 bus to Belmont Circle, 7 min walk from there' },
  ],
  dressCode: 'Casino themed',
  // Photos live in public/dress-inspo/. Each button opens its set in a viewer.
  dressInspo: [
    {
      label: 'Inspo for her',
      photos: [
        { file: 'her-1.jpg', alt: 'Black halter dress with a cream fur stole and sheer black gloves' },
        { file: 'her-2.jpg', alt: 'Strapless black gown with a black feather wrap and pearl necklace' },
      ],
    },
    {
      label: 'Inspo for him',
      photos: [
        { file: 'him-1.jpg', alt: 'Satin brown shirt with wide black trousers against a red backdrop' },
        { file: 'him-2.jpg', alt: 'Collage of men in dark suits and tailoring' },
        { file: 'him-3.jpg', alt: 'Navy blazer with a striped open-collar shirt' },
      ],
    },
    {
      label: 'Casino mood boards',
      photos: [
        { file: 'mood-1.jpg', alt: 'Casino mood board with tuxedos, evening gowns and a chandelier' },
        { file: 'mood-2.jpg', alt: 'Casino Royale mood board of black and red gowns, fur stoles and gloves' },
      ],
    },
  ],
  donation: {
    charity: 'UNICEF UK',
    appeal: "Children in Gaza Crisis Appeal",
    url: 'https://www.unicef.org.uk/donate/children-in-gaza-crisis-appeal/',
  },
  bringNote:'Bring your own drinks. Lakshaa is providing food and mixers.',
  // Embed URL from an unlisted Vimeo, Mux or Cloudflare Stream video, e.g.
  // 'https://player.vimeo.com/video/123456789?autoplay=1'
  videoEmbedUrl: 'https://www.youtube.com/embed/8Tq4T2bG2BE?autoplay=1&rel=0',
  // Google Apps Script web app URL (appends each RSVP as a row in the sheet)
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbwPCq5Qvo6CexA0sHmbsDe-yHqzQi1S0KodlrX0pKojw3K-IG_HkOS2ALvZMyvbJC7l/exec',
};
