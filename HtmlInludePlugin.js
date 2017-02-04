var fs = require('fs');
function HtmlInludePlugin() {}

HtmlInludePlugin.prototype.apply = function(compiler) {
  var _self = this;
    // ... 
    compiler.plugin('compilation', function(compilation) {

        compilation.plugin('html-webpack-plugin-before-html-processing', function(htmlPluginData, callback) {
            if (htmlPluginData.html) {
                  var obj = _self.replaceInclude(htmlPluginData.html);
                  if(!obj){
                    callback(null, htmlPluginData);
                    return;
                  }
                  var l = obj.length,i=0;
                  rf();
                  function rf(){
                    if(obj[i].k.toString().indexOf('_entrance.shtml')>0){
                      htmlPluginData.html = htmlPluginData.html.replace(obj[i].k, "");
                      if(i>=l-1){
                        callback(null, htmlPluginData);
                      }else{
                        i++;
                        rf();
                      }
                      return;
                    }
                    fs.readFile(obj[i].v, "utf8", function(error, data) {
                        if(error){
                          console.log("read "+obj[i].k+"error,"+error);
                        }
                        if(data){
                          htmlPluginData.html = htmlPluginData.html.replace(obj[i].k, data);
                        }
                        if(i>=l-1){
                          callback(null, htmlPluginData);
                        }else{
                          i++;
                          rf();
                        }
                    });
                  }
            } else {
                callback(null, htmlPluginData);
            }
        });
    });
};
HtmlInludePlugin.prototype.replaceInclude = function(htmlData){
  if(!htmlData){
    return "";
  }
  var reg = /<!--\s*#include\s+virtual=["']([^'"\s]+)["']\s*-->/g;

  var da = htmlData.match(reg);
  if(!da||da.length==0) return "";
  var obj=[],r;
  // console.log(da);
  da.forEach(function(item){
      if(!item) return;
      r = item.match(/["']([^"'\s]+)["']/);
      r&&obj.push({k:[item],v:r[1]});  
  });
  return obj;
};

module.exports = HtmlInludePlugin;
