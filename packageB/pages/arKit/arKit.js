// packageA/canvasAr/canvasAr.js
const {
    API
} = require("../../../utils/request");
const app = getApp();
const NEAR = 0.001;
const FAR = 1000;
Page({
    data: {
        isIPhoneX: app.isIPhoneX,
        isShowScan: false,
        theme: "light",
        imgUrl: "",
        percentLine: 50,
        projectCode: "",
        width: 300,
        height: 300,
        renderWidth: 300,
        renderHeight: 300,
        loaded: false,
        positions: [
            [0, 0, 'rgba(44, 44, 44, 0.5)', ''],
            [0, 0, 'rgba(44, 44, 44, 0.5)', '']
        ],
        obsList: [],
        mediaList: [],
        paramList: [],
        mediaList2: [],
        i: 0,
        flag: false,
        name: '虚拟人',
        arKitFlag:false
    },
    onShareTimeline: function () {
        return {
            title: '',
            query: {
                key: ''
            },
            imageUrl: ''
        }
    },

    //用户点击右上角分享朋友圈
    onShareAppMessage() {
        const promise = new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    title: '',
                })
            }, 3500)
        })
        return {
            title: '',
            promise
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onUnload() {
        console.log("页面detached");
        if (wx.offThemeChange) {
            wx.offThemeChange();
        }
        this.setData({arKitFlag:false})
        wx.removeStorageSync("projectCode");
    },
    async onLoad({
        param
    }) {
        param = decodeURIComponent(param)
        param = JSON.parse(param)
        this.projectCode = param.projectCode
        this.child = this.selectComponent('.xr');
        if (this.projectCode != 369654870789541888) {
            this.setData({
                name: '模型'
            })
        }
        if (!param.projectCode) {
            projectCode = "312330376891027456";
        }
        let obsList = [],
            mediaList = [],
            paramList = []
        let dataList = await API.selMediaApps(param);
        dataList.mediaList.forEach((value) => {
            switch (value.mediaType) {
                case 1:
                    obsList.push(value);
                    break;
                case 5:
                    mediaList.push(value);
                    break;
                default:
                    break;
            }
        });
        paramList = dataList.modelParamList
        const info = wx.getSystemInfoSync();
        const width = info.windowWidth;
        const height = info.windowHeight;
        const dpi = info.pixelRatio;
        this.setData({
            width,
            height,
            renderWidth: width * dpi,
            renderHeight: height * dpi,
            mediaList,
            paramList,
            arKitFlag:true

        });
        this.obsList = obsList
        this.mediaList = mediaList
        this.paramList = paramList
    },
    changeModel({
        target
    }) {
        let index = target.dataset.index
        this.child.changeModel(index)
    },
    reset() {
        this.child.reset()
    },
    changeShow({
        detail
    }) {
        this.setData({
            isShowScan: detail.isShowScan
        })
    },
    // touchMove({ touches }) {
    //   if (this.reticle.visible == true) return;
    //   console.log(touches[0]);
    //   if ((oldTouches.length = 0)) {
    //     oldTouches.x = touches[0].x;
    //     oldTouches.y = touches[0].y;
    //   } else {
    //     changeX = oldTouches.x - touches[0].x;
    //     changeY = oldTouches.y - touches[0].y;
    //     this.model.rotation.set(
    //         changeY/5,
    //         changeX/5,
    //         0
    //       );
    //   }

    //   //   oldTouches = touches.pageX
    // },
    init() {
        this.initGL();
    },
    render(frame) {
        this.renderGL(frame);

        const camera = frame.camera;

        // 修改光标位置
        const reticle = this.reticle;
        if (reticle.visible == true) {
            const hitTestRes = this.session.hitTest(0.5, 0.5);
            if (hitTestRes.length) {
                reticle.matrixAutoUpdate = false;
                reticle.matrix.fromArray(hitTestRes[0].transform);
                reticle.matrix.decompose(
                    reticle.position,
                    reticle.quaternion,
                    reticle.scale
                );
            }
        }

        // 更新动画
        this.updateAnimation();

        // 相机
        if (camera) {
            this.camera.matrixAutoUpdate = false;
            this.camera.matrixWorldInverse.fromArray(camera.viewMatrix);
            // this.camera.matrixWorld.getInverse(this.camera.matrixWorldInverse);
            this.camera.matrixWorld.copy(this.camera.matrixWorldInverse).invert();
            const projectionMatrix = camera.getProjectionMatrix(NEAR, FAR);
            this.camera.projectionMatrix.fromArray(projectionMatrix);
            // this.camera.projectionMatrixInverse.getInverse(
            //   this.camera.projectionMatrix
            // );
            this.camera.projectionMatrixInverse
                .copy(this.camera.projectionMatrix)
                .invert();
        }

        this.renderer.autoClearColor = false;
        this.renderer.render(this.scene, this.camera);
        this.renderer.state.setCullFace(this.THREE.CullFaceNone);
    },
});