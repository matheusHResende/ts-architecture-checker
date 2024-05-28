type Type = number

interface Interface {
    propertySignature: Type
}

class Class implements Interface {
    propertyDeclaration: Type
    propertySignature: Type;

    constructor(parameter: Type) {
        this.propertyDeclaration = parameter
        this.propertySignature = parameter
    }
}

class Class2 extends Class {

}

var variable = 1;
let variable2 = new Class(variable);
const objectVariable = {
    key: variable2,
}

function soma(a: number, b: number) {
    return a + b
}

const somaArrow = (a: number, b: number) => a + b

