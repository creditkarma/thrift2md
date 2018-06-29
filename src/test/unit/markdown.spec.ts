import { expect } from 'code'
import * as Lab from 'lab'
import {
    Blockquote,
    CodeBlock,
    Header,
    Image,
    List,
    MarkdownTypes,
    Table,
    transformDoc,
    transformField,
} from '../../main/markdown'

export const lab = Lab.script()

const describe = lab.describe
const it = lab.it
const before = lab.before

const content = 'Hello world'
const url = 'https://imageix.io/ahd2i3hd'

describe('When generating markdown for header1', () => {
    const head = Header(content, MarkdownTypes.HeaderLevel1)

    it('should have a string with a leading #', () => {
        expect(transformField(head)).to.contain('# ')
    })

    it('should contain # and value', () => {
        expect(transformField(head)).to.equal(`# ${content}\n\n`)
    })
})

describe('When generating markdown for header2', () => {
    const head = Header(content, MarkdownTypes.HeaderLevel2)

    it('should have a string with a leading ##', () => {
        expect(transformField(head)).to.contain('## ')
    })
})

describe('When generating markdown for blockquote', () => {
    const text = Blockquote(content)

    it('should have a string with a leading >', () => {
        expect(transformField(text)).to.equal(`> ${content}\n\n`)
    })
})

describe('When generating markdown for order list', () => {
    const text = List([content, content], MarkdownTypes.OrderedList)
    const markdown = transformField(text)

    it('should have a string with a leading number', () => {
        expect(markdown).to.contain(`1. ${content}\n\n`)
    })

    it('should have two items', () => {
        expect(markdown.split(`\n\n`).length).to.equal(3)
    })
})

describe('When generating markdown for unorder list', () => {
    const text = List([content, content], MarkdownTypes.UnorderedList)
    const markdown = transformField(text)

    it('should have a string with a leading number', () => {
        expect(markdown).to.contain(`* ${content}\n\n`)
    })

    it('should have two items', () => {
        expect(markdown.split(`\n\n`).length).to.equal(3)
    })
})

describe('When generating markdown for image', () => {
    const img = Image(url)
    const fullImg = Image(url, content, content)

    it('should have a string that contains the url in a [', () => {
        expect(transformField(img)).to.equal(`![](${url} "")\n\n`)
    })

    it('should have a string that contains the url in a [', () => {
        expect(transformField(fullImg)).to.equal(`![${content}](${url} "${content}")\n\n`)
    })
})

describe('When generating markdown for code block', () => {
    const block = CodeBlock('typescript', [content, content])
    const markdown = transformField(block)

    it('should have a string with the language indicator', () => {
        expect(markdown).to.contain('```typescript\n')
    })

    it('should have four lines', () => {
        expect(markdown.split('\n').length).to.equal(5)
    })
})

describe('When generating markdown for a table', () => {
    const table = Table(['col 1', 'col 2', 'col 3'], [[content, content], [content, content]])
    const markdown = transformField(table)

    it('should have a string with the header indicator', () => {
        expect(markdown).to.contain('col 1 | col 2 | col 3')
    })

    it('should have a string with row data', () => {
        expect(markdown).to.contain(`${content} | ${content} |`)
    })

    it('should have four lines', () => {
        expect(markdown.split('\n').length).to.equal(6)
    })
})

describe('When generating markdown for a document', () => {
    const doc = [
        Header(content, MarkdownTypes.HeaderLevel1),
        Header(content, MarkdownTypes.HeaderLevel2),
        Table(['col 1', 'col 2', 'col 3'], [[content, content], [content, content]]),
    ]
    const markdown = transformDoc(doc)

    it('should have a string with the header indicator', () => {
        expect(markdown).to.contain('col 1 | col 2 | col 3')
    })

    it('should have a string with row data', () => {
        expect(markdown).to.contain(`${content} | ${content} |`)
    })

    it('should have four lines', () => {
        expect(markdown.split('\n').length).to.equal(6)
    })
})
