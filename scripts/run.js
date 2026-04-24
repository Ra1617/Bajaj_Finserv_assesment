import { runPipeline } from "../src/jobs/poller.job.js";

async function start() {
    const result = await runPipeline();
    console.log("Run complete");
    console.log(JSON.stringify(result.validatorResponse, null, 2));
}

start().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
