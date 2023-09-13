// component/xr-start/xr-start.t
let n = 0
let map1 = new Map()
let video = null
const STATE = {
    NONE: -1,
    MOVE: 0,
    ZOOM_OR_PAN: 1
}
Component({
    behaviors: [require('../common/share-behavior').default],
    innerInterval: 0,
    videoId: -1,
    /**
     * 组件的属性列表
     */
    properties: {
        obsList: {
            type: Array,
            value: []
        },
        mediaList: {
            type: Array,
            value: []
        },
        paramList: {
            type: Array,
            value: []
        },
        gltfResList: {
            type: Array,
            value: []
        },
        videoResList: {
            type: Array,
            value: []
        },
        imageResList: {
            type: Array,
            value: []
        },
    },
    observers: {
        obsList(newVal) {
            this.setData({
                obsList1: newVal,
            })
        },
        mediaList(newVal) {
            this.setData({
                mediaList1: newVal
            })
        },
        paramList(newVal) {
            this.setData({
                paramList1: newVal
            })
        },
        gltfResList(newVal) {
            this.setData({
                gltfResList1: newVal
            })
        },
        videoResList(newVal) {
            this.setData({
                videoResList1: newVal
            })
        },
        imageResList(newVal) {
            this.setData({
                imageResList1: newVal
            })
        },
    },
    /**
     * 组件的初始数据
     */
    data: {
        rawData: [],
        loaded: true,
        arReady: false,
        gltfLoaded: false,
        videoLoaded: false,
        videoRatioLoaded: false,
        imageLoaded: false,
        markerWidth: 1,
        markerHeight: 1,
        obsList1: [],
        mediaList1: [],
        paramList1: [],
        videoIdList: [],
        imageIdList: [],
        gltfResList: [],
        imageResList1: [],
        videoResList1: [],
        vp: [0, 0, 0],
        vs: [1, 1, 1],
        vr: [0, 0, 0],
    },

    lifetimes: {
        detached() {
            this.innerAudioContext?.destroy()
            clearInterval(this.innerInterval);
            this.data.mediaList1.forEach((c, v) => {
                this.scene.assets.releaseAsset('gltf', `gltf-${v}`);
            })
            this.releaseVideo();
            //   this.closeVideo()
            this.releaseImage();
            video = null

            // this.releaseGLTF();
            console.log('xr-startdetached')
            this.scene.removeChild(this.xrgltf);
            map1 = new Map()
            if (this.scene) {
                this.scene = null
            }
            if (this.anchor) {
                this.anchor = null
            }
            if (this.trs) {
                this.trs = null
            }
            if (this.GLTF) {
                this.GLTF = null
            }
            if (this.xrgltf) {
                this.xrgltf = null
            }
            if (this.tmpV3) {
                this.tmpV3 = null
            }
            if (this.gltfModel) {
                this.gltfModel = null
            }
        }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        releaseImage() {
            if (this.data.imageIdList && this.data.imageIdList.length > 0) {
                const scene = this.scene

                // 声明使 gltf Mesh 移除
                this.setData({
                    gltfLoaded: false
                });

                this.data.imageIdList.map((id) => {
                    // 释放加载过的资源
                    scene.assets.releaseAsset('texture', `image-${id}`);
                    scene.assets.releaseAsset('material', `image-mat-${id}`);
                    this.setData({
                        imageIdList: []
                    });
                })
            }
        },
        releaseGLTF() {
            if (this.data.gltfIdList && this.data.gltfIdList.length > 0) {
                const scene = this.scene

                // 声明使 gltf Mesh 移除
                this.setData({
                    gltfLoaded: false
                });

                this.data.gltfIdList.map((id) => {
                    // 释放加载过的资源
                    scene.assets.releaseAsset('gltf', `gltf-${id}`);
                })
                this.setData({
                    gltfIdList: []
                });
            }
        },
        releaseVideo() {
            if (this.data.videoIdList && this.data.videoIdList.length > 0) {
                const scene = this.scene

                // 声明使视频 Mesh 移除
                this.setData({
                    videoLoaded: false
                });

                this.data.videoIdList.map((id) => {
                    // 释放加载过的资源
                    scene.assets.releaseAsset('video-texture', `video-${id}`);
                    scene.assets.releaseAsset('material', `video-mat-${id}`);
                })
                this.setData({
                    videoIdList: []
                });

            }
        },
        handleAssetsProgress: function ({
            detail
        }) {
            console.log('assets progress', detail.value);
        },
        handleAssetsLoaded: function ({
            detail
        }) {
            console.log('assets loaded', detail.value);
        },
        handleARReady: function () {
            // if(this.data.obsList1[0].projectCode =='369654870789541888'){
            //     console.log(this.data.obsList1[0].projectCode)
            //     this.innerAudioContext = wx.createInnerAudioContext({
            //         useWebAudioImplement: true // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
            //       })
            //       this.innerAudioContext.src = 'https://arimage-search-copy.arsnowslide.cn/arkitmp3.mp3'

            //       // this.innerAudioContext.play() // 播放
            //      this.innerAudioContext.loop = true

            // }
        },
        async handleReady({
            detail
        }) {
            const xrScene = this.scene = detail.value;
            console.log('xr-scene', xrScene);
            const xrFrameSystem = this.xrFrameSystem = wx.getXrFrameSystem()


            // 加载场景资源
            try {
                await this.loadVideo(this.data.videoResList1)
                await this.loadGLTF(this.data.gltfResList1)
                await this.loadImage(this.data.imageResList1)
                await this.triggerEvent('changeShow', {
                    isShowScan: true
                })
                this.setData({
                    arReady: true
                })
                this.mat = new(wx.getXrFrameSystem().Matrix4)();
                const {
                    width,
                    height
                } = this.scene
                // 旋转缩放相关配置
                this.radius = (width + height) / 4
                this.rotateSpeed = 5

                this.handleTouchStart = (event) => {
                        this.mouseInfo = {
                            startX: 0,
                            startY: 0,
                            isDown: false,
                            startPointerDistance: 0,
                            state: STATE.NONE
                        }
                        this.mouseInfo.isDown = true

                        const touch0 = event.touches[0]
                        const touch1 = event.touches[1]

                        if (event.touches.length === 1) {
                            this.mouseInfo.startX = touch0.pageX
                            this.mouseInfo.startY = touch0.pageY
                            this.mouseInfo.state = STATE.MOVE
                        } else if (event.touches.length === 2) {
                            const dx = (touch0.pageX - touch1.pageX)
                            const dy = (touch0.pageY - touch1.pageY)
                            this.mouseInfo.startPointerDistance = Math.sqrt(dx * dx + dy * dy)
                            this.mouseInfo.startX = (touch0.pageX + touch1.pageX) / 2
                            this.mouseInfo.startY = (touch0.pageY + touch1.pageY) / 2
                            this.mouseInfo.state = STATE.ZOOM_OR_PAN
                        }

                        this.scene.event.add('touchmove', this.handleTouchMove.bind(this))
                        this.scene.event.addOnce('touchend', this.handleTouchEnd.bind(this))

                    },
                    this.handleTouchMove = (event) => {
                        const mouseInfo = this.mouseInfo
                        if (!mouseInfo.isDown) {
                            return
                        }

                        switch (mouseInfo.state) {
                            case STATE.MOVE:
                                if (event.touches.length === 1) {
                                    this.handleRotate(event)
                                } else if (event.touches.length === 2) {
                                    // 支持单指变双指，兼容双指操作但是两根手指触屏时间不一致的情况
                                    this.scene.event.remove('touchmove', this.handleTouchMove)
                                    this.scene.event.remove('touchend', this.handleTouchEnd)
                                    this.handleTouchStart(event)
                                }
                                break
                            case STATE.ZOOM_OR_PAN:
                                if (event.touches.length === 1) {
                                    // 感觉双指松掉一指的行为还是不要自动切换成旋转了，实际操作有点奇怪
                                } else if (event.touches.length === 2) {
                                    this.handleZoomOrPan(event)
                                }
                                break
                            default:
                                break
                        }
                    }

                this.handleTouchEnd = (event) => {
                    this.mouseInfo.isDown = false
                    this.mouseInfo.state = STATE.NONE

                    this.scene.event.remove('touchmove', this.handleTouchMove)
                    this.scene.event.addOnce('touchstart', this.handleTouchStart)
                }

                this.handleRotate = (event) => {
                    const x = event.touches[0].pageX
                    const y = event.touches[0].pageY

                    const {
                        startX,
                        startY
                    } = this.mouseInfo

                    const theta = (x - startX) / this.radius * -this.rotateSpeed
                    const phi = (y - startY) / this.radius * -this.rotateSpeed
                    if (Math.abs(theta) < .01 && Math.abs(phi) < .01) {
                        return
                    }
                    this.gltfItemTRS.rotation.x -= phi
                    this.gltfItemTRS.rotation.y -= theta
                    this.mouseInfo.startX = x
                    this.mouseInfo.startY = y
                }

                this.handleZoomOrPan = (event) => {
                    const touch0 = event.touches[0]
                    const touch1 = event.touches[1]

                    const dx = (touch0.pageX - touch1.pageX)
                    const dy = (touch0.pageY - touch1.pageY)
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    let deltaScale = distance - this.mouseInfo.startPointerDistance
                    this.mouseInfo.startPointerDistance = distance
                    this.mouseInfo.startX = (touch0.pageX + touch1.pageX) / 2
                    this.mouseInfo.startY = (touch0.pageY + touch1.pageY) / 2
                    if (deltaScale < -2) {
                        deltaScale = -2
                    } else if (deltaScale > 2) {
                        deltaScale = 2
                    }

                    const s = deltaScale * 0.02 + 1
                    // 缩小
                    this.gltfItemTRS.scale.x *= s
                    this.gltfItemTRS.scale.y *= s
                    this.gltfItemTRS.scale.z *= s
                }

            } catch (err) {
                console.log('[gltf load] error: ', err)
            }

        },
        async loadGLTF(gltfList) {
            console.log('gogltf')
            const scene = this.scene
            if (gltfList.projectCode == '369654870789541888') return
            if (gltfList.length > 0) {

                console.log(gltfList)
                const gltfModel = await Promise.all(gltfList.map(gltfItem => scene.assets.loadAsset({
                    type: 'gltf',
                    assetId: 'gltf-' + gltfItem.id,
                    src: 'https:' + gltfItem.mediaUrl,
                    // src:'http://arp3.arsnowslide.com/model.glb',
                    options: {
                        "ignoreError": '-1'
                    }
                })))
                console.log('glTF asset loaded')
                // this.setData({
                //   gltfLoaded: true
                // })
            } else {
                console.log('gltfList', gltfList)
                this.setData({
                    gltfLoaded: false
                })
            }
        },

        async loadImage(imageList) {
            console.log('goimage', imageList)
            const scene = this.scene
            if (imageList.length > 0) {
                const imageIdList = [];
                const images = await Promise.all(imageList.map((imageItem) => {
                    imageIdList.push(imageItem.id);
                    return scene.assets.loadAsset({
                        type: 'texture',
                        assetId: `image-${imageItem.id}`,
                        src: 'https:' + imageItem.mediaUrl
                    })
                }))
                console.log(images[0], 'images')
                images.map((videoTexture, index) => {
                    const videoMat = scene.createMaterial(
                        scene.assets.getAsset('effect', 'standard'), {
                            u_baseColorMap: videoTexture.value
                        }
                    )
                    scene.assets.addAsset('material', `image-mat-${imageList[index].id}`, videoMat)
                })
                console.log('image asset loaded')
                this.setData({
                    imageIdList: imageIdList,
                    imageLoaded: true
                })
            } else {
                this.setData({
                    imageIdList: [],
                    imageLoaded: false
                })
            }
        },
        async loadVideo(videoList) {
            const scene = this.scene

            if (videoList.length == 0) return
            console.log(videoList)
            const videos = await Promise.all(videoList.map((videoItem) => {
                this.data.videoIdList.push(videoItem.id)
                console.log(`video-${videoItem.id}`)

                return scene.assets.loadAsset({
                    type: 'video-texture',
                    assetId: `video-${videoItem.id}`,
                    src: `https:${videoItem.mediaUrl}`,
                    options: {
                        autoPlay: false,
                        loop: true,
                        abortAudio: false
                    },
                })
            }))


            await Promise.all(videos.map((videoTexture, index) => {
                const videoMat = scene.createMaterial(
                    scene.assets.getAsset('effect', 'standard'), {
                        u_baseColorMap: videoTexture.value.texture
                    }
                )
                if (videoTexture) {
                    console.log(videoTexture)
                    let p = videoTexture.value.width / videoTexture.value.height
                    map1.set(videoList[index].id, 1 * p)
                    scene.assets.addAsset('material', `video-mat-${videoList[index].id}`, videoMat)

                }

            }))
            this.setData({
                videoLoaded: true
            })

            console.log('video asset loaded')
        },


        handleTrackerSwitch({
            detail
        }) {
            console.log('tracked match', detail)
            const active = detail.value;
            const element = detail.el;
            let obsList = this.data.obsList1
            obsList.forEach(async i => {
                // const video = this.scene.assets.getAsset('video-texture', `video-${i}`);
                const markerInfo = i;
                console.log(markerInfo)
                const markerTracker = this.scene.getElementById(`marker-${markerInfo.mediaCode}`)
                if (element === markerTracker) {
                    // 处理视频纹理
                    // this.releaseVideo();
                    // 匹配 tracker
                    if (active) {
                        this.setData({
                            gltfLoaded: true
                        })
                        if (this.data.videoResList1.length != 0) {
                            console.log('videomatch')
                            const list = this.data.videoResList1.filter(v => {
                                if (v.parentCode === markerInfo.mediaCode) {
                                    const list4 = this.data.paramList1.filter(d => v.mediaCode === d.mediaCode)
                                    this.setData({
                                        vp: list4[0].modelParamInfo,
                                        vs: list4[1].modelParamInfo,
                                        vr: list4[2].modelParamInfo,
                                    })
                                    console.log(this.data.vp, this.data.vs, this.data.vr)
                                    return v
                                }

                            })
                            if (list.length != 0) {
                                let id = list[0].id
                                const markerWidth = map1.get(id)
                                this.setData({
                                    markerWidth,
                                    videoLoaded: true
                                })
                                let vid = 'video-' + id
                                console.log(vid)
                                video = this.scene.assets.getAsset('video-texture', vid);
                                console.log(video)
                                video.play()
                            }
                        }

                        if (this.data.gltfResList1.length != 0) {
                            console.log('gltfmatch')

                            const list3 = this.data.gltfResList1.forEach(v => {
                                if (v.projectCode == '369654870789541888') return

                                if (v.parentCode === markerInfo.mediaCode) {
                                    const list4 = this.data.paramList1.filter(d => v.mediaCode === d.mediaCode)
                                    console.log(`mesh-gltf-${v.id}`)
                                    const gltf = this.scene.getNodeById(`mesh-gltf-${v.id}`)
                                    // 获取改动元素
                                    this.gltfItemTRS = this.scene.getElementById(`mesh-gltf-${v.id}`).getComponent(this.xrFrameSystem.Transform)

                                    // 开启旋转缩放逻辑
                                    this.scene.event.addOnce('touchstart', this.handleTouchStart)
                                    console.log(gltf, list4)
                                    console.log([list4[0].modelParamInfo[0]])

                                    gltf.setData({
                                        position: [list4[0].modelParamInfo[0], list4[0].modelParamInfo[1], list4[0].modelParamInfo[2]],
                                        scale: [list4[1].modelParamInfo[0], list4[1].modelParamInfo[1], list4[1].modelParamInfo[2]],
                                        rotation: [list4[2].modelParamInfo[0], list4[2].modelParamInfo[1], list4[2].modelParamInfo[2]],
                                        // visible:true
                                    })
                                    wx.nextTick(() => {
                                        gltf.setData({
                                            visible: true
                                        })
                                        this.innerAudioContext?.play()
                                    })
                                }
                            })
                        }
                        // if (this.data.imageResList1.length != 0) {
                        //   const list3 = this.data.imageResList1.forEach(v => {
                        //     if (v.parentCode === markerInfo.mediaCode) {
                        //       const list4 = this.data.paramList1.filter(d => v.mediaCode === d.mediaCode)
                        //       console.log(`mesh-mat-${v.id}`)
                        //       const gltf = this.scene.getNodeById(`mesh-mat-${v.id}`)
                        //       console.log(gltf, list4)
                        //       console.log([list4[0].modelParamInfo[0]])

                        //       gltf.setData({
                        //         position: [list4[0].modelParamInfo[0], list4[0].modelParamInfo[1], list4[0].modelParamInfo[2]],
                        //         scale: [list4[1].modelParamInfo[0], list4[1].modelParamInfo[1], list4[1].modelParamInfo[2]],
                        //         rotation: [list4[2].modelParamInfo[0], list4[2].modelParamInfo[1], list4[2].modelParamInfo[2]],
                        //       })
                        //       wx.nextTick(()=>{
                        //         gltf.setData({
                        //           visible:true
                        //         })
                        //       })
                        //     }
                        //   })
                        // }

                    } else {
                        console.log(video)
                        video?.stop()
                        // this.closeVideo()
                    }
                }


            })


        },

    }
})