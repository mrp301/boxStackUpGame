// グローバルに展開
phina.globalize();
// アセット
var ASSETS = {
  // 画像
  image: {
    'tomapiko': './mirai.png',
    'box': 'box.png',
    'title': 'title.jpg',
  },
  // フレームアニメーション情報
  spritesheet: {
    'tomapiko_ss': {
      "frame": {
        "width": 300,
        "height": 300,
        "rows": 2,
        "cols": 3
      },
      "animations": {
        "stand": {
          "frames": [0],
          "next": "stand",
          "frequency": 4
        },
        "left": {
          "frames": [1, 0, 2, 0],
          "next": "left",
          "frequency": 4
        },
        "right": {
          "frames": [3, 5, 4, 5],
          "next": "right",
          "frequency": 4
        }
      }
    }
  },
};
// 定数
var JUMP_POWOR = 50; // ジャンプ力
var GRAVITY = 3; // 重力
var SPEED = 6
var PIECE_SIZE = 80;
var PIECE_SIZE_HALF = PIECE_SIZE/2;
var isKeyPush = false
var HIT_RADIUS1     = 18;  // 当たり判定用の半径
var HIT_RADIUS2     = 16;  // 当たり判定用の半径
var daishaX= -62//当たり判定位置調整X
var daishaY = -125//当たり判定位置調整Y
var playerPosition = 0
var playerScale = false//false反転なし
var boxCount = 0
var SCREEN_WIDTH = 493;  // スクリーン幅
var SCREEN_HEIGHT = 740;  // スクリーン高さ
var MISS_COUNT = 0
/*
 * メインシーン
 */
phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function(option) {

    this.superInit(option);
    //スコアリセット
    boxCount = 0
    MISS_COUNT = 0
    // 親クラス初期化
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
    } else if(MISS_COUNT === -3) {
      this.exit({
      score: "失敗..."
      })
    }

    if (key.getKey('left')) {
      playerScale = false
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
      playerScale = true
      //player.scaleX *= -1
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
        if(!playerScale) {
          var c1x = (playerPosition + daishaX)
        } else {
          var c1x = (player.x - daishaX)
        }

        var c1y = ((player.y - daishaY) - (boxCount*60))

       // 判定用の円
       var c1 = Circle(c1x, c1y, HIT_RADIUS1);
       var c2 = Circle(box.x, box.y, HIT_RADIUS2);
       // 円判定
       if (Collision.testCircleCircle(c1, c2) && !box.hit) {
          box.hit = true
          boxCount ++
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
        if(!playerScale) {
          this.x = playerPosition + daishaX
        } else {
          this.x = playerPosition - daishaX
        }
    }
    if (this.y === 860) {
      this.remove()
      MISS_COUNT --
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
  },
  // 毎フレーム処理
  update: function() {
    if (this.left < -140) {
        this.left = -140
    } else if (this.right > 780) {
      this.right = 780
    }
  },
});

// タイトルシーン
phina.define('TitleScene', {
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    this.superInit();

    // タイトル
    Label({
      text: 'ダンボールを\n10個積み上げろ！',
      fontSize: 30,
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(4));

    Label({
      text: "TOUCH START",
      fontSize: 32,
    }).addChildTo(this)
      .setPosition(this.gridX.center(), this.gridY.span(12))
      .tweener.fadeOut(1000).fadeIn(500).setLoop(true).play();

    var title = Sprite('title').addChildTo(this);
    title.x = this.gridX.center();
    title.y = this.gridY.center();
    // 画面タッチ時
    this.on('pointend', function() {
      // 次のシーンへ
      this.exit();
    });
  },
});
/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
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
