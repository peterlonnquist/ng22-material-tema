import { NyttArende } from '../skapa/skapa.model';

/** Ett sparat ärende: det som fylldes i plus id och tidpunkt från "servern". */
export interface Arende extends NyttArende {
  id: string;
  skapad: Date;
}
