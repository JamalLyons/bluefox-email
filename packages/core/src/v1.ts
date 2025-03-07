import { V1 } from "@bluefox-email/types/bluefox";

export class BluefoxClient extends V1.BaseBluefoxClient {
  constructor(config: V1.Config) {
    super(config, new BluefoxSubscriber(config));
  }
}

class BluefoxSubscriber extends V1.BluefoxSubscriber {
  constructor(config: V1.Config) {
    super(config);
    this.config = config;
    if (!this.config.BLUEFOX_API_KEY) {
      throw new Error("BLUEFOX_API_KEY is required");
    }
  }

  add() {}
  remove() {}
  pause() {}
  activate() {}
}
