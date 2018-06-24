export enum MarkdownHeaders {
    HeaderLevel1 = 'h1',
    HeaderLevel2 = 'h2',
    HeaderLevel3 = 'h3',
    HeaderLevel4 = 'h4',
    HeaderLevel5 = 'h5',
    HeaderLevel6 = 'h6',
}

export enum MarkdownText {
    Paragraph = 'p',
}

export interface IMarkdown {
    type: MarkdownHeaders | MarkdownText
}

export interface IHeaderLevel1 extends IMarkdown { h1: string }
export interface IHeaderLevel2 extends IMarkdown { h2: string }
export interface IHeaderLevel3 extends IMarkdown { h3: string }
export interface IHeaderLevel4 extends IMarkdown { h4: string }
export interface IHeaderLevel5 extends IMarkdown { h5: string }
export interface IHeaderLevel6 extends IMarkdown { h6: string }

export interface IParagraph extends IMarkdown { p: string | string[] }

export type MarkdownNode = IHeaderLevel1 | IHeaderLevel2 | IHeaderLevel3 | IHeaderLevel4 |
                        IHeaderLevel5 | IHeaderLevel6 | IParagraph

export const header = (text: string, type: MarkdownHeaders):
    IHeaderLevel1 | IHeaderLevel2 | IHeaderLevel3 | IHeaderLevel4 | IHeaderLevel5 | IHeaderLevel6 => {
    switch (type) {
        case MarkdownHeaders.HeaderLevel1: return {h1: text, type}
        case MarkdownHeaders.HeaderLevel2: return {h2: text, type}
        case MarkdownHeaders.HeaderLevel3: return {h3: text, type}
        case MarkdownHeaders.HeaderLevel4: return {h4: text, type}
        case MarkdownHeaders.HeaderLevel5: return {h5: text, type}
        case MarkdownHeaders.HeaderLevel6: return {h6: text, type}
    }
}

export const paragraph = (text: string | string[]): IParagraph => ({
    p: text,
    type: MarkdownText.Paragraph,
})

interface IMarkdownPattern<T> {
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
        case MarkdownHeaders.HeaderLevel1: return p.HeaderLevel1(r as IHeaderLevel1)
        case MarkdownHeaders.HeaderLevel2: return p.HeaderLevel2(r as IHeaderLevel2)
        case MarkdownHeaders.HeaderLevel3: return p.HeaderLevel3(r as IHeaderLevel3)
        case MarkdownHeaders.HeaderLevel4: return p.HeaderLevel4(r as IHeaderLevel4)
        case MarkdownHeaders.HeaderLevel5: return p.HeaderLevel5(r as IHeaderLevel5)
        case MarkdownHeaders.HeaderLevel6: return p.HeaderLevel6(r as IHeaderLevel6)
        case MarkdownText.Paragraph: return p.Paragraph(r as IParagraph)
        default: throw new Error(`markdownNodeMatch: Could not match type ${typeof r}`)
    }
}

export const transformField = (fld: MarkdownNode): string => {
    return markdownNodeMatch({
        HeaderLevel1: (_) => `# ${_.h1}\n\n`,
        HeaderLevel2: (f) => `## ${f.h2}\n\n`,
        HeaderLevel3: (g) => `### ${g.h3}\n\n`,
        HeaderLevel4: (h) => `#### ${h.h4}\n\n`,
        HeaderLevel5: (i) => `##### ${i.h5}\n\n`,
        HeaderLevel6: (j) => `###### ${j.h6}\n\n`,
        Paragraph: (_) => `${_.p}\n\n`,
    }, fld)
}
