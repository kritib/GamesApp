BOARD_SIZE = 20;
SEGMENT_SIZE = 20;
SHIFT = 14;


function Snake (name, headColor, bodyColor, body, head, dir) {
  return {
    name: name,
    headColor: headColor,
    bodyColor: bodyColor,
    body: body,
    head: head,
    direction: dir,

    addSegment: function (pos) {
      this.body.push({x: pos.x, y: pos.y});
    },

    makeNewHead: function () {
      this.head = {
        x: this.head.x + this.direction.x,
        y: this.head.y + this.direction.y
      };

      this.adjustHead();
    },

    adjustHead: function () {
      var that = this;

      for (var coord in that.head) {
        if (that.head[coord] < SHIFT) {
          that.head[coord] = (BOARD_SIZE * SEGMENT_SIZE) - SEGMENT_SIZE + SHIFT;
        } else if (that.head[coord] > ((BOARD_SIZE * SEGMENT_SIZE) - SEGMENT_SIZE + SHIFT)) {
          that.head[coord] = SHIFT;
        }
      }
    },

    step: function () {
      this.addSegment(this.head);
      this.makeNewHead();
      this.adjustHead();

      return this.body.shift();
    },

    grow: function (tail) {
      this.body.unshift(tail);
    },

    turn: function (dir) {
      switch (dir) {
        case "left":
          this.direction.x = -SEGMENT_SIZE;
          this.direction.y = 0;
          break;
        case "right":
          this.direction.x = SEGMENT_SIZE;
          this.direction.y = 0;
          break;
        case "up":
          this.direction.x = 0;
          this.direction.y = -SEGMENT_SIZE;
          break;
        case "down":
          this.direction.x = 0;
          this.direction.y = SEGMENT_SIZE;
          break;
      }
    },

    hitApple: function(apple) {
      return this.head.x == apple.x && this.head.y == apple.y;
    },

    hitSnake: function(snake) {
      var that = this;
      var hit = false;

      snake.forEach(function(segment) {
        if (segment.x == that.head.x && segment.y == that.head.y) {
          hit = true;
        }
      })
      return hit;
    }
  }
};


var Game = (function () {

  function MakeBoard (element) {
    element.append($("<div></div>")
           .addClass("board")
           .css("width", BOARD_SIZE * SEGMENT_SIZE)
           .css("height", BOARD_SIZE * SEGMENT_SIZE)
    )

    return $(".board");
  }


  function Apple () {
    this.new = function () {
      this.pos = {
        x: (Math.floor(Math.random() * (BOARD_SIZE - 1)) * SEGMENT_SIZE) + SHIFT,
        y: (Math.floor(Math.random() * (BOARD_SIZE - 1)) * SEGMENT_SIZE) + SHIFT
      }
    }


    this.addToBoard = function(element) {
      var that = this;

      element.append($("<div></div>")
        .addClass("apple")
        .css("left", that.pos.x)
        .css("top", that.pos.y)
        .css("background-color", "#080000")
        .css("width", SEGMENT_SIZE)
        .css("height", SEGMENT_SIZE)
      )
    }
  }

  function AddSnakeToBoard (element, snake) {

    this.addSnakeBody = function () {
      snake.body.forEach(function(segment) {
        element.append($("<div></div>")
          .addClass("segment")
          .css("left", segment.x)
          .css("top", segment.y)
          .css("background-color", snake.bodyColor)
          .css("width", SEGMENT_SIZE)
          .css("height", SEGMENT_SIZE)
        )
      })

    };

    this.addSnakeHead = function () {
      element.append($("<div></div>")
        .addClass("head")
        .css("left", snake.head.x)
        .css("top", snake.head.y)
        .css("background-color", snake.headColor)
        .css("width", SEGMENT_SIZE)
        .css("height", SEGMENT_SIZE)
      )
    };

    this.addSnakeBody();
    this.addSnakeHead();
  }

  return {
    MakeBoard: MakeBoard,
    Apple: Apple,
    AddSnakeToBoard: AddSnakeToBoard
  }

})();


var STEP_TIME_MILLIS = 300;
var COUNT = 1;

function userInterface() {
  $('#pauseButton').click(function() {
    alert("Game Paused");
  });

  $('#startButton').click(function() {
    $('body').addClass('running')
    runGame();
  });

  $('#newButton').click(function() {
    $('body').removeClass('newGame');
    $('body').addClass('running')
    runGame();
  });
};

function runGame() {
  $('.output').html("");

  var board = Game.MakeBoard($('.output'));
  var snake1 = new Snake("Red", "#FF0000", "#FF6600",
                         [{x: 20, y: SHIFT}, {x: 40, y: SHIFT}],
                         {x: 40 + SHIFT, y: SHIFT},
                         {x: SEGMENT_SIZE, y: 0});
  var snake2 = new Snake("Blue", "#6600FF", "#6666FF",
                         [{x: 390, y: 390}, {x: 370, y: 390}],
                         {x: 340 + SHIFT,
                          y: (BOARD_SIZE*SEGMENT_SIZE) - SEGMENT_SIZE + SHIFT},
                         {x: -SEGMENT_SIZE, y: 0});
  var apple = new Game.Apple();

  Game.AddSnakeToBoard(board, snake1);
  Game.AddSnakeToBoard(board, snake2);
  apple.new();
  apple.addToBoard(board);

  parseKeydown(snake1, snake2);
  runStep(board, [snake1, snake2], apple);
};

function runStep(board, snakes, apple) {
  console.log("I AM HERE");
  var gameOver = false;
  if (COUNT%100 == 0) {
    STEP_TIME_MILLIS -= 10;
  }

  snakes.forEach(function (snake) {
    var oldTail = snake.step();
    if (snake.hitApple(apple.pos)) {
      snake.grow(oldTail);
      apple.new();
    }

    if (snake.hitSnake(snakes[0].body.concat(snakes[1].body))) {
      gameOver = snake.name;
    }
  });


  if (gameOver) {
    board.append(gameOver + " Loses!");
    $('body').removeClass('running');
    $('body').addClass('newGame');
  } else {
    board.html("");
    Game.AddSnakeToBoard(board, snakes[0]);
    Game.AddSnakeToBoard(board, snakes[1]);
    apple.addToBoard(board);
    COUNT += 1;
    window.setTimeout(function () {
      runStep(board, snakes, apple)
    }, STEP_TIME_MILLIS);
  }
};



function parseKeydown(snake1, snake2) {
  $('html').keydown(function (event) {
    switch (event.keyCode) {
      case 87:
        snake1.turn("up")
        break;
      case 83:
        snake1.turn("down")
        break;
      case 65:
        snake1.turn("left")
        break;
      case 68:
        snake1.turn("right")
        break;
      case 38:
        snake2.turn("up")
        break;
      case 40:
        snake2.turn("down")
        break;
      case 37:
        snake2.turn("left")
        break;
      case 39:
        snake2.turn("right")
        break;
    }
  })
};





