import assert from "node:assert/strict";

import { createEventRepository } from "../src/repositories/event.repo.js";
import {
    createLeaderboardRepository,
    resetLeaderboardRepository,
} from "../src/repositories/leaderboard.repo.js";
import { processEvents } from "../src/services/processor.service.js";
import { pollValidator } from "../src/services/poller.service.js";
import { runPipeline } from "../src/jobs/poller.job.js";
import { createLogger } from "../src/utils/logger.js";
import { resetEventRepository } from "../src/repositories/event.repo.js";

const logger = createLogger({ silent: true });

const tests = [];

function addTest(name, fn) {
    tests.push({ name, fn });
}

addTest(
    "deduplicates by roundId + participant and aggregates leaderboard",
    async () => {
        const eventRepo = createEventRepository();
        const leaderboardRepo = createLeaderboardRepository();

        const events = [
            { roundId: "R1", participant: "Alice", score: 10 },
            { roundId: "R1", participant: "Bob", score: 20 },
            { roundId: "R1", participant: "Alice", score: 10 },
            { roundId: "R2", participant: "Alice", score: 30 },
        ];

        const result = await processEvents(events, {
            saveEventIfNotExists: eventRepo.saveEventIfNotExists,
            updateScore: leaderboardRepo.updateScore,
        });

        const leaderboard = await leaderboardRepo.getLeaderboard();
        const totalScore = await leaderboardRepo.getTotalScore();

        assert.deepEqual(result, { processed: 3, duplicates: 1, invalid: 0 });
        assert.deepEqual(leaderboard, [
            { participant: "Alice", totalScore: 40 },
            { participant: "Bob", totalScore: 20 },
        ]);
        assert.equal(totalScore, 60);
    }
);

addTest("polls exactly 10 times with poll range 0..9 and 5s delay policy", async () => {
    const calls = [];
    const delays = [];

    const client = {
        async getMessages({ regNo, poll }) {
            calls.push({ regNo, poll });
            return { events: [] };
        },
    };

    const summary = await pollValidator("2024CS101", {
        client,
        pollCount: 10,
        pollDelayMs: 5000,
        delayFn: async (ms) => delays.push(ms),
        processEventsFn: async () => ({ processed: 0, duplicates: 0, invalid: 0 }),
        logger,
    });

    assert.equal(summary.pollsExecuted, 10);
    assert.equal(calls.length, 10);
    assert.deepEqual(
        calls.map((entry) => entry.poll),
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    );
    assert.equal(delays.length, 9);
    assert.ok(delays.every((ms) => ms === 5000));
});

addTest("submits once with correct leaderboard and total score", async () => {
    resetEventRepository();
    resetLeaderboardRepository();

    let submitCount = 0;
    let submittedPayload = null;
    const pollCalls = [];

    const eventsByPoll = new Map([
        [
            0,
            [
                { roundId: "R1", participant: "Alice", score: 10 },
                { roundId: "R1", participant: "Bob", score: 20 },
            ],
        ],
        [
            1,
            [
                { roundId: "R1", participant: "Alice", score: 10 },
                { roundId: "R1", participant: "Bob", score: 20 },
            ],
        ],
        [2, [{ roundId: "R2", participant: "Alice", score: 30 }]],
    ]);

    const client = {
        async getMessages({ poll }) {
            pollCalls.push(poll);
            return { events: eventsByPoll.get(poll) || [] };
        },
        async submitLeaderboard(payload) {
            submitCount += 1;
            submittedPayload = payload;

            const submittedTotal = payload.leaderboard.reduce(
                (sum, row) => sum + row.totalScore,
                0
            );

            return {
                isCorrect: true,
                isIdempotent: submitCount === 1,
                submittedTotal,
                expectedTotal: 60,
                message: "Correct!",
            };
        },
    };

    const result = await runPipeline({
        config: {
            regNo: "2024CS101",
            baseUrl: "https://example.org",
            pollCount: 10,
            pollDelayMs: 5000,
        },
        client,
        delayFn: async () => {},
        logger,
    });

    assert.equal(pollCalls.length, 10);
    assert.equal(submitCount, 1);
    assert.deepEqual(submittedPayload, {
        regNo: "2024CS101",
        leaderboard: [
            { participant: "Alice", totalScore: 40 },
            { participant: "Bob", totalScore: 20 },
        ],
    });
    assert.equal(result.computedTotal, 60);
    assert.equal(result.validatorResponse.submittedTotal, 60);
    assert.equal(result.validatorResponse.expectedTotal, 60);
});

async function run() {
    let passed = 0;

    for (const testCase of tests) {
        try {
            await testCase.fn();
            passed += 1;
            console.log(`PASS: ${testCase.name}`);
        } catch (error) {
            console.error(`FAIL: ${testCase.name}`);
            console.error(error.stack || error.message || error);
            process.exit(1);
        }
    }

    console.log(`\n${passed}/${tests.length} tests passed.`);
}

run();
