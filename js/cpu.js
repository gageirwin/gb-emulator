

class CPU {

    constructor(debugging = false) {
        this.debugging = debugging
        this.A = 0
        this.B = 0
        this.C = 0
        this.D = 0
        this.E = 0
        this.H = 0
        this.L = 0
        this.F = {
            zero: false,
            subtract: false,
            halfCarry: false,
            carry: false
        }
        this.SP = 0
        this.PC = 0
    }

    step() {

        this.A = Math.floor(Math.random() * 100)
        this.PC++

        if (this.debugging)
            this.debugger()
    }

    execute(opcode = "0x00") {
        if (opcode === "0xCB")
            return
        this[`_${opcode}`]()
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
                PC: this.PC
            }
        })
        document.dispatchEvent(event)
    }

    //https://gbdev.io/gb-opcodes/optables/

    //NOP
    _0x00() { }
    //LD BC, n16
    _0x01() { }
    //LD [BC], A
    _0x02() { }
    //INC BC
    _0x03() { }
    //INC B
    _0x04() { }
    //DEC B
    _0x05() { }
    //LD B, n8
    _0x06() { }
    //RLCA
    _0x07() { }
    //LD [a16], SP
    _0x08() { }
    //ADD HL, BC
    _0x09() { }
    //LD A, [BC]
    _0x0A() { }
    //DEC BC
    _0x0B() { }
    //INC C
    _0x0C() { }
    //DEC C
    _0x0D() { }
    //LD C, n8
    _0x0E() { }
    //RRCA
    _0x0F() { }
    //STOP n8
    _0x10() { }
    //LD DE, n16
    _0x11() { }
    //LD [DE], A
    _0x12() { }
    //INC DE
    _0x13() { }
    //INC D
    _0x14() { }
    //DEC D
    _0x15() { }
    //LD D, n8
    _0x16() { }
    //RLA
    _0x17() { }
    //JR e8
    _0x18() { }
    //ADD HL, DE
    _0x19() { }
    //LD A, [DE]
    _0x1A() { }
    //DEC DE
    _0x1B() { }
    //INC E
    _0x1C() { }
    //DEC E
    _0x1D() { }
    //LD E, n8
    _0x1E() { }
    //RRA
    _0x1F() { }
    //JR NZ, e8
    _0x20() { }
    //LD HL, n16
    _0x21() { }
    //LD [HL+], A
    _0x22() { }
    //INC HL
    _0x23() { }
    //INC H
    _0x24() { }
    //DEC H
    _0x25() { }
    //LD H, n8
    _0x26() { }
    //DAA
    _0x27() { }
    //JR Z, e8
    _0x28() { }
    //ADD HL, HL
    _0x29() { }
    //LD A, [HL+]
    _0x2A() { }
    //DEC HL
    _0x2B() { }
    //INC L
    _0x2C() { }
    //DEC L
    _0x2D() { }
    //LD L, n8
    _0x2E() { }
    //CPL
    _0x2F() { }
    //JR NC, e8
    _0x30() { }
    _0x31() { }
    _0x32() { }
    _0x33() { }
    _0x34() { }
    _0x35() { }
    _0x36() { }
    _0x37() { }
    _0x38() { }
    _0x39() { }
    _0x3A() { }
    _0x3B() { }
    _0x3C() { }
    _0x3D() { }
    _0x3E() { }
    _0x3F() { }
    _0x40() { }
    _0x41() { }
    _0x42() { }
    _0x43() { }
    _0x44() { }
    _0x45() { }
    _0x46() { }
    _0x47() { }
    _0x48() { }
    _0x49() { }
    _0x4A() { }
    _0x4B() { }
    _0x4C() { }
    _0x4D() { }
    _0x4E() { }
    _0x4F() { }
    _0x50() { }
    _0x51() { }
    _0x52() { }
    _0x53() { }
    _0x54() { }
    _0x55() { }
    _0x56() { }
    _0x57() { }
    _0x58() { }
    _0x59() { }
    _0x5A() { }
    _0x5B() { }
    _0x5C() { }
    _0x5D() { }
    _0x5E() { }
    _0x5F() { }
    _0x60() { }
    _0x61() { }
    _0x62() { }
    _0x63() { }
    _0x64() { }
    _0x65() { }
    _0x66() { }
    _0x67() { }
    _0x68() { }
    _0x69() { }
    _0x6A() { }
    _0x6B() { }
    _0x6C() { }
    _0x6D() { }
    _0x6E() { }
    _0x6F() { }
    _0x70() { }
    _0x71() { }
    _0x72() { }
    _0x73() { }
    _0x74() { }
    _0x75() { }
    _0x76() { }
    _0x77() { }
    _0x78() { }
    _0x79() { }
    _0x7A() { }
    _0x7B() { }
    _0x7C() { }
    _0x7D() { }
    _0x7E() { }
    _0x7F() { }
    _0x80() { }
    _0x81() { }
    _0x82() { }
    _0x83() { }
    _0x84() { }
    _0x85() { }
    _0x86() { }
    _0x87() { }
    _0x88() { }
    _0x89() { }
    _0x8A() { }
    _0x8B() { }
    _0x8C() { }
    _0x8D() { }
    _0x8E() { }
    _0x8F() { }
    _0x90() { }
    _0x91() { }
    _0x92() { }
    _0x93() { }
    _0x94() { }
    _0x95() { }
    _0x96() { }
    _0x97() { }
    _0x98() { }
    _0x99() { }
    _0x9A() { }
    _0x9B() { }
    _0x9C() { }
    _0x9D() { }
    _0x9E() { }
    _0x9F() { }
    _0xA0() { }
    _0xA1() { }
    _0xA2() { }
    _0xA3() { }
    _0xA4() { }
    _0xA5() { }
    _0xA6() { }
    _0xA7() { }
    _0xA8() { }
    _0xA9() { }
    _0xAA() { }
    _0xAB() { }
    _0xAC() { }
    _0xAD() { }
    _0xAE() { }
    _0xAF() { }
    _0xB0() { }
    _0xB1() { }
    _0xB2() { }
    _0xB3() { }
    _0xB4() { }
    _0xB5() { }
    _0xB6() { }
    _0xB7() { }
    _0xB8() { }
    _0xB9() { }
    _0xBA() { }
    _0xBB() { }
    _0xBC() { }
    _0xBD() { }
    _0xBE() { }
    _0xBF() { }
    _0xC0() { }
    _0xC1() { }
    _0xC2() { }
    _0xC3() { }
    _0xC4() { }
    _0xC5() { }
    _0xC6() { }
    _0xC7() { }
    _0xC8() { }
    _0xC9() { }
    _0xCA() { }
    _0xCB() { }
    _0xCC() { }
    _0xCD() { }
    _0xCE() { }
    _0xCF() { }
    _0xD0() { }
    _0xD1() { }
    _0xD2() { }
    _0xD3() { }
    _0xD4() { }
    _0xD5() { }
    _0xD6() { }
    _0xD7() { }
    _0xD8() { }
    _0xD9() { }
    _0xDA() { }
    _0xDB() { }
    _0xDC() { }
    _0xDD() { }
    _0xDE() { }
    _0xDF() { }
    _0xE0() { }
    _0xE1() { }
    _0xE2() { }
    _0xE3() { }
    _0xE4() { }
    _0xE5() { }
    _0xE6() { }
    _0xE7() { }
    _0xE8() { }
    _0xE9() { }
    _0xEA() { }
    _0xEB() { }
    _0xEC() { }
    _0xED() { }
    _0xEE() { }
    _0xEF() { }
    _0xF0() { }
    _0xF1() { }
    _0xF2() { }
    _0xF3() { }
    _0xF4() { }
    _0xF5() { }
    _0xF6() { }
    _0xF7() { }
    _0xF8() { }
    _0xF9() { }
    _0xFA() { }
    _0xFB() { }
    _0xFC() { }
    _0xFD() { }
    _0xFE() { }
    _0xFF() { }




}