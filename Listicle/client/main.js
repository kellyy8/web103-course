import express from 'express';
import '../server/config/dotenv.js';
import pool from '../server/config/database.js';

const app = express();
const PORT = 3000;

const layout = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css">
</head>
<body>
    <header class="container">
        <nav>
            <ul><strong>Music Lovers</strong></ul>
        </nav>
    </header>
    <main class="container">
        ${content}
    </main>
</body>
</html>`;

// Home Page
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM music_discovery_zhsg ORDER BY date');
        const events = result.rows;
        
        let listHtml = `<h1>Upcoming Events</h1><div class="grid">`;
        
        events.forEach(event => {
            listHtml += `<article>
                            <header><strong>${event.title}</strong></header>
                            <img src="${event.image}" alt="${event.title}">
                            <p>Location: ${event.location}</p>
                            <footer><a href="/events/${event.id}" role="button">View Details</a></footer>
                        </article>`;
        });

        listHtml += `</div>`;
        res.send(layout("Music Events", listHtml));
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send(layout("Error", "<h1>Failed to load events</h1><a href='/'>Try Again</a>"));
    }
});

// View Details Page
app.get('/events/:eventId', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM music_discovery_zhsg WHERE id = $1', [req.params.eventId]);
        
        if (result.rows.length === 0) {
            return res.status(404).send(layout("404", "<h1>Event Not Found</h1><a href='/'>Back to Home</a>"));
        }
        
        const event = result.rows[0];

        const detailHtml = `<article>
                                <hgroup>
                                    <h1>${event.title}</h1>
                                    <h2>${event.date}</h2>
                                </hgroup>
                                <img src="${event.image}" alt="${event.title}">
                                <p><strong>Location:</strong> ${event.location}</p>
                                <p><strong>Description:</strong> ${event.text}</p>
                                <a href="/" class="secondary">Back to Home</a>
                            </article>`;
        
        res.send(layout(event.title, detailHtml));
    } catch (err) {
        console.error('Error fetching event:', err);
        res.status(500).send(layout("Error", "<h1>Failed to load event</h1><a href='/'>Back to Home</a>"));
    }
});

// 404 Page
app.use((req, res) => {
    res.status(404).send(layout("404 - Not Found", `
        <article style="text-align: center">
            <h1>404</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/" role="button">Return to Home Page</a>
        </article>`));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});