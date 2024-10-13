/**
 * Paste into the chrome developer tools console on: https://meganesu.github.io/generate-gb-opcodes/
 */

const opcodes = []
const table1 = document.querySelector("body > table:nth-child(4) > tbody")
const rows = table1.querySelectorAll("tr")

rows.forEach((row, rIndex) => {
    if (rIndex === 0) return // Skip header row

    const columns = row.querySelectorAll("td")

    columns.forEach((cell, cIndex) => {
        if (cIndex === 0) return // Skip first column

        const rIndexHex = (rIndex - 1).toString(16).toUpperCase()
        const cIndexHex = (cIndex - 1).toString(16).toUpperCase()
        const content = cell.innerHTML.split('<br>')

        const [length, , cycles] = (content[1] ?? "").trim().split("&nbsp;")
        const flags = (content[2] ?? "").trim().split(" ")



        const opcode = {
            code: `0x${rIndexHex}${cIndexHex}`,
            instruction: parseInstruction(content[0] ?? "".trim()),
            instructionM: content[0] ?? "".trim(),
            length: length || '',
            cycles: cycles || '',
            flags: flags || []
        }

        if (cycles === undefined)
            return

        opcodes.push(opcode)
    })
})
console.log(opcodes)

const funcs = opcodes.map(opcode => createFunction(opcode))
const fFuncs = funcs.filter((v) => { return v !== "" })
console.log(funcs.join("\n\n"))
console.log(`${fFuncs.length}/${funcs.length}`)

// const instructionCounts = {}
// const instructions = opcodes.map((v) => { return v.instruction.operation })
// instructions.forEach((i) => {
//     if (!instructionCounts.hasOwnProperty(i)) {
//         instructionCounts[i] = 1
//     }
//     else {
//         instructionCounts[i] += 1
//     }
// })
// console.log(instructionCounts)
/*
ADC: 9✅
ADD: 14✅
AND: 9✅
CALL: 5✅
CCF: 1✅
CP: 9✅
CPL: 1✅
DAA: 1✅
DEC: 12✅
DI: 1✅
EI: 1✅
HALT: 1✅
INC: 12✅
JP: 6✅
JR: 5✅
LD: 90✅
LDH: 2✅
NOP: 1✅
OR: 9✅
POP: 4✅
PREFIX: 1❌
PUSH: 4✅
RET: 5✅
RETI: 1✅
RLA: 1✅
RLCA: 1✅
RRA: 1✅
RRCA: 1✅
RST: 8✅
SBC: 9✅
SCF: 1✅
STOP: 1✅
SUB: 9✅
XOR: 9✅
*/


function parseInstruction(string) {
    const [operation, params] = string.split(" ")
    return {
        operation: operation || "",
        params: (params ?? "").split(",").map(p => p.trim())
    }
}

function createFunction(opcode) {
    const param1 = opcode.instruction.params[0] || ""
    const param2 = opcode.instruction.params[1] || ""
    const dataParams = ['d8', 'd16', 'a8', 'a16', 'r8']


    const cleanParam = (param) => param.replace(/^\s*\(?|[)\s]*$/g, "")

    const cleanParam1 = cleanParam(param1)
    const cleanParam2 = cleanParam(param2)


    const paramString = dataParams.includes(cleanParam1) || dataParams.includes(cleanParam2) ?
        (dataParams.includes(cleanParam1) ? cleanParam1 : cleanParam2) : ""


    return `
    /**
     * Instruction: ${opcode.code}
     * Instruction mnemonic: ${opcode.instructionM}
     * Length in bytes: ${opcode.length}
     * Duration in cycles: ${opcode.cycles}
     * Flags affected: ${opcode.flags.join(" ")}
     */
    _${opcode.code}(${paramString}) {${createCode(opcode)}
    }`.replace(/^\s*\n/gm, '')
}



/**
 * Generates the actual code for each instruction based on the parsed operation.
 * @param {object} instruction - The parsed instruction object (e.g., {operation: 'LD', params: ['A', '(HL)']}).
 * @returns {string} - The code to execute for the instruction.
 */
function createCode(opcode) {
    let { operation, params } = opcode.instruction

    const isMemoryReference = (param) => param.startsWith('(') && param.endsWith(')')

    const CPUProp = (param) => {
        if (["A", "B", "C", "D", "E", "H", "L", "SP", 'AF', 'BC', 'DE', 'HL'].includes(param))
            return `this.${param}`
        return param
    }

    params = params.map((v) => { return CPUProp(v) })

    switch (operation) {
        case 'ADD': {
            const dif = !isMemoryReference(params[1])
                ? `const val = ${params[1]}`
                : `const val = this.memory.get(${CPUProp(params[1].slice(1, -1))})`

            return `
        ${dif}
        const temp = ${params[0]} + val
        ${opcode.flags[0] === "-" ? "" : "this.F.zero = (temp & 0xFF) === 0 ? 1 : 0"}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = 0`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = ((${params[0]} & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0`}
        ${opcode.flags[3] === "-" ? "" : `this.F.carry = temp > 0xFF ? 1 : 0`}
        ${params[0]} = temp
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }


        case "SUB": {
            const dif = !isMemoryReference(params[0])
                ? `const val = ${params[0]}`
                : `const val = this.memory.get(${CPUProp(params[0].slice(1, -1))})`

            return `
        ${dif}
        const temp = this.A - val
        ${opcode.flags[0] === "-" ? "" : "(temp & 0xFF) === 0 ? 1 : 0"}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0`}
        ${opcode.flags[3] === "-" ? "" : "this.F.carry = temp < 0 ? 1 : 0"}
        this.A = temp
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "ADC": {
            const dif = !isMemoryReference(params[1])
                ? `const val = ${params[1]}`
                : `const val = this.memory.get(${CPUProp(params[1].slice(1, -1))})`

            return `
        ${dif}
        const carry = this.F.carry
        const temp = ${params[0]} + val + carry
        ${opcode.flags[0] === "-" ? "" : `this.F.zero = (temp & 0xFF) === 0 ? 1 : 0`}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = ((${params[0]} & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0`}
        ${opcode.flags[3] === "-" ? "" : `this.F.carry = temp > 0xFF ? 1 : 0`}
        ${params[0]} = temp
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "SBC": {
            const dif = !isMemoryReference(params[1])
                ? `const val = ${params[1]}`
                : `const val = this.memory.get(${CPUProp(params[1].slice(1, -1))})`

            return `
        ${dif}
        const carry = this.F.carry
        const temp = ${params[0]} - val - carry
        ${opcode.flags[0] === "-" ? "" : `this.F.zero = (temp & 0xFF) === 0 ? 1 : 0`}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = ((${params[0]} & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0`}
        ${opcode.flags[3] === "-" ? "" : `this.F.carry = temp < 0 ? 1 : 0`}
        ${params[0]} = temp
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "LD" || "LDH": {
            if (isMemoryReference(params[0])) {
                return `
        this.memory.set(${CPUProp(params[0].replace(/[+-]/g, "").slice(1, -1))}, ${params[1]})
        ${params[0].includes("+") ? `${CPUProp(params[0].replace(/[+-]/g, "").slice(1, -1))} += 1` : ""}
        ${params[0].includes("-") ? `${CPUProp(params[0].replace(/[+-]/g, "").slice(1, -1))} -= 1` : ""}
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
            }
            else if (isMemoryReference(params[1])) {
                return `
        ${params[0]} = this.memory.get(${CPUProp(params[1].replace(/[+-]/g, "").slice(1, -1))})
        ${params[1].includes("+") ? `${CPUProp(params[1].replace(/[+-]/g, "").slice(1, -1))} += 1` : ""}
        ${params[1].includes("-") ? `${CPUProp(params[1].replace(/[+-]/g, "").slice(1, -1))} -= 1` : ""}
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
            }
            return `
        ${params[0]} = ${params[1]}
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "INC": {
            return `
        const temp = ${params[0]} + 1
        ${opcode.flags[0] === "-" ? "" : `this.F.zero = (${params[0]} & 0xFF) === 0 ? 1 : 0`}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = (${params[0]} & 0x0F) === 0x0F ? 1 : 0`}
        ${opcode.flags[3] === "-" ? "" : ``}
        ${params[0]} = temp
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "DEC": {
            return `
        const temp = ${params[0]} - 1
        ${opcode.flags[0] === "-" ? "" : `this.F.zero = (${params[0]} & 0xFF) === 0 ? 1 : 0`}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = (${params[0]} & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0`}
        ${opcode.flags[3] === "-" ? "" : ``}
        ${params[0]} = temp
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "AND": {
            return `
        this.A &= ${params[0]}
        ${opcode.flags[0] === "-" ? "" : `this.F.zero = this.A === 0 ? 1 : 0`}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = ${opcode.flags[2]}`}
        ${opcode.flags[3] === "-" ? "" : `this.F.carry = ${opcode.flags[3]}`}
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "OR": {
            return `
        this.A |= ${params[0]}
        ${opcode.flags[0] === "-" ? "" : `this.F.zero = this.A === 0 ? 1 : 0`}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = ${opcode.flags[2]}`}
        ${opcode.flags[3] === "-" ? "" : `this.F.carry = ${opcode.flags[3]}`}
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "XOR": {
            return `
        this.A ^= ${params[0]}
        ${opcode.flags[0] === "-" ? "" : `this.F.zero = this.A === 0 ? 1 : 0`}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = ${opcode.flags[2]}`}
        ${opcode.flags[3] === "-" ? "" : `this.F.carry = ${opcode.flags[3]}`}
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "CP": {
            return `
        const temp = this.A - ${params[0]}
        ${opcode.flags[0] === "-" ? "" : `this.F.zero = (temp & 0xFF) === 0 ? 1 : 0`}
        ${opcode.flags[1] === "-" ? "" : `this.F.subtract = ${opcode.flags[1]}`}
        ${opcode.flags[2] === "-" ? "" : `this.F.halfCarry = ((this.A & 0xF) - (${params[0]} & 0xF)) < 0 ? 1 : 0`}
        ${opcode.flags[3] === "-" ? "" : `this.F.carry = this.A < ${params[0]} ? 1 : 0`}
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "JR": {
            let condition
            switch (params[0]) {
                case "NZ":
                    condition = "this.F.zero === 0"
                    break
                case "NC":
                    condition = "this.F.carry === 0"
                    break
                case "Z":
                    condition = "this.F.zero === 1"
                    break
                case "this.C":
                    condition = "this.F.carry === 1"
                    break
                case "r8":
                    condition = true
                    break
            }
            return `
        if (${condition}) { 
            this.PC += this._signedValue(r8)
            this.cycles += ${opcode.cycles.split("/")[0]}
            return
        }
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles.split("/")[1]}`
        }

        case "RST": {
            return `
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = ${parseInt(params[0].replace('H', ''), 16)}
        this.cycles += ${opcode.cycles}
            `
        }

        case "RET": {
            let condition
            switch (params[0]) {
                case "NZ":
                    condition = "this.F.zero === 0"
                    break
                case "NC":
                    condition = "this.F.carry === 0"
                    break
                case "Z":
                    condition = "this.F.zero === 1"
                    break
                case "this.C":
                    condition = "this.F.carry === 1"
                    break
                default:
                    condition = true
                    break
            }
            return `
        if (${condition}) {
            this.SP += 1
            const lowByte = this.memory.get(this.SP)
            this.SP += 1
            const highByte = this.memory.get(this.SP)
            this.PC = (highByte << 8) | lowByte
            this.cycles += ${opcode.cycles.split("/")[0]}
            return
        }
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles.split("/")[1]}`
        }

        case "JP": {
            let condition
            switch (params[0]) {
                case "NZ":
                    condition = "this.F.zero === 0"
                    break
                case "NC":
                    condition = "this.F.carry === 0"
                    break
                case "Z":
                    condition = "this.F.zero === 1"
                    break
                case "this.C":
                    condition = "this.F.carry === 1"
                    break
                case "a16":
                    condition = true
                    break
                case "(HL)": {
                    return `
        this.PC = this.HL
        this.cycles += ${opcode.cycles}
                    `
                }
            }
            return `
        if (${condition}) { 
            const lowByte = this.memory.get(this.PC + 1)  
            const highByte = this.memory.get(this.PC + 2)   
            const address = (highByte << 8) | lowByte
            this.PC = address
            this.cycles += ${opcode.cycles.split("/")[0]}
            return
        } 
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles.split("/")[1]}`
        }

        case "CALL": {
            let condition
            switch (params[0]) {
                case "NZ":
                    condition = "this.F.zero === 0"
                    break
                case "NC":
                    condition = "this.F.carry === 0"
                    break
                case "Z":
                    condition = "this.F.zero === 1"
                    break
                case "this.C":
                    condition = "this.F.carry === 1"
                    break
                case "a16":
                    condition = true
                    break
            }
            return `
        if (${condition}) { 
            const lowByte = this.memory.get(this.PC + 1)  
            const highByte = this.memory.get(this.PC + 2)   
            const address = (highByte << 8) | lowByte
            this.memory.set(this.SP - 1, (this.PC + 3) & 0xFF)    
            this.memory.set(this.SP - 2, (this.PC + 3) >> 8)      
            this.SP -= 2
            this.PC = address
            this.cycles += ${opcode.cycles.split("/")[0]}
            return
        } 
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles.split("/")[1]}`
        }

        case "POP": {
            return `
        ${params[0]} = this.memory.get(this.SP)
        this.SP += 1
        ${params[0]} |= this.memory.get(this.SP)
        this.SP += 1
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "PUSH": {
            return `
        this.SP -= 1
        this.memory.set(this.SP, (${params[0]} >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, ${params[0]} & 0xFF)
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "CCF": {
            return `
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = !this.F.carry
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}
            `
        }

        case "CPL": {
            return `
        this.A = ~this.A & 0xFF
        this.F.subtract = 1
        this.F.halfCarry = 1
        this.F.zero = this.A === 0 ? 1 : 0
        his.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "DAA": {
            return `
        if ((this.A & 0x0F) > 9 || this.F.halfCarry) {
            this.A += 0x06
        }
        if ((this.A & 0xF0) > 0x90 || this.F.carry) {
            this.A += 0x60
            this.F.carry = 1
        } else {
            this.F.carry = 0
        }
        this.F.zero = (this.A === 0) ? 1 : 0
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}
            `
        }

        case "DI": {
            return `
        this.IME = false
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "EI": {
            return `
        this.IME = true
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "HALT": {
            return `
        this.haltMode = true
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "NOP": {
            return `
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "RETI": {
            return `
        const lowByte = this.memory[this.SP]
        this.SP += 1
        const highByte = this.memory[this.SP]
        this.SP += 1
        this.PC = (highByte << 8) | lowByte
        this.IME = true
        this.cycles += ${opcode.cycles}`
        }

        case "RLA": {
            return `
        const carry = this.F.carry
        this.F.carry = (this.A >> 7) & 0x01
        this.A = (this.A << 1) | carry
        this.F.zero = (this.A === 0) ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "RLCA": {
            return `
        const msb = (this.A >> 7) & 0x01
        this.A = (this.A << 1) | msb
        this.F.zero = (this.A === 0) ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = msb
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "RRA": {
            return `
        const lsb  = this.A & 0x01
        this.A = (this.F.carry  << 7) | (this.A >> 1)
        this.F.zero = (this.A === 0) ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = lsb
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "RRCA": {
            return `
        const lsb  = this.A & 0x01
        this.A = (this.A >> 1) | (msb << 7)
        this.F.zero = (this.A === 0) ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = lsb
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "SCF": {
            return `
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 1
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        case "STOP": {
            return `
        this.PC += ${opcode.length}
        this.cycles += ${opcode.cycles}`
        }

        default:
            return `
            // Unhandled operation: ${operation}
            this.PC += 1
            `
    }
}

