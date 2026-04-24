import {
    DEFAULT_BASE_URL,
    DEFAULT_POLL_COUNT,
    DEFAULT_POLL_DELAY_MS,
} from "../constants/app.constants.js";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function loadDotEnvValues(cwd = process.cwd()) {
    const envPath = path.join(cwd, ".env");
    if (!existsSync(envPath)) {
        return {};
    }

    const content = readFileSync(envPath, "utf8");
    const parsed = {};

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) {
            continue;
        }

        const index = line.indexOf("=");
        if (index <= 0) {
            continue;
        }

        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim();
        parsed[key] = value;
    }

    return parsed;
}

function parseNumber(value, fallbackValue) {
    if (value === undefined || value === null || value === "") {
        return fallbackValue;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) {
        return fallbackValue;
    }

    return parsed;
}

export function getEnvConfig(env = process.env) {
    const fileEnv = loadDotEnvValues();
    const mergedEnv = { ...fileEnv, ...env };

    const regNo = mergedEnv.REG_NO?.trim();
    if (!regNo) {
        throw new Error("REG_NO is required");
    }

    return {
        regNo,
        baseUrl: (mergedEnv.BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ""),
        pollCount: parseNumber(mergedEnv.POLL_COUNT, DEFAULT_POLL_COUNT),
        pollDelayMs: parseNumber(
            mergedEnv.POLL_DELAY_MS,
            DEFAULT_POLL_DELAY_MS
        ),
    };
}
