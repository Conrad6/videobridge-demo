import { AbstractSignaler } from "./abstract.signaler";

export class IndicatorSignaler extends AbstractSignaler {
  constructor() {
    super();
  }
  send(event: string, payload?: any): void {
    throw new Error("Method not implemented.");
  }

}
