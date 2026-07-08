# Sport Visa ⚽

ქართული ფეხბურთის სკაუტინგ-პლატფორმა — ფეხბურთელები ავსებენ პროფილს და ჭკვიანი
match-score ალგორითმი აკავშირებს მათ კლუბებთან, რომლებსაც ღია სინჯები აქვთ.
სამი როლი: **ფეხბურთელი**, **კლუბი**, **ადმინი**.

## ტექნოლოგიები

- **Next.js 16** (App Router) + **React 19**
- **Tailwind CSS v4** — dark/light თემა, სემანტიკური token-ები
- **PostgreSQL** + **Prisma 7** (`@prisma/adapter-pg`)
- Email + password ავტორიზაცია (bcrypt + JWT httpOnly cookie)
- ქართული UI (Noto Sans Georgian + JetBrains Mono)

## ლოკალური გაშვება

```bash
npm install
cp .env.example .env        # და შეავსე DATABASE_URL + AUTH_SECRET
npx prisma migrate deploy   # ცხრილების შექმნა
npm run db:seed             # სატესტო მონაცემები (არასავალდებულო)
npm run dev
```

გახსენი http://localhost:3000

### სატესტო ანგარიშები (seed-ის შემდეგ)

პაროლი ყველასთვის: `password123`

| როლი | ელ. ფოსტა |
|------|-----------|
| ადმინი | `admin@sportvisa.ge` |
| კლუბი | `dinamo@sportvisa.ge` (და სხვა კლუბები) |
| ფეხბურთელი | `player1@sportvisa.ge` … `player18@sportvisa.ge` |

## Railway-ზე deploy

1. **New Project → Deploy from GitHub repo** და აირჩიე ეს რეპო.
2. დაამატე **PostgreSQL** სერვისი (ან გამოიყენე არსებული).
3. სერვისის **Variables**-ში დაამატე:
   - `DATABASE_URL` — Postgres-ის connection string
   - `AUTH_SECRET` — გრძელი შემთხვევითი სტრიქონი
     (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
4. ცხრილების შესაქმნელად ერთხელ გაუშვი (Railway shell-ში ან deploy command-ად):
   ```bash
   npx prisma migrate deploy
   ```
5. **Build:** `npm run build` (Prisma client გენერაცია ავტომატურად ხდება `postinstall`-ით).
   **Start:** `npm run start`.

### ატვირთული მედია (uploads)

ფაილები ინახება `./uploads`-ში. Railway-ს ephemeral ფაილური სისტემა აქვს —
persistent Volume დაამონტაჟე და მიუთითე `UPLOAD_DIR` env-ით (მაგ. `/data/uploads`),
ან გადართე cloud storage-ზე (`lib/storage.ts`-ის ჩანაცვლებით).

## სტრუქტურა

```
app/                 # Next.js routes (player / club / admin)
  actions/           # server actions (auth, player, club, admin)
  api/               # upload + media serving route handlers
components/ui/        # design-system kit (theme, icons, primitives)
components/app/       # role shells (PlayerHeader, ClubShell, AdminShell)
lib/                 # prisma, auth, matching, recommendations, storage
prisma/              # schema, migrations, seed
```
