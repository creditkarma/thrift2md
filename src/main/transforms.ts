import * as path from 'path'

import {
    BaseType,
    BooleanLiteral,
    Comment,
    ConstDefinition,
    ConstList,
    ConstMap,
    ConstValue,
    DoubleConstant,
    EnumDefinition,
    EnumMember,
    ExponentialLiteral,
    FieldDefinition,
    FloatLiteral,
    FunctionDefinition,
    HexLiteral,
    Identifier,
    IntConstant,
    IntegerLiteral,
    ListType,
    MapType,
    NamespaceDefinition,
    PrimarySyntax,
    ServiceDefinition,
    SetType,
    StringLiteral,
    StructDefinition,
    SyntaxNode,
    SyntaxType,
    ThriftDocument,
    ThriftStatement,
    TypedefDefinition,
    VoidType,
} from '@creditkarma/thrift-parser'

import {
    ConstantsMemberRow,
    ConstantsSection,
    DocSection,
    EnumDefinitionTable,
    EnumMemberRow,
    EnumSection,
    FunctionSection,
    IBlockQuote,
    IHeaderFour,
    IHeaderOne,
    IHeaderThree,
    IHeaderTwo,
    ITable,
    LiteralValue,
    ModuleSection,
    ModuleTransformation,
    SectionFilter,
    SectionType,
    ServiceDefintionSection,
    ServiceSection,
    StructDefinitionTable,
    StructFieldRow,
    StructSection,
    TypedDefinitionTable,
    TypeDefSection,
} from './types'

/**
 * Common Transformations
 */

function syntaxNodeTransform<U>(
    r: SyntaxNode,
    e: (_: VoidType) => U,
    f: (_: ListType) => U,
    g: (_: MapType) => U,
    h: (_: SetType) => U,
    i: (_: BaseType) => U,
    z: (_: Identifier) => U,
): U {
    switch (r.type) {
        case SyntaxType.VoidKeyword: return e(r as VoidType)
        case SyntaxType.ListType: return f(r as ListType)
        case SyntaxType.MapType: return g(r as MapType)
        case SyntaxType.SetType: return h(r as SetType)
        case SyntaxType.StringKeyword: return i(r as BaseType)
        case SyntaxType.I8Keyword: return i(r as BaseType)
        case SyntaxType.BinaryKeyword: return i(r as BaseType)
        case SyntaxType.BoolKeyword: return i(r as BaseType)
        case SyntaxType.ByteKeyword: return i(r as BaseType)
        case SyntaxType.DoubleKeyword: return i(r as BaseType)
        case SyntaxType.EnumKeyword: return i(r as BaseType)
        case SyntaxType.I16Keyword: return i(r as BaseType)
        case SyntaxType.I32Keyword: return i(r as BaseType)
        case SyntaxType.I64Keyword: return i(r as BaseType)
        default: return z(r as Identifier)
    }
}

const transformField = (fld: SyntaxNode): string =>
    syntaxNodeTransform(
        fld,
        (e) => `void`,
        (f) => `list<${transformField(f.valueType)}>`,
        (g) => `map<${transformField(g.valueType)}>`,
        (h) => `set<${transformField(h.valueType)}>`,
        (i) => i.type.split('Keyword')[0].toLowerCase(),
        (z) => `[${z.value}](#${z.value})`,
    )

function literalTransform<U>(
    r: LiteralValue,
    e: (_: StringLiteral) => U,
    f: (_: BooleanLiteral) => U,
    g: (_: IntegerLiteral) => U,
    h: (_: HexLiteral) => U,
    i: (_: FloatLiteral) => U,
    j: (_: ExponentialLiteral) => U,
): U {
    switch (r.type) {
        case SyntaxType.StringLiteral: return e(r as StringLiteral)
        case SyntaxType.BooleanLiteral: return f(r as BooleanLiteral)
        case SyntaxType.IntegerLiteral: return g(r as IntegerLiteral)
        case SyntaxType.HexLiteral: return h(r as HexLiteral)
        case SyntaxType.FloatLiteral: return i(r as FloatLiteral)
        case SyntaxType.ExponentialLiteral: return j(r as ExponentialLiteral)
        default: return e(r)
    }
}

const getLiteralVal = (
    fld: LiteralValue,
) => literalTransform(
    fld,
    (e) => `"${e.value}"`,
    (f) => `${f.value}`,
    (g) => `${g.value}`,
    (h) => `#${h.value}`,
    (i) => `${i.value}`,
    (j) => `${j.value}`,
)

function constTransform<U>(
    r: ConstValue,
    e: (_: ConstList) => U,
    f: (_: ConstMap) => U,
    g: (_: LiteralValue) => U,
    z: (_: Identifier) => U,
): U {
    switch (r.type) {
        case SyntaxType.ConstList: return e(r as ConstList)
        case SyntaxType.ConstMap: return f(r as ConstMap)
        case SyntaxType.DoubleConstant: return g((r as DoubleConstant).value)
        case SyntaxType.IntConstant: return g((r as IntConstant).value)
        case SyntaxType.StringLiteral: return g((r as LiteralValue))
        default: return z(r as Identifier)
    }
}

function getConstListMembers(fld: ConstList) {
    return fld.elements.map((elem) => {
        return (elem as StringLiteral).value
    })
}

const transformConst = (fld: ConstValue) => constTransform(
    fld,
    (e) => `list<${getConstListMembers(e).toString()}>`,
    (f) => `map<${transformField(f)}>`,
    getLiteralVal,
    (z) => `[${z.value}](#${z.value})`,
)

function extractComments(entityComments: Comment[], useHTMLEntities: boolean) {
    var codeComments = "";
    entityComments.forEach(element => {
        if(element.type == SyntaxType.CommentBlock) {
            element.value.forEach(elementChild => {
                codeComments += elementChild.trimLeft();
            });
        }
        // ignore any IDL '#' comments: SyntaxType.CommentLine
    });
    return useHTMLEntities ? codeComments.replace(/[\n\r]/g, '<br/>') : codeComments;
}

const isSection = (filter: SectionType, stmt: ThriftStatement) => stmt.type === filter
const cIsSection = (filter: SectionType) => (stmt: ThriftStatement) => isSection(filter, stmt)

/**
 * Type Definitions
 */
const typedefDefinitionTable = (def: TypedefDefinition): TypedDefinitionTable => [{
    h3: def.name.value,
}, {
    blockquote: `${transformField(def.definitionType)} ${def.name.value}`,
}]

export const transformTypeDefs = (ast: ThriftDocument): TypeDefSection => {
    const isTypeDef = cIsSection(SyntaxType.TypedefDefinition)
    return [
        { h2: 'Types'},
        ast.body.filter(isTypeDef).map((stmt) => typedefDefinitionTable(stmt as TypedefDefinition)),
    ]
}

/**
 * Constants Transformations
 */
 const constMemberRow = (def: ConstDefinition): ConstantsMemberRow => [
    def.name.value,
    transformField(def.fieldType),
    def.comments ? extractComments(def.comments, true) : '',
    constLiteralValues(def)
]
function constLiteralValues(def: ConstDefinition){
    if (def.initializer.type == SyntaxType.ConstList || def.initializer.type == SyntaxType.ConstMap) {
        return transformConst(def.initializer).toString();
    }
    else {
        return getLiteralVal(def.initializer as LiteralValue)
    } 
}
const constDefinitionTable = (constRows: ConstantsMemberRow[]): ITable => {
    return {
        table: {
            headers: ['Constant', 'Type', 'Description', 'Value'],
            rows: constRows
        }
    }
}
export const transformConstants = (ast: ThriftDocument): ConstantsSection => {
    const isConstant = cIsSection(SyntaxType.ConstDefinition)
    var constRows = ast.body.filter(isConstant).map((def) => constMemberRow(def as ConstDefinition))
    return [
        { h2: 'Constants' },
        constDefinitionTable(constRows)
    ]
}

/** 
 * Enumeration Transformations
 */
const enumMemberRow = (mbr: EnumMember): EnumMemberRow => [
    mbr.name.value,
    mbr.comments ? extractComments(mbr.comments, true) : ''
]
const enumDefinitionTable = (def: EnumDefinition): EnumDefinitionTable => [{
        h3: def.name.value,
    }, {
        code: {
            content: def.comments ? extractComments(def.comments, false) : ''
        }
    }, {
        table: {
            headers: ['Named Constant', 'Description'],
            rows: def.members.map(enumMemberRow),
        },
    },
]
export const transformEnums = (ast: ThriftDocument): EnumSection => {
    const isEnumeration = cIsSection(SyntaxType.EnumDefinition)
    return [
        { h2: 'Enumerations' },
        ast.body.filter(isEnumeration).map((def) => enumDefinitionTable(def as EnumDefinition)),
    ]
}

/**
 * Structure Transformations
 */
const structFieldRow = (fld: FieldDefinition): StructFieldRow => [
    fld.fieldID ? fld.fieldID.value : null,
    fld.name.value,
    transformField(fld.fieldType),
    fld.comments ? extractComments(fld.comments, true) : '',
    fld.requiredness || '',
    fld.defaultValue ? (fld.defaultValue.type == SyntaxType.StringLiteral ? fld.defaultValue.value : transformConst(fld.defaultValue)) : '',
]

const structDefinitionTable = (def: StructDefinition): StructDefinitionTable => [{
        h3: def.name.value,
    }, {
        code: {
                content: def.comments ? extractComments(def.comments, false) : ''
        }
    }, {
        table: {
            headers: ['Key', 'Field', 'Type', 'Description', 'Required', 'Default value'],
            rows: def.fields.map(structFieldRow),
        },
    },
]

export const transformStructs = (ast: ThriftDocument): StructSection => {
    const isStructure = cIsSection(SyntaxType.StructDefinition)
    return [
        { h2: 'Data Structures' },
        ast.body.filter(isStructure).map((stmt) => structDefinitionTable(stmt as StructDefinition)),
    ]
}

/**
 * Service Transformations
 */
const commaList = (fields: FieldDefinition[]) =>
    fields.reduce((prev, fld) => {
        return prev + `${transformField(fld.fieldType)} ${fld.name.value}, `
    }, '').slice(0, -2)

const funcSignature = (func: FunctionDefinition) =>
    `${transformField(func.returnType)} ${func.name.value}`

const funcThrows = (func: FunctionDefinition) =>
    func.throws.length > 0 ? `throws ${commaList(func.throws)}` : ''

const transformFunction = (func: FunctionDefinition): FunctionSection => [{
    h4: `Function: ${func.name.value}`,
}, {
    blockquote: `${funcSignature(func)}(${commaList(func.fields)}) ${funcThrows(func)}`,
}]

const serviceDefinitionSection = (def: ServiceDefinition): ServiceDefintionSection  => [
        { h3: def.name.value },
        def.functions.map(transformFunction),
    ]

export const transformServices = (ast: ThriftDocument): ServiceSection => {
    const isService = cIsSection(SyntaxType.ServiceDefinition)
    return [
        { h2: 'Services'},
        ast.body.filter(isService).map((stmt) => serviceDefinitionSection(stmt as ServiceDefinition)),
    ]
}

/**
 * Module Transformations
 */
const namespaceDefinition = (namespace: NamespaceDefinition) => (
    { blockquote: `${namespace.name.value}` }
)

export const transformModule = (fileName: string, ast: ThriftDocument): ModuleSection => {
    const isNamespaceDefinition = cIsSection(SyntaxType.NamespaceDefinition)
    return [
        { h1: `${path.parse(fileName).base.split('.')[0]}` },
        ast.body.filter(isNamespaceDefinition).map((stmt) => namespaceDefinition(stmt as NamespaceDefinition)),
        '[[_TOC_]]' // MD table of contents entity
    ]
}
