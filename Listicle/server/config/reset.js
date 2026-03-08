import pool from './database.js';
import './dotenv.js';
import events from '../../data/events.js';

async function createDatabase() {
    // Drop the events table if it exists; Create a new table called events if it doesn't exist
    const createTableQuery = `
        DROP TABLE IF EXISTS events;

        CREATE TABLE IF NOT EXISTS events (
            id VARCHAR(50) PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            date VARCHAR(50) NOT NULL,
            image TEXT NOT NULL,
            text TEXT NOT NULL
        )
    `;
    try {
        await pool.query(createTableQuery);
        console.log('✓ Database table created successfully.');
    } catch (err) {
        console.error('Error creating database:', err);
    }
}

async function seedDatabase() {
    try {
        await createDatabase();

        console.log('Seeding database...');
        for (const event of events) {
            const insertQuery = `
                INSERT INTO events (id, title, location, date, image, text)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const values = [event.id, event.title, event.location, event.date, event.image, event.text];
            await pool.query(insertQuery, values);
            console.log(`✓ Inserted event: ${event.title}`);
        }
        console.log('\n✓ Database reset and seeded successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

seedDatabase();