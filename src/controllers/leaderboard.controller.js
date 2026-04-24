import {
    getLeaderboard as getLeaderboardFromRepo,
    getTotalScore as getTotalScoreFromRepo,
    updateScore as updateScoreInRepo,
} from "../repositories/leaderboard.repo.js";

export async function updateScore(participant, score) {
    return updateScoreInRepo(participant, score);
}

export async function getLeaderboard() {
    return getLeaderboardFromRepo();
}

export async function getTotalScore() {
    return getTotalScoreFromRepo();
}
