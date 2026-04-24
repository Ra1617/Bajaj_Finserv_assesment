export function createLeaderboardRepository(initialData = {}) {
    const scoreMap = new Map(Object.entries(initialData));

    return {
        async updateScore(participant, score) {
            const current = scoreMap.get(participant) || 0;
            scoreMap.set(participant, current + score);
        },
        async getLeaderboard() {
            return [...scoreMap.entries()]
                .map(([participant, totalScore]) => ({ participant, totalScore }))
                .sort((a, b) => {
                    if (b.totalScore !== a.totalScore) {
                        return b.totalScore - a.totalScore;
                    }

                    return a.participant.localeCompare(b.participant);
                });
        },
        async getTotalScore() {
            let total = 0;
            for (const value of scoreMap.values()) {
                total += value;
            }
            return total;
        },
        reset() {
            scoreMap.clear();
        },
    };
}

export const defaultLeaderboardRepository = createLeaderboardRepository();

export async function updateScore(participant, score) {
    return defaultLeaderboardRepository.updateScore(participant, score);
}

export async function getLeaderboard() {
    return defaultLeaderboardRepository.getLeaderboard();
}

export async function getTotalScore() {
    return defaultLeaderboardRepository.getTotalScore();
}

export function resetLeaderboardRepository() {
    defaultLeaderboardRepository.reset();
}
