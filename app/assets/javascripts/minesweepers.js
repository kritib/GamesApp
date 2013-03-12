
TILE_SIZE = 20;

var Minesweeper = (function () {
  var Board = function (width, height, num_mines, game) {
    var that = this;

    that.tiles = {};
    that.num_mines = num_mines;

    that.createSquares = function() {
      for (var i = 0; i < (width*height); i++) {
        that.tiles[i] = new Tile(i, width);
      }
    };


    that.fillMines = function () {
      var mines = 0
      while (mines < num_mines) {
        var tile_id = Math.floor(Math.random() * (width*height));
        if (that.tiles[tile_id].mine == false) {
          that.tiles[tile_id].mine = true;
          that.adjustNeighbors(that.getNeighbors(tile_id));
          mines += 1
        }
      }
    };

    that.getNeighbors = function(tile_id) {
      return [tile_id - 1,
              tile_id + 1,
              tile_id - width,
              tile_id - width - 1,
              tile_id - width + 1,
              tile_id + width,
              tile_id + width - 1,
              tile_id + width + 1];
    }

    that.adjustNeighbors = function (neighbor_ids) {
      neighbor_ids.forEach(function(id) {
        if (that.tiles[id]) {
          that.tiles[id].neighbor_mines += 1;
        }
      });
    };

    that.draw = function (element) {

      element.append($("<div></div>")
             .addClass("ms-board")
      )

      for (var i = 0; i < (width*height); i++) {
        that.tiles[i].draw($(".ms-board"))
      }

    };

    that.update_tile = function (tile_id, action) {
      var tile = that.tiles[tile_id];
      if (action == "reveal") {
        if (tile.flagged == false && tile.revealed == false) {
          if (tile.mine) {
            game.over();
          } else {
            tile.revealed = true;
            game.num_tiles_hidden --;

            that.adjust_revealed(tile, tile_id);
          }
        }
      }

      if (action == "flag") {
        if (tile.flagged) {
          tile.flagged = false;
          if (tile.mine) {
            game.num_mines_flagged --;
          }
        } else {
          tile.flagged = true;
          if (tile.mine) {
            game.num_mines_flagged ++;
          }
        }
      }

      tile.update();
    };

    that.adjust_revealed = function (revealed_tile, tile_id) {
      if (revealed_tile.neighbor_mines == 0) {
        that.getNeighbors(tile_id).forEach(function(id) {
          var tile = that.tiles[id];
          if (tile.flagged == false && tile.revealed == false) {
            tile.revealed = true;
            game.num_tiles_hidden --;
            tile.update();
            that.adjust_revealed(tile, id);
          }
        });
      }
    };



  }


  var Tile = function (id, width) {
    var that = this;

    that.row = Math.floor(id/width);
    that.col = id % width;

    that.mine = false;
    that.flagged = false;
    that.revealed = false;
    that.neighbor_mines = 0;


    that.draw = function (element) {
      element.append($("<div></div>")
             .addClass("tile[" + id + "]")
             .addClass("tile")
             .addClass("btn")
             .css("top", that.row*TILE_SIZE)
             .css("left", that.col*TILE_SIZE)
             .css("width", TILE_SIZE)
             .css("height", TILE_SIZE)
      )
    }

    that.update = function () {
      var element = $(".tile[" + id + "]");
      if (that.flagged) {
        element.addClass("flagged")
      } else {
        element.removeClass("flagged")
        if (that.revealed) {
          if (that.neighbor_mines == 0) {
            element.html(" ");
          } else {
            element.html(that.neighbor_mines);
          }
        }
      }

    }

  }

  var Header = function (level, width) {
    var that = this;

    that.timer = 0;
    that.level = level;
    that.num_flagged = 0;

    that.draw = function (element) {

    }

    that.update_flagged = function () {

    }

    that.update_timer = function () {

    }

  }

  var Game = function (level) {
    var that = this;

    that.element = $('.output');

    that.element.html("");

    switch (level) {
      case "easy":
        that.board_width = 10;
        that.board_height = 10;
        that.num_mines = 10;
        break;
    }

    that.header = new Header(level, that.board_width);
    that.header.draw(that.element);

    that.board = new Board(that.board_width,
                           that.board_height,
                           that.num_mines);
    that.board.createSquares();
    that.board.draw(that.element);

    that.num_mines_flagged = 0;
    that.num_tiles_hidden = that.board_width * that.board_height;


    that.play = function () {
      that.mouseClickHandler();

    };

    that.mouseClickHandler = function () {
      $(".ms-board").bind("contextmenu", function(event) {
        event.preventDefault();
        var tile_id = $(event.target).attr("class").match(/\d+/)[0];
        that.board.update_tile(tile_id, "flag");
        console.log(event.which);
        console.log(event.target);
      });

      $(".ms-board").click(function(event) {
        console.log(event.which);
        console.log(event.target);
      });
    };


  }

  var UI = function () {

  }

  return {
    Game: Game
  }
})();