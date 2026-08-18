# Checklist deploy

- [ ] Creare progetto Supabase
- [ ] Eseguire `supabase/migrations/001_initial.sql`
- [ ] Impostare `VITE_SUPABASE_URL`
- [ ] Impostare `VITE_SUPABASE_ANON_KEY`
- [ ] `npm install`
- [ ] `npm run build`
- [ ] Pubblicare la build su Vercel / Netlify / Cloudflare Pages
- [ ] Configurare dominio
- [ ] Abilitare conferma email in Supabase Auth
- [ ] Testare registrazione
- [ ] Testare logout/login
- [ ] Creare un'entrata ricorrente
- [ ] Fare logout/login e verificare che l'entrata sia ancora presente
- [ ] Modificare l'entrata e verificare persistenza
- [ ] Eliminare un movimento e verificare persistenza
- [ ] Testare una data di sabato e domenica con shift attivo/disattivo
- [ ] Testare un account diverso e verificare che non veda i dati del primo
