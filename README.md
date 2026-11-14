# Phoenix Rise

A women-led movement and wellbeing app prototype with a private, account-scoped backend.

## Open the front end

Open [index.html](./index.html) in a modern browser. It works as a front-end demo without build tools. When the API is unavailable, check-ins stay in the browser.

## Backend source

- `app/api/check-ins/route.ts` provides authenticated read and save endpoints for daily mood, energy and selected symptoms.
- `app/api/posts/route.ts` provides the community feed and queues new posts for review.
- `app/api/health/route.ts` provides a simple service health response.
- `drizzle/` contains the D1 database migrations.

The hosted app uses a private Cloudflare D1 database. Check-ins are scoped to the signed-in Site user ID supplied by the hosting platform; the server never accepts an owner ID from the request body. Optional cycle information stays in the browser and is not sent to the API.

## Prototype limits

This is an early wellbeing pilot, not a clinical service. The live Site remains private. Community posts are queued for moderation, but the app does not yet have a moderator interface, abuse reporting or public multi-user launch controls. Do not use the prototype for urgent medical or mental health support.
