# Git Trends

A Next.js app for exploring GitHub trending repositories and running custom
repository searches with filters, sorting, and pagination.

## Features

- Trending repositories by time range: daily, weekly, monthly
- Language filter and paginated results
- Search repositories by keyword with sort options (stars, forks, updated, help wanted)
- Client-side GitHub API fetching (compatible with static export)

## Tech Stack

- Next.js App Router
- React 19
- SWR for data fetching
- Tailwind CSS

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Scripts

- `npm run dev` – Start the dev server
- `npm run build` – Build for production
- `npm run start` – Run the production server

## Notes

- GitHub Search API rate limits apply. Unauthenticated requests may be limited
  and can return `403` errors when exceeded.

## License

See `LICENSE`.
