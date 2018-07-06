// Copyright Hillside Technology Ltd. 2018. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0(the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as ts from "typescript";
import * as tslint from "tslint";
import { isTypeReference, isClassDeclaration } from "tsutils";

/**
 * Running in a NodeJS context so we need to declare the override decorator globally
 */
declare global {
    function override(...args: any[]): void;
}

/**
 * Decorator that doesn't do anything.
 */
(global as any).override = function (...args: any[]) {
    /// Purposely does nothing.
};

/**
 * Rule to force override decorator
 */
export class Rule extends tslint.Rules.TypedRule {

    /**
     * Meta data around the rule
     */
    public static Metadata: tslint.IRuleMetadata = {
        ruleName: "declare-override",
        description: "Overrides in TypeScript must be declared by the presence of an Override decorator",
        descriptionDetails: "",
        rationale: tslint.Utils.dedent`
            This rule forces the usage of a decoarator declared as @override to be used whenever an method or property is overriden`,
        optionsDescription: "Not configurable.",
        options: null,
        optionExamples: [],
        type: "maintainability",
        typescriptOnly: true,
    };

    /**
     * Failure string
     */
    public static FAILURE_MISSING_OVERRIDE_STRING = "Missing override decorator, properties and methods must be marked";

    /**
     * Failure string
     */
    public static FAILURE_UNNESSESARY_OVERRIDE_STRING = "Unnecessary override decorator, does not exist in heritage clause";

    /**
     * Implements the walker
     * @param sourceFile 
     */
    @override public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): tslint.RuleFailure[] {
        return this.applyWithWalker(new OverrideWalker(program.getSourceFile(sourceFile.fileName), this.ruleName, program.getTypeChecker()));
    }
}

/**
 * Advanced walker for override linting rule
 * Must implement @override decorator.
 */
class OverrideWalker extends tslint.AbstractWalker<ts.TypeChecker> {


    /**
     * List of clauses for this item
     */
    private heritageClauses: string[] = [];
    
    /**
     * Performance.
     */
    private visitNodeCallback = this.visitNode.bind(this);


    /**
     * Walk through all of the nodes
     * @param sourceFile 
     */
    @override public walk(sourceFile: ts.SourceFile) {
        ts.forEachChild(sourceFile, this.visitNodeCallback);
    }

    /**
     * 
     * @param node 
     */
    protected visitNode(node: ts.Node) {
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
            /// Reset for each class to avoid invalid errors
            this.heritageClauses = [];
            ts.forEachChild(node, this.visitNodeCallback);
        } else if (node.kind === ts.SyntaxKind.HeritageClause) {
            /// Store the heritageClauses against an internal array
            this.heritageClauses = this.heritageClauses.concat(this.getHeritageMembers(node as ts.HeritageClause));
            ts.forEachChild(node, this.visitNodeCallback);
        } else if (this.heritageClauses && (node.kind === ts.SyntaxKind.MethodDeclaration || node.kind === ts.SyntaxKind.PropertyDeclaration)) {
            /// Firstly ensure that we have a name on the node
            if ((node as ts.MethodDeclaration).name) {

                /// Validate that we're actually overriding something
                if (this.heritageClauses.indexOf((node as ts.MethodDeclaration).name.getText()) > -1) {
                    /// Loop the decorators, if we have none then it's a failure
                    if (node.decorators) {
                        for (const decorator of node.decorators) {
                            if (decorator.getText() === "@override") {
                                return;
                            }
                        }

                        /// If we're down here then override isn't declared and this is means to fail
                        this.addFailureAtNode(node, Rule.FAILURE_MISSING_OVERRIDE_STRING);
                    } else {
                        this.addFailureAtNode(node, Rule.FAILURE_MISSING_OVERRIDE_STRING);
                    }
                }
                /// Otherwise do the inverse check
                else {
                    /// If no decorators then move on
                    if (node.decorators) {
                        for (const decorator of node.decorators) {
                            if (decorator.getText() === "@override") {
                                return this.addFailureAtNode(node, Rule.FAILURE_UNNESSESARY_OVERRIDE_STRING);
                            }
                        }
                    }
                }
            }
        } else {
            ts.forEachChild(node, this.visitNodeCallback);
        }
    }

    /**
     * Returns all of our heritage members, recursively
     * @param heritageClause 
     */
    private getHeritageMembers(heritageClause: ts.HeritageClause) {
        let result: string[] = [];

        /// Ensure that we actually have some types on this clause, this would be null if we're not extending
        if (heritageClause.types) {

            /// Grab the real type from each of these clauses
            for (const type of heritageClause.types) {
                const resolvedType = this.options.getTypeFromTypeNode(type);

                /// Simple validation to ensure that this is a real type node
                if (isTypeReference(resolvedType)) {
                    const declarations = resolvedType.target.symbol.declarations;

                    /// Go through each of the declarations that we have, these are essentially the exports
                    for (const dc of declarations) {

                        /// Validate this declaration is a class, we're not interested in anything else
                        if (isClassDeclaration(dc)) {

                            /// Pull off all of the members properties and methods
                            for (const mb of dc.members) {

                                /// Constructor doesn't need override
                                /// Static doesn't need override
                                if (mb.kind !== ts.SyntaxKind.Constructor &&
                                    (!mb.modifiers || (mb.modifiers && mb.modifiers.filter(m => m.getText() === "static").length === 0))) {
                                    result.push(mb.name.getText());
                                }
                            }

                            /// If the declaration itself has more heritage, go and get them, useful for chaining
                            if (dc.heritageClauses) {
                                result = result.concat(this.getHeritageMembers(dc.heritageClauses[0]));
                            }
                        }
                    }
                }
            }
        }

        return result;
    }
}
