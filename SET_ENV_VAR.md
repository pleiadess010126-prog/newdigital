# Instructions to Set DATABASE_URL as System Environment Variable

## Step 1: Copy the DATABASE_URL value

From your `.env` file (shown below - run the command to see full value):
```
DATABASE_URL=postgresql://...
```

## Step 2: Set as User Environment Variable (PowerShell - ADMINISTRATOR)

Open PowerShell as Administrator and run:

```powershell
# Extract the DATABASE_URL from .env
$dbUrl = (Get-Content .env | Select-String '^DATABASE_URL=' | ForEach-Object { $_.ToString().Replace('DATABASE_URL=', '') }).Trim()

# Set it as a user environment variable
[System.Environment]::SetEnvironmentVariable('DATABASE_URL', $dbUrl, 'User')

Write-Output "✓ DATABASE_URL set as user environment variable"
Write-Output "✓ Please close and reopen your terminal for changes to take effect"
```

## Step 3: Verify (After Reopening Terminal)

```powershell
echo $env:DATABASE_URL
```

You should see your PostgreSQL connection string.

## Step 4: Run Prisma Generate

```powershell  
cd c:\Users\priya\.gemini\antigravity\DigitalMEng_repo
npm run db:generate
```

---

## Alternative: Quick One-liner (Run as Administrator)

```powershell
cd c:\Users\priya\.gemini\antigravity\DigitalMEng_repo
[System.Environment]::SetEnvironmentVariable('DATABASE_URL', (Get-Content .env | Select-String '^DATABASE_URL=' | ForEach-Object { $_.ToString().Replace('DATABASE_URL=', '') }).Trim(), 'User')
```

Then close and reopen your terminal.

---

## Note

This sets the environment variable at the **User level**, which means:
- ✅ Persists across terminal sessions
- ✅ Available to all applications run by your user account
- ✅ Doesn't affect other users on the system
- ⚠️ Requires terminal restart to take effect
