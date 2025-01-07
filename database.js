import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, './public/database/meetings.db');

// Function to set up the database
export const setupDatabase = async () => {
    try {
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        await db.exec(`
            DROP TABLE IF EXISTS meetings
        `);


        await db.exec(`
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT,
                mandatory BOOLEAN,
                dateTime TEXT,
                location TEXT,
                parking TEXT
            )
        `);

        await db.run(`
            INSERT INTO meetings (topic, mandatory, dateTime, location, parking)
    VALUES
            ('CIT Monthly Meeting', 1, 'September 19th 2024, 2pm-3pm', 'Knoy Hall West Lafayette', 'Park in the West Street Garage, 3rd floor. Venue opposite front entrance.'),
            ('Research In Higher Level Ed', 0, 'September 24th 2024, 1pm-5pm', 'Beresford Building, Room 2, West Lafayette', 'Park in the surface lot 300. Venue beside lot.'),
            ('Curriculum Planning', 1, 'October 19th 2024, 4pm-6pm', 'IO240, Indianapolis', 'Park in the North Street Garage, Michigan St. Venue opposite side of street, 300km North.');
        `);

        console.log('Database setup complete.');
    } catch (error) {
        console.error('Error setting up the database:', error);
    }
};

// Function to get a database connection
export const getDbConnection = async () => {
    try {
        return await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};