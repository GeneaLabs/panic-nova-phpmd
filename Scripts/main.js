exports.activate = function() {
    if (nova.config.get('genealabs.phpmd.debugging', 'boolean')) {
        console.log("Extension is activated.");
    }

    var process = new Process("/usr/bin/env", {
        args: ["chmod", "+x", "./Bin/phpmd"],
        shell: true
    });
    process.onStderr(function(line) {console.error(line);});
    process.start();
}

exports.deactivate = function() {
    if (nova.config.get('genealabs.phpmd.debugging', 'boolean')) {
        console.log("Extension is being deactivated.");
    }
}

class IssuesProvider {
    constructor() {
    }

    getStandard() {
        let customStandard = nova.path.join(nova.workspace.path, "phpmd.xml");
        let projectStandard = nova.workspace.config.get(
            'genealabs.phpmd.standard',
            'string'
        );
        let globalStandard = nova.config.get(
            'genealabs.phpmd.standard',
            'string'
        );
        let defaultStandard = "cleancode,codesize,controversial,design,naming,unusedcode";

        customStandard = nova.fs.stat(customStandard) != undefined
            ? customStandard
            : null;

        let selectedStandard = (((projectStandard || customStandard) || globalStandard) || defaultStandard);

        if (nova.config.get('genealabs.phpmd.debugging', 'boolean')) {
            console.log("Determined linting standard: " + selectedStandard);
        }

        return selectedStandard;
    }

    provideIssues(editor) {
        let issues = [];
        let self = this;

        return new Promise(function (resolve) {
            let fileName = Math.random().toString(36).substring(2, 15)
                + Math.random().toString(36).substring(2, 15)
                + ".php";
            let range = new Range(0, editor.document.length);
            let documentText = editor.getTextInRange(range);
            let output = "";

            try {
                nova.fs.mkdir(nova.extension.workspaceStoragePath)
            } catch (error) {
                // fail silently
            }

            let lintFile = nova.fs.open(nova.path.join(nova.extension.workspaceStoragePath, fileName), "w");

            lintFile.write(documentText);
            lintFile.close();

            try {
                let linter = new Process('/usr/bin/env', {
                    args: [
                        './Bin/phpmd',
                        `${lintFile.path}`,
                        'json',
                        self.getStandard(),
                        '--ignore-violations-on-exit'
                    ],
                    shell: true,
                });

                linter.onStdout(function (line) {
                    if (nova.config.get('genealabs.phpmd.debugging', 'boolean')) {
                        console.log("Linter output:", line);
                    }

                    output += line;
                });

                linter.onDidExit(function () {
                    if (output.length > 0) {
                        resolve(self.parseLinterOutput(output));
                    }

                    if (nova.config.get('genealabs.phpmd.debugging', 'boolean')) {
                        console.log("Finished linting.");
                    }

                    nova.fs.remove(lintFile.path);
                });

                if (nova.config.get('genealabs.phpmd.debugging', 'boolean')) {
                    console.log("Started linting.");
                    console.log("Running command: " + './Bin/phpmd ' + lintFile.path + ' json ' + self.getStandard());
                }

                linter.start();
            } catch (error) {
                console.error("error during processing", error);
            }
        });
    }

    parseLinterOutput(output) {
        let self = this;
        let lints = JSON.parse(output);
        let issues = lints.files
            .flatMap(function (lint) {
                return lint.violations;
            })
            .map(function (lint) {
                let issue = new Issue();

                issue.message = lint.description;
                issue.severity = IssueSeverity.Error;

                if (lint.priority <= 2) {
                    issue.severity = IssueSeverity.Warning;
                }

                issue.line = lint.beginLine;
                issue.code = lint.rule + "| " + lint.ruleSet + " | phpmd";
                issue.endLine = issue.line + 1;

                if (issue.message.indexOf("Unexpected token: ")) {
                    issue.line = issue.message.search(/^.*? line: (.*?), col: .*$/i);
                }

                if (nova.config.get('genealabs.phpmd.debugging', 'boolean')) {
                    console.log("Found lint:");
                    console.log("===========");
                    console.log("Line: " + issue.line);
                    console.log("Class: " + lint.class);
                    console.log("Function: " + lint.function);
                    console.log("Method: " + lint.method);
                    console.log("Message: " + lint.description);
                    console.log("Rule: " + lint.rule);
                    console.log("Ruleset: " + lint.ruleSet);
                    console.log("Priority: " + lint.priority);
                    console.log("===========");
                }

                return issue;
            })
            .filter(function (issue) {
                return issue !== null;
            });

            let errors = lints.errors
                .map(function (lint) {
                    let issue = new Issue();
                    let regexp = /^.*? line: (.*?), col: .*$/i;

                    issue.message = lint.message;
                    issue.severity = IssueSeverity.Error;
                    issue.line = issue.message.match(/^.*? line: (.*?), col: .*$/i)[1];
                    issue.code = "phpmd";
                    issue.endLine = issue.line + 1;

                    if (nova.config.get('genealabs.phpmd.debugging', 'boolean')) {
                        console.log("Found error lint:");
                        console.log("===========");
                        console.log("Line: " + issue.line);
                        console.log("Message: " + lint.message);
                        console.log("===========");
                    }

                    return issue;
                });

        return issues
            .concat(errors);
    }
}

nova.assistants.registerIssueAssistant("php", new IssuesProvider());
