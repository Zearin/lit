/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @fileoverview
 *
 * Utilities for analyzing class declarations
 */

import ts from 'typescript';
import {DiagnosticCode} from '../diagnostic-code.js';
import {createDiagnostic} from '../errors.js';
import {
  ClassDeclaration,
  AnalyzerInterface,
  DeclarationInfo,
  ClassHeritage,
  Reference,
  ClassField,
  ClassMethod,
} from '../model.js';
import {
  isLitElementSubclass,
  getLitElementDeclaration,
} from '../lit-element/lit-element.js';
import {getReferenceForIdentifier} from '../references.js';
import {parseNodeJSDocInfo} from './jsdoc.js';
import {
  hasDefaultModifier,
  hasStaticModifier,
  hasExportModifier,
  getPrivacy,
} from '../utils.js';
import {getFunctionLikeInfo} from './functions.js';
import {getTypeForNode} from '../types.js';
import {
  isCustomElementSubclass,
  getCustomElementDeclaration,
} from '../custom-elements/custom-elements.js';

/**
 * Returns an analyzer `ClassDeclaration` model for the given
 * ts.ClassLikeDeclaration.
 *
 * Note, the `docNode` may differ from the `declaration` in the case of a const
 * assignment to a class expression, as the JSDoc will be attached to the
 * VariableStatement rather than the class-like expression.
 */
export const getClassDeclaration = (
  declaration: ts.ClassLikeDeclaration,
  name: string,
  analyzer: AnalyzerInterface,
  docNode?: ts.Node
) => {
  if (isLitElementSubclass(declaration, analyzer)) {
    return getLitElementDeclaration(declaration, analyzer);
  }
  if (isCustomElementSubclass(declaration, analyzer)) {
    return getCustomElementDeclaration(declaration, analyzer);
  }
  return new ClassDeclaration({
    name,
    node: declaration,
    getHeritage: () => getHeritage(declaration, analyzer),
    ...parseNodeJSDocInfo(docNode ?? declaration, analyzer),
    ...getClassMembers(declaration, analyzer),
  });
};

/**
 * Returns the `fields` and `methods` of a class.
 */
export const getClassMembers = (
  declaration: ts.ClassLikeDeclaration,
  analyzer: AnalyzerInterface
) => {
  const fieldMap = new Map<string, ClassField>();
  const staticFieldMap = new Map<string, ClassField>();
  const methodMap = new Map<string, ClassMethod>();
  const staticMethodMap = new Map<string, ClassMethod>();
  declaration.members.forEach((node) => {
    // Ignore non-implementation signatures of overloaded methods by checking
    // for `node.body`.
    if (ts.isMethodDeclaration(node) && node.body) {
      const info = getMemberInfo(node);
      const name = node.name.getText();
      (info.static ? staticMethodMap : methodMap).set(
        name,
        new ClassMethod({
          ...info,
          ...getFunctionLikeInfo(node, name, analyzer),
          ...parseNodeJSDocInfo(node, analyzer),
        })
      );
    } else if (ts.isPropertyDeclaration(node)) {
      if (!ts.isIdentifier(node.name)) {
        analyzer.addDiagnostic(
          createDiagnostic({
            node,
            message:
              '@lit-labs/analyzer only supports analyzing class properties ' +
              'named with plain identifiers. This property was ignored.',
            category: ts.DiagnosticCategory.Warning,
            code: DiagnosticCode.UNSUPPORTED,
          })
        );
        return;
      }

      const info = getMemberInfo(node);
      (info.static ? staticFieldMap : fieldMap).set(
        node.name.getText(),
        new ClassField({
          ...info,
          default: node.initializer?.getText(),
          type: getTypeForNode(node, analyzer),
          ...parseNodeJSDocInfo(node, analyzer),
        })
      );
    }
  });
  return {
    fieldMap,
    staticFieldMap,
    methodMap,
    staticMethodMap,
  };
};

const getMemberInfo = (node: ts.MethodDeclaration | ts.PropertyDeclaration) => {
  return {
    name: node.name.getText(),
    static: hasStaticModifier(node),
    privacy: getPrivacy(node),
  };
};

/**
 * Returns the name of a class declaration.
 */
const getClassDeclarationName = (
  declaration: ts.ClassDeclaration,
  analyzer: AnalyzerInterface
) => {
  const name =
    declaration.name?.text ??
    // The only time a class declaration will not have a name is when it is
    // a default export, aka `export default class { }`
    (hasDefaultModifier(declaration) ? 'default' : undefined);
  if (name === undefined) {
    analyzer.addDiagnostic(
      createDiagnostic({
        node: declaration,
        message: `Illegal syntax: a class declaration must either have a name or be a default export`,
      })
    );
  }
  return name;
};

/**
 * Returns name and model factory for a class declaration.
 */
export const getClassDeclarationInfo = (
  declaration: ts.ClassDeclaration,
  analyzer: AnalyzerInterface
): DeclarationInfo | undefined => {
  const name = getClassDeclarationName(declaration, analyzer);
  if (name === undefined) {
    return undefined;
  }
  return {
    name,
    node: declaration,
    factory: () => getClassDeclaration(declaration, name, analyzer),
    isExport: hasExportModifier(declaration),
  };
};

/**
 * Returns the superClass and any applied mixins for a given class declaration.
 */
export const getHeritage = (
  declaration: ts.ClassLikeDeclarationBase,
  analyzer: AnalyzerInterface
): ClassHeritage => {
  const extendsClause = declaration.heritageClauses?.find(
    (c) => c.token === ts.SyntaxKind.ExtendsKeyword
  );
  if (extendsClause !== undefined) {
    if (extendsClause.types.length === 1) {
      return getHeritageFromExpression(
        extendsClause.types[0].expression,
        analyzer
      );
    }
    analyzer.addDiagnostic(
      createDiagnostic({
        node: extendsClause,
        message:
          'Illegal syntax: did not expect extends clause to have multiple types',
      })
    );
  }
  // No extends clause; return empty heritage
  return {
    mixins: [],
    superClass: undefined,
  };
};

export const getHeritageFromExpression = (
  expression: ts.Expression,
  analyzer: AnalyzerInterface
): ClassHeritage => {
  // TODO(kschaaf): Support for extracting mixing applications from the heritage
  // expression https://github.com/lit/lit/issues/2998
  const mixins: Reference[] = [];
  const superClass = getSuperClass(expression, analyzer);
  return {
    superClass,
    mixins,
  };
};

export const getSuperClass = (
  expression: ts.Expression,
  analyzer: AnalyzerInterface
): Reference | undefined => {
  // TODO(kschaaf) Could add support for inline class expressions here as well
  if (ts.isIdentifier(expression)) {
    return getReferenceForIdentifier(expression, analyzer);
  }
  analyzer.addDiagnostic(
    createDiagnostic({
      node: expression,
      message: `Expected expression to be a concrete superclass. Mixins are not yet supported.`,
      code: DiagnosticCode.UNSUPPORTED,
      category: ts.DiagnosticCategory.Warning,
    })
  );
  return undefined;
};
