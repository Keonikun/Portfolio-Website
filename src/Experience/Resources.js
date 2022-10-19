import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOloader';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import gsap from 'gsap';
import EventEmitter from "./Utils/EventEmitter";

export default class Resources extends EventEmitter
{
    constructor(sources, experience)
    {
        super()

        // Options
        this.sources = sources

        // Setup
        this.items = {}
        this.toLoad = this.sources.length
        this.loaded = 0
        this.experience = experience
        this.scene = this.experience.scene

        this.loadingBarElement = document.querySelector('.loading-bar')
        this.loadingTitleElement = document.querySelector('.loadingTitle')
        this.loadingBackgroundElement = document.querySelector('.loadingBackground')

        this.loadingManager = new THREE.LoadingManager(
            // Loaded
            () =>
            {
                gsap.delayedCall(1.5, () =>
                {
                    gsap.to(this.overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
                    this.loadingBarElement.classList.add('ended')
                    this.loadingBarElement.style.transform = ''
                    this.loadingTitleElement.classList.add('ended')
                    this.loadingBackgroundElement.classList.add('ended')
                    gsap.delayedCall(1.5, () =>
                    {
                        this.loadingBarElement.remove()
                        this.loadingTitleElement.remove()
                        this.loadingBackgroundElement.remove()
                    })
                })
                
            },
            // Progress
            (itemURL, itemsLoaded, itemsTotal) =>
            {
                this.progressRatio = itemsLoaded / itemsTotal
                this.loadingBarElement.style.transform = `scaleX(${this.progressRatio})`
            }
        )

        /**
         * Overlay
         */
        this.overlayGeometry = new THREE.PlaneBufferGeometry(2, 2, 1 ,1)
        this.overlayMaterial = new THREE.ShaderMaterial({ 
            transparent: true,
            uniforms:
            {
                uAlpha: { value: 1 }
            },
            vertexShader: `
            void main()
                {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uAlpha;
                
                void main()
                {
                    gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
                }
            `
        })
        this.overlay = new THREE.Mesh(this.overlayGeometry, this.overlayMaterial)
        this.scene.add(this.overlay)

        this.setLoaders()
        this.startLoading()
    }

    setLoaders()
    {
        this.loaders = {}
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager)
        this.loaders.dracoLoader = new DRACOLoader()
        this.loaders.dracoLoader.setDecoderPath('/draco/')
        this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
        this.loaders.textureLoader = new THREE.TextureLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
        this.loaders.fontLoader = new FontLoader()
        this.loaders.audioLoader = new THREE.AudioLoader()
    }

    startLoading()
    {
        // Load Each Source
        for(const source of this.sources)
        {
            if(source.type === 'gltfModel')
            {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'dracoModel')
            {
                this.loaders.dracoLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'texture')
            {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'cubeTexture')
            {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'font')
            {
                this.loaders.fontLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
            else if(source.type === 'audio')
            {
                this.loaders.audioLoader.load(
                    source.path,
                    (file) =>
                    {
                        this.sourceLoaded(source, file)
                    }
                )
            }
        }
    }

    sourceLoaded(source, file)
    {
        this.items[source.name] = file

        this.loaded++

        if(this.loaded === this.toLoad)
        {
            this.trigger('ready')
        }
    }
}