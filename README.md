# Orbit — Budget familiare

Un budget planner orientato alla domanda: **"Quanto posso spendere proprio adesso senza pentirmene domani?"**

## Cosa contiene

- UI mobile-first bianca/nera, glassmorphism e "bubble UI".
- Calendario con tre mesi di orizzonte e heatmap della spendibilità.
- Calcolo della spendibilità giornaliera sulla base di entrate e uscite future.
- Entrate multiple e spese multiple, modificabili dopo la prima registrazione.
- Ricorrenze mensili, settimanali, annuali o una tantum.
- Spostamento selezionabile delle entrate/uscite che cadono nel weekend al primo giorno lavorativo successivo.
- Margine di sicurezza configurabile.
- Login Supabase con sessione persistente.
- Database Supabase con RLS: ogni utente può leggere e modificare esclusivamente i propri dati.
- Fallback locale se Supabase non è configurato.

## Avvio rapido locale

Richiede Node.js 20+.

```bash
npm install
npm run dev
```

Senza configurazione Supabase l'app parte in modalità locale e usa `localStorage`.

## Persistenza cloud e login

1. Crea un progetto Supabase.
2. Apri **SQL Editor** e lancia `supabase/migrations/001_initial.sql`.
3. Copia `.env.example` in `.env`.
4. Inserisci URL e anon key del progetto.
5. Esegui `npm install` e `npm run build`.
6. Pubblica la cartella su Vercel, Netlify o Cloudflare Pages usando gli stessi environment variables.

### Perché i dati non dovrebbero più sparire

Il browser non è più la fonte primaria quando l'utente è autenticato:
- l'autenticazione è gestita da Supabase Auth;
- i movimenti sono persistiti nella tabella `transactions`;
- le preferenze sono persistite in `profiles`;
- le policy RLS legano ogni riga all'utente autenticato;
- il trigger crea automaticamente il profilo alla registrazione;
- la sessione viene mantenuta da Supabase;
- in assenza di cloud, il fallback locale evita di perdere il lavoro durante la fase di sviluppo.

## Modello di calcolo

Per ogni giorno Orbit parte dal saldo risultante dagli eventi già modellati e aggiunge/sottrae gli eventi futuri. La **spendibilità** è:

`max(0, saldo previsto - margine di sicurezza)`

Il calendario colora ogni giorno in base alla spendibilità, non al semplice saldo bancario.

## Note prima del lancio

Questa è una base applicativa completa e deployabile, ma per un prodotto finanziario reale conviene aggiungere:
- importazione automatica dei movimenti bancari tramite un provider PSD2/Open Banking;
- gestione di saldo iniziale e conti multipli;
- trasferimenti tra conti;
- categorie e budget variabili;
- simulazione "se spendo X oggi";
- condivisione familiare tramite household/inviti;
- backup/export CSV/JSON;
- conferma email e recupero password;
- test automatici dell'engine finanziario;
- audit log per modifiche importanti.
