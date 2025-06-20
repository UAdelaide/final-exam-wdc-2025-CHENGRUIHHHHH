require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const db = require('./models/db');
const apiRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

// Function to insert data from SQL file
const insertData = async () => {
    try {
        // Check if users exist
        const [users] = await db.query('SELECT COUNT(*) as count FROM Users');
        if (users[0].count > 0) {
            console.log('Data already exists. Skipping insertion.');
            return;
        }

        console.log('Inserting data...');
        const sql = `
            INSERT INTO Users (username, email, password_hash, role) VALUES
            ('alice123', 'alice@example.com', 'hashed123', 'owner'),
            ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
            ('carol123', 'carol@example.com', 'hashed789', 'owner'),
            ('davidowner', 'david@example.com', 'hashed_david', 'owner'),
            ('evewalker', 'eve@example.com', 'hashed_eve', 'walker');

            INSERT INTO Dogs (name, size, owner_id) VALUES
            ('Max', 'medium', (SELECT user_id FROM Users WHERE username = 'alice123')),
            ('Bella', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
            ('Buddy', 'large', (SELECT user_id FROM Users WHERE username = 'alice123')),
            ('Lucy', 'small', (SELECT user_id FROM Users WHERE username = 'carol123')),
            ('Rocky', 'medium', (SELECT user_id FROM Users WHERE username = 'davidowner'));

            INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
            ((SELECT dog_id FROM Dogs WHERE name = 'Max' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Bella' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Buddy' AND owner_id = (SELECT user_id FROM Users WHERE username = 'alice123')), '2025-06-11 10:00:00', 60, 'Central Square', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Lucy' AND owner_id = (SELECT user_id FROM Users WHERE username = 'carol123')), '2025-06-12 14:00:00', 20, 'City Trail', 'open'),
            ((SELECT dog_id FROM Dogs WHERE name = 'Rocky' AND owner_id = (SELECT user_id FROM Users WHERE username = 'davidowner')), '2025-06-13 18:00:00', 90, 'Mountain Path', 'completed');
        `;
        // Split statements and execute them
        const statements = sql.split(';').filter(s => s.trim().length > 0);
        for (const statement of statements) {
            await db.query(statement);
        }
        console.log('Data inserted successfully.');
    } catch (err) {
        console.error('Error inserting data:', err);
    }
};


// Insert data on startup
insertData();


module.exports = app; 