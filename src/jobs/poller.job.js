import { pollValidator } from "../services/poller.service.js";
import { submitResults } from "../services/submission.service.js";
import { getEnvConfig } from "../config/env.js";
import logger from "../utils/logger.js";
import { createValidatorClient } from "../services/validator.client.js";

export async function runPipeline(options = {}) {
    const config = options.config || getEnvConfig(options.env);
    const log = options.logger || logger;

    const client =
        options.client ||
        createValidatorClient({
            baseUrl: config.baseUrl,
            fetchImpl: options.fetchImpl,
        });

    const pollSummary = await pollValidator(config.regNo, {
        client,
        processEventsFn: options.processEventsFn,
        processorDeps: options.processorDeps,
        delayFn: options.delayFn,
        pollCount: config.pollCount,
        pollDelayMs: config.pollDelayMs,
        logger: log,
    });

    const submissionResult = await submitResults(config.regNo, {
        client,
        logger: log,
        getLeaderboardFn: options.getLeaderboardFn,
        getTotalScoreFn: options.getTotalScoreFn,
    });

    return {
        pollSummary,
        payload: submissionResult.payload,
        computedTotal: submissionResult.computedTotal,
        validatorResponse: submissionResult.response,
    };
}
