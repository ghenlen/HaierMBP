/**
 * aui-sharebox.js
 * @author 流浪男
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function( window, undefined ) {
    "use strict";
    var auiSharebox = function() {
    };
    var isShow = false;
    auiSharebox.prototype = {
        init: function(params,callback){
            this.frameBounces = params.frameBounces;
            this.content = params.content;
            this.maskDiv;
            this.shareBoxDiv;
            var self = this;
            self.open(params,callback);
        },
        open: function(params,callback) {
        	var self = this;
            if(!self.maskDiv){
                self.maskDiv = document.createElement("div");
                self.maskDiv.className = "aui-mask";
                document.body.appendChild(self.maskDiv);
            }
            self.shareBoxDiv = document.createElement("div");
            self.shareBoxDiv.className = "aui-sharebox";
            document.body.appendChild(self.shareBoxDiv);
            self.shareBoxDiv.innerHTML = self.content;
            var actionsheetHeight = self.shareBoxDiv.offsetHeight;
            self.maskDiv.classList.add("aui-mask-in");
            self.shareBoxDiv.style.webkitTransform = self.shareBoxDiv.style.transform = "translate3d(0,0,0)";
            self.shareBoxDiv.style.opacity = 1;
            self.shareBoxDiv.addEventListener("touchmove", function(event){
                event.preventDefault();
            })
            self.maskDiv.addEventListener("touchmove", function(event){
                event.preventDefault();
            })
           
            self.maskDiv.onclick = function(){self.close();return;};
        },
        close: function(){
            var self = this;
            if(typeof(api) != 'undefined' && typeof(api) == 'object' && self.frameBounces){
                api.setFrameAttr({
                    bounces:true
                });
            }
            if(self.shareBoxDiv){
                var actionsheetHeight = self.shareBoxDiv.offsetHeight;
                self.shareBoxDiv.style.webkitTransform = self.shareBoxDiv.style.transform = "translate3d(0,"+actionsheetHeight+"px,0)";
                self.maskDiv.style.opacity = 0;
                setTimeout(function(){
                    if(self.maskDiv){
                        self.maskDiv.parentNode.removeChild(self.maskDiv);
                    }
                    self.shareBoxDiv.parentNode.removeChild(self.shareBoxDiv);
                    self.maskDiv = self.shareBoxDiv = false;
                }, 300)
            }
        }
    };
	window.auiSharebox = auiSharebox;
})(window);