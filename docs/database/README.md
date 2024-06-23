# Upustvo vezano za SQLite

## Instaliranje:
1. Preuzmite paket za instalaciju: Sa zvanične web stranice SQLite preuzmite odgovarajući paket za instalaciju za Vaš operativni sistem.
2. Instalirajte SQLite: Nakon što preuzmete paket, pratite upustva unutar prozora za instalaciju kako biste instalirali SQLite.

## Kreiranje SQLite baze podataka:
1. Pokrenite SQLite CLI: Nakon što uspešno instalirate SQLite, otvorite terminal (na Windowsu CommandPrompt) i pokrenite SQLite CLI naredbom 'sqlite3'.
2. Kreirajte novu bazu podataka: U okviru SQLite CLI, možete kreirati novu bazu podataka komandom 'CREATE DATABASE ime_baze', gde je 'ime_baze' željeni naziv vaše baze podataka.
3. Kreiranje tabela: U okviru baze moguće je kreirati tabele, naredbom 'CREATE TABLE ime_tabele (kolona1 TIP, kolona2 TIP, ...);', gde je 'ime_tabele' željeni naziv date tabele, i okviru koje definišete odgovarajuće kolone i njihove tipove.

## Korišćenje SQLite baze u .NET CORE:
1. Dodavanje potrebnih paketa: U vaš .NET CORE projekat dodajte paket 'Microsoft.EntityFrameworkCore.Sqlite', preko NuGet Package Manager-a.
2. Definisanje modela: Kreirajte klase koje će predstavljati tabele u vašoj bazi podataka. Ove klase će biti modeli koje Entity Framework Core koristi za mapiranje podataka u bazi.
3. Konfiguracija DbContext-a: Kreirajte klasu koja nasleđuje 'DbContext' i definišite svoje DbSet-ove (tabele) i povezivanja sa modelima.
4. Konfiguracija konekcije sa bazom: U 'appsettings.json' fajlu definišite konekcioni string sa vašom SQLite bazom podataka. Primer:
   "ConnectionStrings": { "DefaultConnection": "Data Source=nazivBaze.db"}.
5. Konfiguracija servisa u ConfigureServices metodi: U 'Startup.cs' fajlu konfigurišite DbContext kao servis u metodi 'ConfigureServices'.

## Migracije i kreiranje tabela:
1. Kreiranje migracija: Migracije se koriste za mapiranje promena u modelima na promene u strukturi baze podataka. Da bi kreirali migraciju, potrebno je da iskoristite odgovarajuću komandu, na primer, "dotnet ef migrations add InitialCreate".
2. Primena migracija: Nakon kreiranja migracija, koristi se komanda "dotnet ef database update" kako bi se primenile sve migracije koje još nisu primenjene na bazu podataka.
3. Definisanje odnosa među tabelama: Odnosi između tabela definišu se u modelima. Na primer, možete imati jedan-na-mnogo odnos gde jedan red u jednoj tabeli odgovara više redova u drugoj tabeli.
4. Inicijalni podaci: Ako želite da unapred popunite tabelu sa početnim podacima, to možete uraditi ili direktno kroz kod ili kroz migracije, gde ćete uneti odgovarajuće podatke koje želite da se nađu u tabeli prilikom kreiranja baze podataka.

## Izvršavanje upita na SQLite bazi podataka:
1. Upiti kroz DbContext: DbContext se koristi kako bi se izvršavali upiti na bazi podataka. Metode koje se mogu koristiti su ToList(), Where(), Add(), Remove(), i SaveChanges() za dobavljanje, filtriranje, dodavanje, brisanje i ažuriranje podataka u bazi.
2. Korišćenje LINQ upita: EF Core podržava LINQ (Language Integrated Query) za pisanje upita na bazi podataka. Mogu se koristiti LINQ izraze za pristupanje podacima u bazi.
3. Korišćenje SQL upita: U nekim slučajevima možda želite direktno izvršiti SQL upit. EF Core omogućava izvršavanje SQL upita putem metode FromSqlRaw() ili FromSqlInterpolated().
4. Transakcije: EF Core podržava transakcije za grupisanje više upita u jednu logičku jedinicu rada. Možet se koristiti TransactionScope za definisanje transakcija.
5. Ovi koncepti omogućavaju izvršavanje upita na SQLite bazi podataka u .NET Core korišćenjem Entity Framework Core-a. Dalje možete prilagoditi i proširiti ove principe prema potrebama projekta.