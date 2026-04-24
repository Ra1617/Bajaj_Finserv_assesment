export function createLogger({ silent = false } = {}) {
    const noOp = () => {};

    return {
        info: silent ? noOp : console.log,
        warn: silent ? noOp : console.warn,
        error: silent ? noOp : console.error,
    };
}

const logger = createLogger();

export default logger;
