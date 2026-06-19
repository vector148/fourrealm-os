const fs = require('fs');

let content = fs.readFileSync('c:/Users/nhatm/OneDrive/Documents/Enjoyment/FourRealm OS v3/README.md', 'utf8');

// Update database files
content = content.replace(
`The \`database/\` folder has 4 Excel files — all start empty (headers only). You fill them.

| File | Purpose |
| --- | --- |
| \`games.xlsx\` | Your game library |
| \`films.xlsx\` | Your film library |
| \`wishlist_games.xlsx\` | Games you want |
| \`wishlist_films.xlsx\` | Films you want |`,
`The \`database/\` folder has 7 Excel files — all start empty (headers only). You fill them.

| File | Purpose |
| --- | --- |
| \`games.xlsx\` | Your game library |
| \`films.xlsx\` | Your film library |
| \`series.xlsx\` | Your series library |
| \`music.xlsx\` | Your music library |
| \`upcoming_games.xlsx\` | Games you want |
| \`upcoming_films.xlsx\` | Films you want |
| \`upcoming_series.xlsx\` | Series you want |`
);

// Update Project Structure
content = content.replace(
`├── database/              ← Edit these files to add your data
│   ├── games.xlsx
│   ├── films.xlsx
│   ├── wishlist_games.xlsx
│   └── wishlist_films.xlsx`,
`├── database/              ← Edit these files to add your data
│   ├── games.xlsx
│   ├── films.xlsx
│   ├── series.xlsx
│   ├── music.xlsx
│   ├── upcoming_games.xlsx
│   ├── upcoming_films.xlsx
│   └── upcoming_series.xlsx`
);

// We should also replace the API reference to include series, music, upcoming
// Actually, it's easier to just use string replacement on a larger block.

fs.writeFileSync('c:/Users/nhatm/OneDrive/Documents/Enjoyment/FourRealm OS v3/README.md', content);
console.log("README updated!");
