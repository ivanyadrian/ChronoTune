const hu = {
  // App.tsx
  connecting: "Kapcsolódás a szerverhez...",
  connectingInfo: "A szerver lehet alvó módba került, emiatt kicsit tovább tarthat a csatlakozás. Kérlek, légy türelemmel!",
  enterName: "Adj meg egy nevet!",
  codeLength: "A kódnak 4 karakter hosszúnak kell lennie!",

  // NameStep.tsx
  tagline: "Úgy érzed, hogy a zenei ismereted magas? Képes vagy csupán hangból megállapítani az évet?",
  namePlaceholder: "Add meg a neved",
  next: "Következő",
  noRegNeeded: "Nincs regisztráció – a név csupán azonosításhoz szükséges.",
  statHeader: "A dalkönyvtárak tartalma",
  statItem_1: "3900+",
  statItem_1_desc: "magyar",
  statItem_2: "5800+",
  statItem_2_desc: "nemzetközi",
  statItem_3: "2300+",
  statItem_3_desc: "heti",

  // ModeChoiceStep.tsx
  modeTitle: "Játékmód kiválasztása",
  modeSubtitle: "Egyedül szeretnél játszani, vagy a barátaiddal mérnéd össze a zenei tudásod?",
  modeSoloTitle: "Egyjátékos",
  modeSoloDesc: "Tedd próbára magad egyedül az idővel szemben. Helyezd el a kártyákat sorrendben!",
  modeMultiTitle: "Többjátékos",
  modeMultiDesc: "Hívd ki a barátaidat online, és derítsétek ki, ki a zenei zseni a csapatban!",
  modeWeeklyTitle: "Heti Kihívás",
  modeWeeklyDesc: "Minden héten új 20 dal. Legyél minél pontosabb, minél gyorsabb és kerülj fel a heti ranglistára!",
  modeMultiAlt: "Többjátékos mód borítókép",
  modeSoloAlt: "Egyjátékos mód borítókép",
  modeWeeklyAlt: "Heti kihívás mód borítókép",

  // SoloConfigStep.tsx
  soloCustomize: "Testreszabás",
  soloCustomizeDesc: "Állítsd be, hány körből álljon a kihívás. Minden körben egy újabb kártyát próbálhatsz meg elhelyezni a timeline-on.",
  soloGameLength: "Játék hossza",
  soloHowToWin: "Hogyan nyerhetek?",
  soloCardsToPlace: "lehetőséged lesz kártyát elhelyezni",
  soloMistakeLimit: "Hibahatár beállítása",
  soloSelectMistake: "Válassz ki egy hibahatárt a folytatáshoz!",
  mistakeModeHardcoreDesc: "Egyetlen hiba, és a játék azonnal véget ér.",
  mistakeModeNormalDesc: "A 3. hiba után a játék véget ér!",
  mistakeModeEasyDesc: "Az 5. hiba után a játék véget ér!",
  mistakeModeRelaxedDesc: "Nincs hibakorlát!",
  soloCards: "kártya",
  startGame: "Játék Indítása",

  // MultiplayerConfigStep.tsx
  multiNewGame: "Új játék",
  multiNewGameDesc: "Készíts egy új szobát, ahová a barátaid csatlakozhatnak a kóddal.",
  multiCreate: "Létrehozás",
  multiJoin: "Csatlakozás",
  multiJoinDesc: "Írd be a 4 jegyű azonosítót a belépéshez.",
  multiRoomId: "Szoba azonosító",
  multiEnter: "Belépés",

  // Song library selector (SoloConfigStep, MultiplayerConfigStep, Lobby)
  songLibraryLabel: "Dalforrás",
  songLibraryHu: "Magyar",
  songLibraryHuDesc: "~876 magyar dal",
  songLibraryEn: "Nemzetközi",
  songLibraryEnDesc: "~9.254 nemzetközi dal",

  // Lobby.tsx
  lobbyInvite: "Meghívás",
  lobbyShareCode: "Oszd meg a kódot a barátaiddal",
  lobbyCopyCode: "Kód másolása",
  lobbyCopied: "Sikeresen másolva!",
  lobbyPlayers: "Játékosok",
  lobbyGameLength: "Játék hossza",
  lobbyTurnsDesc: "Minden játékos összesen",
  lobbyTurnsDesc2: "alkalommal kerül sorra a játék során.",
  lobbyHostCanEdit: "Hostként módosíthatod az értékeket.",
  lobbyOnlyHostEdit: "Csak a host végezhet módosításokat!",
  lobbySyncMusic: "Szinkronizált lejátszás",
  lobbySyncMusicDesc: "A szinkronizált lejátszás bekapcsolásakor a soron lévő játékos irányítja mindenki zenelejátszóját.",
  lobbyStartGame: "Játék Indítása",
  lobbyOnlyHostStart: "Csak a host végezhet módosítást és indíthatja el a játékot.",
  lobbyLeave: "Kilépés a szobából",

  // GameResult.tsx
  resultWeeklyDone: "Kihívás teljesítve!",
  resultLost: "Vereség!",
  resultWon: "Győzelem!",
  resultWeeklySuccess: "Sikeresen teljesítetted a heti kihívást! Az elért eredményedet automatikusan elmentettük a dicsőségtáblára.",
  resultSoloLost: "Elvesztetted az összes életed az utolsó forduló előtt.",
  resultSoloWon: "Sikeresen eljutottál az utolsó fordulóig.",
  resultSelectPlayer: "Játékos kiválasztása",
  resultYou: "(TE)",
  resultPlayTime: "Játékidő",
  resultScore: "Pontszám",
  resultCorrect: "Sikeres",
  resultTimelineLength: "Timeline hossza",
  resultMistakes: "Hibák",
  resultBackToLeaderboard: "Vissza a ranglistához",
  resultPlayAgain: "Újra játszom",
  resultLeave: "Kilépés",

  // GameMessage.tsx / GameBoard
  nextPlayer: "Soron következő:",
  points: "pont",

  // SoloGameStats.tsx
  round: "FORDULÓ",
  score: "Pontszám",

  // DiscardConfirmModal.tsx
  discardTitle: "Kártya eldobása?",
  discardDesc: "Biztosan el akarod dobni ezt a kártyát?",
  discardPenalty: "Ez 20 pont levonással jár!",
  discardCancel: "Mégse",
  discardConfirm: "Eldobom",

  // VerticalTimeline / GameResult timeline
  timelineBroken: "Timeline Megszakítva",
  timelineOf: "Timeline-ja",
  timelineReached: "A játék alatt elért timeline:",
  timelineOrder: "A létrehozott sorrend:",

  // WeeklyChallengeStats
  weeklyHits: "Találatok",

  // WeeklyChallengeView
  weeklyTitle: "Heti Kihívás",
  weeklySubtitle: "Minden héten egy 20 dalból álló véletlenszerű lista kerül generálásra. Rendezd őket időrendbe a lehető legkevesebb hibával, minél gyorsabban!",
  weeklySameList: "Minden játékos ugyanazt a listát kapja!",
  weeklyRulesTitle: "Szabályok és tudnivalók",
  weeklyRule1: "Nincs hibahatár: A játék csak akkor ér véget, ha mind a 20 kört végigjátszottad.",
  weeklyRule2Start: "A ranglista helyezést az",
  weeklyRule2Title: "elért eredmény",
  weeklyRule2Mid: "határozza meg, holtverseny esetén a",
  weeklyRule2Time: "kevesebb idő",
  weeklyRule2End: "dönt.",
  weeklyRule2: "A ranglista helyezést az elért eredmény határozza meg, holtverseny esetén a kevesebb idő dönt.",
  weeklyRule3: "A tisztességes verseny fenntartása érdekében minden játékos hetente csak egy alkalommal vegyen részt a heti kihívásban.",
  weeklyCountdownLabel: "Váltásig hátralévő idő",
  weeklyNameLabel: "Neved a ranglistán",
  weeklyNamePlaceholder: "Írd be a neved...",
  weeklyStart: "Indítás",
  weeklyAlreadyPlayed: "Te már játszottál ezen a héten!",
  weeklyNameTaken: "Ezzel a névvel már játszottak vagy épp játszanak!",
  weeklyLeaderboardTitle: "Heti Ranglista",
  weeklyLeaderboardTop: "TOP 10 JÁTÉKOS",
  weeklyLoading: "Ranglista betöltése...",
  weeklyNoEntries: "Még nincs bejegyzés",
  weeklyBeFirst: "Legyél te az első ezen a héten, aki felkerül a dicsőségtáblára!",
  weeklyMore: "további résztvevő",
  weeklyColName: "Név",
  weeklyColResult: "Eredmény",
  weeklyColTime: "Idő",
  weeklyActiveTitle: "Folyamatban lévő heti kihívás",
  weeklyActiveDesc: "Már van egy aktív, félbehagyott heti kihívásod",
  weeklyActiveUsing: "nevet használva.",
  weeklyContinue: "Folytatom",
  weeklyBackToMenu: "Vissza a menübe",
  weeklyResetTime: "Reset: Minden hétfőn 12:00-kor",

  // LeaveGameButton
  leaveTitle: "Elhagyod a játékot?",
  leaveWarning: "A jelenlegi játékállásod elveszíted!",
  leaveConfirm: "Elhagyom",
  leaveCancel: "Mégsem",
  leaveButtonLabel: "Kilépés",

  // BackButton
  back: "Vissza",

  // MusicPlayer
  placeCardInstruction: "Helyezd a kártyát a megfelelő helyre!",

  // DrawMusicButton
  drawWaiting: "Várakozás",
  drawNewSong: "Új dal",
  drawFrom: "Húzása a pakliból",
  drawTurn: "köre",

  // VerticalTimeline
  verticalTimelineDefault: "Időrendi sorrend:",
  verticalTimelineEmpty: "Üres timeline",

  // useRoomSocket – toast üzenetei
  playerJoined: (name: string) => `${name} csatlakozott!`,
  playerLeft: (name: string) => `${name} kilépett.`,

  // useGameplaySocket – toast üzenetei
  retryCardYou: "Ezt a kártyát eldobhatod.",
  retryCardOther: (name: string) => `${name} eldobhatja ezt a számot!`,
  cardDiscardedYou: "Kártya eldobva. Húzz egy újat!",
  cardDiscardedOther: (name: string) => `${name} eldobta a kártyát.`,
  needMorePlayers: "A többjatékos módhoz legalább 2 játékosra van szükség!",

  // useGameplaySocket – játéküzenetei (GameMessage overlay)
  correctGuess: "HELYES TIPP!",
  wrongGuess: "HELYTELEN TIPP!",
  multiCorrectGuess: (name: string) => `${name} JÓL TIPPELT!`,
  multiWrongGuess: (name: string) => `${name} ELRONTOTTA!`,
  gameOverSolo: "JÁTÉK VÉGE! Eredmény betöltése...",
  gameOverMulti: "JÁTÉK VÉGE! Eredmények betöltése...",
  lastRound: "UTOLSÓ FORDULÓ!",
};

export default hu;
