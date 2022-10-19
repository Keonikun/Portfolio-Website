import * as dat from 'dat.gui'
import Stats from 'stats.js'

export default class Debug
{
    constructor()
    {
        this.active = window.location.hash === '#debug'

        // Create FPS counter
        
        

        if(this.active)
        {
            this.stats = new Stats()
            this.stats.showPanel(0)
            document.body.appendChild(this.stats.dom)
            this.ui = new dat.GUI()
        }
    }

    update()
    {
        if(this.active)
        {
            this.stats.begin()

            this.stats.end()
        } 
    }
}