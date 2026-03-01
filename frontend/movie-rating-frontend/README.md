# Movie Rating Frontend

React + Vite client for browsing, searching, rating, and reviewing movies/shows.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run preview` — preview build output
- `npm run lint` — ESLint checks
- `npm run test` — Vitest (single run)
- `npm run test:watch` — Vitest watch mode

## Architecture Notes

- Routing is defined in `src/App.jsx`
- Auth-protected pages are wrapped with `src/components/PrivateRoute.jsx`
- API helpers live in `src/api`
- Shared UI/utilities live in `src/components` and `src/utils`

## Project Documentation

- Docs index: `../../docs/README.md`
- System architecture: `../../docs/system-architecture.md`
- Data model: `../../docs/data-model.md`
- API contract: `../../docs/api-contract.md`
- Non-functional requirements: `../../docs/non-functional-requirements.md`
- Frontend commenting standard: `../../docs/frontend-commenting-standard.md`

## Testing

- Test setup file: `src/__tests__/setup.js`
- Example test suite: `src/__tests__/adminContext.test.jsx`
- Vitest configuration is in `vite.config.js`
