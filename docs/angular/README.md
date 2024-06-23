# Uputstva vezana za Angular

## Instalacija

- Instalacija Node.js i npm-a:
  - Prvo morate instalirati Node.js i npm (Node Package Manager) ako već nisu instalirani na vašem računaru.
  - Možete ih preuzeti sa zvaničnog sajta Node.js-a (https://nodejs.org).
  - Pratite uputstva za instalaciju koja odgovaraju vašem operativnom sistemu.
- Instalacija Angular CLI (Command Line Interface):
  - Nakon što imate Node.js i npm instalirane, možete instalirati Angular CLI globalno putem npm komande u terminalu ili komandnom prozoru: 
    ```sh
    npm install -g @angular/cli
    ```
    Ovo će instalirati Angular CLI na vaš sistem, što vam omogućava da kreirate i upravljate Angular projektima putem komandne linije.

- Provera Instalacije za Angular CLI:
  - Nakon instalacije, možete proveriti da li je Angular CLI uspešno instaliran tako što ćete u terminalu ili komandnom prozoru ukucati:
    ```sh
    ng version 
    ```
    Ova komanda će prikazati instaliranu verziju Angular CLI-ja.

## Kreiranje novog Angular projekta

  - Koristite Angular CLI da biste kreirali novi projekat. Ovo se radi komandom ng new:
    ```sh
    ng new ime-aplikacije 
    ```
    `ime-aplikacije` predstavlja ime vaše nove aplikacije.


## Build aplikacije

- Navigacija do projektnog direktorijuma:
  - Koristite terminal ili komandni prozor da biste se navigirali do direktorijuma vaše Angular aplikacije.
     ```sh
    cd putanja/do/direktorijuma/vashe-aplikacije
    ```
- Izvršavanje Build-a:
  - Koristite Angular CLI da biste izgradili vašu aplikaciju. Ovo se radi komandom ng build:
    ```sh
    ng build 
    ```
    Ova komanda će kompilirati vaš TypeScript kod, optimizovati ga i pakovati u datoteke spremne za distribuciju.

- Opcioni parametri za Build:
  - Možete koristiti razne opcije prilikom izgradnje, na primer, --prod za proizvodni build:
    ```sh
    ng build --prod
    ```
Nakon završetka procesa izgradnje, Angular CLI će generisati direktorijum dist/ u vašem projektu koji sadrži sve potrebne datoteke za izvršavanje vaše aplikacije.

## RUN - Pokretanje Angular Aplikacije:

- Pokretanje razvojnog servera: `ng serve` pokreće lokalni razvojni server koji hostuje vašu Angular aplikaciju. Ovaj server prati izmene u vašem kodu i osvežava aplikaciju u web pregledaču automatski kada primeti promene.

- Otvaranje aplikaciju u pregledaču: `--open` je dodatak komandi koji će automatski otvoriti vašu aplikaciju u web pregledaču nakon što se razvojni server uspešno pokrene.

Izvršavanje `ng serve --open` u terminalu u direktorijumu vaše Angular aplikacije će pokrenuti razvojni server i otvoriti vašu aplikaciju u podrazumevanom web pregledaču. 

```sh
ng serve --open
```

Nakon izvršenja ovih koraka, vaša Angular aplikacija će biti izgrađena i pokrenuta lokalno, spremna za testiranje i dalji razvoj.



## Veza između Angular-a i .NET Core-a

1.	Prvo je potrebno kreirati API u .NET Core aplikaciji. Možete koristiti ASP.NET Core Web API ili neki drugi API, ukoliko je potrebno. API će implementirati logiku za obradu HTTP zahteva koji se šalju iz Angular aplikacije.

2.	Importujte “HttpClient” modul iz “@angular/common/http” u Vašu Angular aplikaciju. Nakon toga možete koristiti “HttpClient” modul kako bi slali HTTP zahteve ka Vašem API-ju koji ste implementirali u .NET Core-u.

3.	Definišite kontrolere kako bi omogućili .NET Core API-ju da vrati neke podatke nazad do Angular aplikacije kada se pogodi određenja ruta.

4.	Treba kreirati modele podataka koji se koriste i na frontend(Angular) i na backend(.NET Core) delu.

5.	Ukoliko želite, možete da koristite sigurnosne mehanizme na obe strane Vaše aplikacije kako bi obezbedili da podaci ostanu sigurni. Možete da koristite JWT, Oauth ili neki drugi vid autentikacije.




