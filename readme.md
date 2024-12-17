Bussklubben Spel Devkit
=========
Här finns det du behöver för att bygga ett spel till Bussklubben!

## Bakgrund
Bussklubben är en app från Värmlandstrafik för barn som åker skolsjuts. I appen kan användarna komma åt spel på lite olika sätt. Spelen är byggda med webbteknik och körs i en webbläsare inuti appen.

## Vad finns i devkitet?
Här hittar du en mall för att bygga ett spel med Javascript (eller Typescript). Det finns även ett demo på ett färdigt spel där du kan se hur allt fungerar.

## Bussklubbens API
Genom att länka in bussklubbens Javascript-API får man tillgång till några funktioner som integrerar spelen med själva Bussklubben-appen. Bussklubbens api finns på urlen\
https://klubbhuset-clubhouse.azurewebsites.net/js/ClubHouseGame.js\
Om du använder mallen under `/template` i det här repot så är det redan länkat.

Ett globalt objekt `ClubHouseGame` finns tillgängligt i spelet och har följande funktioner:

`ClubHouseGame.registerRestart(funktion)`\
Används för att registrera en funktion som körs när spelet startas eller startas om.

`ClubHouseGame.gameLoaded(options)`\
Används för att meddela att spelet är laddat och klart att startas. Options är ett objekt som för närvarande bara innehåller en parameter `hideInGame` som man kan sätta till **true** om man vill sköta visningen av poäng i spelet själv.

`ClubHouseGame.setScore(score)`\
Används för att skicka in poäng till Bussklubben. Poängen visas av Bussklubben-apiet.

`ClubHouseGame.gameDone()`\
Används när en spelsession är slut (dvs när man får Game Over). Observera att man själv får se till att inte spelet fortsätter i bakgrunden när Bussklubbens meny dyker upp.

När du kör spelet lokalt kommer inte allt i menyerna att fungera, sen när man kör spelet inuti själva appen kopplas andra funktioner i appen ihop med spelet.

## Template
[Här finns ett template-projekt för att börja utveckla ditt eget spel](template/readme.md)

## Demospel

[Här finns källkoden till spelet Skolbuss Simulator](demospel/readme.md)

## Speldesign
Du får naturligtvis bygga spelet hur du vill! Dock kan man tänka på att snabba korta arkadliknande spel lämpar sig bättre än långa äventyrsspel. 

## Hur testar jag spelet?
Om du använder dig av mallen `/template` i det här repot kan du utveckla och testa direkt i webläsaren. Se till att du har mobilvy påkopplat i din browsers devtools! Kolla också så att spelet fungerar bra på en mobil.

## Vad ska jag köra för spelmotor?
Det är fritt för dig att använda vilken spelmotor / vilka libraries du vill bara de stödjer javascript och canvas! Vi rekommenderar **Pixi.js** https://pixijs.com/ för 2d-grafik och **Three.js** https://threejs.org/ för 3d-grafik. **Howler.js** https://howlerjs.com/ för ljud. Vill man en mer komplett spelmotor för Javascript så rekommenderar vi **Phaser** https://phaser.io/ 

## Kan jag använda en RIKTIG spelmotor som Untiy eller Unreal?
I teorin går det att använda alla spelmotorer som har html/canvas och javascript/wasm som target. Vi rekommenderar spelmotorn **Godot** https://godotengine.org/ och vi har tagit fram en **addon** som man kan använda för att bygga spel till Bussklubben i Godot. Den finns här: https://github.com/StickyBeat/BussklubbenAPI_Godot. Det finns också ett demospel för Bussklubben byggt i Godot här: https://github.com/StickyBeat/BussklubbenDemoGodot. Det går även att använda Unity och Unreal om man anpassar exportformatet en aning.

## Jag har gjort ett spel, hur får jag med det i Bussklubben?
När du känner dig klar med ditt spel eller om du bara vill dela med dig av nåt du gjort kan du skicka in det bussklubben@stickybeat.se så kollar vi på det och hör av oss hur vi kan ta det vidare!