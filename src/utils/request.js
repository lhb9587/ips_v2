import axios from "axios";

// import { useGlobalLoading } from "@/hooks/use-loading.ts";
import { ElMessageBox,ElMessage } from "element-plus";
// import 'element-ui/lib/theme-chalk/index.css'
import store from "../state/store";
import { getToken } from "./auth";
import qs from "qs";
import { showLoading, hideLoading } from "./loading";
// const loading = useGlobalLoading();
// create an axios instance
const service = axios.create({
  baseURL: '', // url = base url + request url
  withCredentials: true, // send cookies when cross-domain requests
  // timeout: 10000
  onUploadProgress: (p) => {
    return 100 * (p.loaded / p.total);
  },
});
// request interceptor
service.interceptors.request.use(
  (config) => {
    // console.log('config',JSON.stringify(JSON.parse(config)))

    if (config.isLoading) {
      // 如果配置了isLoading: false，则不显示loading
      showLoading();
    }

    var seleToken = "";
    if (store.state.user.token) {
      // config.headers['tokenID'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
      seleToken = getToken();
    }
    if (config.method === "post") {
      // for (var k in config.data) {
      //   if(!config.data[k] && config.data[k] !== false && config.data[k] !== 0) {
      //      config.data[k] = undefined
      //   }
      // }
      if (config.headers["Content-Type"] === "application/json;charset=UTF-8") {
        config.data = JSON.stringify({
          ...config.data,
        });
        config.params = {
          tokenID: seleToken,
          ...config.params,
        };
      }
      if (
        config.headers["Content-Type"] !== "multipart/form-data" &&
        config.headers["Content-Type"] !== "application/json;charset=UTF-8"
      ) {
        for (var key in config.data) {
          if (typeof config.data[key] === "string") {
            config.data[key] = config.data[key].trim();
          }
        }
        config.data = qs.stringify(
          {
            tokenID: seleToken,
            ...config.data,
          },
          {
            allowDots: true,
          }
          // {
          //   indices: true
          // }, {
          //   arrayFormat: 'indices'
          // }
        );
      }
    } else {
      config.paramsSerializer = function (params) {
        return qs.stringify(params, { arrayFormat: "repeat" });
      };
      for (let key in config.params) {
        if (typeof config.params[key] === "string") {
          config.params[key] = config.params[key].trim();
        }
        // if(!config.params[key] && config.params[key] !== false && config.params[key] !== 0) {
        //    config.params[key] = undefined
        // }
      }
      for (let key in config.data) {
        if (typeof config.data[key] === "string") {
          config.data[key] = config.data[key].trim();
        }
        // if(!config.data[key] && config.data[key] !== false && config.data[key] !== 0) {
        //    config.data[key] = undefined
        // }
      }

      config.params = {
        tokenID: seleToken,
        ...config.params,
        ...config.data,
      };
    }
    // config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    // console.log('config',config)
    return config;
  },
  (error) => {
    hideLoading();
    // do something with request error
    console.log(error); // for debug
    return Promise.reject(error);
  }
);
let isTokenInvalid = false;
// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    if (response.config.isLoading) {
      hideLoading();
    }
    
    // 处理blob类型的响应（如文件下载）
    if (response.config.responseType === "blob") {
      return response;
    }
    
    const res = response.data;
    // if the custom code is not 20000, it is judged as an error.
    if (res.success !== true) {
      // 如果配置了 showErrorMessage: false，则不显示错误 message
      if (response.config.showErrorMessage !== false) {
        res.message &&
        ElMessage({
          message: res.message,
          type: "error",
          duration: 3 * 1000,
          grouping:true
        });
      }
      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.messageType == '-100' || res.message == '身份无效。' || res.message == '身份认证失败') {
        // to re-login
        if (!isTokenInvalid) {
          isTokenInvalid = true;
          //判断当前是否是iframe，目前只有合同页是iframe
          if (window.self !== window.top){
            const data = {
              code:'-200'
            }
            window.parent.postMessage(data, '*')
          }else{
            ElMessageBox.confirm("登录已过期请重新登录", "重新登录", {
              confirmButtonText: "重新登录",
              cancelButtonText: "取消",
              type: "warning",
              confirmButtonClass:'reLogin-primary'
            })
              .then(() => {
                store.dispatch("user/resetToken").then(() => {
                  location.reload();
                });
              })
              .finally(() => {
                isTokenInvalid = false;
              });
          }
        }
      }
      return Promise.reject(res);
    } else {
      if (res && res.messageType == 1000 && (res.data === null || res.data === undefined)) {
        // messageType=1000 表示无统计数据，统一返回空列表避免页面中断
        res.data = [];
        res.total = res.total ?? 0;
        res.currPage = res.currPage ?? 1;
      }
      if (
        res.data &&
        Object.prototype.toString.call(res.data) === "[object Array]"
      ) {
        res.data = res.data.filter((item) => Boolean(item) || item === 0);
      }
      return res;
    }
  },
  (error) => {
    hideLoading();

    // ElMessage({
    //   message: '系统超时,请检查网络后重试！',
    //   type: 'error',
    //   duration: 5 * 1000
    // })

    return Promise.reject({ message: error });
  }
);
export default service;
