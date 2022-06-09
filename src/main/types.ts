import {
    BooleanLiteral,
    ExponentialLiteral,
    FloatLiteral,
    HexLiteral,
    IntegerLiteral,
    NamespaceDefinition,
    ServiceDefinition,
    StringLiteral,
    SyntaxType,
    ThriftDocument,
    ThriftStatement,
} from '@creditkarma/thrift-parser'

/**
 * Markdown Types
 */
export interface IHeaderFour { h4: string }
export interface IHeaderOne { h1: string }
export interface IHeaderTwo { h2: string }
export interface IHeaderThree { h3: string }
export interface IBlockQuote { blockquote: string }
export interface ICodeBlock { code: { content: string } }
export interface ITable {
    table: {
        headers: string[],
        rows: StructFieldRow[] | EnumMemberRow[] | ConstantsMemberRow[],
    }
}

/**
 * Thrift Types
 */
export type LiteralValue = StringLiteral | BooleanLiteral | IntegerLiteral | HexLiteral |
FloatLiteral | ExponentialLiteral

export type DocSection = NamespaceDefinition | ServiceDefinition

export type SectionType = SyntaxType.NamespaceDefinition | SyntaxType.ServiceDefinition |
SyntaxType.StructDefinition | SyntaxType.TypedefDefinition | SyntaxType.EnumDefinition | SyntaxType.ConstDefinition

/**
 * Transform Types
 */

export type ThriftMarkdown = [
    ModuleSection,
    TypeDefSection,
    ConstantsSection,
    EnumSection, 
    StructSection,
    ServiceSection
]

export type ModuleSection = [IHeaderOne, IBlockQuote[], string]

export type TypedDefinitionTable = [IHeaderThree, ICodeBlock, IBlockQuote]
export type TypeDefSection = [IHeaderTwo, TypedDefinitionTable[]]

export type FunctionSection = [IHeaderFour, IBlockQuote]
export type ServiceDefintionSection = [IHeaderThree, FunctionSection[]]
export type ServiceSection = [IHeaderTwo, ServiceDefintionSection[]]

export type StructDefinitionTable = [IHeaderThree, ICodeBlock, ITable]
export type StructSection = [IHeaderTwo, StructDefinitionTable[]]
export type StructFieldRow = [
    number | null,
    string,
    string,
    string | string[],
    string | null,
    string
]

export type EnumDefinitionTable = [IHeaderThree, ICodeBlock, ITable]
export type EnumSection = [IHeaderTwo, EnumDefinitionTable[]]
export type EnumMemberRow = [
    string,
    string | string[]
]

export type ConstantsSection = [IHeaderTwo, ConstantsDefinitionTable]
export type ConstantsDefinitionTable = ITable
export type ConstantsMemberRow = [
    string,
    string,
    string | string[],
    string
]

/**
 * Thrift Transformations
 */
export type SectionFilter = (filter: SectionType) => (stmt: ThriftStatement) => boolean
export type ModuleTransformation = (fileName: string) => (ast: ThriftDocument) => ModuleSection
