const en = {
  // App.tsx
  connecting: "Connecting to server...",
  connectingInfo:
    "The server may have gone to sleep, so it might take a bit longer to connect. Please be patient!",
  enterName: "Please enter a name!",
  codeLength: "The code must be 4 characters long!",

  // NameStep.tsx
  tagline:
    "Think your music knowledge is top-notch? Can you guess the year just by listening?",
  namePlaceholder: "Enter your name",
  next: "Next",
  noRegNeeded:
    "No registration required – your name is only used for identification.",
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
  modeSoloDesc:
    "Challenge yourself alone against the clock. Place the cards in the right order!",
  modeMultiTitle: "Multiplayer",
  modeMultiDesc:
    "Challenge your friends online and find out who the music genius is!",
  modeWeeklyTitle: "Weekly Challenge",
  modeWeeklyDesc:
    "20 new songs every week. Be as accurate and as fast as possible to climb the weekly leaderboard!",
  modeMultiAlt: "Multiplayer mode cover image",
  modeSoloAlt: "Single player mode cover image",
  modeWeeklyAlt: "Weekly challenge mode cover image",

  // SoloConfigStep.tsx
  soloCustomize: "Customize",
  soloCustomizeDesc:
    "Set how many rounds the challenge should have. Each round you'll try to place a new card on the timeline.",
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
  lobbySyncMusicDesc:
    "When enabled, the current player controls everyone's music player.",
  lobbyStartGame: "Start Game",
  lobbyOnlyHostStart: "Only the host can make changes and start the game.",
  lobbyLeave: "Leave Room",
  lobbyLeaveTitle: "Leave Room?",
  lobbyLeaveWarning: "Are you sure you want to leave the room?",

  // GameResult.tsx
  resultWeeklyDone: "Challenge Complete!",
  resultLost: "Defeat!",
  resultWon: "Victory!",
  resultWeeklySuccess:
    "You completed the weekly challenge! Your result has been automatically saved to the leaderboard.",
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
  weeklySubtitle:
    "Every week a random list of 20 songs is generated. Sort them in chronological order with as few mistakes as possible, as fast as you can!",
  weeklySameList: "Every player gets the same list!",
  weeklyRulesTitle: "Rules and Info",
  weeklyRule1:
    "No mistake limit: The game only ends once you've played all 20 rounds.",
  weeklyRule2Start: "The leaderboard ranking is determined by the",
  weeklyRule2Title: "score achieved,",
  weeklyRule2Mid: " in case of a tie, the",
  weeklyRule2Time: "shorter time",
  weeklyRule2End: "wins.",
  weeklyRule2:
    "The ranking is determined by the score achieved, in case of a tie the less time wins.",
  weeklyRule3:
    "To maintain fair competition, each player may only participate in the weekly challenge once per week.",
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
  leaveTitle: "Leaving the game?",
  leaveWarning: "Your current game progress will be lost!",
  leaveConfirm: "Yes, leave",
  leaveCancel: "Cancel",
  weeklyLeaveTitle: "Leave Weekly Challenge",
  weeklyLeaveWarning:
    "If you leave now, your current game progress will be saved, so you can continue from here next time.",
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

  // Tutorials / Info Modals
  tutorialDontShowAgain: "Don't show this again",
  tutorialGotIt: "Got it",
  tutorialInfoTooltip: "Tutorial",

  // NameStep Tutorial
  tutorialNameTitle: "Welcome to ChronoTune!",
  tutorialNameSubtitle: "Brief overview.",
  tutorialNameItem1Title: "What is this game?",
  tutorialNameItem1Desc:
    "ChronoTune is a timeline-building game where you place songs on the timeline according to their release year. You can listen to a 30-second snippet of each song to help you decide.",
  tutorialNameItem2Title: "How to play?",
  tutorialNameItem2Desc:
    "Listen to the music, draw a card, and place it in the correct spot on your timeline! If your guess is correct, the card stays on your timeline.",
  tutorialNameItem3Title: "Diverse Game Modes",
  tutorialNameItem3Desc:
    "Play solo at your own pace, test your skills against friends in multiplayer mode, or compete on the global weekly leaderboard!",

  // Solo Tutorial
  tutorialSoloTitle: "Single Player Mode",
  tutorialSoloSubtitle: "Try to beat your own record!",
  tutorialSoloItem1Title: "Game Length",
  tutorialSoloItem1Desc:
    "Choose how many rounds you want to play (5–20). In each round, you receive a new song that you must place on the timeline. Correct answers earn points and add the song to the timeline. Incorrect answers deduct points and discard the song.",
  tutorialSoloItem2Title: "Scoring & Streak",
  tutorialSoloItem2Desc:
    "Each correct placement is worth +100 points. If you correctly place at least 3 songs in a row, streak mode activates: you earn +50 bonus points for the 3rd correct answer, and +20 additional bonus points for each subsequent correct placement. Beware, a wrong guess costs -15 points and resets your streak! If you make zero mistakes, you receive a +500 bonus at the end of the game.",
  tutorialSoloItem3Title: "Mistake Tolerance",
  tutorialSoloItem3Desc:
    "Set your preferred difficulty. In 'Hardcore' mode, a single mistake results in an immediate defeat, while in 'Relaxed' mode, there is no mistake limit.",
  tutorialSoloItem4Title: "Song Library",
  tutorialSoloItem4Desc:
    "Choose between Hungarian and International songs. Hungarian mode features only Hungarian-language tracks, while International mode includes songs from all around the world.",

  // Multiplayer Tutorial
  tutorialMultiTitle: "Multiplayer Mode",
  tutorialMultiSubtitle: "Compete with your friends in real-time!",
  tutorialMultiItem1Title: "Create & Join Room",
  tutorialMultiItem1Desc:
    "Create a room and share the 4-digit room code with your friends, or join an existing room with a code.",
  tutorialMultiItem2Title: "Turn-based Gameplay",
  tutorialMultiItem2Desc:
    "Players take turns drawing cards and placing them on their timeline. The player with the highest score at the end of the game wins!",
  tutorialMultiItem3Title: "Scoring & Streak",
  tutorialMultiItem3Desc:
    "Each correct placement is worth +100 points. If you correctly place at least 3 songs in a row, streak mode activates: you earn +50 bonus points for the 3rd correct answer, and +20 additional bonus points for each subsequent correct placement. Beware, a wrong guess costs -15 points and resets your streak! If you make zero mistakes, you receive a +500 bonus at the end of the game.",
  tutorialMultiItem4Title: "Leaving the Game",
  tutorialMultiItem4Desc:
    "If a player leaves the game, the remaining players can continue without interruption. The player who left will be treated as if they had never joined.",

  // Weekly Tutorial
  tutorialWeeklyTitle: "Weekly Challenge",
  tutorialWeeklySubtitle:
    "Equal conditions, 20 weekly songs, global leaderboard!",
  tutorialWeeklyItem1Title: "Same List for Everyone",
  tutorialWeeklyItem1Desc:
    "Every Monday at 12:00, a new 20-song list launches. Throughout the week, all players play with the exact same songs in the exact same order. When a new list appears, all data from the previous week is reset!",
  tutorialWeeklyItem2Title: "Saving Game Progress",
  tutorialWeeklyItem2Desc:
    "Your game progress is saved automatically, so if interrupted, you can resume right where you left off.",
  tutorialWeeklyItem3Title: "1 Attempt Per Week",
  tutorialWeeklyItem3Desc:
    "To ensure fair competition, each player can participate in the challenge only once per week. Give it your absolute best!",

  // Leaderboard
  leaderboardNow: "Now",
  leaderboardNext: "Next",
  leaderboardMe: "(YOU)",

  // Privacy & Storage
  privacyAndStorage: "Privacy & Storage",
  privacyTitle: "Privacy & Storage",
  privacySubtitle: "How does ChronoTune handle your data?",
  privacyClose: "Got it",
  privacyNoCookiesTitle: "0% Tracking & No Marketing Cookies",
  privacyNoCookiesDesc:
    "ChronoTune does not use advertising or behavioral tracking cookies. There is no Google Analytics, Meta Pixel, or any third-party tracking code on this site.",
  privacyStorageTitle: "Strictly Functional Local Storage (localStorage)",
  privacyStorageDesc:
    "We only store essential gameplay settings in your browser: selected language, sound volume, tutorial seen states, and resuming the active weekly challenge run.",
  privacyDataTitle: "Personal Data Protection",
  privacyDataDesc:
    "No account registration is required to play. We do not collect or store personal data, profiles, passwords, or payment information.",
};

export default en;
