class Memory {
    constructor() {

    }

    set(location, value) {

    }

    get(location) {

    }
}

class CPU {

    constructor(memory = new Memory(), debugging = false) {
        this.debugging = debugging
        this._A = 0
        this._B = 0
        this._C = 0
        this._D = 0
        this._E = 0
        this._H = 0
        this._L = 0
        this.F = {
            zero: 0,
            subtract: 0,
            halfCarry: 0,
            carry: 0
        }
        this._SP = 0
        this._PC = 0

        this.IME = false
        this.haltMode = false

        this.memory = memory
        this.cycles
    }

    step() {
        if (this.debugging)
            this.debugger()
    }

    execute(opcode) {
        const top = (opcode >> 8)
        const bottom = opcode & 0xFF
        if (top === 0xCB) {
            return
        }
        const topHex = top.toString(16).toUpperCase().padStart(2, 0)
        this[`_0x${topHex}`](bottom)
    }

    debugger() {
        const event = new CustomEvent('CPU-debug', {
            detail: {
                A: this.A,
                B: this.B,
                C: this.C,
                D: this.D,
                E: this.E,
                H: this.H,
                L: this.L,
                F: this.F,
                SP: this.SP,
                PC: this.PC,
                AF: this.AF,
                BC: this.BC,
                DE: this.DE,
                HL: this.HL
            }
        })
        document.dispatchEvent(event)
    }

    //#region SET/GET

    set A(data) {
        this._A = data & 0xFF
    }

    get A() {
        this._A
    }

    set B(data) {
        this._B = data & 0xFF
    }

    get B() {
        this._B
    }

    set C(data) {
        this._C = data & 0xFF
    }

    get C() {
        this._C
    }

    set D(data) {
        this._D = data & 0xFF
    }

    get D() {
        this._D
    }

    set E(data) {
        this._E = data & 0xFF
    }

    get E() {
        this._E
    }

    set H(data) {
        this._H = data & 0xFF
    }

    get H() {
        this._H
    }

    set L(data) {
        this._L = data & 0xFF
    }

    get L() {
        this._L
    }

    set SP(data) {
        this._SP = data & 0xFFFF
    }

    get SP() {
        return this._SP
    }

    set PC(data) {
        this._PC = data & 0xFFFF
    }

    get PC() {
        return this._PC
    }

    set AF(data) {
        this.A = (data >> 8)
        this.F.zero = (data >> 7) & 0x01
        this.F.subtract = (data >> 6) & 0x01
        this.F.halfCarry = (data >> 5) & 0x01
        this.F.carry = (data >> 4) & 0x01
    }

    get AF() {
        const F = `${this.F.zero}${this.F.subtract}${this.F.halfCarry}${this.F.carry}0000`
        return (this.A << 8) | parseInt(F, 2)
    }

    set BC(data) {
        this.B = (data >> 8)
        this.C = data
    }

    get BC() {
        return (this.B << 8) | this.C
    }

    set DE(data) {
        this.D = (data >> 8)
        this.E = data
    }

    get DE() {
        return (this.D << 8) | this.E
    }

    set HL(data) {
        this.H = (data >> 8)
        this.L = data
    }

    get HL() {
        return (this.H << 8) | this.L
    }

    //#endregion SET/GET

    /*
        https://gbdev.io/gb-opcodes/optables/
        https://meganesu.github.io/generate-gb-opcodes/
        https://pastraiser.com/cpu/gameboy/gameboy_opcodes.html
    */

    _signedValue(value) {
        return (value & 0x80) ? value - 0x100 : value
    }

    //#region opcodes

    /**
     * Instruction: 0x00
     * Instruction mnemonic: NOP
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x00() {
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x01
     * Instruction mnemonic: LD BC,d16
     * Length in bytes: 3
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0x01(d16) {
        this.BC = d16
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0x02
     * Instruction mnemonic: LD (BC),A
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x02() {
        this.memory.set(this.BC, this.A)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x03
     * Instruction mnemonic: INC BC
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x03() {
        const temp = this.BC + 1
        this.BC = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x04
     * Instruction mnemonic: INC B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H -
     */
    _0x04() {
        const temp = this.B + 1
        this.F.zero = (this.B & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = (this.B & 0x0F) === 0x0F ? 1 : 0
        this.B = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x05
     * Instruction mnemonic: DEC B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H -
     */
    _0x05() {
        const temp = this.B - 1
        this.F.zero = (this.B & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = (this.B & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0
        this.B = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x06
     * Instruction mnemonic: LD B,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x06(d8) {
        this.B = d8
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x07
     * Instruction mnemonic: RLCA
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: 0 0 0 C
     */
    _0x07() {
        const msb = (this.A >> 7) & 0x01
        this.A = (this.A << 1) | msb
        this.F.zero = (this.A === 0) ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = msb
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x08
     * Instruction mnemonic: LD (a16),SP
     * Length in bytes: 3
     * Duration in cycles: 20
     * Flags affected: - - - -
     */
    _0x08(a16) {
        this.memory.set(a16, this.SP)
        this.PC += 3
        this.cycles += 20
    }

    /**
     * Instruction: 0x09
     * Instruction mnemonic: ADD HL,BC
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - 0 H C
     */
    _0x09() {
        const val = this.BC
        const temp = this.HL + val
        this.F.subtract = 0
        this.F.halfCarry = ((this.HL & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.HL = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x0A
     * Instruction mnemonic: LD A,(BC)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x0A() {
        this.A = this.memory.get(this.BC)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x0B
     * Instruction mnemonic: DEC BC
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x0B() {
        const temp = this.BC - 1
        this.BC = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x0C
     * Instruction mnemonic: INC C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H -
     */
    _0x0C() {
        const temp = this.C + 1
        this.F.zero = (this.C & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = (this.C & 0x0F) === 0x0F ? 1 : 0
        this.C = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x0D
     * Instruction mnemonic: DEC C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H -
     */
    _0x0D() {
        const temp = this.C - 1
        this.F.zero = (this.C & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = (this.C & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0
        this.C = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x0E
     * Instruction mnemonic: LD C,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x0E(d8) {
        this.C = d8
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x0F
     * Instruction mnemonic: RRCA
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: 0 0 0 C
     */
    _0x0F() {
        const lsb = this.A & 0x01
        this.A = (this.A >> 1) | (msb << 7)
        this.F.zero = (this.A === 0) ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = lsb
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x10
     * Instruction mnemonic: STOP 0
     * Length in bytes: 2
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x10() {
        this.PC += 2
        this.cycles += 4
    }

    /**
     * Instruction: 0x11
     * Instruction mnemonic: LD DE,d16
     * Length in bytes: 3
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0x11(d16) {
        this.DE = d16
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0x12
     * Instruction mnemonic: LD (DE),A
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x12() {
        this.memory.set(this.DE, this.A)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x13
     * Instruction mnemonic: INC DE
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x13() {
        const temp = this.DE + 1
        this.DE = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x14
     * Instruction mnemonic: INC D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H -
     */
    _0x14() {
        const temp = this.D + 1
        this.F.zero = (this.D & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = (this.D & 0x0F) === 0x0F ? 1 : 0
        this.D = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x15
     * Instruction mnemonic: DEC D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H -
     */
    _0x15() {
        const temp = this.D - 1
        this.F.zero = (this.D & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = (this.D & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0
        this.D = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x16
     * Instruction mnemonic: LD D,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x16(d8) {
        this.D = d8
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x17
     * Instruction mnemonic: RLA
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: 0 0 0 C
     */
    _0x17() {
        const carry = this.F.carry
        this.F.carry = (this.A >> 7) & 0x01
        this.A = (this.A << 1) | carry
        this.F.zero = (this.A === 0) ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x18
     * Instruction mnemonic: JR r8
     * Length in bytes: 2
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0x18(r8) {
        if (true) {
            this.PC += this._signedValue(r8)
            this.cycles += 12
            return
        }
        this.PC += 2
        this.cycles += undefined
    }

    /**
     * Instruction: 0x19
     * Instruction mnemonic: ADD HL,DE
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - 0 H C
     */
    _0x19() {
        const val = this.DE
        const temp = this.HL + val
        this.F.subtract = 0
        this.F.halfCarry = ((this.HL & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.HL = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x1A
     * Instruction mnemonic: LD A,(DE)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x1A() {
        this.A = this.memory.get(this.DE)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x1B
     * Instruction mnemonic: DEC DE
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x1B() {
        const temp = this.DE - 1
        this.DE = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x1C
     * Instruction mnemonic: INC E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H -
     */
    _0x1C() {
        const temp = this.E + 1
        this.F.zero = (this.E & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = (this.E & 0x0F) === 0x0F ? 1 : 0
        this.E = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x1D
     * Instruction mnemonic: DEC E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H -
     */
    _0x1D() {
        const temp = this.E - 1
        this.F.zero = (this.E & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = (this.E & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0
        this.E = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x1E
     * Instruction mnemonic: LD E,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x1E(d8) {
        this.E = d8
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x1F
     * Instruction mnemonic: RRA
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: 0 0 0 C
     */
    _0x1F() {
        const lsb = this.A & 0x01
        this.A = (this.F.carry << 7) | (this.A >> 1)
        this.F.zero = (this.A === 0) ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = lsb
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x20
     * Instruction mnemonic: JR NZ,r8
     * Length in bytes: 2
     * Duration in cycles: 12/8
     * Flags affected: - - - -
     */
    _0x20(r8) {
        if (this.F.zero === 0) {
            this.PC += this._signedValue(r8)
            this.cycles += 12
            return
        }
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x21
     * Instruction mnemonic: LD HL,d16
     * Length in bytes: 3
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0x21(d16) {
        this.HL = d16
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0x22
     * Instruction mnemonic: LD (HL+),A
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x22() {
        this.memory.set(this.HL, this.A)
        this.HL += 1
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x23
     * Instruction mnemonic: INC HL
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x23() {
        const temp = this.HL + 1
        this.HL = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x24
     * Instruction mnemonic: INC H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H -
     */
    _0x24() {
        const temp = this.H + 1
        this.F.zero = (this.H & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = (this.H & 0x0F) === 0x0F ? 1 : 0
        this.H = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x25
     * Instruction mnemonic: DEC H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H -
     */
    _0x25() {
        const temp = this.H - 1
        this.F.zero = (this.H & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = (this.H & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0
        this.H = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x26
     * Instruction mnemonic: LD H,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x26(d8) {
        this.H = d8
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x27
     * Instruction mnemonic: DAA
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z - 0 C
     */
    _0x27() {
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
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x28
     * Instruction mnemonic: JR Z,r8
     * Length in bytes: 2
     * Duration in cycles: 12/8
     * Flags affected: - - - -
     */
    _0x28(r8) {
        if (this.F.zero === 1) {
            this.PC += this._signedValue(r8)
            this.cycles += 12
            return
        }
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x29
     * Instruction mnemonic: ADD HL,HL
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - 0 H C
     */
    _0x29() {
        const val = this.HL
        const temp = this.HL + val
        this.F.subtract = 0
        this.F.halfCarry = ((this.HL & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.HL = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x2A
     * Instruction mnemonic: LD A,(HL+)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x2A() {
        this.A = this.memory.get(this.HL)
        this.HL += 1
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x2B
     * Instruction mnemonic: DEC HL
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x2B() {
        const temp = this.HL - 1
        this.HL = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x2C
     * Instruction mnemonic: INC L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H -
     */
    _0x2C() {
        const temp = this.L + 1
        this.F.zero = (this.L & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = (this.L & 0x0F) === 0x0F ? 1 : 0
        this.L = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x2D
     * Instruction mnemonic: DEC L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H -
     */
    _0x2D() {
        const temp = this.L - 1
        this.F.zero = (this.L & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = (this.L & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0
        this.L = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x2E
     * Instruction mnemonic: LD L,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x2E(d8) {
        this.L = d8
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x2F
     * Instruction mnemonic: CPL
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - 1 1 -
     */
    _0x2F() {
        this.A = ~this.A & 0xFF
        this.F.subtract = 1
        this.F.halfCarry = 1
        this.F.zero = this.A === 0 ? 1 : 0
        his.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x30
     * Instruction mnemonic: JR NC,r8
     * Length in bytes: 2
     * Duration in cycles: 12/8
     * Flags affected: - - - -
     */
    _0x30(r8) {
        if (this.F.carry === 0) {
            this.PC += this._signedValue(r8)
            this.cycles += 12
            return
        }
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x31
     * Instruction mnemonic: LD SP,d16
     * Length in bytes: 3
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0x31(d16) {
        this.SP = d16
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0x32
     * Instruction mnemonic: LD (HL-),A
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x32() {
        this.memory.set(this.HL, this.A)
        this.HL -= 1
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x33
     * Instruction mnemonic: INC SP
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x33() {
        const temp = this.SP + 1
        this.SP = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x34
     * Instruction mnemonic: INC (HL)
     * Length in bytes: 1
     * Duration in cycles: 12
     * Flags affected: Z 0 H -
     */
    _0x34() {
        const temp = (HL) + 1
        this.F.zero = ((HL) & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((HL) & 0x0F) === 0x0F ? 1 : 0
            (HL) = temp
        this.PC += 1
        this.cycles += 12
    }

    /**
     * Instruction: 0x35
     * Instruction mnemonic: DEC (HL)
     * Length in bytes: 1
     * Duration in cycles: 12
     * Flags affected: Z 1 H -
     */
    _0x35() {
        const temp = (HL) - 1
        this.F.zero = ((HL) & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((HL) & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0
            (HL) = temp
        this.PC += 1
        this.cycles += 12
    }

    /**
     * Instruction: 0x36
     * Instruction mnemonic: LD (HL),d8
     * Length in bytes: 2
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0x36(d8) {
        this.memory.set(this.HL, d8)
        this.PC += 2
        this.cycles += 12
    }

    /**
     * Instruction: 0x37
     * Instruction mnemonic: SCF
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - 0 0 1
     */
    _0x37() {
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 1
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x38
     * Instruction mnemonic: JR C,r8
     * Length in bytes: 2
     * Duration in cycles: 12/8
     * Flags affected: - - - -
     */
    _0x38(r8) {
        if (this.F.carry === 1) {
            this.PC += this._signedValue(r8)
            this.cycles += 12
            return
        }
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x39
     * Instruction mnemonic: ADD HL,SP
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - 0 H C
     */
    _0x39() {
        const val = this.SP
        const temp = this.HL + val
        this.F.subtract = 0
        this.F.halfCarry = ((this.HL & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.HL = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x3A
     * Instruction mnemonic: LD A,(HL-)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x3A() {
        this.A = this.memory.get(this.HL)
        this.HL -= 1
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x3B
     * Instruction mnemonic: DEC SP
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x3B() {
        const temp = this.SP - 1
        this.SP = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x3C
     * Instruction mnemonic: INC A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H -
     */
    _0x3C() {
        const temp = this.A + 1
        this.F.zero = (this.A & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = (this.A & 0x0F) === 0x0F ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x3D
     * Instruction mnemonic: DEC A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H -
     */
    _0x3D() {
        const temp = this.A - 1
        this.F.zero = (this.A & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = (this.A & 0x0F) === 0 && (temp & 0x0F) === 0x0F ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x3E
     * Instruction mnemonic: LD A,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x3E(d8) {
        this.A = d8
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0x3F
     * Instruction mnemonic: CCF
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - 0 0 C
     */
    _0x3F() {
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = !this.F.carry
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x40
     * Instruction mnemonic: LD B,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x40() {
        this.B = this.B
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x41
     * Instruction mnemonic: LD B,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x41() {
        this.B = this.C
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x42
     * Instruction mnemonic: LD B,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x42() {
        this.B = this.D
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x43
     * Instruction mnemonic: LD B,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x43() {
        this.B = this.E
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x44
     * Instruction mnemonic: LD B,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x44() {
        this.B = this.H
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x45
     * Instruction mnemonic: LD B,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x45() {
        this.B = this.L
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x46
     * Instruction mnemonic: LD B,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x46() {
        this.B = this.memory.get(this.HL)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x47
     * Instruction mnemonic: LD B,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x47() {
        this.B = this.A
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x48
     * Instruction mnemonic: LD C,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x48() {
        this.C = this.B
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x49
     * Instruction mnemonic: LD C,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x49() {
        this.C = this.C
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x4A
     * Instruction mnemonic: LD C,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x4A() {
        this.C = this.D
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x4B
     * Instruction mnemonic: LD C,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x4B() {
        this.C = this.E
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x4C
     * Instruction mnemonic: LD C,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x4C() {
        this.C = this.H
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x4D
     * Instruction mnemonic: LD C,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x4D() {
        this.C = this.L
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x4E
     * Instruction mnemonic: LD C,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x4E() {
        this.C = this.memory.get(this.HL)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x4F
     * Instruction mnemonic: LD C,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x4F() {
        this.C = this.A
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x50
     * Instruction mnemonic: LD D,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x50() {
        this.D = this.B
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x51
     * Instruction mnemonic: LD D,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x51() {
        this.D = this.C
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x52
     * Instruction mnemonic: LD D,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x52() {
        this.D = this.D
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x53
     * Instruction mnemonic: LD D,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x53() {
        this.D = this.E
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x54
     * Instruction mnemonic: LD D,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x54() {
        this.D = this.H
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x55
     * Instruction mnemonic: LD D,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x55() {
        this.D = this.L
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x56
     * Instruction mnemonic: LD D,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x56() {
        this.D = this.memory.get(this.HL)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x57
     * Instruction mnemonic: LD D,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x57() {
        this.D = this.A
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x58
     * Instruction mnemonic: LD E,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x58() {
        this.E = this.B
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x59
     * Instruction mnemonic: LD E,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x59() {
        this.E = this.C
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x5A
     * Instruction mnemonic: LD E,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x5A() {
        this.E = this.D
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x5B
     * Instruction mnemonic: LD E,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x5B() {
        this.E = this.E
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x5C
     * Instruction mnemonic: LD E,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x5C() {
        this.E = this.H
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x5D
     * Instruction mnemonic: LD E,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x5D() {
        this.E = this.L
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x5E
     * Instruction mnemonic: LD E,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x5E() {
        this.E = this.memory.get(this.HL)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x5F
     * Instruction mnemonic: LD E,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x5F() {
        this.E = this.A
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x60
     * Instruction mnemonic: LD H,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x60() {
        this.H = this.B
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x61
     * Instruction mnemonic: LD H,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x61() {
        this.H = this.C
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x62
     * Instruction mnemonic: LD H,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x62() {
        this.H = this.D
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x63
     * Instruction mnemonic: LD H,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x63() {
        this.H = this.E
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x64
     * Instruction mnemonic: LD H,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x64() {
        this.H = this.H
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x65
     * Instruction mnemonic: LD H,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x65() {
        this.H = this.L
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x66
     * Instruction mnemonic: LD H,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x66() {
        this.H = this.memory.get(this.HL)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x67
     * Instruction mnemonic: LD H,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x67() {
        this.H = this.A
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x68
     * Instruction mnemonic: LD L,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x68() {
        this.L = this.B
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x69
     * Instruction mnemonic: LD L,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x69() {
        this.L = this.C
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x6A
     * Instruction mnemonic: LD L,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x6A() {
        this.L = this.D
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x6B
     * Instruction mnemonic: LD L,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x6B() {
        this.L = this.E
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x6C
     * Instruction mnemonic: LD L,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x6C() {
        this.L = this.H
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x6D
     * Instruction mnemonic: LD L,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x6D() {
        this.L = this.L
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x6E
     * Instruction mnemonic: LD L,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x6E() {
        this.L = this.memory.get(this.HL)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x6F
     * Instruction mnemonic: LD L,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x6F() {
        this.L = this.A
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x70
     * Instruction mnemonic: LD (HL),B
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x70() {
        this.memory.set(this.HL, this.B)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x71
     * Instruction mnemonic: LD (HL),C
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x71() {
        this.memory.set(this.HL, this.C)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x72
     * Instruction mnemonic: LD (HL),D
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x72() {
        this.memory.set(this.HL, this.D)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x73
     * Instruction mnemonic: LD (HL),E
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x73() {
        this.memory.set(this.HL, this.E)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x74
     * Instruction mnemonic: LD (HL),H
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x74() {
        this.memory.set(this.HL, this.H)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x75
     * Instruction mnemonic: LD (HL),L
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x75() {
        this.memory.set(this.HL, this.L)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x76
     * Instruction mnemonic: HALT
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x76() {
        this.haltMode = true
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x77
     * Instruction mnemonic: LD (HL),A
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x77() {
        this.memory.set(this.HL, this.A)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x78
     * Instruction mnemonic: LD A,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x78() {
        this.A = this.B
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x79
     * Instruction mnemonic: LD A,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x79() {
        this.A = this.C
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x7A
     * Instruction mnemonic: LD A,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x7A() {
        this.A = this.D
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x7B
     * Instruction mnemonic: LD A,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x7B() {
        this.A = this.E
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x7C
     * Instruction mnemonic: LD A,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x7C() {
        this.A = this.H
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x7D
     * Instruction mnemonic: LD A,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x7D() {
        this.A = this.L
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x7E
     * Instruction mnemonic: LD A,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0x7E() {
        this.A = this.memory.get(this.HL)
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x7F
     * Instruction mnemonic: LD A,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0x7F() {
        this.A = this.A
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x80
     * Instruction mnemonic: ADD A,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x80() {
        const val = this.B
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x81
     * Instruction mnemonic: ADD A,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x81() {
        const val = this.C
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x82
     * Instruction mnemonic: ADD A,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x82() {
        const val = this.D
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x83
     * Instruction mnemonic: ADD A,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x83() {
        const val = this.E
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x84
     * Instruction mnemonic: ADD A,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x84() {
        const val = this.H
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x85
     * Instruction mnemonic: ADD A,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x85() {
        const val = this.L
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x86
     * Instruction mnemonic: ADD A,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: Z 0 H C
     */
    _0x86() {
        const val = this.memory.get(this.HL)
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x87
     * Instruction mnemonic: ADD A,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x87() {
        const val = this.A
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x88
     * Instruction mnemonic: ADC A,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x88() {
        const val = this.B
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x89
     * Instruction mnemonic: ADC A,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x89() {
        const val = this.C
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x8A
     * Instruction mnemonic: ADC A,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x8A() {
        const val = this.D
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x8B
     * Instruction mnemonic: ADC A,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x8B() {
        const val = this.E
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x8C
     * Instruction mnemonic: ADC A,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x8C() {
        const val = this.H
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x8D
     * Instruction mnemonic: ADC A,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x8D() {
        const val = this.L
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x8E
     * Instruction mnemonic: ADC A,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: Z 0 H C
     */
    _0x8E() {
        const val = this.memory.get(this.HL)
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x8F
     * Instruction mnemonic: ADC A,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 H C
     */
    _0x8F() {
        const val = this.A
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x90
     * Instruction mnemonic: SUB B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x90() {
        const val = this.B
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x91
     * Instruction mnemonic: SUB C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x91() {
        const val = this.C
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x92
     * Instruction mnemonic: SUB D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x92() {
        const val = this.D
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x93
     * Instruction mnemonic: SUB E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x93() {
        const val = this.E
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x94
     * Instruction mnemonic: SUB H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x94() {
        const val = this.H
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x95
     * Instruction mnemonic: SUB L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x95() {
        const val = this.L
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x96
     * Instruction mnemonic: SUB (HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: Z 1 H C
     */
    _0x96() {
        const val = this.memory.get(this.HL)
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x97
     * Instruction mnemonic: SUB A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x97() {
        const val = this.A
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x98
     * Instruction mnemonic: SBC A,B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x98() {
        const val = this.B
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x99
     * Instruction mnemonic: SBC A,C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x99() {
        const val = this.C
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x9A
     * Instruction mnemonic: SBC A,D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x9A() {
        const val = this.D
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x9B
     * Instruction mnemonic: SBC A,E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x9B() {
        const val = this.E
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x9C
     * Instruction mnemonic: SBC A,H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x9C() {
        const val = this.H
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x9D
     * Instruction mnemonic: SBC A,L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x9D() {
        const val = this.L
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0x9E
     * Instruction mnemonic: SBC A,(HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: Z 1 H C
     */
    _0x9E() {
        const val = this.memory.get(this.HL)
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0x9F
     * Instruction mnemonic: SBC A,A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0x9F() {
        const val = this.A
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA0
     * Instruction mnemonic: AND B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 1 0
     */
    _0xA0() {
        this.A &= this.B
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA1
     * Instruction mnemonic: AND C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 1 0
     */
    _0xA1() {
        this.A &= this.C
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA2
     * Instruction mnemonic: AND D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 1 0
     */
    _0xA2() {
        this.A &= this.D
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA3
     * Instruction mnemonic: AND E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 1 0
     */
    _0xA3() {
        this.A &= this.E
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA4
     * Instruction mnemonic: AND H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 1 0
     */
    _0xA4() {
        this.A &= this.H
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA5
     * Instruction mnemonic: AND L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 1 0
     */
    _0xA5() {
        this.A &= this.L
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA6
     * Instruction mnemonic: AND (HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: Z 0 1 0
     */
    _0xA6() {
        this.A &= (HL)
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xA7
     * Instruction mnemonic: AND A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 1 0
     */
    _0xA7() {
        this.A &= this.A
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA8
     * Instruction mnemonic: XOR B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xA8() {
        this.A ^= this.B
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xA9
     * Instruction mnemonic: XOR C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xA9() {
        this.A ^= this.C
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xAA
     * Instruction mnemonic: XOR D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xAA() {
        this.A ^= this.D
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xAB
     * Instruction mnemonic: XOR E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xAB() {
        this.A ^= this.E
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xAC
     * Instruction mnemonic: XOR H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xAC() {
        this.A ^= this.H
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xAD
     * Instruction mnemonic: XOR L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xAD() {
        this.A ^= this.L
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xAE
     * Instruction mnemonic: XOR (HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: Z 0 0 0
     */
    _0xAE() {
        this.A ^= (HL)
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xAF
     * Instruction mnemonic: XOR A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xAF() {
        this.A ^= this.A
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB0
     * Instruction mnemonic: OR B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xB0() {
        this.A |= this.B
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB1
     * Instruction mnemonic: OR C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xB1() {
        this.A |= this.C
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB2
     * Instruction mnemonic: OR D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xB2() {
        this.A |= this.D
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB3
     * Instruction mnemonic: OR E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xB3() {
        this.A |= this.E
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB4
     * Instruction mnemonic: OR H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xB4() {
        this.A |= this.H
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB5
     * Instruction mnemonic: OR L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xB5() {
        this.A |= this.L
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB6
     * Instruction mnemonic: OR (HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: Z 0 0 0
     */
    _0xB6() {
        this.A |= (HL)
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xB7
     * Instruction mnemonic: OR A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 0 0 0
     */
    _0xB7() {
        this.A |= this.A
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB8
     * Instruction mnemonic: CP B
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0xB8() {
        const temp = this.A - this.B
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - (this.B & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < this.B ? 1 : 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xB9
     * Instruction mnemonic: CP C
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0xB9() {
        const temp = this.A - this.C
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - (this.C & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < this.C ? 1 : 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xBA
     * Instruction mnemonic: CP D
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0xBA() {
        const temp = this.A - this.D
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - (this.D & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < this.D ? 1 : 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xBB
     * Instruction mnemonic: CP E
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0xBB() {
        const temp = this.A - this.E
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - (this.E & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < this.E ? 1 : 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xBC
     * Instruction mnemonic: CP H
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0xBC() {
        const temp = this.A - this.H
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - (this.H & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < this.H ? 1 : 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xBD
     * Instruction mnemonic: CP L
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0xBD() {
        const temp = this.A - this.L
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - (this.L & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < this.L ? 1 : 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xBE
     * Instruction mnemonic: CP (HL)
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: Z 1 H C
     */
    _0xBE() {
        const temp = this.A - (HL)
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - ((HL) & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < (HL) ? 1 : 0
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xBF
     * Instruction mnemonic: CP A
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: Z 1 H C
     */
    _0xBF() {
        const temp = this.A - this.A
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - (this.A & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < this.A ? 1 : 0
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xC0
     * Instruction mnemonic: RET NZ
     * Length in bytes: 1
     * Duration in cycles: 20/8
     * Flags affected: - - - -
     */
    _0xC0() {
        if (this.F.zero === 0) {
            this.SP += 1
            const lowByte = this.memory.get(this.SP)
            this.SP += 1
            const highByte = this.memory.get(this.SP)
            this.PC = (highByte << 8) | lowByte
            this.cycles += 20
            return
        }
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xC1
     * Instruction mnemonic: POP BC
     * Length in bytes: 1
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0xC1() {
        this.BC = this.memory.get(this.SP)
        this.SP += 1
        this.BC |= this.memory.get(this.SP)
        this.SP += 1
        this.PC += 1
        this.cycles += 12
    }

    /**
     * Instruction: 0xC2
     * Instruction mnemonic: JP NZ,a16
     * Length in bytes: 3
     * Duration in cycles: 16/12
     * Flags affected: - - - -
     */
    _0xC2(a16) {
        if (this.F.zero === 0) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.PC = address
            this.cycles += 16
            return
        }
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0xC3
     * Instruction mnemonic: JP a16
     * Length in bytes: 3
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xC3(a16) {
        if (true) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.PC = address
            this.cycles += 16
            return
        }
        this.PC += 3
        this.cycles += undefined
    }

    /**
     * Instruction: 0xC4
     * Instruction mnemonic: CALL NZ,a16
     * Length in bytes: 3
     * Duration in cycles: 24/12
     * Flags affected: - - - -
     */
    _0xC4(a16) {
        if (this.F.zero === 0) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.memory.set(this.SP - 1, (this.PC + 3) & 0xFF)
            this.memory.set(this.SP - 2, (this.PC + 3) >> 8)
            this.SP -= 2
            this.PC = address
            this.cycles += 24
            return
        }
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0xC5
     * Instruction mnemonic: PUSH BC
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xC5() {
        this.SP -= 1
        this.memory.set(this.SP, (this.BC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.BC & 0xFF)
        this.PC += 1
        this.cycles += 16
    }

    /**
     * Instruction: 0xC6
     * Instruction mnemonic: ADD A,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: Z 0 H C
     */
    _0xC6(d8) {
        const val = d8
        const temp = this.A + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xC7
     * Instruction mnemonic: RST 00H
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xC7() {
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = 0
        this.cycles += 16
    }

    /**
     * Instruction: 0xC8
     * Instruction mnemonic: RET Z
     * Length in bytes: 1
     * Duration in cycles: 20/8
     * Flags affected: - - - -
     */
    _0xC8() {
        if (this.F.zero === 1) {
            this.SP += 1
            const lowByte = this.memory.get(this.SP)
            this.SP += 1
            const highByte = this.memory.get(this.SP)
            this.PC = (highByte << 8) | lowByte
            this.cycles += 20
            return
        }
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xC9
     * Instruction mnemonic: RET
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xC9() {
        if (true) {
            this.SP += 1
            const lowByte = this.memory.get(this.SP)
            this.SP += 1
            const highByte = this.memory.get(this.SP)
            this.PC = (highByte << 8) | lowByte
            this.cycles += 16
            return
        }
        this.PC += 1
        this.cycles += undefined
    }

    /**
     * Instruction: 0xCA
     * Instruction mnemonic: JP Z,a16
     * Length in bytes: 3
     * Duration in cycles: 16/12
     * Flags affected: - - - -
     */
    _0xCA(a16) {
        if (this.F.zero === 1) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.PC = address
            this.cycles += 16
            return
        }
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0xCB
     * Instruction mnemonic: PREFIX CB
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0xCB() {
        // Unhandled operation: PREFIX
        this.PC += 1
    }

    /**
     * Instruction: 0xCC
     * Instruction mnemonic: CALL Z,a16
     * Length in bytes: 3
     * Duration in cycles: 24/12
     * Flags affected: - - - -
     */
    _0xCC(a16) {
        if (this.F.zero === 1) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.memory.set(this.SP - 1, (this.PC + 3) & 0xFF)
            this.memory.set(this.SP - 2, (this.PC + 3) >> 8)
            this.SP -= 2
            this.PC = address
            this.cycles += 24
            return
        }
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0xCD
     * Instruction mnemonic: CALL a16
     * Length in bytes: 3
     * Duration in cycles: 24
     * Flags affected: - - - -
     */
    _0xCD(a16) {
        if (true) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.memory.set(this.SP - 1, (this.PC + 3) & 0xFF)
            this.memory.set(this.SP - 2, (this.PC + 3) >> 8)
            this.SP -= 2
            this.PC = address
            this.cycles += 24
            return
        }
        this.PC += 3
        this.cycles += undefined
    }

    /**
     * Instruction: 0xCE
     * Instruction mnemonic: ADC A,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: Z 0 H C
     */
    _0xCE(d8) {
        const val = d8
        const carry = this.F.carry
        const temp = this.A + val + carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.A & 0x0F) + (val & 0x0F) + carry) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.A = temp
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xCF
     * Instruction mnemonic: RST 08H
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xCF() {
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = 8
        this.cycles += 16
    }

    /**
     * Instruction: 0xD0
     * Instruction mnemonic: RET NC
     * Length in bytes: 1
     * Duration in cycles: 20/8
     * Flags affected: - - - -
     */
    _0xD0() {
        if (this.F.carry === 0) {
            this.SP += 1
            const lowByte = this.memory.get(this.SP)
            this.SP += 1
            const highByte = this.memory.get(this.SP)
            this.PC = (highByte << 8) | lowByte
            this.cycles += 20
            return
        }
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xD1
     * Instruction mnemonic: POP DE
     * Length in bytes: 1
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0xD1() {
        this.DE = this.memory.get(this.SP)
        this.SP += 1
        this.DE |= this.memory.get(this.SP)
        this.SP += 1
        this.PC += 1
        this.cycles += 12
    }

    /**
     * Instruction: 0xD2
     * Instruction mnemonic: JP NC,a16
     * Length in bytes: 3
     * Duration in cycles: 16/12
     * Flags affected: - - - -
     */
    _0xD2(a16) {
        if (this.F.carry === 0) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.PC = address
            this.cycles += 16
            return
        }
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0xD4
     * Instruction mnemonic: CALL NC,a16
     * Length in bytes: 3
     * Duration in cycles: 24/12
     * Flags affected: - - - -
     */
    _0xD4(a16) {
        if (this.F.carry === 0) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.memory.set(this.SP - 1, (this.PC + 3) & 0xFF)
            this.memory.set(this.SP - 2, (this.PC + 3) >> 8)
            this.SP -= 2
            this.PC = address
            this.cycles += 24
            return
        }
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0xD5
     * Instruction mnemonic: PUSH DE
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xD5() {
        this.SP -= 1
        this.memory.set(this.SP, (this.DE >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.DE & 0xFF)
        this.PC += 1
        this.cycles += 16
    }

    /**
     * Instruction: 0xD6
     * Instruction mnemonic: SUB d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: Z 1 H C
     */
    _0xD6(d8) {
        const val = d8
        const temp = this.A - val
            (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F)) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xD7
     * Instruction mnemonic: RST 10H
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xD7() {
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = 16
        this.cycles += 16
    }

    /**
     * Instruction: 0xD8
     * Instruction mnemonic: RET C
     * Length in bytes: 1
     * Duration in cycles: 20/8
     * Flags affected: - - - -
     */
    _0xD8() {
        if (this.F.carry === 1) {
            this.SP += 1
            const lowByte = this.memory.get(this.SP)
            this.SP += 1
            const highByte = this.memory.get(this.SP)
            this.PC = (highByte << 8) | lowByte
            this.cycles += 20
            return
        }
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xD9
     * Instruction mnemonic: RETI
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xD9() {
        const lowByte = this.memory[this.SP]
        this.SP += 1
        const highByte = this.memory[this.SP]
        this.SP += 1
        this.PC = (highByte << 8) | lowByte
        this.IME = true
        this.cycles += 16
    }

    /**
     * Instruction: 0xDA
     * Instruction mnemonic: JP C,a16
     * Length in bytes: 3
     * Duration in cycles: 16/12
     * Flags affected: - - - -
     */
    _0xDA(a16) {
        if (this.F.carry === 1) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.PC = address
            this.cycles += 16
            return
        }
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0xDC
     * Instruction mnemonic: CALL C,a16
     * Length in bytes: 3
     * Duration in cycles: 24/12
     * Flags affected: - - - -
     */
    _0xDC(a16) {
        if (this.F.carry === 1) {
            const lowByte = this.memory.get(this.PC + 1)
            const highByte = this.memory.get(this.PC + 2)
            const address = (highByte << 8) | lowByte
            this.memory.set(this.SP - 1, (this.PC + 3) & 0xFF)
            this.memory.set(this.SP - 2, (this.PC + 3) >> 8)
            this.SP -= 2
            this.PC = address
            this.cycles += 24
            return
        }
        this.PC += 3
        this.cycles += 12
    }

    /**
     * Instruction: 0xDE
     * Instruction mnemonic: SBC A,d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: Z 1 H C
     */
    _0xDE(d8) {
        const val = d8
        const carry = this.F.carry
        const temp = this.A - val - carry
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0x0F) - (val & 0x0F) - carry) < 0 ? 1 : 0
        this.F.carry = temp < 0 ? 1 : 0
        this.A = temp
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xDF
     * Instruction mnemonic: RST 18H
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xDF() {
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = 24
        this.cycles += 16
    }

    /**
     * Instruction: 0xE0
     * Instruction mnemonic: LDH (a8),A
     * Length in bytes: 2
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0xE0(a8) {
        // Unhandled operation: LDH
        this.PC += 1
    }

    /**
     * Instruction: 0xE1
     * Instruction mnemonic: POP HL
     * Length in bytes: 1
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0xE1() {
        this.HL = this.memory.get(this.SP)
        this.SP += 1
        this.HL |= this.memory.get(this.SP)
        this.SP += 1
        this.PC += 1
        this.cycles += 12
    }

    /**
     * Instruction: 0xE2
     * Instruction mnemonic: LD (C),A
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0xE2() {
        this.memory.set(this.C, this.A)
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xE5
     * Instruction mnemonic: PUSH HL
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xE5() {
        this.SP -= 1
        this.memory.set(this.SP, (this.HL >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.HL & 0xFF)
        this.PC += 1
        this.cycles += 16
    }

    /**
     * Instruction: 0xE6
     * Instruction mnemonic: AND d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: Z 0 1 0
     */
    _0xE6(d8) {
        this.A &= d8
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 1
        this.F.carry = 0
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xE7
     * Instruction mnemonic: RST 20H
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xE7() {
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = 32
        this.cycles += 16
    }

    /**
     * Instruction: 0xE8
     * Instruction mnemonic: ADD SP,r8
     * Length in bytes: 2
     * Duration in cycles: 16
     * Flags affected: 0 0 H C
     */
    _0xE8(r8) {
        const val = r8
        const temp = this.SP + val
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = ((this.SP & 0x0F) + (val & 0x0F)) > 0x0F ? 1 : 0
        this.F.carry = temp > 0xFF ? 1 : 0
        this.SP = temp
        this.PC += 2
        this.cycles += 16
    }

    /**
     * Instruction: 0xE9
     * Instruction mnemonic: JP (HL)
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0xE9() {
        this.PC = this.HL
        this.cycles += 4
    }

    /**
     * Instruction: 0xEA
     * Instruction mnemonic: LD (a16),A
     * Length in bytes: 3
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xEA(a16) {
        this.memory.set(a16, this.A)
        this.PC += 3
        this.cycles += 16
    }

    /**
     * Instruction: 0xEE
     * Instruction mnemonic: XOR d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: Z 0 0 0
     */
    _0xEE(d8) {
        this.A ^= d8
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xEF
     * Instruction mnemonic: RST 28H
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xEF() {
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = 40
        this.cycles += 16
    }

    /**
     * Instruction: 0xF0
     * Instruction mnemonic: LDH A,(a8)
     * Length in bytes: 2
     * Duration in cycles: 12
     * Flags affected: - - - -
     */
    _0xF0(a8) {
        // Unhandled operation: LDH
        this.PC += 1
    }

    /**
     * Instruction: 0xF1
     * Instruction mnemonic: POP AF
     * Length in bytes: 1
     * Duration in cycles: 12
     * Flags affected: Z N H C
     */
    _0xF1() {
        this.AF = this.memory.get(this.SP)
        this.SP += 1
        this.AF |= this.memory.get(this.SP)
        this.SP += 1
        this.PC += 1
        this.cycles += 12
    }

    /**
     * Instruction: 0xF2
     * Instruction mnemonic: LD A,(C)
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0xF2() {
        this.A = this.memory.get(this.C)
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xF3
     * Instruction mnemonic: DI
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0xF3() {
        this.IME = false
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xF5
     * Instruction mnemonic: PUSH AF
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xF5() {
        this.SP -= 1
        this.memory.set(this.SP, (this.AF >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.AF & 0xFF)
        this.PC += 1
        this.cycles += 16
    }

    /**
     * Instruction: 0xF6
     * Instruction mnemonic: OR d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: Z 0 0 0
     */
    _0xF6(d8) {
        this.A |= d8
        this.F.zero = this.A === 0 ? 1 : 0
        this.F.subtract = 0
        this.F.halfCarry = 0
        this.F.carry = 0
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xF7
     * Instruction mnemonic: RST 30H
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xF7() {
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = 48
        this.cycles += 16
    }

    /**
     * Instruction: 0xF8
     * Instruction mnemonic: LD HL,SP+r8
     * Length in bytes: 2
     * Duration in cycles: 12
     * Flags affected: 0 0 H C
     */
    _0xF8() {
        this.HL = SP + r8
        this.PC += 2
        this.cycles += 12
    }

    /**
     * Instruction: 0xF9
     * Instruction mnemonic: LD SP,HL
     * Length in bytes: 1
     * Duration in cycles: 8
     * Flags affected: - - - -
     */
    _0xF9() {
        this.SP = this.HL
        this.PC += 1
        this.cycles += 8
    }

    /**
     * Instruction: 0xFA
     * Instruction mnemonic: LD A,(a16)
     * Length in bytes: 3
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xFA(a16) {
        this.A = this.memory.get(a16)
        this.PC += 3
        this.cycles += 16
    }

    /**
     * Instruction: 0xFB
     * Instruction mnemonic: EI
     * Length in bytes: 1
     * Duration in cycles: 4
     * Flags affected: - - - -
     */
    _0xFB() {
        this.IME = true
        this.PC += 1
        this.cycles += 4
    }

    /**
     * Instruction: 0xFE
     * Instruction mnemonic: CP d8
     * Length in bytes: 2
     * Duration in cycles: 8
     * Flags affected: Z 1 H C
     */
    _0xFE(d8) {
        const temp = this.A - d8
        this.F.zero = (temp & 0xFF) === 0 ? 1 : 0
        this.F.subtract = 1
        this.F.halfCarry = ((this.A & 0xF) - (d8 & 0xF)) < 0 ? 1 : 0
        this.F.carry = this.A < d8 ? 1 : 0
        this.PC += 2
        this.cycles += 8
    }

    /**
     * Instruction: 0xFF
     * Instruction mnemonic: RST 38H
     * Length in bytes: 1
     * Duration in cycles: 16
     * Flags affected: - - - -
     */
    _0xFF() {
        this.SP -= 1
        this.memory.set(this.SP, (this.PC >> 8) & 0xFF)
        this.SP -= 1
        this.memory.set(this.SP, this.PC & 0xFF)
        this.PC = 56
        this.cycles += 16
    }
    //#endregion opcodes
}