webpack-react-build
====
第一步，
# npm install -g webpack
第二步
修改package.json
"dependencies": {
    "css-loader": "^0.25.0",
    "extract-text-webpack-plugin": "^1.0.1",
    "file-loader": "^0.9.0",
    "fs": "0.0.2",
    "html-loader": "^0.4.3",
    "html-webpack-plugin": "^2.22.0",
    "json-loader": "^0.5.4",
    "jsx-loader": "^0.13.2",
    "react": "^15.3.1",
    "react-dom": "^15.3.1",
    "style-loader": "^0.13.1",
    "transfer-webpack-plugin": "^0.1.4",
    "url-loader": "^0.5.7",
    "webpack": "^1.13.2",
    "webpack-dev-server": "^1.15.1"
  }
第三步
# npm install

第四步
# npm i webpack-react-build

第五步
根目录新增webpack配置文件：

webpack.config.js：

dist_path = "public";//打包之后的目录
source_path={
    path:"src",//源代码目录
    js:"js",//path/js js目录
    css:'css',//path/css css目录
    html:'html' //path/html html目录
};
//直接迁移的目录
direct_transfer = ['img','fonts','lib'];

//公共提取的css文件  目录为source_path.path+css
common_css=['style'];

//公共引用的js文件
common_js = ['frame'];

//公共提取的js文件
extract_js=['util'];

//提取的目录
extract_js_path = "common";

//提取目标目录
extract_js_distpath = "common";

module.exports = require('webpack-react-build');
