import { saveEventIfNotExists } from "../repositories/event.repo.js";
import { updateScore } from "../repositories/leaderboard.repo.js";
import { buildEventUniqueKey } from "../utils/hash.util.js";

function isValidEvent(event) {
    return (
        event &&
        typeof event.roundId === "string" &&
        event.roundId.length > 0 &&
        typeof event.participant === "string" &&
        event.participant.length > 0 &&
        Number.isFinite(Number(event.score))
    );
}

export async function processEvents(events = [], deps = {}) {
    const saveEventIfNotExistsFn =
        deps.saveEventIfNotExists || saveEventIfNotExists;
    const updateScoreFn = deps.updateScore || updateScore;
    const buildUniqueKey = deps.buildEventUniqueKey || buildEventUniqueKey;

    let processed = 0;
    let duplicates = 0;
    let invalid = 0;

    for (const event of events) {
        if (!isValidEvent(event)) {
            invalid += 1;
            continue;
        }

        const uniqueKey = buildUniqueKey(event);

        const isNew = await saveEventIfNotExistsFn(event, uniqueKey);

        if (isNew) {
            await updateScoreFn(event.participant, Number(event.score));
            processed += 1;
        } else {
            duplicates += 1;
        }
    }

    return { processed, duplicates, invalid };
}
