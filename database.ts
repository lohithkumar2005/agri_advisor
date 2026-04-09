import Database from 'better-sqlite3';

const db = new Database('agriadvisor.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    password TEXT NOT NULL,
    fieldType TEXT NOT NULL,
    landArea TEXT NOT NULL,
    profilePic TEXT
  )
`);

export function createUser(user: any) {
  const stmt = db.prepare(`
    INSERT INTO users (name, email, phone, password, fieldType, landArea, profilePic)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const info = stmt.run(
    user.name,
    user.email,
    user.phone,
    user.password,
    user.fieldType,
    user.landArea,
    user.profilePic || null
  );
  
  return info.lastInsertRowid;
}

export function getUserByEmail(email: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

export function updateUser(email: string, updates: any) {
  const stmt = db.prepare(`
    UPDATE users 
    SET name = ?, phone = ?, fieldType = ?, landArea = ?, profilePic = COALESCE(?, profilePic)
    WHERE email = ?
  `);
  
  stmt.run(
    updates.name,
    updates.phone,
    updates.fieldType,
    updates.landArea,
    updates.profilePic || null,
    email
  );
}
