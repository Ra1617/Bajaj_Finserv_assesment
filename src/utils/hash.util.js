export function buildEventUniqueKey(event) {
    return `${event.roundId}::${event.participant}`;
}
