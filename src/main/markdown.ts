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
}

export interface IMarkdown {
    type: MarkdownTypes
}

export interface IHeaderLevel extends IMarkdown { header: string }

export interface IParagraph extends IMarkdown { p: string | string[] }
export interface IBlockQuote extends IMarkdown { blockquote: string | string[] }
export interface IImage extends IMarkdown { img: { source: string, title?: string, altText?: string } }

export type MarkdownNode = IHeaderLevel | IParagraph | IBlockQuote | IImage

export const Header = (header: string, type: MarkdownTypes): IHeaderLevel => ({ header, type })

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
    }
}

const arrayToStr = (a: string | string[], transform: (_: string) => string): string =>
    Array.isArray(a) ? a.map(transform).join('') : transform(a)

export const transformField = (fld: MarkdownNode): string => {
    const result = markdownNodeMatch({
        BlockQuote: (node) => arrayToStr(node.blockquote, (_) => `> ${_}`),
        HeaderLevel1: (_) => `# ${_.header}`,
        HeaderLevel2: (_) => `## ${_.header}`,
        HeaderLevel3: (_) => `### ${_.header}`,
        HeaderLevel4: (_) => `#### ${_.header}`,
        HeaderLevel5: (_) => `##### ${_.header}`,
        HeaderLevel6: (_) => `###### ${_.header}`,
        Image: (_) => `![${_.img.altText || ''}](${_.img.source} "${_.img.title || ''}")`,
        Paragraph: (node) => arrayToStr(node.p, (_) => `${_}`),
    }, fld)
    return result + '\n\n'
}
