import { expect } from 'code'
import * as Lab from 'lab'
import {
    header,
    MarkdownHeaders,
    transformField,
} from '../../main/markdown'

export const lab = Lab.script()

const describe = lab.describe
const it = lab.it
const before = lab.before

describe('When generating markdown for header1', () => {
    const head = header('Hello world', MarkdownHeaders.HeaderLevel1)

    it('should have a string with a leading #', () => {
        expect(transformField(head)).to.contain('# ')
    })

    it('should contain # and value', () => {
        expect(transformField(head)).to.equal('# Hello world\n\n')
    })
})

describe('When generating markdown for header2', () => {
    const head = header('Hello world', MarkdownHeaders.HeaderLevel2)

    it('should have a string with a leading ##', () => {
        expect(transformField(head)).to.contain('## ')
    })
})
