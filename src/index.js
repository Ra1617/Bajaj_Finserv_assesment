import { runPipeline } from "./jobs/poller.job.js";

async function main() {
    const result = await runPipeline();
    console.log("Pipeline finished");
    console.log(JSON.stringify(result.validatorResponse, null, 2));
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
