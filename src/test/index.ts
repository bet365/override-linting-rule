import * as tslint from "tslint";

/// Reduce the folders we check by passing this in, useful for debugging
let folderSpecific: string;
if (process.argv.indexOf("--targetFolder") > -1) {
    folderSpecific = process.argv[process.argv.indexOf("--targetFolder") + 1];
}

/**
 * This project has a dependancy on the TypeChecker, as such it must be passed in.
 */

const configurationFilename = "tslint.json";
const options = {
    fix: false,
    formatter: "stylish",
    rulesDirectory: "../",
};

// Create a single reference to the program, this speeds up the linting process significantly.
const program = tslint.Linter.createProgram("tsconfig.json", "./");
const linter = new tslint.Linter(options, program);

// Allow the program itself to pull out the required files
const files = tslint.Linter.getFileNames(program);
/// Lint the files individually, but with a passed in program.
files.forEach(fileName => {
    if (folderSpecific && fileName.indexOf(folderSpecific) === -1) {
        return;
    }
    
    /// This is now as normal.
    const fileContents = program.getSourceFile(fileName).getFullText();
    const configuration = tslint.Configuration.findConfiguration(configurationFilename, fileName).results;
    linter.lint(fileName, fileContents, configuration);
});

/// Output any errors.
if (linter.getResult().errorCount) {
    console.log(linter.getResult().output);
}
