  

var game;
var savedData;

var gameOptions = {
    gameHeight: 1334,
    backgroundColor: 0x08131a,
    visibleTargets: 9,
    ballDistance: 120,
    rotationSpeed: 4,
    angleRange: [25, 155],
    // localStorageName: "riskystepsgame"
}

window.onload = function() {
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    if(windowWidth > windowHeight){
        windowWidth = windowHeight / 1.8;
    }
    var gameWidth = windowWidth * gameOptions.gameHeight / windowHeight;
    game = new Phaser.Game(gameWidth, gameOptions.gameHeight, Phaser.CANVAS);
    game.state.add("Boot", boot);
    game.state.add("Preload", preload);
    game.state.add("TitleScreen", titleScreen);
    game.state.add("PlayGame", playGame);
    game.state.start("Boot");
    initHeyue();
}

var boot = function(game){};
boot.prototype = {
  	preload: function(){
        game.load.image("loading", "assets/sprites/loading.png");
	},
  	create: function(){
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.stage.disableVisibilityChange = true;
        game.stage.backgroundColor = gameOptions.backgroundColor;
        game.state.start("Preload");
	}
}

var preload = function(game){};
preload.prototype = {
    preload: function(){
        var loadingBar = this.add.sprite(game.width / 2, game.height / 2, "loading");
        loadingBar.anchor.setTo(0.5);
        game.load.setPreloadSprite(loadingBar);
        game.load.image("title", "assets/sprites/title.png");
        game.load.image("playbutton", "assets/sprites/playbutton.png");
        game.load.image("ball", "assets/sprites/ball.png");
        game.load.image("target", "assets/sprites/target.png");
        game.load.image("arm", "assets/sprites/arm.png");
        game.load.image("homebutton", "assets/sprites/homebutton.png");
        game.load.image("tap", "assets/sprites/tap.png");
        game.load.image("fog", "assets/sprites/fog.png");
        game.load.bitmapFont("font", "assets/fonts/font.png", "assets/fonts/font.fnt");
        game.load.bitmapFont("whitefont", "assets/fonts/whitefont.png", "assets/fonts/whitefont.fnt");
        game.load.audio("failsound", ["assets/sounds/fail.mp3", "assets/sounds/fail.ogg"]);
        game.load.audio("hitsound", ["assets/sounds/hit.mp3", "assets/sounds/hit.mp3"]);
        game.load.audio("hit2sound", ["assets/sounds/hit2.mp3", "assets/sounds/hit2.ogg"]);
    },
    create: function(){
        game.state.start("TitleScreen");
    }
}


var titleScreen = function(game){};

titleScreen.prototype = {
    create: function(){
        // savedData = localStorage.getItem(gameOptions.localStorageName) == null ? {score: 0} : JSON.parse(localStorage.getItem(gameOptions.localStorageName));
        var title = game.add.image(game.width / 2, 50, "title");
        title.anchor.set(0.5, 0);
        this.playButton = game.add.button(game.width / 2, game.height / 2, "playbutton", this.startGame);
        this.playButton.anchor.set(0.5);
        this.playButton.alive = false;
        var tween = game.add.tween(this.playButton.scale).to({
            x: 0.8,
            y: 0.8
        }, 500, Phaser.Easing.Linear.None, true, 0, -1);
        tween.yoyo(true);

        this.bscore = game.add.bitmapText(game.width / 2, game.height - 50, "whitefont", "0", 60);
        this.bscore.anchor.set(0.5, 1);
        game.add.bitmapText(game.width / 2, game.height - 110, "font", "BEST SCORE", 48).anchor.set(0.5, 1);
        this.ohnoText = game.add.bitmapText(game.width / 2, game.height - 500, "whitefont", "please unlock your wallet!!", 48);
        this.ohnoText.anchor.set(0.5);
        
        var tweent = game.add.tween(this.ohnoText.scale).to({
            x: 0.8,
            y: 0.8
        }, 500, Phaser.Easing.Linear.None, true, 0, -1);
        tweent.yoyo(true);
    },
    startGame: function(){
        if(!isLock){
             game.state.start("PlayGame");
        }

        console.log("startGame");
    },
    update: function(){

        this.bscore.text = bestScore.toString();
        if(isLock){
            this.ohnoText.visible = true;
    
        }else{
            this.ohnoText.visible = false;
            
        }
    }
    
}

var playGame = function(game){};

playGame.prototype = {
    create: function(){
        this.failSound = game.add.audio("failsound");
        this.hitSound = [game.add.audio("hitsound"), game.add.audio("hit2sound")];
        this.runUpdate = true;
        this.score = 0;
        this.destroy = false;
        this.rotationSpeed = gameOptions.rotationSpeed;
        this.targetArray = [];
        this.steps = 0;
        this.rotatingDirection = game.rnd.between(0, 1);
        this.gameGroup = game.add.group();
        this.targetGroup = game.add.group();
        this.ballGroup = game.add.group();
        this.gameGroup.add(this.targetGroup);
        this.gameGroup.add(this.ballGroup);
        this.arm = game.add.sprite(game.width / 2, 900, "arm");
        this.arm.anchor.set(0, 0.5);
        this.arm.angle = 90;
        this.ballGroup.add(this.arm);
        this.balls = [
            game.add.sprite(game.width / 2, 900, "ball"),
            game.add.sprite(game.width / 2, 900 + gameOptions.ballDistance, "ball")
        ]
        this.balls[0].anchor.set(0.5);
        this.balls[1].anchor.set(0.5);
        this.ballGroup.add(this.balls[0]);
        this.ballGroup.add(this.balls[1]);
        this.rotationAngle = 0;
        this.rotatingBall = 1;
        var target = game.add.sprite(0, 0, "target");
        target.anchor.set(0.5);
        target.x = this.balls[0].x;
        target.y = this.balls[0].y;
        this.targetGroup.add(target);
        this.targetArray.push(target);
        game.input.onDown.add(this.changeBall, this);
        for(var i = 0; i < gameOptions.visibleTargets; i++){
            this.addTarget();
        }
        this.homeButton = game.add.button(game.width / 2, game.height, "homebutton", function(){
            game.state.start("TitleScreen");
        });
        this.homeButton.anchor.set(0.5, 1);
        this.tap = game.add.sprite(game.width / 8, this.balls[0].y - 50, "tap");
        this.tap.anchor.set(0.5);
        var fog = game.add.image(0, 0, "fog");
        fog.width = game.width;
        this.scoreText = game.add.bitmapText(20, 20, "whitefont", "0", 60);
    },
    update: function(){
        if(this.runUpdate){
            var distanceFromTarget = this.balls[this.rotatingBall].position.distance(this.targetArray[1].position);
            if(distanceFromTarget > 90 && this.destroy && this.steps > gameOptions.visibleTargets){
                var ohnoText = game.add.bitmapText(0, 100, "whitefont", "TOO LATE!!", 48);
                ohnoText.anchor.set(0.5);
                this.targetArray[0].addChild(ohnoText);
                this.gameOver();
            }
            if(distanceFromTarget < 25 && !this.destroy){
                this.destroy = true;
            }
            if(this.steps == gameOptions.visibleTargets){
                if(distanceFromTarget < 20){
                    this.tap.alpha = 1;
                }
                else{
                    this.tap.alpha = 0.2;
                }
            }
            this.rotationAngle = (this.rotationAngle + this.rotationSpeed * (this.rotatingDirection * 2 - 1)) % 360;
            this.arm.angle = this.rotationAngle + 90;
            this.balls[this.rotatingBall].x = this.balls[1 - this.rotatingBall].x - gameOptions.ballDistance * Math.sin(Phaser.Math.degToRad(this.rotationAngle));
            this.balls[this.rotatingBall].y = this.balls[1 - this.rotatingBall].y + gameOptions.ballDistance * Math.cos(Phaser.Math.degToRad(this.rotationAngle));
            var distanceX = this.balls[1 - this.rotatingBall].worldPosition.x - game.width / 2;
            var distanceY = this.balls[1 - this.rotatingBall].worldPosition.y - 900;
            this.gameGroup.x = Phaser.Math.linearInterpolation([this.gameGroup.x, this.gameGroup.x - distanceX], 0.05);
            this.gameGroup.y = Phaser.Math.linearInterpolation([this.gameGroup.y, this.gameGroup.y - distanceY], 0.05);
        }
    },
    changeBall:function(e){
        if(this.tap != null){
            this.tap.destroy();
            this.tap = null;
        }
        var homeBounds = this.homeButton.getBounds();
        if(homeBounds.contains(e.position.x, e.position.y)){
            return;
        }
        this.hitSound[this.rotatingBall].play();
        this.destroy = false;
        var distanceFromTarget = this.balls[this.rotatingBall].position.distance(this.targetArray[1].position);
        if(distanceFromTarget < 20){
            var points = Math.floor((20 - distanceFromTarget) / 2);
            this.score += points;
            this.scoreText.text = this.score.toString();
            this.rotatingDirection = game.rnd.between(0, 1);
            var fallingTarget = this.targetArray.shift();
            var tween = game.add.tween(fallingTarget).to({
                alpha: 0,
                width: 0,
                height: 0
            }, 2500, Phaser.Easing.Cubic.Out, true);
            tween.onComplete.add(function(target){
                target.destroy();
            }, this)
            this.arm.position = this.balls[this.rotatingBall].position;
            this.rotatingBall = 1 - this.rotatingBall;
            this.rotationAngle = this.balls[1 - this.rotatingBall].position.angle(this.balls[this.rotatingBall].position, true) - 90;
            this.arm.angle = this.rotationAngle + 90;
            this.addTarget();
        }
        else{
            var ohnoText = game.add.bitmapText(0, 100, "whitefont", "MISSED!!", 48);
            ohnoText.anchor.set(0.5);
            this.targetArray[0].addChild(ohnoText);
            this.gameOver();
        }
    },
    addTarget: function(){
        this.steps++;
        startX = this.targetArray[this.targetArray.length - 1].x;
        startY = this.targetArray[this.targetArray.length - 1].y;
        var target = game.add.sprite(0, 0, "target");
        var randomAngle = game.rnd.between(gameOptions.angleRange[0] + 90, gameOptions.angleRange[1] + 90);
        target.anchor.set(0.5);
        target.x = startX + gameOptions.ballDistance * Math.sin(Phaser.Math.degToRad(randomAngle));
        target.y = startY + gameOptions.ballDistance * Math.cos(Phaser.Math.degToRad(randomAngle));
        var stepText = game.add.bitmapText(0, 0, "whitefont", this.steps.toString(), 32);
        stepText.anchor.set(0.5);
        target.addChild(stepText);
        this.targetGroup.add(target);
        this.targetArray.push(target);
    },
    gameOver: function(){
        this.failSound.play();
        var finalSteps = this.steps - gameOptions.visibleTargets;
        this.scoreText.text = this.score.toString() + " * " + finalSteps + " = " + (this.score * finalSteps).toString();
        this.score *= finalSteps;
        // localStorage.setItem(gameOptions.localStorageName,JSON.stringify({
        //     score: Math.max(savedData.score, this.score)
        // }));
        var a  = Math.max(bestScore, this.score);
        if(a>bestScore){
            setdata(a);
        }
        this.runUpdate = false;
        game.input.onDown.remove(this.changeBall, this);
        this.rotationSpeed = 0;
        this.arm.destroy();
        var gameOverTween = game.add.tween(this.balls[1 - this.rotatingBall]).to({
            alpha: 0
        }, 1500, Phaser.Easing.Cubic.Out, true);
        gameOverTween.onComplete.add(function(){
            game.state.start("PlayGame");
        },this);
    }

}

// { chainId: 1, name: "Mainnet", url: "https://mainnet.nebulas.io" },
// { chainId: 1001, name: "Testnet", url: "https://testnet.nebulas.io" },
// { chainId: 100, name: "Local Nodes", url: "http://127.0.0.1:8685"}
 var dappAddress = "n1tRSqhEdViLqtvZ2SyxUWJ5wdkMfPcT3X3";
 var url = "https://mainnet.nebulas.io"
var chainId=1;
var nebulas;
var neb;
var isLock = true;
var bestScore = 0;
var account;
var Transaction;
var nebPay;
function initHeyue(){
        isLock = false;
        nebulas = require("nebulas");
        account = nebulas.Account;
        Transaction = nebulas.Transaction;
        var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
        nebPay = new NebPay();
        neb = new nebulas.Neb();
        neb.setRequest(new nebulas.HttpRequest(url));
        getdata();
}

function getdata(){
        //var from = account.getAddressString();
        var from = "NAS"
        var value = "0"
        var nonce = 0
        var gas_price = 1000000
        var gas_limit = 2000000
        var callFunction = "get";
        var callArgs = ""; //in the form of ["args"]
        var contract = {
            "function": callFunction,
            // "args": callArgs
        };

        // neb.api.call(from,dappAddress,value,nonce,gas_price,gas_limit,contract).then(function (resp) {
        //     console.log("call:" + resp.result);
        //     var respObject = JSON.parse(resp.result)
        //     bestScore = respObject.score
        //     console.log("call:" + bestScore);
        // }).catch(function (err) {
        //     //cbSearch(err)
        //     console.log("error:" + err.message);
        // });
        nebPay.simulateCall(dappAddress, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: function (resp) {
                var respObject = JSON.parse(resp.result)
                bestScore = respObject.score
                console.log("getdata:" + bestScore);
            }        //设置listener, 处理交易返回信息
        });
}





function setdata(score){
        var params = {};
        // params.from = account.getAddressString();
        params.value = 0
        params.nonce = 0
        params.gas_price = 1000000
        params.gas_limit = 2000000
        var callFunction = "set";
        var callArgs = "["+"\"from\""+","+score+"]"; //in the form of ["args"]
        params.contract = {
            "function": callFunction,
            "args": callArgs
        };
        console.log("setdata call:" + callArgs);
        // neb.api.getAccountState(params.from).then(function (resp) {
        //     params.nonce = parseInt(resp.nonce) + 1;
        //     submit(params);
        // }).catch(function (err) {
        //     //cbSearch(err)
        //     console.log("setdata error:" + err.message);
        // });

        nebPay.call(dappAddress, params.value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
            listener: function (resp) {
                console.log("setdata resp: " + resp.result);
            }              
        });

        
}


// function submit(params) {
//     var gTx = new Transaction(chainId, 
//                 account,
//                 dappAddress, params.value, params.nonce, params.gas_price, params.gas_limit, params.contract);
//         gTx.signTransaction();
//         neb.api.sendRawTransaction(gTx.toProtoString()).then(function (resp) {
//             console.log("submit call:" + resp.result);
//         }).catch(function (err) {
//             //cbSearch(err)
//             console.log("submit error:" + err.message);
//         });
// }
