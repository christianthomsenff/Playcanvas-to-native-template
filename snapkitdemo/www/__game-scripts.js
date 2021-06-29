var SnapkitPluginBridge=pc.createScript("snapkitPluginBridge");SnapkitPluginBridge.attributes.add("statusText",{type:"entity",description:"Status text"}),SnapkitPluginBridge.attributes.add("shareButton",{type:"entity",description:"Share button"}),SnapkitPluginBridge.attributes.add("initAdKitButton",{type:"entity",description:"Init adkit button"}),SnapkitPluginBridge.attributes.add("loadInterstitialButton",{type:"entity",description:"Load interstitial button"}),SnapkitPluginBridge.attributes.add("loadRewardedButton",{type:"entity",description:"Load rewarded button"}),SnapkitPluginBridge.attributes.add("playAdButton",{type:"entity",description:"Play ad button"});var LoginKitPlugin=pc.createScript("loginKitPlugin");LoginKitPlugin.attributes.add("loginButton",{type:"entity",description:"Login button"}),LoginKitPlugin.attributes.add("logoutButton",{type:"entity",description:"Logout button"}),LoginKitPlugin.attributes.add("bitmoji",{type:"entity",description:"Bitmoji"}),LoginKitPlugin.attributes.add("loggedInText",{type:"entity",description:"Logged in Text"}),LoginKitPlugin.attributes.add("nameText",{type:"entity",description:"Name text"}),LoginKitPlugin.attributes.add("externalIdText",{type:"entity",description:"External ID text"}),LoginKitPlugin.prototype.initialize=function(){document.addEventListener("deviceready",this.onDeviceReady.bind(this))},LoginKitPlugin.prototype.onDeviceReady=function(){this.loginButton.element.on("click",this.login,this),this.logoutButton.element.on("click",this.logout,this),window.LoginKit&&(window.LoginKit.onLoginSucceeded=this.onLoginSucceeded.bind(this),window.LoginKit.onLoginFailed=this.onLoginFailed.bind(this),window.LoginKit.onLogout=this.onLogout.bind(this),this.updateLoggedInStatus())},LoginKitPlugin.prototype.login=function(){console.log("Logging in..."),window.LoginKit.login().then((t=>{console.log("Logging in request fired.")})).catch((t=>{console.log("Error logging in...")}))},LoginKitPlugin.prototype.logout=function(){window.LoginKit.logout()},LoginKitPlugin.prototype.updateLoggedInStatus=function(){window.LoginKit.isLoggedIn().then((t=>{"true"==t?this.fetchUserData():(this.nameText.element.text="",this.externalIdText.element.text="",this.bitmoji.element.texture=null),this.loggedInText.element.text="Logged in: "+t})).catch((t=>{console.log(t)}))},LoginKitPlugin.prototype.fetchUserData=function(){LoginKit.fetchUserData("{me{bitmoji{avatar},displayName,externalId}}").then((t=>{this.nameText.element.text=t.displayname,this.externalIdText.element.text=t.externalId;var i=new pc.Texture(this.app.graphicsDevice,{}),e=document.createElement("img");e.src=t.bitmoji,e.crossOrigin="anonymous",e.onload=t=>{i.setSource(e),this.bitmoji.element.width=100,this.bitmoji.element.height=100,this.bitmoji.element.texture=i}})).catch((t=>{console.log(t)}))},LoginKitPlugin.prototype.onLoginSucceeded=function(){console.log("Login succeeded!"),this.updateLoggedInStatus()},LoginKitPlugin.prototype.onLoginFailed=function(t){console.log("Login failed",t),this.updateLoggedInStatus()},LoginKitPlugin.prototype.onLogout=function(){this.updateLoggedInStatus()};