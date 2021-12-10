import { Client, SSLMode } from 'ts-postgres';

async function populateDb() {
  const client : Client = new Client(
                          {"database": "iv1201recruitdb",
                           "user": "postgres",
                           "password": "postgres",
                           "host": "localhost",
                           "port": 5432,
                           "ssl": SSLMode.Disable});
  await client.connect();

  try {
      const result = client.query(
          "SELECT * from person");

      for (const row of await result) {
          console.log(row.get("name"));
      }
  } finally {
      await client.end();
  }
}

populateDb();
