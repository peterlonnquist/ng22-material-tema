// Svaren från JSONPlaceholder (https://jsonplaceholder.typicode.com), ett
// gratis test-API med påhittad data. Fältnamnen följer API:t, därav engelska.

/** En användare, GET /users. Bara de fält som används i appen. */
export interface Anvandare {
  id: number;
  name: string;
  email: string;
}

/** Ett inlägg, GET /posts. Titel och text är lorem ipsum. */
export interface Inlagg {
  id: number;
  userId: number;
  title: string;
  body: string;
}

/** Ett inlägg som det visas i appen: API:ts fält plus beräknade fält. */
export interface InlaggVy extends Inlagg {
  antalOrd: number;
}
