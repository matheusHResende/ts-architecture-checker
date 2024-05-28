import { Importation } from "./importation"
import { Entity } from "./entity"
import { CustomType } from "./custom_type"


export class TypeScriptModule {
    moduleName: string
    importations: Map<string, Importation>
    entities: Map<string, Entity[]>
    types: Map<string, CustomType[]>

    constructor(moduleName: string) {
        this.moduleName = moduleName
        this.importations = new Map<string, Importation>()
        this.entities = new Map<string, Entity[]>()
        this.types = new Map<string, CustomType[]>()
    }

    public addImportation(importation: Importation) {
        this.importations.set(importation.getEntity(), importation)
        // console.log(importation)
    }

    public addEntity(entity: Entity) {
        let entities = this.entities.get(entity.getName())
        if (entities === undefined)
            entities = []
        this.entities.set(entity.getName(), [...entities, entity])
        // console.log(entity)
    }

    public addCustomType(type: CustomType) {
        let types = this.types.get(type.getName())
        if (types === undefined)
            types = []
        this.types.set(type.getName(), [...types, type])
        // console.log(type)
    }
}