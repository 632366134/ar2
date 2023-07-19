// component/xr-start/xr-start.t
let n = 0
let rotation
let oldRotation
const STATE = {
    NONE: -1,
    MOVE: 0,
    ZOOM_OR_PAN: 1
  }
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    obsList: {
      type: Array,
      default: []
    },
    mediaList: {
      type: Array,
      default: []
    },
    paramList: {
      type: Array,
      default: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
      flag:false
  },
  detached() {
    this.innerAudioContext?.destroy()

    this.data.mediaList.forEach((c, v) => {
      this.scene.assets.releaseAsset('gltf', `gltf-${v}`);
    })
    wx.offDeviceMotionChange(this.listener)
    console.log('xr-startdetached')
    this.scene.removeChild(this.xrgltf);
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
  },
  attached() {
    wx.startDeviceMotionListening({
      interval: 'game'
    })
    this.listener = (res) => {
      rotation = res.alpha
    }
    wx.onDeviceMotionChange(this.listener)
  },
  /**
   * 组件的方法列表
   */
  methods: {
    handleARReady: function ({
      detail
    }) {
      oldRotation = rotation
      console.log('arReady', this.scene.ar.arVersion);
      if(this.data.mediaList[0].projectCode =='312330376891027456' || this.data.mediaList[0].projectCode== '369654870789541888'){
        this.innerAudioContext = wx.createInnerAudioContext({
            useWebAudioImplement: true // 是否使用 WebAudio 作为底层音频驱动，默认关闭。对于短音频、播放频繁的音频建议开启此选项，开启后将获得更优的性能表现。由于开启此选项后也会带来一定的内存增长，因此对于长音频建议关闭此选项
          })
          this.innerAudioContext.src = 'https://arimage-search-copy.arsnowslide.cn/arkitmp3.mp3'
    
          // this.innerAudioContext.play() // 播放
         this.innerAudioContext.loop = true
    
    }
    },
    handleReady: function ({
      detail
    }) {

      const xrFrameSystem =this.xrFrameSystem= wx.getXrFrameSystem();
      this.scene = detail.value;
      this.anchor = this.scene.getNodeById('anchor');
      this.xrgltf = this.scene.createElement(xrFrameSystem.XRGLTF, {
        'anim-autoplay': true,
        'castShadow': true,
        'receiveShadow': true
      })
      this.GLTF = this.xrgltf.getComponent(xrFrameSystem.GLTF)
      this.trs = this.xrgltf.getComponent(xrFrameSystem.Transform);
      this.tmpV3 = new(xrFrameSystem.Vector3)();
      this.scene.addChild(this.xrgltf);
      this.mat = new (wx.getXrFrameSystem().Matrix4)();
      const { width, height } = this.scene
      // 旋转缩放相关配置
      this.radius = (width + height) / 4
      this.rotateSpeed = 5

      this.handleTouchStart = (event) => {
        this.mouseInfo = { startX: 0, startY: 0, isDown: false, startPointerDistance: 0, state: STATE.NONE }
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
          }
          else if (event.touches.length === 2) {
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

        const { startX, startY } = this.mouseInfo

        const theta = (x - startX) / this.radius * - this.rotateSpeed
        const phi = (y - startY) / this.radius * - this.rotateSpeed
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
    },
    async loadGLTF(gltfList) {
      const scene = this.scene
      this.gltfModel = await Promise.all(gltfList.map((gltfItem, index) => scene.assets.loadAsset({
        type: 'gltf',
        assetId: 'gltf-' + index,
        src: 'https:' + gltfItem.mediaUrl,
        id:'gltf-' + index,
        options:{"ignoreError":"-1"}
      })))
      this.triggerEvent('changeShow', {
        isShowScan: true
      })

    },
    handleAssetsLoaded() {
      this.loadGLTF(this.data.mediaList)

    },
    async changeModel(index) {
      this.trs.visible = true
      const anchor = this.anchor
      let params = this.data.paramList.filter((e) => {
        return e.mediaCode == this.data.mediaList[index].mediaCode
      })
      const scale = params[1].modelParamInfo.split("|");
      this.GLTF.setData({
        model: this.gltfModel[index].value
      })
      if (!anchor.visible) {
        this.trs.setData({
          scale: [scale[0],scale[1],scale[2]]
        })
      } else {
        console.log(this.scene.ar.arVersion)
        if (this.scene.ar.arVersion == 1) {
          rotation = -rotation - oldRotation
          rotation = Math.trunc(rotation)
          this.trs.setData({
            rotation:[0,rotation,0]
          })
        } else {
          wx.offDeviceMotionChange(this.listener)
        }
        this.scene.ar.placeHere(this.xrgltf, true);
        console.log(this.innerAudioContext)
      this.innerAudioContext?.play()
        this.trs.setData({
          scale: [scale[0], scale[1],scale[2]],
        })
      }
      anchor.visible = false
       // 获取改动元素
       this.gltfItemTRS = this.trs
       // 开启旋转缩放逻辑
       this.scene.event.addOnce('touchstart', this.handleTouchStart)
    },
    reset() {
      this.anchor.visible = true
      this.trs.visible = false
    },
  }
})