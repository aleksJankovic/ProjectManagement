http://softeng.pmf.kg.ac.rs:10141

# O nama

LogicTenacity je grupa programera sa različitim veštinama, koja zajednički radimo kako bismo prevazišli izazove koje projektni menadžeri susreću u efikasnom vođenju projekata i zadataka. Naša aplikacija je prvenstveno namenjena projektnim menadžerima, ali i svim ostalim učesnicima na timovima. Stoga, projektni menadžeri su naša glavna ciljna grupa korisnika.

Cilj projektnih menadžera je uspešno odrađivanje projekata koje su započeli. Samim tim, naša aplikacija ima za cilj da centralizuje informacije o projektima, olakša dodelu zadataka i pruži realno vremensko praćenje napretka. Osim toga, omogućava kreiranje, pretragu i manipulaciju projektima kako bismo olakšali upravljanje.

Učesnici na projektima, tj. osobe koje su dodate od strane projektnog menadžera, mogu pregledati i manipulisati svojim zadacima. Ukratko, naša aplikacija omogućava projektnim menadžerima i učesnicima na projektima da efikasnije obavljaju svoje svakodnevne zadatke.

# Potrebni programi za buildovanje

Da bi se aplikacija uspešno izbildovala, potrebno je imati sledeće:

- Angular, verzija: 17.x.x
- .NET, verzija: 8.x.x

# Pokretanje aplikacije na serveru

Ovo je automatizavno putem skripte `build-and-deploy.sh` i systemd user servisa.'
Šifra je `tenacity_logic`.
Server se deplojuje putem `build-and-deploy.sh`, gde na kraju systemd preuzima menedzovanje celog procesa.

## build-and-deploy.sh

Ova skripta updejtuje angular frontend na lokalnom računaru, builda, a potom ga ubacuje u dotnet server.
Nakon toga se updejtuje dotnet, builda u produkcionu verziju, i uploaduje na server, systemd potom pokrece servis.


# Nalozi

- `admin@logictenacity.com` `admin`
- `pera@gmail.com` `pera`
- `toma@gmail.com` `toma`

# Lokalno pokretanje aplikacije

## FrontEnd

Pre svega, potrebno je otvoriti cmd na putanji LogicTenacity\logic-tenacity\app\Client. Nakon otvaranja cmd-a, neophodno je instalirati potrebne biblioteke komandom: npm install --force

Kada se uspešno završi instaliranje potrebnih biblioteka, neophodno je pokrenuti Angular server komandom: ng serve


## BackEnd

Pre pokretanja aplikacije treba da se kreira lokalna instanca baze, koja se kreira na sledeći način:

1. Otvorite Package Manager Console
2. Pokrenete komandu: add-migration init
3. Pokrenete komandu: update-database


Sada, kada imate instancu baze, da bi se aplikacija pokrenula, potrebno je pokrenuti solution: LogicTenacity\logic-tenacity\app\Server\Server.sln
Ukoliko želite aplikaciju da pokrenete putem cli-a, to se može postići na sledeći način:

1. Otvorite potrebni direktorijum (LogicTenacity\logic-tenacity\app\Server) u cmd-u
2. Pokrenite komandu: dotnet restore
3. Pokrenite komandu: dotnet build
4. Pokrenite komandu: dotnet run


# Autori

- Aleksa Božinović
- Aleksandra Janković
- Anđela Kidišević
- Dušan Ilić
- Veljko Đurović
- Lazar Joksimović
