<template>
    <div id="app">
        <div style="position:absolute; left:50%; top:50px; width:512px; margin-left: -256px;">
            <div v-show="showfps" style="position:absolute; left:0%; top:0px; width:100%; color:white; background-color:rgba(1,1,1,0.5); padding:0 0 0 5px; font-size:12px;">
                FPS:{{fps}} <br> EMU(ms):{{diff}} <br> STALL(ms):{{stall}}
            </div>
            <canvas ref="myCanvas" id="canvas" width="512" height="480"></canvas>
            <br>
            <label for="rom-upload" class="big-red-button">LOAD</label>
            <input id="rom-upload" type="file" ref="myFile" @change="selectedFile">
            <button v-on:click="reset" style="float:right;" class="big-red-button">RESET</button>
            <!--
            <div style="color:white;float:right;margin:2px 10px;font-size:10px;"><input class="toggle" type="checkbox" /> EPX</div>
            -->
            <h3 class="title"> NEjS </h3>
            <div class="info" style="margin-bottom:10px;"> A simple NES emulator written in JavaScript & runs in browser completely.</div>
            <a class="info" href="https://github.com/RyuBAI/nejs/">Github Repo</a> &nbsp;
            <a class="info" href="http://tuxnes.sourceforge.net/nesmapper.txt">Game Mapper List</a>
            <br>
            <br>
            <div class="key-table-wrapper">
                <div class="key-table-title">Keys</div>
                <table class="key-table">
                    <tr class="key-tr">
                        <th class="key-th">UP</th>
                        <th class="key-th">LEFT</th>
                        <th class="key-th">DOWN</th>
                        <th class="key-th">RIGHT</th>
                        <th class="key-th">B</th>
                        <th class="key-th">A</th>
                        <th class="key-th">SELECT</th>
                        <th class="key-th">START</th>
                    </tr>
                    <tr>
                        <td class="key-td">W</td>
                        <td class="key-td">A</td>
                        <td class="key-td">S</td>
                        <td class="key-td">D</td>
                        <td class="key-td">K</td>
                        <td class="key-td">L</td>
                        <td class="key-td">Z</td>
                        <td class="key-td">X</td>
                    </tr>
                </table>
            </div>
            <div class="footer">2020 ryubai.com</div>
        </div>
        <div style="position:absolute; left:50%; top:50px; width:360px; margin-left: -680px;">
            <work-ram-viewer ref="WorkRamViewer"/>
            <div class="info" style="background-color:#200; color:white; border:2px dashed #500; padding:5px 2px; font-weight:600; text-align:center;margin-top:10px;"> : PLZ READ BEFORE PLAY : </div>
            <div class="info" style="background-color:#200; color:white; border:2px dashed #500; padding:5px 2px; margin-top:-2px;"> Only supports mapper 0 & 4 (NROM, MMC3) currently.</div>
            <div class="info" style="background-color:#200; color:white; border:2px dashed #500; padding:5px 2px; margin-top:-2px;"> Firefox might be slow and laggy, Chrome is WAAY better :)</div>
            <div class="info" style="background-color:#200; color:white; border:2px dashed #500; padding:5px 2px; margin-top:-2px;"> Audio is just half done yet, and :</div>
            <div class="info" style="background-color:#200; color:white; border:2px dashed #500; padding:5px 2px; margin-top:-2px;"> &nbsp;&nbsp;- If you can't hear anything pls click RESET.</div>
            <div class="info" style="background-color:#200; color:white; border:2px dashed #500; padding:5px 2px; margin-top:-2px;"> &nbsp;&nbsp;- If sounds glitched out after RESET pls refresh page.</div>
            
        </div>
        <div style="position:absolute; left:50%; top:50px; width:360px; margin-left: 320px;">
            <v-ram-viewer ref="VRamViewer"/>
        </div>
    </div>
</template>

<script>

import { SCALE_MODE ,BUTTON, NES } from './nes/nes'

export default {
    name: "nejs",
    data() { return { mspf:16.666,timer:null,fps:0,diff:0,stall:0,showfps:true,lastT:null } },
    created() { document.onkeydown = this.onKeyDown; document.onkeyup = this.onKeyUp; this.nes = null },
    mounted(){
        this.nes = new NES(this.$refs.myCanvas)
        this.$refs.WorkRamViewer.nes = this.nes
        this.$refs.VRamViewer.nes = this.nes
        fetch('./SuperMarioBros3.nes')
            .then(res => res.blob())
            .then(blob => { this.loadFile(blob) })
    },
    destroyed(){  },
    methods:{ 
        selectedFile() {
            this.loadFile(this.$refs.myFile.files[0])
            this.$refs.myFile.value = ""
        },
        onKeyDown(e){
            if(this.nes == null) return
            if(e.key == "l" ) this.nes.btnDown(BUTTON.A      )
            if(e.key == "k" ) this.nes.btnDown(BUTTON.B      )
            if(e.key == "z" ) this.nes.btnDown(BUTTON.SELECT )
            if(e.key == "x" ) this.nes.btnDown(BUTTON.START  )
            if(e.key == "w" ) this.nes.btnDown(BUTTON.UP     )
            if(e.key == "s" ) this.nes.btnDown(BUTTON.DOWN   )
            if(e.key == "a" ) this.nes.btnDown(BUTTON.LEFT   )
            if(e.key == "d" ) this.nes.btnDown(BUTTON.RIGHT  )
        },
        onKeyUp(e){
            if(this.nes == null) return
            if(e.key == "l" ) this.nes.btnUp(BUTTON.A      )
            if(e.key == "k" ) this.nes.btnUp(BUTTON.B      )
            if(e.key == "z" ) this.nes.btnUp(BUTTON.SELECT )
            if(e.key == "x" ) this.nes.btnUp(BUTTON.START  )
            if(e.key == "w" ) this.nes.btnUp(BUTTON.UP     )
            if(e.key == "s" ) this.nes.btnUp(BUTTON.DOWN   )
            if(e.key == "a" ) this.nes.btnUp(BUTTON.LEFT   )
            if(e.key == "d" ) this.nes.btnUp(BUTTON.RIGHT  )
        },
        loadFile(file){
            let reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = evt => {
                if(this.timer!=null)clearTimeout(this.timer)
                this.nes.init(new Uint8Array(evt.target.result))
                this.runOneSec()
            }
            reader.onerror = evt => { console.error(evt) }
        },
        runOneSec(){
            var tt = Date.now()
            if(this.lastT != null) this.fps = (1000 / (tt - this.lastT)).toFixed(2)
            this.lastT = tt
            clearTimeout(this.timer)
            this.execOneSec()
            var newT = Date.now()
            this.diff = newT - this.lastT
            this.stall = this.mspf - this.diff
            this.timer = setTimeout(()=>{ this.runOneSec() }, this.stall)
        },
        execOneSec(){
            this.nes.runOneSec()
            this.$refs.WorkRamViewer.stepCall()
            this.$refs.VRamViewer.stepCall()
        },
        reset(){
            this.nes.reset()
            this.nes.bus.apu.audio.ctx.resume()
        },
     },
    computed: {  },
    render(){  },
    beforeDestroy () { if(this.timer!=null)clearTimeout(this.timer) }
}
</script>

<style lang="less">
    @import './assets/font/dragon.css';
    html, body {
        height: auto;
        width: 100%;
        overflow-x: hidden;
        background-color: #000;
    }
</style>

<style scoped lang="less">
    input[type="file"] {
        display: none;
    }
    .big-red-button {
        cursor: pointer;
        background-color: rgb(255, 0, 0);
        display: inline-block;
        text-align: center;
        color: white;
        padding-top:17px;
        padding-bottom:5px;
        width: 60px;
        border: 2px solid white;
        font-size: 12px;
        outline: none;
        -webkit-transition-duration: 0.4s;
        transition-duration: 0.4s;
    }
    .big-red-button:hover{
        background-color: rgb(146, 0, 0);
        box-shadow: 0 0 0px 2px white;
    }
    .title{
        color: red;
        text-align:center;
        width:100%;
        margin-top:50px;
        background-color: white;
        font-size: 18px;
        padding: 2px 0px;
    }
    .info{
        color: white;
        text-align:left;
        font-size: 12px;
    }
    .key-table-wrapper{
        color: white;
        border: 1px dashed rgb(71, 71, 71);
    }
    .key-table-title{
        text-align:center;
        width:100%;
        padding:3px 0;
        font-size: 15px;
        background-color: rgb(220, 0, 0);
    }
    .key-table{
        text-align: center;
        width: 100%;
        font-size: 12px;
        background-color: rgb(140, 0, 0);
    }
    .key-tr{
        text-align: center;
        width: 100%;
        border: 1px solid rgb(97, 97, 97);
    }
    .key-th, .key-td{
        text-align: center;
        width: 70px;
    }

    .footer{
        text-align: center;
        width: 100%;
        color: white;
        font-size: 12px;
        padding-top: 50px;
        padding-bottom: 10px;
    }

    .toggle {
        -webkit-appearance: none;
        -moz-appearance: none;
        appearance: none;
        border: 3px solid rgb(255, 255, 255);
        width: 50px;
        height: 15px;
        display: inline-block;
        position: relative;
        overflow: hidden;
        outline: none;
        cursor: pointer;
        background-color: #707070;
        transition: background-color ease 0.3s;
    }
    .toggle:before {
        content: " ";
        display: block;
        position: absolute;
        z-index: 2;
        width: 100%;
        height: 100%;
        background: rgb(0, 0, 0);
        left: 0px;
        top: 0px;
        color: #fff;
        white-space: nowrap;
        box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        transition: all cubic-bezier(0.3, 1.0, 0.7, 1) 0.3s;
    }
    .toggle:checked {
        background-color: rgb(255, 0, 0);
    }
    .toggle:checked:before {
        left: 80%;
    }
</style>
