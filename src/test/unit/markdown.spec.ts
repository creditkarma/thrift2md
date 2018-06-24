import { expect } from 'code'
import * as Lab from 'lab'
import {
    blockquote,
    header,
    image,
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
    const head = header(content, MarkdownTypes.HeaderLevel1)

    it('should have a string with a leading #', () => {
        expect(transformField(head)).to.contain('# ')
    })

    it('should contain # and value', () => {
        expect(transformField(head)).to.equal(`# ${content}\n\n`)
    })
})

describe('When generating markdown for header2', () => {
    const head = header(content, MarkdownTypes.HeaderLevel2)

    it('should have a string with a leading ##', () => {
        expect(transformField(head)).to.contain('## ')
    })
})

describe('When generating markdown for blockquote', () => {
    const text = blockquote(content)

    it('should have a string with a leading >', () => {
        expect(transformField(text)).to.equal(`> ${content}\n\n`)
    })
})

describe('When generating markdown for image', () => {
    const img = image(url)
    const fullImg = image(url, content, content)

    it('should have a string that contains the url in a [', () => {
        expect(transformField(img)).to.equal(`![](${url} "")\n\n`)
    })

    it('should have a string that contains the url in a [', () => {
        expect(transformField(fullImg)).to.equal(`![${content}](${url} "${content}")\n\n`)
    })
})
