import { defaultEventRepository } from "../repositories/event.repo.js";
import { defaultLeaderboardRepository } from "../repositories/leaderboard.repo.js";

const db = {
    eventRepository: defaultEventRepository,
    leaderboardRepository: defaultLeaderboardRepository,
};

export default db;
