import {Client, SSLMode} from 'ts-postgres';

async function populateDb() {
  const client: Client = new Client({
    database: 'iv1201recruitdb',
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5432,
    ssl: SSLMode.Disable,
  });
  await client.connect();

  try {
    for (let i = 0; i < 3000; i++) {
      const personId = getRandomIntInclusive(11, 1010);
      const lastAvailability =
        (await findLastAvailability(client, personId)) ??
        new Date(
          getRandomIntInclusive(2018, 2021),
          getRandomIntInclusive(3, 8),
          getRandomIntInclusive(1, 30)
        );
      if (lastAvailability.getMonth() >= 8) {
        lastAvailability.setMonth(3);
        lastAvailability.setFullYear(lastAvailability.getFullYear() + 1);
      }
      if (lastAvailability.getFullYear() == 2022) {
        continue;
      }
      const nextAvailabilityStart = new Date(lastAvailability);
      nextAvailabilityStart.setMonth(nextAvailabilityStart.getMonth() + 1);
      const nextAvailabilityEnd = new Date(nextAvailabilityStart);
      nextAvailabilityEnd.setMonth(nextAvailabilityEnd.getMonth() + 1);
      client.query(
        `INSERT into availability(person_id, from_date, to_date) VALUES (${personId}, '${nextAvailabilityStart
          .toISOString()
          .slice(0, 10)}', '${nextAvailabilityEnd
          .toISOString()
          .slice(0, 10)}');`
      );
    }

    for (let personId = 11; personId < 1010; personId++) {
      const noOfComps = getRandomIntInclusive(0, 3);
      let compId = getRandomIntInclusive(1, 3);
      if (noOfComps > 0) {
        addCompetence(client, personId, compId);
      }
      compId = nextCompetence(compId);
      if (noOfComps > 1) {
        addCompetence(client, personId, compId);
      }
      compId = nextCompetence(compId);
      if (noOfComps > 2) {
        addCompetence(client, personId, compId);
      }
    }
  } finally {
    await client.end();
  }
}

function nextCompetence(currentCompetence: number): number {
  currentCompetence++;
  if (currentCompetence == 4) {
    currentCompetence = 1;
  }
  return currentCompetence;
}

function addCompetence(
  client: Client,
  personId: number,
  competence: number
): void {
  client.query(
    `INSERT into competence_profile(person_id, competence_id, years_of_experience) VALUES (${personId}, ${competence}, 
      ${getRandomIntInclusive(0, 3) + getRandomIntInclusive(1, 9) / 10});`
  );
}

function getRandomIntInclusive(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function findLastAvailability(
  client: Client,
  personId: number
): Promise<Date | undefined> {
  const result = client.query(
    'SELECT to_date FROM availability WHERE person_id = ' + personId
  );
  let lastAvailability: Date | undefined;
  for (const row of await result) {
    const fromDate: Date = row.get('to_date') as Date;
    if (lastAvailability === undefined) {
      lastAvailability = fromDate;
    } else if (fromDate !== undefined && fromDate > lastAvailability) {
      lastAvailability = fromDate;
    }
  }
  return lastAvailability;
}

populateDb();
