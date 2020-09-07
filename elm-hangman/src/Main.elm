module Main exposing (main)

import Browser
import Browser.Events exposing (onAnimationFrameDelta, onKeyPress)
import Canvas exposing (circle, lineTo, moveTo, path, rect, shapes)
import Canvas.Settings exposing (..)
import Canvas.Settings.Advanced exposing (..)
import Canvas.Settings.Line
import Color
import Debug
import Html exposing (Html, div, h1, h2, p, text)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode
import List.Extra
import Random


type Key
    = Character Char
    | Control String


keyDecoder : Decode.Decoder Msg
keyDecoder =
    Decode.map keyPressToMsg (Decode.field "key" Decode.string)


keyPressToMsg : String -> Msg
keyPressToMsg string =
    let
        key =
            case String.uncons string of
                Just ( char, "" ) ->
                    Character char

                _ ->
                    Control string

        _ =
            Debug.log "KeyPressed" key
    in
    GameMsg (KeyPressed key)


type alias GameState =
    { badGuesses : List Char -- Which letters has the player guessed and missed?
    , lifeCount : Int -- 0 means game over, the player loses.

    -- example: ['_', 'E', '_', 'H', '_', 'R']
    , puzzle : List Char -- Partially completed puzzle.

    -- example: ['Z', 'E', 'P', 'H', 'Y', 'R']
    , solution : List Char -- The correct answer the player is trying to find.
    }


type Model
    = Loading
    | LoadError Http.Error
    | Playing (List String) GameState


initialModel =
    Loading


playerWon : GameState -> Bool
playerWon gameState =
    not (List.member '_' gameState.puzzle)


playerLost : GameState -> Bool
playerLost gameState =
    gameState.lifeCount < 1


gameIsOver : GameState -> Bool
gameIsOver gameState =
    playerLost gameState || playerWon gameState


initialGameState : GameState
initialGameState =
    { lifeCount = 8
    , badGuesses = []
    , solution = String.toList "ZEPHYR"
    , puzzle = String.toList "______"
    }


initialCmd =
    Http.get
        { url = "./words.txt"
        , expect = Http.expectString FetchedWords
        }


type GameMsg
    = KeyPressed Key
    | ClickedPlayAgain
    | NewWord String


type Msg
    = GameMsg GameMsg
    | FetchedWords (Result Http.Error String)


updateWithGuess : Char -> GameState -> ( GameState, Cmd Msg )
updateWithGuess upperChar gameState =
    if List.member upperChar gameState.solution then
        -- It's a good guess.  Replace _s with characters from the solution.
        let
            zipped =
                List.Extra.zip gameState.puzzle gameState.solution

            puzzle =
                List.map
                    (\( pchar, schar ) ->
                        if pchar == '_' && schar == upperChar then
                            schar

                        else
                            pchar
                    )
                    zipped
        in
        ( { gameState | puzzle = puzzle }, Cmd.none )

    else if Char.isAlpha upperChar && not (List.member upperChar gameState.badGuesses) then
        -- It's a bad guess.  Take away one lifeCount.
        ( { gameState
            | lifeCount = gameState.lifeCount - 1
            , badGuesses = upperChar :: gameState.badGuesses
          }
        , Cmd.none
        )

    else
        -- Repeated guess.  Do nothing.
        ( gameState, Cmd.none )


updatePlayAgain wordList =
    ( initialGameState, chooseNewWord wordList )


updateGameState : GameMsg -> List String -> GameState -> ( GameState, Cmd Msg )
updateGameState msg wordList gameState =
    case ( msg, gameIsOver gameState ) of
        -- Game is over; play again if user presses space bar, Enter, or clicks the
        -- button.
        ( KeyPressed (Character ' '), True ) ->
            updatePlayAgain wordList

        ( KeyPressed (Control "Enter"), True ) ->
            updatePlayAgain wordList

        ( ClickedPlayAgain, _ ) ->
            updatePlayAgain wordList

        ( NewWord word, _ ) ->
            ( { initialGameState
                | solution = String.toList (String.toUpper word)
                , puzzle = List.repeat (String.length word) '_'
              }
            , Cmd.none
            )

        -- Game is live.
        ( KeyPressed (Character keyChar), False ) ->
            updateWithGuess (Char.toUpper keyChar) gameState

        ( KeyPressed _, _ ) ->
            ( gameState, Cmd.none )


chooseNewWord : List String -> Cmd Msg
chooseNewWord wordList =
    case wordList of
        [] ->
            Cmd.none

        firstWord :: rest ->
            Random.generate (\word -> GameMsg (NewWord word)) (Random.uniform firstWord rest)


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case ( msg, model ) of
        ( FetchedWords (Err err), Loading ) ->
            ( LoadError err, Cmd.none )

        ( FetchedWords (Ok wordText), Loading ) ->
            let
                wordList =
                    String.lines wordText
            in
            ( Playing wordList initialGameState, chooseNewWord wordList )

        ( GameMsg gameMsg, Playing words gameState ) ->
            let
                ( newGameState, cmd ) =
                    updateGameState gameMsg words gameState
            in
            ( Playing words newGameState, cmd )

        _ ->
            let
                _ =
                    Debug.log "Unexpected msg." ( msg, model )
            in
            ( model, Cmd.none )


main : Program () Model Msg
main =
    Browser.element
        { init = \() -> ( initialModel, initialCmd )
        , view = view
        , update = update
        , subscriptions = \model -> onKeyPress keyDecoder
        }


width =
    300


height =
    300


maybeViewGameOver : GameState -> List (Html Msg)
maybeViewGameOver gameState =
    (if playerWon gameState then
        [ Html.h1 [] [ Html.text "Congratulations!  You won!" ] ]

     else if playerLost gameState then
        [ Html.h1 [] [ Html.text "You lost." ]
        , Html.p [] [ Html.text ("The correct answer was " ++ String.fromList gameState.solution) ]
        ]

     else
        []
    )
        ++ maybeViewPlayAgainButton (gameIsOver gameState)


maybeViewPlayAgainButton : Bool -> List (Html Msg)
maybeViewPlayAgainButton showButton =
    if showButton then
        [ Html.br [] []
        , Html.button
            [ class "btn btn-primary"
            , onClick (GameMsg ClickedPlayAgain)
            ]
            [ Html.text "Play Again" ]
        ]

    else
        []


view : Model -> Html Msg
view model =
    case model of
        Loading ->
            div [ class "row" ]
                [ div [ class "col-12" ] [ h1 [] [ text "Loading..." ] ] ]

        LoadError err ->
            div [ class "row" ]
                [ div [ class "col-12" ] [ h1 [] [ text "Failed to load word list" ] ]
                , p [] [ text (Debug.toString err) ]
                ]

        Playing wordList gameState ->
            viewGame gameState


viewGame : GameState -> Html Msg
viewGame gameState =
    let
        badStrings =
            List.map String.fromChar gameState.badGuesses

        badGuesses =
            List.reverse badStrings

        badText =
            case gameState.badGuesses of
                [] ->
                    "Press keys on your keyboard to guess letters."

                _ ->
                    "Bad guesses: " ++ String.join " " badGuesses

        puzzle =
            List.map String.fromChar gameState.puzzle

        puzzleText =
            String.join " " puzzle
    in
    div [ class "row" ]
        [ div [ class "col-sm-5", class "col-xs-12" ]
            [ Canvas.toHtml
                ( width, height )
                [ style "border" "10px solid rgba(0,0,0,0.1)" ]
                [ clearScreen
                , render gameState.lifeCount
                ]
            ]
        , div [ class "col-sm-7", class "col-xs-12" ]
            ([ Html.h2 [ class "text-monospace" ] [ Html.text puzzleText ]
             , Html.br [] []
             , Html.p [] [ Html.text badText ]
             ]
                ++ maybeViewGameOver gameState
            )
        ]


clearScreen =
    shapes [ fill Color.white ] [ rect ( 0, 0 ) width height ]


render : Int -> Canvas.Renderable
render count =
    let
        shapesTopToBottom =
            -- Draw the stand.
            [ path ( 2, 297 )
                [ lineTo ( 297, 297 )
                , moveTo ( 13, 297 )
                , lineTo ( 13, 3 )
                , lineTo ( 150, 3 )
                , lineTo ( 150, 25 )
                ]

            -- Draw the head
            , circle ( 150, 50 ) 25

            -- Draw the body
            , path ( 150, 75 )
                [ lineTo ( 150, 180 ) ]

            -- Draw left arm
            , path ( 150, 90 )
                [ lineTo ( 90, 150 ) ]

            -- Draw right arm
            , path ( 150, 90 )
                [ lineTo ( 210, 150 ) ]

            -- Draw left leg.
            , path ( 150, 180 )
                [ lineTo ( 90, 270 ) ]

            -- Draw right leg.
            , path ( 150, 180 )
                [ lineTo ( 210, 270 ) ]

            -- Draw left foot.
            , path ( 90, 270 )
                [ lineTo ( 70, 260 ) ]

            -- Draw right foot.
            , path ( 210, 270 )
                [ lineTo ( 230, 260 ) ]
            ]

        shapes =
            List.reverse shapesTopToBottom
    in
    Canvas.shapes
        [ -- Settings
          Canvas.Settings.Line.lineWidth 5
        , Canvas.Settings.Line.lineCap Canvas.Settings.Line.RoundCap
        , Canvas.Settings.stroke Color.black
        ]
        (List.drop count shapes)
