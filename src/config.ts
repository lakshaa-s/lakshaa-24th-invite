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
  dressCode: 'Black-tie inspired',
  // Embed URL from an unlisted Vimeo, Mux or Cloudflare Stream video, e.g.
  // 'https://player.vimeo.com/video/123456789?autoplay=1'
  videoEmbedUrl: '',
  // Google Apps Script web app URL (appends each RSVP as a row in the sheet)
  rsvpEndpoint: 'https://script.google.com/macros/s/AKfycbwPCq5Qvo6CexA0sHmbsDe-yHqzQi1S0KodlrX0pKojw3K-IG_HkOS2ALvZMyvbJC7l/exec',
};
