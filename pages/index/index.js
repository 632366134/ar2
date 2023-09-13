import {
    API
} from "../../utils/request.js"
Page({
    data: {
        showBackBtn: true,
        resourceData: {},
        onFlags: [
            false, false, // gltf
            false, false, // image
            false, false, false // video
        ],
        gltfList: [],
        imageList: [],
        videoList: [],
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        renderWidth: 0,
        renderHeight: 0,
        dpiScale: 1,
        list: {},
        mainFlag: false,
        memberType4List: []
    },
    async onLoad() {
        let data = {
            pagination: "",
            pageNum: "",
            page: "",
            projectName: "",
            userCode: "",
        }
        const res = await API.selProjects(data)
        const memberType4List = res.filter((v, i) => {
            if (v.memberType === 4) {
                return v

            }
        })
        const fIndex = memberType4List.findIndex(v => v.projectCode === '312330376891027456')
        const filterMainList = (a, b) => {
            const bSet = new Set(b);
            return a.filter(item => !bSet.has(item));
        }
        const uniqueObjects = res.reduce((acc, obj) => {
            const userCode = obj.userCode;
            if (!acc[userCode]) {
                acc[userCode] = obj;
            }
            return acc;
        }, {});
        const topList = []
        const makeRequests = async (list) => {
            for (const obj of list) {
                const projectCode = obj.projectCode;
                try {
                    const data = await API.selMediaApps({
                        projectCode
                    });
                    if (data.mediaList[0]) {
                        data.mediaList[0].projectName = obj.projectName
                        topList.push(data.mediaList[0])
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
        const resultArray = Object.values(uniqueObjects);
        const mainList = filterMainList(resultArray, memberType4List)
        console.log(mainList, memberType4List)
        memberType4List.splice(fIndex, 1)
        await makeRequests(memberType4List)
        this.topList = topList
        console.log(topList);
        const reduceMainList = (list) => {
            return list.reduce((result, obj) => {
                if (obj.classify === 1) {
                    result.classify1.push(obj)
                } else if (obj.classify === 2) {
                    result.classify2.push(obj)

                } else if (obj.classify === 3) {
                    result.classify3.push(obj)

                } else if (obj.classify === 4) {
                    result.classify4.push(obj)

                }
                return result
            }, {
                classify1: [],
                classify2: [],
                classify3: [],
                classify4: []
            })
        }
        this.list = reduceMainList(mainList)
        // 准备加载数据
        const info = wx.getSystemInfoSync();
        this.width = info.windowWidth;
        this.height = info.windowHeight;
        this.dpi = info.pixelRatio;
        this.setData({
            width: this.width,
            height: this.height,
            renderWidth: this.width * this.dpi * this.data.dpiScale,
            renderHeight: this.height * this.dpi * this.data.dpiScale,
            list: this.list,
            mainFlag: true,
            memberType4List: this.topList
        });
        this.first =true

    },
    changeMask({
        detail
    }) {
        this.setData({
            isMask: detail.flag,
            borchureDetail: detail.borchureDetail,
        });
    },
    changeMainFlag({
        detail
    }) {
        this.setData({
            mainFlag: detail.mainFlag
        })
    },
    onShow() {
        if(this.first){
            this.setData({
                // width: this.width,
                // height: this.height,
                // renderWidth: this.width * this.dpi * this.data.dpiScale,
                // renderHeight: this.height * this.dpi * this.data.dpiScale,
                // list: this.list,
                mainFlag: true,
                // memberType4List: this.topList
            });
        }

    }

});