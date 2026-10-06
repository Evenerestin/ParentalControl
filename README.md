# ParentalControl – limit czasu komputera

Prosty program dla Windows 10/11, w którym rodzic – bez wpisywania żadnych poleceń – ustawia dla konta dziecka:

- w które dni tygodnia dziecko ma dostęp do komputera,
- w jakich godzinach może się zalogować,
- ile łącznie czasu dziennie może spędzić przy komputerze.

Panel pokazuje też, ile czasu dziecko wykorzystało dzisiaj i ile mu zostało.

## Jak to działa

Program korzysta z dwóch mechanizmów wbudowanych w Windows:

1. **Godziny logowania** konta dziecka – poza nimi Windows nie pozwoli się zalogować.
2. **Zaplanowane zadanie „LimitCzasu”**, które co minutę (jako konto SYSTEM) uruchamia skrypt
   `C:\ProgramData\LimitCzasu\limit.ps1`. Skrypt:
   - wylogowuje dziecko, jeśli jest zalogowane poza dozwolonymi godzinami (sam Windows tego nie robi),
   - dolicza minutę do dzisiejszego licznika,
   - 5 minut przed końcem limitu wyświetla ostrzeżenie (nie w Windows Home),
   - po wyczerpaniu limitu wylogowuje – także przy każdej kolejnej próbie tego dnia,
   - następnego dnia licznik startuje od zera.

### Co robi przycisk „Zapisz i zastosuj”

1. Sprawdza, czy program działa jako administrator, czy wybrane konto nie jest administratorem
   i czy ustawienia są poprawne. Jeśli coś się nie zgadza, niczego nie zmienia.
2. Tworzy folder `C:\ProgramData\LimitCzasu` i ustawia mu uprawnienia: administratorzy i SYSTEM mogą
   wszystko, zwykli użytkownicy (w tym dziecko) mogą tylko odczytywać.
3. Zapisuje ustawienia do `config.json` i aktualną wersję skryptu `limit.ps1`.
4. Ustawia godziny logowania konta dziecka.
5. Tworzy zaplanowane zadanie `LimitCzasu`, jeśli jeszcze go nie ma (istniejącego nie zmienia).
6. Jeśli wybrano inne konto dziecka niż poprzednio – przywraca poprzedniemu kontu pełny dostęp
   (panel pilnuje jednego konta naraz).

Nowe ustawienia działają od razu.

Dodatkowo przy każdym uruchomieniu (jako administrator) panel sam sprawdza i w razie potrzeby odtwarza
folder `C:\ProgramData\LimitCzasu` z uprawnieniami, skrypt `limit.ps1` i zaplanowane zadanie `LimitCzasu` –
np. gdy ktoś je usunął. Jeśli to się nie uda, panel pokazuje komunikat w żółtym banerze.

> Folder `C:\ProgramData` jest ukryty. Żeby go zobaczyć, wpisz `C:\ProgramData\LimitCzasu` w pasku
> adresu Eksploratora plików albo włącz „Widok → Pokaż → Ukryte elementy”.

## Ważne: konto dziecka nie może być administratorem

Panel sam wykrywa konta na komputerze, na którym działa. Administrator może jednak usunąć wszystkie
ograniczenia, dlatego na liście „Konto dziecka” panel pokazuje wyłącznie włączone konta bez uprawnień
administratora (zwykłych użytkowników). Jeśli konta dziecka nie ma na liście, zmień je na zwykłego użytkownika
(Ustawienia → Konta → Rodzina i inni użytkownicy → konto dziecka → „Zmień typ konta” → „Użytkownik standardowy”).

Windows wczytuje uprawnienia przy logowaniu – po odebraniu dziecku uprawnień administratora trzeba
**wylogować je lub uruchomić komputer ponownie**. Do tego czasu dziecko nadal ma stare uprawnienia.

## Instalacja na innym komputerze

1. Skopiuj plik `ParentalControl Setup <wersja>.exe` (np. na pendrive).
2. Na docelowym komputerze zaloguj się na konto **administratora** (rodzica) i uruchom instalator.
3. Windows może pokazać niebieskie okno **„System Windows ochronił ten komputer”** (SmartScreen) –
   instalator nie ma podpisu cyfrowego. Kliknij **„Więcej informacji”**, a potem **„Uruchom mimo to”**.
4. Wybierz folder instalacji (domyślnie `C:\Program Files\ParentalControl`) i dokończ instalację.
5. Uruchom **ParentalControl** ze skrótu na pulpicie lub z menu Start. Windows zawsze zapyta o zgodę
   lub hasło administratora – dzięki temu dziecko nie otworzy panelu.
6. Wybierz konto dziecka, ustaw dni, godziny i limity, kliknij **„Zapisz i zastosuj”**.

Node.js nie jest potrzebny na komputerze docelowym.

## Znane ograniczenia

- Godziny tylko pełne, najpóźniej do 23:00 (ograniczenie Windows).
- Ograniczenia dotyczą jednego konta dziecka naraz (zmiana konta zdejmuje ograniczenia z poprzedniego).
- Licznik ma dokładność około 1 minuty.
- Czas jest liczony także przy zablokowanym ekranie (inaczej limit dałoby się obejść, blokując ekran).
- Dziecko może odczytać pliki w `C:\ProgramData\LimitCzasu`, ale nie może ich zmienić ani usunąć.
- W Windows Home nie ma ostrzeżenia 5 minut przed końcem (brak programu `msg`); wylogowanie działa normalnie.
- Instalator nie ma podpisu cyfrowego – przy pierwszym uruchomieniu pojawia się ostrzeżenie SmartScreen.

## Jak całkowicie usunąć ograniczenia

Odinstalowanie programu **nie zdejmuje** ograniczeń (celowo – żeby nie dało się ich obejść
odinstalowaniem). Aby je usunąć, otwórz **PowerShell jako administrator** i wpisz
(zamiast `NazwaKonta` – nazwa konta dziecka, taka jak na liście w panelu):

```powershell
net user NazwaKonta "/times:all"
schtasks /delete /tn "LimitCzasu" /f
Remove-Item -Recurse -Force C:\ProgramData\LimitCzasu
```

Przy ręcznym wpisywaniu `net user ... /times:...` parametr zawsze ujmuj w cudzysłów (`"/times:..."`),
bo średnik `;` w PowerShellu kończy polecenie.

---

## Dla dewelopera

### Wymagania

- Windows 10/11 (instalator buduje się tylko na Windows),
- Node.js ≥ 20.

### Uruchomienie z kodu

```powershell
npm install
npm start
```

Terminal uruchom **jako administrator** – bez tego panel się otworzy, ale nie zapisze zmian (pokaże żółty baner).
Poza Windows (np. na macOS) panel działa w trybie podglądu: nic nie zmienia w systemie.

> Uwaga: jeśli `npm start` uruchamiasz z terminala VS Code, a okno się nie pojawia, sprawdź, czy nie jest
> ustawiona zmienna `ELECTRON_RUN_AS_NODE` (`Remove-Item Env:ELECTRON_RUN_AS_NODE`).

### Budowanie instalatora

```powershell
npm run dist          # Windows x64
npm run dist:arm64    # Windows na ARM
```

Wynik: `dist\ParentalControl Setup <wersja>.exe`.

### Struktura

```
main.js                      start aplikacji: jedna instancja, rejestracja IPC, okno
preload.js                   most contextBridge – wystawia tylko load / save / usage
src/                         proces główny (Node.js)
  constants.js               ścieżki, nazwa zadania, SID-y grup, nazwy dni
  errors.js                  PanelError – błąd z komunikatem dla rodzica
  system.js                  uruchamianie poleceń (execFile, PowerShell)
  accounts.js                lista kont, administratorzy, sprawdzenie uprawnień
  validation.js              walidacja nazwy konta i ustawień dni
  config.js                  odczyt i zapis config.json, ustawienia domyślne
  counter.js                 licznik minut na dziś
  logon-hours.js             godziny logowania (net user /times)
  setup.js                   folder, uprawnienia, limit.ps1, zaplanowane zadanie
  panel.js                   logika akcji load / save / usage
  ipc.js                     zabezpieczone kanały IPC
  window.js                  okno i jego zabezpieczenia
renderer/                    interfejs (HTML + CSS + JS, bez frameworków)
  app.js                     start interfejsu
  modules/
    constants.js, state.js, dom.js   stałe, stan, elementy strony
    feedback.js              komunikat w stopce i baner
    format.js                formatowanie czasu i liczb
    days-table.js            tabela dni
    user-picker.js           lista wyboru konta
    users.js                 filtrowanie kont (bez administratorów)
    form.js                  odczyt i walidacja formularza
    status.js                status dnia i licznik
    modal.js                 okno potwierdzenia
    actions.js               zapis, zamykanie, oznaczanie zmian
resources/limit.ps1          szablon skryptu kopiowanego do C:\ProgramData\LimitCzasu (UTF-8 z BOM, CRLF)
build/icon.svg       ikona aplikacji – „calendar-time” z Tabler Icons (licencja MIT, https://tabler.io/icons)
build/icon.ico       ta sama ikona w rozmiarach 16–256 px (używana przez instalator i plik .exe)
```

Nazwy systemowe (`C:\ProgramData\LimitCzasu`, `config.json`, `limit.ps1`, `<konto>-RRRR-MM-DD.txt`,
zadanie `LimitCzasu`) są celowo zachowane ze starej, ręcznej instalacji – nie zmieniaj ich.

### Testy

Testy zapisujące ustawienia wykonuj na **koncie testowym** (np. `TestDziecko`), nie na prawdziwym koncie dziecka:

```powershell
net user TestDziecko Haslo123! /add
# ... testy ...
net user TestDziecko /delete
```

Po testach ustaw w panelu z powrotem właściwe konto dziecka i kliknij „Zapisz i zastosuj”.
