import runCli from "./cli/cli-game";
import runUci from "./uci/uci";

const args = process.argv.slice(2);
if (args.length > 0 && args[0] === "uci") {
    console.log("Starting UCI engine...");
    await runUci();
}
else {
    await runCli();
}