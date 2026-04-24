export function createEventRepository(initialKeys = []) {
    const seenKeys = new Set(initialKeys);

    return {
        async saveEventIfNotExists(_event, uniqueKey) {
            if (seenKeys.has(uniqueKey)) {
                return false;
            }

            seenKeys.add(uniqueKey);
            return true;
        },
        hasProcessed(uniqueKey) {
            return seenKeys.has(uniqueKey);
        },
        count() {
            return seenKeys.size;
        },
        reset() {
            seenKeys.clear();
        },
    };
}

export const defaultEventRepository = createEventRepository();

export async function saveEventIfNotExists(event, uniqueKey) {
    return defaultEventRepository.saveEventIfNotExists(event, uniqueKey);
}

export function resetEventRepository() {
    defaultEventRepository.reset();
}
