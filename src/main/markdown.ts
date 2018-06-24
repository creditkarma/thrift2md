export enum MarkdownTypes {
    HeaderLevel1 = 'h1',
    HeaderLevel2 = 'h2',
    HeaderLevel3 = 'h3',
    HeaderLevel4 = 'h4',
    HeaderLevel5 = 'h5',
    HeaderLevel6 = 'h6',
    Paragraph = 'p',
    BlockQuote = 'blockquote',
}

export interface IMarkdown {
    type: MarkdownTypes
}

export interface IHeaderLevel1 extends IMarkdown { h1: string }
export interface IHeaderLevel2 extends IMarkdown { h2: string }
export interface IHeaderLevel3 extends IMarkdown { h3: string }
export interface IHeaderLevel4 extends IMarkdown { h4: string }
export interface IHeaderLevel5 extends IMarkdown { h5: string }
export interface IHeaderLevel6 extends IMarkdown { h6: string }

export interface IParagraph extends IMarkdown { p: string | string[] }
export interface IBlockQuote extends IMarkdown { blockquote: string | string[] }

export type MarkdownNode = IHeaderLevel1 | IHeaderLevel2 | IHeaderLevel3 | IHeaderLevel4 |
                        IHeaderLevel5 | IHeaderLevel6 | IParagraph | IBlockQuote

export const header = (text: string, type: MarkdownTypes):
    IHeaderLevel1 | IHeaderLevel2 | IHeaderLevel3 | IHeaderLevel4 | IHeaderLevel5 | IHeaderLevel6 => {
    switch (type) {
        case MarkdownTypes.HeaderLevel1: return {h1: text, type}
        case MarkdownTypes.HeaderLevel2: return {h2: text, type}
        case MarkdownTypes.HeaderLevel3: return {h3: text, type}
        case MarkdownTypes.HeaderLevel4: return {h4: text, type}
        case MarkdownTypes.HeaderLevel5: return {h5: text, type}
        case MarkdownTypes.HeaderLevel6: return {h6: text, type}
        default: throw new Error(`markdownNodeMatch: Could not match type ${type}`)
    }
}

export const paragraph = (text: string | string[]): IParagraph => ({
    p: text,
    type: MarkdownTypes.Paragraph,
})

export const blockquote = (text: string | string[]): IBlockQuote => ({
    blockquote: text,
    type: MarkdownTypes.BlockQuote,
})

interface IMarkdownPattern<T> {
    BlockQuote: (_: IBlockQuote) => T
    HeaderLevel1: (_: IHeaderLevel1) => T
    HeaderLevel2: (_: IHeaderLevel2) => T
    HeaderLevel3: (_: IHeaderLevel3) => T
    HeaderLevel4: (_: IHeaderLevel4) => T
    HeaderLevel5: (_: IHeaderLevel5) => T
    HeaderLevel6: (_: IHeaderLevel6) => T
    Paragraph: (_: IParagraph) => T
}

function markdownNodeMatch<T>(p: IMarkdownPattern<T>, r: MarkdownNode): T {
    switch (r.type) {
        case MarkdownTypes.HeaderLevel1: return p.HeaderLevel1(r as IHeaderLevel1)
        case MarkdownTypes.HeaderLevel2: return p.HeaderLevel2(r as IHeaderLevel2)
        case MarkdownTypes.HeaderLevel3: return p.HeaderLevel3(r as IHeaderLevel3)
        case MarkdownTypes.HeaderLevel4: return p.HeaderLevel4(r as IHeaderLevel4)
        case MarkdownTypes.HeaderLevel5: return p.HeaderLevel5(r as IHeaderLevel5)
        case MarkdownTypes.HeaderLevel6: return p.HeaderLevel6(r as IHeaderLevel6)
        case MarkdownTypes.Paragraph: return p.Paragraph(r as IParagraph)
        case MarkdownTypes.BlockQuote: return p.BlockQuote(r as IBlockQuote)
    }
}

const arrayToStr = (a: string | string[], transform: (_: string) => string): string =>
    Array.isArray(a) ? a.map(transform).join('') : transform(a)

export const transformField = (fld: MarkdownNode): string => {
    return markdownNodeMatch({
        BlockQuote: (node) => arrayToStr(node.blockquote, (_) => `> ${_}\n\n`),
        HeaderLevel1: (node) => `# ${node.h1}\n\n`,
        HeaderLevel2: (node) => `## ${node.h2}\n\n`,
        HeaderLevel3: (node) => `### ${node.h3}\n\n`,
        HeaderLevel4: (node) => `#### ${node.h4}\n\n`,
        HeaderLevel5: (node) => `##### ${node.h5}\n\n`,
        HeaderLevel6: (node) => `###### ${node.h6}\n\n`,
        Paragraph: (node) => arrayToStr(node.p, (_) => `${_}\n\n`),
    }, fld)
}
