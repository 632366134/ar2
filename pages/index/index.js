// index.js
const {
  API
} = require("../../utils/request.js");
import {
  goTo
} from "../../utils/navigate";
const publicFn = require("../../utils/public");
const NEAR = 0.001;
const FAR = 1000;
const app = getApp();
let eventChannel, compList1 = [],
  compList2 = [],
  compList3 = [],
  compList4 = [],
  list1 = [],
  userCodeList = []
Page({
  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true,
      menu: ["shareAppMessage", "shareTimeline"],

    });
  },

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
  data: {
    theme: "light",
    isIPhoneX: app.isIPhoneX,
    list: [],
    compList: [],
    compList1: [],
    compList2: [],
    compList3: [],
    compList4: [],
    collectUrl: "/images/index/add.png",
    isCollect: false,
    collect: [],
    isMask: false,
    borchureDetail: {},
    isShowScan: true,
    active: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onUnload() {
    console.log("页面detached");
    if (wx.offThemeChange) {
      wx.offThemeChange();
    }
  },
  onChange(event) {

  },
  async onReady() {
    publicFn.LoadingOff();
    console.log("页面准备完全");

    this.setData({
      theme: wx.getSystemInfoSync().theme || "light",
    });

    if (wx.onThemeChange) {
      wx.onThemeChange(({
        theme
      }) => {
        this.setData({
          theme
        });
      });
    }

    let list = await API.selProjects();
    await wx.setStorageSync("list", list);
    let c = list.filter(v => v.projectCode == '369654870789541888')
    let collect = c[0]
  await wx.setStorageSync("collect",collect);
    // if (collect) {
    //   let {
    //     projectCode
    //   } = collect;
    //   collect = list.find((v) => {
    //     v.projectCode === projectCode;
    //   });
    //   if (list) {
    //     wx.setStorageSync("collect", collect);
    //   }
    // }
    publicFn.LoadingOff();
    list = list.filter((element) => {
      return (
        element.projectCode != "312330376891027456"
      );
    });
    list.forEach(e => {
      if (e.memberType === 4) {
        list1.push(e)
        return
      }
      switch (e.classify) {
        case 1:
          if(this.filterResult(e.userCode)){
            compList1.push(e)
            userCodeList.push(e.userCode)
          }
          break;
        case 2:
          if(this.filterResult(e.userCode)){
            compList2.push(e)
            userCodeList.push(e.userCode)
          }
          break;
        case 3:
          if(this.filterResult(e.userCode)){
            compList3.push(e)
            userCodeList.push(e.userCode)
          }

          break;
        case 4:
          if(this.filterResult(e.userCode)){
            compList4.push(e)
            userCodeList.push(e.userCode)
          }
          break;
        default:
          break;
      }

    })
    list = list1.slice(0, 6);
    console.log(list, compList1, compList2, compList3, compList4)
    this.setData({
      list,
      compList1,
      compList2,
      compList3,
      compList4,
      collect,
      collectUrl: collect ?
        "https://arp3.arsnowslide.com/" +
        collect.bookCoverObsPath +
        collect.bookCoverObsName : "/images/index/add.png",
      isCollect: collect ? true : false,

    });
  },
  filterResult(v) {
    return userCodeList.indexOf(v) === -1
  },
  goHistroy() {
    publicFn.Loading();
    goTo("history");
  },
  gopriview({
    currentTarget
  }) {
    console.log(currentTarget, "currentTarget");
    this.setData({
      isMask: true,
      borchureDetail: currentTarget.dataset.item,
    });
  },
  changeMask() {
    this.setData({
      isMask: false,
    });
  },

  goService() {
    publicFn.Loading();
    goTo("mycomp");
  },
  goColllect() {
    publicFn.Loading();
    goTo("collect");
  },
  goSearch() {
    publicFn.Loading();
    goTo("compSearch");
  },
});