// グローバルに展開
phina.globalize();
// アセット
var ASSETS = {
  // 画像
  image: {
    'tomapiko': 'https://rawgit.com/phi-jp/phina.js/develop/assets/images/tomapiko_ss.png',
    'box': 'box.png',
  },
  // フレームアニメーション情報
  spritesheet: {
    'tomapiko_ss': 'https://rawgit.com/phi-jp/phina.js/develop/assets/tmss/tomapiko.tmss',
  },
};
// 定数
var JUMP_POWOR = 50; // ジャンプ力
var GRAVITY = 3; // 重力
var SPEED = 6
var PIECE_SIZE = 80;
var PIECE_SIZE_HALF = PIECE_SIZE/2;
var isKeyPush = false
var HIT_RADIUS1     = 16;  // 当たり判定用の半径
var HIT_RADIUS2     = 16;  // 当たり判定用の半径
var playerPosition = 0
var boxCount = 0
/*
 * メインシーン
 */
phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit();
    // 背景
    this.backgroundColor = 'skyblue';

    //スコア表示
     this.scoreLabel = Label(boxCount+"/10").addChildTo(this);
     this.scoreLabel.x = this.gridX.center();
     this.scoreLabel.y = this.gridY.span(4);
     this.scoreLabel.fill = 'gray';

    // 床
    this.floor = RectangleShape({
      width: this.gridX.width,
      height: this.gridY.span(1),
      fill: 'silver',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(14));
    // プレイヤー作成
    var player = Player('tomapiko').addChildTo(this);
    // 初期位置
    player.x = this.gridX.center();
    player.bottom = this.floor.top;


    // 敵グループ
    this.boxGroup = DisplayElement().addChildTo(this);


    // 画面タッチ時処理
    this.onpointend = function(Label) {
      Label({
        text: 'aaa'
      }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(3));
    };

    // 参照用
    this.player = player;
  },
  // 毎フレーム処理
  update: function(app) {
    var key = app.keyboard;
    var player = this.player;
    playerPosition = this.player.x

    this.scoreLabel.text = boxCount+"/10"

    if(boxCount === 10){
      this.exit({
      score: "クリア！"
      })
    } else if(boxCount === -1) {
      boxCount = 0
      this.exit({
      score: "失敗..."
      })
    }

    if (key.getKey('left')) {
      if(player.scaleX === -1) {
        player.scaleX *= -1
      }
      if(!isKeyPush){
        state(player, 'left')
        isKeyPush = true
      }
      player.x -= SPEED
    }
    if (key.getKey('right')) {
      if(player.scaleX === -1) {
        player.scaleX *= -1
      }
      if(!isKeyPush){
        state(player, 'right')
        isKeyPush = true
      }
      player.x += SPEED;
    }

    if (key.getKey('shift')) {
      player.anim.ss.getAnimation('left').frequency = 2
      player.anim.ss.getAnimation('right').frequency = 2
      SPEED = 16
    }

    if (key.getKeyUp('shift')) {
      player.anim.ss.getAnimation('left').frequency = 4
      player.anim.ss.getAnimation('right').frequency = 4
      SPEED = 6
    }

    if (key.getKeyUp('right')) {
      if(player.scaleX === 1) {
        player.scaleX *= -1
      }
      state(player, 'stand')
      isKeyPush = false
    }

    if (key.getKeyUp('left')) {
      if(player.scaleX === -1) {
        player.scaleX *= -1
      }
      state(player, 'stand')
      isKeyPush = false
    }

    if (app.frame % 50 === 0) {
      this.createBox();
    }



    // 床とヒットしたら
    if (player.hitTestElement(this.floor)) {
      // y方向の速度と重力を無効にする
      player.physical.velocity.y = 0;
      player.physical.gravity.y = 0;
      // 位置調整
      player.bottom = this.floor.top;
      // フラグ立て
      player.isOnFloor = true;
      // アニメーション変更
      player.anim.gotoAndPlay('left');
    }

    // 敵とプレイヤーの辺り判定
    this.hitTestEnemyPlayer();
  },

    createBox: function() {
      var x = Math.randint(PIECE_SIZE_HALF, this.gridX.width-PIECE_SIZE_HALF);
      var y = -100
      //box().addChildTo(this).setPosition(x, -100);
      box().addChildTo(this.boxGroup).setPosition(x, y);
      //box.y = 100;
   },

   //敵とプレイヤーの当たり判定処理
   hitTestEnemyPlayer: function() {
     var player = this.player;
     var self = this;
     // 敵をループ
      this.boxGroup.children.each(function(box) {
       // 判定用の円
       var c1 = Circle(player.x, ((player.y-20) + (boxCount*-60)), HIT_RADIUS1);
       var c2 = Circle(box.x, box.y, HIT_RADIUS2);
       // 円判定
       if (Collision.testCircleCircle(c1, c2) && !box.hit) {
          box.hit = true
          boxCount ++
          console.log('hit!');
       }
     });
   },
});

phina.define("box", {
  // 継承
  superClass: 'Sprite',
  hit: false,
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit('box');
  },

  update: function(hit) {
    if(!this.hit) {
      this.y += 8;
    } else {
      this.x = playerPosition
    }
    if (this.y === 860) {
      boxCount = -1
    }
  }
});

function state(player, motion) {
  isKeyPush = true
  player.anim.gotoAndPlay(motion);
}

/*
 * プレイヤークラス
 */
phina.define('Player', {
  superClass: 'Sprite',
  // コンストラクタ
  init: function(image) {
    // 親クラス初期化
    this.superInit(image);
    // フレームアニメーションをアタッチ
    this.anim = FrameAnimation('tomapiko_ss').attachTo(this);
    // 初期アニメーション指定
    this.anim.gotoAndPlay('stand');
    // 初速度を与える
    //this.physical.force(-10, 0);
    // 床の上かどうか
    this.isOnFloor = true;
  },
  // 毎フレーム処理
  update: function() {
    // 画面端で速度と向き反転
    if (this.left < 0) {
        this.left = 0
    } else if (this.right > 640) {
      this.right = 640
    }
  },
});
/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    title: 'ダンボールを\n10個積み上げろ！',
    // MainScene から開始
    startLabel: 'title',
    // アセット読み込み
    assets: ASSETS,
  });
  // fps表示
  //app.enableStats();
  // 実行
  app.run();
});
