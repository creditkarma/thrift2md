export enum MarkdownTypes {
    HeaderLevel1,
    HeaderLevel2,
    HeaderLevel3,
    HeaderLevel4,
    HeaderLevel5,
    HeaderLevel6,
    Image,
    Paragraph,
    BlockQuote,
    UnorderedList,
    OrderedList,
    CodeBlock,
    Table,
}

export interface IMarkdown {
    type: MarkdownTypes
}

export interface IHeaderLevel extends IMarkdown { header: string }

export interface IParagraph extends IMarkdown { p: string | string[] }
export interface IBlockQuote extends IMarkdown { blockquote: string | string[] }
export interface IImage extends IMarkdown { img: { source: string, title?: string, altText?: string } }
export interface IList extends IMarkdown { items: string[] }
export interface ICodeBlock extends IMarkdown { code: {language: string, lines: string | string[]}}
export interface ITable extends IMarkdown { table: { headers: string[], rows: string[][]}}

export type MarkdownNode = IHeaderLevel | IParagraph | IBlockQuote | IImage | IList | ICodeBlock | ITable

export type HeaderTypes = MarkdownTypes.HeaderLevel1 | MarkdownTypes.HeaderLevel2 | MarkdownTypes.HeaderLevel3 |
                        MarkdownTypes.HeaderLevel4 | MarkdownTypes.HeaderLevel5 | MarkdownTypes.HeaderLevel6

export const Header = (header: string, type: HeaderTypes): IHeaderLevel => ({
    header,
    type,
})

export const Paragraph = (text: string | string[]): IParagraph => ({
    p: text,
    type: MarkdownTypes.Paragraph,
})

export const Blockquote = (text: string | string[]): IBlockQuote => ({
    blockquote: text,
    type: MarkdownTypes.BlockQuote,
})

export const Image = (source: string, title?: string, altText?: string) => ({
    img: { source, title, altText },
    type: MarkdownTypes.Image,
})

export const CodeBlock = (language: string, lines: string | string[]) => ({
    code: { language, lines },
    type: MarkdownTypes.CodeBlock,
})

export type ListType = MarkdownTypes.OrderedList | MarkdownTypes.UnorderedList

export const List = (items: string[], type: ListType): IList => ({
    items,
    type,
})

export const Table = (headers: string[], rows: string[][]) => ({
    table: { headers, rows },
    type: MarkdownTypes.Table,
})

interface IMarkdownPattern<T> {
    BlockQuote: (_: IBlockQuote) => T
    HeaderLevel1: (_: IHeaderLevel) => T
    HeaderLevel2: (_: IHeaderLevel) => T
    HeaderLevel3: (_: IHeaderLevel) => T
    HeaderLevel4: (_: IHeaderLevel) => T
    HeaderLevel5: (_: IHeaderLevel) => T
    HeaderLevel6: (_: IHeaderLevel) => T
    Image: (_: IImage) => T
    Paragraph: (_: IParagraph) => T
    UnorderedList: (_: IList) => T
    OrderedList: (_: IList) => T
    CodeBlock: (_: ICodeBlock) => T
    Table: (_: ITable) => T
}

function markdownNodeMatch<T>(p: IMarkdownPattern<T>, r: MarkdownNode): T {
    switch (r.type) {
        case MarkdownTypes.HeaderLevel1: return p.HeaderLevel1(r as IHeaderLevel)
        case MarkdownTypes.HeaderLevel2: return p.HeaderLevel2(r as IHeaderLevel)
        case MarkdownTypes.HeaderLevel3: return p.HeaderLevel3(r as IHeaderLevel)
        case MarkdownTypes.HeaderLevel4: return p.HeaderLevel4(r as IHeaderLevel)
        case MarkdownTypes.HeaderLevel5: return p.HeaderLevel5(r as IHeaderLevel)
        case MarkdownTypes.HeaderLevel6: return p.HeaderLevel6(r as IHeaderLevel)
        case MarkdownTypes.Image: return p.Image(r as IImage)
        case MarkdownTypes.Paragraph: return p.Paragraph(r as IParagraph)
        case MarkdownTypes.BlockQuote: return p.BlockQuote(r as IBlockQuote)
        case MarkdownTypes.UnorderedList: return p.UnorderedList(r as IList)
        case MarkdownTypes.OrderedList: return p.OrderedList(r as IList)
        case MarkdownTypes.CodeBlock: return p.CodeBlock(r as ICodeBlock)
        case MarkdownTypes.Table: return p.Table(r as ITable)
    }
}

export function transformField(fld: MarkdownNode): string {

    const arrayToStr = (a: string | string[], transform: (_: string) => string): string =>
        Array.isArray(a) ? a.reduce((prev, cur) => prev + transform(cur), '') : transform(a)

    const codeBlockTransform = (block: ICodeBlock): string => [
        '```' + block.code.language,
        ...block.code.lines,
        '````',
    ].join('\n')

    const imageTransform = (node: IImage): string =>
        `![${node.img.altText || ''}](${node.img.source} "${node.img.title || ''}")`

    const tableTransform = (node: ITable): string => [
        node.table.headers.reduce((prev, cur) => prev + ` ${cur} |`, ''),
        node.table.headers.reduce((prev) => prev + ` --- |`, ''),
        ...node.table.rows.map((row) => row.reduce((prev, cur) => prev + ` ${cur} |`, '')),
    ].join('\n')

    return markdownNodeMatch({
        BlockQuote: (node) => arrayToStr(node.blockquote, (_) => `> ${_}\n\n`),
        CodeBlock: (node) => codeBlockTransform(node) + '\n',
        HeaderLevel1: (node) => `# ${node.header}\n\n`,
        HeaderLevel2: (node) => `## ${node.header}\n\n`,
        HeaderLevel3: (node) => `### ${node.header}\n\n`,
        HeaderLevel4: (node) => `#### ${node.header}\n\n`,
        HeaderLevel5: (node) => `##### ${node.header}\n\n`,
        HeaderLevel6: (node) => `###### ${node.header}\n\n`,
        Image: (node) => imageTransform(node) + '\n\n',
        OrderedList: (node) => arrayToStr(node.items, (_) => `1. ${_}\n\n`),
        Paragraph: (node) => arrayToStr(node.p, (_) => `${_}\n\n`),
        Table: (node) => tableTransform(node) + '\n\n',
        UnorderedList: (node) => arrayToStr(node.items, (_) => `* ${_}\n\n`),
    }, fld)
}

export function transformDoc(nodes: MarkdownNode[]): string {
    const flatten = (list: MarkdownNode[]): MarkdownNode[] => list.reduce(
        (a: MarkdownNode[], b) => a.concat(Array.isArray(b) ? flatten(b as MarkdownNode[]) : b), [],
    )

    return flatten(nodes).map(transformField).join('')
}
