// packageA/canvasAr/canvasAr.js
const {
    API
} = require("../../../utils/request");
import {
    navigateBack
} from "../../../utils/navigate";
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
        gltfResList:[],
       videoResList:[],
      imageResList:[],
      video:'',
      videoFlag:false,
      Videowidth:'',
      Videoheight:'',
      translateX:-50,
      translateY:0,
      scale:1,
      rotateX:0,
      rotateY:0


    },
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
        }},
      //用户点击右上角分享朋友圈
      onShareTimeline: function () {
        return {
          title: '',
          query: {
            key: ''
          },
          imageUrl: ''
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
            
            wx.removeStorageSync("projectCode");
            this.setData({flag:false})
        },
        async onLoad({param}) {
            param = decodeURIComponent(param)
            param = JSON.parse(param)
            this.child = this.selectComponent('.xr');
            // let projectCode = wx.getStorageSync("projectCode");
            // wx.removeStorageSync("projectCode");
            // if (!projectCode) {
            //     projectCode = "312330376891027456";
            // }
            let obsList = [],
                mediaList = [],
                paramList = []
            // let data = {
            //     projectCode
            // };
            let dataList = await API.selMediaApps(param);
            dataList.mediaList.forEach((value) => {
                switch (value.mediaType) {
                    case 1:
                        obsList.push(value);
                        break;
                    case 3:
                        mediaList.push(value);
                        break;
                    case 4:
                        mediaList.push(value);
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
            const gltfResList = [];
            const videoResList = [];
            const imageResList = [];
            paramList = paramList.filter(i => {
                let flag = mediaList.some(v => {
                    return v.mediaCode == i.mediaCode
                })
                if (flag) return true
            })
            paramList.forEach(e => {
                e.modelParamInfo = e.modelParamInfo.split("|")
            })
            console.log(paramList)

            const markerList = mediaList
            for (let i = 0; i < markerList.length; i++) {
                const marker = markerList[i];
                switch (marker.mediaType) {
                    case 5:
                        gltfResList.push(marker);
                        break;
                    case 4:
                        videoResList.push(marker);
                        break;
                    case 3:
                        imageResList.push(marker);
                        break;
                }
            }
            console.log(gltfResList, videoResList, imageResList)
            this.setData({
                width,
                height,
                renderWidth: width * dpi,
                renderHeight: height * dpi,
                obsList,
                mediaList,
                paramList,
                gltfResList,
                videoResList,
                imageResList,

                flag: true

            });
            console.log(obsList, mediaList, paramList, gltfResList, videoResList, imageResList)


        },
        closeVideo(){
                this.setData({
                    videoFlag: false,

                })
        },
        videoShow({detail}){
            console.log('videoshow')
            let translateX=-50 +parseInt(detail.params[0].modelParamInfo[0]) +'%'
            console.log(detail.params[0].modelParamInfo[0],translateX)
            this.setData({
                videoFlag: true,
                video:detail.video,
                Videoheight:200*detail.l *detail.params[1].modelParamInfo[0],
                Videowidth:300*detail.l *detail.params[1].modelParamInfo[0],
                // scale:,
                translateX:translateX,
                translateY:detail.params[0].modelParamInfo[1]+'%',
                rotateX:detail.params[2].modelParamInfo[0],
                rotateY:detail.params[2].modelParamInfo[1],


            })
        },
        changeModel({
            target
        }) {
            let index = target.dataset.index
            this.child.changeModel(index)
        },
        back() {
           navigateBack('index')
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