# Quiz Leaderboard System

Implementation for the SRM internship assignment:
- Poll validator `GET /quiz/messages` exactly 10 times (`poll=0..9`)
- Keep a 5-second delay between poll requests
- Deduplicate events by `roundId + participant`
- Aggregate participant scores
- Build leaderboard sorted by `totalScore` descending
- Compute total score across all users
- Submit once to `POST /quiz/submit`

## Project Structure

- `src/config`: environment and repository wiring
- `src/constants`: URLs and polling constants
- `src/repositories`: in-memory stores for dedupe and leaderboard
- `src/services`: polling, processing, submission, and validator client
- `src/jobs`: pipeline orchestration
- `src/utils`: logger and unique-key builder
- `tests`: assignment-focused automated tests

## Run

1. Ensure Node.js 18+ is installed.
2. Update `.env` values if needed:
   - `REG_NO`
   - `BASE_URL`
   - `POLL_COUNT` (default `10`)
   - `POLL_DELAY_MS` (default `5000`)
3. Run:

```bash
npm run run
```

## Test

```bash
npm test
```

Tests cover the requirements from the question paper:
- Poll count, `poll` range, and delay policy
- Duplicate handling using `roundId + participant`
- Leaderboard sorting and score aggregation
- Total score correctness
- Single submission behavior
