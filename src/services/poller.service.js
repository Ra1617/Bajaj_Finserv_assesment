import { processEvents } from "./processor.service.js";
import logger from "../utils/logger.js";
import {
    DEFAULT_POLL_COUNT,
    DEFAULT_POLL_DELAY_MS,
} from "../constants/app.constants.js";
import { createValidatorClient } from "./validator.client.js";

export const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export async function pollValidator(regNo, options = {}) {
    if (!regNo) {
        throw new Error("regNo is required for polling");
    }

    const client =
        options.client ||
        createValidatorClient({
            baseUrl: options.baseUrl,
            fetchImpl: options.fetchImpl,
        });
    const processEventsFn = options.processEventsFn || processEvents;
    const delayFn = options.delayFn || delay;
    const pollCount = options.pollCount ?? DEFAULT_POLL_COUNT;
    const pollDelayMs = options.pollDelayMs ?? DEFAULT_POLL_DELAY_MS;
    const log = options.logger || logger;
    const processorDeps = options.processorDeps;

    let processedEvents = 0;
    let duplicateEvents = 0;
    let invalidEvents = 0;

    for (let poll = 0; poll < pollCount; poll += 1) {
        const response = await client.getMessages({ regNo, poll });
        const events = Array.isArray(response?.events) ? response.events : [];

        const result = (await processEventsFn(events, processorDeps)) || {};
        processedEvents += result.processed || 0;
        duplicateEvents += result.duplicates || 0;
        invalidEvents += result.invalid || 0;

        log.info(
            `Poll ${poll} completed. processed=${result.processed || 0}, duplicates=${result.duplicates || 0}, invalid=${result.invalid || 0}`
        );

        if (poll < pollCount - 1 && pollDelayMs > 0) {
            await delayFn(pollDelayMs);
        }
    }

    return {
        pollsExecuted: pollCount,
        processedEvents,
        duplicateEvents,
        invalidEvents,
    };
}
