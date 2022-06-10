const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const fs = require("fs");

async function execa(cmd, options) {
    const { stdout, stderr } = await exec(`${cmd} ${options.join(" ")}`);
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
}


(async () => {
  try {
    // await execa("git", ["checkout", "--orphan", "gh-pages"]);
    console.log("Building...");
    await execa("npm", ["run", "build"]);
    // Understand if it's dist or build folder
    const folderName = fs.existsSync("dist") ? "dist" : "build";
    await execa("git", ["--work-tree", folderName, "add", "--all"]);
    await execa("git", ["--work-tree", folderName, "commit", "-m", "gh-pages"]);
    console.log("Pushing to gh-pages...");
    await execa("git", ["push", "origin", "HEAD:gh-pages", "--force"]);
    // await execa("rm", ["-r", folderName]);
    try {
        fs.rmdirSync(folderName, { recursive: true });
    
        console.log(`${folderName} is deleted!`);
    } catch (err) {
        console.error(`Error while deleting ${folderName}.`);
    }

    await execa("git", ["checkout", "-f", "main"]);
    await execa("git", ["branch", "-D", "gh-pages"]);
    console.log("Successfully deployed");
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
})();