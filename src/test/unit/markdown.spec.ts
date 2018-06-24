import { expect } from 'code'
import * as Lab from 'lab'
import {
    Blockquote,
    Header,
    Image,
    List,
    MarkdownTypes,
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

    it('should have a string with a leading number', () => {
        expect(transformField(text)).to.contain(`1. ${content}\n\n`)
    })

    it('should have two items', () => {
        expect(transformField(text).split(`1.`).length).to.equal(3)
    })
})

describe('When generating markdown for unorder list', () => {
    const text = List([content, content], MarkdownTypes.UnorderedList)

    it('should have a string with a leading number', () => {
        expect(transformField(text)).to.contain(`* ${content}\n\n`)
    })

    it('should have two items', () => {
        expect(transformField(text).split(`*`).length).to.equal(3)
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
