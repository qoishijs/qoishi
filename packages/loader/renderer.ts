import { Context } from 'qoishi'
import * as qoishi from 'qoishi/renderer'

const app = new Context()
app.plugin(qoishi)
app.start()
