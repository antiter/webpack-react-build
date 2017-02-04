var path = require('path');
var fs=require('fs');  
var root = process.cwd();
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var htmlIncludePlugin = require("./HtmlInludePlugin");
var TransferWebpackPlugin = require('transfer-webpack-plugin');

var config = {
    name:"public",
    isDebug: true
};
if(typeof(dist_path)!="undefined"){
    config.name = dist_path;
}
// console.log(__dirname);
config.path = path.join(root, '/'+config.name);
var sp = "src";
var jsPath ="src/js",jsName="js",cssPath="src/css",htmlPath="src/html";
if(typeof(source_path)=="object"&&source_path.path){
    sp = source_path.path;
    if(source_path.js) jsPath = sp+"/"+source_path.js,jsName = source_path.js;
    if(source_path.css) cssPath = sp+"/"+source_path.css;
    if(source_path.html) htmlPath = sp+"/"+source_path.html;
}

var m_config = {
    entry: {
        'lib/react':['react','react-dom'],
    },
    output: {
        path: config.path,
        publickPath: config.path,
        filename: "[name].js"
    },
    module: {
        loaders: [
            //.css 文件使用 style-loader 和 css-loader 来处理
             // { test: /^(?!.*?style).*\.css$/, loader: "style!css" },
             // { test: /style.*\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader") },
            //.js 文件使用 jsx-loader 来编译处理 
            { test: /\.js$/, loader: "jsx-loader", exclude: /node_modules/ },
            { test: /\.json$/, loader: "json-loader" },
            { test: /\.(html|shtml)$/, loader: "html-loader" },
            { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=8192&name=./img/[hash:8].[ext]' }
        ]
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    },
    devServer: {
        inline: true
    },
    plugins: []
};
var commonJSKey=[];
if(typeof(common_js)!="undefined"&&common_js.length>0){
	common_js.forEach(function(item){
		m_config.entry[jsName+"/"+item] = "./"+jsPath+"/"+item+".js";
		commonJSKey.push(jsName+"/"+item);
	});
}
commonJSKey.push('lib/react');

var c;
if(typeof(common_css)!="undefined"){
	var coms = Object.prototype.toString.apply(common_css).slice(8,-1);
	if(coms=="String"||(coms=="Array"&&common_css.length>0)){
		//common
		if(coms=="String"){
			c = common_css;
		}else if(coms.length==1){
			c = common_css[0];
		}else{
			c = common_css.join("|");
		}
		var r = {
			test:new RegExp("^(?!.*?("+c+")).*\\.css$"),
			loader:"style!css"
		};
		m_config.module.loaders.push(r);
		var r2 = {
			test:new RegExp("^(?=.*?("+c+")).*\\.css$"),
			loader:ExtractTextPlugin.extract("style-loader", "css-loader")
		};
		m_config.module.loaders.push(r2);
	}else{
		addCss();
	}
}else{
	addCss();
}
function addCss(){
	m_config.module.loaders.push({ test: /\.css$/, loader: "style!css" });
}

var dt=[];
if(typeof direct_transfer!="undefined"){
    var type = Object.prototype.toString.apply(direct_transfer).slice(8,-1);
    if(type=="String") dt.push(direct_transfer);
    else dt = direct_transfer;
}
dt.forEach(function(it){
    m_config.plugins.push(new TransferWebpackPlugin([{ from: it, to: it }], './'+sp));
});
m_config.plugins.push(new htmlIncludePlugin());

m_config.plugins.push(new webpack.optimize.CommonsChunkPlugin('lib/react','lib/react.js'));

if(typeof extract_js !="undefined"&&extract_js.length>0){
    var p = "js",d="js";
    if(typeof extract_js_path !="undefined")
        p = extract_js_path;
    if(typeof extract_js_distpath!="undefined"){
        d = extract_js_distpath;
    }else{
        d = p;
    }
    extract_js.forEach(function(item){
        var key = p+"/"+item;
        if(commonJSKey.indexOf(key)<0){
        	commonJSKey.push(key);
        }
        m_config.plugins.push(new webpack.optimize.CommonsChunkPlugin(key,d+"/"+item+".js"));
    });
}

var css=[];
ls(cssPath,c?new RegExp("^(?=.*?("+c+")).*\\.css$"):'',css);
for(var j in css){
    var style = css[j].replace(new RegExp("^"+sp+"/"),"");
    m_config.plugins.push(new ExtractTextPlugin(style));
}

var htmls=[];
ls(htmlPath,/\.html$/,htmls);
var htmlPlugin = {};
htmlPlugin.inject = 'body';
if (!config.isDebug) {
    htmlPlugin.minify = {
        removeComments: true, //移除HTML中的注释
        collapseWhitespace: true //删除空白符与换行符
    };
    m_config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

htmls.forEach(function(fp){    
    var hp = {minify:htmlPlugin.minify,inject:"body"};
    var r = new RegExp("^"+sp+"/");
    hp.filename = fp.replace(r,""); //生成的html存放路径，相对于 path
    hp.template = fp; //html模板路径
    // console.log(fp);
    var data = fs.readFileSync(fp, "utf8");   
    // console.log(data);
    if (!data) return;
    var reg = /<!--\s*#include\s+virtual=["']([^'"\s]+)_entrance.shtml\s*["']\s*-->/;
    var da = data.match(reg);

    if (!da || da.length == 0) return "";
    var key = da[1].replace(new RegExp("\\./"+sp+"/"),"");
    m_config.entry[key] = da[1] + ".js";
    hp.chunks = [key];
    Array.prototype.push.apply(hp.chunks,commonJSKey);
    
    m_config.plugins.push(new HtmlWebpackPlugin(hp));
    
});
module.exports = m_config;

function ls(p,reg,list){  
    var files=fs.readdirSync(p);
    for(var fn in files){  
        var fname = p+path.sep+files[fn];  
        var stat = fs.lstatSync(fname);  
        if(stat.isDirectory() == true){  
            ls(fname,reg,list);  
        }else{  
            if(reg&&reg.test(fname)) list.push(fname);
        }
    }  
}  
