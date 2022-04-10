import { Project } from "./parser/project"
import { Ruler } from "./ruler/ruler"

const project = new Project('.')

const ruler = new Ruler('../examples/typescript-crud-example/strict_layered_rules.json', project)

ruler.getDrifts()