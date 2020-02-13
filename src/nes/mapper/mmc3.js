const CART_PRGROM_SIZE = 0x8000
const CART_CHRROM_SIZE = 0x2000
const CART_SRAM_SIZE   = 0x2000
const CART_ExROM_SIZE  = 0x1FE0

const MMC3_PRG_BANK_8K = 0x2000
const MMC3_CHR_BANK_2K = 0x0800
const MMC3_CHR_BANK_1K = 0x0400

const MMC3_PRG_BANK_SFT = 0b0001111111111111 // 8KB Bank address shift
const MMC3_PRG_BANK_SEL = 0b0110000000000000
const MMC3_PRG_BANK_0   = 0b0000000000000000 // 0x0000 - 0x1FFF or 0x4000 - 0x5FFF 8 KB switchable PRG ROM bank
const MMC3_PRG_BANK_1   = 0b0010000000000000 // 0x2000 - 0x3FFF                    8 KB switchable PRG ROM bank
const MMC3_PRG_BANK_2   = 0b0100000000000000 // 0x4000 - 0x5FFF or 0x0000 - 0x1FFF 8 KB switchable PRG ROM bank (fixed on second last)
const MMC3_PRG_BANK_3   = 0b0110000000000000 // 0x6000 - 0x7FFF                    8 KB switchable PRG ROM bank (fixed on last)


const MMC3_CHR_BANK_SFT = 0b0000001111111111 // 1KB Bank address shift
const MMC3_CHR_BANK_SEL = 0b0001110000000000
const MMC3_CHR_BANK_0   = 0b0000000000000000 // 0x0000 - 0x03FF
const MMC3_CHR_BANK_1   = 0b0000010000000000 // 0x0400 - 0x07FF
const MMC3_CHR_BANK_2   = 0b0000100000000000 // 0x0800 - 0x0BFF
const MMC3_CHR_BANK_3   = 0b0000110000000000 // 0x0C00 - 0x0FFF
const MMC3_CHR_BANK_4   = 0b0001000000000000 // 0x1000 - 0x13FF
const MMC3_CHR_BANK_5   = 0b0001010000000000 // 0x1400 - 0x17FF
const MMC3_CHR_BANK_6   = 0b0001100000000000 // 0x1800 - 0x1BFF
const MMC3_CHR_BANK_7   = 0b0001110000000000 // 0x1C00 - 0x1FFF



//http://wiki.nesdev.com/w/index.php/MMC3
const MMC3_BANKSEL_CHRA12INV = 0b10000000
const MMC3_BANKSEL_PRGSWPMOD = 0b01000000
const MMC3_BANKSEL_UNIMPLIED = 0b00111000
const MMC3_BANKSEL_REGSELECT = 0b00000111

class MMC3 {
    constructor(romData,bus){
        this.isHori     = romData.isHoriMirr
        this.is4Scr     = romData.is4Scr
        this.bus        = bus
        this.bankSel    = 0x00
        this.bankDat    = new Uint8Array(8)
        this.irqLatch   = 0x00
        this.irqEnable  = false

        this.prgBank = []
        this.prgBankLen = romData.prgSize / MMC3_PRG_BANK_8K
        for(var i=0; i<this.prgBankLen; i++){ this.prgBank[i] = romData.prg.slice(i*MMC3_PRG_BANK_8K,(i+1)*MMC3_PRG_BANK_8K) }
        this.chrBank = []
        this.chrBankLen = romData.chrSize / MMC3_CHR_BANK_1K
        for(var i=0; i<this.chrBankLen; i++){ this.chrBank[i] = romData.chr.slice(i*MMC3_CHR_BANK_1K,(i+1)*MMC3_CHR_BANK_1K) }
        
        this.sram = new Uint8Array(CART_SRAM_SIZE)
    }

    setPRGBank(){

    }


    isHoriMirr()          { return this.isHori }
    PRGRead(addr){
        var bank = addr & MMC3_PRG_BANK_SEL
        var shft = addr & MMC3_PRG_BANK_SFT
        var swap = this.bankSel & MMC3_BANKSEL_PRGSWPMOD != 0
        switch(bank){
            case MMC3_PRG_BANK_0: return this.prgBank[(swap?this.prgBankLen-2:this.bankDat[6])][shft]
            case MMC3_PRG_BANK_1: return this.prgBank[this.bankDat[7]][shft]
            case MMC3_PRG_BANK_2: return this.prgBank[(swap?this.bankDat[6]:this.prgBankLen-2)][shft]
            case MMC3_PRG_BANK_3: return this.prgBank[this.prgBankLen-1][shft]
        }

    }
    PRGWrite(addr,data){
        var bank = addr & MMC3_PRG_BANK_SEL
        var even = (addr & 1) == 0

        switch(bank){
            case MMC3_PRG_BANK_0: //Bank select, Bank data
            if(even){
                this.bankSel = data
            }else{
                this.bankDat[this.bankSel & MMC3_BANKSEL_REGSELECT] = data
            }
            break
            case MMC3_PRG_BANK_1: //Mirroring, PRG RAM protect
            if(even){ if(!this.is4Scr) this.isHori = (data & 1) != 0 }
            else    { }
            break
            case MMC3_PRG_BANK_2: //IRQ latch, IRQ reload
            if(even){
                this.irqLatch = data
            }else{
                
            }
            break
            case MMC3_PRG_BANK_3: //IRQ disable, IRQ enable
            if(even){
                this.irqEnable = false
            }else{
                this.irqEnable = true
            }
            break
        }
    }
    CHRRead(addr){
        
        
        
        
        
        
    }
    CHRWrite(addr,data){
        
        
        
        
        
        
    }

    SRAMRead  (addr)      { return this.sram[addr] }
    SRAMWrite (addr,data) { this.sram[addr] = data }
    EXROMRead (addr)      { return 0               }
    EXROMWrite(addr,data) {                        }
}

export default MMC3