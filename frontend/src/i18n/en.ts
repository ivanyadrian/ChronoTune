const en = {
  // App.tsx
  connecting: "Connecting to server...",
  connectingInfo: "The server may have gone to sleep, so it might take a bit longer to connect. Please be patient!",
  enterName: "Please enter a name!",
  codeLength: "The code must be 4 characters long!",

  // NameStep.tsx
  tagline: "Think your music knowledge is top-notch? Can you guess the year just by listening?",
  namePlaceholder: "Enter your name",
  next: "Next",
  noRegNeeded: "No registration required – your name is only used for identification.",
  statHeader: "library track count",
  statItem_1: "3900+",
  statItem_1_desc: "hungarian",
  statItem_2: "5800+",
  statItem_2_desc: "international",
  statItem_3: "2300+",
  statItem_3_desc: "weekly",

  // ModeChoiceStep.tsx
  modeTitle: "Select Game Mode",
  modeSubtitle: "Do you want to play solo, or compete with your friends?",
  modeSoloTitle: "Single Player",
  modeSoloDesc: "Challenge yourself alone against the clock. Place the cards in the right order!",
  modeMultiTitle: "Multiplayer",
  modeMultiDesc: "Challenge your friends online and find out who the music genius is!",
  modeWeeklyTitle: "Weekly Challenge",
  modeWeeklyDesc: "20 new songs every week. Be as accurate and as fast as possible to climb the weekly leaderboard!",
  modeMultiAlt: "Multiplayer mode cover image",
  modeSoloAlt: "Single player mode cover image",
  modeWeeklyAlt: "Weekly challenge mode cover image",

  // SoloConfigStep.tsx
  soloCustomize: "Customize",
  soloCustomizeDesc: "Set how many rounds the challenge should have. Each round you'll try to place a new card on the timeline.",
  soloGameLength: "Game Length",
  soloHowToWin: "How do I win?",
  soloCardsToPlace: "chances to place a card",
  soloMistakeLimit: "Mistake Limit",
  soloSelectMistake: "Select a mistake limit to continue!",
  mistakeModeHardcoreDesc: "One mistake and the game is immediately over.",
  mistakeModeNormalDesc: "The game ends after the 3rd mistake!",
  mistakeModeEasyDesc: "The game ends after the 5th mistake!",
  mistakeModeRelaxedDesc: "No mistake limit!",
  soloCards: "cards",
  startGame: "Start Game",

  // MultiplayerConfigStep.tsx
  multiNewGame: "New Game",
  multiNewGameDesc: "Create a new room that your friends can join with a code.",
  multiCreate: "Create",
  multiJoin: "Join",
  multiJoinDesc: "Enter the 4-character room ID to join.",
  multiRoomId: "Room ID",
  multiEnter: "Enter",

  // Song library selector (SoloConfigStep, MultiplayerConfigStep, Lobby)
  songLibraryLabel: "Song Library",
  songLibraryHu: "Hungarian",
  songLibraryHuDesc: "~900 Hungarian songs",
  songLibraryEn: "International",
  songLibraryEnDesc: "~9000 international songs",

  // Lobby.tsx
  lobbyInvite: "Invite",
  lobbyShareCode: "Share the code with your friends",
  lobbyCopyCode: "Copy Code",
  lobbyCopied: "Copied successfully!",
  lobbyPlayers: "Players",
  lobbyGameLength: "Game Length",
  lobbyTurnsDesc: "Every player will take a total of",
  lobbyTurnsDesc2: "turns during the game.",
  lobbyHostCanEdit: "As host, you can modify the settings.",
  lobbyOnlyHostEdit: "Only the host can make changes!",
  lobbySyncMusic: "Synchronized Playback",
  lobbySyncMusicDesc: "When enabled, the current player controls everyone's music player.",
  lobbyStartGame: "Start Game",
  lobbyOnlyHostStart: "Only the host can make changes and start the game.",
  lobbyLeave: "Leave Room",

  // GameResult.tsx
  resultWeeklyDone: "Challenge Complete!",
  resultLost: "Defeat!",
  resultWon: "Victory!",
  resultWeeklySuccess: "You completed the weekly challenge! Your result has been automatically saved to the leaderboard.",
  resultSoloLost: "You lost all your lives before the last round.",
  resultSoloWon: "You made it to the last round.",
  resultSelectPlayer: "Select Player",
  resultYou: "(YOU)",
  resultPlayTime: "Play Time",
  resultScore: "Score",
  resultCorrect: "Correct",
  resultTimelineLength: "Timeline Length",
  resultMistakes: "Mistakes",
  resultBackToLeaderboard: "Back to Leaderboard",
  resultPlayAgain: "Play Again",
  resultLeave: "Leave",

  // GameMessage.tsx / GameBoard
  nextPlayer: "Next up:",
  points: "points",

  // SoloGameStats.tsx
  round: "ROUND",
  score: "Score",

  // DiscardConfirmModal.tsx
  discardTitle: "Discard Card?",
  discardDesc: "Are you sure you want to discard this card?",
  discardPenalty: "This will deduct 20 points!",
  discardCancel: "Cancel",
  discardConfirm: "Discard",

  // VerticalTimeline / GameResult timeline
  timelineBroken: "Timeline Interrupted",
  timelineOf: "'s Timeline",
  timelineReached: "Timeline reached during the game:",
  timelineOrder: "The created order:",

  // WeeklyChallengeStats
  weeklyHits: "Correct",

  // WeeklyChallengeView
  weeklyTitle: "Weekly Challenge",
  weeklySubtitle: "Every week a random list of 20 songs is generated. Sort them in chronological order with as few mistakes as possible, as fast as you can!",
  weeklySameList: "Every player gets the same list!",
  weeklyRulesTitle: "Rules and Info",
  weeklyRule1: "No mistake limit: The game only ends once you've played all 20 rounds.",
  weeklyRule2Start: "The leaderboard ranking is determined by the",
  weeklyRule2Title: "score achieved,",
  weeklyRule2Mid: " in case of a tie, the",
  weeklyRule2Time: "shorter time",
  weeklyRule2End: "wins.",
  weeklyRule2: "The ranking is determined by the score achieved, in case of a tie the less time wins.",
  weeklyRule3: "To maintain fair competition, each player may only participate in the weekly challenge once per week.",
  weeklyCountdownLabel: "Time until reset",
  weeklyNameLabel: "Your leaderboard name",
  weeklyNamePlaceholder: "Enter your name...",
  weeklyStart: "Start",
  weeklyAlreadyPlayed: "You have already played this week!",
  weeklyNameTaken: "This name has already been used this week!",
  weeklyLeaderboardTitle: "Weekly Leaderboard",
  weeklyLeaderboardTop: "TOP 10 PLAYERS",
  weeklyLoading: "Loading leaderboard...",
  weeklyNoEntries: "No entries yet",
  weeklyBeFirst: "Be the first this week to get on the leaderboard!",
  weeklyMore: "more participants",
  weeklyColName: "Name",
  weeklyColResult: "Result",
  weeklyColTime: "Time",
  weeklyActiveTitle: "Ongoing Weekly Challenge",
  weeklyActiveDesc: "You have an active, unfinished weekly challenge",
  weeklyActiveUsing: "using the name.",
  weeklyContinue: "Continue",
  weeklyBackToMenu: "Back to menu",
  weeklyResetTime: "Reset: Every Monday at 12:00",

  // LeaveGameButton
  leaveTitle: "Leave the game?",
  leaveWarning: "You will lose your current game progress!",
  leaveConfirm: "Leave",
  leaveCancel: "Cancel",
  leaveButtonLabel: "Leave",

  // BackButton
  back: "Back",

  // MusicPlayer
  placeCardInstruction: "Place the card in the correct position!",

  // DrawMusicButton
  drawWaiting: "Waiting",
  drawNewSong: "New Song",
  drawFrom: "Draw from deck",
  drawTurn: "'s turn",

  // VerticalTimeline
  verticalTimelineDefault: "Chronological order:",
  verticalTimelineEmpty: "Empty timeline",

  // useRoomSocket – toast messages
  playerJoined: (name: string) => `${name} joined!`,
  playerLeft: (name: string) => `${name} left.`,

  // useGameplaySocket – toast messages
  retryCardYou: "You can discard this card.",
  retryCardOther: (name: string) => `${name} can discard this song!`,
  cardDiscardedYou: "Card discarded. Draw a new one!",
  cardDiscardedOther: (name: string) => `${name} discarded the card.`,
  needMorePlayers: "Multiplayer mode requires at least 2 players!",

  // useGameplaySocket – game messages (GameMessage overlay)
  correctGuess: "CORRECT GUESS!",
  wrongGuess: "WRONG GUESS!",
  multiCorrectGuess: (name: string) => `${name} GUESSED RIGHT!`,
  multiWrongGuess: (name: string) => `${name} GOT IT WRONG!`,
  gameOverSolo: "GAME OVER! Loading result...",
  gameOverMulti: "GAME OVER! Loading results...",
  lastRound: "LAST ROUND!",
};

export default en;
