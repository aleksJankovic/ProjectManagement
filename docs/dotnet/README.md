# Uputstva vezana za dotnet

## Instaliranje

1. U search baru potražite: Visual Studio Installer. Kada pronađete željenu verziju, kliknite na dugme "Modify".
2. Otvoriće se novi prozor u kojem treba da označite "ASP.NET and web development", zatim kliknite "Modify". Nakon nekoliko minuta, bićete preusmereni na početnu stranicu.
3. Konačno, kliknite "Launch" kako biste pokrenuli Visual Studio.

### Linux varijanta

1. Pogledajte kako da instalirate dotnet sdk za vašu distribuciju na internetu
2. Instalirajte paket preko vašeg paket menadžera.

## Kreiranje .NET CORE projekta

1. Nakon pokretanja Visual Studija, izaberite "Create a new Project".
2. U search baru, unesite: ASP.NET CORE Web API.
3. Unesite ime projekta i izaberite folder u kojem će biti smešten.
4. Izaberite verziju .NET framework-a.

### Linux varijanta

1. U terminalu unesite ``dotnet new webapi -n <naziv projekta>``

## Konekcija sa bazom, modeli i migracije

1. U NuGet Package Manager-u, instalirajte sledeće pakete: ``Microsoft.EntityFrameworkCore.Sqlite``, ``Microsoft.EntityFrameworkCore``, kao i ``Microsoft.EntityFrameworkCore.Tools``
ili preko terminala  ``dotnet add package Microsoft.EntityFrameworkCore.Sqlite``, ``dotnet add package Microsoft.EntityFrameworkCore``, ``dotnet add package Microsoft.EntityFrameworkCore.Tools ``.
2. U fajlu appsettings.json postavite konekcionu string: `"ConnectionStrings": { "DefaultConnection": "Data Source=nazivBaze.db"}`.
3. Napravite folder "models" u kojem ćete definisati entitete koji predstavljaju tabele u bazi podataka.

### Primer

```csharp
// models/User.cs
public class User
{
    public int Id { get; set; }
    public string Username { get; set; }
    public string Email { get; set; }
}
```

4. Takođe, napravite folder "data" u kojem će se nalaziti fajl koji nasleđuje klasu DbContext. Taj fajl će služiti za komunikaciju sa bazom.

### Primer

```csharp
// data/AppDbContext.cs
using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
}
```

5. Dodajte sledeće linije koda u program.cs:
   ```csharp
   builder.Services.AddDbContext<AppDbContext>(Options =>
   {
       Options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
   });
6. Na kraju jeste potrebno odaraditi migraciju odnosno postaviti početnu šemu baze podataka na osnvu entita koji smo definisali, sledeću liniju koda je potrebno napisati u Package Manager Console: `Add-Migration InitialCreate` ili u terminalu: ``dotnet ef migrations add InitialCreate``. 
7. Nakon što se izvršili migraciju, sledeći korak je primena migracija na bazu podataka. To se postiše sa komandom `Update-Database` ili 
u terminalu: ``dotnet ef database update``.
8. Sada kada je baza spremna, može se započeti sa radom sa podacima. Kreirajte metode u vašem DbContext fajlu kako biste omogućili pristup i manipulaciju podacima u bazi.

## Rad sa API rutama

1. Potrebno je da kreirate kontrolere u vašem projektu koji će obrađivati zahteve API-ja. Svaki kontroler bi trebao da ima odgovarajuću metodu za rukovanje različitim
HTTP zahtevima poput GET, POST, PUT, DELETE.
2. Sledeći korak jeste definisanje ruta u kontrolerima pomoću atributa rute kako biste odredili kako će se pristupiti određenim metodama.
3. Implementirajte logiku u vašim kontrolerima koristeći vaš DbContext za pristup podacima u bazi. Ovo može uključiti standardne CRUD operacije.
4. Testirajte vaše API rute sa alatima kao što su Postman ili Swagger.

### Primer jedne API rute

```csharp
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    // GET: api/user/5
    [HttpGet("{id}")]
    public IActionResult GetUser(int id)
    {
        // Uzmi korisnika iz baze
        var user = _dbContext.Users.FirstOrDefault(u => u.Id == id);

        if (user == null)
        {
            return NotFound(); // Vrati grešku 404 ako korisnik nije pronađen
        }

        return Ok(user); // Vrati OK sa korisnikom
    }
}
```

## Buildovanje projekta preko komandne linije

1. Proverite da li imate .NET SDK instaliran (ako ste pratili korake do sad, podrazumeva se da ga imate)
2. Otvorite terminal
3. Navigirajte do foldera vašeg projekta
4. Buildujte projekat sa komandom ``dotnet build``
5. Nakon toga, projekat se može pokrenuti sa komandom ``dotnet run``.
