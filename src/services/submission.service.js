import {
    getLeaderboard,
    getTotalScore,
} from "../repositories/leaderboard.repo.js";
import logger from "../utils/logger.js";
import { createValidatorClient } from "./validator.client.js";

export async function submitResults(regNo, options = {}) {
    if (!regNo) {
        throw new Error("regNo is required for submission");
    }

    const client =
        options.client ||
        createValidatorClient({
            baseUrl: options.baseUrl,
            fetchImpl: options.fetchImpl,
        });
    const getLeaderboardFn = options.getLeaderboardFn || getLeaderboard;
    const getTotalScoreFn = options.getTotalScoreFn || getTotalScore;
    const log = options.logger || logger;

    const leaderboard = await getLeaderboardFn();
    const totalScore = await getTotalScoreFn();

    const payload = {
        regNo,
        leaderboard,
    };

    const response = await client.submitLeaderboard(payload);

    log.info(
        `Submission complete. submittedTotal=${response?.submittedTotal}, computedTotal=${totalScore}`
    );

    return { payload, response, computedTotal: totalScore };
}
