// ---- Edit these details ----
const CONFIG = {
  site: [45.3040, 2.0197], // [longitude, latitude] of the car park
};

const TILES = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const ATTRIBUTION = 'Imagery &copy; Esri, Maxar, Earthstar Geographics';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const easeSine = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);
// Gentle start and stop with a constant speed between, so no stretch of the flight outruns the imagery.
const cruise = (p, a = 0.18) => {
  const v = 1 / (1 - a);
  if (p < a) return (v * p * p) / (2 * a);
  if (p > 1 - a) return 1 - (v * (1 - p) ** 2) / (2 * a);
  return v * (p - a / 2);
};
const lerp = (a, b, p) => a + (b - a) * p;

// ---- Language ----
const I18N = {
  en: {
    introSomalia: 'Somalia', introMogadishu: 'Mogadishu', introAirport: 'Aden Adde International Airport', pin: 'Darmad Business Park',
    capPoster: 'Airport parking offer: $1 for 24 hours, $30 a month', capCctv: 'Wall of live CCTV screens in the control room',
    capEntryDispenser: 'A car stopping at the entry dispenser, below the Entry Only sign', capEntryBarrier: 'Closed entry barrier with a stop sign, the Beydan building behind',
    capPark: 'Rows of parked cars in the car park', capExitDispenser: 'A driver inserting a card at the exit dispenser', capExitBarrier: 'The exit barrier raised as a car drives out',
    capLanesAerial: 'The entry and exit lanes seen from above', capCustomersRow: 'The Beydan building and the row of banks and shops',
    capShuttleWide: 'Electric shuttle parked beside the business units', capShuttleClose: 'Electric shuttles lined up beside the Beydan building',
    capEntryAerial: 'The entrance plaza and barrier lanes from above', capEntryLane: 'Entry lane with speed limit and Entry Only signs',
    capOffice: 'The Darmad management office', capOfficeRow: 'The Darmad office, shuttles and shopfronts',
    capBeydanRow: 'Beydan and the row of banks', capHormuud: 'The Hormuud Telecom building next to the Darmad office',
    capAmal: 'Amal Bank and Amana Bank branches', capParkRows: 'The car park and the business units',
    capParkAerial: 'The car park from above', capParkHedges: 'Landscaped hedges between the parking rows', capTeam: 'Team Darmad standing in front of the business park',
    capGa1: 'The entrance plaza: two lanes in, two lanes out', capGa2: 'Entry lane with the green Entry Only sign',
    capGa3: 'Automated barrier at the entrance', capGa4: 'Exit lane with the orange Exit Only sign',
    capGo1: 'The Darmad management office', capGo2: 'The Darmad office, the shuttles and the shop row',
    capGo3: 'Shops beside the management office', capGo4: 'Shop units facing the car park',
    capGb1: 'Beydan and the row of banks', capGb2: 'Hormuud Telecom, next to the Darmad office',
    capGb3: 'Amal Bank and Amana Bank', capGb4: 'Somnet Telecom and Agro Bank',
    capGp1: 'The car park from above', capGp2: 'Parking rows in front of the shop units',
    capGp3: 'Wide lanes and landscaped edges', capGp4: 'Electric shuttles ready to go',
    soundOff: 'Turn sound off',
    chArrive: 'Arriving', chOffice: 'Around the Darmad office', chShops: 'Shops and banks', chPark: 'The car park',
    capShopRow: 'The long row of shop units beside the Darmad office, with cars parked in front',
    capPolice: 'A police vehicle parked at Darmad Business Park', capBanksAngle: 'The bank and office row with Somnet, Agro Bank, BB Bank, Premier Bank and Amal Bank',
    capShuttleFleet: 'Electric shuttles and luggage trolleys lined up outside the Darmad management office',
    capTrolleys: 'A row of new luggage trolleys in front of the shops',
    capPanoOffice: 'The full Darmad office row: shops below, offices above, facing the car park',
    capPanoBanks: 'The banking row beside the Beydan building',
  },
  so: {
    skipLink: 'U gudub qiimaha', navTour: 'Booqasho', navHow: 'Sida ay u shaqeyso', navCustomers: 'Ganacsiyada',
    navContact: 'Xiriir', navPhotos: 'Sawirro', directions: 'Hel jihada', introTag: 'Baarkinka Garoonka · Muqdisho', skip: 'Ka bood',
    heroEyebrow: 'Garoonka Caalamiga ah ee Aadan Cadde, Muqdisho',
    chipDay: '24kii saacba', chipMonth: 'bishiiba', contactUs: 'Nala soo xiriir', replay: 'Dib u daawo duulimaadka',
    factSpaces: 'meelood oo baabuur', factCctv: 'kormeer CCTV ah', factLanesTitle: '2 gal · 2 bax', factLanes: "jidad gelitaan iyo bixitaan, saf la'aan",
    factShuttleTitle: 'Koronto', factShuttle: 'gaadiid wareejin oo goobta ku jira',
    pricesKicker: 'Dalab gaar ah', pricesTitle: 'Qiimo fudud. Ammaan buuxa.',
    singleTitle: 'Gelitaan hal mar ah', singleUnit: '24 saac',
    singleText: 'Kaarka ka qaado xayndaabka, dhig inta aad u baahan tahay, kuna bixi taleefankaaga ka hor intaadan bixin.',
    monthlyTag: 'Qiimo dhimis', monthlyTitle: 'Bille', monthlyUnit: 'bishiiba',
    monthlyText: 'Kuwa maalin walba yimaada, shaqaalaha iyo kuwa badanaa safra. Iska diiwaan geli xafiiskayaga aagga gelitaanka, ama nala soo xiriir.',
    perkGuardTitle: 'Ilaalo iyo booliis', perkGuardText: 'Ilaalo tababaran iyo saraakiil booliis ah ayaa goobta ka dhiga mid xasilloon oo ammaan ah.',
    perkCctvTitle: 'Kormeer CCTV ah 24 saac', perkCctvText: 'Kamaradaha ayaa daboola jidadka, safafka baarkinka iyo dhismayaasha, waxaana laga daawadaa qolkayaga kontoroolka.',
    perkEasyTitle: 'Fudud', perkEasyText: 'Garoonka agtiisa, xayndaabyo otomaatig ah, lacag bixin taleefan, iyo laba jid oo la galo iyo laba jid oo laga baxo.',
    perkCareTitle: 'Daryeelka macaamiisha', perkCareText: 'Hawlwadeennadayada baarkinka ayaa jooga jidadka iyo xafiiska mar kasta oo aad caawimaad u baahato.',
    cctvCaption: 'Shaashadaha kamaradaha tooska ah ee qolka kontoroolka Darmad.',
    howKicker: 'Sida ay u shaqeyso', howTitle: 'Kaar ku gal. Taleefankaaga ku bax.',
    howLead: 'Laba jid oo la galo iyo laba jid oo laga baxo ayaa gaadiidka socodsiiya. Waa kan sida booqashadu u dhacdo.',
    legIn: 'Soo gelitaanka', in1Title: 'Si tartiib ah ugu joogso mashiinka gelitaanka', in1Text: 'Raac calaamadda cagaaran ee Gelid Kaliya oo si tartiib ah ugu istaag mashiinka agtiisa.',
    in2Title: 'Riix badhanka oo qaado kaar', in2Text: 'Xayndaabka ayaa furmaya, waadna geli kartaa.',
    in3Title: 'Kaarka hayso oo meesha aad rabto dhig', in3Text: 'Dooro meel kasta oo ku soco 5 km/saacaddii. Kaarka ayaad u baahan doontaa markaad baxayso.',
    legPay: 'Ku bixi taleefankaaga', ussdCard: 'lambarka kaarka', ussdAmount: 'Lacagta: $1.00', ussdAccept: 'Aqbal', ussdCancel: 'Jooji', ussdPin: 'Geli PIN ••••',
    pay1: 'Ka hor intaadan u kaxayn dhanka bixitaanka, garaac *215*, lambarka kaarkaaga iyo #.',
    pay2: 'Waxaad arki doontaa lacagta waqtiga aad dhigtay. Aqbal si aad u bixiso.',
    pay3: 'Geli PIN-kaaga. Marka lacag bixintu guulaysato waad bixi kartaa.',
    legOut: 'Bixitaanka', out1Title: 'Si tartiib ah ugu joogso mashiinka bixitaanka', out1Text: 'Raac calaamadda oranjiga ah ee Bixid Kaliya oo geli kaarkaaga.',
    out2Title: 'Xayndaabka ayaa furmaya. Bax.', out2Text: 'Safar wanaagsan. Mar kale ayaan ku sugaynaa.',
    lanesCaption: 'Laba jid oo la galo iyo laba jid oo laga baxo, mid walbana xayndaab gaar ah ayuu leeyahay.',
    helpTitle: 'Dhibaato ma ku haysataa bixitaanka?', helpText: 'Ku joogso xayndaabka. Kooxdayada ayaa meesha kuugu xallin doonta, ama xafiiskayaga imow markaad baxayso.',
    vipTitle: 'Baarkinka bilaha ah iyo VIP', vipText: 'Nala soo xiriir ama booqo xafiiskayaga aagga gelitaanka si aad u furato akoon bille ah ama VIP ah.',
    callUs: 'Na soo wac', textUs: 'Fariin noogu soo dir WhatsApp', emailUs: 'Email noo soo dir', namesTitle: 'Hore ugu jira Darmad', atm247: 'ATM 24/7',
    shuttleKicker: 'Gaadiid koronto', shuttleTitle: 'Gaarigaaga ilaa terminalka, iyo dib.',
    shuttleLead: 'Gaadiidkayaga korontada ee aamusan ayaa baarkinka ku xira Tunnel-ka Terminalka: kaxeyn ilaa tunnel-ka markaad duulayso, iyo kaxeyn dib ugu celisa gaarigaaga markaad soo degto.',
    routePark: 'Gaarigaaga oo Darmad yaal', routeShuttle: 'Gaadiid koronto, labada dhinac', routeTunnel: 'Tunnel-ka Terminalka', soonSmall: 'dhawaan', routeTerminal: 'Terminalka garoonka',
    soon: 'Dhawaan Filo', tunnelTitle: 'Tunnel-ka Terminalka Darmad',
    tunnelLead: 'Isku xir dabooleysan oo Darmad si toos ah ugu xira terminalka garoonka, oo hadda dhaafay marxaladda qorsheynta.',
    tunnelCaption: 'Muuqaal naqshadeed. Naqshadda ugu dambeysa way kala duwanaan kartaa.',
    photosKicker: 'Sawirro', photosTitle: 'Arag ka hor intaadan iman.', photosLead: 'Laga bilaabo albaabka ilaa dukaamada. Taabo sawir kasta si aad u weyneyso.',
    chArrive: 'Imaatinka', chOffice: 'Agagaarka xafiiska Darmad', chShops: 'Dukaamada iyo bangiyada', chPark: 'Baarkinka',
    contactKicker: 'Nala soo xiriir', contactTitle: 'Waxaan halkan u joognaa inaan ku caawinno.',
    contactLead: "Su'aalo ku saabsan baarkinka, akoonnada bilaha ah ama VIP, ama meel ganacsigaaga ah? La xiriir Kooxda Darmad.",
    waText: 'Fariin noo soo dir', fbText: 'Raac Darmad Business Park', visitTitle: 'Na soo booqo',
    visitText: 'Xafiiska maamulka ee aagga gelitaanka Darmad Business Park, Garoonka Caalamiga ah ee Aadan Cadde, Muqdisho, Soomaaliya.',
    teamCaption: 'Hawlwadeennada baarkinka iyo kooxda daryeelka macaamiisha.', aerialCaption: 'Baarkinka Darmad maanta.',
    footer: 'Baarkin garoon oo ammaan ah iyo goob ganacsi oo dhammaystiran oo ku taal Garoonka Caalamiga ah ee Aadan Cadde, Muqdisho.',
    introSomalia: 'Soomaaliya', introMogadishu: 'Muqdisho', introAirport: 'Garoonka Caalamiga ah ee Aadan Cadde', pin: 'Darmad Business Park',
    capPoster: 'Dalabka baarkinka garoonka: $1 24kii saac, $30 bishii', capCctv: 'Shaashadaha CCTV ee tooska ah ee qolka kontoroolka',
    capEntryDispenser: 'Gaari ku istaagay mashiinka gelitaanka, calaamadda Gelid Kaliya hoosteeda', capEntryBarrier: 'Xayndaabka gelitaanka oo xiran, dhismaha Beydan gadaashiisa',
    capPark: 'Safaf baabuur ah oo baarkinka dhigan', capExitDispenser: 'Darawal kaar gelinaya mashiinka bixitaanka', capExitBarrier: 'Xayndaabka bixitaanka oo kor u kacay iyadoo gaari baxayo',
    capLanesAerial: 'Jidadka gelitaanka iyo bixitaanka oo sare laga eegayo', capCustomersRow: 'Dhismaha Beydan iyo safka bangiyada iyo dukaamada',
    capShuttleWide: 'Gaadi koronto oo dhinac yaal dukaamada', capShuttleClose: 'Gaadiid koronto oo safan dhismaha Beydan agtiisa',
    capEntryAerial: 'Barxadda albaabka iyo jidadka xayndaabka oo sare laga eegayo', capEntryLane: 'Jidka gelitaanka oo leh calaamadaha xawaaraha iyo Gelid Kaliya',
    capOffice: 'Xafiiska maamulka Darmad', capOfficeRow: 'Xafiiska Darmad, gaadiidka koronto iyo dukaamada',
    capBeydanRow: 'Beydan iyo safka bangiyada', capHormuud: 'Dhismaha Hormuud Telecom oo ku xiga xafiiska Darmad',
    capAmal: 'Laamaha Amal Bank iyo Amana Bank', capParkRows: 'Baarkinka iyo dukaamada ganacsiga',
    capParkAerial: 'Baarkinka oo sare laga eegayo', capParkHedges: 'Geedo la qurxiyay oo u dhexeeya safafka baarkinka', capTeam: 'Kooxda Darmad oo taagan hortiisa goobta ganacsiga',
    capGa1: 'Barxadda albaabka: laba jid oo la galo, laba jid oo laga baxo', capGa2: 'Jidka gelitaanka oo leh calaamadda cagaaran ee Gelid Kaliya',
    capGa3: 'Xayndaabka otomaatigga ah ee albaabka', capGa4: 'Jidka bixitaanka oo leh calaamadda oranjiga ah ee Bixid Kaliya',
    capGo1: 'Xafiiska maamulka Darmad', capGo2: 'Xafiiska Darmad, gaadiidka koronto iyo safka dukaamada',
    capGo3: 'Dukaamada ku xiga xafiiska maamulka', capGo4: 'Dukaamo u jeeda baarkinka',
    capGb1: 'Beydan iyo safka bangiyada', capGb2: 'Hormuud Telecom, oo ku xiga xafiiska Darmad',
    capGb3: 'Amal Bank iyo Amana Bank', capGb4: 'Somnet Telecom iyo Agro Bank',
    capGp1: 'Baarkinka oo sare laga eegayo', capGp2: 'Safafka baarkinka ee hortiisa dukaamada',
    capGp3: 'Jidad ballaaran iyo geedo la qurxiyay', capGp4: 'Gaadiid koronto oo diyaar ah',
    officeShops: 'Dukaamada ku xiga xafiiska Darmad', soundOn: 'Daar codka', soundOff: 'Dami codka',
    navSpaces: 'Goobo kiro ah', leaseCta: 'Kirayso goob', factLetTitle: 'Kiro', factLet: 'dukaamo, xafiisyo iyo bandhigyo',
    spacesKicker: 'Goobo kiro ah', spacesTitle: 'Cinwaankaaga xiga horey ayaa loo dhisay.',
    spacesLead: 'Kumanaan musaafiriin, shaqaale iyo darawallo ah ayaa maalin walba soo mara albaabka Darmad. Ka fur albaabkaaga meesha ay baabuurtooda dhigtaan: qaybo casri ah oo leh albaabbo bir ah, dabaqyo sare oo xafiisyo ah, ammaan 24 saac ah iyo 500 meelood oo baarkin ah oo agtaada ah.',
    panoOfficeTitle: 'Safka xafiisyada iyo baarkinka', panoOfficeText: 'Dukaamo hoose, xafiisyo sare, iyo 500+ meelood oo baarkin ah oo albaabka ah. Qaybo diyaar ah hadda.',
    panoBanksTitle: 'Safka bangiyada', panoBanksText: 'Dhinaca Beydan, oo ay ku yaalaan Amana, Amal, One Group iyo kuwo kale.',
    usesTitle: 'Loogu talagalay shaqadaada', useBank: 'Bangiyo iyo xawaalado', useGym: 'Jimicsi iyo isboorti', useHotel: 'Hoteello iyo hoyga martida',
    useCafe: 'Maqaayado iyo kafateeriyo', useOffice: 'Xafiisyo iyo xarumo', useRetail: 'Dukaamo iyo bandhigyo', useClinic: 'Rug caafimaad iyo farmashiyo', useTravel: 'Wakiillo safar iyo xamuul',
    why1: 'Tallaabooyin u jira Garoonka Caalamiga ah ee Aadan Cadde', why2: 'Ilaalo, booliis iyo CCTV 24 saac', why3: '500+ meelood oo baarkin ah oo macaamiishaada', why4: 'Deris la ah Hormuud, Amana, Amal iyo Premier',
    bookViewing: 'Ballan booqasho', custKicker: 'Saaxiibo wanaagsan', custTitle: 'Halka ay ganacsiyada ugu waaweyn Muqdisho horey uga shaqeeyaan.',
    custLead: 'Bangiyo, shirkado isgaarsiin, hoteello iyo ganacsato ayaa doortay Darmad. Ku biir.',
    capPanoOffice: 'Safka xafiiska Darmad oo dhan: dukaamo hoose, xafiisyo sare, una jeeda baarkinka', capPanoBanks: 'Safka bangiyada ee ku xiga dhismaha Beydan',
    tourCaption: 'Booqashada Darmad, oo laga sameeyay sawirro dhab ah oo goobta maanta.', heroTitle: 'Dhig, shaqee oo kori, albaabka hore ee garoonka.',
    heroLead: 'Baarkin ammaan ah oo 500+ baabuur ah, la ilaaliyo habeen iyo maalin. Dukaamo iyo xafiisyo diyaar u ah in la furo, oo ku yaal irridda ugu mashquulka badan Muqdisho.',
    navPrices: 'Baarkinka',
    openedSince: 'Furan tan iyo 10 Janaayo 2026',
    shopRowTitle: 'Safka dukaamada oo dhan', shopRowText: 'Daraasiin qaybood oo dabaqa hoose ah oo ku fidsan dhererka baarkinka, diyaar u ah in la qalabeeyo.',
    capShopRow: 'Safka dheer ee dukaamada ee ku xiga xafiiska Darmad, oo baabuur hortooda dhigan yihiin',
    capPolice: 'Gaari booliis oo yaal Darmad Business Park', policeCaption: 'Booliis ilaalinaya Darmad Business Park.',
    capBanksAngle: 'Safka bangiyada iyo xafiisyada oo ay ku jiraan Somnet, Agro Bank, BB Bank, Premier Bank iyo Amal Bank',
    waParking: 'WhatsApp baarkinka', callParking: 'Wac baarkinka: +252 61 775 7959',
    reelCaption: 'Daawo: sida loo isticmaalo nidaamka baarkinka.',
    vipText: 'Wac ama WhatsApp u dir khadka baarkinka, ama booqo xafiiskayaga aagga gelitaanka si aad u furato akoon bille ah ama VIP ah.',
    capShuttleFleet: 'Gaadiid koronto iyo gaariyo shandadaha oo safan xafiiska maamulka Darmad hortiisa',
    capShuttleFleetShort: 'Gaadiid koronto', capTrolleys: 'Saf gaariyo shandadaha cusub oo dukaamada hortooda ah',
    capTrolleysShort: 'Gaari-gacmeedyada Shandadaha', capShuttleReady: 'Marwaliba kuu diyaar ah',
    shuttleKicker: 'Gaadiid iyo gaariyo shandado', shuttleTitle: 'Gaarigaaga ilaa terminalka, shandadaha iyo dhammaan.',
    shuttleLead: 'Gaadiid koronto oo aamusan ayaa kugu qaada baarkinka iyo Tunnel-ka Terminalka, gaariyo shandadahana waxay diyaar u yihiin inay shandadahaaga ka soo qaadaan terminalka ilaa gaarigaaga. Wax walba waa diyaar ka hor intaadan soo degin.',
    lineParking: 'Darmad Park Hotline', lineParkingFor: 'Qiimaha, Qorshayaasha Lacag-bixinta Billaha ah iyo Wixii Kale ee la Xiriira Baarkinka.',
    lineSpaces: 'Darmad Business Hotline', lineSpacesFor: 'Kiraynta qayb iyo dhammaan adeegyada kale ee Darmad',
    callShort: 'Wac', footParking: 'Baarkin', footSpaces: 'Dukaamo iyo xafiisyo',
  },
};

// Wording approved by Darmad (November 2026). These replace any earlier Somali for the same keys.
Object.assign(I18N.so, {
  directions: 'Hel Jihooyinka',
  heroTitle: 'Dhigo gaarigaaga, ku shaqeyso, kuna kobci ganacsigaada albaabka hore ee Garoonka Diyaaradaha.',
  heroLead: 'Gaarigaaga dhig, shaqadaada qabso, wax soo iibso ama safar adigoo niyadda ku haya in gaarigaagu ammaan yahay. Darmad Business Park waxay kuu fududaynaysaa baarkin ammaan ah oo sahlan.',
  chipDay: '24kii saacba',
  chipMonth: 'bishiiba',
  bookParking: 'Hore u Qabso Baarkinka',
  learnMore: 'Wax Dheeraad ah Baro',
  factSpaces: 'Goobaha Baarkinka',
  factCctv: 'Kormeer Kaamiro 24/7 ah',
  factLanesTitle: '2 Galid iyo 2 Bixid',
  factLanes: 'Saf cariiri ah kama jiro',
  factLetTitle: 'Kiro',
  factLet: 'Goobo Ganacsi oo Kiro ah',
  spacesKicker: 'Goobaha ganacsiga',
  spacesTitle: 'Goobtaada Ganacsi ee Xigta Waa Diyaar.',
  spacesLead: 'Ma raadineysaa meel aad ganacsigaaga ku kobciso? Darmad Business Park waxay kuu haysaa goobo ganacsi oo casri ah, kuna yaalla garoonka diyaaradaha.',
  usesTitle: 'Noocyada Goobaha',
  useRetail: 'Dukaamo',
  useOffice: 'Xafiisyo',
  useCafe: 'Maqaayado',
  useMarket: 'Suuqyo waaweyn',
  useClinic: 'Rugaha Caafimaadka',
  useShowroom: 'Goobo Bandhig',
  useStore: 'Bakhaarro',
  useSpace: 'Goobo Ganacsi',
  bookViewing: 'Qabso Booqasho',
  callUs: 'Na Soo Wac',
  emailUs: 'Email Noo Soo Dir',
  pricesKicker: 'Qiimaha baarkinka',
  pricesTitle: 'Qiimo Fudud. Ammaan La Isku Halayn Karo.',
  pricesLead: 'Baarkin qiimo jaban leh iyo ammaan aad ku kalsoonaan karto.',
  singleTitle: 'Hal Mar oo Gelid ah',
  singleUnit: '24 saac',
  singleText: 'Gaarigaaga dhig muddo dhan ilaa 24 saacadood.',
  monthlyTitle: 'Baarkin Bille ah',
  monthlyText: 'Bil kasta hal mar bixi lacagta, kuna raaxayso baarkin kuu diyaar ah maalin kasta.',
  perkGuardTitle: 'Baarkin Ilaalo Leh',
  perkCctvTitle: 'Kaamirooyin Amni oo Shaqeeya 24/7',
  perkEasyTitle: 'Goob Si Fudud Loo Gaari Karo',
  howKicker: 'Sida baarkinku u shaqeeyo',
  howTitle: 'Kaarka Qaado. Taleefankaaga Ku Bixi. Kaarka Ku Bax.',
  howLead: 'Baarkinku waa sahlan yahay. Kaarkaaga ka qaado meesha laga soo galo, gaariga dhig muddada aad u baahato, kadibna lacagta kaga bixi taleefankaaga ka hor intaadan bixin.',
  legIn: 'Kaarka Qaado',
  legPay: 'Ku Bixi Taleefanka',
  legOut: 'Kaarka Ku Bax',
  helpTitle: 'Ma u baahan tahay caawimaad markaad baxayso?',
  helpText: 'Shaqaalaheennu waxay diyaar u yihiin inay ku caawiyaan.',
  vipTitle: 'Waxaa la heli karaa Baarkin Bille ah iyo Baarkin VIP ah.',
  custKicker: 'Deriskeenna',
  custTitle: 'Waxay Ku Dhowdahay Ganacsiyada Waaweyn ee Muqdisho.',
  custLead: 'Darmad Business Park waxay ku dhowdahay bangiyo, dukaamo, xafiisyo iyo ganacsiyo kale oo muhiim ah. Waxyaabaha aad u baahan tahay dhammaantood waa kuu dhow yihiin.',
  shuttleKicker: 'Basas iyo gaariyo alaab',
  shuttleTitle: 'Gaarigaaga Ilaa Terminalka, Alaabtaadana Wada Qaado.',
  shuttleLead: 'Alaab badan ma sidataa? Adeegga basaska Darmad wuxuu kuu fududaynayaa inaad baarkinka uga gudubto terminalka garoonka diyaaradaha.',
  shuttle1: 'Adeeg basas qaada rakaabka.',
  shuttle2: 'Caawimaad qaadista alaabtaada.',
  shuttle3: 'Si fudud ku gaar terminalka.',
  shuttle4: 'Ku habboon dadka safarka ah.',
  photosLead: 'Hore u eeg goobta baarkinka, meelaha laga soo galo iyo amniga ka hor intaadan na soo booqan. Taabo sawir kasta si aad u weyneyso.',
  photosTitle: 'Arag Ka Hor Intaadan Imaan.',
  tunnelLead: 'Waddo isku xiraysa goobta baarkinka iyo terminalka garoonka diyaaradaha, si safarkaagu kuugu fududaado markaad timaaddo.',
  contactTitle: 'Waan Ku Caawinaynaa.',
  contactLead: 'Ma qabtaa su\'aalo ku saabsan baarkinka, lacagaha bille ah ama goobaha ganacsiga? Nala soo xiriir. Shaqaalaheennu waxay diyaar u yihiin inay ku caawiyaan.',
  callShort: 'Wac',
  visitTitle: 'Na Soo Booqo',
  footer: 'Goobtaada lagu kalsoon yahay ee baarkinka iyo ganacsiga, kuna taalla agagaarka garoonka diyaaradaha.',
  capPoster: 'Dalabka baarkinka garoonka: $1 24kii saac, $30 bishii',
});
I18N.en.capPoster = 'Airport parking offer: $1 for 24 hours, $30 a month';

// English copy lives in the HTML; remember it so the toggle can switch back (captions filled from JS keep theirs).
$$('[data-i18n]').forEach((el) => { if (el.textContent.trim()) I18N.en[el.dataset.i18n] = el.textContent; });

// Somali is the default; a visitor who switches to English keeps it on their next visit.
let lang = 'so';
try { if (localStorage.getItem('darmad-lang') === 'en') lang = 'en'; } catch (e) { /* storage blocked */ }
// A link can choose the language: ?lang=en or ?lang=so
const langParam = new URLSearchParams(location.search).get('lang');
if (langParam === 'en' || langParam === 'so') lang = langParam;
const t = (key) => (I18N[lang] && I18N[lang][key]) || I18N.en[key] || '';

function applyLang() {
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$('[data-i18n-alt]').forEach((el) => { el.alt = t(el.dataset.i18nAlt); });
  $$('#gallery .g').forEach((b) => b.setAttribute('aria-label', $('img', b).alt));
  $('#lang').textContent = lang === 'en' ? 'SO' : 'EN';
  updateSoundLabel();
}

// ---- Tour video ----
const tour = $('#tourVideo');
// Laptops and desktops get the 60 fps tour (its slow photo zooms glide); phones keep the lighter 30 fps file.
if (matchMedia('(min-width: 1100px)').matches) tour.src = 'assets/video/tour60.mp4';
const sound = $('#sound');
function updateSoundLabel() {
  $('#soundLabel').textContent = t(tour.muted ? 'soundOn' : 'soundOff');
  sound.classList.toggle('on', !tour.muted);
}
sound.addEventListener('click', () => {
  tour.muted = !tour.muted;
  if (!tour.muted && tour.paused) tour.play().catch(() => {});
  updateSoundLabel();
});
tour.addEventListener('volumechange', updateSoundLabel);

const saveData = navigator.connection && navigator.connection.saveData;
function startTour() {
  if (saveData) return; // leave the poster up; the visitor presses play
  tour.preload = 'auto';
  tour.play().catch(() => {});
}
new IntersectionObserver(([entry]) => {
  if (document.documentElement.classList.contains('intro')) return;
  if (entry.isIntersecting) startTour(); else tour.pause();
}, { threshold: 0.25 }).observe(tour);

// Only one video plays with sound at a time: a video starting with sound pauses the others.
// (Silent previews, like the tour starting muted at the top, never interrupt anything.)
document.addEventListener('play', (e) => {
  if (e.target.muted) return;
  $$('video').forEach((v) => { if (v !== e.target && !v.paused) v.pause(); });
}, true);
document.addEventListener('volumechange', (e) => {
  if (e.target.muted || e.target.paused) return;
  $$('video').forEach((v) => { if (v !== e.target && !v.paused) v.pause(); });
}, true);
$('#lang').addEventListener('click', () => {
  lang = lang === 'en' ? 'so' : 'en';
  try { localStorage.setItem('darmad-lang', lang); } catch (e) { /* storage blocked */ }
  applyLang();
});

// ---- Intro: the globe turns once, then the camera dives to the Darmad flag ----
const SITE_ZOOM = 17;
const SITE_VIEW = { center: CONFIG.site, zoom: SITE_ZOOM, pitch: 50, bearing: 32 };
const SPIN = 4800;
const DIVE = 11000;
const HOLD = 2400;
const caption = $('#introCaption');
const bar = $('#introBar');
let map = null;
let flag = null;
let revealed = false;
let spinFrame = 0;
let failsafe = 0;
let introStart = 0;

function setCaption(text) {
  if (caption.dataset.text === text) return;
  caption.dataset.text = text;
  caption.classList.remove('on');
  setTimeout(() => { caption.textContent = text; caption.classList.toggle('on', !!text); }, text ? 180 : 0);
}

function progress() {
  if (introStart) bar.style.width = `${clamp01((performance.now() - introStart) / (SPIN + DIVE + HOLD)) * 100}%`;
}

function collapseAttribution(m) {
  // Keep the required credit, folded into the small (i) button.
  const el = $('.maplibregl-ctrl-attrib', m.getContainer());
  if (el) el.classList.remove('maplibregl-compact-show');
}

function reveal() {
  if (revealed) return;
  revealed = true;
  clearTimeout(failsafe);
  cancelAnimationFrame(spinFrame);
  if (flag) flag.getElement().classList.remove('landed');
  document.documentElement.classList.remove('intro');
  if (map) { map.resize(); collapseAttribution(map); }
  startTour();
  setTimeout(freezeMap, 1500);
}

// Once the flight is over the map never moves again, but a live 3D map still costs the browser work
// behind the playing tour (that is what made the tour stutter). Swap it for a still picture of itself.
function freezeMap() {
  const m = map;
  if (!m) return;
  const snap = () => {
    m.once('render', () => {
      let url = '';
      try { url = m.getCanvas().toDataURL('image/jpeg', 0.88); } catch (e) { return; } // keep the live map
      if (url.length < 20000) return; // nothing drawn yet: keep the live map
      const img = new Image();
      img.className = 'globe-still';
      img.alt = '';
      img.src = url;
      img.decode().then(() => {
        if (map !== m) return;
        const credit = document.createElement('div');
        credit.className = 'globe-credit';
        credit.innerHTML = ATTRIBUTION;
        $('#globe').after(img, credit);
        m.remove();
        map = null;
        flag = null;
      }).catch(() => {});
    });
    m.triggerRepaint();
  };
  if (m.loaded()) snap(); else m.once('idle', snap);
}

function skipIntro() {
  cancelAnimationFrame(spinFrame);
  const v = $('#introVideo');
  if (!v.hidden) v.pause();
  if (map) { map.stop(); map.jumpTo(SITE_VIEW); }
  reveal();
}

function canUseGlobe() {
  if (!window.maplibregl) return false;
  const c = document.createElement('canvas');
  return !!(c.getContext('webgl2') || c.getContext('webgl'));
}

function drawStars() {
  const c = $('#stars');
  const w = c.width = window.innerWidth;
  const h = c.height = window.innerHeight;
  const g = c.getContext('2d');
  for (let i = 0; i < 460; i++) {
    const warm = Math.random() < 0.18;
    const a = 0.15 + Math.random() * 0.7;
    g.fillStyle = warm ? `rgba(255,180,120,${a})` : `rgba(255,246,236,${a})`;
    const r = Math.random() < 0.07 ? 1.5 : 0.8;
    g.beginPath(); g.arc(Math.random() * w, Math.random() * h, r, 0, 7); g.fill();
  }
}

function satelliteStyle(globe) {
  return {
    version: 8,
    ...(globe ? {
      projection: { type: 'globe' },
      sky: { 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 8, 0] },
    } : {}),
    sources: { sat: { type: 'raster', tiles: [TILES], tileSize: 256, maxzoom: 18, attribution: ATTRIBUTION } },
    layers: [{ id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-fade-duration': 120 } }],
  };
}

// Warm the browser cache with the tiles the dive will need, so every zoom level is sharp when it arrives.
function preloadFlightTiles() {
  const [lon, lat] = CONFIG.site;
  const rad = (lat * Math.PI) / 180;
  const cols = Math.min(7, Math.ceil((innerWidth * 0.62) / 256) + 2);
  const rows = Math.min(5, Math.ceil((innerHeight * 0.62) / 256) + 1);
  const queue = [];
  // The whole Earth at the zooms the spinning globe uses, then a column of tiles down to the site.
  for (let z = 1; z <= 2; z++) {
    for (let y = 0; y < 2 ** z; y++) for (let x = 0; x < 2 ** z; x++) queue.push(TILES.replace('{z}', z).replace('{y}', y).replace('{x}', x));
  }
  for (let z = 3; z <= SITE_ZOOM; z++) {
    const n = 2 ** z;
    const cx = ((lon + 180) / 360) * n;
    const cy = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
    const x0 = Math.floor(cx - cols / 2);
    const y0 = Math.floor(cy - rows / 2);
    for (let y = y0; y < y0 + rows; y++) {
      for (let x = x0; x < x0 + cols; x++) {
        if (y >= 0 && y < n) queue.push(TILES.replace('{z}', z).replace('{y}', y).replace('{x}', ((x % n) + n) % n));
      }
    }
  }
  let active = 0;
  const next = () => {
    if (revealed) return;
    while (active < 6 && queue.length) {
      active++;
      fetch(queue.shift(), { mode: 'cors' }).catch(() => {}).finally(() => { active--; next(); });
    }
  };
  next();
}

function addFlag() {
  const el = document.createElement('div');
  el.className = 'flag';
  el.innerHTML = '<div class="flag-pole"></div><div class="flag-cloth"><img src="assets/brand/logo.png" alt="Darmad Business Park"></div><div class="flag-beacon"></div>';
  flag = new maplibregl.Marker({ element: el, anchor: 'center', opacityWhenCovered: '0' }).setLngLat(CONFIG.site).addTo(map);
}

function sizeHalo() {
  // Globe diameter is 512 * 2^zoom / pi pixels; the glow sits just behind its rim.
  const z = map.getZoom();
  const d = (512 * 2 ** z) / Math.PI;
  const halo = $('#halo');
  halo.style.setProperty('--d', `${Math.min(d, 6000)}px`);
  halo.style.opacity = String(clamp01((3.2 - z) / 1.6));
}

// The globe fills about 75% of the short screen edge. The map is created at exactly this view,
// so the tiles it waits for are the ones the first spin frame shows.
const spinStartZoom = () => Math.max(0.3, Math.log2(Math.min(innerWidth, innerHeight) * 0.0046));
const SPIN_START_LAT = 12;

function spin() {
  const startZoom = spinStartZoom();
  const endLon = CONFIG.site[0];
  const startLat = SPIN_START_LAT;
  const endLat = CONFIG.site[1] + 4;
  const started = performance.now();
  map.jumpTo({ center: [endLon, startLat], zoom: startZoom - 0.35, pitch: 0, bearing: 0 });

  const step = (now) => {
    if (revealed) return;
    const p = Math.min(1, (now - started) / SPIN);
    const e = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
    // The surface travels eastward, as the Earth really turns: exactly one full turn.
    const lon = endLon + 360 * (1 - e);
    map.jumpTo({ center: [((lon + 540) % 360) - 180, lerp(startLat, endLat, e)], zoom: startZoom - 0.35 + 0.35 * e });
    sizeHalo();
    progress();
    if (p < 1) spinFrame = requestAnimationFrame(step); else dive();
  };
  spinFrame = requestAnimationFrame(step);
}

function dive() {
  // Start buffering the tour now, so it plays smoothly the moment the page is revealed.
  if (!saveData && tour.preload !== 'auto') tour.preload = 'auto';
  // A steady, even zoom reads as smooth flight; the centre settles on the flag early so the last levels never drift.
  const from = map.getCenter();
  const z0 = map.getZoom();
  const [lon1, lat1] = CONFIG.site;
  const started = performance.now();
  const step = (now) => {
    if (revealed) return;
    const p = Math.min(1, (now - started) / DIVE);
    const zoom = lerp(z0, SITE_ZOOM, cruise(p));
    const c = easeSine(clamp01(p / 0.5));
    const tilt = easeSine(clamp01((p - 0.45) / 0.55));
    map.jumpTo({
      center: [lerp(from.lng, lon1, c), lerp(from.lat, lat1, c)],
      zoom,
      pitch: SITE_VIEW.pitch * tilt,
      bearing: SITE_VIEW.bearing * tilt,
    });
    sizeHalo();
    progress();
    if (zoom > 14) setCaption(t('introAirport'));
    else if (zoom > 8.5) setCaption(t('introMogadishu'));
    else if (zoom > 3.2) setCaption(t('introSomalia'));
    if (p < 1) { spinFrame = requestAnimationFrame(step); return; }
    land();
  };
  spinFrame = requestAnimationFrame(step);
}

function land() {
  setCaption('');
  flag.getElement().classList.add('landed');
  const started = performance.now();
  const step = (now) => {
    if (revealed) return;
    progress();
    if (now - started < HOLD) spinFrame = requestAnimationFrame(step); else reveal();
  };
  spinFrame = requestAnimationFrame(step);
}

function fallbackIntro() {
  // No WebGL or the map could not load: play the pre-rendered flight instead.
  if (map) { try { map.remove(); } catch (e) { /* already gone */ } map = null; }
  $('#halo').style.opacity = '0';
  const v = $('#introVideo');
  v.hidden = false;
  v.preload = 'auto';
  v.addEventListener('ended', reveal);
  v.addEventListener('error', reveal);
  v.play().catch(reveal);
  clearTimeout(failsafe);
  failsafe = setTimeout(reveal, 30000);
}

// A link opened in a background tab waits for the visitor before the show starts.
function whenVisible(fn) {
  if (!document.hidden) { fn(); return; }
  const onChange = () => {
    if (document.hidden) return;
    document.removeEventListener('visibilitychange', onChange);
    fn();
  };
  document.addEventListener('visibilitychange', onChange);
}

function startIntro() {
  drawStars();
  if (!canUseGlobe()) { whenVisible(fallbackIntro); return; }

  let started = false;
  let styleReady = false; // the map itself works; tiles may still be arriving
  let loadTimer = 0;
  let softTimer = 0;
  // Open on the exact first frame of the spin, so the tiles loaded now are the ones shown first.
  map = new maplibregl.Map({
    container: 'globe',
    style: satelliteStyle(true),
    center: [CONFIG.site[0], SPIN_START_LAT],
    zoom: spinStartZoom() - 0.35,
    interactive: false,
    fadeDuration: 0,
    attributionControl: { compact: true },
  });
  addFlag();
  sizeHalo();

  const begin = () => {
    if (started || revealed) return;
    started = true;
    clearTimeout(loadTimer);
    clearTimeout(softTimer);
    collapseAttribution(map);
    introStart = performance.now();    spin();
    // Only now fetch the tiles for the dive: the spin gives them ~5 s, and they no longer
    // compete with the globe's own first tiles (that competition caused the pause before spinning).
    preloadFlightTiles();
  };
  // A failed or slow tile is harmless. Only a map that never got going at all needs the backup video,
  // and once the globe is working it is never swapped for the video (that swap caused the black screen
  // and the flag-less old flight: isStyleLoaded() is also false while tiles are still downloading).
  map.once('style.load', () => { styleReady = true; });
  map.on('error', (e) => {
    if ((e && e.sourceId) || started || styleReady || revealed) return;
    clearTimeout(loadTimer); clearTimeout(softTimer); fallbackIntro();
  });
  whenVisible(() => {
    if (!document.documentElement.classList.contains('intro')) { skipIntro(); return; }
    loadTimer = setTimeout(() => {
      if (started || revealed) return;
      if (styleReady) begin(); else fallbackIntro();
    }, 8000);
    // Start as soon as every globe tile is in, or 2.5 s after the map is up, so a slow tile never holds it still.
    map.once('idle', begin);
    const soon = () => { softTimer = setTimeout(begin, 2500); };
    if (styleReady) soon(); else map.once('style.load', soon);
    failsafe = setTimeout(reveal, 34000);
  });
}

// ---- Lightbox for the gallery and the offer poster ----
const lightbox = $('#lightbox');
let items = [];
let current = 0;
function showPhoto(i) {
  current = (i + items.length) % items.length;
  const img = $('img', items[current]);
  $('#lbImg').src = items[current].dataset.full;
  $('#lbImg').alt = img.alt;
  $('#lbCaption').textContent = img.alt;
}
function open(list, i) { items = list; showPhoto(i); lightbox.showModal(); $('#marquee').classList.add('held'); }
const thumbs = $$('#gallery .g');
thumbs.forEach((b, i) => b.addEventListener('click', () => open(thumbs, i)));

// ---- Gallery: a strip of photos that slides on its own ----
// The strip is doubled so it can loop without a seam; hovering, focusing or opening a photo pauses it.
const track = $('#gallery');
thumbs.forEach((b, i) => {
  const copy = b.cloneNode(true);
  copy.tabIndex = -1;
  copy.setAttribute('aria-hidden', 'true');
  copy.addEventListener('click', () => open(thumbs, i));
  track.append(copy);
});
track.style.setProperty('--slide-time', `${thumbs.length * 4.5}s`);
const marquee = $('#marquee');
const holdMarquee = (on) => marquee.classList.toggle('held', on);
marquee.addEventListener('pointerenter', () => holdMarquee(true));
marquee.addEventListener('pointerleave', () => holdMarquee(lightbox.open));
marquee.addEventListener('focusin', () => holdMarquee(true));
marquee.addEventListener('focusout', () => holdMarquee(false));
lightbox.addEventListener('close', () => holdMarquee(marquee.matches(':hover')));
new IntersectionObserver(([e]) => marquee.classList.toggle('offscreen', !e.isIntersecting)).observe(marquee);

// Panoramas settle into place as they scroll into view.
const panoObserver = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add('in'); panoObserver.unobserve(e.target); }
}), { threshold: 0.25 });
$$('.pano').forEach((p) => panoObserver.observe(p));
$('#posterBtn').addEventListener('click', () => open([$('#posterBtn')], 0));
$('#lbClose').addEventListener('click', () => lightbox.close());
$('#lbPrev').addEventListener('click', () => showPhoto(current - 1));
$('#lbNext').addEventListener('click', () => showPhoto(current + 1));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showPhoto(current - 1);
  if (e.key === 'ArrowRight') showPhoto(current + 1);
});

// ---- How-to video: plays while on screen, pauses when scrolled away ----
// Browsers allow sound only after the visitor's first tap or click on the page; until then it plays muted,
// and that first tap turns the sound on. Once the visitor pauses or mutes it themselves, we leave it alone.
const howTo = $('#reelVideo');
let howToVisible = false;
let howToUserPaused = false;
let howToUserMuted = false;
let howToAuto = false;
function playHowTo() {
  if (howToUserPaused) return;
  howToAuto = true;
  if (!howToUserMuted) howToVideoSound();
  howTo.play().catch(() => { howTo.muted = true; howTo.play().catch(() => {}); });
}
function howToVideoSound() { howTo.muted = false; howTo.volume = 1; }
new IntersectionObserver(([e]) => {
  howToVisible = e.isIntersecting;
  if (howToVisible) { howTo.preload = 'auto'; playHowTo(); } else if (!howTo.paused) { howToAuto = true; howTo.pause(); }
}, { threshold: 0.5 }).observe(howTo);
// Only a tap on the video's own controls counts as the visitor pausing or muting it.
let howToTapped = 0;
howTo.addEventListener('pointerdown', () => { howToTapped = Date.now(); });
const byVisitor = () => Date.now() - howToTapped < 1500;
howTo.addEventListener('pause', () => { if (byVisitor()) howToUserPaused = true; });
howTo.addEventListener('play', () => { howToUserPaused = false; });
howTo.addEventListener('volumechange', () => { howToUserMuted = byVisitor() && howTo.muted; });
['pointerdown', 'keydown', 'touchend'].forEach((ev) => addEventListener(ev, (e) => {
  if (howToUserMuted || !howTo.muted) return;
  howToVideoSound();
  if (howToVisible && howTo.paused && !howToUserPaused) howTo.play().catch(() => {});
}, { passive: true }));
// ---- Tunnel: a short looping preview, only while on screen ----
const clip = $('#tunnelClip');
const CLIP = [124, 134];
clip.addEventListener('loadedmetadata', () => { clip.currentTime = CLIP[0]; });
clip.addEventListener('timeupdate', () => { if (clip.currentTime >= CLIP[1] || clip.currentTime < CLIP[0] - 1) clip.currentTime = CLIP[0]; });
new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (clip.preload !== 'auto') clip.preload = 'auto';
    clip.play().catch(() => {});
  } else clip.pause();
}, { threshold: 0.3 }).observe(clip);

// ---- Page details ----
const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${CONFIG.site[1]},${CONFIG.site[0]}`;
$$('.js-directions').forEach((a) => { a.href = directionsUrl; });
$('#year').textContent = new Date().getFullYear();

const nav = $('#nav');
const onScroll = () => nav.classList.toggle('solid', scrollY > 24);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

$('#introSkip').addEventListener('click', skipIntro);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !revealed) skipIntro(); });
$('#replay').addEventListener('click', () => {
  history.replaceState(null, '', location.pathname);
  scrollTo(0, 0);
  location.reload();
});

applyLang();

// A visitor with a deep link, or who prefers less motion, goes straight to the page.
if (location.hash || matchMedia('(prefers-reduced-motion: reduce)').matches) {
  drawStars();
  if (canUseGlobe()) {
    map = new maplibregl.Map({ container: 'globe', style: satelliteStyle(false), ...SITE_VIEW, interactive: false, attributionControl: { compact: true } });
    addFlag();
    map.once('idle', () => { collapseAttribution(map); freezeMap(); });
  }
  $('#halo').style.opacity = '0';
  revealed = true;
  startTour();
} else {
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  startIntro();
}
