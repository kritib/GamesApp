GamesApp::Application.routes.draw do
  root :to => "static_pages#home"

  resource "minesweepers"
  resource "snakes"
end
