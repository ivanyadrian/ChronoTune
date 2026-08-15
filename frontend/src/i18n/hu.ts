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
  lobbyLeaveTitle: "Szoba elhagyása",
  lobbyLeaveWarning: "Biztosan ki szeretnél lépni a szobából?",

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
  leaveConfirm: "Igen, kilépek",
  leaveCancel: "Mégsem",
  weeklyLeaveTitle: "Kilépés a Heti Kihívásból",
  weeklyLeaveWarning: "Ha most kilépsz, az aktuális játékállás elmentésre kerül, így legközelebb ugyaninnen tudod folytatni.",
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

  // Tutorials / Info Modals
  tutorialDontShowAgain: "Többet ne jelenjen meg",
  tutorialGotIt: "Megértettem",
  tutorialInfoTooltip: "Ismertető",

  // NameStep Tutorial
  tutorialNameTitle: "Üdvözöl a ChronoTune!",
  tutorialNameSubtitle: "Rövid ismertető.",
  tutorialNameItem1Title: "Mi ez a játék?",
  tutorialNameItem1Desc: "A ChronoTune egy idővonal-építő játék, ahol a dalokat a megjelenési évük szerint kell elhelyezned az idővonalon. Ehhez mindössze egy 30 másodperces részletet hallgathatsz meg az adott dalból.",
  tutorialNameItem2Title: "Hogyan kell játszani?",
  tutorialNameItem2Desc: "Hallgasd meg a zenét, húzz egy kártyát és illeszd a már meglévő idővonalra a megfelelő helyre! Ha eltalálod a sorrendet, a kártya az idővonal része marad.",
  tutorialNameItem3Title: "Változatos játékmódok",
  tutorialNameItem3Desc: "Játssz egyedül a saját tempódban, teszteld tudásodat a barátaiddal többjátékos módban, vagy versenyezz a heti ranglistán!",

  // Solo Tutorial
  tutorialSoloTitle: "Egyjátékos Mód",
  tutorialSoloSubtitle: "Próbáld megdönteni a saját rekordodat!",
  tutorialSoloItem1Title: "Játékhossz",
  tutorialSoloItem1Desc: "Válaszd ki, hány kört szeretnél játszani (5–20). Minden körben egy új dalt kapsz, amelyet el kell helyezned az idővonalon. Helyes válasz esetén pontot kapsz, és a dal az idővonalra kerül. Hibás válasz esetén pontot veszítesz, a dal pedig eldobásra kerül",
  tutorialSoloItem2Title: "Pontrendszer & Streak",
  tutorialSoloItem2Desc: "Minden helyes lerakás +100 pontot ér. Ha egymás után legalább 3 dalt helyesen helyezel el, aktiválódik a streak: a 3. sikeres válaszért +50, majd minden további helyes lerakásért +20 bónuszpont jár. Vigyázz, mert egy hibás tipp -15 ponttal jár, és lenullázza a streakedet! Ha egyetlen hibát sem vétesz, a játék végén +500 bónuszt kapsz.",
  tutorialSoloItem3Title: "Hibatűrés",
  tutorialSoloItem3Desc: "Állítsd be a kívánt nehézséget. A 'Hardcore' módban egyetlen hiba azonnali vereséget jelent, míg a 'Relaxed' módban nincs hibahatár.",
  tutorialSoloItem4Title: "Dalforrás",
  tutorialSoloItem4Desc: "Válassz magyar vagy nemzetközi dalok közül. Magyar módban csak magyar nyelvű számokat, nemzetközi módban pedig a világ minden tájáról származó dalokat kaphatsz.",

  // Multiplayer Tutorial
  tutorialMultiTitle: "Többjátékos Mód",
  tutorialMultiSubtitle: "Mérd össze zenei tudásod a barátaiddal valós időben!",
  tutorialMultiItem1Title: "Szoba létrehozása & Csatlakozás",
  tutorialMultiItem1Desc: "Hozz létre egy szobát és oszd meg a 4 jegyű szobakódot a barátaiddal, vagy csatlakozz egy meglévő szobához.",
  tutorialMultiItem2Title: "Körökre osztott játék",
  tutorialMultiItem2Desc: "A játékosok felváltva húznak kártyát és próbálják lerakni a saját idővonalukra. Aki a legtöbb pontot szerzi a játék során, az nyer!",
  tutorialMultiItem3Title: "Pontrendszer & Streak",
  tutorialMultiItem3Desc: "Minden helyes lerakás +100 pontot ér. Ha egymás után legalább 3 dalt helyesen helyezel el, aktiválódik a streak: a 3. sikeres válaszért +50, majd minden további helyes lerakásért +20 bónuszpont jár. Vigyázz, mert egy hibás tipp -15 ponttal jár, és lenullázza a streakedet! Ha egyetlen hibát sem vétesz, a játék végén +500 bónuszt kapsz.",
  tutorialMultiItem4Title: "Játék elhagyása",
  tutorialMultiItem4Desc: "Ha egy játékos elhagyja a játékot, a többiek zavartalanul folytathatják azt. A kilépett játékos olyan, mintha sosem csatlakozott volna.",

  // Weekly Tutorial
  tutorialWeeklyTitle: "Heti Kihívás",
  tutorialWeeklySubtitle: "Egyenlő feltételek, heti 20 dal, globális dicsőségtábla!",
  tutorialWeeklyItem1Title: "Azonos lista mindenkinek",
  tutorialWeeklyItem1Desc: "Minden hétfőn 12:00-kor új, 20 dalból álló lista indul. A hét során minden játékos ugyanazokkal a dalokkal, ugyanabban a sorrendben játszik. Az új lista megjelenésekor az előző hét összes adata törlésre kerül!",
  tutorialWeeklyItem2Title: "Játékállás mentése",
  tutorialWeeklyItem2Desc: "A játékállásod automatikusan mentésre kerül, így megszakítás esetén ott folytathatod, ahol abbahagytad.",
  tutorialWeeklyItem3Title: "Heti 1 próbálkozási lehetőség",
  tutorialWeeklyItem3Desc: "A tisztességes verseny érdekében hetente csak egyszer vehetsz részt a kihívásban. Hozd ki magadból a maximumot!",
};


export default hu;
