@echo off
set DATABASE_URL=mysql://root:password@localhost:3306/digitalmeng
npx prisma generate
