import {
    DEFAULT_BASE_URL,
    QUIZ_MESSAGES_PATH,
    QUIZ_SUBMIT_PATH,
} from "../constants/app.constants.js";

function ensureFetch(fetchImpl) {
    if (typeof fetchImpl !== "function") {
        throw new Error(
            "Fetch API is unavailable. Use Node 18+ or inject fetchImpl/client for tests."
        );
    }
}

async function parseJsonResponse(response) {
    const text = await response.text();
    if (!text) {
        return {};
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Invalid JSON response. Status: ${response.status}`);
    }
}

function buildUrl(baseUrl, path, query) {
    const url = new URL(path, `${baseUrl}/`);
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            url.searchParams.set(key, String(value));
        }
    }
    return url.toString();
}

export function createValidatorClient({
    baseUrl = DEFAULT_BASE_URL,
    fetchImpl = globalThis.fetch,
} = {}) {
    ensureFetch(fetchImpl);

    return {
        async getMessages({ regNo, poll }) {
            const response = await fetchImpl(
                buildUrl(baseUrl, QUIZ_MESSAGES_PATH, { regNo, poll }),
                { method: "GET" }
            );

            const data = await parseJsonResponse(response);
            if (!response.ok) {
                throw new Error(
                    `GET /quiz/messages failed with ${response.status}: ${JSON.stringify(data)}`
                );
            }

            return data;
        },
        async submitLeaderboard(payload) {
            const response = await fetchImpl(buildUrl(baseUrl, QUIZ_SUBMIT_PATH), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await parseJsonResponse(response);
            if (!response.ok) {
                throw new Error(
                    `POST /quiz/submit failed with ${response.status}: ${JSON.stringify(data)}`
                );
            }

            return data;
        },
    };
}
