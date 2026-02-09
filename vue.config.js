require('events').EventEmitter.defaultMaxListeners = 0; // 解除限制

module.exports = {
  publicPath: '/v2/', // 设置应用的公共路径前缀
  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      localeDir: "locales",
      enableInSFC: false,
    },
    compilerOptions: {
      paths: {
        "@/*": ["src/*"],
      },
    },
  },
  devServer: {
    port: 9528,
    https: false,
    hot: true, // 启用热更新
    client: {
      overlay: false, // 禁用错误覆盖层
      progress: true, // 显示编译进度
    },
    // 代理跨域（模拟示例）
    proxy: {
      "/hi-ee": {
        target: `http://192.168.0.17:8000`,
        changeOrigin: true,
        pathRewrite: {
          "^/hi-ee": "/hi-ee",
        },
      },
      "/124": {
        target: `http://43.227.253.254:8000`,
        changeOrigin: true,
        pathRewrite: {
          "^/124": "",
        },
      },
      ip_import_data: {
        target: `http://192.168.0.17:8180`,
        changeOrigin: true,
        pathRewrite: {
          "^/ip_import_data": "/ip_import_data",
        },
      },
      ip_data: {
        target: `http://192.168.0.17:8180`,
        changeOrigin: true,
        pathRewrite: {
          "^/ip_data": "/ip_data",
        },
      },
      ip_stats: {
        target: `http://192.168.0.17:8180`,
        changeOrigin: true,
        pathRewrite: {
          "^/ip_data": "/ip_data",
        },
      },
      "/ipdoc": {
        target: `http://192.168.0.17:8000`,
        // target: `https://we.wanhuida.com`,
        changeOrigin: true,
        pathRewrite: {
          "^/ipdoc": "/ipdoc",
        },
      },
      ipc_account: {
        target: `http://192.168.0.24:8000/`,
        changeOrigin: true,
        pathRewrite: {
          "^/ipc_account": "/ipc_account",
        },
      },
      ipc_sec: {
        target: `http://192.168.0.24:8000/`,
        changeOrigin: true,
        pathRewrite: {
          "^/ipc_sec": "/ipc_sec",
        },
      },
      "/socket.io": {
        target: `http://192.168.0.17:9643`,
        changeOrigin: true,
        pathRewrite: {
          "^/socket.io": "/socket.io",
        },
      },
      chat: {
        target: `http://192.168.0.17:8480`,
        changeOrigin: true,
        pathRewrite: {
          "^/chat": "/chat",
        },
      },
      [process.env.VUE_APP_BASE_API + "/GSQ"]: {
        target: `http://192.168.0.17:8000`,
        changeOrigin: true,
        pathRewrite: {
          ["^" + process.env.VUE_APP_BASE_API + "/GSQ"]: "/GSQ",
        },
      },
      [process.env.VUE_APP_BASE_API]: {
        target: `http://192.168.0.17:8000`,
        // target: `https://we.wanhuida.com`, //  ,
        changeOrigin: true,
        pathRewrite: {
          ["^" + process.env.VUE_APP_BASE_API]: "",
        },
      },
    },
  },
  css: {
		loaderOptions: {
			sass: {
				implementation: require('sass'),
				sassOptions: {
					// 生效代码
					outputStyle: 'expanded'
				}
			}
		}
  },
  configureWebpack: {
    // module: {
    //   rules: [
    //     {
    //       test: /\.js$/,
    //       exclude: /node_modules/, // 确保node_modules也被排除
    //       use: [
    //         {
    //           loader: "eslint-loader",
    //           options: {
    //             // eslint-loader的配置选项
    //             emitWarning: true,
    //             emitError: true,
    //             failOnError: false,
    //             // 排除特定的文件夹
    //             exclude: /src\/components\/ag-grid-enterprise\//,
    //           },
    //         },
    //         // 其他loader...
    //       ],
    //     },
    //   ],
    // }
  }
};
